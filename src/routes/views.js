// Router de Vistas para renderizar handlebars
const express = require('express');

module.exports = (productManager, cartManager) => {
  const router = express.Router();

  /**
   * GET / - Vista Home con lista de productos
   */
  router.get('/', async (req, res, next) => {
    try {
      console.log('GET / llamado - intentando obtener productos');
      const result = await productManager.getAllProducts({
        limit: 10,
        page: 1,
      });
      console.log(`Productos obtenidos: ${result.payload.length}`);
      console.log('Renderizando home.handlebars');
      res.render('home', { products: result.payload }, (err, html) => {
        if (err) {
          console.error('Error renderizando home:', err);
          return next(err);
        }
        console.log('HTML generado, enviando respuesta');
        res.send(html);
      });
    } catch (error) {
      console.error('Error en GET /:', error);
      next(error);
    }
  });

  /**
   * GET /products - Vista de productos con paginación
   */
  router.get('/products', async (req, res, next) => {
    try {
      console.log('GET /products llamado');
      const { limit = 10, page = 1, query, sort } = req.query;

      const result = await productManager.getAllProducts({
        limit,
        page,
        query,
        sort,
      });

      res.render('products', {
        products: result.payload,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.prevLink,
        nextLink: result.nextLink,
      }, (err, html) => {
        if (err) {
          console.error('Error renderizando products:', err);
          return next(err);
        }
        res.send(html);
      });
    } catch (error) {
      console.error('Error en GET /products:', error);
      next(error);
    }
  });

  /**
   * GET /products/:pid - Vista de detalle de producto individual
   */
  router.get('/products/:pid', async (req, res, next) => {
    try {
      console.log('GET /products/:pid llamado para producto:', req.params.pid);
      
      const product = await productManager.getProductById(req.params.pid);

      res.render('productDetail', {
        product: product,
      }, (err, html) => {
        if (err) {
          console.error('Error renderizando productDetail:', err);
          return next(err);
        }
        res.send(html);
      });
    } catch (error) {
      console.error('Error en GET /products/:pid:', error);
      if (error.message === 'Producto no encontrado') {
        return res.status(404).render('error', {
          message: 'Producto no encontrado'
        });
      }
      next(error);
    }
  });

  /**
   * GET /carts/:cid - Vista de carrito específico
   */
  router.get('/carts/:cid', async (req, res, next) => {
    try {
      console.log('GET /carts/:cid llamado para carrito:', req.params.cid);
      
      const cart = await cartManager.getCartById(req.params.cid);

      res.render('cart', {
        cart: cart,
        products: cart.products,
      }, (err, html) => {
        if (err) {
          console.error('Error renderizando cart:', err);
          return next(err);
        }
        res.send(html);
      });
    } catch (error) {
      console.error('Error en GET /carts/:cid:', error);
      if (error.message === 'Carrito no encontrado') {
        return res.status(404).render('error', {
          message: 'Carrito no encontrado'
        });
      }
      next(error);
    }
  });

  /**
   * GET /realtimeproducts - Vista con WebSockets
   */
  router.get('/realtimeproducts', async (req, res, next) => {
    try {
      console.log('GET /realtimeproducts llamado');
      res.render('realTimeProducts', {}, (err, html) => {
        if (err) {
          console.error('Error renderizando realTimeProducts:', err);
          return next(err);
        }
        res.send(html);
      });
    } catch (error) {
      console.error('Error en GET /realtimeproducts:', error);
      next(error);
    }
  });

  return router;
};

