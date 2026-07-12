import express from 'express';
import { getAllOrders, createOrder, restoreStock, deleteOrder } from '../controllers/orderController.js';

const router = express.Router();

router.route('/').get(getAllOrders).post(createOrder);
router.route('/:id').delete(deleteOrder);

router.post('/restore-stock', restoreStock);

export default router;
