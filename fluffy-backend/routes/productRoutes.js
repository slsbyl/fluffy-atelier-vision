const express = require('express');
const container = require('../container');

const productController = container.resolve('ProductController');
const router = express.Router();

router.route('/')
  .get(productController.getAllProducts)
  .post(productController.createProduct);

router.route('/:id')
  .delete(productController.deleteProduct)
  .patch(productController.updateProduct);

module.exports = router;
