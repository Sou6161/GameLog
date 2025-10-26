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
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET || '41ejqxud8u68z10yx9feq7w64upcwt';

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

// Trending games endpoint
app.get('/api/games/trending', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { limit = 10 } = req.query;

    const now = Math.floor(Date.now() / 1000);
    const oneYearAgo = now - (365 * 24 * 60 * 60); // 1 year in seconds

    const igdbQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where first_release_date > ${oneYearAgo} & first_release_date < ${now} & rating > 70 & cover != null;
      sort first_release_date desc;
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
    console.error('Error fetching trending games:', error);
    res.status(500).json({ error: 'Failed to fetch trending games' });
  }
});

// Popular games endpoint
app.get('/api/games/popular', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { limit = 10 } = req.query;

    const igdbQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where rating > 80 & cover != null;
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
    console.error('Error fetching popular games:', error);
    res.status(500).json({ error: 'Failed to fetch popular games' });
  }
});

// Top rated games endpoint
app.get('/api/games/top-rated', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { limit = 10 } = req.query;

    const igdbQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where rating > 85 & cover != null;
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
    console.error('Error fetching top rated games:', error);
    res.status(500).json({ error: 'Failed to fetch top rated games' });
  }
});

// Upcoming games endpoint
app.get('/api/games/upcoming', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { limit = 10 } = req.query;

    const now = Math.floor(Date.now() / 1000);
    const futureDate = now + (365 * 24 * 60 * 60); // 1 year from now

    const igdbQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where first_release_date > ${now} & first_release_date < ${futureDate} & cover != null;
      sort first_release_date asc;
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
    console.error('Error fetching upcoming games:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming games' });
  }
});

// Indie games endpoint
app.get('/api/games/indie', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { limit = 10 } = req.query;

    const igdbQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where category = 0 & cover != null;
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
    console.error('Error fetching indie games:', error);
    res.status(500).json({ error: 'Failed to fetch indie games' });
  }
});

// Games by genre endpoint
app.get('/api/games/genre/:genreId', async (req, res) => {
  try {
    const { genreId } = req.params;
    const token = await getAccessToken();
    const { limit = 10 } = req.query;

    const igdbQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where genres = ${genreId} & cover != null;
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
    console.error('Error fetching games by genre:', error);
    res.status(500).json({ error: 'Failed to fetch games by genre' });
  }
});

// Recently released games endpoint
app.get('/api/games/recent', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { limit = 10 } = req.query;

    const now = Math.floor(Date.now() / 1000);
    const sixMonthsAgo = now - (180 * 24 * 60 * 60); // 6 months in seconds

    const igdbQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where first_release_date > ${sixMonthsAgo} & first_release_date < ${now} & cover != null;
      sort first_release_date desc;
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
    console.error('Error fetching recently released games:', error);
    res.status(500).json({ error: 'Failed to fetch recently released games' });
  }
});

// Most anticipated games endpoint
app.get('/api/games/anticipated', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { limit = 10 } = req.query;

    const now = Math.floor(Date.now() / 1000);
    const futureDate = now + (365 * 24 * 60 * 60); // 1 year from now

    const igdbQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary, hypes;
      where first_release_date > ${now} & first_release_date < ${futureDate} & hypes > 0 & cover != null;
      sort hypes desc;
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
    console.error('Error fetching most anticipated games:', error);
    res.status(500).json({ error: 'Failed to fetch most anticipated games' });
  }
});

// Racing games endpoint
app.get('/api/games/racing', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { limit = 10 } = req.query;

    const igdbQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where genres = 9 & cover != null;
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
    console.error('Error fetching racing games:', error);
    res.status(500).json({ error: 'Failed to fetch racing games' });
  }
});

// Sports games endpoint
app.get('/api/games/sports', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { limit = 10 } = req.query;

    const igdbQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where genres = 14 & cover != null;
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
    console.error('Error fetching sports games:', error);
    res.status(500).json({ error: 'Failed to fetch sports games' });
  }
});

// Fighting games endpoint
app.get('/api/games/fighting', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { limit = 10 } = req.query;

    const igdbQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where genres = 4 & cover != null;
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
    console.error('Error fetching fighting games:', error);
    res.status(500).json({ error: 'Failed to fetch fighting games' });
  }
});

// Strategy games endpoint
app.get('/api/games/strategy', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { limit = 10 } = req.query;

    const igdbQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where genres = 15 & cover != null;
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
    console.error('Error fetching strategy games:', error);
    res.status(500).json({ error: 'Failed to fetch strategy games' });
  }
});

// Horror games endpoint
app.get('/api/games/horror', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { limit = 10 } = req.query;

    const igdbQuery = `
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary;
      where themes = 19 & cover != null;
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
    console.error('Error fetching horror games:', error);
    res.status(500).json({ error: 'Failed to fetch horror games' });
  }
});

// Game details endpoint (must be last to avoid conflicts with specific routes)
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