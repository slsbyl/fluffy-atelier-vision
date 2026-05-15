const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 1
  },
  status: {
    type: String,
    enum: ['Pending', 'Cutting', 'Sewing', 'Finished'],
    default: 'Pending'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  completionDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Production', productionSchema);
