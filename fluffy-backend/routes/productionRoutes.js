const express = require('express');
const productionController = require('../controllers/productionController');
const router = express.Router();

router.route('/')
  .get(productionController.getAllProduction)
  .post(productionController.createProduction);

router.route('/:id')
  .patch(productionController.updateProduction)
  .delete(productionController.deleteProduction);

module.exports = router;
