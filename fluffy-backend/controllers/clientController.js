class ClientController {
  constructor(clientService) {
    this.clientService = clientService;
  }

  createClient = async (req, res) => {
    try {
      const client = await this.clientService.createClient(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Factory client created successfully',
        data: { client }
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };

  getAllClients = async (req, res) => {
    try {
      const clients = await this.clientService.getAllClients();
      res.status(200).json({
        status: 'success',
        results: clients.length,
        data: { clients }
      });
    } catch (err) {
      res.status(404).json({ status: 'fail', message: err.message });
    }
  };

  getClient = async (req, res) => {
    try {
      const client = await this.clientService.getClientById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { client }
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };

  updateClient = async (req, res) => {
    try {
      const client = await this.clientService.updateClient(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        data: { client }
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };

  deleteClient = async (req, res) => {
    try {
      await this.clientService.deleteClient(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Factory client deleted successfully'
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };
}

module.exports = ClientController;
