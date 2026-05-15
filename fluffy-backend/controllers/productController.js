const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    console.log("Creating product with data:", req.body);
    const newProduct = await Product.create(req.body);
    console.log("Product created successfully:", newProduct);
    res.status(201).json({
      status: 'success',
      data: { product: newProduct }
    });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    
    // Add inStock flag to each product
    const productsWithStock = products.map(p => {
      const productObj = p.toObject ? p.toObject() : p;
      return {
        ...productObj,
        inStock: productObj.stock > 0
      };
    });
    
    res.status(200).json({
      status: 'success',
      results: productsWithStock.length,
      data: { products: productsWithStock }
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    // Add inStock flag
    const productObj = product.toObject ? product.toObject() : product;
    const productWithStock = {
      ...productObj,
      inStock: productObj.stock > 0
    };
    
    res.status(200).json({
      status: 'success',
      data: { product: productWithStock }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    // Add inStock flag
    const productObj = product.toObject ? product.toObject() : product;
    const productWithStock = {
      ...productObj,
      inStock: productObj.stock > 0
    };
    
    res.status(200).json({
      status: 'success',
      data: { product: productWithStock }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};