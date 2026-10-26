/* =====================================================================
   MANEYINDA MARUKATTE - PROMOTIONAL OFFERS & ANNOUNCEMENTS CONTROLLER
   Manages public active promotions, coupon code validation with
   strict server-side discount recalculation, and protected Admin controls.
===================================================================== */

const db = require('../models/db');

const offerController = {
  // GET /api/offers
  // Public: Returns currently active promotional offers
  getActiveOffers(req, res) {
    const bannerOnly = req.query && req.query.banner === 'true';
    const offers = db.getOffers({ activeOnly: true, bannerOnly });

    return res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  },

  // GET /api/offers/:id
  getOfferById(req, res) {
    const { id } = req.params;
    const offer = db.getOfferById(id) || db.getOfferByCode(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'OFFER_NOT_FOUND',
        message: `Promotional offer '${id}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: offer
    });
  },

  // POST /api/offers/validate
  // Strictly validates coupon and recalculates discount on server
  validateCoupon(req, res) {
    const { code, items, subtotal, customerId } = req.body || {};

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'CODE_REQUIRED',
        message: 'A coupon code is required.'
      });
    }

    const offer = db.getOfferByCode(code.trim());
    if (!offer) {
      return res.status(404).json({
        success: false,
        valid: false,
        error: 'INVALID_CODE',
        message: `Coupon code "${code.toUpperCase()}" is not valid.`
      });
    }

    const calculatedSubtotal = Number(subtotal) || 0;
    const result = db.calculateDiscountForCart(offer, items || [], customerId || 'cust_guest', calculatedSubtotal);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: result.error,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      code: offer.code,
      title: offer.title,
      badgeText: offer.badgeText,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      discountAmount: result.discountAmount,
      eligibleAmount: result.eligibleAmount,
      message: `Coupon "${offer.code}" applied! You save ₹${result.discountAmount}.`
    });
  },

  // GET /api/promotions/announcements
  getAnnouncements(req, res) {
    const announcements = db.getAnnouncements();
    const activeOffers = db.getOffers({ activeOnly: true });

    return res.status(200).json({
      success: true,
      announcements,
      featuredOffers: activeOffers.slice(0, 5)
    });
  },

  // GET /api/admin/offers (Protected: requireAdmin)
  getAdminOffers(req, res) {
    const allOffers = db.getOffers();
    return res.status(200).json({
      success: true,
      count: allOffers.length,
      data: allOffers
    });
  },

  // POST /api/admin/offers (Protected: requireAdmin)
  createOffer(req, res) {
    const body = req.body || {};
    const { code, title, discountValue } = body;

    if (!code || !title || !discountValue) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Offer code, title, and discount value are required.'
      });
    }

    const existing = db.getOfferByCode(code);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'DUPLICATE_CODE',
        message: `An offer with code "${code.toUpperCase()}" already exists.`
      });
    }

    const created = db.createOffer(body);
    db.addActivityLog(`Promotional offer created: ${created.code} (${created.title})`);

    return res.status(201).json({
      success: true,
      data: created,
      message: 'Promotional offer created successfully.'
    });
  },

  // PUT /api/admin/offers/:id (Protected: requireAdmin)
  updateOffer(req, res) {
    const { id } = req.params;
    const updates = req.body || {};

    const updated = db.updateOffer(id, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'OFFER_NOT_FOUND',
        message: `Offer '${id}' not found.`
      });
    }

    db.addActivityLog(`Promotional offer updated: ${updated.code}`);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Promotional offer updated successfully.'
    });
  },

  // PATCH /api/admin/offers/:id/toggle (Protected: requireAdmin)
  toggleOffer(req, res) {
    const { id } = req.params;
    const offer = db.getOfferById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'OFFER_NOT_FOUND',
        message: `Offer '${id}' not found.`
      });
    }

    const newStatus = !offer.active;
    const updated = db.updateOffer(id, { active: newStatus });
    db.addActivityLog(`Promotional offer ${updated.code} set to active=${newStatus}`);

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Offer is now ${newStatus ? 'Active' : 'Inactive'}.`
    });
  },

  // DELETE /api/admin/offers/:id (Protected: requireAdmin)
  deleteOffer(req, res) {
    const { id } = req.params;
    const removed = db.deleteOffer(id);

    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'OFFER_NOT_FOUND',
        message: `Offer '${id}' not found.`
      });
    }

    db.addActivityLog(`Promotional offer deleted: ${removed.code}`);

    return res.status(200).json({
      success: true,
      message: `Offer ${removed.code} deleted successfully.`
    });
  }
};

module.exports = offerController;
