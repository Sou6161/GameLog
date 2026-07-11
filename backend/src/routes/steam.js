const express = require('express');
const jwt = require('jsonwebtoken');
const { query } = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const {
  buildOpenIdUrl,
  verifyOpenId,
  getOwnedGames,
  getPlayerSummary,
  matchGamesToIgdb,
} = require('../lib/steam');
const { awardMany, getXp, XP_RULES, playtimeXp } = require('../lib/xp');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';

// Don't let a user hammer Steam/IGDB. The client can still override this with
// `force` when the user explicitly asks to re-sync anyway.
const SYNC_COOLDOWN_MS = 10 * 60 * 1000;

// The URL Steam must redirect the WebView back to. Prefer an explicit public
// URL; otherwise derive it from the incoming request (works on a LAN in dev).
function baseUrl(req) {
  const configured = process.env.PUBLIC_BASE_URL;
  if (configured) return configured.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

// Minimal styled page shown inside the WebView; the app closes it on sight.
function resultPage(ok, message) {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Steam</title></head>
<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#0A0E13;color:#F2F6F8;font-family:-apple-system,Roboto,sans-serif;text-align:center">
<div><div style="font-size:44px;margin-bottom:12px">${ok ? '✅' : '⚠️'}</div>
<h2 style="margin:0 0 8px">${ok ? 'Steam Connected' : 'Connection Failed'}</h2>
<p style="color:#AEB9C4;margin:0">${message}</p></div></body></html>`;
}

// GET /api/steam/auth/start (auth) — returns the Steam login URL for the WebView.
// The user is identified on the way back by a short-lived signed `state` token,
// because Steam's redirect can't carry our Authorization header.
router.get('/auth/start', requireAuth, (req, res) => {
  try {
    const state = jwt.sign({ sub: req.user.id }, SECRET, { expiresIn: '10m' });
    const base = baseUrl(req);
    const returnTo = `${base}/api/steam/auth/callback?state=${encodeURIComponent(state)}`;
    return res.json({
      url: buildOpenIdUrl(returnTo, base),
      // The app watches for this path to know the flow finished.
      callbackPath: '/api/steam/auth/callback',
    });
  } catch (err) {
    console.error('Steam auth start error:', err);
    return res.status(500).json({ error: 'Failed to start Steam login' });
  }
});

// GET /api/steam/auth/callback — Steam redirects the WebView here.
router.get('/auth/callback', async (req, res) => {
  try {
    let userId;
    try {
      userId = jwt.verify(String(req.query.state || ''), SECRET).sub;
    } catch {
      return res.status(400).send(resultPage(false, 'Your login session expired. Please try again.'));
    }

    const steamId = await verifyOpenId(req.query);
    if (!steamId) {
      return res.status(400).send(resultPage(false, 'Steam could not verify your login.'));
    }

    // A Steam account may only be linked to one GameLog account.
    const taken = await query('SELECT id FROM users WHERE steam_id = $1 AND id <> $2', [steamId, userId]);
    if (taken.rows.length > 0) {
      return res.status(409).send(resultPage(false, 'This Steam account is already linked to another GameLog user.'));
    }

    const summary = await getPlayerSummary(steamId);
    await query(
      `UPDATE users
         SET steam_id = $1, steam_persona = $2, steam_avatar = $3,
             steam_connected_at = now(), updated_at = now()
       WHERE id = $4`,
      [steamId, summary?.personaname || null, summary?.avatarfull || null, userId]
    );

    return res.send(resultPage(true, 'You can return to GameLog and sync your library.'));
  } catch (err) {
    console.error('Steam auth callback error:', err);
    return res.status(500).send(resultPage(false, 'Something went wrong. Please try again.'));
  }
});

// GET /api/steam/status (auth)
router.get('/status', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT steam_id, steam_persona, steam_avatar, steam_connected_at, steam_last_synced_at
         FROM users WHERE id = $1`,
      [req.user.id]
    );
    const u = rows[0] || {};
    const counts = await query(
      `SELECT
         (SELECT COUNT(*)::int FROM library_games WHERE user_id = $1 AND source = 'steam') AS imported,
         (SELECT COUNT(*)::int FROM steam_unmatched_games WHERE user_id = $1) AS unmatched`,
      [req.user.id]
    );
    return res.json({
      connected: !!u.steam_id,
      steamId: u.steam_id || null,
      persona: u.steam_persona || null,
      avatar: u.steam_avatar || null,
      connectedAt: u.steam_connected_at || null,
      lastSyncedAt: u.steam_last_synced_at || null,
      importedCount: counts.rows[0].imported,
      unmatchedCount: counts.rows[0].unmatched,
    });
  } catch (err) {
    console.error('Steam status error:', err);
    return res.status(500).json({ error: 'Failed to fetch Steam status' });
  }
});

// POST /api/steam/sync (auth) — import the owned library.
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT steam_id, steam_last_synced_at FROM users WHERE id = $1',
      [req.user.id]
    );
    const steamId = rows[0]?.steam_id;
    if (!steamId) {
      return res.status(400).json({ error: 'Steam account not connected' });
    }

    // Rate limit: one sync per hour unless explicitly forced.
    const last = rows[0].steam_last_synced_at;
    if (last && !req.body?.force) {
      const elapsed = Date.now() - new Date(last).getTime();
      if (elapsed < SYNC_COOLDOWN_MS) {
        return res.status(429).json({
          error: 'Your library was synced recently. Try again later.',
          retryAfterMinutes: Math.ceil((SYNC_COOLDOWN_MS - elapsed) / 60000),
        });
      }
    }

    let owned;
    try {
      owned = await getOwnedGames(steamId);
    } catch (err) {
      if (err.message === 'STEAM_API_KEY is not set') {
        return res.status(500).json({ error: 'Steam is not configured on the server.' });
      }
      throw err;
    }

    // Steam returns an empty list for private profiles — that's the usual cause.
    if (owned.length === 0) {
      return res.status(400).json({
        error:
          'No games found. If your Steam profile is private, set "Game details" to Public in Steam Privacy Settings and try again.',
        code: 'PRIVATE_PROFILE',
      });
    }

    const { matched, unmatched, skipped } = await matchGamesToIgdb(owned);

    let imported = 0;
    let updated = 0;

    // Bulk-upsert in chunks. A row-at-a-time loop over a 300+ game library costs
    // hundreds of round trips and dominates the sync time.
    const ROWS_PER_INSERT = 200;
    // IGDB can map two Steam appids onto one game (e.g. a demo + the game), and
    // a single statement can't hit the same conflict target twice — so keep the
    // first occurrence of each game_id.
    const seen = new Set();
    const libraryRows = [];
    for (const { steam, igdb: game } of matched) {
      const gameId = String(game.igdbId);
      if (seen.has(gameId)) continue;
      seen.add(gameId);
      const minutes = steam.playtime_forever || 0;
      libraryRows.push([
        req.user.id,
        gameId,
        game.name,
        game.coverUrl,
        game.genre,
        // Seed status from playtime; the ON CONFLICT branch never overwrites it,
        // so a status the user set by hand survives re-syncs.
        minutes > 0 ? 'playing' : 'backlog',
        String(steam.appid),
        minutes,
      ]);
    }

    for (let i = 0; i < libraryRows.length; i += ROWS_PER_INSERT) {
      const chunk = libraryRows.slice(i, i + ROWS_PER_INSERT);
      const params = [];
      const values = chunk
        .map((row) => {
          const base = params.length;
          params.push(...row);
          return `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},'steam','Steam',$${base + 7},$${base + 8},now())`;
        })
        .join(',');

      const result = await query(
        `INSERT INTO library_games
           (user_id, game_id, game_name, game_cover, genre, status, source, platform,
            steam_appid, steam_playtime_minutes, steam_playtime_updated)
         VALUES ${values}
         ON CONFLICT (user_id, game_id) DO UPDATE SET
           steam_appid            = EXCLUDED.steam_appid,
           steam_playtime_minutes = EXCLUDED.steam_playtime_minutes,
           steam_playtime_updated = now(),
           game_cover             = COALESCE(NULLIF(library_games.game_cover, ''), EXCLUDED.game_cover),
           updated_at             = now()
         RETURNING (xmax = 0) AS inserted`,
        params
      );
      for (const r of result.rows) {
        if (r.inserted) imported += 1;
        else updated += 1;
      }
    }

    // Refresh the unmatched list for this user (also bulk, same reasoning).
    await query('DELETE FROM steam_unmatched_games WHERE user_id = $1', [req.user.id]);
    const unmatchedRows = [];
    const seenApps = new Set();
    for (const steam of unmatched) {
      const appid = String(steam.appid);
      if (seenApps.has(appid)) continue;
      seenApps.add(appid);
      unmatchedRows.push([req.user.id, appid, steam.name || 'Unknown', steam.playtime_forever || 0]);
    }
    for (let i = 0; i < unmatchedRows.length; i += ROWS_PER_INSERT) {
      const chunk = unmatchedRows.slice(i, i + ROWS_PER_INSERT);
      const params = [];
      const values = chunk
        .map((row) => {
          const base = params.length;
          params.push(...row);
          return `($${base + 1},$${base + 2},$${base + 3},$${base + 4})`;
        })
        .join(',');
      await query(
        `INSERT INTO steam_unmatched_games (user_id, steam_appid, name, playtime_minutes)
         VALUES ${values}
         ON CONFLICT (user_id, steam_appid) DO NOTHING`,
        params
      );
    }

    await query('UPDATE users SET steam_last_synced_at = now() WHERE id = $1', [req.user.id]);

    // XP for the imported library. Two awards per game:
    //  - game_added, keyed by IGDB id — shared with manual adds, so importing a
    //    game you'd already added by hand doesn't pay twice.
    //  - playtime, keyed by Steam appid — recognises hours you actually played.
    //    Because awards only ever move UP, re-syncing tops this up as you play
    //    more and never claws XP back.
    const xpBefore = await getXp(req.user.id);
    const xpAwards = [];
    for (const { steam, igdb: game } of matched) {
      xpAwards.push({ kind: 'game_added', ref: String(game.igdbId), amount: XP_RULES.game_added });
      const pt = playtimeXp(steam.playtime_forever);
      if (pt > 0) {
        xpAwards.push({ kind: 'playtime', ref: String(steam.appid), amount: pt });
      }
    }
    await awardMany(req.user.id, xpAwards);
    const xpAfter = await getXp(req.user.id);

    return res.json({
      total: owned.length,
      imported,
      updated,
      unmatched: unmatched.length,
      // Demos, servers, soundtracks and other non-games we deliberately ignored.
      skipped: skipped.length,
      xpGained: xpAfter.xp - xpBefore.xp,
      level: xpAfter.level,
      rank: xpAfter.rank,
    });
  } catch (err) {
    console.error('Steam sync error:', err);
    return res.status(500).json({ error: 'Failed to sync your Steam library' });
  }
});

// GET /api/steam/unmatched (auth)
router.get('/unmatched', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT steam_appid, name, playtime_minutes FROM steam_unmatched_games WHERE user_id = $1 ORDER BY playtime_minutes DESC',
      [req.user.id]
    );
    return res.json({
      games: rows.map((r) => ({
        steamAppId: r.steam_appid,
        name: r.name,
        playtimeMinutes: r.playtime_minutes,
      })),
    });
  } catch (err) {
    console.error('Steam unmatched error:', err);
    return res.status(500).json({ error: 'Failed to fetch unmatched games' });
  }
});

// POST /api/steam/disconnect (auth) — unlink, and drop imported games.
router.post('/disconnect', requireAuth, async (req, res) => {
  try {
    await query(`DELETE FROM library_games WHERE user_id = $1 AND source = 'steam'`, [req.user.id]);
    await query('DELETE FROM steam_unmatched_games WHERE user_id = $1', [req.user.id]);
    await query(
      `UPDATE users SET steam_id = NULL, steam_persona = NULL, steam_avatar = NULL,
         steam_connected_at = NULL, steam_last_synced_at = NULL, updated_at = now()
       WHERE id = $1`,
      [req.user.id]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('Steam disconnect error:', err);
    return res.status(500).json({ error: 'Failed to disconnect Steam' });
  }
});

module.exports = router;
