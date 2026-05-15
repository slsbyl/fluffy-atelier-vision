# ✅ Backend Response Format - الصيغة الصحيحة

من المهم جداً أن يكون `response format` من السيرفر بهذه الصيغة بالضبط:

---

## 1. **Order Creation - POST /api/v1/orders** ✅

### Response عند النجاح:
```javascript
{
  "status": "success",           // ← مهم جداً
  "message": "تم تأكيد الطلب",  // ← اختياري بس حسن للـ UX
  "data": {
    "orderId": "ORD-12345",      // ← الـ ID بتاع الطلب (مهم)
    "_id": "507f1f77bcf86cd799439011", // ← أو أي ID من MongoDB
    "order": {
      // تفاصيل الطلب
    }
  }
}
```

### Response عند الفشل:
```javascript
{
  "status": "error",                    // ← مهم جداً ("error" بالضبط)
  "message": "رقم الهاتف غير صحيح",   // ← رسالة واضحة للمستخدم
  "data": null
}
```

### أمثلة على رسائل الخطأ:
```javascript
// عندما المخزون منتهي
{
  "status": "error",
  "message": "للأسف المخزون انتهى من Silk Blush Blouse"
}

// عندما كمية أكثر من المتاح
{
  "status": "error", 
  "message": "متوفر فقط 2 قطع من Rose Pleated Skirt"
}

// عندما البيانات ناقصة
{
  "status": "error",
  "message": "الرجاء ملء جميع بيانات التوصيل"
}

// عندما قاعدة البيانات معطلة
{
  "status": "error",
  "message": "حدث خطأ في السيرفر. حاول لاحقاً"
}
```

---

## 2. **Get Product - GET /api/v1/products/:id** ✅

```javascript
{
  "status": "success",
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Silk Blush Blouse",
      "price": 129,
      "description": "...",
      "image": "...",
      "category": "Tops",
      "sizes": ["XS", "S", "M", "L"],
      "stock": 5,              // ← مهم (عدد القطع المتاح)
      "inStock": true,         // ← مهم (boolean)
      "isBestSeller": true,
      "isNewArrival": false,
      "rating": 4.8,
      "reviews": 124,
      "soldCount": 340
    }
  }
}
```

---

## 3. **Get Products List - GET /api/v1/products** ✅

```javascript
{
  "status": "success",
  "data": {
    "products": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Silk Blush Blouse",
        "price": 129,
        "image": "...",
        "category": "Tops",
        "sizes": ["XS", "S", "M", "L"],
        "stock": 5,           // ← مهم
        "inStock": true,      // ← مهم
        "isBestSeller": true,
        "isNewArrival": false,
        "rating": 4.8,
        "reviews": 124,
        "soldCount": 340
      },
      // ... منتجات أخرى
    ]
  }
}
```

---

## 4. **Update Stock - PATCH /api/v1/products/:id/stock** ✅

### Request:
```javascript
{
  "decrement": 2  // كم قطعة نطرح من المخزون
}
```

### Response:
```javascript
{
  "status": "success",
  "message": "تم تحديث المخزون",
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Silk Blush Blouse",
      "stock": 3,          // ← المخزون بعد التحديث
      "inStock": true
    }
  }
}
```

---

## 5. **Restore Stock - POST /api/v1/orders/restore-stock** ✅

### Request:
```javascript
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ]
}
```

### Response:
```javascript
{
  "status": "success",
  "message": "تم تحديث المخزون",
  "data": {
    "restoredItems": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Silk Blush Blouse",
        "stock": 5,  // ← المخزون بعد الإرجاع
        "inStock": true
      }
    ]
  }
}
```

---

## 🔴 أكثر الأخطاء الشائعة:

### ❌ خطأ 1: Status غير صحيح
```javascript
// ❌ WRONG
{ "success": true, ... }      // يستخدم "success" بدل "status"

// ✅ CORRECT
{ "status": "success", ... }  // يستخدم "status": "success"
```

### ❌ خطأ 2: ما في orderId
```javascript
// ❌ WRONG
{
  "status": "success",
  "data": {
    "order": { ... }  // ما في orderId
  }
}

// ✅ CORRECT
{
  "status": "success",
  "data": {
    "orderId": "ORD-12345",  // ← مهم
    "order": { ... }
  }
}
```

### ❌ خطأ 3: Stock field ناقص
```javascript
// ❌ WRONG
{
  "_id": "...",
  "name": "...",
  "price": 129
  // ما في stock
}

// ✅ CORRECT
{
  "_id": "...",
  "name": "...",
  "price": 129,
  "stock": 5  // ← يجب يكون موجود
}
```

### ❌ خطأ 4: Error response بدون "status": "error"
```javascript
// ❌ WRONG
{
  "error": "Something went wrong"  // يستخدم "error" بدل "status"
}

// ✅ CORRECT
{
  "status": "error",
  "message": "وصف الخطأ"
}
```

---

## 🧪 اختبر الـ API بـ cURL

### Test Order Creation:
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "أحمد",
    "phone": "01234567890",
    "address": "القاهرة",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "productName": "Silk Blush Blouse",
        "size": "M",
        "quantity": 1,
        "price": 129
      }
    ],
    "total": 129
  }'
```

### Test Get Product:
```bash
curl http://localhost:3000/api/v1/products/507f1f77bcf86cd799439011
```

### Test Update Stock:
```bash
curl -X PATCH http://localhost:3000/api/v1/products/507f1f77bcf86cd799439011/stock \
  -H "Content-Type: application/json" \
  -d '{"decrement": 1}'
```

---

## ✅ Checklist

- [ ] Order endpoint يرسل `status: "success"` عند النجاح
- [ ] Error endpoint يرسل `status: "error"` عند الخطأ
- [ ] Product response يشمل `stock` و `inStock`
- [ ] Order response يشمل `orderId` أو `_id`
- [ ] جميع الأعداد (stock, price, quantity) من نوع `number`
- [ ] جميع النصوص (messages) بالصيغة الصحيحة
- [ ] Error messages واضحة وقابلة للفهم

---

## 📝 ملاحظات مهمة جداً

1. **Case Sensitive**: "status" بأحرف صغيرة بالضبط
2. **Success String**: استخدم "success" و "error" بالضبط (ما في typos)
3. **Numbers**: stock و price يجب يكون أرقام, ما يكونش strings
4. **Response Structure**: استخدم نفس البنية في جميع الحالات
5. **Error Handling**: عند أي خطأ, ارسل `status: "error"` مع `message`

---

الآن السيرفر بتاعك جاهز؟ جرب هذه الصيغ! 🚀
