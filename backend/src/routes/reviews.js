const express = require('express');
const { query } = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Map a DB row to the shape the client expects (with a `$id` field).
function serialize(row) {
  return {
    $id: row.id,
    userId: row.user_id,
    username: row.username,
    userAvatar: row.user_avatar || '',
    gameId: row.game_id,
    gameName: row.game_name,
    rating: row.rating,
    reviewText: row.review_text,
    playTime: row.play_time || '',
    difficulty: row.difficulty || '',
    platform: row.platform || '',
    tags: row.tags || '',
    isPublic: row.is_public,
    date: row.date,
    verified: row.verified,
  };
}

// GET /api/reviews?gameId=&userId=&isPublic=true&limit=20
router.get('/', async (req, res) => {
  try {
    const { gameId, userId, isPublic, limit } = req.query;
    const conditions = [];
    const params = [];

    if (gameId) {
      params.push(String(gameId));
      conditions.push(`game_id = $${params.length}`);
    }
    if (userId) {
      params.push(String(userId));
      conditions.push(`user_id = $${params.length}`);
    }
    if (isPublic === 'true' || isPublic === 'false') {
      params.push(isPublic === 'true');
      conditions.push(`is_public = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    let sql = `SELECT * FROM reviews ${where} ORDER BY date DESC`;
    const parsedLimit = parseInt(limit, 10);
    if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
      params.push(parsedLimit);
      sql += ` LIMIT $${params.length}`;
    }

    const { rows } = await query(sql, params);
    return res.json({ reviews: rows.map(serialize) });
  } catch (err) {
    console.error('List reviews error:', err);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET /api/reviews/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM reviews WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    return res.json({ review: serialize(rows[0]) });
  } catch (err) {
    console.error('Get review error:', err);
    return res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// POST /api/reviews  (auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    const tags = Array.isArray(b.tags) ? b.tags.join(',') : (b.tags || '');
    const { rows } = await query(
      `INSERT INTO reviews
        (user_id, username, user_avatar, game_id, game_name, rating, review_text,
         play_time, difficulty, platform, tags, is_public, date, verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        req.user.id,
        b.username || req.user.username || '',
        b.userAvatar || '',
        String(b.gameId),
        b.gameName || '',
        Number(b.rating) || 0,
        b.reviewText || '',
        b.playTime || '',
        b.difficulty || '',
        b.platform || '',
        tags,
        b.isPublic === undefined ? true : !!b.isPublic,
        b.date || new Date().toISOString(),
        !!b.verified,
      ]
    );
    return res.status(201).json({ review: serialize(rows[0]) });
  } catch (err) {
    console.error('Create review error:', err);
    return res.status(500).json({ error: 'Failed to create review' });
  }
});

// PATCH /api/reviews/:id  (auth required, must own)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const existing = await query('SELECT * FROM reviews WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    if (existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }

    const b = req.body || {};
    // Map client field names to columns; only update provided fields.
    const fieldMap = {
      username: 'username',
      userAvatar: 'user_avatar',
      gameName: 'game_name',
      rating: 'rating',
      reviewText: 'review_text',
      playTime: 'play_time',
      difficulty: 'difficulty',
      platform: 'platform',
      isPublic: 'is_public',
      date: 'date',
      verified: 'verified',
    };

    const sets = [];
    const params = [];
    for (const [key, column] of Object.entries(fieldMap)) {
      if (b[key] !== undefined) {
        params.push(b[key]);
        sets.push(`${column} = $${params.length}`);
      }
    }
    if (b.tags !== undefined) {
      params.push(Array.isArray(b.tags) ? b.tags.join(',') : b.tags);
      sets.push(`tags = $${params.length}`);
    }

    if (sets.length === 0) {
      return res.json({ review: serialize(existing.rows[0]) });
    }

    sets.push('updated_at = now()');
    params.push(req.params.id);
    const { rows } = await query(
      `UPDATE reviews SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return res.json({ review: serialize(rows[0]) });
  } catch (err) {
    console.error('Update review error:', err);
    return res.status(500).json({ error: 'Failed to update review' });
  }
});

// DELETE /api/reviews/:id  (auth required, must own)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const existing = await query('SELECT user_id FROM reviews WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    if (existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }
    await query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete review error:', err);
    return res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
