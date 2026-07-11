import Worker from '../models/workerModel.js';

export const getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    res.json({ status: 'success', data: { workers } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في جلب العمال' });
  }
};

export const createWorker = async (req, res) => {
  try {
    const newWorker = new Worker(req.body);
    const savedWorker = await newWorker.save();
    res.status(201).json({ status: 'success', data: { worker: savedWorker } });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message).join(', ');
      return res.status(400).json({ status: 'fail', message: `فشل التحقق: ${messages}` });
    }
    res.status(500).json({ status: 'error', message: 'خطأ في إضافة العامل' });
  }
};

export const updateWorker = async (req, res) => {
  try {
    const updatedWorker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedWorker) return res.status(404).json({ status: 'error', message: 'العامل غير موجود' });
    res.json({ status: 'success', data: { worker: updatedWorker } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في تحديث بيانات العامل' });
  }
};

export const deleteWorker = async (req, res) => {
  try {
    const deletedWorker = await Worker.findByIdAndDelete(req.params.id);
    if (!deletedWorker) return res.status(404).json({ status: 'error', message: 'العامل غير موجود' });
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في حذف العامل' });
  }
};