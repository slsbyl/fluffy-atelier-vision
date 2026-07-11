import express from 'express';
import { getAllOrders, createOrder, restoreStock } from '../controllers/orderController.js';

const router = express.Router();

router.route('/').get(getAllOrders).post(createOrder);

router.post('/restore-stock', restoreStock);

export default router;
