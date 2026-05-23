class ProductService {
  constructor(productModel) {
    this.productModel = productModel;
  }

  async createProduct(data) {
    return await this.productModel.create(data);
  }

  async getAllProducts() {
    const products = await this.productModel.find();
    return products.map(p => {
      const productObj = p.toObject ? p.toObject() : p;
      return {
        ...productObj,
        inStock: productObj.stock > 0
      };
    });
  }

  async getProductById(id) {
    const product = await this.productModel.findById(id);
    if (!product) throw new Error('Product not found');
    const productObj = product.toObject ? product.toObject() : product;
    return {
      ...productObj,
      inStock: productObj.stock > 0
    };
  }

  async updateProduct(id, data) {
    const product = await this.productModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
    if (!product) throw new Error('Product not found');
    const productObj = product.toObject ? product.toObject() : product;
    return {
      ...productObj,
      inStock: productObj.stock > 0
    };
  }

  async deleteProduct(id) {
    const product = await this.productModel.findByIdAndDelete(id);
    if (!product) throw new Error('Product not found');
    return product;
  }
}

module.exports = ProductService;
