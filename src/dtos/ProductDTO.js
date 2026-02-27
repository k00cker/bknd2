// DTO para Producto
class ProductDTO {
  constructor(product) {
    this.id = product._id;
    this.title = product.title;
    this.description = product.description;
    this.code = product.code;
    this.price = product.price;
    this.stock = product.stock;
    this.category = product.category;
    this.status = product.status;
    this.thumbnails = product.thumbnails || [];
  }

  toJSON() {
    return {
      _id: this.id,
      title: this.title,
      description: this.description,
      code: this.code,
      price: this.price,
      stock: this.stock,
      category: this.category,
      status: this.status,
      thumbnails: this.thumbnails,
    };
  }
}

module.exports = ProductDTO;
