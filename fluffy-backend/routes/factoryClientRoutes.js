import express from 'express';
import {
  getAllFactoryClients,
  createFactoryClient,
  getFactoryClientById,
  loginFactoryClient,
  recordPayment
} from '../controllers/factoryClientController.js';

const router = express.Router();

router.route('/').get(getAllFactoryClients).post(createFactoryClient);
router.post('/login', loginFactoryClient);
router.route('/:id').get(getFactoryClientById);
router.post('/:id/payment', recordPayment);

export default router;