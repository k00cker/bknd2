// Repository de Productos - Patrón Repository
const ProductDAO = require('../daos/ProductDAO');
const ProductDTO = require('../dtos/ProductDTO');

class ProductRepository {
  /**
   * Obtener todos los productos con paginación y filtros
   */
  async getAllProducts(options = {}) {
    try {
      const { limit = 10, page = 1, query = '', sort = '' } = options;

      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, parseInt(limit) || 10);

      // Construir filtro
      const filter = {};
      if (query) {
        if (query.toLowerCase() === 'disponible' || query.toLowerCase() === 'true') {
          filter.status = true;
        } else if (query.toLowerCase() === 'no disponible' || query.toLowerCase() === 'false') {
          filter.status = false;
        } else {
          filter.category = { $regex: query, $options: 'i' };
        }
      }

      // Construir ordenamiento
      const sortOptions = {};
      if (sort === 'asc') {
        sortOptions.price = 1;
      } else if (sort === 'desc') {
        sortOptions.price = -1;
      }

      const skip = (pageNum - 1) * limitNum;
      const totalProducts = await ProductDAO.countDocuments(filter);
      const totalPages = Math.ceil(totalProducts / limitNum);

      if (pageNum > totalPages && totalProducts > 0) {
        return {
          status: 'success',
          payload: [],
          totalPages,
          prevPage: pageNum > 1 ? pageNum - 1 : null,
          nextPage: null,
          page: pageNum,
          hasPrevPage: pageNum > 1,
          hasNextPage: false,
        };
      }

      const products = await ProductDAO.findAll(filter, {
        limit: limitNum,
        skip,
        sort: sortOptions,
      });

      const productsDTO = products.map(p => new ProductDTO(p).toJSON());

      return {
        status: 'success',
        payload: productsDTO,
        totalPages,
        prevPage: pageNum > 1 ? pageNum - 1 : null,
        nextPage: pageNum < totalPages ? pageNum + 1 : null,
        page: pageNum,
        hasPrevPage: pageNum > 1,
        hasNextPage: pageNum < totalPages,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener producto por ID
   */
  async getProductById(id) {
    try {
      if (!this.isValidObjectId(id)) {
        throw new Error('ID de producto inválido');
      }

      const product = await ProductDAO.findById(id);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      return new ProductDTO(product).toJSON();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear producto
   */
  async createProduct(productData) {
    try {
      const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
      for (const field of requiredFields) {
        if (!productData[field]) {
          throw new Error(`El campo "${field}" es obligatorio`);
        }
      }

      const existingProduct = await ProductDAO.findByCode(productData.code);
      if (existingProduct) {
        throw new Error(`Ya existe un producto con el código "${productData.code}"`);
      }

      const newProduct = await ProductDAO.create({
        title: productData.title,
        description: productData.description,
        code: productData.code,
        price: Number(productData.price),
        status: productData.status !== undefined ? productData.status : true,
        stock: Number(productData.stock),
        category: productData.category.toLowerCase(),
        thumbnails: productData.thumbnails || [],
      });

      return new ProductDTO(newProduct).toJSON();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar producto
   */
  async updateProduct(id, updateData) {
    try {
      if (!this.isValidObjectId(id)) {
        throw new Error('ID de producto inválido');
      }

      delete updateData._id;
      delete updateData.id;
      delete updateData.code;

      if (updateData.category) {
        updateData.category = updateData.category.toLowerCase();
      }

      if (updateData.price !== undefined) {
        updateData.price = Number(updateData.price);
      }
      if (updateData.stock !== undefined) {
        updateData.stock = Number(updateData.stock);
      }

      const updatedProduct = await ProductDAO.update(id, updateData);
      if (!updatedProduct) {
        throw new Error('Producto no encontrado');
      }

      return new ProductDTO(updatedProduct).toJSON();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar producto
   */
  async deleteProduct(id) {
    try {
      if (!this.isValidObjectId(id)) {
        throw new Error('ID de producto inválido');
      }

      const deletedProduct = await ProductDAO.delete(id);
      if (!deletedProduct) {
        throw new Error('Producto no encontrado');
      }

      return new ProductDTO(deletedProduct).toJSON();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los productos (sin paginación)
   */
  async getAllProductsSync() {
    try {
      const products = await ProductDAO.findAll({}, { limit: 10000, skip: 0 });
      return products.map(p => new ProductDTO(p).toJSON());
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

module.exports = new ProductRepository();
