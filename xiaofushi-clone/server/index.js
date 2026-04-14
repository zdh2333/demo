import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { estatRouter } from './routes/estat.js';
import { cacheRouter } from './routes/cache.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/estat', estatRouter);
app.use('/api/cache', cacheRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API proxy server running on http://localhost:${PORT}`);
  if (!process.env.ESTAT_APP_ID) {
    console.warn('⚠ ESTAT_APP_ID not set — API calls to e-Stat will fail.');
    console.warn('  Set it via: export ESTAT_APP_ID=your_app_id');
  }
});
