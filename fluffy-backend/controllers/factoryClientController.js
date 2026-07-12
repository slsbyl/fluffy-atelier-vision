import FactoryClient from '../models/factoryClientModel.js';
import WholesaleOrder from '../models/wholesaleOrderModel.js';

export const getAllFactoryClients = async (req, res) => {
  try {
    const clients = await FactoryClient.find().sort({ createdAt: -1 });
    res.json({ status: 'success', data: { clients } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching clients' });
  }
};

export const createFactoryClient = async (req, res) => {
  try {
    const newClient = new FactoryClient(req.body);
    await newClient.save();
    res.status(201).json({ status: 'success', data: { client: newClient } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ status: 'error', message: 'Username already exists' });
    }
    res.status(500).json({ status: 'error', message: 'Error creating client' });
  }
};

export const getFactoryClientById = async (req, res) => {
    try {
        const client = await FactoryClient.findById(req.params.id);
        if (!client) return res.status(404).json({ status: 'error', message: 'Client not found' });
        res.json({ status: 'success', data: { client } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching client' });
    }
};

export const loginFactoryClient = async (req, res) => {
    try {
        const { username, password } = req.body;
        const client = await FactoryClient.findOne({ username, password });
        if (!client) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        res.json({ status: 'success', data: { client } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Login error' });
    }
};

export const recordPayment = async (req, res) => {
    try {
        const { amount } = req.body;
        const client = await FactoryClient.findByIdAndUpdate(
            req.params.id,
            { $inc: { paidAmount: Number(amount) } },
            { new: true }
        );
        if (!client) return res.status(404).json({ status: 'error', message: 'Client not found' });
        res.json({ status: 'success', data: { client } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error recording payment' });
    }
};

export const deleteFactoryClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await FactoryClient.findById(id);
    if (!client) {
      return res.status(404).json({ status: 'error', message: 'Client not found' });
    }

    // Important: Also delete associated wholesale orders to prevent orphaned data
    await WholesaleOrder.deleteMany({ clientId: id });

    // Finally, delete the client
    await FactoryClient.findByIdAndDelete(id);

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting factory client:", error);
    res.status(500).json({ status: 'error', message: 'Error deleting client' });
  }
};