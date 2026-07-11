const express = require('express');
const { cloudinary, isConfigured } = require('../lib/cloudinary');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Allowed upload "kinds" and how Cloudinary should treat them.
const KINDS = {
  avatar: { folder: 'gamelog/avatars', resource_type: 'image' },
  image: { folder: 'gamelog/images', resource_type: 'image' },
  video: { folder: 'gamelog/videos', resource_type: 'video' },
  doc: { folder: 'gamelog/docs', resource_type: 'raw' },
};

// POST /api/uploads  (auth)
// Body: { image: "<data URI or remote URL>", kind?: "avatar"|"image"|"video"|"doc" }
// Returns: { url, publicId, width, height, format }
router.post('/', requireAuth, async (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ error: 'Media storage is not configured on the server' });
    }
    const { image, kind = 'image' } = req.body || {};
    if (!image) {
      return res.status(400).json({ error: 'No file provided' });
    }
    const cfg = KINDS[kind] || KINDS.image;

    const result = await cloudinary.uploader.upload(image, {
      folder: cfg.folder,
      resource_type: cfg.resource_type,
      // Keep uploads scoped to the uploading user for easy cleanup later.
      public_id: `${req.user.id}_${Date.now()}`,
      overwrite: true,
    });

    return res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    console.error('Upload error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
});

module.exports = router;
