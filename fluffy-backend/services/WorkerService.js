class WorkerService {
  constructor(workerModel) {
    this.workerModel = workerModel;
  }

  async createWorker(data) {
    const { name, role, shift, status, salary, phone } = data;
    if (!name || !role || !shift || !salary) {
      throw new Error('Missing required fields');
    }
    return await this.workerModel.create({
      name, role, shift, status: status || 'Active', salary, phone
    });
  }

  async getAllWorkers() {
    return await this.workerModel.find().sort({ createdAt: -1 });
  }

  async getWorkerById(id) {
    const worker = await this.workerModel.findById(id);
    if (!worker) throw new Error('Worker not found');
    return worker;
  }

  async updateWorker(id, data) {
    const worker = await this.workerModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!worker) throw new Error('Worker not found');
    return worker;
  }

  async deleteWorker(id) {
    const worker = await this.workerModel.findByIdAndDelete(id);
    if (!worker) throw new Error('Worker not found');
    return worker;
  }
}

module.exports = WorkerService;
