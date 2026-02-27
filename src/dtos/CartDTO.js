// DTO para Carrito
class CartDTO {
  constructor(cart) {
    this.id = cart._id;
    this.products = cart.products || [];
    this.createdAt = cart.createdAt;
    this.updatedAt = cart.updatedAt;
  }

  toJSON() {
    return {
      _id: this.id,
      products: this.products,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = CartDTO;
