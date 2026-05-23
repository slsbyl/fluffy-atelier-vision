class ProductionController {
  constructor(productionService) {
    this.productionService = productionService;
  }

  createProduction = async (req, res) => {
    try {
      const newProduction = await this.productionService.createProduction(req.body);
      res.status(201).json({
        status: 'success',
        data: { production: newProduction }
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };

  getAllProductions = async (req, res) => {
    try {
      const productions = await this.productionService.getAllProductions();
      res.status(200).json({
        status: 'success',
        results: productions.length,
        data: { productions }
      });
    } catch (err) {
      res.status(404).json({ status: 'fail', message: err.message });
    }
  };

  getProduction = async (req, res) => {
    try {
      const production = await this.productionService.getProductionById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { production }
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };

  deleteProduction = async (req, res) => {
    try {
      await this.productionService.deleteProduction(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Production deleted successfully'
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };

  updateProduction = async (req, res) => {
    try {
      const production = await this.productionService.updateProduction(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        data: { production }
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };
}

module.exports = ProductionController;
