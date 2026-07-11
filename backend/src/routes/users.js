const express = require('express');
const { query } = require('../db/pool');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// DELETE /api/users/me — permanently delete the current user. Their reviews and
// review_votes are removed automatically via ON DELETE CASCADE.
router.delete('/me', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.user.id]);
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
});

// GET /api/users/:id — public profile basics for a reviewer. Honors the user's
// "private profile" setting for everyone except the user viewing themselves.
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, username, avatar_url, profile_private, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const u = rows[0];
    const isSelf = req.user && req.user.id === u.id;
    const isPrivate = !!u.profile_private && !isSelf;
    return res.json({
      user: {
        id: u.id,
        username: u.username,
        avatarUrl: isPrivate ? '' : (u.avatar_url || ''),
        createdAt: isPrivate ? undefined : u.created_at,
        private: isPrivate,
      },
    });
  } catch (err) {
    console.error('Get public user error:', err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
