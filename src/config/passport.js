// Configuración de estrategias de Passport
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const User = require('../db/User');

module.exports = (passport) => {
  /**
   * ESTRATEGIA LOCAL - Para login
   * Verifica email y contraseña
   */
  passport.use(
    'login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });

          if (!user) {
            return done(null, false, {
              message: 'El usuario no existe',
            });
          }

          // Comparar contraseñas
          if (!user.comparePassword(password)) {
            return done(null, false, {
              message: 'Contraseña incorrecta',
            });
          }

          // Usuario autenticado correctamente
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  /**
   * ESTRATEGIA JWT - Para validar token
   * Extrae el token de la cookie y verifica su validez
   */
  passport.use(
    'jwt',
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([
          // Primero intenta extraer de la cookie
          (req) => {
            if (req && req.cookies) {
              return req.cookies.token;
            }
            return null;
          },
          // Si no hay cookie, intenta del header Authorization
          ExtractJWT.fromAuthHeaderAsBearerToken(),
        ]),
        secretOrKey: process.env.JWT_SECRET || 'tu_secreto_jwt_aqui',
      },
      async (payload, done) => {
        try {
          // payload contiene los datos del usuario que se guardaron al crear el token
          return done(null, payload);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  /**
   * ESTRATEGIA CURRENT - Para obtener usuario actual desde el token
   * Extrae el token de la cookie y retorna el usuario asociado
   */
  passport.use(
    'current',
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([
          // Extrae el token de la cookie
          (req) => {
            if (req && req.cookies) {
              return req.cookies.token;
            }
            return null;
          },
        ]),
        secretOrKey: process.env.JWT_SECRET || 'tu_secreto_jwt_aqui',
      },
      async (payload, done) => {
        try {
          // Buscar el usuario completo en la base de datos
          const user = await User.findById(payload.id).populate('cart');

          if (!user) {
            return done(null, false);
          }

          // Retornar los datos del usuario sin la contraseña
          return done(null, user.toJSON());
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  /**
   * Serializar usuario - para mantener la sesión
   */
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  /**
   * Deserializar usuario - para recuperar la sesión
   */
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
