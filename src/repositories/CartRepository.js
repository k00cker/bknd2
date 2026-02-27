// Repository de Carritos - Patrón Repository
const CartDAO = require('../daos/CartDAO');
const ProductDAO = require('../daos/ProductDAO');
const CartDTO = require('../dtos/CartDTO');

class CartRepository {
  /**
   * Crear carrito
   */
  async createCart() {
    try {
      const newCart = await CartDAO.create({ products: [] });
      return new CartDTO(newCart).toJSON();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener carrito por ID
   */
  async getCartById(id) {
    try {
      if (!this.isValidObjectId(id)) {
        throw new Error('ID de carrito inválido');
      }

      const cart = await CartDAO.findById(id);
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      return cart;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Agregar producto al carrito
   */
  async addProductToCart(cartId, productId) {
    try {
      if (!this.isValidObjectId(cartId) || !this.isValidObjectId(productId)) {
        throw new Error('ID inválido');
      }

      const product = await ProductDAO.findById(productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const updatedCart = await CartDAO.addProduct(cartId, productId);
      return updatedCart;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar producto del carrito
   */
  async removeProductFromCart(cartId, productId) {
    try {
      if (!this.isValidObjectId(cartId) || !this.isValidObjectId(productId)) {
        throw new Error('ID inválido');
      }

      const updatedCart = await CartDAO.removeProduct(cartId, productId);
      return updatedCart;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar cantidad de producto en carrito
   */
  async updateProductQuantity(cartId, productId, quantity) {
    try {
      if (!this.isValidObjectId(cartId) || !this.isValidObjectId(productId)) {
        throw new Error('ID inválido');
      }

      const quantityNum = parseInt(quantity);
      if (isNaN(quantityNum) || quantityNum < 1) {
        throw new Error('La cantidad debe ser un número mayor a 0');
      }

      const updatedCart = await CartDAO.updateProductQuantity(cartId, productId, quantityNum);
      return updatedCart;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar carrito con array de productos
   */
  async updateCart(cartId, products) {
    try {
      if (!this.isValidObjectId(cartId)) {
        throw new Error('ID de carrito inválido');
      }

      if (!Array.isArray(products)) {
        throw new Error('Los productos deben ser un array');
      }

      for (const item of products) {
        if (!item.product || !item.quantity) {
          throw new Error('Cada producto debe tener "product" (ID) y "quantity"');
        }
        if (!this.isValidObjectId(item.product)) {
          throw new Error(`ID de producto inválido: ${item.product}`);
        }
        if (parseInt(item.quantity) < 1) {
          throw new Error('La cantidad debe ser mayor a 0');
        }
      }

      const updatedCart = await CartDAO.updateProducts(cartId, products);
      return updatedCart;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Limpiar carrito
   */
  async clearCart(cartId) {
    try {
      if (!this.isValidObjectId(cartId)) {
        throw new Error('ID de carrito inválido');
      }

      const clearedCart = await CartDAO.clear(cartId);
      return clearedCart;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validar ObjectId
   */
  isValidObjectId(id) {
    return String(id).match(/^[0-9a-fA-F]{24}$/) !== null;
  }
}

module.exports = new CartRepository();
