// UserManager refactorizado con Repository pattern
const UserRepository = require('../repositories/UserRepository');
const UserDTO = require('../dtos/UserDTO');

class UserManager {
  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      return await UserRepository.register(userData);
    } catch (error) {
      console.error('Error en register:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por email
   */
  async getUserByEmail(email) {
    try {
      return await UserRepository.getUserByEmail(email);
    } catch (error) {
      console.error('Error en getUserByEmail:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(id) {
    try {
      return await UserRepository.getUserById(id);
    } catch (error) {
      console.error('Error en getUserById:', error);
      throw error;
    }
  }

  /**
   * Generar JWT token
   */
  generateToken(user) {
    try {
      return UserRepository.generateToken(user);
    } catch (error) {
      console.error('Error en generateToken:', error);
      throw error;
    }
  }

  /**
   * Obtener DTO del usuario (sin información sensible)
   */
  getUserDTO(user) {
    try {
      return new UserDTO(user).toJSON();
    } catch (error) {
      console.error('Error en getUserDTO:', error);
      throw error;
    }
  }
}

module.exports = UserManager;
