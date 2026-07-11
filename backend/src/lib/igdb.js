const axios = require('axios');

// Shared IGDB access. Uses the Twitch client-credentials app token, cached until
// it expires. Used by the games proxy routes and by the Steam library matcher.
const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

let accessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }
  const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
    params: {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials',
    },
  });
  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
  return accessToken;
}

// POST an Apicalypse query to an IGDB endpoint (defaults to /games).
async function igdb(query, endpoint = 'games') {
  const token = await getAccessToken();
  const response = await axios.post(`https://api.igdb.com/v4/${endpoint}`, query, {
    headers: {
      Accept: 'application/json',
      'Client-ID': CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// IGDB returns protocol-relative thumb URLs; normalize to a usable cover image.
function withCover(game) {
  return {
    ...game,
    cover: game.cover
      ? { ...game.cover, url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` }
      : undefined,
  };
}

const BASE_FIELDS =
  'fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;';

// Escape a user/Steam-supplied string for safe use inside an Apicalypse literal.
function escapeQuery(value) {
  return String(value).replace(/["\\]/g, '');
}

module.exports = { igdb, withCover, BASE_FIELDS, escapeQuery };
