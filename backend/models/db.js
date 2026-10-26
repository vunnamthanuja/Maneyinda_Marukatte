/* =====================================================================
   MANEYINDA MARUKATTE - DATABASE PERSISTENCE LAYER
   Atomic file-based JSON store for local & server environments
===================================================================== */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');
const SEED_FILE = path.join(__dirname, '..', 'data', 'seed.json');

class Database {
  constructor() {
    this.data = this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[DB] Failed to read db.json, falling back to seed.json', e.message);
    }

    try {
      const seedRaw = fs.readFileSync(SEED_FILE, 'utf8');
      const seedData = JSON.parse(seedRaw);
      this.persist(seedData);
      return seedData;
    } catch (err) {
      console.error('[DB] Failed to load seed.json', err.message);
      return {
        users: [],
        categories: [],
        entrepreneurs: [],
        products: [],
        orders: [],
        reviews: [],
        supportTickets: [],
        activityLogs: [],
        reportedProducts: []
      };
    }
  }

  save(dataToSave = null) {
    return this.persist(dataToSave);
  }

  persist(dataToSave = null) {
    if (dataToSave) this.data = dataToSave;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('[DB] Write failed to db.json', e.message);
    }
  }

  // -------------------------------------------------------------
  // USERS
  // -------------------------------------------------------------
  findUserByEmail(email) {
    if (!email) return null;
    return (this.data.users || []).find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }

  getUserById(id) {
    return (this.data.users || []).find(u => u.id === id) || null;
  }

  createUser(userData) {
    const newUser = {
      id: 'cust_' + Date.now(),
      savedAddresses: [],
      wishlist: [],
      cart: [],
      ...userData
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  updateUser(id, updates) {
    const idx = (this.data.users || []).findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.persist();
      return this.data.users[idx];
    }
    return null;
  }

  // -------------------------------------------------------------
  // CATEGORIES
  // -------------------------------------------------------------
  getCategories(activeOnly = false) {
    let cats = this.data.categories || [];
    if (activeOnly) {
      cats = cats.filter(c => c.active);
    }
    return cats;
  }

  addCategory(categoryData) {
    const newCat = {
      id: 'cat_' + Date.now(),
      active: true,
      icon: 'category',
      ...categoryData
    };
    this.data.categories.push(newCat);
    this.persist();
    return newCat;
  }

  updateCategory(id, updates) {
    const idx = (this.data.categories || []).findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
      this.persist();
      return this.data.categories[idx];
    }
    return null;
  }

  // -------------------------------------------------------------
  // ENTREPRENEURS
  // -------------------------------------------------------------
  getEntrepreneurs(status = null) {
    let list = this.data.entrepreneurs || [];
    if (status) {
      list = list.filter(e => e.status.toLowerCase() === status.toLowerCase());
    }
    return list;
  }

  getEntrepreneurById(id) {
    return (this.data.entrepreneurs || []).find(e => e.id === id) || null;
  }

  findEntrepreneur(identifier) {
    if (!identifier) return null;
    const clean = identifier.toLowerCase().trim();
    return (this.data.entrepreneurs || []).find(e => 
      e.username.toLowerCase() === clean || 
      e.email.toLowerCase() === clean ||
      e.phone === clean
    ) || null;
  }

  createEntrepreneur(data) {
    const newEnt = {
      id: 'ent_' + Date.now(),
      status: 'pending',
      badge: 'Verified',
      isStoreOpen: true,
      openingSchedule: 'Opens Daily at 9:00 AM',
      rating: 5.0,
      reviewCount: 0,
      completedOrdersCount: 0,
      positiveReviewsCount: 0,
      negativeReviewsCount: 0,
      complaintsCount: 0,
      appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      ...data
    };
    this.data.entrepreneurs.push(newEnt);
    this.persist();
    return newEnt;
  }

  updateEntrepreneur(id, updates) {
    const idx = (this.data.entrepreneurs || []).findIndex(e => e.id === id);
    if (idx !== -1) {
      this.data.entrepreneurs[idx] = { ...this.data.entrepreneurs[idx], ...updates };
      this.persist();
      return this.data.entrepreneurs[idx];
    }
    return null;
  }

  // -------------------------------------------------------------
  // PRODUCTS
  // -------------------------------------------------------------
  getProducts(filter = {}) {
    let prods = this.data.products || [];
    if (filter.activeOnly) {
      prods = prods.filter(p => p.status === 'active');
    }
    if (filter.category) {
      prods = prods.filter(p => p.category.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.entrepreneurId) {
      prods = prods.filter(p => p.entrepreneurId === filter.entrepreneurId);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      prods = prods.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    return prods;
  }

  getProductById(id) {
    return (this.data.products || []).find(p => p.id === id) || null;
  }

  createProduct(prodData) {
    const newProd = {
      id: 'prod_' + Date.now(),
      views: 0,
      ordersCount: 0,
      rating: 5.0,
      reviewCount: 0,
      status: 'active',
      images: prodData.images && prodData.images.length > 0 ? prodData.images : ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'],
      ...prodData
    };
    this.data.products.push(newProd);
    this.persist();
    return newProd;
  }

  updateProduct(id, updates) {
    const idx = (this.data.products || []).findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.products[idx] = { ...this.data.products[idx], ...updates };
      this.persist();
      return this.data.products[idx];
    }
    return null;
  }

  deleteProduct(id) {
    const idx = (this.data.products || []).findIndex(p => p.id === id);
    if (idx !== -1) {
      const removed = this.data.products.splice(idx, 1)[0];
      this.persist();
      return removed;
    }
    return null;
  }

  // -------------------------------------------------------------
  // ORDERS
  // -------------------------------------------------------------
  getOrders(filter = {}) {
    let list = this.data.orders || [];
    if (filter.customerId) {
      list = list.filter(o => o.customerId === filter.customerId);
    }
    if (filter.entrepreneurId) {
      list = list.filter(o => o.entrepreneurId === filter.entrepreneurId);
    }
    if (filter.status) {
      list = list.filter(o => o.orderStatus.toLowerCase() === filter.status.toLowerCase());
    }
    return list;
  }

  getOrderById(id) {
    return (this.data.orders || []).find(o => o.id === id) || null;
  }

  createOrder(orderData) {
    const newOrder = {
      id: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      orderStatus: 'New',
      reviewSubmitted: false,
      refundRequest: null,
      replacementRequest: null,
      ...orderData
    };
    this.data.orders.unshift(newOrder);

    // Deduct stock for each purchased item
    (newOrder.items || []).forEach(item => {
      const prod = this.getProductById(item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.qty);
        prod.ordersCount = (prod.ordersCount || 0) + item.qty;
        if (prod.stock === 0) prod.status = 'out_of_stock';
      }
    });

    this.persist();
    return newOrder;
  }

  updateOrderStatus(orderId, status) {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    order.orderStatus = status;
    if (status === 'Delivered') {
      order.deliveredDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const exp = new Date();
      exp.setDate(exp.getDate() + 3);
      order.supportWindowExpiresDate = exp.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    this.persist();
    return order;
  }

  updateOrder(id, updates) {
    const idx = (this.data.orders || []).findIndex(o => o.id === id);
    if (idx !== -1) {
      this.data.orders[idx] = { ...this.data.orders[idx], ...updates };
      this.persist();
      return this.data.orders[idx];
    }
    return null;
  }

  getOrderByRazorpayOrderId(rzpOrderId) {
    if (!rzpOrderId) return null;
    return (this.data.orders || []).find(o => o.razorpayOrderId === rzpOrderId || (o.paymentDetails && o.paymentDetails.orderId === rzpOrderId)) || null;
  }

  getOrderByRazorpayPaymentId(rzpPaymentId) {
    if (!rzpPaymentId) return null;
    return (this.data.orders || []).find(o => o.razorpayPaymentId === rzpPaymentId || (o.paymentDetails && o.paymentDetails.paymentId === rzpPaymentId)) || null;
  }

  // -------------------------------------------------------------
  // REVIEWS
  // -------------------------------------------------------------
  getReviews(productId = null, entrepreneurId = null) {
    let revs = this.data.reviews || [];
    if (productId) {
      revs = revs.filter(r => r.productId === productId);
    }
    if (entrepreneurId) {
      const prodIds = this.getProducts({ entrepreneurId }).map(p => p.id);
      revs = revs.filter(r => prodIds.includes(r.productId));
    }
    return revs;
  }

  createReview(reviewData) {
    const newRev = {
      id: 'rev_' + Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      photos: [],
      ...reviewData
    };
    this.data.reviews.unshift(newRev);

    // Mark order as reviewed
    const order = this.getOrderById(reviewData.orderId);
    if (order) order.reviewSubmitted = true;

    // Recalculate product rating
    const prodReviews = this.getReviews(reviewData.productId);
    const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    const prod = this.getProductById(reviewData.productId);
    if (prod) {
      prod.rating = parseFloat(avg.toFixed(1));
      prod.reviewCount = prodReviews.length;
    }

    this.persist();
    return newRev;
  }

  deleteReview(id) {
    const idx = (this.data.reviews || []).findIndex(r => r.id === id);
    if (idx !== -1) {
      const removed = this.data.reviews.splice(idx, 1)[0];
      const prodReviews = this.getReviews(removed.productId);
      const prod = this.getProductById(removed.productId);
      if (prod) {
        prod.reviewCount = prodReviews.length;
        prod.rating = prodReviews.length > 0 
          ? parseFloat((prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length).toFixed(1))
          : 5.0;
      }
      this.persist();
      return removed;
    }
    return null;
  }

  // -------------------------------------------------------------
  // SUPPORT TICKETS
  // -------------------------------------------------------------
  getSupportTickets(customerId = null) {
    let tickets = this.data.supportTickets || [];
    if (customerId) {
      tickets = tickets.filter(t => t.customerId === customerId);
    }
    return tickets;
  }

  createSupportTicket(ticketData) {
    const newTicket = {
      id: 'SUP-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Open',
      adminNotes: '',
      ...ticketData
    };
    this.data.supportTickets.unshift(newTicket);
    this.persist();
    return newTicket;
  }

  updateSupportTicket(id, updates) {
    const idx = (this.data.supportTickets || []).findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.supportTickets[idx] = { ...this.data.supportTickets[idx], ...updates };
      this.persist();
      return this.data.supportTickets[idx];
    }
    return null;
  }

  // -------------------------------------------------------------
  // ADMIN LOGS & MODERATION
  // -------------------------------------------------------------
  getActivityLogs() {
    return this.data.activityLogs || [];
  }

  addActivityLog(text) {
    const log = {
      id: 'act_' + Date.now(),
      text,
      time: 'Just now'
    };
    this.data.activityLogs.unshift(log);
    if (this.data.activityLogs.length > 50) this.data.activityLogs.pop();
    this.persist();
    return log;
  }

  getReportedProducts() {
    return this.data.reportedProducts || [];
  }

  addReportedProduct(reportData) {
    this.data.reportedProducts.push(reportData);
    this.persist();
  }

  dismissReport(index) {
    if (index >= 0 && index < this.data.reportedProducts.length) {
      this.data.reportedProducts.splice(index, 1);
      this.persist();
    }
  }

  // -------------------------------------------------------------
  // PROMOTIONAL OFFERS & ANNOUNCEMENTS
  // -------------------------------------------------------------
  getOffers(filter = {}) {
    let list = this.data.offers || [];

    if (filter.entrepreneurId) {
      list = list.filter(o => o.entrepreneurId === filter.entrepreneurId);
    }

    if (filter.activeOnly) {
      const now = new Date();
      list = list.filter(o => {
        if (!o.active) return false;
        if (o.moderationStatus === 'deactivated') return false;
        if (o.startDate && new Date(o.startDate) > now) return false;
        if (o.endDate && new Date(o.endDate) < now) return false;
        if (o.validFrom && new Date(o.validFrom) > now) return false;
        if (o.validUntil && new Date(o.validUntil) < now) return false;
        if (o.usageLimit && (o.usageCount || 0) >= o.usageLimit) return false;
        return true;
      });
    }

    if (filter.bannerOnly) {
      list = list.filter(o => o.bannerEnabled !== false && o.moderationStatus !== 'deactivated');
    }

    return list;
  }

  getOfferById(id) {
    return (this.data.offers || []).find(o => o.id === id) || null;
  }

  getOfferByCode(code) {
    if (!code) return null;
    return (this.data.offers || []).find(o => (o.code || '').toUpperCase() === code.trim().toUpperCase()) || null;
  }

  createOffer(offerData) {
    const newOffer = {
      id: 'OFFER-' + Math.floor(1000 + Math.random() * 9000),
      code: (offerData.code || '').toUpperCase().trim(),
      title: offerData.title,
      description: offerData.description || '',
      discountType: offerData.discountType || 'percentage',
      discountValue: Number(offerData.discountValue) || 10,
      maxDiscount: offerData.maxDiscount ? Number(offerData.maxDiscount) : null,
      minOrderAmount: Number(offerData.minOrderAmount) || 0,
      scope: offerData.scope || 'global',
      entrepreneurId: offerData.entrepreneurId || null,
      storeName: offerData.storeName || null,
      productIds: Array.isArray(offerData.productIds) ? offerData.productIds : (offerData.targetProductId ? [offerData.targetProductId] : []),
      targetCategory: offerData.targetCategory || null,
      targetProductId: offerData.targetProductId || (Array.isArray(offerData.productIds) && offerData.productIds[0]) || null,
      targetEntrepreneurId: offerData.targetEntrepreneurId || offerData.entrepreneurId || null,
      badgeText: offerData.badgeText || (offerData.discountType === 'fixed' || offerData.discountType === 'flat' ? `₹${offerData.discountValue} OFF` : `${offerData.discountValue}% OFF`),
      startDate: offerData.startDate || new Date().toISOString(),
      endDate: offerData.endDate || null,
      usageLimit: offerData.usageLimit ? Number(offerData.usageLimit) : null,
      usageCount: 0,
      ordersCount: 0,
      totalSavedAmount: 0,
      active: typeof offerData.active === 'boolean' ? offerData.active : true,
      bannerEnabled: typeof offerData.bannerEnabled === 'boolean' ? offerData.bannerEnabled : true,
      bannerColor: offerData.bannerColor || '#4A6B32',
      icon: offerData.icon || 'local_offer',
      ctaText: offerData.ctaText || 'Shop Now',
      ctaLink: offerData.ctaLink || (offerData.entrepreneurId ? `screen-customer-home` : 'screen-customer-home'),
      moderationStatus: offerData.moderationStatus || 'approved',
      moderationReason: offerData.moderationReason || null,
      createdAt: new Date().toISOString(),
      ...offerData
    };

    if (!this.data.offers) this.data.offers = [];
    this.data.offers.unshift(newOffer);
    this.persist();
    return newOffer;
  }

  updateOffer(id, updates) {
    const idx = (this.data.offers || []).findIndex(o => o.id === id);
    if (idx !== -1) {
      if (updates.code) updates.code = updates.code.toUpperCase().trim();
      this.data.offers[idx] = { ...this.data.offers[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      return this.data.offers[idx];
    }
    return null;
  }

  recordOfferUsage(offerIdOrCode, discountAmount = 0) {
    const offer = this.getOfferById(offerIdOrCode) || this.getOfferByCode(offerIdOrCode);
    if (offer) {
      offer.usageCount = (offer.usageCount || 0) + 1;
      offer.ordersCount = (offer.ordersCount || 0) + 1;
      offer.totalSavedAmount = (offer.totalSavedAmount || 0) + (Number(discountAmount) || 0);
      offer.updatedAt = new Date().toISOString();
      this.persist();
      return offer;
    }
    return null;
  }

  deleteOffer(id) {
    const idx = (this.data.offers || []).findIndex(o => o.id === id);
    if (idx !== -1) {
      const removed = this.data.offers.splice(idx, 1)[0];
      this.persist();
      return removed;
    }
    return null;
  }

  getAnnouncements() {
    return this.data.promotionalAnnouncements || [];
  }

  calculateDiscountForCart(offer, items, customerId, subtotal) {
    if (!offer || !offer.active) {
      return { valid: false, error: 'OFFER_INACTIVE', message: 'This promotional offer is currently inactive.' };
    }

    if (offer.moderationStatus === 'deactivated') {
      return { valid: false, error: 'OFFER_DEACTIVATED', message: 'This promotional offer is no longer available.' };
    }

    const now = new Date();
    if (offer.startDate && new Date(offer.startDate) > now) {
      return { valid: false, error: 'OFFER_NOT_STARTED', message: 'This promotional offer has not started yet.' };
    }
    if (offer.endDate && new Date(offer.endDate) < now) {
      return { valid: false, error: 'OFFER_EXPIRED', message: 'This promotional offer has expired.' };
    }
    if (offer.validFrom && new Date(offer.validFrom) > now) {
      return { valid: false, error: 'OFFER_NOT_STARTED', message: 'This promotional offer has not started yet.' };
    }
    if (offer.validUntil && new Date(offer.validUntil) < now) {
      return { valid: false, error: 'OFFER_EXPIRED', message: 'This promotional offer has expired.' };
    }

    if (offer.usageLimit && (offer.usageCount || 0) >= offer.usageLimit) {
      return {
        valid: false,
        error: 'USAGE_LIMIT_EXCEEDED',
        message: 'This promotional offer has reached its maximum redemption limit.'
      };
    }

    if (subtotal < (offer.minOrderAmount || 0)) {
      return {
        valid: false,
        error: 'MIN_AMOUNT_NOT_MET',
        message: `Minimum order subtotal of ₹${offer.minOrderAmount} required for this coupon.`
      };
    }

    let eligibleAmount = 0;

    if (offer.scope === 'first_order') {
      const pastOrders = (this.data.orders || []).filter(o => 
        o.customerId === customerId && 
        o.orderStatus !== 'Cancelled' && 
        o.orderStatus !== 'Pending Payment' &&
        o.paymentStatus === 'Paid'
      );
      if (pastOrders.length > 0) {
        return {
          valid: false,
          error: 'FIRST_ORDER_ONLY',
          message: 'The coupon WELCOME10 is valid exclusively on your very first order.'
        };
      }
      eligibleAmount = subtotal;
    } else if (offer.scope === 'shop') {
      const targetEntId = offer.entrepreneurId || offer.targetEntrepreneurId;
      const matchingItems = (items || []).filter(i => {
        const prod = this.getProductById(i.productId);
        return prod && prod.entrepreneurId === targetEntId;
      });
      if (matchingItems.length === 0) {
        return {
          valid: false,
          error: 'SHOP_MISMATCH',
          message: `This coupon applies only to items from "${offer.storeName || 'the participating shop'}".`
        };
      }
      eligibleAmount = matchingItems.reduce((sum, item) => {
        const prod = this.getProductById(item.productId);
        return sum + ((prod ? prod.price : item.price) * item.qty);
      }, 0);
    } else if (offer.scope === 'category') {
      const matchingItems = (items || []).filter(i => {
        const prod = this.getProductById(i.productId);
        return prod && prod.category && prod.category.toLowerCase() === (offer.targetCategory || '').toLowerCase();
      });
      if (matchingItems.length === 0) {
        return {
          valid: false,
          error: 'CATEGORY_MISMATCH',
          message: `This offer applies only to products in category "${offer.targetCategory}".`
        };
      }
      eligibleAmount = matchingItems.reduce((sum, item) => {
        const prod = this.getProductById(item.productId);
        return sum + ((prod ? prod.price : item.price) * item.qty);
      }, 0);
    } else if (offer.scope === 'product') {
      const eligibleIds = offer.productIds || (offer.targetProductId ? [offer.targetProductId] : []);
      const matchingItems = (items || []).filter(i => eligibleIds.includes(i.productId));
      if (matchingItems.length === 0) {
        return {
          valid: false,
          error: 'PRODUCT_MISMATCH',
          message: 'This offer applies only to specific promotional products.'
        };
      }
      eligibleAmount = matchingItems.reduce((sum, item) => {
        const prod = this.getProductById(item.productId);
        return sum + ((prod ? prod.price : item.price) * item.qty);
      }, 0);
    } else {
      eligibleAmount = subtotal;
    }

    let discount = 0;
    if (offer.discountType === 'percentage') {
      discount = Math.round((eligibleAmount * offer.discountValue) / 100);
      if (offer.maxDiscount && Number(offer.maxDiscount) > 0) {
        discount = Math.min(discount, Number(offer.maxDiscount));
      }
    } else {
      discount = Math.min(offer.discountValue, eligibleAmount);
    }

    return {
      valid: true,
      discountAmount: discount,
      eligibleAmount,
      offerCode: offer.code,
      offerTitle: offer.title,
      badgeText: offer.badgeText
    };
  }

  // -------------------------------------------------------------
  // ENTREPRENEUR-UPLOADED ADVERTISEMENTS
  // -------------------------------------------------------------
  getAdvertisements(filter = {}) {
    let list = this.data.advertisements || [];
    const now = new Date();

    if (filter.entrepreneurId) {
      list = list.filter(ad => ad.entrepreneurId === filter.entrepreneurId);
    }

    if (filter.publicOnly) {
      list = list.filter(ad => {
        if (ad.status !== 'Approved' && ad.status !== 'Active') return false;
        if (ad.startDate && new Date(ad.startDate) > now) return false;
        if (ad.endDate && new Date(ad.endDate) < now) return false;
        return true;
      });
    }

    if (filter.status) {
      list = list.filter(ad => (ad.status || '').toLowerCase() === filter.status.toLowerCase());
    }

    if (filter.placement) {
      list = list.filter(ad => !ad.placement || ad.placement === filter.placement || ad.placement === 'all');
    }

    if (filter.category) {
      list = list.filter(ad => !ad.targetCategory || ad.targetCategory.toLowerCase() === filter.category.toLowerCase());
    }

    return list;
  }

  getAdvertisementById(id) {
    return (this.data.advertisements || []).find(ad => ad.id === id) || null;
  }

  createAdvertisement(adData) {
    const newAd = {
      id: 'AD-' + Math.floor(1000 + Math.random() * 9000),
      entrepreneurId: adData.entrepreneurId,
      storeName: adData.storeName || 'Local Shop',
      title: adData.title,
      description: adData.description || '',
      imageUrl: adData.imageUrl || null,
      videoUrl: adData.videoUrl || null,
      mediaType: adData.mediaType || (adData.videoUrl ? 'video' : 'image'),
      adType: adData.adType || 'Shop Promotion',
      placement: adData.placement || 'home_carousel',
      targetCategory: adData.targetCategory || null,
      productIds: Array.isArray(adData.productIds) ? adData.productIds : [],
      offerId: adData.offerId || null,
      couponCode: adData.couponCode || null,
      discountText: adData.discountText || null,
      ctaText: adData.ctaText || 'Shop Now',
      ctaTarget: adData.ctaTarget || 'shop',
      targetId: adData.targetId || adData.entrepreneurId,
      startDate: adData.startDate || new Date().toISOString(),
      endDate: adData.endDate || null,
      status: adData.status || 'Pending Approval',
      rejectionReason: null,
      reviewNotes: null,
      impressions: 0,
      clicks: 0,
      ordersAttributed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!this.data.advertisements) this.data.advertisements = [];
    this.data.advertisements.unshift(newAd);
    this.persist();
    return newAd;
  }

  updateAdvertisement(id, updates) {
    const idx = (this.data.advertisements || []).findIndex(ad => ad.id === id);
    if (idx !== -1) {
      this.data.advertisements[idx] = {
        ...this.data.advertisements[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.persist();
      return this.data.advertisements[idx];
    }
    return null;
  }

  deleteAdvertisement(id) {
    const idx = (this.data.advertisements || []).findIndex(ad => ad.id === id);
    if (idx !== -1) {
      const removed = this.data.advertisements.splice(idx, 1)[0];
      this.persist();
      return removed;
    }
    return null;
  }

  recordAdImpression(id) {
    const ad = this.getAdvertisementById(id);
    if (ad) {
      ad.impressions = (ad.impressions || 0) + 1;
      this.persist();
      return ad.impressions;
    }
    return 0;
  }

  recordAdClick(id) {
    const ad = this.getAdvertisementById(id);
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
      this.persist();
      return ad.clicks;
    }
    return 0;
  }

  recordAdOrder(id) {
    const ad = this.getAdvertisementById(id);
    if (ad) {
      ad.ordersAttributed = (ad.ordersAttributed || 0) + 1;
      this.persist();
      return ad.ordersAttributed;
    }
    return 0;
  }

  // -------------------------------------------------------------
  // NOTIFICATIONS SYSTEM
  // -------------------------------------------------------------
  getNotifications(filter = {}) {
    let list = this.data.notifications || [];
    if (filter.entrepreneurId) {
      list = list.filter(n => n.entrepreneurId === filter.entrepreneurId);
    }
    if (filter.userId) {
      list = list.filter(n => n.userId === filter.userId);
    }
    if (filter.role) {
      list = list.filter(n => !n.role || n.role === filter.role);
    }
    return list;
  }

  createNotification(notifData) {
    const newNotif = {
      id: 'NOTIF-' + Date.now(),
      title: notifData.title,
      message: notifData.message,
      type: notifData.type || 'info',
      role: notifData.role || 'entrepreneur',
      entrepreneurId: notifData.entrepreneurId || null,
      userId: notifData.userId || null,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.unshift(newNotif);
    this.persist();
    return newNotif;
  }

  markNotificationRead(id) {
    const notif = (this.data.notifications || []).find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.persist();
      return true;
    }
    return false;
  }

}

module.exports = new Database();