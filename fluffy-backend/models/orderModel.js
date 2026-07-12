import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  governorate: String,
  shippingFee: { type: Number, default: 0 },
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    color: String,
    size: String,
    quantity: { type: Number, required: true, min: 1 },
    price: Number
  }],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'قيد الانتظار', 'جاري التجهيز', 'تم الشحن', 'تم التوصيل', 'ملغي'],
    default: 'قيد الانتظار'
  },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

// This middleware calculates the total amount before saving the order.
// It's a standard function (not async) and uses next() to proceed.
orderSchema.pre('save', function(next) {
  try {
    if (this.items && this.items.length > 0) {
      const itemsTotal = this.items.reduce((acc, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return acc + (price * quantity);
      }, 0);
      this.totalAmount = itemsTotal + (this.shippingFee || 0);
    }
    next(); // Proceed to save
  } catch (error) {
    next(error); // Pass error to the next middleware
  }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;