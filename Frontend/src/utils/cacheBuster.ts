const CACHE_CLEARED_KEY = 'app_cache_cleared_at';
const ONE_HOUR_MS = 60 * 60 * 1000;

/** Clear all browser caches and reload the page once. */
export function clearCacheAndReload(): void {
  // Set the timestamp synchronously before reload to prevent re-entry on next mount
  localStorage.setItem(CACHE_CLEARED_KEY, String(Date.now()));
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  window.location.reload();
}

/**
 * On app mount, check if the cache is stale (> 1 hour since last clear).
 * If so, clear caches and reload once to ensure fresh data.
 */
export function checkAndBustStaleCache(): void {
  const lastCleared = parseInt(localStorage.getItem(CACHE_CLEARED_KEY) || '0', 10);
  if (Date.now() - lastCleared > ONE_HOUR_MS) {
    clearCacheAndReload();
  }
}
