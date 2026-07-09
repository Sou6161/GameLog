require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const gameRoutes = require('./routes/games');
const twitchRoutes = require('./routes/twitch');

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
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/twitch', twitchRoutes);

app.listen(PORT, () => {
  console.log(`GameLog backend running on port ${PORT}`);
});
