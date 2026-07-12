import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { Resend } from 'resend';

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ status: 'success', data: { orders } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching orders' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items, email, customerName, shippingFee } = req.body;
    // Basic stock check
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ status: 'error', message: `Stock not available for ${item.productName}` });
      }
    }

    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();

    // Decrement stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity, soldCount: item.quantity } });
    }

    // --- Send response to client immediately ---
    // The user should not wait for the email to be sent.
    res.status(201).json({ status: 'success', data: { order: savedOrder, orderId: savedOrder._id } });

    // --- Try to send the confirmation email in the background ---

    // --- Send Confirmation Email ---
    if (email && process.env.RESEND_API_KEY) {
      console.log(`Attempting to send confirmation email to: ${email} via Resend`);
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const hexToName = {
          '#ff0000': 'أحمر', '#0000ff': 'أزرق', '#008000': 'أخضر', '#000000': 'أسود',
          '#ffffff': 'أبيض', '#ffff00': 'أصفر', '#ffa500': 'برتقالي', '#ffc0cb': 'وردي',
          '#800080': 'بنفسجي', '#808080': 'رمادي', '#a52a2a': 'بني', '#000080': 'كحلي',
          '#f5f5dc': 'بيج', '#ffd700': 'ذهبي', '#c0c0c0': 'فضي'
        };

        let itemsHtml = '';
        for (const item of savedOrder.items) {
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

        const emailHtml = `
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
                      <td style="padding: 5px 0; font-weight: 600;">${savedOrder.totalAmount - (shippingFee || 0)} ج.م</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0;">مصاريف الشحن:</td>
                      <td style="padding: 5px 0; font-weight: 600;">${shippingFee || 0} ج.م</td>
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
            </div>`;

        await resend.emails.send({
          from: 'Fluffy Store <onboarding@resend.dev>',
          to: [email],
          subject: 'تم تأكيد طلبك من Fluffy',
          html: emailHtml,
        });

        console.log(`Confirmation email sent successfully to: ${email} via Resend.`);
      } catch (emailError) {
        console.error("Failed to send confirmation email via Resend:", emailError);
      }
    } else {
        console.log('Skipping email sending. Reason:');
        if (!email) console.log('- Email address was not provided in the order request.');
        if (!process.env.RESEND_API_KEY) console.log('- RESEND_API_KEY environment variable is not set on the server.');
    }
    // --- End Send Confirmation Email ---

  } catch (error) {
    // If an error happens before we send the response, send an error response.
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: error.message || 'Error creating order' });
    } else {
      // If the response has already been sent, we can only log the error.
      console.error("Error after response sent during order creation:", error);
    }
  }
};

export const restoreStock = async (req, res) => {
    try {
        const { items, orderId } = req.body;
        if (!items || !Array.isArray(items) || !orderId) {
            return res.status(400).json({ status: 'error', message: 'Invalid data for restoring stock.' });
        }

        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
        }

        // Find the order and update its status to 'Cancelled'
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: 'ملغي' }, // Using the Arabic status for consistency
            { new: true }
        );

        if (!updatedOrder) return res.status(404).json({ status: 'error', message: 'Order not found to update status.' });

        res.json({ status: 'success', message: 'Order has been cancelled and stock restored.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error restoring stock' });
    }
};
