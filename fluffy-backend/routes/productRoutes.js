const express = require('express');
const container = require('../container');

const productController = container.resolve('ProductController');
const router = express.Router();

router.route('/')
  .get(productController.getAllProducts)
  .post(productController.createProduct);

router.route('/:id')
  .get(productController.getProduct)
  .delete(productController.deleteProduct)
  .put(productController.updateProduct);

module.exports = router;
