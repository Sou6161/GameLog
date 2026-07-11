const express = require('express');
const { query } = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { award, XP_RULES } = require('../lib/xp');

const router = express.Router();

function serialize(row) {
  return {
    id: row.game_id, // client keys library entries by IGDB game id
    rowId: row.id,
    title: row.game_name,
    coverUrl: row.game_cover || '',
    genre: row.genre || '',
    status: row.status,
    source: row.source,
    platform: row.platform || '',
    steamAppId: row.steam_appid || undefined,
    steamPlaytimeMinutes: row.steam_playtime_minutes ?? undefined,
    addedDate: row.added_at,
  };
}

// GET /api/library — the current user's library.
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM library_games WHERE user_id = $1 ORDER BY added_at DESC',
      [req.user.id]
    );
    return res.json({ games: rows.map(serialize) });
  } catch (err) {
    console.error('List library error:', err);
    return res.status(500).json({ error: 'Failed to fetch library' });
  }
});

// POST /api/library — add (or upsert) a game. Manual adds by default.
router.post('/', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.gameId || !b.title) {
      return res.status(400).json({ error: 'gameId and title are required' });
    }
    const { rows } = await query(
      `INSERT INTO library_games
         (user_id, game_id, game_name, game_cover, genre, status, source, platform)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (user_id, game_id) DO UPDATE SET
         game_name  = EXCLUDED.game_name,
         game_cover = EXCLUDED.game_cover,
         genre      = EXCLUDED.genre,
         updated_at = now()
       RETURNING *`,
      [
        req.user.id,
        String(b.gameId),
        b.title,
        b.coverUrl || '',
        b.genre || '',
        b.status || 'backlog',
        b.source || 'manual',
        b.platform || '',
      ]
    );
    // Keyed by game id, so re-adding the same game never farms XP.
    await award(req.user.id, 'game_added', String(b.gameId), XP_RULES.game_added);

    return res.status(201).json({ game: serialize(rows[0]) });
  } catch (err) {
    console.error('Add to library error:', err);
    return res.status(500).json({ error: 'Failed to add to library' });
  }
});

// PATCH /api/library/:gameId — update status/platform.
router.patch('/:gameId', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    const sets = [];
    const params = [];
    for (const [key, column] of [['status', 'status'], ['platform', 'platform'], ['genre', 'genre']]) {
      if (b[key] !== undefined) {
        params.push(b[key]);
        sets.push(`${column} = $${params.length}`);
      }
    }
    if (sets.length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }
    sets.push('updated_at = now()');
    params.push(req.user.id, String(req.params.gameId));
    const { rows } = await query(
      `UPDATE library_games SET ${sets.join(', ')}
       WHERE user_id = $${params.length - 1} AND game_id = $${params.length}
       RETURNING *`,
      params
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Game not in library' });
    }
    return res.json({ game: serialize(rows[0]) });
  } catch (err) {
    console.error('Update library error:', err);
    return res.status(500).json({ error: 'Failed to update library game' });
  }
});

// DELETE /api/library/:gameId
router.delete('/:gameId', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM library_games WHERE user_id = $1 AND game_id = $2', [
      req.user.id,
      String(req.params.gameId),
    ]);
    return res.json({ success: true });
  } catch (err) {
    console.error('Remove from library error:', err);
    return res.status(500).json({ error: 'Failed to remove from library' });
  }
});

module.exports = router;
