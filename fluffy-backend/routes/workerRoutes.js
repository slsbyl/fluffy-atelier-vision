const express = require('express');
const container = require('../container');

const workerController = container.resolve('WorkerController');
const router = express.Router();

router.route('/')
  .get(workerController.getAllWorkers)
  .post(workerController.createWorker);

router.route('/:id')
  .get(workerController.getWorker)
  .patch(workerController.updateWorker)
  .delete(workerController.deleteWorker);

module.exports = router;
