# Backend Implementation Examples

These are example implementations for the Node.js/Express backend. Adapt to your existing code structure.

## 1. Update Product with Stock Field

### MongoDB Schema (Mongoose):

```javascript
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String,
  sizes: [String],
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  isBestSeller: Boolean,
  isNewArrival: Boolean,
  rating: Number,
  reviews: Number,
  soldCount: Number
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
```

---

## 2. Place Order Endpoint (POST /api/v1/orders)

```javascript
const express = require('express');
const router = express.Router();
const Product = mongoose.model('Product');
const Order = mongoose.model('Order'); // Create if doesn't exist

// POST /api/v1/orders
router.post('/orders', async (req, res) => {
  try {
    const { customerName, phone, address, items, total, date } = req.body;

    // Validation
    if (!customerName || !phone || !address || !items || items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Step 1: Validate stock for all items BEFORE creating order
    const stockValidation = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Only ${product.stock} available.`
          );
        }
        return true;
      })
    );

    if (!stockValidation.every(v => v === true)) {
      return res.status(400).json({
        status: 'error',
        message: 'Stock validation failed'
      });
    }

    // Step 2: Create order document
    const newOrder = await Order.create({
      customerName,
      phone,
      address,
      items,
      total,
      date,
      status: 'confirmed'
    });

    // Step 3: Update stock for each product (ATOMIC - do this together)
    await Promise.all(
      items.map(async (item) => {
        return Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: { stock: -item.quantity },
            $inc: { soldCount: item.quantity } // Optional: track sales
          },
          { new: true }
        );
      })
    );

    // Step 4: Return success response
    res.status(201).json({
      status: 'success',
      message: 'Order placed successfully',
      data: {
        orderId: newOrder._id,
        order: newOrder
      }
    });

  } catch (error) {
    console.error('Error placing order:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to place order'
    });
  }
});

module.exports = router;
```

---

## 3. Update Stock Endpoint (PATCH /api/v1/products/:productId/stock)

```javascript
// PATCH /api/v1/products/:productId/stock
router.patch('/products/:productId/stock', async (req, res) => {
  try {
    const { productId } = req.params;
    const { decrement } = req.body;

    // Validate input
    if (!decrement || decrement < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid decrement value'
      });
    }

    // Find product and update stock
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Ensure stock doesn't go negative
    if (product.stock < decrement) {
      return res.status(400).json({
        status: 'error',
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${decrement}`
      });
    }

    // Update stock
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: -decrement } }, // Decrement stock
      { new: true }
    );

    res.json({
      status: 'success',
      message: 'Stock updated',
      data: {
        product: updatedProduct
      }
    });

  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update stock'
    });
  }
});

module.exports = router;
```

---

## 4. Restore Stock on Return (POST /api/v1/orders/restore-stock)

```javascript
// POST /api/v1/orders/restore-stock
router.post('/orders/restore-stock', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid items array'
      });
    }

    // Restore stock for each item
    const restoredItems = await Promise.all(
      items.map(async (item) => {
        return Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } }, // Increment (restore) stock
          { new: true }
        );
      })
    );

    res.json({
      status: 'success',
      message: 'Stock restored',
      data: {
        restoredItems
      }
    });

  } catch (error) {
    console.error('Error restoring stock:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to restore stock'
    });
  }
});

module.exports = router;
```

---

## 5. Get Product with Stock (GET /api/v1/products/:id)

Make sure your existing GET endpoint returns stock:

```javascript
// GET /api/v1/products/:id
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          description: product.description,
          image: product.image,
          category: product.category,
          sizes: product.sizes,
          stock: product.stock,  // ← Make sure this is included
          inStock: product.stock > 0, // ← Helper field for frontend
          isBestSeller: product.isBestSeller,
          isNewArrival: product.isNewArrival,
          rating: product.rating,
          reviews: product.reviews,
          soldCount: product.soldCount
        }
      }
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch product'
    });
  }
});

module.exports = router;
```

---

## 6. Update GET All Products (GET /api/v1/products)

Update your list endpoint to include stock:

```javascript
// GET /api/v1/products
router.get('/products', async (req, res) => {
  try {
    const { category } = req.query;

    // Build filter
    const filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Fetch products
    const products = await Product.find(filter).select(
      'name price description image category sizes stock isBestSeller isNewArrival rating reviews soldCount'
    );

    // Add computed field
    const productsWithStock = products.map(p => ({
      ...p.toObject(),
      inStock: p.stock > 0
    }));

    res.json({
      status: 'success',
      data: {
        products: productsWithStock
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch products'
    });
  }
});

module.exports = router;
```

---

## 7. Order Model (Mongoose Schema)

Create if you don't have it:

```javascript
const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    size: String,
    quantity: Number,
    price: Number
  }],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'returned'],
    default: 'confirmed'
  },
  date: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
```

---

## 8. Complete Router Integration

In your main `server.js` or `app.js`:

```javascript
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware
app.use(express.json());

// ✅ Import your updated routes
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

// ✅ Register routes
app.use('/api/v1', productRoutes);
app.use('/api/v1', orderRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 🧪 Test with cURL

### Test Order Placement:
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "productName": "Silk Blush Blouse",
        "size": "M",
        "quantity": 2,
        "price": 129
      }
    ],
    "total": 258
  }'
```

### Test Stock Update:
```bash
curl -X PATCH http://localhost:3000/api/v1/products/507f1f77bcf86cd799439011/stock \
  -H "Content-Type: application/json" \
  -d '{"decrement": 2}'
```

---

## ⚠️ Important Checklist

- [ ] Add `stock` field to Product model
- [ ] Create Order model
- [ ] Implement POST /api/v1/orders with stock validation
- [ ] Implement PATCH /api/v1/products/:id/stock
- [ ] Implement POST /api/v1/orders/restore-stock
- [ ] Update GET /api/v1/products to include stock
- [ ] Update GET /api/v1/products/:id to include stock
- [ ] Test stock doesn't go negative
- [ ] Test invalid stock requests return 400 error
- [ ] Test order creation reduces stock
- [ ] Test response format matches frontend expectations

---

## 💾 MongoDB Update Commands

If you have existing products without stock field:

```javascript
// In MongoDB shell or MongoDB Compass
db.products.updateMany(
  {},
  [
    {
      $set: {
        stock: { $ifNull: ["$stock", 10] } // Set to 10 if missing
      }
    }
  ]
);
```

---

Still need help? Check:
- Frontend: `src/api/stockApi.ts`
- Guide: `STOCK_MANAGEMENT_GUIDE.md`
- Summary: `IMPLEMENTATION_SUMMARY.md`
