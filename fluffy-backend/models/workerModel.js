import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  salary: { type: Number, required: true },
  startDate: { type: String },
  deductions: { type: Number, default: 0 },
  presentDays: { type: Number, default: 0 },
  absentDays: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  phone: { type: String }
}, { timestamps: true });

const Worker = mongoose.model('Worker', workerSchema);
export default Worker;