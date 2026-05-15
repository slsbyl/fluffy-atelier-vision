const express = require('express');
const workerController = require('../controllers/workerController');
const router = express.Router();

router.route('/')
  .get(workerController.getAllWorkers)
  .post(workerController.createWorker);

router.route('/:id')
  .get(workerController.getWorker)
  .patch(workerController.updateWorker)
  .delete(workerController.deleteWorker);

module.exports = router;
