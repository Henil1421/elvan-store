import { supabase } from '../config/supabase.js';
import * as cache from './cache.service.js';

const PRODUCTS_CACHE_KEY = 'products_all';

/**
 * Fetch all products with images, options, and variants from Supabase.
 * Returns the mapped product array and stores it in cache.
 */
export async function fetchAllProducts() {
  if (!supabase) {
    console.warn('[Supabase] Client not initialised – skipping fetch. Check your .env configuration.');
    const payload = { products: [], fetchedAt: new Date().toISOString() };
    cache.set(PRODUCTS_CACHE_KEY, payload);
    return payload;
  }

  console.log('[Supabase] Fetching products, images, and options...');
  const [productsRes, imagesRes, optionsRes] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('product_images').select('*').order('position'),
    supabase.from('product_options').select('*'),
  ]);

  if (productsRes.error) {
    console.error('[Supabase] Error fetching products:', productsRes.error.message);
    throw new Error(productsRes.error.message);
  }
  if (imagesRes.error) console.warn('[Supabase] Warning: could not fetch product_images (products will have no images):', imagesRes.error.message);
  if (optionsRes.error) console.warn('[Supabase] Warning: could not fetch product_options (products will have no options):', optionsRes.error.message);

  const products = productsRes.data || [];
  const images = imagesRes.data || [];
  const options = optionsRes.data || [];
  console.log(`[Supabase] Fetched ${products.length} products, ${images.length} images, ${options.length} options.`);

  // Fetch variants in batches to avoid row limits
  const productIds = products.map(r => r.id);
  const allVariants = [];
  for (let b = 0; b < productIds.length; b += 50) {
    const batch = productIds.slice(b, b + 50);
    const { data: batchVariants, error: varErr } = await supabase
      .from('product_variants')
      .select('*')
      .in('product_id', batch);
    if (varErr) console.warn('[Supabase] Error fetching product_variants batch:', varErr.message);
    if (batchVariants) allVariants.push(...batchVariants);
  }
  console.log(`[Supabase] Fetched ${allVariants.length} variants total.`);

  const mapped = products.map(r => mapProduct(r, images, options, allVariants));

  const payload = {
    products: mapped,
    fetchedAt: new Date().toISOString(),
  };
  cache.set(PRODUCTS_CACHE_KEY, payload);
  return payload;
}

/**
 * Get all products, using cache when available.
 */
export async function getAllProducts() {
  const cached = cache.get(PRODUCTS_CACHE_KEY);
  if (cached) {
    return { ...cached, source: 'cache' };
  }
  const fresh = await fetchAllProducts();
  return { ...fresh, source: 'supabase' };
}

/**
 * Get a single product by ID.
 */
export async function getProductById(id) {
  const { products } = await getAllProducts();
  const product = products.find(p => p.id === id || p.handle === id);
  return product || null;
}

/**
 * Subscribe to real-time product changes and invalidate cache on change.
 */
export function subscribeToProductChanges(onChange) {
  if (process.env.ENABLE_REALTIME !== 'true') return;
  if (!supabase) {
    console.warn('[Supabase RT] Skipping real-time subscription – client not initialised.');
    return;
  }

  supabase
    .channel('products-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, payload => {
      console.log('[Supabase RT] products change detected, invalidating cache');
      cache.del(PRODUCTS_CACHE_KEY);
      if (onChange) onChange(payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'product_variants' }, () => {
      cache.del(PRODUCTS_CACHE_KEY);
      if (onChange) onChange();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'product_images' }, () => {
      cache.del(PRODUCTS_CACHE_KEY);
      if (onChange) onChange();
    })
    .subscribe();
}

function mapProduct(r, images, options, allVariants) {
  const prodVariants = allVariants.filter(v => v.product_id === r.id);
  const prodImages = images.filter(img => img.product_id === r.id);
  const prodOpts = options.filter(o => o.product_id === r.id);

  const mappedVariants = prodVariants.map(v => ({
    id: v.id,
    sku: v.sku || '',
    price: Number(v.price) || 0,
    compareAtPrice: String(v.compare_at_price || ''),
    barcode: v.barcode || '',
    weight: String(v.grams || ''),
    weightUnit: v.weight_unit || 'kg',
    option1Value: v.option1_value || '',
    option2Value: v.option2_value || '',
    option3Value: v.option3_value || '',
  }));

  const mappedImages = prodImages.map(img => img.src).join(', ');

  const mappedOptions = [];
  if (prodOpts.length > 0) {
    const opt = prodOpts[0];
    if (opt.option1_name) {
      const vals = [...new Set(prodVariants.map(v => v.option1_value).filter(Boolean))].join(', ');
      mappedOptions.push({ id: opt.id + '_1', name: opt.option1_name, values: vals });
    }
    if (opt.option2_name) {
      const vals = [...new Set(prodVariants.map(v => v.option2_value).filter(Boolean))].join(', ');
      mappedOptions.push({ id: opt.id + '_2', name: opt.option2_name, values: vals });
    }
    if (opt.option3_name) {
      const vals = [...new Set(prodVariants.map(v => v.option3_value).filter(Boolean))].join(', ');
      mappedOptions.push({ id: opt.id + '_3', name: opt.option3_name, values: vals });
    }
  }

  return {
    id: r.id,
    handle: r.handle || '',
    title: r.title || '',
    description: r.body_html || '',
    vendor: r.vendor || '',
    productType: r.product_type || '',
    tags: r.tags || '',
    status: r.status || 'active',
    publishedAt: r.published_at || null,
    createdAt: r.created_at || null,
    images: mappedImages,
    variants: mappedVariants,
    options: mappedOptions,
    collection: r.collection_name || r.product_category || r.collection_id || '',
  };
}
