// Repository de Usuarios - Patrón Repository
const UserDAO = require('../daos/UserDAO');
const CartDAO = require('../daos/CartDAO');
const UserDTO = require('../dtos/UserDTO');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserRepository {
  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      const requiredFields = ['first_name', 'last_name', 'email', 'age', 'password'];
      for (const field of requiredFields) {
        if (!userData[field]) {
          throw new Error(`El campo "${field}" es obligatorio`);
        }
      }

      const existingUser = await UserDAO.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      const newCart = await CartDAO.create({ products: [] });

      const hashedPassword = bcrypt.hashSync(userData.password, 10);

      const newUser = await UserDAO.create({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        age: Number(userData.age),
        password: hashedPassword,
        cart: newCart._id,
        role: userData.role || 'user',
      });

      return new UserDTO(newUser).toJSON();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuario por email
   */
  async getUserByEmail(email) {
    try {
      const user = await UserDAO.findByEmail(email);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(id) {
    try {
      if (!this.isValidObjectId(id)) {
        throw new Error('ID de usuario inválido');
      }

      const user = await UserDAO.findById(id);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return new UserDTO(user).toJSON();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generar JWT token
   */
  generateToken(user) {
    try {
      const payload = {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'tu_secreto_jwt_aqui', {
        expiresIn: '24h',
      });

      return token;
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

module.exports = new UserRepository();
