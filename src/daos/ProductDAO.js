// DAO para Productos - Acceso a datos
const Product = require('../db/Product');

class ProductDAO {
  async findAll(filter = {}, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = {} } = options;
      const products = await Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();
      return products;
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      return await Product.findById(id).lean();
    } catch (error) {
      throw error;
    }
  }

  async findByCode(code) {
    try {
      return await Product.findOne({ code }).lean();
    } catch (error) {
      throw error;
    }
  }

  async countDocuments(filter = {}) {
    try {
      return await Product.countDocuments(filter);
    } catch (error) {
      throw error;
    }
  }

  async create(productData) {
    try {
      const product = new Product(productData);
      const savedProduct = await product.save();
      return savedProduct.toObject();
    } catch (error) {
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      return await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).lean();
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      return await Product.findByIdAndDelete(id).lean();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProductDAO();
