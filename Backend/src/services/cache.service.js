import NodeCache from 'node-cache';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.resolve(__dirname, '../../data/cache');

// In-memory cache with TTL in seconds (default 5 minutes)
const TTL = parseInt(process.env.CACHE_TTL || '300', 10);
const memoryCache = new NodeCache({ stdTTL: TTL, checkperiod: 60 });

function filePath(key) {
  return path.join(CACHE_DIR, `${key}.json`);
}

export function get(key) {
  const value = memoryCache.get(key);
  if (value !== undefined) return value;

  // Fallback: file-based cache
  try {
    const fp = filePath(key);
    if (fs.existsSync(fp)) {
      const raw = fs.readFileSync(fp, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed.expiry > Date.now()) {
        memoryCache.set(key, parsed.data, Math.floor((parsed.expiry - Date.now()) / 1000));
        return parsed.data;
      }
      fs.unlinkSync(fp);
    }
  } catch (err) {
    console.warn('[cache] File read error for key', key, err);
  }
  return null;
}

export function set(key, data) {
  memoryCache.set(key, data);

  // Also persist to file as backup
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    const payload = { data, expiry: Date.now() + TTL * 1000 };
    fs.writeFileSync(filePath(key), JSON.stringify(payload));
  } catch (err) {
    console.warn('[cache] File write error for key', key, err);
  }
}

export function del(key) {
  memoryCache.del(key);
  try {
    const fp = filePath(key);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  } catch {
    // ignore
  }
}

export function flush() {
  memoryCache.flushAll();
  try {
    const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.json'));
    files.forEach(f => fs.unlinkSync(path.join(CACHE_DIR, f)));
  } catch {
    // ignore
  }
}

export function getStats() {
  const stats = memoryCache.getStats();
  return {
    keys: memoryCache.keys(),
    hits: stats.hits,
    misses: stats.misses,
    ttl: TTL,
  };
}
