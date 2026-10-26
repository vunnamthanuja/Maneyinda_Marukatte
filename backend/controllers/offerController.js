/* =====================================================================
   MANEYINDA MARUKATTE - PROMOTIONAL OFFERS & ANNOUNCEMENTS CONTROLLER
   Manages public active promotions, coupon code validation with
   strict server-side discount recalculation, entrepreneur self-service
   offer management with strict IDOR protections, and Admin oversight.
===================================================================== */

const db = require('../models/db');

const offerController = {
  // GET /api/offers
  // Public: Returns currently active promotional offers
  // When banner=true, applies a fair round-robin interleaving across distinct shops
  getActiveOffers(req, res) {
    const bannerOnly = req.query && req.query.banner === 'true';
    let offers = db.getOffers({ activeOnly: true, bannerOnly });

    if (bannerOnly && offers.length > 1) {
      // Fair rotation strategy: group by shop (or 'global'), round-robin interleave
      const shopBuckets = new Map();
      offers.forEach(o => {
        const key = o.entrepreneurId || 'global';
        if (!shopBuckets.has(key)) shopBuckets.set(key, []);
        shopBuckets.get(key).push(o);
      });

      const rotated = [];
      let addedInRound = true;
      let round = 0;
      while (addedInRound) {
        addedInRound = false;
        for (const bucket of shopBuckets.values()) {
          if (round < bucket.length) {
            rotated.push(bucket[round]);
            addedInRound = true;
          }
        }
        round++;
      }
      offers = rotated;
    }

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

  // -------------------------------------------------------------------
  // ENTREPRENEUR SELF-SERVICE OFFER MANAGEMENT (PROTECTED & IDOR-SAFE)
  // -------------------------------------------------------------------

  // GET /api/entrepreneurs/me/offers (Protected: requireEntrepreneur)
  getEntrepreneurOffers(req, res) {
    const ownerId = req.user.entrepreneurId || req.user.userId;
    if (!ownerId) {
      return res.status(403).json({
        success: false,
        error: 'ENTREPRENEUR_PROFILE_REQUIRED',
        message: 'You must have an approved entrepreneur profile to manage offers.'
      });
    }

    const offers = db.getOffers({ entrepreneurId: ownerId });

    return res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  },

  // GET /api/entrepreneurs/me/offers/:id (Protected: requireEntrepreneur)
  getEntrepreneurOfferById(req, res) {
    const ownerId = req.user.entrepreneurId || req.user.userId;
    const { id } = req.params;
    const offer = db.getOfferById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'OFFER_NOT_FOUND',
        message: `Offer '${id}' not found.`
      });
    }

    // Strict IDOR Protection: Owner can view only their own offers
    if (offer.entrepreneurId !== ownerId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_OFFER_ACCESS',
        message: 'Forbidden: You do not have permission to access another entrepreneur\'s offer.'
      });
    }

    return res.status(200).json({
      success: true,
      data: offer
    });
  },

  // POST /api/entrepreneurs/me/offers (Protected: requireEntrepreneur)
  createEntrepreneurOffer(req, res) {
    const ownerId = req.user.entrepreneurId || req.user.userId;
    if (!ownerId) {
      return res.status(403).json({
        success: false,
        error: 'ENTREPRENEUR_PROFILE_REQUIRED',
        message: 'An active entrepreneur profile is required to create promotional offers.'
      });
    }

    const entProfile = db.getEntrepreneurById(ownerId) || { businessName: req.user.businessName || 'Local Shop' };
    const body = req.body || {};
    const {
      title,
      description,
      discountType = 'percentage',
      discountValue,
      maxDiscount,
      minOrderAmount,
      scope = 'shop',
      productIds = [],
      startDate,
      endDate,
      code,
      usageLimit
    } = body;

    // Field Validations
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'TITLE_REQUIRED',
        message: 'Offer title is mandatory.'
      });
    }

    const numDiscount = Number(discountValue);
    if (isNaN(numDiscount) || numDiscount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_DISCOUNT_VALUE',
        message: 'Discount value must be a positive number.'
      });
    }

    if (discountType === 'percentage' && (numDiscount < 1 || numDiscount > 100)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PERCENTAGE',
        message: 'Percentage discount must be between 1% and 100%.'
      });
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_DATE_RANGE',
        message: 'Start date cannot be after expiry date.'
      });
    }

    // Product Ownership Validation: Ensure all attached products belong to this entrepreneur
    const verifiedProductIds = [];
    if (scope === 'product' && Array.isArray(productIds) && productIds.length > 0) {
      for (const pid of productIds) {
        const prod = db.getProductById(pid);
        if (!prod || prod.entrepreneurId !== ownerId) {
          return res.status(403).json({
            success: false,
            error: 'UNAUTHORIZED_PRODUCT_SELECTION',
            message: `Product "${pid}" does not belong to your shop and cannot be included in your offer.`
          });
        }
        verifiedProductIds.push(pid);
      }
    }

    // Coupon Code Uniqueness Validation
    let cleanCode = null;
    if (code && typeof code === 'string' && code.trim()) {
      cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      const existing = db.getOfferByCode(cleanCode);
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'DUPLICATE_CODE',
          message: `Coupon code "${cleanCode}" is already in use by another promotion.`
        });
      }
    }

    const badgeText = discountType === 'percentage' ? `${numDiscount}% OFF` : `₹${numDiscount} OFF`;

    // Strict Server-Side Sanitization & Ownership Binding
    const offerPayload = {
      code: cleanCode,
      title: title.trim(),
      description: (description || '').trim(),
      discountType,
      discountValue: numDiscount,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      minOrderAmount: Number(minOrderAmount) || 0,
      scope: scope === 'product' ? 'product' : 'shop',
      entrepreneurId: ownerId, // Strictly derived from verified session token!
      storeName: entProfile.businessName,
      productIds: verifiedProductIds,
      targetProductId: verifiedProductIds.length > 0 ? verifiedProductIds[0] : null,
      targetEntrepreneurId: ownerId,
      badgeText,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      active: true,
      bannerEnabled: true,
      bannerColor: '#4A6B32',
      icon: discountType === 'percentage' ? 'percent' : 'local_offer',
      ctaText: 'Shop Now',
      ctaLink: `screen-entrepreneur-store?id=${ownerId}`,
      moderationStatus: 'approved'
    };

    const created = db.createOffer(offerPayload);
    db.addActivityLog(`Shop owner (${ownerId}) created promotional offer: "${created.title}" [${created.code || created.id}]`);

    return res.status(201).json({
      success: true,
      data: created,
      message: 'Promotional offer created successfully and published to your store.'
    });
  },

  // PUT /api/entrepreneurs/me/offers/:id (Protected: requireEntrepreneur)
  updateEntrepreneurOffer(req, res) {
    const ownerId = req.user.entrepreneurId || req.user.userId;
    const { id } = req.params;
    const offer = db.getOfferById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'OFFER_NOT_FOUND',
        message: `Offer '${id}' not found.`
      });
    }

    // Strict IDOR Protection
    if (offer.entrepreneurId !== ownerId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_OFFER_ACCESS',
        message: 'Forbidden: You do not have permission to modify another entrepreneur\'s offer.'
      });
    }

    const body = req.body || {};
    const updates = {};

    if (body.title && typeof body.title === 'string') updates.title = body.title.trim();
    if (body.description !== undefined) updates.description = String(body.description || '').trim();
    if (body.discountType) updates.discountType = body.discountType;

    if (body.discountValue !== undefined) {
      const val = Number(body.discountValue);
      if (isNaN(val) || val <= 0) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_DISCOUNT_VALUE',
          message: 'Discount value must be a positive number.'
        });
      }
      if ((body.discountType || offer.discountType) === 'percentage' && (val < 1 || val > 100)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_PERCENTAGE',
          message: 'Percentage discount must be between 1% and 100%.'
        });
      }
      updates.discountValue = val;
      updates.badgeText = (body.discountType || offer.discountType) === 'percentage' ? `${val}% OFF` : `₹${val} OFF`;
    }

    if (body.minOrderAmount !== undefined) updates.minOrderAmount = Number(body.minOrderAmount) || 0;
    if (body.maxDiscount !== undefined) updates.maxDiscount = body.maxDiscount ? Number(body.maxDiscount) : null;
    if (body.startDate) updates.startDate = body.startDate;
    if (body.endDate !== undefined) updates.endDate = body.endDate;
    if (body.usageLimit !== undefined) updates.usageLimit = body.usageLimit ? Number(body.usageLimit) : null;
    if (body.bannerEnabled !== undefined) updates.bannerEnabled = Boolean(body.bannerEnabled);

    // Validate product IDs if updated
    if (body.productIds && Array.isArray(body.productIds)) {
      for (const pid of body.productIds) {
        const prod = db.getProductById(pid);
        if (!prod || prod.entrepreneurId !== ownerId) {
          return res.status(403).json({
            success: false,
            error: 'UNAUTHORIZED_PRODUCT_SELECTION',
            message: `Product "${pid}" does not belong to your shop.`
          });
        }
      }
      updates.productIds = body.productIds;
      updates.targetProductId = body.productIds[0] || null;
    }

    // Code update check
    if (body.code && typeof body.code === 'string') {
      const clean = body.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      const existing = db.getOfferByCode(clean);
      if (existing && existing.id !== id) {
        return res.status(400).json({
          success: false,
          error: 'DUPLICATE_CODE',
          message: `Coupon code "${clean}" is already taken.`
        });
      }
      updates.code = clean;
    }

    const updated = db.updateOffer(id, updates);
    db.addActivityLog(`Shop owner (${ownerId}) updated offer: "${updated.title}" [${updated.code || updated.id}]`);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Offer updated successfully.'
    });
  },

  // PATCH /api/entrepreneurs/me/offers/:id/toggle (Protected: requireEntrepreneur)
  toggleEntrepreneurOffer(req, res) {
    const ownerId = req.user.entrepreneurId || req.user.userId;
    const { id } = req.params;
    const offer = db.getOfferById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'OFFER_NOT_FOUND',
        message: `Offer '${id}' not found.`
      });
    }

    // Strict IDOR Protection
    if (offer.entrepreneurId !== ownerId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_OFFER_ACCESS',
        message: 'Forbidden: You do not have permission to toggle another entrepreneur\'s offer.'
      });
    }

    const newActive = !offer.active;
    const updated = db.updateOffer(id, { active: newActive });
    db.addActivityLog(`Shop owner (${ownerId}) set offer "${updated.title}" active=${newActive}`);

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Offer is now ${newActive ? 'Active and visible to customers' : 'Paused/Inactive'}.`
    });
  },

  // DELETE /api/entrepreneurs/me/offers/:id (Protected: requireEntrepreneur)
  deleteEntrepreneurOffer(req, res) {
    const ownerId = req.user.entrepreneurId || req.user.userId;
    const { id } = req.params;
    const offer = db.getOfferById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'OFFER_NOT_FOUND',
        message: `Offer '${id}' not found.`
      });
    }

    // Strict IDOR Protection
    if (offer.entrepreneurId !== ownerId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_OFFER_ACCESS',
        message: 'Forbidden: You do not have permission to delete another entrepreneur\'s offer.'
      });
    }

    const removed = db.deleteOffer(id);
    db.addActivityLog(`Shop owner (${ownerId}) deleted offer: "${removed.title}" [${removed.code || removed.id}]`);

    return res.status(200).json({
      success: true,
      message: `Offer "${removed.title}" was deleted permanently.`
    });
  },

  // GET /api/entrepreneurs/me/offers/:id/performance (Protected: requireEntrepreneur)
  // Non-PII analytics report for shop owner
  getOfferPerformance(req, res) {
    const ownerId = req.user.entrepreneurId || req.user.userId;
    const { id } = req.params;
    const offer = db.getOfferById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'OFFER_NOT_FOUND',
        message: `Offer '${id}' not found.`
      });
    }

    // Strict IDOR Protection
    if (offer.entrepreneurId !== ownerId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_OFFER_ACCESS',
        message: 'Forbidden: You do not have permission to view performance data for this offer.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: offer.id,
        title: offer.title,
        code: offer.code,
        active: offer.active,
        usageCount: offer.usageCount || 0,
        ordersCount: offer.ordersCount || 0,
        totalSavedAmount: offer.totalSavedAmount || 0,
        usageLimit: offer.usageLimit || null,
        startDate: offer.startDate,
        endDate: offer.endDate
      }
    });
  },

  // -------------------------------------------------------------------
  // ADMIN CONTROLS & OVERSIGHT (Protected: requireAdmin)
  // -------------------------------------------------------------------

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
    db.addActivityLog(`Promotional offer created by Admin: ${created.code} (${created.title})`);

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

    db.addActivityLog(`Promotional offer updated by Admin: ${updated.code || updated.id}`);

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
    db.addActivityLog(`Promotional offer ${updated.code || updated.id} set to active=${newStatus} by Admin`);

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Offer is now ${newStatus ? 'Active' : 'Inactive'}.`
    });
  },

  // PATCH /api/admin/offers/:id/moderate (Protected: requireAdmin)
  // Admin oversight: approve, flag, or deactivate fraudulent/misleading shop offers
  moderateOffer(req, res) {
    const { id } = req.params;
    const { status, reason } = req.body || {};

    if (!['approved', 'flagged', 'deactivated'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_MODERATION_STATUS',
        message: 'Status must be one of "approved", "flagged", or "deactivated".'
      });
    }

    const offer = db.getOfferById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'OFFER_NOT_FOUND',
        message: `Offer '${id}' not found.`
      });
    }

    const updates = {
      moderationStatus: status,
      moderationReason: reason || null
    };

    if (status === 'deactivated') {
      updates.active = false;
    }

    const updated = db.updateOffer(id, updates);
    db.addActivityLog(`Admin moderated offer ${updated.code || updated.id}: status=${status}, reason="${reason || 'N/A'}"`);

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Offer has been ${status === 'deactivated' ? 'deactivated' : (status === 'flagged' ? 'flagged for review' : 'approved')}.`
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

    db.addActivityLog(`Promotional offer deleted by Admin: ${removed.code || removed.id}`);

    return res.status(200).json({
      success: true,
      message: `Offer ${removed.code || removed.id} deleted successfully.`
    });
  }
};

module.exports = offerController;
