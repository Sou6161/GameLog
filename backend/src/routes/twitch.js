const express = require('express');
const axios = require('axios');
const { getTwitchToken } = require('../lib/twitchToken');

const router = express.Router();
const CLIENT_ID = process.env.IGDB_CLIENT_ID;

async function helix(path, params) {
  const token = await getTwitchToken();
  const response = await axios.get(`https://api.twitch.tv/helix${path}`, {
    headers: { 'Client-ID': CLIENT_ID, Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
}

// Health check used by the client's testConnection().
router.get('/health', async (_req, res) => {
  try {
    await getTwitchToken();
    res.json({ ok: true });
  } catch (error) {
    console.warn('Twitch token error:', error.message);
    res.status(500).json({ ok: false });
  }
});

// Live streams for a game name. Resolves the Twitch game id first, trying a
// couple of name variations, then fetches its streams sorted by viewers.
router.get('/streams', async (req, res) => {
  try {
    const gameName = String(req.query.game || '').trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    if (!gameName) return res.json({ streams: [] });

    // 1) Exact name match.
    let games = await helix('/games', { name: gameName });
    // 2) Exact match without a trailing number (e.g. "Battlefield 6" -> "Battlefield").
    if (!games.data || games.data.length === 0) {
      const stripped = gameName.replace(/\s*\d+\s*$/, '').trim();
      if (stripped && stripped !== gameName) {
        games = await helix('/games', { name: stripped });
      }
    }
    // 3) Fuzzy category search (handles Twitch names that differ from IGDB,
    //    e.g. "Sekiro: Shadows Die Twice" -> "SEKIRO: SHADOWS DIE TWICE").
    if (!games.data || games.data.length === 0) {
      const search = await helix('/search/categories', { query: gameName, first: 1 });
      games = { data: search.data || [] };
    }
    if (!games.data || games.data.length === 0) {
      return res.json({ streams: [] });
    }

    const gameId = games.data[0].id;
    const streams = await helix('/streams', { game_id: gameId, first: limit });
    const sorted = (streams.data || []).sort((a, b) => b.viewer_count - a.viewer_count);
    res.json({ streams: sorted });
  } catch (error) {
    console.warn('Twitch streams error:', error.message);
    res.status(500).json({ error: 'Failed to fetch streams', streams: [] });
  }
});

// Streamer (user) info by ids: /api/twitch/users?ids=1,2,3
router.get('/users', async (req, res) => {
  try {
    const ids = String(req.query.ids || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 100);
    if (ids.length === 0) return res.json({ users: [] });

    const token = await getTwitchToken();
    const params = new URLSearchParams();
    ids.forEach((id) => params.append('id', id));
    const response = await axios.get(`https://api.twitch.tv/helix/users?${params.toString()}`, {
      headers: { 'Client-ID': CLIENT_ID, Authorization: `Bearer ${token}` },
    });
    res.json({ users: response.data.data || [] });
  } catch (error) {
    console.warn('Twitch users error:', error.message);
    res.json({ users: [] });
  }
});

module.exports = router;
