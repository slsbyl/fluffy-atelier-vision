import mongoose from 'mongoose';

const factoryClientSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  totalDebt: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 }
}, { timestamps: true });

const FactoryClient = mongoose.model('FactoryClient', factoryClientSchema);

export default FactoryClient;