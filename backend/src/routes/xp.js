const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { XP_RULES, CLIENT_AWARDABLE, award, getXp } = require('../lib/xp');

const router = express.Router();

// GET /api/xp — current XP, level, rank and where the XP came from.
router.get('/', requireAuth, async (req, res) => {
  try {
    return res.json(await getXp(req.user.id));
  } catch (err) {
    console.error('Get XP error:', err);
    return res.status(500).json({ error: 'Failed to fetch XP' });
  }
});

// POST /api/xp/award { kind, ref } — for things the server can't observe itself
// (achievements and lists still live on the device). The client says WHAT
// happened; the server decides how much it's worth, so amounts can't be forged.
router.post('/award', requireAuth, async (req, res) => {
  try {
    const { kind, ref } = req.body || {};
    if (!CLIENT_AWARDABLE.has(kind)) {
      return res.status(400).json({ error: 'Unknown or non-awardable XP kind' });
    }
    if (!ref) {
      return res.status(400).json({ error: 'ref is required' });
    }
    await award(req.user.id, kind, ref, XP_RULES[kind]);
    return res.json(await getXp(req.user.id));
  } catch (err) {
    console.error('Award XP error:', err);
    return res.status(500).json({ error: 'Failed to award XP' });
  }
});

module.exports = router;
