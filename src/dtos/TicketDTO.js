// DTO para Ticket de Compra
class TicketDTO {
  constructor(ticket) {
    this.id = ticket._id;
    this.code = ticket.code;
    this.purchase_datetime = ticket.purchase_datetime;
    this.amount = ticket.amount;
    this.purchaser = ticket.purchaser;
  }

  toJSON() {
    return {
      _id: this.id,
      code: this.code,
      purchase_datetime: this.purchase_datetime,
      amount: this.amount,
      purchaser: this.purchaser,
    };
  }
}

module.exports = TicketDTO;
