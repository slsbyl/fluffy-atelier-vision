class OrderController {
  // Dependency Injection: OrderService is injected via constructor
  constructor(orderService) {
    this.orderService = orderService;
  }

  createOrder = async (req, res) => {
    try {
      const newOrder = await this.orderService.createOrder(req.body);
      res.status(201).json({
        status: 'success',
        data: { order: newOrder }
      });
    } catch (err) {
      const statusCode = err.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({ status: 'fail', message: err.message });
    }
  };

  getAllOrders = async (req, res) => {
    try {
      const orders = await this.orderService.getAllOrders();
      res.status(200).json({
        status: 'success',
        results: orders.length,
        data: { orders }
      });
    } catch (err) {
      res.status(404).json({ status: 'fail', message: err.message });
    }
  };

  getOrder = async (req, res) => {
    try {
      const order = await this.orderService.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({
          status: 'fail',
          message: 'Order not found'
        });
      }
      res.status(200).json({
        status: 'success',
        data: { order }
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };

  updateOrder = async (req, res) => {
    try {
      const order = await this.orderService.updateOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({
          status: 'fail',
          message: 'Order not found'
        });
      }
      res.status(200).json({
        status: 'success',
        data: { order }
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };

  deleteOrder = async (req, res) => {
    try {
      const order = await this.orderService.deleteOrder(req.params.id);
      if (!order) {
        return res.status(404).json({
          status: 'fail',
          message: 'Order not found'
        });
      }
      res.status(200).json({
        status: 'success',
        message: 'Order deleted successfully'
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };
}

module.exports = OrderController;
