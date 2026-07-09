const axios = require('axios');

// IGDB and Twitch share the same application/credentials. This obtains an
// app access token via the client-credentials flow and caches it until it
// nears expiry, so tokens never go stale (the old static token did).
let cachedToken = null;
let tokenExpiry = 0;

async function getTwitchToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
    params: {
      client_id: process.env.IGDB_CLIENT_ID,
      client_secret: process.env.IGDB_CLIENT_SECRET,
      grant_type: 'client_credentials',
    },
  });
  cachedToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
  return cachedToken;
}

module.exports = { getTwitchToken };
