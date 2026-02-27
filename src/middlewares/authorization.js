// Middleware de Autorización - Valida roles y permisos
const passport = require('passport');
const UserDTO = require('../dtos/UserDTO');

/**
 * Middleware que valida si el usuario está autenticado
 * Utiliza la estrategia 'current' de Passport
 */
const isAuthenticated = (req, res, next) => {
  passport.authenticate('current', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Error en autenticación',
      });
    }

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'No autenticado. Se requiere token válido',
      });
    }

    // Guardar usuario en request
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Middleware que valida si el usuario es administrador
 * Debe usarse después de isAuthenticated
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'No autenticado',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'No tienes permisos. Solo administradores pueden acceder a este recurso',
    });
  }

  next();
};

/**
 * Middleware que valida si el usuario es un usuario regular
 * Debe usarse después de isAuthenticated
 */
const isUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'No autenticado',
    });
  }

  if (req.user.role !== 'user') {
    return res.status(403).json({
      status: 'error',
      message: 'No tienes permisos para esta operación',
    });
  }

  next();
};

/**
 * Middleware que valida si el usuario es admin o el propietario del recurso
 * Parámetro: paramName - nombre del parámetro en req.params que contiene el ID a validar
 */
const isAdminOrOwner = (paramName = 'cid') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'No autenticado',
      });
    }

    // Admin puede acceder a cualquier recurso
    if (req.user.role === 'admin') {
      return next();
    }

    // Usuario regular solo puede acceder a su propio carrito
    if (req.user.role === 'user') {
      const resourceId = req.params[paramName];
      const userCartId = req.user.cart && req.user.cart._id ? req.user.cart._id.toString() : req.user.cart;

      if (resourceId !== userCartId) {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permisos para acceder a este carrito',
        });
      }
      return next();
    }

    return res.status(403).json({
      status: 'error',
      message: 'No tienes permisos para esta operación',
    });
  };
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isUser,
  isAdminOrOwner,
};
