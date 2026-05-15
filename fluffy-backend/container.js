// Inversion of Control (IoC) Container
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

// Instantiate the container
const container = new DIContainer();

// 1. Register Data Access Layer (Models)
container.register('OrderModel', Order);
container.register('ProductModel', Product);

// 2. Register Business Logic Layer (Services)
// Injecting Models into the Service
const orderService = new OrderService(
  container.resolve('OrderModel'),
  container.resolve('ProductModel')
);
container.register('OrderService', orderService);

// 3. Register Presentation/Routing Layer (Controllers)
// Injecting Service into the Controller
const orderController = new OrderController(
  container.resolve('OrderService')
);
container.register('OrderController', orderController);

module.exports = container;
