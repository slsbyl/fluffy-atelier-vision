const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const productionRouter = require('./routes/productionRoutes');
const orderRouter = require('./routes/orderRoutes');
const vtoRouter = require('./routes/vtoRoutes');

dotenv.config();
const app = express();

// Order matters! Parse body BEFORE routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Database Connected Successfully'))
  .catch((err) => console.log('DB Connection Error:', err));

app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/production', productionRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/vto', vtoRouter);

app.get('/', (req, res) => {
  res.send('Fluffy Backend is Running!');
});

// Global error handling middleware - MUST be last
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});