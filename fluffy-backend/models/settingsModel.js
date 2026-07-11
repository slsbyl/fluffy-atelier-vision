import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  rates: { type: Object, default: {} }
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;