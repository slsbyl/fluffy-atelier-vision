import WholesaleOrder from '../models/wholesaleOrderModel.js';
import FactoryClient from '../models/factoryClientModel.js';

export const getAllWholesaleOrders = async (req, res) => {
  try {
    const { clientId } = req.query;
    const filter = clientId ? { clientId } : {};
    const orders = await WholesaleOrder.find(filter).sort({ createdAt: -1 });
    res.json({ status: 'success', data: { orders } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching wholesale orders' });
  }
};

export const createWholesaleOrder = async (req, res) => {
  try {
    const newOrder = new WholesaleOrder(req.body);
    await newOrder.save();
    res.status(201).json({ status: 'success', data: { order: newOrder } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error creating wholesale order' });
  }
};

export const updateWholesaleOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const order = await WholesaleOrder.findById(id);
    if (!order) return res.status(404).json({ status: 'error', message: 'Order not found' });

    // Logic for debt management
    if (updates.status && updates.status !== order.status && order.status === 'تم التسليم' && order.isDebtAdded) {
        await FactoryClient.findByIdAndUpdate(order.clientId, { $inc: { totalDebt: -order.totalPrice } });
        order.isDebtAdded = false;
    }

    Object.assign(order, updates);

    if (updates.pricePerPiece !== undefined) {
      order.totalPrice = order.pricePerPiece * order.totalQuantity;
    }
    
    if (order.status === 'تم التسليم' && !order.isDebtAdded && order.totalPrice > 0) {
        await FactoryClient.findByIdAndUpdate(order.clientId, { $inc: { totalDebt: order.totalPrice } });
        order.isDebtAdded = true;
    }

    await order.save();
    res.json({ status: 'success', data: { order } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error updating wholesale order' });
  }
};