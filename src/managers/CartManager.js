// CartManager refactorizado con Repository pattern
const CartRepository = require('../repositories/CartRepository');

class CartManager {
  /**
   * Crear nuevo carrito
   */
  async createCart() {
    try {
      return await CartRepository.createCart();
    } catch (error) {
      console.error('Error en createCart:', error);
      throw error;
    }
  }

  /**
   * Obtener carrito por ID
   */
  async getCartById(id) {
    try {
      return await CartRepository.getCartById(id);
    } catch (error) {
      console.error('Error en getCartById:', error);
      throw error;
    }
  }

  /**
   * Agregar producto al carrito
   */
  async addProductToCart(cartId, productId) {
    try {
      return await CartRepository.addProductToCart(cartId, productId);
    } catch (error) {
      console.error('Error en addProductToCart:', error);
      throw error;
    }
  }

  /**
   * Eliminar producto del carrito
   */
  async removeProductFromCart(cartId, productId) {
    try {
      return await CartRepository.removeProductFromCart(cartId, productId);
    } catch (error) {
      console.error('Error en removeProductFromCart:', error);
      throw error;
    }
  }

  /**
   * Actualizar cantidad de producto
   */
  async updateProductQuantity(cartId, productId, quantity) {
    try {
      return await CartRepository.updateProductQuantity(cartId, productId, quantity);
    } catch (error) {
      console.error('Error en updateProductQuantity:', error);
      throw error;
    }
  }

  /**
   * Actualizar carrito
   */
  async updateCart(cartId, products) {
    try {
      return await CartRepository.updateCart(cartId, products);
    } catch (error) {
      console.error('Error en updateCart:', error);
      throw error;
    }
  }

  /**
   * Limpiar carrito
   */
  async clearCart(cartId) {
    try {
      return await CartRepository.clearCart(cartId);
    } catch (error) {
      console.error('Error en clearCart:', error);
      throw error;
    }
  }
}

module.exports = CartManager;
