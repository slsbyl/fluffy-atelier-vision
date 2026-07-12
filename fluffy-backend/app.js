import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
 
// --- استيراد الراوترات (قد تحتاجين لتعديل المسارات إذا كانت مختلفة) ---
import productRouter from './routes/productRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import userRouter from './routes/userRoutes.js';
import shippingRouter from './routes/shippingRoutes.js';
import vtoRouter from './routes/vtoRoutes.js';
import workerRouter from './routes/workerRoutes.js';
import factoryClientRouter from './routes/factoryClientRoutes.js';
import wholesaleOrderRouter from './routes/wholesaleOrderRoutes.js';

const app = express();

// --- 1. الوسائط (Middlewares) ---

// إظهار سجلات الطلبات في وضع التطوير
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --- إعدادات CORS الديناميكية والنهائية ---
const whitelist = [
  'http://localhost:5173', // للعمل على جهازك المحلي
  'https://fluffy-atelier-vision.vercel.app' // رابط الواجهة الأمامية على Vercel
];

const corsOptions = {
  origin: function (origin, callback) {
    // السماح للنطاقات الموجودة في القائمة البيضاء
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } 
    // السماح لجميع روابط المعاينة والنشر الخاصة بـ Railway
    else if (origin.endsWith('.up.railway.app') || origin.endsWith('.lovable.app')) {
      callback(null, true);
    } 
    // منع أي نطاق آخر
    else {
      callback(new Error(`Origin '${origin}' not allowed by CORS`));
    }
  },
  credentials: true, // للسماح بإرسال الكوكيز والتوكن
};

app.use(cors(corsOptions));

// زيادة الحد الأقصى لحجم الطلب للسماح بإرسال الصور (لخدمة VTO)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// --- 2. المسارات (Routes) ---
app.get('/api/v1', (req, res) => {
    res.send('Fluffy API is running successfully!');
});

app.use('/api/v1/products', productRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/shipping', shippingRouter);
app.use('/api/v1/vto', vtoRouter);
app.use('/api/v1/workers', workerRouter);
app.use('/api/v1/factory-clients', factoryClientRouter);
app.use('/api/v1/wholesale-orders', wholesaleOrderRouter);

// --- معالج الأخطاء العام ---
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

export default app;