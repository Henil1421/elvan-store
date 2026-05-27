import express from 'express';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors.middleware.js';
import productsRouter from './routes/products.routes.js';
import productDetailsRouter from './routes/productDetails.routes.js';
import { subscribeToProductChanges, fetchAllProducts } from './services/supabase.service.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/products', productsRouter);
app.use('/api/products', productDetailsRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found', availableEndpoints: ['/health', '/api/products', '/api/products/:id', '/api/products/cache/status'] });
});

// Start server
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);

  // Warm up cache on startup
  fetchAllProducts()
    .then(result => {
      if (result.products.length === 0) {
        console.warn('[Cache] Warmed up with 0 products. Verify your Supabase credentials and that the products table has data.');
      } else {
        console.log(`[Cache] Warmed up with ${result.products.length} products`);
      }
    })
    .catch(err => console.warn('[Cache] Warm-up failed:', err.message));

  // Subscribe to real-time changes
  subscribeToProductChanges(() => {
    console.log('[Cache] Products cache invalidated via real-time subscription');
  });
});

export default app;
