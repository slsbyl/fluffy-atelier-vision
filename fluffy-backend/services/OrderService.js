const Order = require('../models/Order');
const Product = require('../models/Product');

class OrderService {
  
  constructor(orderModel, productModel) {
    this.orderModel = orderModel;
    this.productModel = productModel;
  }

  async createOrder(orderData) {
    const { customerName, address, phone, items, shippingFee, governorate } = orderData;

    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

   
    for (let item of items) {
      if (item.productId) {
        const product = await this.productModel.findById(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productName} not found`);
        }
        item.price = product.price;
      }
    }

    const newOrder = await this.orderModel.create({
      customerName,
      address,
      phone,
      governorate,
      shippingFee: Number(shippingFee) || 0,
      items
    });

    return newOrder;
  }

  async getAllOrders() {
    return await this.orderModel.find().sort({ createdAt: -1 });
  }

  async getOrderById(id) {
    return await this.orderModel.findById(id);
  }

  async updateOrder(id, updateData) {
    return await this.orderModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async deleteOrder(id) {
    return await this.orderModel.findByIdAndDelete(id);
  }
}

module.exports = OrderService;
