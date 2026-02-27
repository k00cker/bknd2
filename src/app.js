const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('dotenv').config();

const { connectDB } = require('./db/connection');
const ProductManager = require('./managers/ProductManager');
const CartManager = require('./managers/CartManager');
const UserManager = require('./managers/UserManager');
const TicketService = require('./services/TicketService');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views');
const sessionsRouter = require('./routes/sessions');
const initializePassport = require('./config/passport');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8080;

// Handlebars configuration and helpers
const handlebarsEngine = require('express-handlebars').engine({
  defaultLayout: 'main',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  },
  helpers: {
    // Helper para multiplicar dos números
    multiply: (a, b) => a * b,
    // Helper para suma
    sum: (a, b) => a + b,
    // Helper para comparación de igualdad
    equal: (a, b) => a === b,
    // Helper para cálculo de total
    calcularTotal: (products, tipo) => {
      if (!products || products.length === 0) return 0;
      if (tipo === 'cantidad') {
        return products.reduce((total, item) => total + (item.quantity || 0), 0);
      } else if (tipo === 'precio') {
        return products.reduce((total, item) => {
          const price = item.product && item.product.price ? item.product.price : 0;
          const qty = item.quantity || 0;
          return total + (price * qty);
        }, 0).toFixed(2);
      }
      return 0;
    },
    // Helper para generar números de página
    getPageNumbers: (currentPage, totalPages) => {
      const pages = [];
      const maxShow = 5;
      let start = Math.max(1, currentPage - Math.floor(maxShow / 2));
      let end = Math.min(totalPages, start + maxShow - 1);
      
      if (end - start < maxShow - 1) {
        start = Math.max(1, end - maxShow + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push({ number: i, active: i === currentPage });
      }
      return pages;
    }
  }
});

app.engine('handlebars', handlebarsEngine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Inicializar Passport
initializePassport(passport);
app.use(passport.initialize());

// Inicializar managers
const productManager = new ProductManager();
const cartManager = new CartManager();
const userManager = new UserManager();

// Inicializar conexión a BD y configurar routers
async function initializeApp() {
  try {
    // Conectar a MongoDB
    await connectDB();
    console.log('✓ MongoDB conectado exitosamente');

    // Hacer managers accesibles en los routers y Socket.io
    app.locals.productManager = productManager;
    app.locals.cartManager = cartManager;
    app.locals.userManager = userManager;
    app.locals.io = io;
    app.locals.ticketService = TicketService;

    console.log('✓ Managers configurados en app.locals');

    // Registrar routers
    console.log('Registrando routers...');
    try {
      app.use('/api/products', productsRouter(productManager));
      console.log('✓ Router productos registrado');
    } catch (e) {
      console.error('✗ Error registrando router productos:', e.message);
      throw e;
    }
    
    try {
      app.use('/api/carts', cartsRouter(cartManager, productManager));
      console.log('✓ Router carts registrado');
    } catch (e) {
      console.error('✗ Error registrando router carts:', e.message);
      throw e;
    }

    try {
      app.use('/api/sessions', sessionsRouter(userManager));
      console.log('✓ Router sessions registrado');
    } catch (e) {
      console.error('✗ Error registrando router sessions:', e.message);
      throw e;
    }
    
    try {
      app.use('/', viewsRouter(productManager, cartManager));
      console.log('✓ Router vistas registrado');
    } catch (e) {
      console.error('✗ Error registrando router vistas:', e.message);
      throw e;
    }

    // Ruta de prueba
    app.get('/api', (req, res) => {
      console.log('GET /api llamado');
      res.json({ message: 'Servidor de e-commerce activo en puerto ' + PORT });
    });

    // Error handling para las vistas
    app.use((err, req, res, next) => {
      console.error('Error en middleware:', err);
      res.status(500).json({ error: err.message });
    });

    // Socket.io connection
    io.on('connection', (socket) => {
      console.log('Cliente conectado:', socket.id);

      // Enviar productos al conectar
      productManager.getProductsSync().then(products => {
        socket.emit('loadProducts', products);
      });

      // Recibir crear producto desde websocket
      socket.on('addProduct', async (productData) => {
        try {
          const newProduct = await productManager.addProduct(productData);
          // Emitir a todos los clientes conectados
          io.emit('productAdded', newProduct);
        } catch (error) {
          socket.emit('error', error.message);
        }
      });

      // Recibir eliminar producto desde websocket
      socket.on('deleteProduct', async (productId) => {
        try {
          await productManager.deleteProduct(productId);
          // Emitir a todos los clientes conectados
          io.emit('productDeleted', productId);
        } catch (error) {
          socket.emit('error', error.message);
        }
      });

      socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
      });
    });

    // Iniciar servidor
    console.log(`Iniciando escucha en puerto ${PORT}`);

    // Ruta de prueba simple
    app.get('/test', (req, res) => {
      console.log('GET /test llamado');
      res.json({ test: 'ok' });
    });
  } catch (err) {
    console.error('Error inicializando aplicación:', err);
    process.exit(1);
  }
}

// Inicializar managers y routers, luego escuchar
initializeApp().then(() => {
  server.listen(PORT, () => {
    console.log(`✓ Servidor escuchando en puerto ${PORT}`);
  });
}).catch(error => {
  console.error('Error al inicializar la aplicación:', error);
  process.exit(1);
});

// Manejadores de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = { app, server, io };

