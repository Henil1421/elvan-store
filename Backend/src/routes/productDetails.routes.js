import { Router } from 'express';
import { getProductById } from '../controllers/productDetails.controller.js';

const router = Router();

router.get('/:id', getProductById);

export default router;
