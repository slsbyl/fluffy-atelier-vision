import Product from '../models/productModel.js';
import mongoose from 'mongoose';

export const getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }
    const products = await Product.find(filter);
    res.json({
      status: 'success',
      data: { products },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching products' });
  }
};

export const getProductById = async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ status: 'error', message: 'Product not found' });
      }
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ status: 'error', message: 'Product not found' });
      }
      res.json({ status: 'success', data: { product } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Error fetching product details' });
    }
  };

export const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json({ status: 'success', data: { product: savedProduct } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error creating product' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedProduct) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    res.json({ status: 'success', data: { product: updatedProduct } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error updating product' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error deleting product' });
  }
};
