import { Router } from 'express';
import { getProducts, getCacheStatus, forceRefresh } from '../controllers/products.controller.js';

const router = Router();

router.get('/', getProducts);
router.get('/cache/status', getCacheStatus);
router.post('/cache/refresh', forceRefresh);

export default router;
