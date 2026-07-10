const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone is required']
  },
  governorate: {
    type: String,
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      productName: String,
      price: Number,
      size: String,
      quantity: Number
    }
  ],
  totalAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


orderSchema.pre('save', async function() {
  try {
    // Ensure items is an array before reducing
    const itemsArray = this.items && Array.isArray(this.items) ? this.items : [];
    const itemsTotal = itemsArray.reduce((acc, item) => {
      return acc + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
    }, 0);
    this.totalAmount = itemsTotal + (Number(this.shippingFee) || 0);
  } catch (error) {
    throw error;
  }
});

module.exports = mongoose.model('Order', orderSchema);
