
const Order = require('./models/Order');
const Product = require('./models/Product');
const OrderService = require('./services/OrderService');
const OrderController = require('./controllers/orderController');

class DIContainer {
  constructor() {
    this.dependencies = {};
  }

  register(name, dependency) {
    this.dependencies[name] = dependency;
  }

  resolve(name) {
    if (!this.dependencies[name]) {
      throw new Error(`Dependency ${name} not found`);
    }
    return this.dependencies[name];
  }
}


const container = new DIContainer();


container.register('OrderModel', Order);
container.register('ProductModel', Product);


const orderService = new OrderService(
  container.resolve('OrderModel'),
  container.resolve('ProductModel')
);
container.register('OrderService', orderService);

const orderController = new OrderController(
  container.resolve('OrderService')
);
container.register('OrderController', orderController);

module.exports = container;
