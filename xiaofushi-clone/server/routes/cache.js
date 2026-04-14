import { Router } from 'express';
import { listCacheFiles } from '../lib/cache.js';

export const cacheRouter = Router();

cacheRouter.get('/status', (_req, res) => {
  const files = listCacheFiles();
  res.json({ count: files.length, files });
});
