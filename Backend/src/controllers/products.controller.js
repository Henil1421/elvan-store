import * as supabaseService from '../services/supabase.service.js';
import * as cache from '../services/cache.service.js';

export async function getProducts(req, res) {
  try {
    const result = await supabaseService.getAllProducts();
    res.json({
      success: true,
      products: result.products,
      meta: {
        count: result.products.length,
        fetchedAt: result.fetchedAt,
        source: result.source,
      },
    });
  } catch (err) {
    console.error('[products] getProducts error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
}

export async function getCacheStatus(req, res) {
  try {
    const stats = cache.getStats();
    res.json({ success: true, cache: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function forceRefresh(req, res) {
  try {
    cache.flush();
    const result = await supabaseService.fetchAllProducts();
    res.json({
      success: true,
      message: 'Cache refreshed',
      meta: { count: result.products.length, fetchedAt: result.fetchedAt },
    });
  } catch (err) {
    console.error('[products] forceRefresh error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to refresh cache' });
  }
}
