const Production = require('../models/Production');
const Product = require('../models/Product');

exports.createProduction = async (req, res) => {
  try {
    const { product, productName, quantity, status } = req.body;

    // Validate product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }

    const newProduction = await Production.create({
      product,
      productName,
      quantity,
      status: status || 'Pending',
      startDate: new Date()
    });

    res.status(201).json({
      status: 'success',
      data: { production: newProduction }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getAllProduction = async (req, res) => {
  try {
    const productions = await Production.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: productions.length,
      data: { productions }
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

exports.updateProduction = async (req, res) => {
  try {
    const production = await Production.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!production) {
      return res.status(404).json({
        status: 'fail',
        message: 'Production record not found'
      });
    }

    // If status changed to 'Finished', update product stock
    if (req.body.status === 'Finished' && production.product) {
      await Product.findByIdAndUpdate(
        production.product,
        { $inc: { stock: production.quantity } }
      );
    }

    res.status(200).json({
      status: 'success',
      data: { production }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.deleteProduction = async (req, res) => {
  try {
    const production = await Production.findByIdAndDelete(req.params.id);
    if (!production) {
      return res.status(404).json({
        status: 'fail',
        message: 'Production record not found'
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'Production deleted successfully'
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
