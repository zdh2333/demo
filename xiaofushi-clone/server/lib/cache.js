import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.resolve(__dirname, '../../data/cache');
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24h

export function getCached(key, ttl = DEFAULT_TTL) {
  const file = path.join(CACHE_DIR, `${key}.json`);
  if (!fs.existsSync(file)) return null;

  const stat = fs.statSync(file);
  if (Date.now() - stat.mtimeMs > ttl) return null;

  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return null;
  }
}

export function setCache(key, data) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(CACHE_DIR, `${key}.json`),
    JSON.stringify(data, null, 2),
  );
}

export function listCacheFiles() {
  if (!fs.existsSync(CACHE_DIR)) return [];
  return fs
    .readdirSync(CACHE_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const stat = fs.statSync(path.join(CACHE_DIR, f));
      return { file: f, size: stat.size, lastModified: stat.mtime };
    });
}
