import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { setDefaultResultOrder } from 'node:dns';

// Force Node.js to prefer IPv4 addresses to solve ENETUNREACH errors on Railway
setDefaultResultOrder('ipv4first');

// Import Routers
import productRouter from './routes/productRoutes.js';
import workerRouter from './routes/workerRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import userRouter from './routes/userRoutes.js';
import factoryClientRouter from './routes/factoryClientRoutes.js';
import wholesaleOrderRouter from './routes/wholesaleOrderRoutes.js';
import shippingRouter from './routes/shippingRoutes.js';
import vtoRouter from './routes/vtoRoutes.js';

dotenv.config();
const app = express();


// Middlewares الأساسية
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS Settings
const whitelist = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:5173', // منفذ Vite
  'https://fluffy-atelier-vision.vercel.app', // Vercel Frontend URL
];

if (process.env.FRONTEND_URL) {
  whitelist.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1 || origin.endsWith('.up.railway.app') || origin.endsWith('.lovable.app')) {
      return callback(null, true);
    }
    // Block others
    callback(new Error(`Origin '${origin}' not allowed by CORS`));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// API routes should be before the frontend serving
app.use('/api/v1/products', productRouter);
app.use('/api/v1/workers', workerRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/factory-clients', factoryClientRouter);
app.use('/api/v1/wholesale-orders', wholesaleOrderRouter);
app.use('/api/v1/shipping-rates', shippingRouter);
app.use('/api/v1/vto', vtoRouter);

// Add a custom 404 handler for any other route that is not found
app.use((req, res, next) => {
  res.status(404).json({ status: 'error', message: `API route not found on the server: ${req.originalUrl}` });
});

// Final error handler - must be defined after all other app.use() and routes
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ status: 'error', message: err.message || 'حدث خطأ في السيرفر' });
});

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/fluffy';

async function startServer() {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log('تم الاتصال بقاعدة بيانات MongoDB بنجاح');

    app.listen(PORT, () => {
      console.log(`الخادم يعمل على المنفذ ${PORT}`);
    });
  } catch (err) {
    console.error('خطأ في الاتصال بقاعدة بيانات MongoDB:', err);
    process.exit(1);
  }
}

startServer();