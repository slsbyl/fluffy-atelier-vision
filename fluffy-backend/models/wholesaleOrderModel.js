import mongoose from 'mongoose';

const wholesaleOrderSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'FactoryClient', required: true },
  productName: { type: String, required: true },
  productImage: String,
  productImages: [String],
  details: String,
  colors: [String],
  quantityPerSize: { type: Object, default: {} },
  totalQuantity: Number,
  pricePerPiece: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  status: { type: String, enum: ['في انتظار التسعير', 'قيد الانتظار', 'جاري القص', 'جاري الخياطة', 'تم التسليم'], default: 'في انتظار التسعير' },
  isDebtAdded: { type: Boolean, default: false }
}, { timestamps: true });

const WholesaleOrder = mongoose.model('WholesaleOrder', wholesaleOrderSchema);
export default WholesaleOrder;