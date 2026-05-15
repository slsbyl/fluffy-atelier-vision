const mongoose = require('mongoose');

const factoryClientSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person name is required'],
  },
  phone: String,
  email: {
    type: String,
    lowercase: true,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    default: 0,
  },
  address: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  }
});

module.exports = mongoose.model('FactoryClient', factoryClientSchema);
