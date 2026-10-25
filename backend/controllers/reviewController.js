/* =====================================================================
   MANEYINDA MARUKATTE - REVIEW CONTROLLER
   Verified-buyer rating calculations, photo attachments, and
   customer feedback management.
===================================================================== */

const db = require('../models/db');

const reviewController = {
  // GET /api/reviews
  getReviews(req, res) {
    const { productId, entrepreneurId } = req.query || {};
    const reviews = db.getReviews(productId || null, entrepreneurId || null);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  },

  // POST /api/reviews
  createReview(req, res) {
    const body = req.body || {};
    const { orderId, productId, customerName, rating, comment, photos } = body;

    if (!orderId || !productId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REVIEW_FIELDS',
        message: 'Order ID, Product ID, and numeric rating (1-5) are required.'
      });
    }

    const order = db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: `Order #${orderId} does not exist.`
      });
    }

    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({
        success: false,
        error: 'ORDER_NOT_DELIVERED',
        message: 'Reviews can only be submitted for completed/delivered orders.'
      });
    }

    if (order.reviewSubmitted) {
      return res.status(400).json({
        success: false,
        error: 'ALREADY_REVIEWED',
        message: 'You have already submitted a review for this order.'
      });
    }

    const ratingNum = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));

    const newReview = db.createReview({
      orderId,
      productId,
      customerName: customerName || order.customerName || 'Verified Buyer',
      rating: ratingNum,
      comment: (comment || '').trim(),
      photos: Array.isArray(photos) ? photos : [],
      verifiedPurchase: true
    });

    db.addActivityLog(`New ${ratingNum}★ review submitted for order #${orderId}`);

    return res.status(201).json({
      success: true,
      data: newReview,
      message: 'Review published successfully.'
    });
  },

  // DELETE /api/reviews/:id
  deleteReview(req, res) {
    const { id } = req.params;
    const deleted = db.deleteReview(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'REVIEW_NOT_FOUND',
        message: `Review with ID '${id}' was not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully.'
    });
  }
};

module.exports = reviewController;
