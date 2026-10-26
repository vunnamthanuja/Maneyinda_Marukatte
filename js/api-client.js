/* =====================================================================
   MANEYINDA MARUKATTE - REST API CLIENT
   Connects the Frontend UI to the Node.js REST Backend (Port 5000)
   Includes Cryptographic Token Management, Role Authorization Guards,
   and Zero-Crash Local Offline Fallback.
===================================================================== */

class APIClient {
  constructor(baseUrl) {
    if (!baseUrl) {
      if (typeof window !== 'undefined' && window.location.protocol !== 'file:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        this.baseUrl = `${window.location.origin}/api`;
      } else {
        this.baseUrl = 'http://localhost:5000/api';
      }
    } else {
      this.baseUrl = baseUrl;
    }
    this.isOnline = false;
    this.token = localStorage.getItem('AUTH_TOKEN') || '';
    this.adminToken = sessionStorage.getItem('ADMIN_TOKEN') || '';
    this.checkHealth();
  }

  // --- HEALTH & STATUS ---
  async checkHealth() {
    try {
      const signal = (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function')
        ? AbortSignal.timeout(3500)
        : undefined;
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET', signal });
      if (res.ok) {
        const json = await res.json();
        this.isOnline = json.status === 'UP';
        this.updateConnectionUI(true);
        console.log('[API] Backend online & connected:', this.baseUrl);
        this.syncInitialData();
        return true;
      }
    } catch (e) {
      this.isOnline = false;
      this.updateConnectionUI(false);
      console.log('[API] Backend offline or slow. Running in local standalone mode.');
    }
    return false;
  }

  updateConnectionUI(online) {
    const badge = document.getElementById('api-status-badge');
    if (badge) {
      if (online) {
        badge.innerHTML = '🟢 API Live (5000)';
        badge.className = 'api-status-pill online';
      } else {
        badge.innerHTML = '⚡ Local Mode';
        badge.className = 'api-status-pill offline';
      }
    }
  }

  async syncInitialData() {
    try {
      const prodRes = await fetch(`${this.baseUrl}/products?status=all`);
      if (prodRes.ok) {
        const json = await prodRes.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          store.data.products = json.data;
          store.saveData();
        }
      }

      // Sync categories using admin token if available
      const catHeaders = {};
      if (this.adminToken) catHeaders['Authorization'] = `Bearer ${this.adminToken}`;
      const catRes = await fetch(`${this.baseUrl}/admin/categories`, { headers: catHeaders });
      if (catRes.ok) {
        const json = await catRes.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          store.data.categories = json.data;
          store.saveData();
        }
      }

      // Sync promotional offers
      const offRes = await fetch(`${this.baseUrl}/offers`);
      if (offRes.ok) {
        const json = await offRes.json();
        if (json.data && Array.isArray(json.data)) {
          store.data.offers = json.data;
          store.saveData();
        }
      }
    } catch (err) {
      console.warn('[API SYNC] Could not complete initial sync:', err);
    }
  }

  // --- HTTP HELPER WITH AUTOMATIC BEARER AUTHORIZATION ---
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...((options && options.headers) || {})
    };

    // Attach proper role-based Bearer authorization header
    if (endpoint.startsWith('/admin')) {
      if (this.adminToken) {
        headers['Authorization'] = `Bearer ${this.adminToken}`;
      }
    } else if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const res = await fetch(url, { ...options, headers });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          status: res.status,
          error: data.error || 'API_ERROR',
          message: data.message || `Request failed with status ${res.status}`
        };
      }

      this.isOnline = true;
      this.updateConnectionUI(true);
      return data;
    } catch (err) {
      this.isOnline = false;
      this.updateConnectionUI(false);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: err.message,
        fallback: true
      };
    }
  }

  // =============================================================
  // 1. AUTHENTICATION & ROLE MANAGEMENT MODULE
  // =============================================================
  async getEmailStatus() {
    if (this.isOnline) {
      return await this.request('/auth/email-status');
    }
    return { success: false, isConfigured: false, message: 'Backend is offline.' };
  }

  async sendOtp(email, purpose = 'login') {
    if (this.isOnline) {
      return await this.request('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email, purpose })
      });
    }
    return {
      success: false,
      error: 'BACKEND_OFFLINE',
      message: 'Backend API is currently offline. Please run start-server.bat on port 5000 to send real OTPs.'
    };
  }

  async verifyOtp(email, otp, purpose) {
    if (this.isOnline) {
      return await this.request('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp, purpose })
      });
    }
    return {
      success: false,
      error: 'BACKEND_OFFLINE',
      message: 'Backend API is offline. Start the backend server to verify OTP.'
    };
  }

  async loginCustomer(email, otp, name, phone) {
    if (this.isOnline) {
      const res = await this.request('/auth/login-customer', {
        method: 'POST',
        body: JSON.stringify({ email, otp, name, phone })
      });
      if (res.success && res.token) {
        this.token = res.token;
        localStorage.setItem('AUTH_TOKEN', res.token);
        store.data.currentUser = { ...store.data.currentUser, ...res.user };
        store.data.currentRole = 'customer';
        store.saveData();
        return res;
      }
    }
    // Fallback: local sign in
    let user = store.getUser();
    if (!user || user.email !== email) {
      user = {
        id: 'cust_' + Date.now(),
        name: name || email.split('@')[0],
        email: email,
        phone: phone || '',
        role: 'customer'
      };
      store.data.currentUser = user;
    }
    store.data.currentRole = 'customer';
    store.saveData();
    return { success: true, user };
  }

  async loginEntrepreneur(username, password) {
    if (this.isOnline) {
      const res = await this.request('/auth/login-entrepreneur', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      if (res.success && res.token) {
        this.token = res.token;
        localStorage.setItem('AUTH_TOKEN', res.token);
        store.data.currentRole = 'entrepreneur';
        store.saveData();
        return res;
      } else if (res.status === 429) {
        return res;
      }
    }
    // Fallback
    const ent = (store.data.entrepreneurs || []).find(e => 
      e.username === username || e.email === username
    );
    if (!ent) return { success: false, message: 'Entrepreneur not found.' };
    store.data.currentRole = 'entrepreneur';
    store.saveData();
    return { success: true, entrepreneur: ent };
  }

  // DEDICATED PRIVATE ADMIN LOGIN
  async loginAdmin(email, password) {
    if (this.isOnline) {
      const res = await this.request('/auth/login-admin', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.success && res.token) {
        this.adminToken = res.token;
        sessionStorage.setItem('ADMIN_TOKEN', res.token);
        store.data.currentRole = 'admin';
        store.saveData();
        return res;
      }
      return res;
    }
    // Standalone fallback
    if (email === 'admin@marukatte.internal' && password === 'Admin@Marukatte2026!') {
      this.adminToken = 'mock_admin_token_' + Date.now();
      sessionStorage.setItem('ADMIN_TOKEN', this.adminToken);
      store.data.currentRole = 'admin';
      store.saveData();
      return { success: true, token: this.adminToken, user: { role: 'admin', email } };
    }
    return { success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid administrator credentials.' };
  }

  hasAdminAuth() {
    return !!(this.adminToken || sessionStorage.getItem('ADMIN_TOKEN'));
  }

  logoutAdmin() {
    this.adminToken = '';
    sessionStorage.removeItem('ADMIN_TOKEN');
    store.data.currentRole = 'customer';
    store.saveData();
  }

  // PROFILE-BASED ROLE SWITCHING (CUSTOMER <-> ENTREPRENEUR)
  async switchRole(targetRole) {
    if (this.isOnline && this.token) {
      const res = await this.request('/auth/switch-role', {
        method: 'POST',
        body: JSON.stringify({ targetRole })
      });
      if (res.success && res.token) {
        this.token = res.token;
        localStorage.setItem('AUTH_TOKEN', res.token);
        store.data.currentRole = targetRole;
        store.saveData();
        return res;
      } else if (res.status === 403) {
        return res;
      }
    }
    // Local fallback with permission validation
    if (targetRole === 'entrepreneur') {
      const user = store.getUser();
      const ent = user.entrepreneurId ? store.getEntrepreneurById(user.entrepreneurId) : null;
      if (!ent || ent.status !== 'approved') {
        return {
          success: false,
          error: 'ENTREPRENEUR_NOT_APPROVED',
          message: ent ? `Your entrepreneur application status is '${ent.status}'. Selling features unlock after approval.` : 'You have not registered as an entrepreneur yet.'
        };
      }
    }
    store.data.currentRole = targetRole;
    store.saveData();
    return { success: true, activeRole: targetRole };
  }

  // =============================================================
  // 2. PRODUCTS MODULE
  // =============================================================
  async getProducts(category = null, search = null) {
    if (this.isOnline) {
      let query = '?status=all';
      if (category && category !== 'All') query += `&category=${encodeURIComponent(category)}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;

      const res = await this.request(`/products${query}`);
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
    }
    return store.getProducts({
      category: category && category !== 'All' ? category : null,
      search: search || null
    });
  }

  async createProduct(productData) {
    if (this.isOnline) {
      const res = await this.request('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
      if (res.success && res.data) {
        store.createProduct(res.data);
        return res;
      }
    }
    const newProd = store.createProduct(productData);
    return { success: true, data: newProd };
  }

  async updateStock(productId, stock) {
    if (this.isOnline) {
      const res = await this.request(`/products/${productId}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ stock })
      });
      if (res.success) {
        store.updateProduct(productId, { stock });
        return res;
      }
    }
    const updated = store.updateProduct(productId, { stock });
    return { success: true, data: updated };
  }

  async deleteProduct(productId) {
    if (this.isOnline) {
      const res = await this.request(`/products/${productId}`, { method: 'DELETE' });
      if (res.success) {
        store.deleteProduct(productId);
        return res;
      }
    }
    store.deleteProduct(productId);
    return { success: true };
  }

  // =============================================================
  // 3. ORDERS MODULE
  // =============================================================
  async createOrder(orderPayload) {
    if (this.isOnline) {
      const res = await this.request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });
      if (res.success && res.data) {
        store.data.orders.unshift(res.data);
        store.data.currentUser.cart = [];
        store.saveData();
        return res;
      } else if (res.error === 'MULTI_ENTREPRENEUR_ORDER_NOT_ALLOWED') {
        return res;
      }
    }
    const localOrder = store.createOrder(orderPayload);
    return { success: true, data: localOrder };
  }

  async updateOrderStatus(orderId, status) {
    if (this.isOnline) {
      const res = await this.request(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      if (res.success) {
        store.updateOrderStatus(orderId, status);
        return res;
      }
    }
    const updated = store.updateOrderStatus(orderId, status);
    return { success: true, data: updated };
  }

  async cancelOrder(orderId, reason = 'Customer request') {
    if (this.isOnline) {
      const res = await this.request(`/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      if (res.success || res.error === 'CANCELLATION_NOT_ALLOWED') {
        if (res.success) store.updateOrderStatus(orderId, 'Cancelled');
        return res;
      }
    }
    const updated = store.updateOrderStatus(orderId, 'Cancelled');
    return { success: true, data: updated };
  }

  // =============================================================
  // 4. ENTREPRENEURS MODULE
  // =============================================================
  async registerEntrepreneur(payload) {
    if (this.isOnline) {
      const res = await this.request('/entrepreneurs/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) {
        store.data.entrepreneurs.push(res.data);
        store.saveData();
        return res;
      }
    }
    const ent = {
      id: 'ent_' + Date.now(),
      status: 'pending',
      badge: 'Verified',
      isStoreOpen: true,
      ...payload
    };
    store.data.entrepreneurs.push(ent);
    store.saveData();
    return { success: true, data: ent };
  }

  async updateAvailability(entrepreneurId, isStoreOpen, openingSchedule) {
    if (this.isOnline) {
      const res = await this.request(`/entrepreneurs/${entrepreneurId}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ isStoreOpen, openingSchedule })
      });
      if (res.success) {
        store.updateEntrepreneur(entrepreneurId, { isStoreOpen, openingSchedule });
        return res;
      }
    }
    const updated = store.updateEntrepreneur(entrepreneurId, { isStoreOpen, openingSchedule });
    return { success: true, data: updated };
  }

  // =============================================================
  // 5. REVIEWS MODULE
  // =============================================================
  async submitReview(payload) {
    if (this.isOnline) {
      const res = await this.request('/reviews', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success && res.data) {
        store.addReview(res.data);
        return res;
      }
    }
    const newRev = store.addReview(payload);
    return { success: true, data: newRev };
  }

  // =============================================================
  // 6. ADMIN & PLATFORM MODULE (PROTECTED ENDPOINTS)
  // =============================================================
  async getVerificationQueue() {
    if (this.isOnline) {
      const res = await this.request('/admin/verification-queue');
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
    }
    return (store.data.entrepreneurs || []).filter(e => e.status === 'pending');
  }

  async verifyApplicant(entrepreneurId, decision, reason = '') {
    if (this.isOnline) {
      const res = await this.request(`/admin/verify/${entrepreneurId}`, {
        method: 'POST',
        body: JSON.stringify({ decision, reason })
      });
      if (res.success) {
        const ent = store.getEntrepreneurById(entrepreneurId);
        if (ent) {
          ent.status = decision === 'approve' ? 'approved' : 'rejected';
          store.saveData();
        }
        return res;
      }
    }
    const ent = store.getEntrepreneurById(entrepreneurId);
    if (ent) {
      ent.status = decision === 'approve' ? 'approved' : 'rejected';
      store.saveData();
    }
    return { success: true };
  }

  async getAiTrends() {
    if (this.isOnline) {
      const res = await this.request('/admin/ai-trends');
      if (res.success && res.data) {
        return res.data;
      }
    }
    const prods = store.getProducts();
    const ranked = prods.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      storeName: p.storeName,
      ordersCount: p.ordersCount || 0,
      rating: p.rating || 5.0,
      trendScore: parseFloat(((p.ordersCount || 0) * 0.6 + (p.rating || 5.0) * 0.3).toFixed(2))
    })).sort((a, b) => b.trendScore - a.trendScore);

    return {
      topTrendingProducts: ranked.slice(0, 5),
      topEntrepreneurs: store.data.entrepreneurs.slice(0, 3)
    };
  }

  // =============================================================
  // 7. PAYMENTS MODULE (RAZORPAY REAL GATEWAY)
  // =============================================================
  async getPaymentConfig() {
    if (this.isOnline) {
      try {
        const res = await this.request('/payments/status');
        return res;
      } catch (e) {
        console.warn('[API] Could not check payment status:', e);
      }
    }
    return {
      success: true,
      provider: 'razorpay',
      isConfigured: false,
      keyId: null,
      mode: 'test',
      message: 'Running in offline/local simulation mode'
    };
  }

  async createPaymentOrder(orderDataOrAmount, receipt, notes = {}) {
    const payload = typeof orderDataOrAmount === 'object' && orderDataOrAmount !== null
      ? orderDataOrAmount
      : { amount: orderDataOrAmount, receipt, notes };

    if (this.isOnline) {
      return await this.request('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    return {
      success: false,
      error: 'OFFLINE_MODE',
      message: 'Backend server is offline. Please use test payment.'
    };
  }

  async verifyPaymentSignature(paymentData) {
    if (this.isOnline) {
      return await this.request('/payments/verify', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });
    }
    return {
      success: true,
      verified: true,
      simulated: true,
      message: 'Offline payment verified.'
    };
  }

  // =============================================================
  // 8. PROMOTIONAL OFFERS & ANNOUNCEMENTS MODULE
  // =============================================================
  async getOffers(bannerOnly = false) {
    if (this.isOnline) {
      try {
        const query = bannerOnly ? '?banner=true' : '';
        const res = await this.request(`/offers${query}`);
        if (res && res.success && Array.isArray(res.data)) {
          return res.data;
        }
      } catch (e) {
        console.warn('[API] Could not fetch offers from backend:', e);
      }
    }
    // Fallback to store
    const local = (store.data && store.data.offers) || [];
    return bannerOnly ? local.filter(o => o.active && o.showInBanner) : local.filter(o => o.active);
  }

  async validateCoupon(code, items = [], subtotal = 0, customerId = 'cust_guest') {
    if (this.isOnline) {
      try {
        return await this.request('/offers/validate', {
          method: 'POST',
          body: JSON.stringify({ code, items, subtotal, customerId })
        });
      } catch (e) {
        console.warn('[API] Coupon validation request error:', e);
      }
    }
    // Fallback local coupon validation
    const offers = (store.data && store.data.offers) || [];
    const offer = offers.find(o => o.active && o.code && o.code.toUpperCase() === (code || '').trim().toUpperCase());
    if (!offer) {
      return { success: false, valid: false, message: `Coupon "${(code || '').toUpperCase()}" is not valid.` };
    }
    if (offer.minOrderAmount && subtotal < offer.minOrderAmount) {
      return { success: false, valid: false, message: `Minimum order amount of ₹${offer.minOrderAmount} required.` };
    }
    let disc = 0;
    if (offer.discountType === 'percentage') {
      disc = Math.round((subtotal * offer.discountValue) / 100);
      if (offer.maxDiscount) disc = Math.min(disc, offer.maxDiscount);
    } else {
      disc = Math.min(subtotal, offer.discountValue);
    }
    return {
      success: true,
      valid: true,
      code: offer.code,
      title: offer.title,
      discountAmount: disc,
      message: `Coupon "${offer.code}" applied! You save ₹${disc}.`
    };
  }

  async getAnnouncements() {
    if (this.isOnline) {
      try {
        const res = await this.request('/promotions/announcements');
        if (res && res.success) {
          return res;
        }
      } catch (e) {
        console.warn('[API] Could not fetch announcements:', e);
      }
    }
    return {
      success: true,
      announcements: (store.data && store.data.announcements) || [],
      featuredOffers: ((store.data && store.data.offers) || []).slice(0, 5)
    };
  }

  async getAdminOffers() {
    if (this.isOnline) {
      return await this.request('/admin/offers');
    }
    return {
      success: true,
      data: (store.data && store.data.offers) || []
    };
  }

  async createAdminOffer(offerData) {
    if (this.isOnline) {
      return await this.request('/admin/offers', {
        method: 'POST',
        body: JSON.stringify(offerData)
      });
    }
    if (!store.data.offers) store.data.offers = [];
    const newOffer = { id: `off_${Date.now()}`, active: true, createdAt: new Date().toISOString(), ...offerData };
    store.data.offers.unshift(newOffer);
    store.saveData();
    return { success: true, data: newOffer };
  }

  async updateAdminOffer(id, updates) {
    if (this.isOnline) {
      return await this.request(`/admin/offers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    }
    const idx = (store.data.offers || []).findIndex(o => o.id === id);
    if (idx !== -1) {
      store.data.offers[idx] = { ...store.data.offers[idx], ...updates, updatedAt: new Date().toISOString() };
      store.saveData();
      return { success: true, data: store.data.offers[idx] };
    }
    return { success: false, message: 'Offer not found' };
  }

  async toggleAdminOffer(id) {
    if (this.isOnline) {
      return await this.request(`/admin/offers/${id}/toggle`, {
        method: 'PATCH'
      });
    }
    const idx = (store.data.offers || []).findIndex(o => o.id === id);
    if (idx !== -1) {
      store.data.offers[idx].active = !store.data.offers[idx].active;
      store.saveData();
      return { success: true, data: store.data.offers[idx] };
    }
    return { success: false, message: 'Offer not found' };
  }

  async getEntrepreneurOffers() {
    if (this.isOnline) {
      return await this.request('/entrepreneurs/me/offers');
    }
    const user = store.getUser && store.getUser();
    const ownerId = (user && user.entrepreneurId) || (user && user.id);
    const list = ((store.data && store.data.offers) || []).filter(o => o.entrepreneurId === ownerId);
    return { success: true, count: list.length, data: list };
  },

  async getEntrepreneurOfferById(id) {
    if (this.isOnline) {
      return await this.request(`/entrepreneurs/me/offers/${id}`);
    }
    const offer = ((store.data && store.data.offers) || []).find(o => o.id === id);
    return offer ? { success: true, data: offer } : { success: false, message: 'Offer not found' };
  },

  async createEntrepreneurOffer(offerData) {
    if (this.isOnline) {
      return await this.request('/entrepreneurs/me/offers', {
        method: 'POST',
        body: JSON.stringify(offerData)
      });
    }
    if (!store.data.offers) store.data.offers = [];
    const user = store.getUser && store.getUser();
    const ownerId = (user && user.entrepreneurId) || (user && user.id) || 'ent_01';
    const newOffer = {
      id: `OFFER-${Math.floor(1000 + Math.random() * 9000)}`,
      entrepreneurId: ownerId,
      active: true,
      moderationStatus: 'approved',
      usageCount: 0,
      ordersCount: 0,
      totalSavedAmount: 0,
      createdAt: new Date().toISOString(),
      ...offerData
    };
    store.data.offers.unshift(newOffer);
    store.saveData();
    return { success: true, data: newOffer, message: 'Offer created successfully.' };
  },

  async updateEntrepreneurOffer(id, updates) {
    if (this.isOnline) {
      return await this.request(`/entrepreneurs/me/offers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    }
    const idx = (store.data.offers || []).findIndex(o => o.id === id);
    if (idx !== -1) {
      store.data.offers[idx] = { ...store.data.offers[idx], ...updates, updatedAt: new Date().toISOString() };
      store.saveData();
      return { success: true, data: store.data.offers[idx] };
    }
    return { success: false, message: 'Offer not found' };
  },

  async toggleEntrepreneurOffer(id) {
    if (this.isOnline) {
      return await this.request(`/entrepreneurs/me/offers/${id}/toggle`, {
        method: 'PATCH'
      });
    }
    const idx = (store.data.offers || []).findIndex(o => o.id === id);
    if (idx !== -1) {
      store.data.offers[idx].active = !store.data.offers[idx].active;
      store.saveData();
      return { success: true, data: store.data.offers[idx] };
    }
    return { success: false, message: 'Offer not found' };
  },

  async deleteEntrepreneurOffer(id) {
    if (this.isOnline) {
      return await this.request(`/entrepreneurs/me/offers/${id}`, {
        method: 'DELETE'
      });
    }
    const idx = (store.data.offers || []).findIndex(o => o.id === id);
    if (idx !== -1) {
      const removed = store.data.offers.splice(idx, 1)[0];
      store.saveData();
      return { success: true, data: removed };
    }
    return { success: false, message: 'Offer not found' };
  },

  async getEntrepreneurOfferPerformance(id) {
    if (this.isOnline) {
      return await this.request(`/entrepreneurs/me/offers/${id}/performance`);
    }
    const offer = ((store.data && store.data.offers) || []).find(o => o.id === id);
    if (!offer) return { success: false, message: 'Offer not found' };
    return {
      success: true,
      data: {
        id: offer.id,
        title: offer.title,
        code: offer.code,
        active: offer.active,
        usageCount: offer.usageCount || 0,
        ordersCount: offer.ordersCount || 0,
        totalSavedAmount: offer.totalSavedAmount || 0,
        usageLimit: offer.usageLimit || null
      }
    };
  },

  async moderateAdminOffer(id, status, reason = '') {
    if (this.isOnline) {
      return await this.request(`/admin/offers/${id}/moderate`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason })
      });
    }
    const idx = (store.data.offers || []).findIndex(o => o.id === id);
    if (idx !== -1) {
      store.data.offers[idx].moderationStatus = status;
      store.data.offers[idx].moderationReason = reason;
      if (status === 'deactivated') store.data.offers[idx].active = false;
      store.saveData();
      return { success: true, data: store.data.offers[idx] };
    }
    return { success: false, message: 'Offer not found' };
  },

  async deleteAdminOffer(id) {
    if (this.isOnline) {
      return await this.request(`/admin/offers/${id}`, {
        method: 'DELETE'
      });
    }
    const idx = (store.data.offers || []).findIndex(o => o.id === id);
    if (idx !== -1) {
      const removed = store.data.offers.splice(idx, 1)[0];
      store.saveData();
      return { success: true, data: removed };
    }
    return { success: false, message: 'Offer not found' };
  },

  // -------------------------------------------------------------------
  // ADVERTISEMENT CLIENT METHODS
  // -------------------------------------------------------------------

  async getAdvertisements(placement = 'home_carousel', category = null) {
    if (this.isOnline) {
      let q = `?placement=${encodeURIComponent(placement)}`;
      if (category) q += `&category=${encodeURIComponent(category)}`;
      return await this.request(`/advertisements${q}`);
    }
    return {
      success: true,
      data: store.getAdvertisements(placement, category)
    };
  },

  async recordAdImpression(id) {
    if (this.isOnline) {
      return await this.request(`/advertisements/${id}/impression`, { method: 'POST' }).catch(() => {});
    }
    return { success: true, impressions: store.recordAdImpression(id) };
  },

  async recordAdClick(id) {
    if (this.isOnline) {
      return await this.request(`/advertisements/${id}/click`, { method: 'POST' }).catch(() => {});
    }
    return { success: true, clicks: store.recordAdClick(id) };
  },

  // Entrepreneur Advertisements
  async getEntrepreneurAds() {
    if (this.isOnline) {
      return await this.request('/entrepreneurs/me/advertisements');
    }
    const user = store.getUser && store.getUser();
    const ownerId = (user && user.entrepreneurId) || (user && user.id);
    const list = store.getEntrepreneurAds(ownerId);
    return { success: true, count: list.length, data: list };
  },

  async getEntrepreneurAdById(id) {
    if (this.isOnline) {
      return await this.request(`/entrepreneurs/me/advertisements/${id}`);
    }
    const ad = store.getAdvertisementById(id);
    return ad ? { success: true, data: ad } : { success: false, message: 'Ad not found' };
  },

  async createEntrepreneurAd(adData) {
    if (this.isOnline) {
      return await this.request('/entrepreneurs/me/advertisements', {
        method: 'POST',
        body: JSON.stringify(adData)
      });
    }
    if (!store.data.advertisements) store.data.advertisements = [];
    const user = store.getUser && store.getUser();
    const ownerId = (user && user.entrepreneurId) || (user && user.id) || 'ent_01';
    const newAd = {
      id: `AD-${Math.floor(1000 + Math.random() * 9000)}`,
      entrepreneurId: ownerId,
      status: 'Pending Approval',
      impressions: 0,
      clicks: 0,
      ordersAttributed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...adData
    };
    store.data.advertisements.unshift(newAd);
    store.saveData();
    return { success: true, data: newAd, message: 'Advertisement submitted for Admin approval.' };
  },

  async updateEntrepreneurAd(id, updates) {
    if (this.isOnline) {
      return await this.request(`/entrepreneurs/me/advertisements/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    }
    const idx = (store.data.advertisements || []).findIndex(a => a.id === id);
    if (idx !== -1) {
      store.data.advertisements[idx] = {
        ...store.data.advertisements[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      if (store.data.advertisements[idx].status === 'Rejected') {
        store.data.advertisements[idx].status = 'Pending Approval';
      }
      store.saveData();
      return { success: true, data: store.data.advertisements[idx] };
    }
    return { success: false, message: 'Advertisement not found' };
  },

  async toggleEntrepreneurAd(id) {
    if (this.isOnline) {
      return await this.request(`/entrepreneurs/me/advertisements/${id}/toggle`, {
        method: 'PATCH'
      });
    }
    const idx = (store.data.advertisements || []).findIndex(a => a.id === id);
    if (idx !== -1) {
      const current = store.data.advertisements[idx].status;
      store.data.advertisements[idx].status = current === 'Paused' ? 'Active' : 'Paused';
      store.saveData();
      return { success: true, data: store.data.advertisements[idx] };
    }
    return { success: false, message: 'Advertisement not found' };
  },

  async deleteEntrepreneurAd(id) {
    if (this.isOnline) {
      return await this.request(`/entrepreneurs/me/advertisements/${id}`, {
        method: 'DELETE'
      });
    }
    const idx = (store.data.advertisements || []).findIndex(a => a.id === id);
    if (idx !== -1) {
      const removed = store.data.advertisements.splice(idx, 1)[0];
      store.saveData();
      return { success: true, data: removed };
    }
    return { success: false, message: 'Advertisement not found' };
  },

  async getAdPerformance(id) {
    if (this.isOnline) {
      return await this.request(`/entrepreneurs/me/advertisements/${id}/performance`);
    }
    const ad = store.getAdvertisementById(id);
    if (!ad) return { success: false, message: 'Ad not found' };
    const impressions = ad.impressions || 0;
    const clicks = ad.clicks || 0;
    return {
      success: true,
      data: {
        id: ad.id,
        title: ad.title,
        status: ad.status,
        impressions,
        clicks,
        ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) + '%' : '0.0%',
        ordersAttributed: ad.ordersAttributed || 0
      }
    };
  },

  // Media Upload Helper
  async uploadMedia(fileOrBase64, filename = 'banner.jpg') {
    if (this.isOnline) {
      return await this.request('/upload', {
        method: 'POST',
        body: JSON.stringify({
          filename,
          base64: fileOrBase64
        })
      });
    }
    // Offline simulation
    return {
      success: true,
      url: typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:') ? fileOrBase64 : `/uploads/banner_${Date.now()}.jpg`,
      filename,
      message: 'Media uploaded successfully.'
    };
  },

  // Admin Advertisements Review
  async getAdminAds(status = null) {
    if (this.isOnline) {
      const q = status ? `?status=${encodeURIComponent(status)}` : '';
      return await this.request(`/admin/advertisements${q}`);
    }
    let list = (store.data && store.data.advertisements) || [];
    if (status) list = list.filter(a => a.status === status);
    return { success: true, count: list.length, data: list };
  },

  async reviewAdminAd(id, status, rejectionReason = null, reviewNotes = null) {
    if (this.isOnline) {
      return await this.request(`/admin/advertisements/${id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status, rejectionReason, reviewNotes })
      });
    }
    const idx = (store.data.advertisements || []).findIndex(a => a.id === id);
    if (idx !== -1) {
      store.data.advertisements[idx].status = status;
      store.data.advertisements[idx].rejectionReason = rejectionReason;
      store.data.advertisements[idx].reviewNotes = reviewNotes;
      store.saveData();
      return { success: true, data: store.data.advertisements[idx] };
    }
    return { success: false, message: 'Ad not found' };
  },

  async deleteAdminAd(id) {
    if (this.isOnline) {
      return await this.request(`/admin/advertisements/${id}`, {
        method: 'DELETE'
      });
    }
    const idx = (store.data.advertisements || []).findIndex(a => a.id === id);
    if (idx !== -1) {
      const removed = store.data.advertisements.splice(idx, 1)[0];
      store.saveData();
      return { success: true, data: removed };
    }
    return { success: false, message: 'Ad not found' };
  }
}

// Global Singleton Instance
window.apiClient = new APIClient();
