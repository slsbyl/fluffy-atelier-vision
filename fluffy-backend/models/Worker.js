const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Worker must have a name'],
  },
  role: {
    type: String,
    enum: ['Sewing', 'Cutting', 'QC', 'Packing'],
    required: [true, 'Please specify the worker skill'],
  },
  shift: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Night'],
    required: [true, 'Please specify the shift'],
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
  },
  phone: String,
  joinDate: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  }
});

module.exports = mongoose.model('Worker', workerSchema);
