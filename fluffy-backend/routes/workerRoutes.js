import express from 'express';
import { getAllWorkers, createWorker, updateWorker, deleteWorker } from '../controllers/workerController.js';

const router = express.Router();

router.route('/')
  .get(getAllWorkers)
  .post(createWorker);

router.route('/:id')
  .put(updateWorker)
  .delete(deleteWorker);

export default router;