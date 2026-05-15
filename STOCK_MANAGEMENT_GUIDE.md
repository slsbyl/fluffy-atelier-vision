# Stock Management & Cart System Implementation Guide

## ✅ Frontend Implementation Complete

Your React frontend now includes:

1. **Cart Context** (`src/context/CartContext.tsx`)
   - Centralized state management for cart items
   - Automatic localStorage persistence
   - Methods: `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`, `getTotal()`

2. **Stock API Functions** (`src/api/stockApi.ts`)
   - `checkAvailableStock()` - Check if quantity is available
   - `updateProductStock()` - Decrement stock after order
   - `placeOrder()` - Submit order with stock update
   - `restoreStockOnReturn()` - Restore stock when order is returned

3. **Updated Components**
   - **ProductCard**: Quick "Add to Cart" with stock badge
   - **ProductDetail**: Stock check before adding, quantity limit based on stock
   - **Cart**: Order submission with backend integration

## 🔧 Backend Implementation Required

Your backend needs the following endpoints and logic:

### 1. **Update Product Stock After Order** ⚠️ CRITICAL

**Endpoint**: `PATCH /api/v1/products/:productId/stock`

```javascript
// Expected request body:
{
  "decrement": 2  // quantity to subtract from stock
}

// Expected response:
{
  "status": "success",
  "message": "Stock updated",
  "data": {
    "product": {
      "_id": "...",
      "stock": 8  // updated stock count
    }
  }
}
```

**Implementation checklist**:
- ✅ Subtract the decrement value from product.stock
- ✅ Verify stock doesn't go negative
- ✅ Update the product in MongoDB
- ✅ Return updated product data

### 2. **Place Order with Stock Deduction** ⚠️ CRITICAL

**Endpoint**: `POST /api/v1/orders` (existing endpoint, needs update)

```javascript
// Expected request body:
{
  "customerName": "John Doe",
  "phone": "+1234567890",
  "address": "123 Main St, City",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "productName": "Silk Blush Blouse",
      "size": "M",
      "quantity": 2,
      "price": 129
    }
  ],
  "total": 258,
  "date": "2026-04-13T12:00:00.000Z"
}

// Expected response:
{
  "status": "success",
  "message": "Order placed successfully",
  "data": {
    "orderId": "ORD-12345",
    "order": { /* full order object */ }
  }
}
```

**Implementation checklist**:
- ✅ Validate all items exist in database
- ✅ For each item, check stock availability
- ✅ If stock insufficient, return 400 error with message
- ✅ Create order document in MongoDB
- ✅ **Update stock for each product** (decrement by quantity ordered)
- ✅ Return order with orderId

### 3. **Get Product with Current Stock**

**Endpoint**: `GET /api/v1/products/:productId`

Ensure response includes stock field:

```javascript
{
  "status": "success",
  "data": {
    "product": {
      "_id": "...",
      "name": "Silk Blush Blouse",
      "price": 129,
      "stock": 10,  // ← Make sure this is included
      "description": "...",
      "image": "...",
      "category": "Tops",
      "sizes": ["XS", "S", "M", "L"]
    }
  }
}
```

### 4. **Restore Stock on Return** (Optional but recommended)

**Endpoint**: `POST /api/v1/orders/restore-stock`

```javascript
// Expected request body:
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ]
}

// Expected response:
{
  "status": "success",
  "message": "Stock restored",
  "data": {
    "restoredItems": [ /* items with updated stock */ ]
  }
}
```

## 📊 Database Schema Update

Add `stock` field to Product model (if not already present):

```javascript
{
  _id: ObjectId,
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String,
  sizes: [String],
  stock: Number,  // ← Add this field
  isBestSeller: Boolean,
  isNewArrival: Boolean,
  rating: Number,
  reviews: Number,
  soldCount: Number
}
```

## 🔄 Order Processing Flow

1. **User adds item to cart**
   - Frontend checks product in stock badge
   - User adjusts quantity (max = available stock)
   - Item added to Cart Context + localStorage

2. **User places order**
   - Frontend calls `POST /api/v1/orders`
   - Backend validates stock for all items
   - If OK: Creates order + updates stock
   - Returns orderId and success message
   - Frontend clears cart and shows confirmation

3. **Stock Management**
   - Product stock decreases with each order
   - If stock reaches 0, product shows "Out of Stock"
   - ProductCard "Add to Cart" button becomes disabled
   - User cannot proceed to checkout if insufficient stock

## ⚠️ Important Notes

1. **Stock Check at Checkout**: Always re-verify stock on backend before processing order (user might have items in cart for a while)

2. **Atomic Transactions**: Consider using MongoDB transactions to ensure stock is updated only if order is created successfully

3. **Error Handling**: Return clear error messages:
   - "Product out of stock"
   - "Only 2 items available (requested 5)"
   - "Order processing failed"

4. **Product Response**: Ensure `inStock` field is set based on stock:
   ```javascript
   inStock: product.stock > 0
   ```

## 🧪 Testing

Test these scenarios:
- ✅ Add item to cart → appears in cart
- ✅ Quick Add from ProductCard → first size selected automatically
- ✅ Try to buy more than available → error shown
- ✅ Place valid order → stock decreases
- ✅ Return order → stock increases
- ✅ Out of stock product → card shows badge, button disabled

## 📝 Frontend Variable Reference

Cart item structure:
```typescript
{
  productId: string;      // MongoDB ObjectId
  productName: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  stock?: number;         // Optional, from product
}
```

## 🚀 Next Steps

1. Update your Order endpoint to handle stock updates
2. Add stock field to Product model
3. Create/update the PATCH /products/:id/stock endpoint
4. Test the complete flow
5. Update this checklist as you complete each item
