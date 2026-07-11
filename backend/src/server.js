require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const gameRoutes = require('./routes/games');
const twitchRoutes = require('./routes/twitch');
const uploadRoutes = require('./routes/uploads');
const userRoutes = require('./routes/users');
const libraryRoutes = require('./routes/library');
const steamRoutes = require('./routes/steam');
const xpRoutes = require('./routes/xp');
const listRoutes = require('./routes/lists');

const app = express();
const PORT = process.env.PORT || 3001;

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:8081,http://localhost:3000,http://localhost:19006')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins,
  })
);
// Allow base64 image/media payloads.
app.use(express.json({ limit: '25mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/twitch', twitchRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/steam', steamRoutes);
app.use('/api/xp', xpRoutes);
app.use('/api/lists', listRoutes);

app.listen(PORT, () => {
  console.log(`GameLog backend running on port ${PORT}`);
});
