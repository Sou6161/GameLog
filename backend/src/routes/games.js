const express = require('express');
const { igdb, withCover, BASE_FIELDS } = require('../lib/igdb');

const router = express.Router();

// Helper to build a simple "list" handler for a where/sort clause.
function listHandler(buildQuery) {
  return async (req, res) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const data = await igdb(buildQuery(limit, req));
      res.json(data.map(withCover));
    } catch (error) {
      console.error('IGDB request failed:', error.message);
      res.status(500).json({ error: 'Failed to fetch games' });
    }
  };
}

// Search
router.post('/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    const data = await igdb(`
      ${BASE_FIELDS}
      search "${query}";
      where cover != null;
      limit ${limit};
    `);
    res.json(data.map(withCover));
  } catch (error) {
    console.error('IGDB search failed:', error.message);
    res.status(500).json({ error: 'Failed to search games' });
  }
});

router.get('/featured', listHandler((limit) => `
  fields name, cover.url, first_release_date, rating, rating_count, total_rating, total_rating_count, platforms.name, genres.name, summary;
  where total_rating > 85 & total_rating_count > 80 & rating_count > 80 & cover != null;
  sort total_rating desc;
  limit ${limit};
`));

router.get('/trending', listHandler((limit) => {
  const now = Math.floor(Date.now() / 1000);
  const oneYearAgo = now - 365 * 24 * 60 * 60;
  return `
    ${BASE_FIELDS}
    where first_release_date > ${oneYearAgo} & first_release_date < ${now} & rating > 70 & cover != null;
    sort first_release_date desc;
    limit ${limit};
  `;
}));

router.get('/popular', listHandler((limit) => `
  fields name, cover.url, first_release_date, rating, rating_count, total_rating_count, platforms.name, genres.name, summary;
  where rating != null & rating > 70 & rating_count > 40 & cover != null;
  sort rating_count desc;
  limit ${limit};
`));

router.get('/top-rated', listHandler((limit) => `
  ${BASE_FIELDS}
  where rating > 85 & cover != null;
  sort rating desc;
  limit ${limit};
`));

router.get('/upcoming', listHandler((limit) => {
  const now = Math.floor(Date.now() / 1000);
  const futureDate = now + 365 * 24 * 60 * 60;
  return `
    ${BASE_FIELDS}
    where first_release_date > ${now} & first_release_date < ${futureDate} & cover != null;
    sort first_release_date asc;
    limit ${limit};
  `;
}));

router.get('/indie', listHandler((limit) => `
  ${BASE_FIELDS}
  where category = 0 & cover != null;
  sort rating desc;
  limit ${limit};
`));

router.get('/recent', listHandler((limit) => {
  const now = Math.floor(Date.now() / 1000);
  const sixMonthsAgo = now - 180 * 24 * 60 * 60;
  return `
    ${BASE_FIELDS}
    where first_release_date > ${sixMonthsAgo} & first_release_date < ${now} & cover != null;
    sort first_release_date desc;
    limit ${limit};
  `;
}));

router.get('/anticipated', listHandler((limit) => {
  const now = Math.floor(Date.now() / 1000);
  const futureDate = now + 365 * 24 * 60 * 60;
  return `
    fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name, summary, hypes;
    where first_release_date > ${now} & first_release_date < ${futureDate} & hypes > 0 & cover != null;
    sort hypes desc;
    limit ${limit};
  `;
}));

// Hidden Gems: highly-rated but under-the-radar (modest vote counts).
router.get('/gems', listHandler((limit) => `
  ${BASE_FIELDS}
  where rating > 85 & rating_count >= 20 & rating_count <= 200 & version_parent = null & cover != null;
  sort rating desc;
  limit ${limit};
`));

router.get('/racing', listHandler((limit) => `
  ${BASE_FIELDS} where genres = 9 & cover != null; sort rating desc; limit ${limit};
`));

router.get('/sports', listHandler((limit) => `
  ${BASE_FIELDS} where genres = 14 & cover != null; sort rating desc; limit ${limit};
`));

router.get('/fighting', listHandler((limit) => `
  ${BASE_FIELDS} where genres = 4 & cover != null; sort rating desc; limit ${limit};
`));

router.get('/strategy', listHandler((limit) => `
  ${BASE_FIELDS} where genres = 15 & cover != null; sort rating desc; limit ${limit};
`));

router.get('/horror', listHandler((limit) => `
  ${BASE_FIELDS} where themes = 19 & cover != null; sort rating desc; limit ${limit};
`));

router.get('/genre/:genreId', listHandler((limit, req) => `
  ${BASE_FIELDS}
  where genres = ${req.params.genreId} & cover != null;
  sort rating desc;
  limit ${limit};
`));

// Game details (keep last so it doesn't shadow the named routes above)
router.get('/:id', async (req, res) => {
  try {
    const data = await igdb(`
      fields name, cover.url, first_release_date, rating, rating_count, platforms.name, genres.name,
             summary, status, screenshots.url, videos.name, videos.video_id,
             involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
             game_modes.name, player_perspectives.name, themes.name, keywords.name, storyline,
             total_rating, total_rating_count, category, aggregated_rating, aggregated_rating_count,
             follows, hypes, release_dates.date, release_dates.platform.name, release_dates.region;
      where id = ${req.params.id};
    `);
    if (data.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    const game = data[0];
    res.json({
      ...withCover(game),
      screenshots: game.screenshots?.map((s) => ({
        ...s,
        url: `https:${s.url.replace('t_thumb', 't_screenshot_med')}`,
      })),
    });
  } catch (error) {
    console.error('IGDB details failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
});

module.exports = router;
