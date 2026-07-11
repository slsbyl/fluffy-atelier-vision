import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import { router as apiRouter, Product, Order, User, Worker, FactoryClient, WholesaleOrder } from './COMPLETE_BACKEND_CODE.js'; // TEMPORARILY DISABLED FOR TESTING
import cors from 'cors';

dotenv.config();

const app = express();

// Middlewares الأساسية
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// إعدادات CORS الصحيحة للسماح بالطلبات مع credentials
const allowedOrigins = [
  'http://localhost:8080', // منفذ شائع
  'http://localhost:3000', // منفذ Create React App
  'http://localhost:5173', // منفذ Vite
  'https://fluffy-atelier-vision.vercel.app', // Vercel Frontend URL
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// Handle preflight requests for all routes
app.options('*', cors(corsOptions));


// Root endpoint to confirm server is running and deployments are working
app.get('/', (req, res) => {
  res.status(200).send('<h1>Fluffy API is Running!</h1><p>If you see this message, it means the latest code has been deployed successfully.</p><p>Now you can test the <a href="/health">/health</a> endpoint.</p>');
});

// Simple health check endpoint for debugging
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy and running correctly.' });
});

// Simple API test route to diagnose routing issues
app.get('/api/v1/test', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API test route is working!' });
});

// API routes should be before the frontend serving
// app.use('/api/v1', apiRouter); // TEMPORARILY DISABLED FOR TESTING

// Add a custom 404 handler for any other route that is not found
app.use((req, res, next) => {
  res.status(404).json({ status: 'error', message: `API route not found on the server: ${req.originalUrl}` });
});

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/fluffy';

async function startServer() {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log('تم الاتصال بقاعدة بيانات MongoDB بنجاح');

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