const express = require('express');
const { query } = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { award, XP_RULES } = require('../lib/xp');

const router = express.Router();

// Replace a list's games with the given set (lists are edited wholesale by the
// client, so this is simpler and safer than diffing).
async function setListGames(listId, games) {
  await query('DELETE FROM game_list_items WHERE list_id = $1', [listId]);
  const items = (games || []).filter((g) => g && (g.id ?? g.gameId));
  if (items.length === 0) return;

  // De-dupe by game id — the same game can't be in a list twice.
  const seen = new Set();
  const rows = [];
  items.forEach((g) => {
    const gameId = String(g.id ?? g.gameId);
    if (seen.has(gameId)) return;
    seen.add(gameId);
    rows.push([listId, gameId, g.title || '', g.coverUrl || '', g.genre || '', rows.length]);
  });

  const params = [];
  const values = rows
    .map((r) => {
      const b = params.length;
      params.push(...r);
      return `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6})`;
    })
    .join(',');

  await query(
    `INSERT INTO game_list_items (list_id, game_id, title, cover_url, genre, position)
     VALUES ${values}
     ON CONFLICT (list_id, game_id) DO NOTHING`,
    params
  );
}

// Fetch lists (with their games) for a user.
async function getLists(userId) {
  const { rows: lists } = await query(
    'SELECT * FROM game_lists WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  if (lists.length === 0) return [];

  const { rows: items } = await query(
    `SELECT i.* FROM game_list_items i
       JOIN game_lists l ON l.id = i.list_id
      WHERE l.user_id = $1
      ORDER BY i.position ASC`,
    [userId]
  );

  const byList = new Map();
  for (const i of items) {
    if (!byList.has(i.list_id)) byList.set(i.list_id, []);
    byList.get(i.list_id).push({
      id: i.game_id,
      title: i.title,
      coverUrl: i.cover_url || '',
      genre: i.genre || '',
    });
  }

  return lists.map((l) => ({
    id: l.id,
    name: l.name,
    description: l.description || '',
    games: byList.get(l.id) || [],
    createdAt: l.created_at,
  }));
}

// GET /api/lists
router.get('/', requireAuth, async (req, res) => {
  try {
    return res.json({ lists: await getLists(req.user.id) });
  } catch (err) {
    console.error('List lists error:', err);
    return res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

// POST /api/lists
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, games } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'A list name is required' });
    }

    const { rows } = await query(
      `INSERT INTO game_lists (user_id, name, description)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, String(name).trim(), description || '']
    );
    const list = rows[0];
    await setListGames(list.id, games);

    // XP keyed by list id, so editing or re-saving never farms more.
    await award(req.user.id, 'list_created', list.id, XP_RULES.list_created);

    const all = await getLists(req.user.id);
    return res.status(201).json({ list: all.find((l) => l.id === list.id) });
  } catch (err) {
    console.error('Create list error:', err);
    return res.status(500).json({ error: 'Failed to create list' });
  }
});

// PATCH /api/lists/:id
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const existing = await query('SELECT * FROM game_lists WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.user.id,
    ]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    const { name, description, games } = req.body || {};
    await query(
      `UPDATE game_lists
          SET name = COALESCE($1, name),
              description = COALESCE($2, description),
              updated_at = now()
        WHERE id = $3`,
      [name ? String(name).trim() : null, description ?? null, req.params.id]
    );

    if (games !== undefined) {
      await setListGames(req.params.id, games);
    }

    const all = await getLists(req.user.id);
    return res.json({ list: all.find((l) => l.id === req.params.id) });
  } catch (err) {
    console.error('Update list error:', err);
    return res.status(500).json({ error: 'Failed to update list' });
  }
});

// DELETE /api/lists/:id  (items cascade)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM game_lists WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.user.id,
    ]);
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete list error:', err);
    return res.status(500).json({ error: 'Failed to delete list' });
  }
});

module.exports = router;
