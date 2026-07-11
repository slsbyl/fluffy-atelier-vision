import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: String,
    image: String,
    images: [String],
    category: String,
    sizes: [String],
    colors: [String],
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    isBestSeller: Boolean,
    isNewArrival: Boolean,
    rating: Number,
    reviews: Number,
    soldCount: { type: Number, default: 0 }
  }, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;