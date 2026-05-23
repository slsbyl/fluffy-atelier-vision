import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fluffy')
.then(() => console.log('تم الاتصال بقاعدة بيانات MongoDB بنجاح'))
.catch(err => console.error('خطأ في الاتصال بقاعدة بيانات MongoDB:', err));

import { router } from './COMPLETE_BACKEND_CODE.js';
app.use('/api/v1', router);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ status: 'error', message: 'حدث خطأ في السيرفر' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});