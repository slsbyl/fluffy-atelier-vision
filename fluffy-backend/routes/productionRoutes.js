const express = require('express');
const container = require('../container');

const productionController = container.resolve('ProductionController');
const router = express.Router();

router.route('/')
  .get(productionController.getAllProductions)
  .post(productionController.createProduction);

router.route('/:id')
  .get(productionController.getProduction)
  .patch(productionController.updateProduction)
  .delete(productionController.deleteProduction);

module.exports = router;
