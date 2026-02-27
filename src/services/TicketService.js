// Servicio de Tickets - Lógica de negocio
const ticketDAO = require('../daos/TicketDAO');
const TicketDTO = require('../dtos/TicketDTO');

class TicketService {
  /**
   * Crear un nuevo ticket de compra
   * @param {Object} ticketData - { amount, purchaser }
   * @returns {TicketDTO}
   */
  async createTicket(ticketData) {
    try {
      if (!ticketData.amount || !ticketData.purchaser) {
        throw new Error('Se requieren los campos amount y purchaser');
      }

      const ticket = await ticketDAO.create({
        amount: ticketData.amount,
        purchaser: ticketData.purchaser,
        purchase_datetime: new Date(),
      });

      return new TicketDTO(ticket);
    } catch (error) {
      console.error('Error en createTicket:', error);
      throw error;
    }
  }

  /**
   * Obtener ticket por ID
   */
  async getTicketById(id) {
    try {
      const ticket = await ticketDAO.findById(id);
      if (!ticket) {
        throw new Error('Ticket no encontrado');
      }
      return new TicketDTO(ticket);
    } catch (error) {
      console.error('Error en getTicketById:', error);
      throw error;
    }
  }

  /**
   * Obtener ticket por código
   */
  async getTicketByCode(code) {
    try {
      const ticket = await ticketDAO.findByCode(code);
      if (!ticket) {
        throw new Error('Ticket no encontrado');
      }
      return new TicketDTO(ticket);
    } catch (error) {
      console.error('Error en getTicketByCode:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los tickets de un comprador
   */
  async getTicketsByPurchaser(purchaser) {
    try {
      const tickets = await ticketDAO.findByPurchaser(purchaser);
      return tickets.map(ticket => new TicketDTO(ticket));
    } catch (error) {
      console.error('Error en getTicketsByPurchaser:', error);
      throw error;
    }
  }
}

module.exports = new TicketService();
