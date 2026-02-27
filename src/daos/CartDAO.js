// DAO para Carritos - Acceso a datos
const Cart = require('../db/Cart');

class CartDAO {
  async findById(id) {
    try {
      return await Cart.findById(id).populate('products.product').lean();
    } catch (error) {
      throw error;
    }
  }

  async create(cartData = {}) {
    try {
      const cart = new Cart(cartData);
      const savedCart = await cart.save();
      return savedCart.toObject();
    } catch (error) {
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      return await Cart.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate('products.product');
    } catch (error) {
      throw error;
    }
  }

  async addProduct(id, productId, quantity = 1) {
    try {
      const cart = await Cart.findById(id);
      if (!cart) throw new Error('Carrito no encontrado');

      const existingProduct = cart.products.find(
        (p) => p.product.toString() === productId
      );

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }

      const updated = await cart.save();
      await updated.populate('products.product');
      return updated.toObject();
    } catch (error) {
      throw error;
    }
  }

  async removeProduct(id, productId) {
    try {
      const cart = await Cart.findById(id);
      if (!cart) throw new Error('Carrito no encontrado');

      cart.products = cart.products.filter(
        (p) => p.product.toString() !== productId
      );

      const updated = await cart.save();
      await updated.populate('products.product');
      return updated.toObject();
    } catch (error) {
      throw error;
    }
  }

  async updateProductQuantity(id, productId, quantity) {
    try {
      const cart = await Cart.findById(id);
      if (!cart) throw new Error('Carrito no encontrado');

      const product = cart.products.find(
        (p) => p.product.toString() === productId
      );
      if (!product) throw new Error('Producto no encontrado en el carrito');

      product.quantity = quantity;
      const updated = await cart.save();
      await updated.populate('products.product');
      return updated.toObject();
    } catch (error) {
      throw error;
    }
  }

  async clear(id) {
    try {
      return await Cart.findByIdAndUpdate(
        id,
        { products: [] },
        { new: true }
      ).populate('products.product');
    } catch (error) {
      throw error;
    }
  }

  async updateProducts(id, products) {
    try {
      return await Cart.findByIdAndUpdate(
        id,
        { products },
        { new: true, runValidators: true }
      ).populate('products.product');
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CartDAO();
