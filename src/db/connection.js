// Conexión a MongoDB utilizando Mongoose
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Cargar variables de entorno
    require('dotenv').config();
    
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'ecommerce';

    if (!mongoUri) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    // Conectar a MongoDB
    await mongoose.connect(mongoUri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✓ Conectado a MongoDB exitosamente');
    return mongoose.connection;
  } catch (error) {
    console.error('✗ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
