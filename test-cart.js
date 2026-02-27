#!/usr/bin/env node
/**
 * Script de prueba para verificar que agregar productos al carrito funciona
 */

const http = require('http');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testCartFlow() {
  console.log('🧪 Iniciando prueba del flujo de carrito...\n');

  try {
    // 1. Obtener lista de productos
    console.log('1️⃣  Obteniendo lista de productos...');
    const productsRes = await makeRequest('GET', '/api/products');
    const products = productsRes.data.payload;
    
    if (!products || products.length === 0) {
      console.error('❌ No hay productos disponibles');
      process.exit(1);
    }
    
    const productId = products[0]._id;
    console.log(`✅ Producto encontrado: ${products[0].title} (ID: ${productId})\n`);

    // 2. Crear carrito
    console.log('2️⃣  Creando carrito...');
    const cartRes = await makeRequest('POST', '/api/carts');
    const cartId = cartRes.data.payload._id;
    console.log(`✅ Carrito creado (ID: ${cartId})\n`);

    // 3. Agregar producto al carrito
    console.log('3️⃣  Agregando producto al carrito...');
    const addRes = await makeRequest('POST', `/api/carts/${cartId}/product/${productId}`);
    
    if (addRes.status === 200 && addRes.data.status === 'success') {
      console.log(`✅ Producto agregado exitosamente\n`);
    } else {
      console.error(`❌ Error al agregar producto:`);
      console.error(`   Status: ${addRes.status}`);
      console.error(`   Response:`, addRes.data);
      process.exit(1);
    }

    // 4. Obtener carrito
    console.log('4️⃣  Obteniendo carrito...');
    const getCartRes = await makeRequest('GET', `/api/carts/${cartId}`);
    
    if (getCartRes.status === 200 && getCartRes.data.payload.products.length > 0) {
      const cartProducts = getCartRes.data.payload.products;
      console.log(`✅ Carrito obtenido con ${cartProducts.length} producto(s)\n`);
      console.log('📦 Productos en carrito:');
      cartProducts.forEach(p => {
        console.log(`   - ${p.product.title} x${p.quantity}`);
      });
    } else {
      console.error(`❌ Error al obtener carrito`);
      console.error(`   Status: ${getCartRes.status}`);
      console.error(`   Response:`, getCartRes.data);
      process.exit(1);
    }

    console.log('\n✅ ¡Todas las pruebas pasaron exitosamente!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    process.exit(1);
  }
}

testCartFlow();
