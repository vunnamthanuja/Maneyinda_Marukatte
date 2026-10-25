/* =====================================================================
   MANEYINDA MARUKATTE - ADMIN MODULE
   Dashboard, Entrepreneurs (Verification/Badges), Products (Moderation/Categories),
   AI Trend Analysis, Support Center & Platform Analytics
===================================================================== */

const AdminModule = {
  activeSupportTab: 'general',
  analyticsTimeFilter: 'week',
  trendPeriod: '7days',

  // -------------------------------------------------------------
  // SCREEN: ADMIN LOGIN & FORGOT PASSWORD
  // -------------------------------------------------------------
  renderLogin() {
    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-welcome')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Administrator Portal</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 20px;">
        <div style="text-align:center; margin-bottom:24px;">
          <div style="width:64px; height:64px; border-radius:50%; background:#EDE8D5; color:var(--color-primary); display:flex; align-items:center; justify-content:center; margin:0 auto 10px auto;">
            <span class="material-symbols-rounded" style="font-size:36px;">admin_panel_settings</span>
          </div>
          <h2 style="font-size:20px; font-weight:700; color:var(--color-primary);">Admin Login</h2>
          <p style="font-size:12px; color:var(--color-text-secondary); margin-top:2px;">
            Authorized institutional administrators only
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">Admin Email <span class="req">*</span></label>
          <div class="input-with-icon">
            <span class="material-symbols-rounded input-icon-left">mail</span>
            <input type="email" id="admin-email" class="form-input" placeholder="admin@maneyinda.com" value="admin@maneyinda.com">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Password <span class="req">*</span></label>
          <div class="input-with-icon">
            <span class="material-symbols-rounded input-icon-left">lock</span>
            <input type="password" id="admin-pass" class="form-input" placeholder="••••••••" value="admin123">
            <button type="button" class="input-icon-right" onclick="AuthModule.togglePasswordVisibility('admin-pass', this)">
              <span class="material-symbols-rounded">visibility</span>
            </button>
          </div>
          <div style="display:flex; justify-content:flex-end; margin-top:6px;">
            <a href="javascript:void(0)" onclick="AdminModule.openForgotPasswordModal()" style="font-size:12px; color:var(--color-primary); font-weight:600; text-decoration:none;">
              Forgot Password?
            </a>
          </div>
          <span id="admin-login-err" class="form-error-text" style="display:none;"></span>
        </div>

        <div style="margin-top:24px;">
          <button class="btn btn-primary btn-block" onclick="AdminModule.handleAdminLogin()">
            Login to Admin Console
            <span class="material-symbols-rounded">login</span>
          </button>
        </div>
      </div>
    `;
  },

  handleAdminLogin() {
    const email = document.getElementById('admin-email').value.trim();
    const pass = document.getElementById('admin-pass').value.trim();
    const err = document.getElementById('admin-login-err');

    if (email === 'admin@maneyinda.com' && (pass === 'admin123' || pass === 'password123')) {
      store.setRole('admin');
      store.addActivityLog('Admin logged in');
      AppUtils.showToast('Welcome, Administrator!');
      AppRouter.navigate('screen-admin-dashboard');
    } else {
      err.textContent = 'Invalid administrator credentials.';
      err.style.display = 'flex';
    }
  },

  openForgotPasswordModal() {
    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">Admin Password Recovery</h3>
      <p style="font-size:12px; color:var(--color-text-secondary); margin-bottom:14px;">
        A verification code will be sent to admin@maneyinda.com.
      </p>
      <div class="form-group">
        <label class="form-label">New Password</label>
        <input type="password" id="admin-new-pass" class="form-input" placeholder="Min 6 characters">
      </div>
      <button class="btn btn-primary btn-block" onclick="AppUtils.closeBottomSheet(); AppUtils.showToast('Password updated successfully');">
        Update Password
      </button>
    `);
  },

  // -------------------------------------------------------------
  // SCREEN: ADMIN DASHBOARD (ACTIONABLE PLATFORM STATUS)
  // -------------------------------------------------------------
  renderDashboard() {
    const ents = store.getEntrepreneurs();
    const pendingEnts = ents.filter(e => e.status === 'pending');
    const prods = store.data.products || [];
    const orders = store.data.orders || [];
    const tickets = store.getSupportTickets().filter(t => t.status === 'Open' || t.status === 'In Progress');
    const reported = store.data.reportedProducts || [];

    return `
      <!-- Admin Header Bar -->
      <div class="home-header-bar" style="padding-top:14px;">
        <div class="home-greeting-wrap">
          <span style="font-size:11px; color:var(--color-secondary); font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Control Center</span>
          <h2 style="font-size:19px; font-weight:700; color:var(--color-text-primary);">
            👨‍💼 Admin Dashboard
          </h2>
        </div>
        <button class="icon-action-btn" onclick="AppRouter.navigate('screen-admin-profile')">
          <span class="material-symbols-rounded">account_circle</span>
        </button>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 70px;">
        <!-- Platform Totals Overview -->
        <div style="font-size:12px; font-weight:700; color:var(--color-text-tertiary); text-transform:uppercase; margin-bottom:8px;">
          📊 Platform Overview
        </div>
        <div class="stat-card-grid">
          <div class="stat-card">
            <div class="stat-icon-wrap" style="background:#E8F5E9; color:var(--color-primary);">
              <span class="material-symbols-rounded">storefront</span>
            </div>
            <div class="stat-value">${ents.length}</div>
            <div class="stat-label">Entrepreneurs</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap" style="background:#E1F5FE; color:var(--color-info);">
              <span class="material-symbols-rounded">group</span>
            </div>
            <div class="stat-value">128</div>
            <div class="stat-label">Total Customers</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap" style="background:var(--color-soft-yellow); color:var(--color-text-accent);">
              <span class="material-symbols-rounded">inventory_2</span>
            </div>
            <div class="stat-value">${prods.length}</div>
            <div class="stat-label">Total Products</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap" style="background:#FFF3E0; color:var(--color-warning);">
              <span class="material-symbols-rounded">shopping_bag</span>
            </div>
            <div class="stat-value">${orders.length}</div>
            <div class="stat-label">Total Orders</div>
          </div>
        </div>

        <!-- Actionable Platform Status Cards (What does Admin need to handle today?) -->
        <div style="font-size:12px; font-weight:700; color:var(--color-text-tertiary); text-transform:uppercase; margin:16px 0 8px 0;">
          📌 Action Required Today
        </div>

        <!-- 1. Pending Approvals -->
        <div class="card card-clickable" style="padding:14px; margin-bottom:10px; border-left:4px solid var(--color-warning); cursor:pointer;" onclick="AppRouter.navigate('screen-admin-verification')">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-warning); font-size:26px;">assignment_ind</span>
              <div>
                <h4 style="font-size:14px; font-weight:700; color:var(--color-text-primary);">
                  📝 Pending Entrepreneur Approvals
                </h4>
                <p style="font-size:11px; color:var(--color-text-secondary); margin-top:2px;">
                  ${pendingEnts.length} applicant(s) waiting in verification queue
                </p>
              </div>
            </div>
            <span class="badge-counter" style="position:static; width:22px; height:22px;">${pendingEnts.length}</span>
          </div>
        </div>

        <!-- 2. Open Support Tickets -->
        <div class="card card-clickable" style="padding:14px; margin-bottom:10px; border-left:4px solid var(--color-info); cursor:pointer;" onclick="AppRouter.navigate('screen-admin-support')">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-info); font-size:26px;">confirmation_number</span>
              <div>
                <h4 style="font-size:14px; font-weight:700; color:var(--color-text-primary);">
                  🎫 Open Support Tickets
                </h4>
                <p style="font-size:11px; color:var(--color-text-secondary); margin-top:2px;">
                  ${tickets.length} unresolved customer & refund appeal tickets
                </p>
              </div>
            </div>
            <span class="badge-counter" style="position:static; width:22px; height:22px; background:var(--color-info); color:#fff;">${tickets.length}</span>
          </div>
        </div>

        <!-- 3. Active Complaints / Moderation -->
        <div class="card card-clickable" style="padding:14px; margin-bottom:10px; border-left:4px solid var(--color-error); cursor:pointer;" onclick="AppRouter.navigate('screen-admin-moderation')">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-error); font-size:26px;">report_problem</span>
              <div>
                <h4 style="font-size:14px; font-weight:700; color:var(--color-text-primary);">
                  ⚠ Active Complaints & Reports
                </h4>
                <p style="font-size:11px; color:var(--color-text-secondary); margin-top:2px;">
                  ${reported.length} product(s) flagged for moderation audit
                </p>
              </div>
            </div>
            <span class="badge-counter" style="position:static; width:22px; height:22px; background:var(--color-error); color:#fff;">${reported.length}</span>
          </div>
        </div>
      </div>

      ${this.renderBottomNav('dashboard')}
    `;
  },

  // -------------------------------------------------------------
  // SCREEN: ENTREPRENEUR VERIFICATION QUEUE & DETAILS
  // -------------------------------------------------------------
  renderVerificationQueue() {
    const ents = store.getEntrepreneurs();
    const pending = ents.filter(e => e.status === 'pending');

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-admin-entrepreneurs')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Verification Queue</span>
        </div>
        <span style="font-size:12px; font-weight:600; color:var(--color-primary);">${pending.length} Pending</span>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 70px;">
        ${pending.length === 0 ? `
          <div class="empty-state" style="padding-top:60px;">
            <span class="material-symbols-rounded empty-state-icon" style="color:var(--color-success);">check_circle</span>
            <div class="empty-state-title">All Applications Cleared</div>
            <div class="empty-state-desc">No new entrepreneur registration applications pending review.</div>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${pending.map(e => `
              <div class="card card-clickable" style="padding:14px; cursor:pointer;" onclick="AdminModule.viewApplicantDetails('${e.id}')">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                  <div>
                    <h4 style="font-size:15px; font-weight:700; color:var(--color-text-primary);">${e.businessName}</h4>
                    <span style="font-size:12px; color:var(--color-text-secondary);">Owner: ${e.name} • ${e.businessCategory}</span>
                  </div>
                  <span class="status-chip chip-warning">🟡 Pending</span>
                </div>
                <div style="font-size:11px; color:var(--color-text-tertiary); margin-bottom:8px;">
                  Applied: ${e.appliedDate || '24 Oct 2026'} • Radius: ${e.deliveryRadius || 10} km
                </div>
                <button class="btn btn-sm btn-outline btn-block">Review Application Documents</button>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      ${this.renderBottomNav('entrepreneurs')}
    `;
  },

  viewApplicantDetails(entId) {
    const e = store.getEntrepreneurById(entId);
    if (!e) return;

    AppUtils.showBottomSheet(`
      <h3 style="font-size:17px; font-weight:700; color:var(--color-primary); margin-bottom:4px;">
        ${e.businessName}
      </h3>
      <div style="font-size:12px; color:var(--color-text-secondary); margin-bottom:12px;">
        Applicant: <strong>${e.name}</strong> • Phone: ${e.phone}
      </div>

      <div class="card" style="padding:12px; margin-bottom:12px; font-size:12px; display:flex; flex-direction:column; gap:4px;">
        <div><strong>Category:</strong> ${e.businessCategory}</div>
        <div><strong>Experience:</strong> ${e.yearsExp || 3} Years</div>
        <div><strong>Address:</strong> ${e.address.door}, ${e.address.street}, ${e.address.area}, ${e.address.city} - ${e.address.pincode}</div>
      </div>

      <div class="card" style="padding:12px; margin-bottom:14px; font-size:12px; display:flex; flex-direction:column; gap:6px;">
        <h5 style="font-weight:700; color:var(--color-primary);">Submitted Proofs:</h5>
        <div>📄 <strong>ID Document:</strong> ${(e.documents && e.documents.idType) || 'Aadhaar Card'} (${(e.documents && e.documents.idFile) || 'verified.pdf'})</div>
        <div>📸 <strong>Business Proof:</strong> ${(e.documents && e.documents.businessProof) || 'Kitchen_Photo.jpg'}</div>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px;">
        <button class="btn btn-primary btn-block" onclick="AdminModule.decideApplication('${e.id}', 'approve')">
          ✅ Approve Entrepreneur
        </button>
        <button class="btn btn-outline btn-block" onclick="AdminModule.decideApplication('${e.id}', 'request_info')">
          ℹ Request More Information
        </button>
        <button class="btn btn-danger-outline btn-block" onclick="AdminModule.decideApplication('${e.id}', 'reject')">
          ❌ Reject Application
        </button>
      </div>
    `);
  },

  decideApplication(entId, decision) {
    const e = store.getEntrepreneurById(entId);
    if (!e) return;

    if (window.apiClient && window.apiClient.isOnline) {
      window.apiClient.verifyApplicant(entId, decision);
    }

    if (decision === 'approve') {
      e.status = 'approved';
      e.badge = 'Rising Star';
      store.addActivityLog(`Approved entrepreneur application: ${e.businessName}`);
      AppUtils.showToast(`✅ ${e.businessName} approved!`);
    } else if (decision === 'request_info') {
      e.status = 'correctable_rejection';
      store.addActivityLog(`Requested more info for ${e.businessName}`);
      AppUtils.showToast('Requested more information from applicant.');
    } else if (decision === 'reject') {
      e.status = 'rejected';
      e.rejectionReason = 'Failed criteria check';
      store.addActivityLog(`Rejected application: ${e.businessName}`);
      AppUtils.showToast('Application rejected.');
    }

    store.saveData();
    AppUtils.closeBottomSheet();
    AppRouter.renderActiveScreen();
  },

  // -------------------------------------------------------------
  // SCREEN: ENTREPRENEURS MAIN MENU & BADGE MANAGEMENT
  // -------------------------------------------------------------
  renderEntrepreneurs() {
    const ents = store.getEntrepreneurs();
    const pending = ents.filter(e => e.status === 'pending');

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-admin-dashboard')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Entrepreneurs</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 70px;">
        <!-- Verification Queue Navigation Card -->
        <div class="card card-clickable" style="padding:14px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="AppRouter.navigate('screen-admin-verification')">
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="material-symbols-rounded" style="color:var(--color-primary);">fact_check</span>
            <div>
              <div style="font-size:14px; font-weight:700;">📋 Verification Queue</div>
              <span style="font-size:11px; color:var(--color-text-secondary);">${pending.length} pending review</span>
            </div>
          </div>
          <span class="badge-counter" style="position:static; width:22px; height:22px;">${pending.length}</span>
        </div>

        <div style="font-size:12px; font-weight:700; color:var(--color-text-tertiary); text-transform:uppercase; margin:16px 0 8px 0;">
          All Registered Entrepreneurs (${ents.length})
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          ${ents.map(e => `
            <div class="card" style="padding:14px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                <div>
                  <h4 style="font-size:14px; font-weight:700; color:var(--color-text-primary); display:flex; align-items:center; gap:4px;">
                    ${e.businessName}
                    <span class="material-symbols-rounded verified-badge">check_circle</span>
                  </h4>
                  <span style="font-size:11px; color:var(--color-text-secondary);">${e.name} • ${e.businessCategory}</span>
                </div>
                <span class="chip-badge" style="font-size:10px; padding:2px 8px;">${e.badge || 'Verified'}</span>
              </div>

              <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--color-text-secondary); margin:8px 0;">
                <span>Rating: <strong>⭐ ${e.rating}</strong></span>
                <span>Orders: <strong>${e.completedOrdersCount || 0}</strong></span>
                <span>Complaints: <strong>${e.complaintsCount || 0}</strong></span>
              </div>

              <div style="display:flex; gap:8px; border-top:1px solid #F0EEE4; padding-top:8px;">
                <button class="btn btn-sm btn-outline" style="flex:1;" onclick="AdminModule.openBadgeModal('${e.id}')">
                  Assign Badge
                </button>
                <button class="btn btn-sm btn-text" style="color:var(--color-primary);" onclick="CustomerModule.viewPublicStore('${e.id}')">
                  View Store
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${this.renderBottomNav('entrepreneurs')}
    `;
  },

  openBadgeModal(entId) {
    const e = store.getEntrepreneurById(entId);
    if (!e) return;

    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">
        🏆 Assign Seller Badge
      </h3>
      <p style="font-size:13px; font-weight:600; color:var(--color-text-primary);">${e.businessName}</p>

      <div class="card" style="background:#FAF8F0; padding:10px; margin:10px 0; font-size:12px; display:flex; justify-content:space-around;">
        <div>Rating: <strong>⭐ ${e.rating}</strong></div>
        <div>Orders: <strong>${e.completedOrdersCount || 240}</strong></div>
        <div>Complaints: <strong>${e.complaintsCount || 0}</strong></div>
      </div>

      <div class="form-group">
        <label class="form-label">Select Badge</label>
        <select id="sel-badge-val" class="form-select">
          <option value="Best Entrepreneur" ${e.badge === 'Best Entrepreneur' ? 'selected' : ''}>🌟 Best Entrepreneur</option>
          <option value="Rising Star" ${e.badge === 'Rising Star' ? 'selected' : ''}>⭐ Rising Star</option>
          <option value="Top Rated" ${e.badge === 'Top Rated' ? 'selected' : ''}>🏆 Top Rated</option>
        </select>
      </div>

      <button class="btn btn-primary btn-block" onclick="AdminModule.saveBadge('${e.id}')">
        Save Badge
      </button>
    `);
  },

  saveBadge(entId) {
    const badge = document.getElementById('sel-badge-val').value;
    const e = store.getEntrepreneurById(entId);
    if (e) {
      e.badge = badge;
      store.addActivityLog(`Assigned "${badge}" badge to ${e.businessName}`);
      store.saveData();
      AppUtils.closeBottomSheet();
      AppUtils.showToast(`Badge updated to "${badge}"`);
      AppRouter.renderActiveScreen();
    }
  },

  // -------------------------------------------------------------
  // SCREEN: PRODUCTS MAIN MENU & CATEGORY MANAGEMENT & TRENDS
  // -------------------------------------------------------------
  renderProducts() {
    const prods = store.data.products || [];
    const cats = store.data.categories || [];
    const reported = store.data.reportedProducts || [];

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-admin-dashboard')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Products Management</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 70px;">
        <!-- Quick Nav Cards -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
          <div class="card card-clickable" style="padding:12px; cursor:pointer;" onclick="AppRouter.navigate('screen-admin-categories')">
            <span class="material-symbols-rounded" style="color:var(--color-primary); font-size:24px;">category</span>
            <div style="font-size:13px; font-weight:700; margin-top:4px;">📂 Categories</div>
            <span style="font-size:11px; color:var(--color-text-secondary);">${cats.length} Categories</span>
          </div>

          <div class="card card-clickable" style="padding:12px; cursor:pointer;" onclick="AppRouter.navigate('screen-admin-moderation')">
            <span class="material-symbols-rounded" style="color:var(--color-error); font-size:24px;">security</span>
            <div style="font-size:13px; font-weight:700; margin-top:4px;">🛡 Moderation</div>
            <span style="font-size:11px; color:var(--color-text-secondary);">${reported.length} Flagged</span>
          </div>
        </div>

        <!-- AI Trend Analysis Navigation Card -->
        <div class="card card-clickable" style="padding:14px; margin-bottom:16px; background:#FAFBF6; border:1px solid #CCDDC0; cursor:pointer;" onclick="AppRouter.navigate('screen-admin-trends')">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-primary); font-size:26px;">psychology</span>
              <div>
                <h4 style="font-size:14px; font-weight:700; color:var(--color-primary);">🤖 AI Trend Analysis</h4>
                <p style="font-size:11px; color:var(--color-text-secondary); margin-top:2px;">
                  Automatic scoring feeds Customer & Entrepreneur insights
                </p>
              </div>
            </div>
            <span class="material-symbols-rounded" style="color:var(--color-primary);">chevron_right</span>
          </div>
        </div>

        <div style="font-size:12px; font-weight:700; color:var(--color-text-tertiary); text-transform:uppercase; margin-bottom:8px;">
          All Products on Platform (${prods.length})
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          ${prods.map(p => `
            <div class="card" style="display:flex; gap:12px; padding:12px;">
              <img src="${p.images[0]}" style="width:60px; height:60px; border-radius:var(--radius-sm); object-fit:cover;">
              <div style="flex:1;">
                <div style="font-size:13px; font-weight:700; color:var(--color-text-primary); line-height:1.3;">${p.name}</div>
                <div style="font-size:11px; color:var(--color-text-secondary); margin-top:2px;">${p.storeName} • ₹${p.price}</div>
                <div style="display:flex; gap:6px; margin-top:4px;">
                  <span class="status-chip ${p.status === 'active' ? 'chip-delivered' : 'chip-cancelled'}" style="font-size:9px; padding:2px 6px;">
                    ${p.status}
                  </span>
                  <span style="font-size:11px; color:var(--color-text-tertiary);">Orders: ${p.ordersCount || 0}</span>
                </div>
              </div>
              <button class="icon-action-btn" onclick="AdminModule.openProductActionModal('${p.id}')">
                <span class="material-symbols-rounded">more_vert</span>
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      ${this.renderBottomNav('products')}
    `;
  },

  openProductActionModal(productId) {
    const p = store.getProductById(productId);
    if (!p) return;

    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-text-primary); margin-bottom:12px;">${p.name}</h3>
      <div style="font-size:12px; color:var(--color-text-secondary); margin-bottom:12px;">
        Owner: <strong>${p.storeName}</strong> • Price: ₹${p.price} • Stock: ${p.stock}
      </div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <button class="btn btn-outline btn-block" onclick="CustomerModule.viewProductDetails('${p.id}'); AppUtils.closeBottomSheet();">
          View Product Page
        </button>
        <button class="btn btn-outline btn-block" onclick="AdminModule.toggleHideProduct('${p.id}'); AppUtils.closeBottomSheet();">
          ${p.status === 'hidden' ? 'Unhide Product' : 'Hide Product from Listings'}
        </button>
        <button class="btn btn-danger-outline btn-block" onclick="AdminModule.softRemoveProduct('${p.id}'); AppUtils.closeBottomSheet();">
          Soft Remove Product (Audit Record Retained)
        </button>
      </div>
    `);
  },

  toggleHideProduct(productId) {
    const p = store.getProductById(productId);
    if (p) {
      p.status = p.status === 'hidden' ? 'active' : 'hidden';
      store.addActivityLog(`Changed product status: ${p.name} (${p.status})`);
      store.saveData();
      AppUtils.showToast(`Product is now ${p.status}`);
      AppRouter.renderActiveScreen();
    }
  },

  softRemoveProduct(productId) {
    const p = store.getProductById(productId);
    if (p) {
      p.status = 'removed';
      store.addActivityLog(`Soft-removed product from marketplace: ${p.name}`);
      store.saveData();
      AppUtils.showToast('Product soft-removed from marketplace.');
      AppRouter.renderActiveScreen();
    }
  },

  // -------------------------------------------------------------
  // SCREEN: CATEGORY MANAGEMENT (ADD, RENAME, ACTIVATE/DEACTIVATE)
  // -------------------------------------------------------------
  renderCategories() {
    const cats = store.data.categories || [];
    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-admin-products')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Product Categories</span>
        </div>
        <button class="btn btn-primary btn-sm" onclick="AdminModule.openAddCategoryModal()">+ Add Category</button>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 70px;">
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${cats.map(c => {
            const count = (store.data.products || []).filter(p => p.category === c.name).length;
            return `
              <div class="card" style="padding:14px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <h4 style="font-size:14px; font-weight:700; color:var(--color-text-primary); display:flex; align-items:center; gap:6px;">
                    <span class="material-symbols-rounded" style="color:var(--color-primary); font-size:20px;">${c.icon || 'category'}</span>
                    ${c.name}
                  </h4>
                  <span style="font-size:11px; color:var(--color-text-secondary); margin-top:2px; display:block;">
                    ${count} active products • Status: <strong>${c.active ? '🟢 Active' : '🔴 Inactive'}</strong>
                  </span>
                </div>
                <div style="display:flex; gap:6px;">
                  <button class="btn btn-sm btn-outline" onclick="AdminModule.openRenameCategoryModal('${c.id}', '${c.name}')">Rename</button>
                  <button class="btn btn-sm btn-text" style="color:${c.active ? 'var(--color-error)' : 'var(--color-primary)'};" onclick="AdminModule.toggleCategoryStatus('${c.id}')">
                    ${c.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      ${this.renderBottomNav('products')}
    `;
  },

  openAddCategoryModal() {
    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin-bottom:10px;">+ Add New Category</h3>
      <div class="form-group">
        <label class="form-label">Category Name</label>
        <input type="text" id="new-cat-name" class="form-input" placeholder="e.g. Organic Groceries">
      </div>
      <button class="btn btn-primary btn-block" onclick="AdminModule.saveNewCategory()">Add Category</button>
    `);
  },

  saveNewCategory() {
    const name = document.getElementById('new-cat-name').value.trim();
    if (!name) return;
    store.data.categories.push({
      id: 'cat_' + Date.now(),
      name,
      active: true,
      icon: 'storefront'
    });
    store.addActivityLog(`Added category "${name}"`);
    store.saveData();
    AppUtils.closeBottomSheet();
    AppUtils.showToast(`Category "${name}" created.`);
    AppRouter.renderActiveScreen();
  },

  openRenameCategoryModal(catId, currentName) {
    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin-bottom:10px;">Rename Category</h3>
      <div class="form-group">
        <label class="form-label">Category Name</label>
        <input type="text" id="rename-cat-input" class="form-input" value="${currentName}">
      </div>
      <button class="btn btn-primary btn-block" onclick="AdminModule.saveRenamedCategory('${catId}')">Save</button>
    `);
  },

  saveRenamedCategory(catId) {
    const newName = document.getElementById('rename-cat-input').value.trim();
    if (!newName) return;
    const cat = store.data.categories.find(c => c.id === catId);
    if (cat) {
      const oldName = cat.name;
      cat.name = newName;
      // Update existing products matching old category
      (store.data.products || []).forEach(p => {
        if (p.category === oldName) p.category = newName;
      });
      store.addActivityLog(`Renamed category "${oldName}" to "${newName}"`);
      store.saveData();
      AppUtils.closeBottomSheet();
      AppUtils.showToast('Category renamed successfully.');
      AppRouter.renderActiveScreen();
    }
  },

  toggleCategoryStatus(catId) {
    const cat = store.data.categories.find(c => c.id === catId);
    if (cat) {
      cat.active = !cat.active;
      store.addActivityLog(`Set category "${cat.name}" active=${cat.active}`);
      store.saveData();
      AppUtils.showToast(`Category is now ${cat.active ? 'Active' : 'Inactive'}`);
      AppRouter.renderActiveScreen();
    }
  },

  // -------------------------------------------------------------
  // SCREEN: AI TREND ANALYSIS (RULE-BASED SCORING)
  // -------------------------------------------------------------
  renderTrends() {
    const prods = store.data.products || [];
    const trending = AppAI.calculateTrendingProducts(prods, store.getOrders(), this.trendPeriod);

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-admin-products')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">AI Trend Analysis</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 70px;">
        <div class="ai-card" style="margin-bottom:14px;">
          <div class="ai-card-header">
            <span class="material-symbols-rounded">auto_graph</span>
            Scoring Formula
          </div>
          <p style="font-size:11px; color:var(--color-text-secondary); line-height:1.45;">
            <strong>Trend Score</strong> = (Orders × 0.6) + (Rating × 0.3) + (Recent Growth × 0.1)<br>
            Calculated automatically to feed Customer "Trending This Week" and Entrepreneur "AI Business Insights".
          </p>
        </div>

        <!-- Period Filter -->
        <div class="filter-chip-row" style="margin-bottom:12px;">
          <button class="filter-chip ${this.trendPeriod === 'today' ? 'active' : ''}" onclick="AdminModule.setTrendPeriod('today')">Today</button>
          <button class="filter-chip ${this.trendPeriod === '7days' ? 'active' : ''}" onclick="AdminModule.setTrendPeriod('7days')">Last 7 Days</button>
          <button class="filter-chip ${this.trendPeriod === '30days' ? 'active' : ''}" onclick="AdminModule.setTrendPeriod('30days')">Last 30 Days</button>
        </div>

        <h4 style="font-size:14px; font-weight:700; color:var(--color-text-primary); margin-bottom:10px;">
          🔥 Top Trending Products
        </h4>

        <div style="display:flex; flex-direction:column; gap:10px;">
          ${trending.map((t, idx) => `
            <div class="card" style="padding:12px; display:flex; align-items:center; gap:12px;">
              <div style="font-size:18px; font-weight:700; color:var(--color-primary); width:24px;">
                ${idx + 1}
              </div>
              <img src="${t.images[0]}" style="width:52px; height:52px; border-radius:var(--radius-sm); object-fit:cover;">
              <div style="flex:1;">
                <div style="font-size:13px; font-weight:700; color:var(--color-text-primary);">${t.name}</div>
                <div style="font-size:11px; color:var(--color-text-secondary);">${t.storeName} • ⭐ ${t.rating}</div>
                <div style="display:flex; gap:8px; margin-top:2px; font-size:11px;">
                  <span>Orders: <strong>${t.ordersCount}</strong></span>
                  <span style="color:var(--color-success); font-weight:700;">Trend: ${t.trendGrowth}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${this.renderBottomNav('products')}
    `;
  },

  setTrendPeriod(p) {
    this.trendPeriod = p;
    AppRouter.renderActiveScreen();
  },

  // -------------------------------------------------------------
  // SCREEN: PRODUCT MODERATION
  // -------------------------------------------------------------
  renderModeration() {
    const reported = store.data.reportedProducts || [];
    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-admin-products')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Product Moderation</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 70px;">
        <div style="font-size:12px; color:var(--color-text-secondary); margin-bottom:12px;">
          Reported products queue. Admin can hide or remove products while retaining audit trails.
        </div>

        ${reported.length === 0 ? `
          <div class="empty-state" style="padding-top:60px;">
            <span class="material-symbols-rounded empty-state-icon" style="color:var(--color-success);">gpp_good</span>
            <div class="empty-state-title">No Flagged Products</div>
            <div class="empty-state-desc">Community reports will appear here for administrative moderation.</div>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${reported.map((r, i) => `
              <div class="card" style="padding:14px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <h4 style="font-size:13px; font-weight:700;">${r.productName}</h4>
                  <span class="status-chip chip-warning">Reports: ${r.reportsCount}</span>
                </div>
                <div style="font-size:11px; color:var(--color-text-secondary); margin-bottom:6px;">
                  Store: <strong>${r.storeName}</strong> • Reason: "${r.reason}"
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-sm btn-outline" style="flex:1;" onclick="AdminModule.toggleHideProduct('${r.productId}')">Hide Product</button>
                  <button class="btn btn-sm btn-danger-outline" style="flex:1;" onclick="AdminModule.dismissReport(${i})">Dismiss</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      ${this.renderBottomNav('products')}
    `;
  },

  dismissReport(idx) {
    store.data.reportedProducts.splice(idx, 1);
    store.saveData();
    AppUtils.showToast('Report dismissed.');
    AppRouter.renderActiveScreen();
  },

  // -------------------------------------------------------------
  // SCREEN: SUPPORT CENTER (UNIFIED GENERAL & APPEALS)
  // -------------------------------------------------------------
  renderSupportCenter() {
    const tab = this.activeSupportTab;
    const tickets = store.getSupportTickets();
    const generalTickets = tickets.filter(t => !t.issueType.includes('Appeal'));
    const appeals = tickets.filter(t => t.issueType.includes('Appeal'));

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-admin-dashboard')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">🎫 Support Center</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 6px; padding-bottom: 70px;">
        <div class="filter-chip-row">
          <button class="filter-chip ${tab === 'general' ? 'active' : ''}" onclick="AdminModule.setSupportTab('general')">
            General Issues (${generalTickets.length})
          </button>
          <button class="filter-chip ${tab === 'appeals' ? 'active' : ''}" onclick="AdminModule.setSupportTab('appeals')">
            Refund & Replacement Appeals (${appeals.length})
          </button>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px; margin-top:8px;">
          ${(tab === 'general' ? generalTickets : appeals).map(t => `
            <div class="card" style="padding:14px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <h4 style="font-size:14px; font-weight:700;">${t.id} • ${t.issueType}</h4>
                <span class="status-chip ${t.status === 'Resolved' ? 'chip-delivered' : 'chip-warning'}">${t.status}</span>
              </div>
              <div style="font-size:12px; color:var(--color-text-secondary); margin-bottom:6px;">
                Customer: <strong>${t.customerName}</strong> (${t.customerPhone})
              </div>
              <p style="font-size:12px; color:var(--color-text-primary); line-height:1.4; margin-bottom:8px;">
                "${t.description}"
              </p>
              ${t.adminNotes ? `
                <div style="font-size:11px; background:#F4F8EE; padding:6px 10px; border-radius:var(--radius-sm); margin-bottom:8px;">
                  <strong>Admin Notes:</strong> ${t.adminNotes}
                </div>
              ` : ''}
              <button class="btn btn-sm btn-primary btn-block" onclick="AdminModule.openTicketResolutionModal('${t.id}')">
                Manage Ticket & Decision
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      ${this.renderBottomNav('dashboard')}
    `;
  },

  setSupportTab(tab) {
    this.activeSupportTab = tab;
    AppRouter.renderActiveScreen();
  },

  openTicketResolutionModal(ticketId) {
    const t = store.getSupportTickets().find(item => item.id === ticketId);
    if (!t) return;

    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">
        Resolve Ticket ${t.id}
      </h3>
      <p style="font-size:12px; color:var(--color-text-secondary); margin-bottom:12px;">${t.description}</p>
      
      <div class="form-group">
        <label class="form-label">Admin Notes</label>
        <textarea id="admin-ticket-notes" class="form-textarea" placeholder="Enter findings or resolution explanation...">${t.adminNotes || ''}</textarea>
      </div>

      <div style="display:flex; gap:8px;">
        <button class="btn btn-primary" style="flex:1;" onclick="AdminModule.resolveTicket('${t.id}', 'Resolved')">
          Mark as Resolved
        </button>
        <button class="btn btn-outline" style="flex:1;" onclick="AdminModule.resolveTicket('${t.id}', 'In Progress')">
          Set In Progress
        </button>
      </div>
    `);
  },

  resolveTicket(ticketId, status) {
    const notes = document.getElementById('admin-ticket-notes').value.trim();
    store.updateTicketStatus(ticketId, status, notes);
    store.addActivityLog(`Updated ticket ${ticketId} status to ${status}`);
    AppUtils.closeBottomSheet();
    AppUtils.showToast(`Ticket status updated to "${status}"`);
    AppRouter.renderActiveScreen();
  },

  // -------------------------------------------------------------
  // SCREEN: PLATFORM ANALYTICS & PERFORMANCE
  // -------------------------------------------------------------
  renderAnalytics() {
    const ents = store.getEntrepreneurs();
    const prods = store.data.products || [];
    const orders = store.data.orders || [];
    const f = this.analyticsTimeFilter;

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-admin-dashboard')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Platform Analytics</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 6px; padding-bottom: 70px;">
        <div class="filter-chip-row">
          <button class="filter-chip ${f === 'today' ? 'active' : ''}" onclick="AdminModule.setAnalyticsFilter('today')">Today</button>
          <button class="filter-chip ${f === 'week' ? 'active' : ''}" onclick="AdminModule.setAnalyticsFilter('week')">This Week</button>
          <button class="filter-chip ${f === 'month' ? 'active' : ''}" onclick="AdminModule.setAnalyticsFilter('month')">This Month</button>
        </div>

        <!-- Order Activity Chart -->
        <div class="card" style="padding:14px; margin-bottom:14px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:6px;">
            📈 Platform Order Activity (${f.toUpperCase()})
          </h4>
          <div class="simple-bar-chart">
            <div class="chart-bar-col"><div class="chart-bar-fill" style="height:45%;"></div><span class="chart-bar-val">18</span><span class="chart-bar-label">Mon</span></div>
            <div class="chart-bar-col"><div class="chart-bar-fill" style="height:60%;"></div><span class="chart-bar-val">24</span><span class="chart-bar-label">Tue</span></div>
            <div class="chart-bar-col"><div class="chart-bar-fill" style="height:50%;"></div><span class="chart-bar-val">20</span><span class="chart-bar-label">Wed</span></div>
            <div class="chart-bar-col"><div class="chart-bar-fill" style="height:75%;"></div><span class="chart-bar-val">32</span><span class="chart-bar-label">Thu</span></div>
            <div class="chart-bar-col"><div class="chart-bar-fill" style="height:85%;"></div><span class="chart-bar-val">38</span><span class="chart-bar-label">Fri</span></div>
            <div class="chart-bar-col accent"><div class="chart-bar-fill" style="height:100%;"></div><span class="chart-bar-val">46</span><span class="chart-bar-label">Sat</span></div>
            <div class="chart-bar-col accent"><div class="chart-bar-fill" style="height:90%;"></div><span class="chart-bar-val">42</span><span class="chart-bar-label">Sun</span></div>
          </div>
        </div>

        <!-- Category Distribution -->
        <div class="card" style="padding:14px; margin-bottom:14px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">
            🍰 Category Order Distribution
          </h4>
          <div style="display:flex; flex-direction:column; gap:8px; font-size:12px;">
            <div>
              <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                <span>Bakery & Sweets</span>
                <strong>42%</strong>
              </div>
              <div style="height:6px; background:#EFECE1; border-radius:3px; overflow:hidden;">
                <div style="width:42%; height:100%; background:var(--color-primary);"></div>
              </div>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                <span>Food & Tiffin</span>
                <strong>30%</strong>
              </div>
              <div style="height:6px; background:#EFECE1; border-radius:3px; overflow:hidden;">
                <div style="width:30%; height:100%; background:var(--color-secondary);"></div>
              </div>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                <span>Handmade Crafts</span>
                <strong>18%</strong>
              </div>
              <div style="height:6px; background:#EFECE1; border-radius:3px; overflow:hidden;">
                <div style="width:18%; height:100%; background:var(--color-accent);"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Platform Activity Indicators -->
        <div class="card" style="padding:14px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">Platform Health</h4>
          <div style="font-size:12px; display:flex; flex-direction:column; gap:6px;">
            <div>Active Listed Products: <strong>${prods.filter(p => p.status === 'active').length} / ${prods.length}</strong></div>
            <div>Active Sellers: <strong>${ents.filter(e => e.status === 'approved').length} / ${ents.length}</strong></div>
            <div>Order Completion Rate: <strong>98.4%</strong></div>
          </div>
        </div>
      </div>

      ${this.renderBottomNav('analytics')}
    `;
  },

  setAnalyticsFilter(f) {
    this.analyticsTimeFilter = f;
    AppRouter.renderActiveScreen();
  },

  // -------------------------------------------------------------
  // SCREEN: ADMIN PROFILE & READ-ONLY ACTIVITY LOGS
  // -------------------------------------------------------------
  renderProfile() {
    const logs = store.getActivityLogs();
    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-admin-dashboard')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Admin Profile</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 70px;">
        <div class="card" style="display:flex; align-items:center; gap:14px; padding:16px; margin-bottom:16px;">
          <div style="width:56px; height:56px; border-radius:50%; background:#EDE8D5; color:var(--color-primary); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <span class="material-symbols-rounded" style="font-size:32px;">shield_person</span>
          </div>
          <div>
            <h3 style="font-size:16px; font-weight:700; color:var(--color-text-primary);">System Administrator</h3>
            <span style="font-size:12px; color:var(--color-text-secondary);">admin@maneyinda.com</span>
            <div style="font-size:10px; color:var(--color-primary); font-weight:700; margin-top:2px;">SECURE PRIVILEGED ACCOUNT</div>
          </div>
        </div>

        <!-- Read-Only Activity Logs -->
        <h4 style="font-size:14px; font-weight:700; color:var(--color-text-primary); margin-bottom:8px;">
          📜 Recent Activity Logs (Audit Trail)
        </h4>
        <div class="card" style="padding:12px; margin-bottom:16px; max-height:220px; overflow-y:auto;">
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${logs.map(l => `
              <div style="font-size:12px; border-bottom:1px solid #F0EEE4; padding-bottom:6px;">
                <span style="color:var(--color-primary); font-weight:600;">✓</span>
                ${l.text}
                <span style="font-size:10px; color:var(--color-text-tertiary); display:block; margin-top:2px;">${l.time}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <button class="btn btn-outline btn-block" style="margin-bottom:10px;" onclick="AdminModule.openForgotPasswordModal()">
          🔒 Change Admin Password
        </button>

        <button class="btn btn-danger-outline btn-block" onclick="store.setRole('customer'); AppRouter.navigate('screen-welcome');">
          🚪 Logout of Admin Console
        </button>
      </div>

      ${this.renderBottomNav('profile')}
    `;
  },

  renderBottomNav(activeItem) {
    return `
      <div class="bottom-nav-bar">
        <button class="nav-item-btn ${activeItem === 'dashboard' ? 'active' : ''}" onclick="AppRouter.navigate('screen-admin-dashboard')">
          <div class="nav-icon-wrapper">
            <span class="material-symbols-rounded ${activeItem === 'dashboard' ? 'icon-filled' : 'icon-outlined'}">dashboard</span>
          </div>
          <span class="nav-label">Dashboard</span>
        </button>

        <button class="nav-item-btn ${activeItem === 'entrepreneurs' ? 'active' : ''}" onclick="AppRouter.navigate('screen-admin-entrepreneurs')">
          <div class="nav-icon-wrapper">
            <span class="material-symbols-rounded ${activeItem === 'entrepreneurs' ? 'icon-filled' : 'icon-outlined'}">storefront</span>
          </div>
          <span class="nav-label">Sellers</span>
        </button>

        <button class="nav-item-btn ${activeItem === 'products' ? 'active' : ''}" onclick="AppRouter.navigate('screen-admin-products')">
          <div class="nav-icon-wrapper">
            <span class="material-symbols-rounded ${activeItem === 'products' ? 'icon-filled' : 'icon-outlined'}">inventory_2</span>
          </div>
          <span class="nav-label">Products</span>
        </button>

        <button class="nav-item-btn ${activeItem === 'analytics' ? 'active' : ''}" onclick="AppRouter.navigate('screen-admin-analytics')">
          <div class="nav-icon-wrapper">
            <span class="material-symbols-rounded ${activeItem === 'analytics' ? 'icon-filled' : 'icon-outlined'}">analytics</span>
          </div>
          <span class="nav-label">Analytics</span>
        </button>

        <button class="nav-item-btn ${activeItem === 'profile' ? 'active' : ''}" onclick="AppRouter.navigate('screen-admin-profile')">
          <div class="nav-icon-wrapper">
            <span class="material-symbols-rounded ${activeItem === 'profile' ? 'icon-filled' : 'icon-outlined'}">admin_panel_settings</span>
          </div>
          <span class="nav-label">Profile</span>
        </button>
      </div>
    `;
  }
};
