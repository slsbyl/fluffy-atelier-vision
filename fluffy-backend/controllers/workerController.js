class WorkerController {
  constructor(workerService) {
    this.workerService = workerService;
  }

  createWorker = async (req, res) => {
    try {
      const worker = await this.workerService.createWorker(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Worker created successfully',
        data: { worker }
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };

  getAllWorkers = async (req, res) => {
    try {
      const workers = await this.workerService.getAllWorkers();
      res.status(200).json({
        status: 'success',
        results: workers.length,
        data: { workers }
      });
    } catch (err) {
      res.status(404).json({ status: 'fail', message: err.message });
    }
  };

  getWorker = async (req, res) => {
    try {
      const worker = await this.workerService.getWorkerById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { worker }
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };

  updateWorker = async (req, res) => {
    try {
      const worker = await this.workerService.updateWorker(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        data: { worker }
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };

  deleteWorker = async (req, res) => {
    try {
      await this.workerService.deleteWorker(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Worker deleted successfully'
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };
}

module.exports = WorkerController;
