import * as supabaseService from '../services/supabase.service.js';

export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await supabaseService.getProductById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    console.error('[productDetails] getProductById error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
}
