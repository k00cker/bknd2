// Esquema de Ticket para registrar compras
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ticketSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      default: () => `TICKET-${uuidv4().substring(0, 8).toUpperCase()}`,
    },
    purchase_datetime: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'El monto no puede ser negativo'],
    },
    purchaser: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
