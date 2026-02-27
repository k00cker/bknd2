// ProductManager refactorizado con Repository pattern
const ProductRepository = require('../repositories/ProductRepository');

class ProductManager {
  /**
   * Obtener todos los productos con paginación, filtros y ordenamiento
   */
  async getAllProducts(options = {}) {
    try {
      return await ProductRepository.getAllProducts(options);
    } catch (error) {
      console.error('Error en getAllProducts:', error);
      throw error;
    }
  }

  /**
   * Obtener producto por ID
   */
  async getProductById(id) {
    try {
      return await ProductRepository.getProductById(id);
    } catch (error) {
      console.error('Error en getProductById:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo producto
   */
  async addProduct(productData) {
    try {
      return await ProductRepository.createProduct(productData);
    } catch (error) {
      console.error('Error en addProduct:', error);
      throw error;
    }
  }

  /**
   * Actualizar producto
   */
  async updateProduct(id, updateData) {
    try {
      return await ProductRepository.updateProduct(id, updateData);
    } catch (error) {
      console.error('Error en updateProduct:', error);
      throw error;
    }
  }

  /**
   * Eliminar producto
   */
  async deleteProduct(id) {
    try {
      return await ProductRepository.deleteProduct(id);
    } catch (error) {
      console.error('Error en deleteProduct:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los productos (sin paginación)
   */
  async getProductsSync() {
    try {
      return await ProductRepository.getAllProductsSync();
    } catch (error) {
      console.error('Error en getProductsSync:', error);
      return [];
    }
  }
}

module.exports = ProductManager;
