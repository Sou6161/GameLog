const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:3000']
}));

app.use(express.json());

// IGDB credentials
const CLIENT_ID = process.env.IGDB_CLIENT_ID || 'tiht9z9xigubud8ca68xu0664b4wub';
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET || 'hvic6qb17hc00lgc8q0d0uowg9kkpa';

let accessToken = null;
let tokenExpiry = 0;

// Get access token
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials'
      }
    });

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// Search games endpoint
app.post('/api/games/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    const token = await getAccessToken();

    const igdbQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      search "${query}";
      where cover != null;
      limit ${limit};
    `;

    const response = await axios.post('https://api.igdb.com/v4/games', igdbQuery, {
      headers: {
        'Accept': 'application/json',
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    });

    // Process the data
    const games = response.data.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));

    res.json(games);
  } catch (error) {
    console.error('Error searching games:', error);
    res.status(500).json({ error: 'Failed to search games' });
  }
});

// Featured games endpoint
app.get('/api/games/featured', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { limit = 10 } = req.query;

    const igdbQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where rating > 75 & cover != null;
      sort rating desc;
      limit ${limit};
    `;

    const response = await axios.post('https://api.igdb.com/v4/games', igdbQuery, {
      headers: {
        'Accept': 'application/json',
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    });

    const games = response.data.map(game => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined
    }));

    res.json(games);
  } catch (error) {
    console.error('Error fetching featured games:', error);
    res.status(500).json({ error: 'Failed to fetch featured games' });
  }
});

// Game details endpoint
app.get('/api/games/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const token = await getAccessToken();

    const igdbQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, 
             summary, status, screenshots.url, videos.name, videos.video_id, 
             involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
             game_modes.name, player_perspectives.name, themes.name, keywords.name, storyline,
             total_rating, total_rating_count, category, aggregated_rating, aggregated_rating_count,
             follows, hypes, release_dates.date, release_dates.platform.name, release_dates.region;
      where id = ${id};
    `;

    const response = await axios.post('https://api.igdb.com/v4/games', igdbQuery, {
      headers: {
        'Accept': 'application/json',
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Process the data
    const game = response.data[0];
    const processedGame = {
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      } : undefined,
      screenshots: game.screenshots?.map(screenshot => ({
        ...screenshot,
        url: `https:${screenshot.url.replace('t_thumb', 't_screenshot_med')}`
      }))
    };

    res.json(processedGame);
  } catch (error) {
    console.error('Error fetching game details:', error);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});