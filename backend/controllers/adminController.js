/* =====================================================================
   MANEYINDA MARUKATTE - ADMIN CONTROLLER
   KYC Document verification queue, honorary badge assignment,
   AI Trend algorithm calculation, category lifecycle management,
   and platform moderation logs.
===================================================================== */

const db = require('../models/db');

const adminController = {
  // GET /api/admin/verification-queue
  getVerificationQueue(req, res) {
    const pendingList = db.getEntrepreneurs('pending');
    return res.status(200).json({
      success: true,
      count: pendingList.length,
      data: pendingList
    });
  },

  // POST /api/admin/verify/:id
  verifyEntrepreneur(req, res) {
    const { id } = req.params;
    const { decision, reason } = req.body || {};

    const entrepreneur = db.getEntrepreneurById(id);
    if (!entrepreneur) {
      return res.status(404).json({
        success: false,
        error: 'ENTREPRENEUR_NOT_FOUND',
        message: `Entrepreneur with ID '${id}' was not found.`
      });
    }

    let newStatus = entrepreneur.status;
    let logMsg = '';

    if (decision === 'approve') {
      newStatus = 'approved';
      logMsg = `Approved entrepreneur application: "${entrepreneur.businessName}"`;
    } else if (decision === 'reject') {
      newStatus = 'rejected';
      logMsg = `Rejected entrepreneur application: "${entrepreneur.businessName}" (${reason || 'Documents unverified'})`;
    } else if (decision === 'request_info') {
      newStatus = 'pending';
      logMsg = `Requested more information from "${entrepreneur.businessName}": ${reason || 'Incomplete submission'}`;
    } else {
      return res.status(400).json({
        success: false,
        error: 'INVALID_DECISION',
        message: "Decision must be 'approve', 'reject', or 'request_info'."
      });
    }

    const updated = db.updateEntrepreneur(id, {
      status: newStatus,
      verificationNote: reason || '',
      verifiedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    });

    db.addActivityLog(logMsg);

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Entrepreneur status successfully updated to '${newStatus}'.`
    });
  },

  // POST /api/admin/assign-badge/:id
  assignBadge(req, res) {
    const { id } = req.params;
    const { badge } = req.body || {};

    const validBadges = ['Best Entrepreneur', 'Rising Star', 'Top Rated', 'Verified', 'Community Champion'];
    if (!badge || !validBadges.includes(badge)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_BADGE',
        message: `Badge must be one of: ${validBadges.join(', ')}`
      });
    }

    const entrepreneur = db.getEntrepreneurById(id);
    if (!entrepreneur) {
      return res.status(404).json({
        success: false,
        error: 'ENTREPRENEUR_NOT_FOUND',
        message: `Entrepreneur with ID '${id}' was not found.`
      });
    }

    const updated = db.updateEntrepreneur(id, { badge });
    db.addActivityLog(`Assigned "${badge}" badge to ${entrepreneur.businessName}`);

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Honorary badge '${badge}' assigned successfully.`
    });
  },

  // GET /api/admin/ai-trends
  getAiTrends(req, res) {
    // Formula from requirement: AI Trend Score = (Orders * 0.6) + (Rating * 0.3) + (Recent * 0.1)
    const products = db.getProducts({ activeOnly: false });
    const entrepreneurs = db.getEntrepreneurs('approved');

    const rankedProducts = products.map(prod => {
      const orders = prod.ordersCount || 0;
      const rating = prod.rating || 5.0;
      // Recency metric normalized
      const recentFactor = orders > 10 ? 10 : orders;
      const score = ((orders * 0.6) + (rating * 0.3) + (recentFactor * 0.1)).toFixed(2);

      return {
        id: prod.id,
        name: prod.name,
        category: prod.category,
        storeName: prod.storeName,
        price: prod.price,
        ordersCount: orders,
        rating: rating,
        trendScore: parseFloat(score),
        isHotDeal: parseFloat(score) > 15
      };
    }).sort((a, b) => b.trendScore - a.trendScore);

    const rankedEntrepreneurs = entrepreneurs.map(ent => {
      const orders = ent.completedOrdersCount || 0;
      const rating = ent.rating || 5.0;
      const score = ((orders * 0.6) + (rating * 0.3) + (ent.positiveReviewsCount || 0) * 0.1).toFixed(2);

      return {
        id: ent.id,
        businessName: ent.businessName,
        name: ent.name,
        badge: ent.badge,
        category: ent.businessCategory,
        rating: rating,
        completedOrders: orders,
        trendScore: parseFloat(score)
      };
    }).sort((a, b) => b.trendScore - a.trendScore);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      formula: 'Score = (Orders * 0.6) + (Rating * 0.3) + (Recency/Positive * 0.1)',
      data: {
        topTrendingProducts: rankedProducts.slice(0, 10),
        topEntrepreneurs: rankedEntrepreneurs.slice(0, 5),
        recommendedPromotions: rankedProducts.filter(p => p.trendScore > 20).slice(0, 3)
      }
    });
  },

  // GET /api/admin/categories
  getCategories(req, res) {
    const categories = db.getCategories(false);
    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  },

  // POST /api/admin/categories
  createCategory(req, res) {
    const { name, icon, tamilName, kannadaName } = req.body || {};
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CATEGORY_NAME',
        message: 'Category name is required.'
      });
    }

    const newCategory = db.addCategory({
      name: name.trim(),
      icon: icon || 'category',
      kannadaName: kannadaName || name.trim(),
      active: true
    });

    db.addActivityLog(`Admin created new category: "${newCategory.name}"`);

    return res.status(201).json({
      success: true,
      data: newCategory,
      message: 'Category added successfully.'
    });
  },

  // PATCH /api/admin/categories/:id/toggle
  toggleCategory(req, res) {
    const { id } = req.params;
    const cat = (db.data.categories || []).find(c => c.id === id);

    if (!cat) {
      return res.status(404).json({
        success: false,
        error: 'CATEGORY_NOT_FOUND',
        message: `Category with ID '${id}' was not found.`
      });
    }

    const updated = db.updateCategory(id, { active: !cat.active });
    db.addActivityLog(`Category "${cat.name}" toggled to ${updated.active ? 'ACTIVE' : 'INACTIVE'}`);

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Category is now ${updated.active ? 'active' : 'inactive'}.`
    });
  },

  // GET /api/admin/logs
  getActivityLogs(req, res) {
    const logs = db.getActivityLogs();
    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  },

  // GET /api/admin/reports
  getReportedProducts(req, res) {
    const reports = db.getReportedProducts();
    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  },

  // POST /api/admin/reports/:index/dismiss
  dismissReport(req, res) {
    const index = parseInt(req.params.index, 10);
    db.dismissReport(index);
    return res.status(200).json({
      success: true,
      message: 'Report dismissed.'
    });
  }
};

module.exports = adminController;
