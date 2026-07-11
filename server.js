import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { router as apiRouter } from './COMPLETE_BACKEND_CODE.js'; // Re-enabling the main router
import cors from 'cors';

dotenv.config();

const app = express();

// Logging middleware to see all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] INCOMING: ${req.method} ${req.originalUrl}`);
  next();
});

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
  res.status(200).send('<h1>Fluffy API is Running! (Logger-Enabled Version)</h1><p>This version logs all incoming requests.</p>');
});

// API routes should be before the frontend serving
app.use('/api/v1', apiRouter);

// Add a custom 404 handler for any other route that is not found
app.use((req, res, next) => {
  console.error(`[404] Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ status: 'error', message: `API route not found on the server: ${req.originalUrl}` });
});

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/fluffy';

async function startServer() {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log('تم الاتصال بقاعدة بيانات MongoDB بنجاح');

    app.use((err, req, res, next) => { // Final error handler
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