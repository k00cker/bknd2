// DAO para Tickets - Acceso a datos
const Ticket = require('../db/Ticket');

class TicketDAO {
  async create(ticketData) {
    try {
      const ticket = new Ticket(ticketData);
      const savedTicket = await ticket.save();
      return savedTicket.toObject();
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      return await Ticket.findById(id).lean();
    } catch (error) {
      throw error;
    }
  }

  async findByCode(code) {
    try {
      return await Ticket.findOne({ code }).lean();
    } catch (error) {
      throw error;
    }
  }

  async findByPurchaser(purchaser) {
    try {
      return await Ticket.find({ purchaser }).lean();
    } catch (error) {
      throw error;
    }
  }

  async findAll(filter = {}, options = {}) {
    try {
      const { limit = 10, skip = 0 } = options;
      return await Ticket.find(filter)
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TicketDAO();
