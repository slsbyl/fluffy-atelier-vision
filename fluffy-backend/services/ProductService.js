class ProductService {
  constructor(productModel) {
    this.productModel = productModel;
  }

  async createProduct(data) {
    console.log('Data received in createProduct:', JSON.stringify(data, null, 2));
    const productData = {
      name: data.name,
      price: data.price,
      description: data.description,
      category: data.category,
      brand: data.brand,
      stock: data.stock,
      sizes: data.sizes,
      colors: data.colors,
      images: data.images,
      image: data.image,
      inStock: data.inStock
    };
    return await this.productModel.create(productData);
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
    console.log(`Data received in updateProduct for id ${id}:`, JSON.stringify(data, null, 2));
    const productData = {
      name: data.name,
      price: data.price,
      description: data.description,
      category: data.category,
      brand: data.brand,
      stock: data.stock,
      sizes: data.sizes,
      colors: data.colors,
      images: data.images,
      image: data.image,
      inStock: data.inStock
    };
    const product = await this.productModel.findByIdAndUpdate(id, productData, {
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
