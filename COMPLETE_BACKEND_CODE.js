
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { Client } from '@gradio/client';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
const router = express.Router();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'a-very-long-and-secure-secret-for-dev', { expiresIn: process.env.JWT_EXPIRES_IN || '90d' });
};

const Product = mongoose.model('Product', new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: String,
    image: String,
    images: [String],
    category: String,
    sizes: [String],
    colors: [String],
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    isBestSeller: Boolean,
    isNewArrival: Boolean,
    rating: Number,
    reviews: Number,
    soldCount: {
      type: Number,
      default: 0
    }
  }, { timestamps: true }));

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
  governorate: String,
  shippingFee: { type: Number, default: 0 },
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    color: String,
    size: String,
    quantity: {
      type: Number,
      required: true, min: 1
    },
    price: Number
  }],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'قيد الانتظار', 'جاري التجهيز', 'تم الشحن', 'تم التوصيل', 'ملغي'],
    default: 'قيد الانتظار'
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.pre('save', async function() {
  // Ensure items is an array before reducing
  const itemsArray = this.items && Array.isArray(this.items) ? this.items : [];
  const itemsTotal = itemsArray.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return acc + (price * quantity);
  }, 0);
  this.totalAmount = itemsTotal + (Number(this.shippingFee) || 0);
});

const Order = mongoose.model('Order', orderSchema);

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  salary: { type: Number, required: true },
  startDate: { type: String },
  deductions: { type: Number, default: 0 },
  presentDays: { type: Number, default: 0 },
  absentDays: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, { timestamps: true });

const Worker = mongoose.model('Worker', workerSchema);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['owner', 'admin', 'customer'], default: 'customer' },
  passwordResetToken: String,
  passwordResetExpires: Date
}, { timestamps: true });

userSchema.pre('save', async function() {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return;
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

const factoryClientSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  totalDebt: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 }
}, { timestamps: true });

const FactoryClient = mongoose.model('FactoryClient', factoryClientSchema);

const wholesaleOrderSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'FactoryClient', required: true },
  productName: { type: String, required: true },
  productImage: String,
  productImages: [String],
  details: String,
  colors: [String],
  quantityPerSize: { type: Object, default: {} },
  totalQuantity: Number,
  pricePerPiece: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  status: { type: String, enum: ['في انتظار التسعير', 'قيد الانتظار', 'جاري القص', 'جاري الخياطة', 'تم التسليم'], default: 'في انتظار التسعير' },
  isDebtAdded: { type: Boolean, default: false }
}, { timestamps: true });

const WholesaleOrder = mongoose.model('WholesaleOrder', wholesaleOrderSchema);

const settingsSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  rates: { type: Object, default: {} }
});
const Settings = mongoose.model('Settings', settingsSchema);

router.get('/products', async (req, res) => {
  try {
    const { category } = req.query;

    let filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }

    const products = await Product.find(filter);

    const productsWithStock = products.map(p => ({
      _id: p._id,
      id: p._id.toString(),
      name: p.name,
      price: p.price,
      description: p.description,
      image: p.image,
      images: p.images || [],
      category: p.category,
      sizes: p.sizes || [],
      colors: p.colors || [],
      stock: p.stock,
      inStock: p.stock > 0,
      isBestSeller: p.isBestSeller || false,
      isNewArrival: p.isNewArrival || false,
      rating: p.rating || 4.5,
      reviews: p.reviews || 0,
      soldCount: p.soldCount || 0
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
      message: 'خطأ في جلب المنتجات'
    });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: 'error',
        message: 'المنتج غير موجود'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'المنتج غير موجود'
      });
    }

    res.json({
      status: 'success',
      data: {
        product: {
          _id: product._id,
          id: product._id.toString(),
          name: product.name,
          price: product.price,
          description: product.description,
          image: product.image,
          images: product.images || [],
          category: product.category,
          sizes: product.sizes || [],
          colors: product.colors || [],
          stock: product.stock,
          inStock: product.stock > 0,
          isBestSeller: product.isBestSeller || false,
          isNewArrival: product.isNewArrival || false,
          rating: product.rating || 4.5,
          reviews: product.reviews || 0,
          soldCount: product.soldCount || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في جلب تفاصيل المنتج'
    });
  }
});

router.post('/products', async (req, res) => {
  try {
    console.log("\n=== استلام طلب إضافة منتج جديد ===");
    console.log("البيانات المستلمة من الواجهة:", req.body);

    const { name, price, description, image, images, category, sizes, colors, stock, brand } = req.body;

    const newProduct = new Product({
      name,
      price,
      description,
      image: images && images.length > 0 ? images[0] : (image || "https://via.placeholder.com/150"),
      images: images || (image ? [image] : []),
      category,
      sizes: sizes || [],
      colors: Array.isArray(colors) ? colors.filter(c => c && c.trim() !== '') : [],
      stock: stock || 0,
      isBestSeller: false,
      isNewArrival: true
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      status: 'success',
      data: {
        product: savedProduct
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في إضافة المنتج' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, image, images, category, sizes, colors, stock, brand } = req.body;
    console.log(`\n=== استلام طلب تحديث منتج ${id} ===`);
    console.log("البيانات المستلمة للتحديث:", req.body);

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        price,
        description,
        image: images && images.length > 0 ? images[0] : (image || "https://via.placeholder.com/150"),
        images: images || (image ? [image] : []),
        category,
        sizes: sizes || [],
        colors: Array.isArray(colors) ? colors.filter(c => c && c.trim() !== '') : [],
        stock: stock || 0,
        brand
      },
      { new: true }
    );

    res.json({
      status: 'success',
      data: {
        product: updatedProduct
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في تحديث المنتج' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'معرف المنتج غير صالح'
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        status: 'error',
        message: 'المنتج غير موجود للحذف'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'تم حذف المنتج بنجاح',
      data: null
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في حذف المنتج'
    });
  }
});

router.get('/workers', async (req, res) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    res.json({ status: 'success', data: { workers } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في جلب العمال' });
  }
});

router.post('/workers', async (req, res) => {
  try {
    const { name, role, salary, startDate, deductions, notes, phone } = req.body;
    const newWorker = new Worker({
      name, role, salary, startDate, deductions: deductions || 0, notes: notes || '', phone
    });
    const savedWorker = await newWorker.save(); // The schema has timestamps: true, so createdAt/updatedAt are automatic
    res.status(201).json({ status: 'success', data: { worker: savedWorker } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في إضافة العامل' });
  }
});

router.put('/workers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedWorker = await Worker.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedWorker) return res.status(404).json({ status: 'error', message: 'العامل غير موجود' });
    
    res.json({ status: 'success', data: { worker: updatedWorker } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في تحديث بيانات العامل' });
  }
});

router.delete('/workers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedWorker = await Worker.findByIdAndDelete(id);
    if (!deletedWorker) return res.status(404).json({ status: 'error', message: 'العامل غير موجود' });
    res.json({ status: 'success', message: 'تم حذف العامل' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في حذف العامل' });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const { customerName, email, phone, address, governorate, shippingFee, items, date, totalAmount } = req.body;

    console.log("\n=== استلام طلب جديد ===", { customerName, email, phone });

    if (!customerName?.trim() || !phone?.trim() || !address?.trim() || !governorate?.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'الرجاء ملء جميع بيانات التوصيل والمحافظة'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'السلة فارغة'
      });
    }

    console.log('Checking stock for items...');
    const stockValidation = [];

    for (const item of items) {
      if (!item.quantity) {
        return res.status(400).json({
          status: 'error',
          message: `الكمية غير محددة للمنتج: ${item.productName || 'غير معروف'}`
        });
      }
      if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({
          status: 'error',
          message: `معرف المنتج غير صالح للمنتج: ${item.productName || 'غير معروف'}`
        });
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(400).json({
          status: 'error',
          message: `المنتج "${item.productName}" غير موجود`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          status: 'error',
          message: `متوفر فقط ${product.stock} قطع من "${product.name}". طلبت ${item.quantity}`
        });
      }

      stockValidation.push(product);
    }

    console.log('Stock validation passed');

    const orderItems = items.map((item, index) => {
      const product = stockValidation[index];
      return {
        productId: item.productId,
        productName: product.name || item.productName,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: product.price || item.price || 0
      };
    });

    const newOrder = new Order({
      customerName: customerName.trim(),
      email: (email || '').trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      governorate: governorate.trim(),
      shippingFee: Number(shippingFee) || 0,
      items: orderItems,
      totalAmount: totalAmount || 0,
      status: 'قيد الانتظار',
      date: date ? new Date(date) : new Date(),
      createdAt: new Date()
    });

    const savedOrder = await newOrder.save();
    console.log('Order saved:', savedOrder._id);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const product = stockValidation[i];

      await Product.findByIdAndUpdate(
        product._id,
        {
          $inc: {
            stock: -item.quantity,
            soldCount: item.quantity
          }
        },
        { new: true }
      );

      console.log(`Updated stock for ${product.name}. New stock: ${product.stock - item.quantity}`);
    }

    console.log('All stocks updated');

    console.log("محاولة إرسال إيميل إلى:", email);
    if (email && process.env.EMAIL_USER) {
      try {
        let itemsHtml = '';
        const hexToName = {
          '#ff0000': 'أحمر', '#0000ff': 'أزرق', '#008000': 'أخضر', '#000000': 'أسود',
          '#ffffff': 'أبيض', '#ffff00': 'أصفر', '#ffa500': 'برتقالي', '#ffc0cb': 'وردي',
          '#800080': 'بنفسجي', '#808080': 'رمادي', '#a52a2a': 'بني', '#000080': 'كحلي',
          '#f5f5dc': 'بيج', '#ffd700': 'ذهبي', '#c0c0c0': 'فضي'
        };

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          
          let colorDisplay = item.color || '-';
          if (item.color && item.color.startsWith('#')) {
            const hex = item.color.toLowerCase();
            colorDisplay = hexToName[hex] || `<span style="display:inline-block; width:14px; height:14px; background-color:${hex}; border-radius:3px; border:1px solid #aaa; vertical-align:middle;"></span>`;
          }

          itemsHtml += `
            <tr style="border-bottom: 1px solid #fdeef5;">
              <td style="padding: 15px 10px; text-align: right;">
                <span style="font-weight: 600; font-size: 15px; color: #333;">${item.productName}</span><br>
                <span style="font-size: 13px; color: #777;">
                  اللون: ${colorDisplay} / المقاس: ${item.size || '-'}
                </span>
              </td>
              <td style="padding: 15px 10px; text-align: center; font-size: 14px; color: #555;">x ${item.quantity}</td>
              <td style="padding: 15px 10px; text-align: left; font-weight: bold; font-size: 15px; color: #333;">${item.price * item.quantity} ج.م</td>
            </tr>
          `;
        }

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
          }
        });

        const mailOptions = {
          from: `"Fluffy Store" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'تم تأكيد طلبك من Fluffy',
          html: `
            <div dir="rtl" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fdfcff; color: #555; max-width: 600px; margin: 20px auto; border: 1px solid #fdeef5; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #fdeef5; padding: 25px; text-align: center;">
                <h1 style="margin: 0; color: #c77da7; font-weight: 500; letter-spacing: 2px; font-size: 24px;">FLUFFY</h1>
              </div>
              <div style="padding: 30px 35px;">
                <h2 style="margin-top: 0; color: #333; font-size: 20px; font-weight: 600;">مرحباً ${customerName}،</h2>
                <p style="font-size: 15px; line-height: 1.7;">تم استلام طلبك بنجاح وهو الآن قيد التجهيز. نشكرك على تسوقك معنا.</p>
                
                <div style="margin: 30px 0; padding: 20px; background-color: #fff; border: 1px solid #fdeef5; border-radius: 8px;">
                  <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #c77da7; border-bottom: 1px solid #fdeef5; padding-bottom: 10px;">ملخص الطلب</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </div>
                
                <div style="text-align: left; margin-top: 20px;">
                  <table style="width: 100%; text-align: left; font-size: 14px;">
                    <tr>
                      <td style="padding: 5px 0;">قيمة المنتجات:</td>
                      <td style="padding: 5px 0; font-weight: 600;">${savedOrder.totalAmount - (Number(shippingFee) || 0)} ج.م</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0;">مصاريف الشحن:</td>
                      <td style="padding: 5px 0; font-weight: 600;">${shippingFee} ج.م</td>
                    </tr>
                    <tr style="border-top: 2px solid #fdeef5; font-size: 18px; color: #333;">
                      <td style="padding: 15px 0 0 0; font-weight: bold;">الإجمالي الكلي:</td>
                      <td style="padding: 15px 0 0 0; font-weight: bold; color: #c77da7;">${savedOrder.totalAmount} ج.م</td>
                    </tr>
                  </table>
                </div>
              </div>
              <div style="background-color: #f8f9fa; color: #999; text-align: center; padding: 20px; font-size: 12px; border-top: 1px solid #fdeef5;">
                <p style="margin: 0;">في حال وجود أي استفسار، لا تتردد في التواصل معنا.</p>
                <p style="margin: 8px 0 0 0;">&copy; ${new Date().getFullYear()} Fluffy Store. جميع الحقوق محفوظة.</p>
              </div>
            </div>
          `
        };

        // استخدام await لضمان انتظار اكتمال الإرسال والتقاط الأخطاء بشكل صحيح
        const info = await transporter.sendMail(mailOptions);
        console.log("تم إرسال الإيميل بنجاح:", info.response);
        
      } catch (err) {
        console.error("فشل تجهيز الإيميل:", err);
      }
    } else {
      if (!email) {
        console.log("لم يتم إرسال الإيميل لأن حقل الإيميل فارغ أو لم يصل من الواجهة!");
      } else if (!process.env.EMAIL_USER) {
        console.log(" الإيميل وصل من الواجهة، ولكن لم يتم الإرسال لأن إعدادات الإيميل (EMAIL_USER) غير موجودة في ملف .env!");
      }
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      try {
        console.log("جاري إرسال بيانات الطلب إلى n8n...");
        
        const totalItemsQuantity = savedOrder.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        const itemsDetails = savedOrder.items.map(item => 
          `${item.productName} (لون: ${item.color || '-'}, مقاس: ${item.size || '-'}) x${item.quantity}`
        ).join(' | ');

        const payload = {
          orderId: savedOrder._id.toString(),
          customerName: savedOrder.customerName,
          phone: savedOrder.phone,
          address: savedOrder.address,
          governorate: savedOrder.governorate,
          totalAmount: savedOrder.totalAmount,
          shippingFee: savedOrder.shippingFee,
          totalItemsQuantity: Number(totalItemsQuantity),
          productNames: itemsDetails,
          date: savedOrder.createdAt,
          status: savedOrder.status,
          source: 'Website'
        };

        console.log("إرسال بيانات إلى n8n:", JSON.stringify(payload, null, 2));

        const fetchMethod = typeof fetch !== 'undefined' ? fetch : null;
        if (fetchMethod) {
          const response = await fetchMethod(n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (response.ok) {
            console.log("تم إرسال الطلب إلى n8n بنجاح");
          } else {
            console.log("فشل إرسال الطلب إلى n8n، كود الحالة:", response.status);
          }
        }
      } catch (n8nError) {
        console.error("حدث خطأ غير متوقع أثناء إرسال بيانات n8n:", n8nError);
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'تم تأكيد الطلب بنجاح',
      data: {
        orderId: savedOrder._id.toString(),
        _id: savedOrder._id.toString(),
        order: savedOrder
      }
    });

  } catch (error) {

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'بيانات غير صحيحة'
      });
    }

    res.status(500).json({
      status: 'error',
      message: error.message || 'حدث خطأ في السيرفر'
    });
  }
});

router.patch('/products/:productId/stock', async (req, res) => {
  try {
    const { productId } = req.params;
    const { decrement } = req.body;

    if (!decrement || isNaN(decrement) || decrement < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'قيمة غير صحيحة'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(404).json({
        status: 'error',
        message: 'المنتج غير موجود'
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'المنتج غير موجود'
      });
    }

    if (product.stock < decrement) {
      return res.status(400).json({
        status: 'error',
        message: `متوفر فقط ${product.stock} قطع. طلبت ${decrement}`
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: -decrement } },
      { new: true }
    );

    res.json({
      status: 'success',
      message: 'تم تحديث المخزون',
      data: {
        product: {
          _id: updatedProduct._id,
          name: updatedProduct.name,
          stock: updatedProduct.stock,
          inStock: updatedProduct.stock > 0
        }
      }
    });

  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في تحديث المخزون'
    });
  }
});

router.post('/orders/restore-stock', async (req, res) => {
  try {
    const { items, orderId } = req.body;
 
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'بيانات غير صحيحة'
      });
    }

    if (!orderId) {
      return res.status(400).json({
        status: 'error',
        message: 'معرف الطلب مطلوب لإرجاع المخزون'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        status: 'error',
        message: 'معرف الطلب غير صالح'
      });
    }
    const restoredItems = [];

    for (const item of items) {
      const product = await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { new: true }
      );

      if (product) {
        restoredItems.push(product);
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: 'ملغي' }, 
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        status: 'error',
        message: 'الطلب غير موجود لتحديث حالته بعد الإرجاع'
      });
    }

    console.log(`تم تحديث حالة الطلب ${orderId} إلى 'Cancelled'`);

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      try {
        console.log("جاري إرسال بيانات الطلب المرتجع إلى n8n...");

        const totalItemsQuantity = updatedOrder.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        const itemsDetails = updatedOrder.items.map(item =>
          `${item.productName} (لون: ${item.color || '-'}, مقاس: ${item.size || '-'}) x${item.quantity}`
        ).join(' | ');

        const payload = {
          orderId: updatedOrder._id.toString(),
          customerName: updatedOrder.customerName,
          phone: updatedOrder.phone,
          address: updatedOrder.address,
          governorate: updatedOrder.governorate,
          totalAmount: updatedOrder.totalAmount,
          shippingFee: updatedOrder.shippingFee,
          totalItemsQuantity: Number(totalItemsQuantity),
          productNames: itemsDetails,
          date: updatedOrder.createdAt,
          status: updatedOrder.status,
          source: 'Website - Returned',
          action: 'update'
        };

        console.log("إرسال بيانات إلى n8n:", JSON.stringify(payload, null, 2));

        const fetchMethod = typeof fetch !== 'undefined' ? fetch : null;
        if (fetchMethod) {
          const response = await fetchMethod(n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (response.ok) {
            console.log("تم إرسال الطلب المرتجع إلى n8n بنجاح");
          } else {
            console.log("فشل إرسال الطلب المرتجع إلى n8n، كود الحالة:", response.status);
          }
        }
      } catch (n8nError) {
        console.error("حدث خطأ غير متوقع أثناء إرسال بيانات n8n للطلب المرتجع:", n8nError);
      }
    }

    res.json({
      status: 'success',
      message: 'تم تحديث المخزون وحالة الطلب بنجاح',
      data: {
        restoredItems,
        updatedOrder
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'خطأ في تحديث المخزون'
    });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: {
        orders
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'خطأ في جلب الطلبات'
    });
  }
});

router.post('/users/signup', async (req, res) => {
  try {
    let { name, email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
    }
    email = email.trim().toLowerCase();
    password = password.trim();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    const newUser = new User({ name, email, password, role: role || 'customer' });
    await newUser.save();

    res.status(201).json({
      status: 'success',
      message: 'تم إنشاء الحساب بنجاح',
      data: { user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ status: 'error', message: 'خطأ في إنشاء الحساب' });
  }
});

router.post('/users/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
    }
    email = email.trim().toLowerCase();
    password = password.trim();
    console.log(`\nمحاولة تسجيل دخول للإيميل: ${email}`);

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('الإيميل غير موجود بقاعدة البيانات');
      return res.status(401).json({ status: 'error', message: 'هذا الإيميل غير مسجل لدينا، تأكدي من كتابته بشكل صحيح' });
    }

    const isMatch = await user.correctPassword(password, user.password);
    if (!isMatch) {
      console.log('الباسوورد غير صحيح');
      return res.status(401).json({ status: 'error', message: 'كلمة المرور غير صحيحة' });
    }

    console.log('تم الدخول بنجاح!');
    const token = signToken(user._id);
    res.json({
      status: 'success',
      message: 'تم تسجيل الدخول بنجاح',
      token,
      data: { user: { _id: user._id, name: user.name, email: user.email, role: user.role } }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: 'خطأ في تسجيل الدخول' });
  }
});

router.post('/users/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ status: 'success', message: 'إذا كان هذا البريد مسجلاً، سيتم إرسال رابط إعادة التعيين إليه.' });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const resetURL = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `
      <div dir="rtl" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fdfcff; color: #555; max-width: 600px; margin: 20px auto; border: 1px solid #fdeef5; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #fdeef5; padding: 25px; text-align: center;">
          <h1 style="margin: 0; color: #c77da7; font-weight: 500; letter-spacing: 2px; font-size: 24px;">FLUFFY</h1>
        </div>
        <div style="padding: 30px 35px;">
          <h2 style="margin-top: 0; color: #333; font-size: 20px; font-weight: 600;">إعادة تعيين كلمة المرور</h2>
          <p style="font-size: 15px; line-height: 1.7;">لقد طلبت إعادة تعيين كلمة المرور الخاصة بك. اضغط على الزر أدناه للمتابعة. هذا الرابط صالح لمدة 10 دقائق فقط.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" style="background-color: #c77da7; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">إعادة تعيين كلمة المرور</a>
          </div>
          <p style="font-size: 15px; line-height: 1.7;">إذا لم تطلب ذلك، يرجى تجاهل هذا البريد الإلكتروني.</p>
        </div>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD }
    });

    await transporter.sendMail({
        from: `"Fluffy Store" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'إعادة تعيين كلمة المرور الخاصة بحسابك في Fluffy',
        html: message
    });
    console.log("تم إرسال إيميل إعادة التعيين بنجاح إلى:", user.email);

    res.json({ status: 'success', message: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني.' });

  } catch (err) {
    console.error("فشل إرسال إيميل إعادة التعيين:", err);
    res.status(500).json({ status: 'error', message: 'حدث خطأ ما.' });
  }
});

router.patch('/users/reset-password/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ status: 'error', message: 'الرابط غير صالح أو انتهت صلاحيته.' });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ status: 'success', message: 'تم تغيير كلمة المرور بنجاح.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'حدث خطأ ما.' });
  }
});


router.post('/factory-clients/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const client = await FactoryClient.findOne({ username, password });
    if (!client) return res.status(401).json({ status: 'error', message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    res.json({ status: 'success', data: { client } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في تسجيل الدخول' });
  }
});

router.get('/factory-clients/:id', async (req, res) => {
  try {
    const client = await FactoryClient.findById(req.params.id);
    if (!client) return res.status(404).json({ status: 'error', message: 'العميل غير موجود' });
    res.json({ status: 'success', data: { client } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في جلب بيانات العميل' });
  }
});

router.get('/factory-clients', async (req, res) => {
  try {
    const clients = await FactoryClient.find().sort({ createdAt: -1 });
    res.json({ status: 'success', data: { clients } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في جلب العملاء' });
  }
});

router.post('/factory-clients', async (req, res) => {
  try {
    // Destructure to ensure only expected fields are used from req.body
    const { companyName, ownerName, phone, username, password } = req.body;
    const newClient = new FactoryClient({
      companyName, ownerName, phone, username, password
    });
    await newClient.save();
    res.status(201).json({ status: 'success', data: { client: newClient } });
  } catch (error) {
    if(error.code === 11000) return res.status(400).json({ status: 'error', message: 'اسم المستخدم (Username) مستخدم بالفعل' });
    res.status(500).json({ status: 'error', message: 'خطأ في إضافة العميل' });
  }
});

router.post('/factory-clients/:id/payment', async (req, res) => {
  try {
    const { amount } = req.body;
    const client = await FactoryClient.findByIdAndUpdate(
      req.params.id,
      { $inc: { paidAmount: Number(amount) } },
      { new: true }
    );
    res.json({ status: 'success', data: { client } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في تسجيل الدفعة' });
  }
});

router.post('/wholesale-orders', async (req, res) => {
  try {
    console.log("استلام طلب جملة/براند جديد:", req.body);
    const newOrder = new WholesaleOrder(req.body);
    const savedOrder = await newOrder.save();
    
    console.log("تم حفظ طلب الجملة بنجاح ID:", savedOrder._id);
    
    res.status(201).json({ status: 'success', data: { order: newOrder } });
  } catch (error) {
    console.error("خطأ في حفظ طلب الجملة:", error.message);
    res.status(500).json({ status: 'error', message: 'خطأ في إنشاء الطلب' });
  }
});

router.get('/wholesale-orders', async (req, res) => {
  try {
    const { clientId } = req.query;
    const filter = clientId ? { clientId } : {};
    const orders = await WholesaleOrder.find(filter).sort({ createdAt: -1 });
    res.json({ status: 'success', data: { orders } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في جلب الطلبات' });
  }
});

router.put('/wholesale-orders/:id', async (req, res) => {
  try {
    const { status, pricePerPiece, productName, productImage, productImages, details, colors, quantityPerSize, totalQuantity } = req.body;
    const order = await WholesaleOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ status: 'error', message: 'الطلب غير موجود' });

    if (status && status !== order.status) {
      if (order.status === 'تم التسليم' && order.isDebtAdded) {
        await FactoryClient.findByIdAndUpdate(order.clientId, {
          $inc: { totalDebt: -order.totalPrice }
        });
        order.isDebtAdded = false;
      }
      order.status = status;
    }

    if (productName) order.productName = productName;
    if (productImage) order.productImage = productImage;
    if (productImages) order.productImages = productImages;
    if (details !== undefined) order.details = details;
    if (colors) order.colors = colors;
    if (quantityPerSize) order.quantityPerSize = quantityPerSize;
    
    let newTotalQuantity = order.totalQuantity;
    if (totalQuantity !== undefined) {
      newTotalQuantity = totalQuantity;
      order.totalQuantity = totalQuantity;
    }

    if (pricePerPiece !== undefined) {
      order.pricePerPiece = Number(pricePerPiece);
      if (order.status === 'في انتظار التسعير') order.status = 'قيد الانتظار';
    }

    if (order.pricePerPiece > 0) {
      order.totalPrice = order.pricePerPiece * newTotalQuantity;
    }

    if (order.status === 'تم التسليم' && !order.isDebtAdded && order.totalPrice > 0) {
      await FactoryClient.findByIdAndUpdate(order.clientId, {
        $inc: { totalDebt: order.totalPrice }
      });
      order.isDebtAdded = true;
    }

    await order.save();
    res.json({ status: 'success', data: { order } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في تحديث الحالة' });
  }
});

router.get('/shipping-rates', async (req, res) => {
  try {
    let settings = await Settings.findOne({ type: 'shipping' });
    res.json({ status: 'success', data: { rates: settings ? settings.rates : {} } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في جلب أسعار التوصيل' });
  }
});

router.put('/shipping-rates', async (req, res) => {
  try {
    const { rates } = req.body;
    let settings = await Settings.findOne({ type: 'shipping' });
    if (!settings) {
      settings = new Settings({ type: 'shipping', rates });
    } else {
      settings.rates = rates;
    }
    await settings.save();
    res.json({ status: 'success', data: { rates: settings.rates } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'خطأ في تحديث أسعار التوصيل' });
  }
});

router.post('/vto', async (req, res) => {
  try {
    const { humanImage, productImage, category } = req.body;

    if (!humanImage || !productImage) {
      return res.status(400).json({ status: 'error', message: 'الصورة الشخصية وصورة المنتج مطلوبتان' });
    }

    console.log("جاري معالجة الصورة بالذكاء الاصطناعي عبر Hugging Face (Kolors)...");

    const humanRes = await fetch(humanImage);
    const humanBlob = await humanRes.blob();
    
    const productRes = await fetch(productImage);
    const productBlob = await productRes.blob();

    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error("لم يتم العثور على توكن Hugging Face. يرجى التأكد من حفظ ملف .env وإعادة تشغيل السيرفر.");
    }
    console.log("جاري الاتصال باستخدام توكن يبدأ بـ:", process.env.HUGGINGFACE_API_KEY.substring(0, 7) + "...");

    const app = await Client.connect("fashn-ai/fashn-vton-1.5", { hf_token: process.env.HUGGINGFACE_API_KEY });
    
    let mappedCategory = 'tops';
    if (category) {
        const catLower = category.toLowerCase();
        if (catLower.includes('bottom') || catLower.includes('pant') || catLower.includes('skirt')) {
            mappedCategory = 'bottoms';
        } else if (catLower.includes('dress') || catLower.includes('one-piece')) {
            mappedCategory = 'one-pieces';
        }
    }

    const result = await app.predict("/try_on", { 
      person_image: humanBlob,
      garment_image: productBlob,
      category: mappedCategory,
      garment_photo_type: "model",
      num_timesteps: 30,
      guidance_scale: 1.5,
      seed: 42,
      segmentation_free: true
    });

    console.log("تمت المعالجة بنجاح!");
    
    const imageUrl = result.data[0]?.url || result.data[0];

    res.json({ status: 'success', data: { resultImage: imageUrl } });
  } catch (error) {
    console.error('خطأ في الذكاء الاصطناعي:', error);
    
    if (error.message && error.message.includes('ZeroGPU quotas')) {
      return res.json({ 
        status: 'success', 
        mocked: true,
        message: 'عذراً، لقد انتهت الحصة المجانية لموديل الذكاء الاصطناعي (ZeroGPU). يرجى المحاولة لاحقاً.',
        data: { resultImage: req.body.productImage } 
      });
    }

    res.status(500).json({ status: 'error', message: error.message || 'حدث خطأ أثناء معالجة الصورة عبر Hugging Face' });
  }
});

export { router, Product, Order, Worker, User, FactoryClient, WholesaleOrder };
