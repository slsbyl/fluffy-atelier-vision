const FactoryClient = require('./models/FactoryClient');
const Order = require('./models/Order');
const Product = require('./models/Product');
const Production = require('./models/Production');
const User = require('./models/User');
const Worker = require('./models/Worker');

const AuthService = require('./services/AuthService');
const ClientService = require('./services/ClientService');
const OrderService = require('./services/OrderService');
const ProductService = require('./services/ProductService');
const ProductionService = require('./services/ProductionService');
const VTOService = require('./services/VTOService');
const WorkerService = require('./services/WorkerService');

const AuthController = require('./controllers/authController');
const ClientController = require('./controllers/clientController');
const OrderController = require('./controllers/orderController');
const ProductController = require('./controllers/productController');
const ProductionController = require('./controllers/productionController');
const VTOController = require('./controllers/vtoController');
const WorkerController = require('./controllers/workerController');

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

// Register Models
container.register('FactoryClientModel', FactoryClient);
container.register('OrderModel', Order);
container.register('ProductModel', Product);
container.register('ProductionModel', Production);
container.register('UserModel', User);
container.register('WorkerModel', Worker);

// Register Services
container.register('AuthService', new AuthService(container.resolve('UserModel')));
container.register('ClientService', new ClientService(container.resolve('FactoryClientModel')));
container.register('OrderService', new OrderService(container.resolve('OrderModel'), container.resolve('ProductModel')));
container.register('ProductService', new ProductService(container.resolve('ProductModel')));
container.register('ProductionService', new ProductionService(container.resolve('ProductionModel')));
container.register('VTOService', new VTOService());
container.register('WorkerService', new WorkerService(container.resolve('WorkerModel')));

// Register Controllers
container.register('AuthController', new AuthController(container.resolve('AuthService')));
container.register('ClientController', new ClientController(container.resolve('ClientService')));
container.register('OrderController', new OrderController(container.resolve('OrderService')));
container.register('ProductController', new ProductController(container.resolve('ProductService')));
container.register('ProductionController', new ProductionController(container.resolve('ProductionService')));
container.register('VTOController', new VTOController(container.resolve('VTOService')));
container.register('WorkerController', new WorkerController(container.resolve('WorkerService')));

module.exports = container;
