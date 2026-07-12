import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ status: 'success', data: { orders } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching orders' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    // Basic stock check
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ status: 'error', message: `Stock not available for ${item.productName}` });
      }
    }

    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();

    // Decrement stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity, soldCount: item.quantity } });
    }

    res.status(201).json({ status: 'success', data: { order: savedOrder, orderId: savedOrder._id } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Error creating order' });
  }
};

export const restoreStock = async (req, res) => {
    try {
        const { items, orderId } = req.body;
        if (!items || !Array.isArray(items) || !orderId) {
            return res.status(400).json({ status: 'error', message: 'Invalid data for restoring stock.' });
        }

        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
        }

        // Find the order and update its status to 'Cancelled'
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: 'ملغي' }, // Using the Arabic status for consistency
            { new: true }
        );

        if (!updatedOrder) return res.status(404).json({ status: 'error', message: 'Order not found to update status.' });

        res.json({ status: 'success', message: 'Order has been cancelled and stock restored.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error restoring stock' });
    }
};
