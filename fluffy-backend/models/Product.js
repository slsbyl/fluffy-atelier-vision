const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
  },
  price: {
    type: Number,
    required: [true, 'A product must have a price'],
  },
  description: {
    type: String,
    required: [true, 'A product must have a description'],
  },
  category: {
    type: String,
    required: [true, 'A product must have a category'],
  },
  brand: String,
  stock: {
    type: Number,
    default: 0
  },
  sizes: [String],
  image: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  inStock: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Product', productSchema);