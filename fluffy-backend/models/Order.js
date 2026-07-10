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


orderSchema.pre('save', function(next) {
  try {
    if (this.items && Array.isArray(this.items)) {
      const subtotal = this.items.reduce((total, item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 0);
        return total + itemTotal;
      }, 0);
      this.totalAmount = subtotal + (this.shippingFee || 0);
    } else {
      this.totalAmount = this.shippingFee || 0;
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Order', orderSchema);
