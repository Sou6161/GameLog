const express = require('express');
const { query } = require('../db/pool');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { award, XP_RULES } = require('../lib/xp');

const router = express.Router();

// Reviews are read with the reviewer's CURRENT username/avatar (from the users
// table) plus the "helpful" vote count and whether the requester voted.
const SELECT_WITH_META = `
  SELECT
    r.*,
    u.avatar_url AS current_avatar,
    u.username   AS current_username,
    COALESCE(vc.cnt, 0) AS helpful_count,
    (mv.user_id IS NOT NULL) AS helpful_by_me
  FROM reviews r
  LEFT JOIN users u ON u.id = r.user_id
  LEFT JOIN (SELECT review_id, COUNT(*)::int AS cnt FROM review_votes GROUP BY review_id) vc ON vc.review_id = r.id
  LEFT JOIN review_votes mv ON mv.review_id = r.id AND mv.user_id = $1
`;

// Map a DB row to the shape the client expects (with a `$id` field).
function serialize(row) {
  return {
    $id: row.id,
    userId: row.user_id,
    username: row.current_username || row.username,
    userAvatar: row.current_avatar || row.user_avatar || '',
    gameId: row.game_id,
    gameName: row.game_name,
    gameCover: row.game_cover || '',
    status: row.status || 'completed',
    rating: row.rating,
    reviewText: row.review_text,
    playTime: row.play_time || '',
    difficulty: row.difficulty || '',
    platform: row.platform || '',
    tags: row.tags || '',
    isPublic: row.is_public,
    date: row.date,
    verified: row.verified,
    helpful: row.helpful_count ?? 0,
    helpfulByMe: row.helpful_by_me ?? false,
  };
}

// GET /api/reviews?gameId=&userId=&isPublic=true&limit=20&sort=date|rating
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { gameId, userId, isPublic, limit, sort } = req.query;
    // $1 is always the "me" id (or null) used by the helpful_by_me join.
    const params = [req.user?.id || null];
    const conditions = [];

    if (gameId) {
      params.push(String(gameId));
      conditions.push(`r.game_id = $${params.length}`);
    }
    if (userId) {
      params.push(String(userId));
      conditions.push(`r.user_id = $${params.length}`);
    }
    if (isPublic === 'true' || isPublic === 'false') {
      params.push(isPublic === 'true');
      conditions.push(`r.is_public = $${params.length}`);
    }

    // Privacy: hide reviews from authors who made their profile private or
    // turned off "show reviews" — except from the author themselves ($1 = me).
    conditions.push(
      `(r.user_id IS NOT DISTINCT FROM $1 OR (COALESCE(u.profile_private, false) = false AND COALESCE(u.show_reviews, true) = true))`
    );

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderBy = sort === 'rating'
      ? 'ORDER BY r.rating DESC, helpful_count DESC, r.date DESC'
      : sort === 'helpful'
      ? 'ORDER BY helpful_count DESC, r.date DESC'
      : 'ORDER BY r.date DESC';
    let sql = `${SELECT_WITH_META} ${where} ${orderBy}`;
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
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { rows } = await query(`${SELECT_WITH_META} WHERE r.id = $2`, [req.user?.id || null, req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    return res.json({ review: serialize(rows[0]) });
  } catch (err) {
    console.error('Get review error:', err);
    return res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// POST /api/reviews/:id/helpful  (auth) — toggle the current user's vote.
router.post('/:id/helpful', requireAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const exists = await query('SELECT id FROM reviews WHERE id = $1', [reviewId]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    const mine = await query('SELECT 1 FROM review_votes WHERE review_id = $1 AND user_id = $2', [reviewId, req.user.id]);
    let helpfulByMe;
    if (mine.rows.length > 0) {
      await query('DELETE FROM review_votes WHERE review_id = $1 AND user_id = $2', [reviewId, req.user.id]);
      helpfulByMe = false;
    } else {
      await query('INSERT INTO review_votes (review_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [reviewId, req.user.id]);
      helpfulByMe = true;
    }
    const cnt = await query('SELECT COUNT(*)::int AS cnt FROM review_votes WHERE review_id = $1', [reviewId]);
    return res.json({ helpful: cnt.rows[0].cnt, helpfulByMe });
  } catch (err) {
    console.error('Helpful vote error:', err);
    return res.status(500).json({ error: 'Failed to vote' });
  }
});

// POST /api/reviews  (auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    const tags = Array.isArray(b.tags) ? b.tags.join(',') : (b.tags || '');
    const { rows } = await query(
      `INSERT INTO reviews
        (user_id, username, user_avatar, game_id, game_name, game_cover, status, rating, review_text,
         play_time, difficulty, platform, tags, is_public, date, verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        req.user.id,
        b.username || req.user.username || '',
        b.userAvatar || '',
        String(b.gameId),
        b.gameName || '',
        b.gameCover || '',
        b.status || 'completed',
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
    // XP is keyed to the review id, so it's granted once and survives a later
    // delete — you don't lose points for tidying up your profile.
    await award(req.user.id, 'review', rows[0].id, XP_RULES.review);

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
      gameCover: 'game_cover',
      status: 'status',
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
