// Router de Sessions - Autenticación y Autorización
const express = require('express');
const passport = require('passport');
const { isAuthenticated } = require('../middlewares/authorization');
const UserDTO = require('../dtos/UserDTO');

module.exports = (userManager) => {
  const router = express.Router();

  /**
   * POST /register - Registrar nuevo usuario
   * Body: { first_name, last_name, email, age, password }
   */
  router.post('/register', async (req, res) => {
    try {
      const { first_name, last_name, email, age, password } = req.body;

      // Validar campos obligatorios
      if (!first_name || !last_name || !email || !age || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Todos los campos son obligatorios',
        });
      }

      // Registrar usuario
      const newUser = await userManager.register({
        first_name,
        last_name,
        email,
        age: Number(age),
        password,
      });

      res.status(201).json({
        status: 'success',
        message: 'Usuario registrado exitosamente',
        payload: newUser,
      });
    } catch (error) {
      console.error('Error en POST /register:', error);

      if (error.message.includes('email ya está registrado')) {
        return res.status(409).json({
          status: 'error',
          message: error.message,
        });
      }

      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  });

  /**
   * POST /login - Autenticar usuario
   * Utiliza estrategia 'login' de Passport
   * Body: { email, password }
   */
  router.post(
    '/login',
    passport.authenticate('login', {
      session: false,
      failureMessage: true,
    }),
    async (req, res) => {
      try {
        // En este punto, el usuario ya fue autenticado por Passport
        const user = req.user;

        // Generar JWT token
        const token = userManager.generateToken(user);

        // Configurar cookie con el token
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000, // 24 horas
        });

        // Retornar DTO sin información sensible
        const userDTO = new UserDTO(user).toJSON();

        res.json({
          status: 'success',
          message: 'Usuario autenticado exitosamente',
          payload: {
            user: userDTO,
            token,
          },
        });
      } catch (error) {
        console.error('Error en POST /login:', error);
        res.status(500).json({
          status: 'error',
          message: error.message,
        });
      }
    }
  );

  // Middleware para manejar fallos de autenticación
  router.use('/login', (err, req, res, next) => {
    if (err) {
      return res.status(401).json({
        status: 'error',
        message: 'Error en autenticación',
      });
    }
    next();
  });

  /**
   * GET /current - Obtener usuario actual desde el JWT
   * Requiere token en cookie
   * Utiliza estrategia 'current' de Passport
   * Retorna DTO con solo información necesaria
   */
  router.get('/current', isAuthenticated, (req, res) => {
    try {
      // El middleware isAuthenticated ya validó y extrajo al usuario
      // req.user contiene los datos del usuario
      res.json({
        status: 'success',
        message: 'Usuario autenticado',
        payload: req.user, // Ya viene como DTO del strategy current
      });
    } catch (error) {
      console.error('Error en GET /current:', error);
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  });

  /**
   * GET /logout - Cerrar sesión
   * Limpia la cookie del token
   */
  router.get('/logout', (req, res) => {
    try {
      res.clearCookie('token');
      res.json({
        status: 'success',
        message: 'Sesión cerrada exitosamente',
      });
    } catch (error) {
      console.error('Error en GET /logout:', error);
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  });

  return router;
};
