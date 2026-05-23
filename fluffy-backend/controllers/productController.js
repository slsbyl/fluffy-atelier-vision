class ProductController {
  constructor(productService) {
    this.productService = productService;
  }

  createProduct = async (req, res) => {
    try {
      const newProduct = await this.productService.createProduct(req.body);
      res.status(201).json({
        status: 'success',
        data: { product: newProduct }
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };

  getAllProducts = async (req, res) => {
    try {
      const products = await this.productService.getAllProducts();
      res.status(200).json({
        status: 'success',
        results: products.length,
        data: { products }
      });
    } catch (err) {
      res.status(404).json({ status: 'fail', message: err.message });
    }
  };

  getProduct = async (req, res) => {
    try {
      const product = await this.productService.getProductById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { product }
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };

  deleteProduct = async (req, res) => {
    try {
      await this.productService.deleteProduct(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Product deleted successfully'
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };

  updateProduct = async (req, res) => {
    try {
      const product = await this.productService.updateProduct(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        data: { product }
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };
}

module.exports = ProductController;
