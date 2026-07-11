const axios = require('axios');
const { igdb, escapeQuery } = require('./igdb');

const STEAM_OPENID = 'https://steamcommunity.com/openid/login';
const CLAIMED_ID_RE = /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/;

// --- OpenID 2.0 -----------------------------------------------------------

// Build the URL we send the user to. `identifier_select` means "let the user
// pick their identity" — Steam then tells us who they are in the callback.
function buildOpenIdUrl(returnTo, realm) {
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnTo,
    'openid.realm': realm,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });
  return `${STEAM_OPENID}?${params.toString()}`;
}

// Ask Steam to confirm the callback params really came from them (prevents a
// forged callback from linking an arbitrary SteamID). Returns SteamID64 or null.
async function verifyOpenId(queryParams) {
  const claimed = queryParams['openid.claimed_id'];
  if (!claimed) return null;

  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams)) {
    if (key.startsWith('openid.')) body.append(key, value);
  }
  body.set('openid.mode', 'check_authentication');

  const { data } = await axios.post(STEAM_OPENID, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 10000,
  });

  if (!/is_valid\s*:\s*true/i.test(String(data))) return null;

  const match = CLAIMED_ID_RE.exec(claimed);
  return match ? match[1] : null;
}

// --- Steam Web API --------------------------------------------------------

function apiKey() {
  const key = process.env.STEAM_API_KEY;
  if (!key) throw new Error('STEAM_API_KEY is not set');
  return key;
}

async function getOwnedGames(steamId) {
  const { data } = await axios.get(
    'https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/',
    {
      params: {
        key: apiKey(),
        steamid: steamId,
        include_appinfo: true,
        include_played_free_games: true,
        format: 'json',
      },
      timeout: 20000,
    }
  );
  return data?.response?.games || [];
}

async function getPlayerSummary(steamId) {
  try {
    const { data } = await axios.get(
      'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/',
      { params: { key: apiKey(), steamids: steamId }, timeout: 10000 }
    );
    return data?.response?.players?.[0] || null;
  } catch {
    return null;
  }
}

// --- IGDB matching --------------------------------------------------------

const EDITION_SUFFIXES = [
  'game of the year edition', 'goty edition', 'definitive edition', 'complete edition',
  'deluxe edition', 'ultimate edition', 'enhanced edition', 'special edition',
  'gold edition', 'premium edition', 'anniversary edition', 'remastered', 'remake',
  'directors cut', "director's cut", 'standard edition', 'legendary edition',
];

// Steam titles carry junk IGDB doesn't have: "Elden Ring™ - Deluxe Edition".
function cleanTitle(raw) {
  let name = String(raw || '')
    .replace(/[™®©]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Drop a trailing edition suffix, with or without a separating dash/colon.
  for (const suffix of EDITION_SUFFIXES) {
    const re = new RegExp(`[\\s:\\-–]*\\b${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b\\s*$`, 'i');
    name = name.replace(re, '').trim();
  }
  return name.replace(/[\s:\-–]+$/, '').trim();
}

const normalize = (s) =>
  String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// A Steam library is full of things that aren't games and will never match an
// IGDB entry: demos, betas, dedicated servers, SDKs, soundtracks, tools. Every
// one of them would otherwise cost a fuzzy IGDB search and then land in the
// user's "unmatched" list as noise. Drop them up front.
const NON_GAME_RE =
  /\b(demo|beta|playtest|public test|dedicated server|server|sdk|benchmark|soundtrack|ost|trailer|artbook|art book|wallpaper|editor|mod tool|toolkit|authoring tools|movie|videos?)\b/i;
const NON_GAME_EXACT = new Set(['source filmmaker', 'steamvr', 'steam controller']);

function isProbablyNotAGame(name) {
  const n = String(name || '').trim();
  if (!n) return true;
  if (NON_GAME_EXACT.has(n.toLowerCase())) return true;
  return NON_GAME_RE.test(n);
}

const IGDB_FIELDS = 'fields name, cover.url, first_release_date, genres.name;';

function coverUrl(game) {
  return game?.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : '';
}

function toMatch(game) {
  return {
    igdbId: game.id,
    name: game.name,
    coverUrl: coverUrl(game),
    genre: game.genres?.[0]?.name || '',
  };
}

// Match Steam titles to IGDB entries.
//
// A per-game `search` for a 500-game library would be ~500 sequential IGDB
// calls. Instead we do a batched exact-name pass first (a handful of calls that
// resolve the large majority), then fall back to fuzzy `search` only for the
// leftovers, with bounded concurrency.
async function matchGamesToIgdb(steamGames, onProgress) {
  // Skip non-games entirely — they can't match, and searching for each one is
  // the single biggest cost in a sync.
  const skipped = steamGames.filter((g) => isProbablyNotAGame(g.name));
  const candidates = steamGames.filter((g) => !isProbablyNotAGame(g.name));

  const cleaned = candidates.map((g) => ({ steam: g, title: cleanTitle(g.name) }));
  const results = new Map(); // steam appid -> igdb match
  let done = 0;

  // Index IGDB results by normalized name, preferring the earliest release when
  // IGDB holds duplicates of the same title.
  const indexByName = (games) => {
    const byName = new Map();
    for (const g of games) {
      const key = normalize(g.name);
      const existing = byName.get(key);
      if (!existing || (g.first_release_date || Infinity) < (existing.first_release_date || Infinity)) {
        byName.set(key, g);
      }
    }
    return byName;
  };

  // Run a batched name lookup over `pending` and record any hits.
  const batchPass = async (pending, buildWhere, chunkSize) => {
    for (let i = 0; i < pending.length; i += chunkSize) {
      const chunk = pending.slice(i, i + chunkSize);
      const names = [...new Set(chunk.map((c) => escapeQuery(c.title)).filter(Boolean))];
      if (names.length === 0) continue;
      try {
        const games = await igdb(`${IGDB_FIELDS} where ${buildWhere(names)}; limit 500;`);
        const byName = indexByName(games);
        for (const c of chunk) {
          const hit = byName.get(normalize(c.title));
          if (hit) results.set(c.steam.appid, toMatch(hit));
        }
      } catch (err) {
        console.error('IGDB batch match failed:', err.message);
      }
      done += chunk.length;
      onProgress?.(done, cleaned.length);
    }
  };

  const stillMissing = () => cleaned.filter((c) => !results.has(c.steam.appid));

  // Pass 1 — exact list match. Cheap (~0.8s per chunk) but CASE-SENSITIVE, so it
  // only catches titles whose casing already matches IGDB. Resolves the bulk.
  await batchPass(cleaned, (names) => `name = (${names.map((n) => `"${n}"`).join(',')})`, 60);

  // Pass 2 — case-insensitive match for what pass 1 missed (Steam loves ALL CAPS,
  // e.g. "ELDEN RING"). `~` is case-insensitive but takes no list, so we OR the
  // terms. That costs ~3s per query, which is why it only runs on the leftovers.
  await batchPass(stillMissing(), (names) => `(${names.map((n) => `name ~ "${n}"`).join(' | ')})`, 40);

  // Pass 3: fuzzy search for whatever both batch passes missed.
  const leftovers = stillMissing();
  const CONCURRENCY = 4;
  for (let i = 0; i < leftovers.length; i += CONCURRENCY) {
    const batch = leftovers.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (c) => {
        if (!c.title) return;
        try {
          const games = await igdb(
            `${IGDB_FIELDS} search "${escapeQuery(c.title)}"; where version_parent = null; limit 5;`
          );
          if (!games.length) return;
          // Accept only a confident hit: normalized names must match, or the
          // IGDB name must be a prefix of the Steam title (handles subtitles).
          const target = normalize(c.title);
          const hit =
            games.find((g) => normalize(g.name) === target) ||
            games.find((g) => target.startsWith(normalize(g.name)) && normalize(g.name).length >= 4);
          if (hit) results.set(c.steam.appid, toMatch(hit));
        } catch (err) {
          console.error('IGDB fuzzy match failed:', err.message);
        }
      })
    );
  }

  const matched = [];
  const unmatched = [];
  for (const c of cleaned) {
    const hit = results.get(c.steam.appid);
    if (hit) matched.push({ steam: c.steam, igdb: hit });
    else unmatched.push(c.steam);
  }
  // `skipped` are non-games (demos/tools/soundtracks). They're reported apart
  // from `unmatched` so the user's review list stays meaningful.
  return { matched, unmatched, skipped };
}

module.exports = {
  buildOpenIdUrl,
  verifyOpenId,
  getOwnedGames,
  getPlayerSummary,
  cleanTitle,
  matchGamesToIgdb,
};
