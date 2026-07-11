import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  governorate: String,
  shippingFee: { type: Number, default: 0 },
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    color: String,
    size: String,
    quantity: {
      type: Number,
      required: true, min: 1
    },
    price: Number
  }],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'قيد الانتظار', 'جاري التجهيز', 'تم الشحن', 'تم التوصيل', 'ملغي'],
    default: 'قيد الانتظار'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  const itemsTotal = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  this.totalAmount = itemsTotal + this.shippingFee;
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;