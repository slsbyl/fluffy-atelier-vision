class ProductionService {
  constructor(productionModel) {
    this.productionModel = productionModel;
  }

  async createProduction(data) {
    return await this.productionModel.create(data);
  }

  async getAllProductions() {
    return await this.productionModel.find().populate('product').populate('assignedWorkers');
  }

  async getProductionById(id) {
    const production = await this.productionModel.findById(id).populate('product').populate('assignedWorkers');
    if (!production) throw new Error('Production not found');
    return production;
  }

  async updateProduction(id, data) {
    const production = await this.productionModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
    if (!production) throw new Error('Production not found');
    return production;
  }

  async deleteProduction(id) {
    const production = await this.productionModel.findByIdAndDelete(id);
    if (!production) throw new Error('Production not found');
    return production;
  }
}

module.exports = ProductionService;
