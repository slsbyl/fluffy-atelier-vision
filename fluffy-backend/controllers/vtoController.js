class VTOController {
  constructor(vtoService) {
    this.vtoService = vtoService;
  }

  tryOn = async (req, res) => {
    try {
      const { humanImage, productImage, category } = req.body;
      const resultImage = await this.vtoService.tryOn(humanImage, productImage, category);
      res.status(200).json({
        status: 'success',
        data: {
          resultImage
        }
      });
    } catch (error) {
      console.error("VTO Error:", error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Something went wrong during virtual try-on'
      });
    }
  };
}

module.exports = VTOController;
