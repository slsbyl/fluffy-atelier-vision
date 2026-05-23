const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'A production batch must belong to a product']
  },
  quantity: {
    type: Number,
    required: [true, 'A production batch must have a quantity'],
    min: [1, 'Quantity must be at least 1']
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  assignedWorkers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  }]
}, {
  timestamps: true
});

const Production = mongoose.model('Production', productionSchema);
module.exports = Production;
