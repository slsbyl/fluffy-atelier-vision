import express from 'express';
import { getShippingRates, updateShippingRates } from '../controllers/shippingController.js';

const router = express.Router();

router.route('/')
  .get(getShippingRates)
  .put(updateShippingRates);

export default router;