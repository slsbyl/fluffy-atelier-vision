const Worker = require('../models/Worker');

exports.createWorker = async (req, res) => {
  try {
    const { name, role, shift, status, salary, phone } = req.body;

    if (!name || !role || !shift || !salary) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing required fields'
      });
    }

    const worker = await Worker.create({
      name,
      role,
      shift,
      status: status || 'Active',
      salary,
      phone
    });

    res.status(201).json({
      status: 'success',
      message: 'Worker created successfully',
      data: { worker }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: workers.length,
      data: { workers }
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

exports.getWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({
        status: 'fail',
        message: 'Worker not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: { worker }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!worker) {
      return res.status(404).json({
        status: 'fail',
        message: 'Worker not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: { worker }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) {
      return res.status(404).json({
        status: 'fail',
        message: 'Worker not found'
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'Worker deleted successfully'
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
