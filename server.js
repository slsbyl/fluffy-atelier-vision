import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { router as apiRouter, Product, Order, User } from './COMPLETE_BACKEND_CODE.js'; // استيراد الراوتر والنماذج من الملف الموحد
import cors from 'cors';

dotenv.config();

const app = express();

// Middlewares الأساسية
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// إعدادات CORS الصحيحة للسماح بالطلبات مع credentials
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:8080', 
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/fluffy';

async function startServer() {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log('تم الاتصال بقاعدة بيانات MongoDB بنجاح');

    app.use('/api/v1', apiRouter); // استخدام الراوتر الموحد

    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ status: 'error', message: err.message || 'حدث خطأ في السيرفر' });
    });

    app.listen(PORT, () => {
      console.log(`الخادم يعمل على المنفذ ${PORT}`);
    });
  } catch (err) {
    console.error('خطأ في الاتصال بقاعدة بيانات MongoDB:', err);
    process.exit(1);
  }
}

startServer();