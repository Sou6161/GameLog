const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../db/pool');
const { signToken } = require('../lib/jwt');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    avatarUrl: row.avatar_url || '',
    createdAt: row.created_at,
  };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body || {};
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'email, password and username are required' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const { rows } = await query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [normalizedEmail, String(username).trim(), passwordHash]
    );

    const user = rows[0];
    const token = signToken({ sub: user.id, email: user.email, username: user.username });
    return res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Failed to register' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ sub: user.id, email: user.email, username: user.username });
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to log in' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

// POST /api/auth/logout — stateless JWT, so this is a no-op the client can call.
router.post('/logout', (_req, res) => {
  return res.json({ success: true });
});

module.exports = router;
