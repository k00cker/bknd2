// Router de Carritos con endpoints completos y lógica de compra
const express = require('express');
const { isAuthenticated, isAdminOrOwner } = require('../middlewares/authorization');
const TicketService = require('../services/TicketService');

module.exports = (cartManager, productManager) => {
  const router = express.Router();

  /**
   * POST / - Crear nuevo carrito
   */
  router.post('/', async (req, res) => {
    try {
      const newCart = await cartManager.createCart();
      res.status(201).json({
        status: 'success',
        payload: newCart,
        message: 'Carrito creado exitosamente',
      });
    } catch (error) {
      console.error('Error en POST /api/carts:', error);
      res.status(500).json({ status: 'error', error: error.message });
    }
  });

  /**
   * GET /:cid - Obtener productos del carrito con populate
   * Permite obtener carritos anónimos o autenticados
   */
  router.get('/:cid', async (req, res) => {
    try {
      const cart = await cartManager.getCartById(req.params.cid);
      res.json({
        status: 'success',
        payload: cart,
      });
    } catch (error) {
      console.error('Error en GET /api/carts/:cid:', error);
      if (error.message === 'ID de carrito inválido') {
        return res.status(400).json({ status: 'error', error: error.message });
      }
      if (error.message === 'Carrito no encontrado') {
        return res.status(404).json({ status: 'error', error: error.message });
      }
      res.status(500).json({ status: 'error', error: error.message });
    }
  });

  /**
   * POST /:cid/product/:pid - Agregar producto al carrito
   * Permite agregar productos a carritos anónimos o autenticados
   */
  router.post(
    '/:cid/product/:pid',
    async (req, res) => {
      try {
        // Validar que el producto existe
        const product = await productManager.getProductById(req.params.pid);
        if (!product) {
          return res
            .status(404)
            .json({ status: 'error', error: 'Producto no encontrado' });
        }

        const updatedCart = await cartManager.addProductToCart(
          req.params.cid,
          req.params.pid
        );
        res.json({
          status: 'success',
          payload: updatedCart,
          message: 'Producto agregado al carrito',
        });
      } catch (error) {
        console.error('Error en POST /api/carts/:cid/product/:pid:', error);
        if (error.message.includes('inválido')) {
          return res.status(400).json({ status: 'error', error: error.message });
        }
        if (error.message === 'Carrito no encontrado') {
          return res.status(404).json({ status: 'error', error: error.message });
        }
        res.status(400).json({ status: 'error', error: error.message });
      }
    }
  );

  /**
   * DELETE /:cid/product/:pid - Eliminar producto específico del carrito
   * Permite operaciones en carritos anónimos o autenticados
   */
  router.delete(
    '/:cid/product/:pid',
    async (req, res) => {
      try {
        const updatedCart = await cartManager.removeProductFromCart(
          req.params.cid,
          req.params.pid
        );
        res.json({
          status: 'success',
          payload: updatedCart,
          message: 'Producto eliminado del carrito',
        });
      } catch (error) {
        console.error('Error en DELETE /api/carts/:cid/product/:pid:', error);
        if (error.message.includes('inválido')) {
          return res.status(400).json({ status: 'error', error: error.message });
        }
        if (error.message === 'Carrito no encontrado') {
          return res.status(404).json({ status: 'error', error: error.message });
        }
        res.status(400).json({ status: 'error', error: error.message });
      }
    }
  );

  /**
   * PUT /:cid/product/:pid - Actualizar cantidad de producto en el carrito
   * Permite operaciones en carritos anónimos o autenticados
   */
  router.put(
    '/:cid/product/:pid',
    async (req, res) => {
      try {
        const { quantity } = req.body;

        if (quantity === undefined) {
          return res.status(400).json({
            status: 'error',
            error: 'Se requiere el campo "quantity" en el body',
          });
        }

        const updatedCart = await cartManager.updateProductQuantity(
          req.params.cid,
          req.params.pid,
          quantity
        );

        res.json({
          status: 'success',
          payload: updatedCart,
          message: 'Cantidad de producto actualizada',
        });
      } catch (error) {
        console.error('Error en PUT /api/carts/:cid/product/:pid:', error);
        if (error.message.includes('inválido')) {
          return res.status(400).json({ status: 'error', error: error.message });
        }
        if (
          error.message === 'Carrito no encontrado' ||
          error.message === 'Producto no encontrado en el carrito'
        ) {
          return res.status(404).json({ status: 'error', error: error.message });
        }
        res.status(400).json({ status: 'error', error: error.message });
      }
    }
  );

  /**
   * PUT /:cid - Actualizar carrito con array de productos
   * Body esperado: { products: [ { product: "id", quantity: 1 } ] }
   * Permite operaciones en carritos anónimos o autenticados
   */
  router.put(
    '/:cid',
    async (req, res) => {
      try {
        const { products } = req.body;

        if (!products) {
          return res.status(400).json({
            status: 'error',
            error: 'Se requiere el campo "products" en el body',
          });
        }

        const updatedCart = await cartManager.updateCart(req.params.cid, products);

        res.json({
          status: 'success',
          payload: updatedCart,
          message: 'Carrito actualizado exitosamente',
        });
      } catch (error) {
        console.error('Error en PUT /api/carts/:cid:', error);
        if (error.message === 'ID de carrito inválido') {
          return res.status(400).json({ status: 'error', error: error.message });
        }
        if (error.message === 'Carrito no encontrado') {
          return res.status(404).json({ status: 'error', error: error.message });
        }
        res.status(400).json({ status: 'error', error: error.message });
      }
    }
  );

  /**
   * DELETE /:cid - Eliminar todos los productos del carrito
   * Permite operaciones en carritos anónimos o autenticados
   */
  router.delete(
    '/:cid',
    async (req, res) => {
      try {
        const clearedCart = await cartManager.clearCart(req.params.cid);

        res.json({
          status: 'success',
          payload: clearedCart,
          message: 'Carrito vaciado exitosamente',
        });
      } catch (error) {
        console.error('Error en DELETE /api/carts/:cid:', error);
        if (error.message === 'ID de carrito inválido') {
          return res.status(400).json({ status: 'error', error: error.message });
        }
        if (error.message === 'Carrito no encontrado') {
          return res.status(404).json({ status: 'error', error: error.message });
        }
        res.status(500).json({ status: 'error', error: error.message });
      }
    }
  );

  /**
   * POST /:cid/purchase - Realizar la compra del carrito
   * Verifica stock, crea ticket y actualiza stock de productos
   * Requiere autenticación + ser propietario o admin
   */
  router.post(
    '/:cid/purchase',
    isAuthenticated,
    isAdminOrOwner('cid'),
    async (req, res) => {
      try {
        const cartId = req.params.cid;
        const userEmail = req.user.email;

        // Obtener carrito
        const cart = await cartManager.getCartById(cartId);
        if (!cart || !cart.products || cart.products.length === 0) {
          return res.status(400).json({
            status: 'error',
            error: 'Carrito vacío',
          });
        }

        let totalAmount = 0;
        const productsToRemove = [];
        const productsNotPurchased = [];

        // Procesar cada producto del carrito
        for (const cartProduct of cart.products) {
          const product = cartProduct.product;
          const requestedQuantity = cartProduct.quantity;

          if (product.stock >= requestedQuantity) {
            // Hay stock suficiente
            const newStock = product.stock - requestedQuantity;
            const totalPrice = product.price * requestedQuantity;

            // Actualizar stock del producto
            await productManager.updateProduct(product._id, {
              stock: newStock,
            });

            totalAmount += totalPrice;
            productsToRemove.push(product._id.toString());
          } else {
            // No hay stock suficiente
            productsNotPurchased.push({
              productId: product._id,
              productName: product.title,
              requestedQuantity,
              availableStock: product.stock,
            });
          }
        }

        // Si al menos un producto fue comprado, crear ticket
        let ticket = null;
        if (productsToRemove.length > 0) {
          ticket = await TicketService.createTicket({
            amount: totalAmount,
            purchaser: userEmail,
          });
        }

        // Actualizar carrito: mantener solo los productos no comprados
        if (productsNotPurchased.length > 0) {
          const remainingProducts = cart.products.filter((p) =>
            productsNotPurchased.some((np) => np.productId.toString() === p.product._id.toString())
          );
          await cartManager.updateCart(cartId, remainingProducts);
        } else {
          // Si se compraron todos, vaciar carrito
          await cartManager.clearCart(cartId);
        }

        // Responder con información de la compra
        res.json({
          status: 'success',
          message:
            productsNotPurchased.length === 0
              ? 'Compra realizada exitosamente'
              : 'Compra parcial realizada',
          payload: {
            ticket: ticket ? ticket.toJSON() : null,
            purchasedProducts: productsToRemove.length,
            totalAmount,
            notPurchased: productsNotPurchased,
          },
        });
      } catch (error) {
        console.error('Error en POST /api/carts/:cid/purchase:', error);
        res.status(500).json({
          status: 'error',
          error: error.message,
        });
      }
    }
  );

  return router;
};
