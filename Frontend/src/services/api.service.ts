const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const RETRY_BASE_DELAY_MS = 200;

async function request<T>(path: string, options?: RequestInit, retries = 3): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(`${API_BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json() as Promise<T>;
    } catch (err) {
      lastError = err as Error;
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, RETRY_BASE_DELAY_MS * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

export const apiService = {
  /** Get all products (served from cache when available) */
  getProducts: () =>
    request<{ success: boolean; products: unknown[]; meta: unknown }>('/products'),

  /** Get a single product by ID or handle */
  getProduct: (id: string) =>
    request<{ success: boolean; product: unknown }>(`/products/${id}`),

  /** Get cache status */
  getCacheStatus: () =>
    request<{ success: boolean; cache: unknown }>('/products/cache/status'),

  /** Force a cache refresh */
  refreshCache: () =>
    request<{ success: boolean; message: string; meta: unknown }>('/products/cache/refresh', {
      method: 'POST',
    }),
};
