// DAO para Usuarios - Acceso a datos
const User = require('../db/User');

class UserDAO {
  async findById(id) {
    try {
      return await User.findById(id).populate('cart').lean();
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      return await User.findOne({ email }).populate('cart');
    } catch (error) {
      throw error;
    }
  }

  async create(userData) {
    try {
      const user = new User(userData);
      const savedUser = await user.save();
      return await savedUser.populate('cart');
    } catch (error) {
      throw error;
    }
  }

  async findAll(filter = {}, options = {}) {
    try {
      const { limit = 10, skip = 0 } = options;
      return await User.find(filter)
        .skip(skip)
        .limit(limit)
        .populate('cart')
        .lean();
    } catch (error) {
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      return await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate('cart');
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserDAO();
