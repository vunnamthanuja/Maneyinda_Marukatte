/* =====================================================================
   MANEYINDA MARUKATTE - ENTREPRENEUR ADVERTISEMENT CONTROLLER
   Manages public ad display with fair seller rotation, click/impression
   tracking, entrepreneur self-service lifecycle, and Admin moderation.
===================================================================== */

const db = require('../models/db');

const advertisementController = {
  // GET /api/advertisements
  // Public: Returns approved & active advertisements for home carousel and placements
  getPublicAdvertisements(req, res) {
    const placement = (req.query && req.query.placement) || 'home_carousel';
    const category = req.query && req.query.category;

    let ads = db.getAdvertisements({
      publicOnly: true,
      placement,
      category
    });

    // Fair Rotation Strategy:
    // Group ads by entrepreneur and round-robin interleave them so multiple women entrepreneurs
    // share equal promotional exposure without one shop dominating the carousel.
    if (ads.length > 1) {
      const shopBuckets = new Map();
      ads.forEach(ad => {
        const key = ad.entrepreneurId || 'general';
        if (!shopBuckets.has(key)) shopBuckets.set(key, []);
        shopBuckets.get(key).push(ad);
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
      ads = rotated;
    }

    return res.status(200).json({
      success: true,
      count: ads.length,
      data: ads
    });
  },

  // GET /api/advertisements/:id
  getAdvertisementById(req, res) {
    const { id } = req.params;
    const ad = db.getAdvertisementById(id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        error: 'AD_NOT_FOUND',
        message: `Advertisement '${id}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: ad
    });
  },

  // POST /api/advertisements/:id/impression
  // Tracks authentic ad impressions
  recordImpression(req, res) {
    const { id } = req.params;
    const count = db.recordAdImpression(id);
    return res.status(200).json({
      success: true,
      impressions: count
    });
  },

  // POST /api/advertisements/:id/click
  // Tracks authentic customer clicks
  recordClick(req, res) {
    const { id } = req.params;
    const count = db.recordAdClick(id);
    return res.status(200).json({
      success: true,
      clicks: count
    });
  },

  // -------------------------------------------------------------------
  // ENTREPRENEUR SELF-SERVICE (PROTECTED & IDOR-DEFENDED)
  // -------------------------------------------------------------------

  // GET /api/entrepreneurs/me/advertisements (Protected: requireEntrepreneur)
  getEntrepreneurAds(req, res) {
    const ownerId = req.user.entrepreneurId || req.user.userId;
    if (!ownerId) {
      return res.status(403).json({
        success: false,
        error: 'ENTREPRENEUR_PROFILE_REQUIRED',
        message: 'Entrepreneur profile required.'
      });
    }

    // Check and update any expired ads automatically
    const now = new Date();
    const ads = db.getAdvertisements({ entrepreneurId: ownerId });
    ads.forEach(ad => {
      if (ad.endDate && new Date(ad.endDate) < now && ad.status === 'Active') {
        ad.status = 'Expired';
        db.updateAdvertisement(ad.id, { status: 'Expired' });
        db.createNotification({
          title: '⏰ Advertisement Expired',
          message: `Your advertisement "${ad.title}" has reached its expiry date.`,
          type: 'warning',
          entrepreneurId: ownerId
        });
      }
    });

    return res.status(200).json({
      success: true,
      count: ads.length,
      data: ads
    });
  },

  // GET /api/entrepreneurs/me/advertisements/:id (Protected: requireEntrepreneur)
  getEntrepreneurAdById(req, res) {
    const ownerId = req.user.entrepreneurId || req.user.userId;
    const { id } = req.params;
    const ad = db.getAdvertisementById(id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        error: 'AD_NOT_FOUND',
        message: `Advertisement '${id}' not found.`
      });
    }

    if (ad.entrepreneurId !== ownerId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_AD_ACCESS',
        message: 'Forbidden: You do not have permission to access another entrepreneur\'s advertisement.'
      });
    }

    return res.status(200).json({
      success: true,
      data: ad
    });
  },

  // POST /api/entrepreneurs/me/advertisements (Protected: requireEntrepreneur)
  createEntrepreneurAd(req, res) {
    const ownerId = req.user.entrepreneurId || req.user.userId;
    if (!ownerId) {
      return res.status(403).json({
        success: false,
        error: 'ENTREPRENEUR_PROFILE_REQUIRED',
        message: 'Entrepreneur profile required.'
      });
    }

    const entProfile = db.getEntrepreneurById(ownerId) || { businessName: req.user.businessName || 'Local Shop' };
    const body = req.body || {};
    const {
      title,
      description,
      imageUrl,
      videoUrl,
      adType = 'Shop Promotion',
      placement = 'home_carousel',
      targetCategory,
      productIds = [],
      offerId,
      couponCode,
      discountText,
      ctaText = 'Shop Now',
      ctaTarget = 'shop',
      targetId,
      startDate,
      endDate
    } = body;

    // Field Validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'TITLE_REQUIRED',
        message: 'Advertisement title is mandatory.'
      });
    }

    if (!imageUrl && !videoUrl) {
      return res.status(400).json({
        success: false,
        error: 'IMAGE_REQUIRED',
        message: 'An advertisement banner image or video is required.'
      });
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_DATE_RANGE',
        message: 'Start date cannot be after expiry date.'
      });
    }

    // Product Ownership Validation: Ensure all associated products belong to this entrepreneur
    const verifiedProductIds = [];
    if (Array.isArray(productIds) && productIds.length > 0) {
      for (const pid of productIds) {
        const prod = db.getProductById(pid);
        if (!prod || prod.entrepreneurId !== ownerId) {
          return res.status(403).json({
            success: false,
            error: 'UNAUTHORIZED_PRODUCT_SELECTION',
            message: `Product "${pid}" does not belong to your shop.`
          });
        }
        verifiedProductIds.push(pid);
      }
    }

    // Offer Ownership Validation
    let verifiedOfferId = null;
    let verifiedCouponCode = null;
    if (offerId) {
      const offer = db.getOfferById(offerId);
      if (offer && offer.entrepreneurId === ownerId) {
        verifiedOfferId = offer.id;
        verifiedCouponCode = offer.code || couponCode;
      }
    }

    // Strict Server-Side Sanitization & Ownership Binding
    const adPayload = {
      entrepreneurId: ownerId, // Strictly derived from verified session token
      storeName: entProfile.businessName,
      title: title.trim(),
      description: (description || '').trim(),
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      mediaType: videoUrl ? 'video' : 'image',
      adType,
      placement,
      targetCategory: targetCategory || null,
      productIds: verifiedProductIds,
      offerId: verifiedOfferId,
      couponCode: verifiedCouponCode || (couponCode ? couponCode.trim().toUpperCase() : null),
      discountText: discountText || null,
      ctaText: ctaText || 'Shop Now',
      ctaTarget: ctaTarget || 'shop',
      targetId: targetId || ownerId,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || null,
      status: 'Pending Approval' // Never allow self-approval
    };

    const created = db.createAdvertisement(adPayload);
    db.addActivityLog(`Shop owner (${ownerId}) submitted advertisement "${created.title}" [${created.id}] for Admin approval`);

    return res.status(201).json({
      success: true,
      data: created,
      message: 'Advertisement submitted successfully and is pending Admin review.'
    });
  },

  // PUT /api/entrepreneurs/me/advertisements/:id (Protected: requireEntrepreneur)
  updateEntrepreneurAd(req, res) {
    const ownerId = req.user.entrepreneurId || req.user.userId;
    const { id } = req.params;
    const ad = db.getAdvertisementById(id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        error: 'AD_NOT_FOUND',
        message: `Advertisement '${id}' not found.`
      });
    }

    // Strict IDOR Protection
    if (ad.entrepreneurId !== ownerId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_AD_ACCESS',
        message: 'Forbidden: You do not have permission to modify another entrepreneur\'s advertisement.'
      });
    }

    const body = req.body || {};
    const updates = {};

    if (body.title && typeof body.title === 'string') updates.title = body.title.trim();
    if (body.description !== undefined) updates.description = String(body.description || '').trim();
    if (body.imageUrl) updates.imageUrl = body.imageUrl;
    if (body.videoUrl !== undefined) updates.videoUrl = body.videoUrl;
    if (body.adType) updates.adType = body.adType;
    if (body.placement) updates.placement = body.placement;
    if (body.targetCategory !== undefined) updates.targetCategory = body.targetCategory;
    if (body.ctaText) updates.ctaText = body.ctaText;
    if (body.ctaTarget) updates.ctaTarget = body.ctaTarget;
    if (body.targetId) updates.targetId = body.targetId;
    if (body.startDate) updates.startDate = body.startDate;
    if (body.endDate !== undefined) updates.endDate = body.endDate;
    if (body.discountText !== undefined) updates.discountText = body.discountText;

    // Validate products if updated
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
    }

    // If ad was Rejected, resubmitting resets status to 'Pending Approval'
    if (ad.status === 'Rejected') {
      updates.status = 'Pending Approval';
      updates.rejectionReason = null;
    }

    const updated = db.updateAdvertisement(id, updates);
    db.addActivityLog(`Shop owner (${ownerId}) updated advertisement "${updated.title}" [${id}]`);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Advertisement updated successfully.'
    });
  },

  // PATCH /api/entrepreneurs/me/advertisements/:id/toggle (Protected: requireEntrepreneur)
  toggleEntrepreneurAd(req, res) {
    const ownerId = req.user.entrepreneurId || req.user.userId;
    const { id } = req.params;
    const ad = db.getAdvertisementById(id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        error: 'AD_NOT_FOUND',
        message: `Advertisement '${id}' not found.`
      });
    }

    if (ad.entrepreneurId !== ownerId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_AD_ACCESS',
        message: 'Forbidden: You do not have permission to toggle another entrepreneur\'s advertisement.'
      });
    }

    if (ad.status === 'Pending Approval' || ad.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_AD_STATE',
        message: `Cannot toggle an advertisement in '${ad.status}' status.`
      });
    }

    const newStatus = ad.status === 'Paused' ? 'Active' : 'Paused';
    const updated = db.updateAdvertisement(id, { status: newStatus });
    db.addActivityLog(`Shop owner (${ownerId}) set advertisement "${updated.title}" status=${newStatus}`);

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Advertisement is now ${newStatus}.`
    });
  },

  // DELETE /api/entrepreneurs/me/advertisements/:id (Protected: requireEntrepreneur)
  deleteEntrepreneurAd(req, res) {
    const ownerId = req.user.entrepreneurId || req.user.userId;
    const { id } = req.params;
    const ad = db.getAdvertisementById(id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        error: 'AD_NOT_FOUND',
        message: `Advertisement '${id}' not found.`
      });
    }

    if (ad.entrepreneurId !== ownerId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_AD_ACCESS',
        message: 'Forbidden: You do not have permission to delete another entrepreneur\'s advertisement.'
      });
    }

    const removed = db.deleteAdvertisement(id);
    db.addActivityLog(`Shop owner (${ownerId}) deleted advertisement "${removed.title}" [${id}]`);

    return res.status(200).json({
      success: true,
      message: `Advertisement "${removed.title}" was deleted successfully.`
    });
  },

  // GET /api/entrepreneurs/me/advertisements/:id/performance (Protected: requireEntrepreneur)
  getAdPerformance(req, res) {
    const ownerId = req.user.entrepreneurId || req.user.userId;
    const { id } = req.params;
    const ad = db.getAdvertisementById(id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        error: 'AD_NOT_FOUND',
        message: `Advertisement '${id}' not found.`
      });
    }

    if (ad.entrepreneurId !== ownerId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_AD_ACCESS',
        message: 'Forbidden: You do not have permission to view performance data for this advertisement.'
      });
    }

    const impressions = ad.impressions || 0;
    const clicks = ad.clicks || 0;
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) + '%' : '0.0%';

    return res.status(200).json({
      success: true,
      data: {
        id: ad.id,
        title: ad.title,
        status: ad.status,
        impressions,
        clicks,
        ctr,
        ordersAttributed: ad.ordersAttributed || 0,
        startDate: ad.startDate,
        endDate: ad.endDate
      }
    });
  },

  // -------------------------------------------------------------------
  // ADMIN REVIEW & MODERATION (Protected: requireAdmin)
  // -------------------------------------------------------------------

  // GET /api/admin/advertisements (Protected: requireAdmin)
  getAdminAds(req, res) {
    const status = req.query && req.query.status;
    const ads = db.getAdvertisements(status ? { status } : {});

    return res.status(200).json({
      success: true,
      count: ads.length,
      data: ads
    });
  },

  // PATCH /api/admin/advertisements/:id/review (Protected: requireAdmin)
  reviewAdminAd(req, res) {
    const { id } = req.params;
    const { status, rejectionReason, reviewNotes } = req.body || {};

    if (!['Approved', 'Rejected', 'Paused', 'Active'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Status must be one of "Approved", "Rejected", "Paused", or "Active".'
      });
    }

    const ad = db.getAdvertisementById(id);
    if (!ad) {
      return res.status(404).json({
        success: false,
        error: 'AD_NOT_FOUND',
        message: `Advertisement '${id}' not found.`
      });
    }

    const updates = {
      status,
      rejectionReason: status === 'Rejected' ? (rejectionReason || 'Does not comply with community guidelines') : null,
      reviewNotes: reviewNotes || null,
      reviewedAt: new Date().toISOString()
    };

    const updated = db.updateAdvertisement(id, updates);

    // In-App Notification to Entrepreneur
    if (status === 'Approved') {
      db.createNotification({
        title: '🎉 Advertisement Approved!',
        message: `Your advertisement "${updated.title}" was reviewed and approved by Platform Admin. It is now live in the customer carousel!`,
        type: 'success',
        entrepreneurId: updated.entrepreneurId
      });
    } else if (status === 'Rejected') {
      db.createNotification({
        title: '⚠️ Advertisement Requires Changes',
        message: `Your advertisement "${updated.title}" was not approved. Reason: ${updates.rejectionReason}. You can edit and resubmit.`,
        type: 'error',
        entrepreneurId: updated.entrepreneurId
      });
    }

    db.addActivityLog(`Admin reviewed advertisement "${updated.title}" [${id}]: status=${status}, reason="${updates.rejectionReason || 'Approved'}"`);

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Advertisement has been ${status.toLowerCase()} successfully.`
    });
  },

  // DELETE /api/admin/advertisements/:id (Protected: requireAdmin)
  deleteAdminAd(req, res) {
    const { id } = req.params;
    const removed = db.deleteAdvertisement(id);

    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'AD_NOT_FOUND',
        message: `Advertisement '${id}' not found.`
      });
    }

    db.addActivityLog(`Admin deleted advertisement "${removed.title}" [${id}]`);

    return res.status(200).json({
      success: true,
      message: `Advertisement "${removed.title}" deleted successfully.`
    });
  }
};

module.exports = advertisementController;
