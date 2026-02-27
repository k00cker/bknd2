// Router de Productos con endpoints mejorados y autorización
const express = require('express');
const { isAuthenticated, isAdmin } = require('../middlewares/authorization');

module.exports = (productManager) => {
  const router = express.Router();

  /**
   * GET / - Listar productos con paginación, filtros y ordenamiento
   * Query params:
   * - limit: cantidad de productos por página (default: 10)
   * - page: número de página (default: 1)
   * - query: filtro por categoría o disponibilidad
   * - sort: 'asc' o 'desc' para ordenar por precio
   */
  router.get('/', async (req, res) => {
    try {
      const { limit, page, query, sort } = req.query;

      const result = await productManager.getAllProducts({
        limit,
        page,
        query,
        sort,
      });

      res.json(result);
    } catch (error) {
      console.error('Error en GET /api/products:', error);
      res.status(500).json({
        status: 'error',
        error: error.message,
      });
    }
  });

  /**
   * GET /:pid - Obtener producto por ID
   */
  router.get('/:pid', async (req, res) => {
    try {
      const product = await productManager.getProductById(req.params.pid);
      res.json({ status: 'success', payload: product });
    } catch (error) {
      console.error('Error en GET /api/products/:pid:', error);
      if (error.message === 'ID de producto inválido') {
        return res.status(400).json({ status: 'error', error: error.message });
      }
      if (error.message === 'Producto no encontrado') {
        return res.status(404).json({ status: 'error', error: error.message });
      }
      res.status(500).json({ status: 'error', error: error.message });
    }
  });

  /**
   * POST / - Crear nuevo producto y emitir por websocket
   * Requiere: autenticación + rol admin
   */
  router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const newProduct = await productManager.addProduct(req.body);

      // Emitir a través de Socket.io
      const io = req.app.locals.io;
      if (io) {
        io.emit('productAdded', newProduct);
      }

      res.status(201).json({
        status: 'success',
        payload: newProduct,
        message: 'Producto creado exitosamente',
      });
    } catch (error) {
      console.error('Error en POST /api/products:', error);
      res.status(400).json({
        status: 'error',
        error: error.message,
      });
    }
  });

  /**
   * PUT /:pid - Actualizar producto
   * Requiere: autenticación + rol admin
   */
  router.put('/:pid', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);

      // Emitir actualización por Socket.io
      const io = req.app.locals.io;
      if (io) {
        io.emit('productUpdated', updatedProduct);
      }

      res.json({
        status: 'success',
        payload: updatedProduct,
        message: 'Producto actualizado exitosamente',
      });
    } catch (error) {
      console.error('Error en PUT /api/products/:pid:', error);
      if (error.message === 'ID de producto inválido') {
        return res.status(400).json({ status: 'error', error: error.message });
      }
      if (error.message === 'Producto no encontrado') {
        return res.status(404).json({ status: 'error', error: error.message });
      }
      res.status(400).json({ status: 'error', error: error.message });
    }
  });

  /**
   * DELETE /:pid - Eliminar producto y emitir por websocket
   * Requiere: autenticación + rol admin
   */
  router.delete('/:pid', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const deletedProduct = await productManager.deleteProduct(req.params.pid);

      // Emitir a través de Socket.io
      const io = req.app.locals.io;
      if (io) {
        io.emit('productDeleted', req.params.pid);
      }

      res.json({
        status: 'success',
        message: 'Producto eliminado exitosamente',
        payload: deletedProduct,
      });
    } catch (error) {
      console.error('Error en DELETE /api/products/:pid:', error);
      if (error.message === 'ID de producto inválido') {
        return res.status(400).json({ status: 'error', error: error.message });
      }
      if (error.message === 'Producto no encontrado') {
        return res.status(404).json({ status: 'error', error: error.message });
      }
      res.status(400).json({ status: 'error', error: error.message });
    }
  });

  return router;
};
