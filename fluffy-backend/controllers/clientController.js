const FactoryClient = require('../models/FactoryClient');

exports.createClient = async (req, res) => {
  try {
    const { companyName, contactPerson, phone, email, address } = req.body;

    if (!companyName || !contactPerson) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing required fields'
      });
    }

    const client = await FactoryClient.create({
      companyName,
      contactPerson,
      phone,
      email,
      address,
      totalOrders: 0,
      balance: 0
    });

    res.status(201).json({
      status: 'success',
      message: 'Factory client created successfully',
      data: { client }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const clients = await FactoryClient.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: clients.length,
      data: { clients }
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

exports.getClient = async (req, res) => {
  try {
    const client = await FactoryClient.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        status: 'fail',
        message: 'Factory client not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: { client }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const client = await FactoryClient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) {
      return res.status(404).json({
        status: 'fail',
        message: 'Factory client not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: { client }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await FactoryClient.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({
        status: 'fail',
        message: 'Factory client not found'
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'Factory client deleted successfully'
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
