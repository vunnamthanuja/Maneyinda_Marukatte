/* =====================================================================
   MANEYINDA MARUKATTE - SUPPORT CONTROLLER
   Customer grievance resolution, refund/replacement dispute escalation,
   and administrative response ticketing system.
===================================================================== */

const db = require('../models/db');

const supportController = {
  // GET /api/support/tickets
  getTickets(req, res) {
    const { customerId } = req.query || {};
    const tickets = db.getSupportTickets(customerId || null);

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  },

  // GET /api/support/tickets/:id
  getTicketById(req, res) {
    const { id } = req.params;
    const ticket = (db.data.supportTickets || []).find(t => t.id === id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'TICKET_NOT_FOUND',
        message: `Support ticket '${id}' was not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: ticket
    });
  },

  // POST /api/support/tickets
  createTicket(req, res) {
    const body = req.body || {};
    const { customerId, customerName, category, subject, description, orderId, photos } = body;

    if (!customerId || !category || !subject) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_TICKET_FIELDS',
        message: 'Customer ID, category, and subject are mandatory.'
      });
    }

    const newTicket = db.createSupportTicket({
      customerId,
      customerName: customerName || 'Valued Customer',
      category,
      orderId: orderId || null,
      subject: subject.trim(),
      description: (description || '').trim(),
      photos: Array.isArray(photos) ? photos : [],
      status: 'Open'
    });

    db.addActivityLog(`Support ticket #${newTicket.id} created: "${newTicket.subject}"`);

    return res.status(201).json({
      success: true,
      data: newTicket,
      message: 'Support ticket submitted. Our support desk will reply within 24 hours.'
    });
  },

  // PATCH /api/support/tickets/:id/resolve
  resolveTicket(req, res) {
    const { id } = req.params;
    const { status, adminNotes } = req.body || {};

    const updates = {};
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const updated = db.updateSupportTicket(id, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'TICKET_NOT_FOUND',
        message: `Support ticket '${id}' was not found.`
      });
    }

    db.addActivityLog(`Support ticket #${id} status changed to "${updated.status}"`);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Ticket status and notes updated.'
    });
  }
};

module.exports = supportController;
