const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./src/db/Product');

async function seedProducts() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/ecommerce');
    console.log('✓ Conectado a MongoDB');

    // Productos de ejemplo
    const products = [
      {
        title: 'Laptop Dell XPS 13',
        description: 'Laptop ultraligera y potente para desarrollo con procesador Intel i7, 16GB RAM y 512GB SSD. Pantalla 4K brillante.',
        code: 'DELL-XPS-001',
        price: 1200,
        stock: 15,
        category: 'electrónica',
        status: true,
        thumbnails: []
      },
      {
        title: 'Monitor LG 32 pulgadas',
        description: 'Monitor de alta resolución 4K para trabajo profesional con colores precisos y ángulo de visión amplio.',
        code: 'MON-LG-001',
        price: 600,
        stock: 8,
        category: 'monitores',
        status: true,
        thumbnails: []
      },
      {
        title: 'Teclado Mecánico RGB',
        description: 'Teclado mecánico con switches Cherry MX, iluminación RGB personalizable y reposamuñecas ergonómico.',
        code: 'KBD-MECH-001',
        price: 150,
        stock: 25,
        category: 'periféricos',
        status: true,
        thumbnails: []
      },
      {
        title: 'Mouse Logitech MX Master 3',
        description: 'Mouse inalámbrico de precisión con 8K DPI, múltiples botones programables y batería de larga duración.',
        code: 'MOUSE-LOG-001',
        price: 99,
        stock: 30,
        category: 'periféricos',
        status: true,
        thumbnails: []
      },
      {
        title: 'Audífonos Sony WH-1000XM5',
        description: 'Audífonos con cancelación de ruido líder en la industria, calidad de audio excepcional y 30 horas de batería.',
        code: 'AUDIO-SONY-001',
        price: 399,
        stock: 12,
        category: 'audio',
        status: true,
        thumbnails: []
      },
      {
        title: 'Webcam Logitech C920',
        description: 'Cámara web Full HD 1080p con micrófono estéreo integrado, perfecta para videoconferencias y streaming.',
        code: 'CAM-LOG-001',
        price: 79,
        stock: 20,
        category: 'accesorios',
        status: true,
        thumbnails: []
      }
    ];

    // Limpiar productos existentes
    await Product.deleteMany({});
    console.log('✓ Productos previos eliminados');

    // Insertar nuevos productos
    const insertedProducts = await Product.insertMany(products);
    console.log(`✓ ${insertedProducts.length} productos creados exitosamente`);

    // Mostrar los IDs creados
    insertedProducts.forEach(p => {
      console.log(`  - ${p.title} (ID: ${p._id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

seedProducts();
