import express from 'express';
import {
  getAllWholesaleOrders,
  createWholesaleOrder,
  updateWholesaleOrder
} from '../controllers/wholesaleOrderController.js';

const router = express.Router();

router.route('/').get(getAllWholesaleOrders).post(createWholesaleOrder);
router.route('/:id').put(updateWholesaleOrder);

export default router;