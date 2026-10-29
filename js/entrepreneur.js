/* =====================================================================
   MANEYINDA MARUKATTE - ENTREPRENEUR MODULE
   Dashboard, Product Management, Orders, Earnings & Profile
===================================================================== */

const EntrepreneurModule = {
  currentFilter: 'all',
  earningsTimeFilter: 'month',
  activeProductModalId: null,
  dynamicCustomFields: [],
  offerFilter: 'all',
  editingOfferId: null,
  adFilter: 'all',
  editingAdId: null,
  currentUploadedAdImageUrl: null,

  getEntrepreneur() {
    const user = store.getUser();
    return store.getEntrepreneurById(user.entrepreneurId) || store.getEntrepreneurs()[0];
  },

  // -------------------------------------------------------------
  // SCREEN: ENTREPRENEUR DASHBOARD
  // -------------------------------------------------------------
  renderDashboard() {
    const ent = this.getEntrepreneur();
    const orders = store.getOrders({ entrepreneurId: ent.id });
    const products = store.getProducts({ entrepreneurId: ent.id });

    const todayOrders = orders.filter(o => o.date.includes('25 Oct') || o.date.includes('Today'));
    const pendingOrders = orders.filter(o => ['new', 'accepted', 'preparing'].includes(o.orderStatus.toLowerCase()));
    const activeProducts = products.filter(p => p.status === 'active');
    const monthEarnings = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    return `
      <!-- Dashboard Header -->
      <div class="home-header-bar" style="padding-top:14px;">
        <div class="home-greeting-wrap">
          <span style="font-size:12px; color:var(--color-text-secondary); font-weight:500;">Welcome,</span>
          <h2 style="font-size:18px; font-weight:700; color:var(--color-text-primary);">
            ${ent.name} 👋
          </h2>
          <span style="font-size:11px; color:var(--color-secondary); font-weight:500;">
            Grow your business with confidence.
          </span>
        </div>
        <div class="top-app-bar-actions" style="display:flex; align-items:center; gap:8px;">
          <div class="chip-badge" style="font-size:11px; padding:3px 8px; border-radius:var(--radius-full); display:flex; align-items:center; gap:3px;">
            <span class="material-symbols-rounded" style="font-size:14px;">verified</span>
            ${ent.badge || 'Verified'}
          </div>
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-ent-profile')">
            <span class="material-symbols-rounded">notifications</span>
          </button>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px;">
        <!-- 4 Business Overview Summary Cards -->
        <div class="stat-card-grid">
          <div class="stat-card">
            <div class="stat-icon-wrap">
              <span class="material-symbols-rounded">inventory_2</span>
            </div>
            <div class="stat-value">${todayOrders.length}</div>
            <div class="stat-label">Today's Orders</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap" style="background:#E8F5E9; color:var(--color-primary);">
              <span class="material-symbols-rounded">payments</span>
            </div>
            <div class="stat-value">₹${monthEarnings.toLocaleString()}</div>
            <div class="stat-label">This Month's Earnings</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap" style="background:#E1F5FE; color:var(--color-info);">
              <span class="material-symbols-rounded">storefront</span>
            </div>
            <div class="stat-value">${activeProducts.length}</div>
            <div class="stat-label">Active Products</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap" style="background:#FFF3E0; color:var(--color-warning);">
              <span class="material-symbols-rounded">pending_actions</span>
            </div>
            <div class="stat-value">${pendingOrders.length}</div>
            <div class="stat-label">Pending Orders</div>
          </div>
        </div>

        <!-- Store Open / Closed Status Quick Banner -->
        <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:10px 14px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:12px; font-weight:700; color:var(--color-text-primary); display:flex; align-items:center; gap:6px;">
              <span style="width:8px; height:8px; border-radius:50%; background:${ent.isStoreOpen ? 'var(--color-success)' : 'var(--color-error)'};"></span>
              Store Status: ${ent.isStoreOpen ? 'Open & Accepting Orders' : 'Store Closed'}
            </div>
            <div style="font-size:11px; color:var(--color-text-secondary); margin-top:2px;">
              ${ent.openingSchedule || 'Opens Daily at 9:00 AM'}
            </div>
          </div>
          <button class="btn btn-sm btn-outline" onclick="AppRouter.navigate('screen-ent-availability')">
            Manage
          </button>
        </div>

        <!-- Promotional Offers Quick Access Banner -->
        <div style="background: linear-gradient(135deg, #4A6B32 0%, #2E451E 100%); border-radius:var(--radius-md); padding:12px 14px; margin-bottom:12px; color:#FFF; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:13px; font-weight:700; display:flex; align-items:center; gap:6px;">
              <span>🏷️</span> Promotional Offers & Discounts
            </div>
            <div style="font-size:11px; opacity:0.9; color:#F4EBD9; margin-top:2px;">
              Create shop coupons, discount badges & festive deals
            </div>
          </div>
          <button class="btn btn-sm" style="background:#FFF; color:#2E451E; font-weight:700; border:none; padding:6px 12px; border-radius:var(--radius-full); font-size:11px; cursor:pointer;" onclick="AppRouter.navigate('screen-ent-offers')">
            Manage Offers
          </button>
        </div>

        <!-- Advertisements Quick Access Banner -->
        <div style="background: linear-gradient(135deg, #556B2F 0%, #283C14 100%); border-radius:var(--radius-md); padding:12px 14px; margin-bottom:16px; color:#FFF; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:13px; font-weight:700; display:flex; align-items:center; gap:6px;">
              <span>📢</span> My Shop Advertisements
            </div>
            <div style="font-size:11px; opacity:0.9; color:#F4EBD9; margin-top:2px;">
              Promote your shop & products on the customer home carousel
            </div>
          </div>
          <button class="btn btn-sm" style="background:#FFF; color:#283C14; font-weight:700; border:none; padding:6px 12px; border-radius:var(--radius-full); font-size:11px; cursor:pointer;" onclick="AppRouter.navigate('screen-ent-advertisements')">
            Manage Ads
          </button>
        </div>

        <!-- Today's Recent Orders Section -->
        <div class="section-header-row">
          <h3 class="section-header-title">Today's Recent Orders</h3>
          <button class="btn btn-text btn-sm" onclick="AppRouter.navigate('screen-ent-orders')">View All ></button>
        </div>

        ${orders.length === 0 ? `
          <div class="empty-state" style="padding:24px 0;">
            <span class="material-symbols-rounded empty-state-icon">package_2</span>
            <div class="empty-state-title">No Orders Yet</div>
            <div class="empty-state-desc">New customer orders will appear here.</div>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${orders.slice(0, 3).map(o => `
              <div class="card card-clickable" style="padding:12px 14px; cursor:pointer;" onclick="EntrepreneurModule.viewOrderDetails('${o.id}')">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
                  <div>
                    <h4 style="font-size:14px; font-weight:700; color:var(--color-text-primary);">${o.customerName}</h4>
                    <span style="font-size:11px; color:var(--color-text-secondary);">${o.id} • ${o.items.length} Item(s)</span>
                  </div>
                  <span class="status-chip ${AppUtils.getStatusChipClass(o.orderStatus)}">
                    ${o.orderStatus}
                  </span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:12px;">
                  <span style="font-weight:700; color:var(--color-primary);">₹${o.grandTotal}</span>
                  <span style="color:var(--color-secondary); font-weight:600;">Details & Actions ></span>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      ${this.renderBottomNav('home')}
    `;
  },

  // -------------------------------------------------------------
  // PRODUCTS LISTING (MY PRODUCTS)
  // -------------------------------------------------------------
  renderProducts() {
    const ent = this.getEntrepreneur();
    const products = store.getProducts({ entrepreneurId: ent.id });

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-ent-dashboard')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">My Products</span>
        </div>
        <button class="btn btn-primary btn-sm" onclick="EntrepreneurModule.openAddProduct()">
          <span class="material-symbols-rounded" style="font-size:18px;">add</span>
          Add Product
        </button>
      </div>

      <div class="screen-content" style="padding-top: 10px;">
        ${products.length === 0 ? `
          <div class="empty-state">
            <span class="material-symbols-rounded empty-state-icon">inventory_2</span>
            <div class="empty-state-title">No Products Added Yet</div>
            <div class="empty-state-desc">Start selling by adding your first homemade product.</div>
            <button class="btn btn-primary" onclick="EntrepreneurModule.openAddProduct()" style="margin-top:12px;">
              + Add Product
            </button>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:12px; padding-bottom: 70px;">
            ${products.map(p => `
              <div class="card" style="display:flex; gap:12px; padding:12px; position:relative;">
                <img src="${p.images[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300'}" alt="${p.name}" style="width:72px; height:72px; border-radius:var(--radius-md); object-fit:cover; background:#EAE6D6;">
                
                <div style="flex:1; display:flex; flex-direction:column; gap:3px;">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; padding-right:20px;">
                    <h4 style="font-size:13px; font-weight:700; color:var(--color-text-primary); line-height:1.3;">${p.name}</h4>
                  </div>
                  
                  <span style="font-size:11px; color:var(--color-text-secondary);">${p.category}</span>
                  
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                    <span style="font-size:14px; font-weight:700; color:var(--color-primary);">₹${p.price}</span>
                    <span style="font-size:11px; color:var(--color-text-tertiary);">Stock: <strong>${p.stock}</strong></span>
                    <span class="status-chip ${p.stock > 0 ? 'chip-delivered' : 'chip-cancelled'}" style="font-size:10px; padding:2px 8px;">
                      ${p.stock > 0 ? '🟢 In Stock' : '🔴 Out of Stock'}
                    </span>
                  </div>
                </div>

                <button class="icon-action-btn" style="position:absolute; top:6px; right:4px;" onclick="EntrepreneurModule.openProductOptions('${p.id}')">
                  <span class="material-symbols-rounded">more_vert</span>
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      ${this.renderBottomNav('products')}
    `;
  },

  openProductOptions(productId) {
    this.activeProductModalId = productId;
    const p = store.getProductById(productId);
    if (!p) return;

    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-text-primary); margin-bottom:12px;">
        ${p.name}
      </h3>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <button class="btn btn-outline btn-block" style="justify-content:flex-start; gap:12px;" onclick="AppUtils.closeBottomSheet(); EntrepreneurModule.openEditProduct('${p.id}')">
          <span class="material-symbols-rounded" style="color:var(--color-primary);">edit</span>
          ✏ Edit Product Details
        </button>
        <button class="btn btn-outline btn-block" style="justify-content:flex-start; gap:12px;" onclick="AppUtils.closeBottomSheet(); EntrepreneurModule.openUpdateStock('${p.id}')">
          <span class="material-symbols-rounded" style="color:var(--color-secondary);">inventory</span>
          📦 Quick Update Stock
        </button>
        <button class="btn btn-danger-outline btn-block" style="justify-content:flex-start; gap:12px;" onclick="AppUtils.closeBottomSheet(); EntrepreneurModule.confirmDeleteProduct('${p.id}')">
          <span class="material-symbols-rounded">delete</span>
          🗑 Delete Product
        </button>
      </div>
      <button class="btn btn-text btn-block" onclick="AppUtils.closeBottomSheet()" style="margin-top:10px;">
        Cancel
      </button>
    `);
  },

  // -------------------------------------------------------------
  // ADD / EDIT PRODUCT FORM
  // -------------------------------------------------------------
  editingProductImages: [],

  openAddProduct() {
    this.activeProductModalId = null;
    this.dynamicCustomFields = [];
    this.editingProductImages = [];
    AppRouter.navigate('screen-ent-add-product');
  },

  openEditProduct(productId) {
    this.activeProductModalId = productId;
    const p = store.getProductById(productId);
    if (!p) return;
    this.dynamicCustomFields = JSON.parse(JSON.stringify(p.customizationFields || []));
    this.editingProductImages = p.images ? [...p.images] : [];
    AppRouter.navigate('screen-ent-add-product');
  },

  handleProductImageUpload(input) {
    if (!input.files || input.files.length === 0) return;
    const remainingSlots = 5 - this.editingProductImages.length;
    if (remainingSlots <= 0) {
      AppUtils.showToast('Maximum 5 product images allowed');
      return;
    }
    const filesToRead = Array.from(input.files).slice(0, remainingSlots);
    let loaded = 0;
    filesToRead.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.editingProductImages.push(e.target.result);
        loaded++;
        if (loaded === filesToRead.length) {
          AppUtils.showToast(`${loaded} photo(s) added!`);
          AppRouter.renderActiveScreen();
        }
      };
      reader.readAsDataURL(file);
    });
  },

  removeProductImage(index) {
    this.editingProductImages.splice(index, 1);
    AppRouter.renderActiveScreen();
  },

  renderAddOrEditProduct() {
    const isEdit = !!this.activeProductModalId;
    const p = isEdit ? store.getProductById(this.activeProductModalId) : null;
    const cats = store.data.categories.filter(c => c.active);
    const displayImages = this.editingProductImages.length > 0 
      ? this.editingProductImages 
      : (p && p.images && p.images.length > 0 ? p.images : []);

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-ent-products')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">${isEdit ? 'Edit Product' : 'Add Product'}</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 40px;">
        <!-- Images with Real File Selector -->
        <input type="file" id="prod-images-file-input" accept="image/jpeg,image/png,image/webp" multiple style="display:none;" onchange="EntrepreneurModule.handleProductImageUpload(this)">
        <div class="form-group">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="form-label" style="margin:0;">Product Images (${displayImages.length}/5) <span class="req">*</span></label>
            <span style="font-size:11px; color:var(--color-text-tertiary);">Tap + to choose from device</span>
          </div>
          <div style="display:flex; gap:8px; overflow-x:auto; padding:6px 0; align-items:center;">
            ${displayImages.length < 5 ? `
              <div class="doc-upload-box" style="width:72px; height:72px; padding:0; display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0; cursor:pointer;" onclick="document.getElementById('prod-images-file-input').click()">
                <span class="material-symbols-rounded" style="color:var(--color-primary); font-size:26px;">add_a_photo</span>
                <span style="font-size:9.5px; font-weight:700; color:var(--color-primary); margin-top:2px;">Add Photo</span>
              </div>
            ` : ''}
            ${displayImages.map((imgSrc, idx) => `
              <div style="position:relative; width:72px; height:72px; flex-shrink:0;">
                <img src="${imgSrc}" style="width:72px; height:72px; border-radius:var(--radius-md); object-fit:cover; border:1px solid #E0E0E0;">
                <button type="button" onclick="EntrepreneurModule.removeProductImage(${idx})" style="position:absolute; top:-4px; right:-4px; width:20px; height:20px; border-radius:50%; background:#D32F2F; color:#FFF; border:none; display:flex; align-items:center; justify-content:center; font-size:11px; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.2);">✕</button>
              </div>
            `).join('')}
            ${displayImages.length === 0 ? `
              <div style="font-size:11px; color:var(--color-text-tertiary); padding-left:4px;">No photos selected yet</div>
            ` : ''}
          </div>
        </div>

        <!-- Title + AI Improve -->
        <div class="form-group">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="form-label" style="margin:0;">Product Name <span class="req">*</span></label>
            <button type="button" class="ai-action-btn" onclick="EntrepreneurModule.aiImproveTitle()">
              ✨ Improve Title
            </button>
          </div>
          <input type="text" id="prod-form-name" class="form-input" placeholder="e.g. Dutch Chocolate Cake" value="${p ? p.name : ''}">
        </div>

        <!-- Category -->
        <div class="form-group">
          <label class="form-label">Category <span class="req">*</span></label>
          <select id="prod-form-category" class="form-select">
            ${cats.map(c => `<option value="${c.name}" ${p && p.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>

        <!-- Price + AI Suggest -->
        <div class="form-group">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="form-label" style="margin:0;">Price (₹) <span class="req">*</span></label>
            <button type="button" class="ai-action-btn" onclick="EntrepreneurModule.aiSuggestPrice()">
              🤖 Suggest Price
            </button>
          </div>
          <input type="number" id="prod-form-price" class="form-input" placeholder="450" value="${p ? p.price : 450}">
        </div>

        <!-- Available Quantity -->
        <div class="form-group">
          <label class="form-label">Available Quantity <span class="req">*</span></label>
          <input type="number" id="prod-form-qty" class="form-input" min="1" value="${p ? p.stock : 10}">
        </div>

        <!-- Description + AI Generate -->
        <div class="form-group">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="form-label" style="margin:0;">Description <span class="req">*</span></label>
            <button type="button" class="ai-action-btn" onclick="EntrepreneurModule.aiGenerateDesc()">
              🤖 Generate Description
            </button>
          </div>
          <textarea id="prod-form-desc" class="form-textarea" placeholder="Tell customers how this is lovingly prepared...">${p ? p.description : ''}</textarea>
        </div>

        <!-- Dynamic Customization Options -->
        <div class="card" style="padding:14px; margin:16px 0;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div>
              <h4 style="font-size:13px; font-weight:700; color:var(--color-primary);">🛠 Customization Options</h4>
              <p style="font-size:11px; color:var(--color-text-secondary);">e.g. Size, Spice Level, Sweetness, Cake Message</p>
            </div>
            <button type="button" class="btn btn-sm btn-outline" onclick="EntrepreneurModule.addCustomFieldPrompt()">
              + Add Field
            </button>
          </div>
          <div id="custom-fields-container" style="display:flex; flex-direction:column; gap:6px;">
            ${this.renderCustomFieldsList()}
          </div>
        </div>

        <!-- Delivery Method -->
        <div class="card" style="padding:14px; margin-bottom:16px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">
            🚚 Delivery Method
          </h4>
          <div style="display:flex; gap:16px; margin-bottom:12px;">
            <label style="display:flex; align-items:center; gap:6px; font-size:13px; font-weight:500;">
              <input type="checkbox" id="chk-home-delivery" ${!p || (p.deliveryMethod && p.deliveryMethod.homeDelivery) ? 'checked' : ''} onchange="EntrepreneurModule.toggleDeliverySettings(this.checked)" style="accent-color:var(--color-primary);">
              Home Delivery
            </label>
            <label style="display:flex; align-items:center; gap:6px; font-size:13px; font-weight:500;">
              <input type="checkbox" id="chk-pickup" ${!p || (p.deliveryMethod && p.deliveryMethod.pickup) ? 'checked' : ''} style="accent-color:var(--color-primary);">
              Pickup
            </label>
          </div>

          <div id="home-delivery-settings" style="display:${!p || (p.deliveryMethod && p.deliveryMethod.homeDelivery) ? 'block' : 'none'};">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
              <div class="form-group" style="margin-bottom:8px;">
                <label class="form-label">Delivery Charge (₹)</label>
                <input type="number" id="prod-del-charge" class="form-input" value="${p && p.deliveryMethod && p.deliveryMethod.deliveryCharge !== undefined ? p.deliveryMethod.deliveryCharge : 30}">
              </div>
              <div class="form-group" style="margin-bottom:8px;">
                <label class="form-label">Delivery Radius</label>
                <select id="prod-del-radius" class="form-select">
                  <option value="5">5 km</option>
                  <option value="10" selected>10 km</option>
                  <option value="15">15 km</option>
                </select>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Estimated Delivery Time</label>
              <input type="text" id="prod-del-time" class="form-input" placeholder="Today before 5:30 PM" value="${(p && p.deliveryMethod && p.deliveryMethod.estimatedDelivery) || 'Today before 5:30 PM'}">
            </div>
          </div>
        </div>

        <!-- After-Sales Support -->
        <div class="card" style="padding:14px; margin-bottom:16px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">
            🛡 After-Sales Support
          </h4>
          <div class="form-group">
            <label class="form-label">Support Option</label>
            <select id="prod-after-sales-type" class="form-select">
              <option value="Return & Replacement">Return & Replacement</option>
              <option value="Replacement Only">Replacement Only</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div class="form-group">
              <label class="form-label">Support Window</label>
              <select id="prod-support-window" class="form-select">
                <option value="24 Hours">24 Hours</option>
                <option value="3 Days" selected>3 Days</option>
                <option value="7 Days">7 Days</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Return Required?</label>
              <select id="prod-return-req" class="form-select">
                <option value="Yes" selected>Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Availability Toggle -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:12px; margin-bottom:20px;">
          <div>
            <div style="font-size:13px; font-weight:700; color:var(--color-text-primary);">Product Availability</div>
            <div style="font-size:11px; color:var(--color-text-secondary);">Show as Active in customer listings</div>
          </div>
          <input type="checkbox" id="prod-availability-chk" checked style="accent-color:var(--color-primary); width:20px; height:20px;">
        </div>

        <button class="btn btn-primary btn-block" onclick="EntrepreneurModule.handleSaveProduct()">
          ${isEdit ? 'Save Changes' : 'Add Product'}
          <span class="material-symbols-rounded">check</span>
        </button>
      </div>
    `;
  },

  renderCustomFieldsList() {
    if (this.dynamicCustomFields.length === 0) {
      return `<p style="font-size:12px; color:var(--color-text-tertiary); font-style:italic;">No custom fields added yet.</p>`;
    }
    return this.dynamicCustomFields.map((f, i) => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:#FAF8F0; padding:6px 10px; border-radius:var(--radius-sm); font-size:12px;">
        <span><strong>${f.name}</strong> (${f.type})</span>
        <button class="btn-text" style="color:var(--color-error); padding:2px;" onclick="EntrepreneurModule.removeCustomField(${i})">Remove</button>
      </div>
    `).join('');
  },

  addCustomFieldPrompt() {
    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin-bottom:10px;">+ Add Custom Field</h3>
      <div class="form-group">
        <label class="form-label">Field Name</label>
        <input type="text" id="new-custom-name" class="form-input" placeholder="e.g. Spice Level or Cake Message">
      </div>
      <div class="form-group">
        <label class="form-label">Field Type</label>
        <select id="new-custom-type" class="form-select">
          <option value="text">Text Input (Customer writes)</option>
          <option value="select">Selectable Options (Customer picks)</option>
        </select>
      </div>
      <div class="form-group" id="new-custom-opts-wrap" style="display:none;">
        <label class="form-label">Options (comma-separated)</label>
        <input type="text" id="new-custom-options" class="form-input" placeholder="Mild, Medium, Spicy">
      </div>
      <button class="btn btn-primary btn-block" onclick="EntrepreneurModule.saveNewCustomField()">Save Field</button>
    `);

    setTimeout(() => {
      const typeSelect = document.getElementById('new-custom-type');
      if (typeSelect) {
        typeSelect.onchange = (e) => {
          document.getElementById('new-custom-opts-wrap').style.display = e.target.value === 'select' ? 'block' : 'none';
        };
      }
    }, 100);
  },

  saveNewCustomField() {
    const name = document.getElementById('new-custom-name').value.trim();
    const type = document.getElementById('new-custom-type').value;
    const optsInput = document.getElementById('new-custom-options');
    const optsStr = optsInput ? optsInput.value : '';
    if (!name) return;

    this.dynamicCustomFields.push({
      name,
      type,
      options: type === 'select' ? optsStr.split(',').map(s => s.trim()) : [],
      required: true
    });

    AppUtils.closeBottomSheet();
    const cont = document.getElementById('custom-fields-container');
    if (cont) cont.innerHTML = this.renderCustomFieldsList();
  },

  removeCustomField(idx) {
    this.dynamicCustomFields.splice(idx, 1);
    const cont = document.getElementById('custom-fields-container');
    if (cont) cont.innerHTML = this.renderCustomFieldsList();
  },

  toggleDeliverySettings(checked) {
    const el = document.getElementById('home-delivery-settings');
    if (el) el.style.display = checked ? 'block' : 'none';
  },

  aiImproveTitle() {
    const input = document.getElementById('prod-form-name');
    const catEl = document.getElementById('prod-form-category');
    const cat = catEl ? catEl.value : 'Bakery & Sweets';
    if (!input) return;
    input.value = AppAI.improveProductTitle(input.value, cat);
    AppUtils.showToast('✨ Title improved by AI!');
  },

  aiSuggestPrice() {
    const catEl = document.getElementById('prod-form-category');
    const nameEl = document.getElementById('prod-form-name');
    const cat = catEl ? catEl.value : 'Bakery & Sweets';
    const name = nameEl ? nameEl.value : '';
    const input = document.getElementById('prod-form-price');
    if (!input) return;
    input.value = AppAI.suggestProductPrice(cat, name);
    AppUtils.showToast('🤖 Price suggested based on market data!');
  },

  aiGenerateDesc() {
    const nameEl = document.getElementById('prod-form-name');
    const catEl = document.getElementById('prod-form-category');
    const title = nameEl ? nameEl.value : '';
    const cat = catEl ? catEl.value : 'Bakery & Sweets';
    const desc = document.getElementById('prod-form-desc');
    if (!desc) return;
    desc.value = AppAI.generateProductDescription(title, cat);
    AppUtils.showToast('🤖 Description generated with local charm!');
  },

  handleSaveProduct() {
    const name = document.getElementById('prod-form-name').value.trim();
    const category = document.getElementById('prod-form-category').value;
    const price = parseFloat(document.getElementById('prod-form-price').value) || 0;
    const stock = parseInt(document.getElementById('prod-form-qty').value, 10) || 0;
    const description = document.getElementById('prod-form-desc').value.trim();
    const homeDel = document.getElementById('chk-home-delivery').checked;
    const pickup = document.getElementById('chk-pickup').checked;
    const delChargeEl = document.getElementById('prod-del-charge');
    const delCharge = delChargeEl ? (parseFloat(delChargeEl.value) || 30) : 30;
    const delRadEl = document.getElementById('prod-del-radius');
    const delRadius = delRadEl ? (parseInt(delRadEl.value, 10) || 10) : 10;
    const delTimeEl = document.getElementById('prod-del-time');
    const delTime = delTimeEl ? (delTimeEl.value || 'Today before 5:30 PM') : 'Today before 5:30 PM';
    const afterSalesType = document.getElementById('prod-after-sales-type').value;
    const supportWindow = document.getElementById('prod-support-window').value;
    const returnRequired = document.getElementById('prod-return-req').value === 'Yes';
    const inStock = document.getElementById('prod-availability-chk').checked;

    if (!name || price <= 0 || stock < 1 || !description) {
      AppUtils.showToast('Please complete all required fields.');
      return;
    }

    const ent = this.getEntrepreneur();
    const prodPayload = {
      entrepreneurId: ent.id,
      storeName: ent.businessName,
      name,
      category,
      price,
      stock,
      description,
      images: this.editingProductImages.length > 0 
        ? this.editingProductImages 
        : ((this.activeProductModalId && store.getProductById(this.activeProductModalId) && store.getProductById(this.activeProductModalId).images) || ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600']),
      attributes: ['Handcrafted', 'Local Specialty'],
      specifications: { Category: category, Stock: stock },
      customizationFields: this.dynamicCustomFields,
      deliveryMethod: {
        homeDelivery: homeDel,
        pickup: pickup,
        deliveryRadius: delRadius,
        deliveryCharge: delCharge,
        freeDelivery: false,
        estimatedDelivery: delTime
      },
      afterSales: {
        type: afterSalesType,
        supportWindow,
        returnRequired,
        instructions: 'Retain original package.'
      },
      status: inStock ? 'active' : 'out_of_stock'
    };

    if (this.activeProductModalId) {
      store.updateProduct(this.activeProductModalId, prodPayload);
      if (window.apiClient && window.apiClient.isOnline) {
        window.apiClient.request(`/products/${this.activeProductModalId}`, {
          method: 'PUT',
          body: JSON.stringify(prodPayload)
        });
      }
      AppUtils.showToast('✅ Product Updated Successfully');
    } else {
      if (window.apiClient && window.apiClient.isOnline) {
        window.apiClient.createProduct(prodPayload).then(res => {
          if (res.data) store.addProduct(res.data);
          else store.addProduct(prodPayload);
        });
      } else {
        store.addProduct(prodPayload);
      }
      AppUtils.showToast('✅ Product Added Successfully');
    }

    AppRouter.navigate('screen-ent-products');
  },

  // -------------------------------------------------------------
  // QUICK UPDATE STOCK
  // -------------------------------------------------------------
  openUpdateStock(productId) {
    const p = store.getProductById(productId);
    if (!p) return;

    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin-bottom:6px;">
        📦 Quick Update Stock
      </h3>
      <p style="font-size:13px; font-weight:600; color:var(--color-text-primary); margin-bottom:12px;">${p.name}</p>

      <div style="background:#FAF8F0; border-radius:var(--radius-md); padding:16px; display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <span style="font-size:13px; color:var(--color-text-secondary);">Current Stock:</span>
        <div class="quantity-stepper">
          <button class="stepper-btn" onclick="EntrepreneurModule.adjustQuickStock(-1)">-</button>
          <span class="stepper-value" id="quick-stock-val">${p.stock}</span>
          <button class="stepper-btn" onclick="EntrepreneurModule.adjustQuickStock(1)">+</button>
        </div>
      </div>

      <button class="btn btn-primary btn-block" onclick="EntrepreneurModule.saveQuickStock('${p.id}')">
        Save Stock
      </button>
    `);
  },

  adjustQuickStock(delta) {
    const el = document.getElementById('quick-stock-val');
    if (!el) return;
    let v = Math.max(0, parseInt(el.textContent, 10) + delta);
    el.textContent = v;
  },

  saveQuickStock(productId) {
    const el = document.getElementById('quick-stock-val');
    if (!el) return;
    const newStock = parseInt(el.textContent, 10);
    store.updateProduct(productId, {
      stock: newStock,
      status: newStock > 0 ? 'active' : 'out_of_stock'
    });
    if (window.apiClient && window.apiClient.isOnline) {
      window.apiClient.updateStock(productId, newStock);
    }
    AppUtils.closeBottomSheet();
    AppUtils.showToast('✅ Stock Updated Successfully');
    AppRouter.renderActiveScreen();
  },

  confirmDeleteProduct(productId) {
    const p = store.getProductById(productId);
    if (!p) return;

    AppUtils.showBottomSheet(`
      <div style="text-align:center; padding:10px 0;">
        <div style="width:140px; height:80px; margin:0 auto 10px auto;">
          ${AppIllustrations.warningDelete}
        </div>
        <h3 style="font-size:17px; font-weight:700; color:#C62828; margin-bottom:6px;">Delete Product?</h3>
        <p style="font-size:12px; color:var(--color-text-secondary); line-height:1.4; margin-bottom:16px;">
          Deleting "<strong>${p.name}</strong>" will permanently remove it from customer listings. This action cannot be undone.
        </p>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-outline" style="flex:1;" onclick="AppUtils.closeBottomSheet()">Cancel</button>
          <button class="btn btn-danger" style="flex:1;" onclick="store.deleteProduct('${p.id}'); AppUtils.closeBottomSheet(); AppUtils.showToast('✅ Product Deleted Successfully'); AppRouter.renderActiveScreen();">
            Delete Product
          </button>
        </div>
      </div>
    `);
  },

  // -------------------------------------------------------------
  // ORDERS MANAGEMENT & AFTER-SALES REQUESTS
  // -------------------------------------------------------------
  renderOrders() {
    const ent = this.getEntrepreneur();
    let orders = store.getOrders({ entrepreneurId: ent.id });
    
    // Status filter
    if (this.currentFilter !== 'all') {
      orders = orders.filter(o => o.orderStatus.toLowerCase() === this.currentFilter.toLowerCase());
    }

    const afterSalesOrders = store.getOrders({ entrepreneurId: ent.id }).filter(o => o.refundRequest || o.replacementRequest);

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-ent-dashboard')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Orders</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 6px;">
        <!-- Filter Chips -->
        <div class="filter-chip-row">
          <button class="filter-chip ${this.currentFilter === 'all' ? 'active' : ''}" onclick="EntrepreneurModule.setFilter('all')">All</button>
          <button class="filter-chip ${this.currentFilter === 'new' ? 'active' : ''}" onclick="EntrepreneurModule.setFilter('new')">New</button>
          <button class="filter-chip ${this.currentFilter === 'preparing' ? 'active' : ''}" onclick="EntrepreneurModule.setFilter('preparing')">Preparing</button>
          <button class="filter-chip ${this.currentFilter === 'out for delivery' ? 'active' : ''}" onclick="EntrepreneurModule.setFilter('out for delivery')">Out for Delivery</button>
          <button class="filter-chip ${this.currentFilter === 'delivered' ? 'active' : ''}" onclick="EntrepreneurModule.setFilter('delivered')">Delivered</button>
        </div>

        <!-- After-Sales Banner if any active disputes -->
        ${afterSalesOrders.length > 0 ? `
          <div class="ai-card" style="background:#FFF9C4; border:1px solid #E9B949; margin-bottom:12px; cursor:pointer;" onclick="EntrepreneurModule.showAfterSalesRequests()">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:12px; font-weight:700; color:#8C6200;">
                🔔 ${afterSalesOrders.length} After-Sales Request(s) Pending Review
              </span>
              <span class="material-symbols-rounded" style="color:#8C6200;">chevron_right</span>
            </div>
          </div>
        ` : ''}

        ${orders.length === 0 ? `
          <div class="empty-state">
            <span class="material-symbols-rounded empty-state-icon">receipt_long</span>
            <div class="empty-state-title">No Orders in this Status</div>
            <div class="empty-state-desc">Customer orders will appear here as they progress.</div>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:10px; padding-bottom: 70px;">
            ${orders.map(o => `
              <div class="card card-clickable" style="padding:14px; cursor:pointer;" onclick="EntrepreneurModule.viewOrderDetails('${o.id}')">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                  <div>
                    <h4 style="font-size:14px; font-weight:700; color:var(--color-text-primary);">${o.id}</h4>
                    <span style="font-size:12px; color:var(--color-text-secondary);">${o.customerName} • ${o.items.length} Item(s)</span>
                  </div>
                  <span class="status-chip ${AppUtils.getStatusChipClass(o.orderStatus)}">
                    ${o.orderStatus}
                  </span>
                </div>

                <div style="font-size:12px; color:var(--color-text-tertiary); margin-bottom:8px;">
                  Ordered: ${o.date} • ${o.deliveryMethod}
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #F0EEE4; padding-top:8px;">
                  <span style="font-size:15px; font-weight:700; color:var(--color-primary);">₹${o.grandTotal}</span>
                  <button class="btn btn-sm btn-outline">View Details</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      ${this.renderBottomNav('orders')}
    `;
  },

  setFilter(f) {
    this.currentFilter = f;
    AppRouter.renderActiveScreen();
  },

  viewOrderDetails(orderId) {
    AppRouter.navigate('screen-ent-order-details', { orderId });
  },

  renderOrderDetails(params) {
    const o = store.getOrderById(params.orderId);
    if (!o) return `<div class="screen-content">Order not found</div>`;

    const isHomeDel = o.deliveryMethod.includes('Home');

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-ent-orders')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Order ${o.id}</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 90px;">
        <!-- Customer Details -->
        <div class="card" style="padding:14px; margin-bottom:12px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:6px;">👤 Customer Details</h4>
          <div style="font-size:13px; font-weight:600; color:var(--color-text-primary);">${o.customerName}</div>
          <div style="font-size:12px; color:var(--color-text-secondary); margin-top:2px;">Phone: ${o.customerPhone}</div>
          ${o.orderNote ? `<div style="font-size:11px; color:#8C6200; background:#FFFDE7; padding:6px 10px; border-radius:var(--radius-sm); margin-top:8px;">Note: "${o.orderNote}"</div>` : ''}
        </div>

        <!-- Delivery Method & Address -->
        <div class="card" style="padding:14px; margin-bottom:12px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:6px;">
            ${isHomeDel ? '🚚 Home Delivery' : '🏪 Pickup'}
          </h4>
          ${isHomeDel ? `
            <div style="font-size:12px; color:var(--color-text-secondary); line-height:1.4;">
              ${o.deliveryAddress.door}, ${o.deliveryAddress.street}, ${o.deliveryAddress.area}, ${o.deliveryAddress.city} - ${o.deliveryAddress.pincode}
            </div>
          ` : `
            <div style="font-size:12px; color:var(--color-text-secondary);">Customer will collect directly from store.</div>
          `}
        </div>

        <!-- Items Ordered -->
        <div class="card" style="padding:14px; margin-bottom:12px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:10px;">Order Items (${o.items.length})</h4>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${o.items.map(i => `
              <div style="display:flex; gap:10px; align-items:center;">
                <img src="${i.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200'}" style="width:52px; height:52px; border-radius:var(--radius-sm); object-fit:cover;">
                <div style="flex:1;">
                  <div style="font-size:13px; font-weight:600; color:var(--color-text-primary);">${i.name}</div>
                  <div style="font-size:12px; color:var(--color-text-secondary);">Qty: ${i.qty} × ₹${i.price}</div>
                  ${i.customization && Object.keys(i.customization).length > 0 ? `
                    <div style="font-size:11px; color:var(--color-secondary); font-style:italic;">
                      ${Object.entries(i.customization).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                    </div>
                  ` : ''}
                </div>
                <div style="font-size:13px; font-weight:700; color:var(--color-primary);">₹${i.price * i.qty}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Price Summary -->
        <div class="card" style="padding:14px; margin-bottom:12px;">
          <div class="order-summary-row">
            <span>Items Total</span>
            <span>₹${o.subtotal}</span>
          </div>
          <div class="order-summary-row" style="margin:4px 0;">
            <span>Delivery Charge</span>
            <span>₹${o.deliveryCharge}</span>
          </div>
          <div class="order-summary-row total-row">
            <span>Grand Total</span>
            <span>₹${o.grandTotal}</span>
          </div>
        </div>

        <!-- Current Status & EXACT Single-Action Progression -->
        <div class="card" style="padding:14px;">
          <div style="font-size:12px; color:var(--color-text-secondary); margin-bottom:6px;">Current Status</div>
          <div style="margin-bottom:14px;">
            <span class="status-chip ${AppUtils.getStatusChipClass(o.orderStatus)}" style="font-size:13px; padding:6px 14px;">
              ${o.orderStatus}
            </span>
          </div>
          ${this.renderSingleActionButton(o)}
        </div>
      </div>
    `;
  },

  renderSingleActionButton(order) {
    const s = order.orderStatus.toLowerCase();
    const isHome = order.deliveryMethod.includes('Home');

    if (s === 'new') {
      return `
        <button class="btn btn-primary btn-block" onclick="EntrepreneurModule.transitionOrderStatus('${order.id}', 'Accepted')">
          Accept Order
        </button>
      `;
    }
    if (s === 'accepted') {
      return `
        <button class="btn btn-primary btn-block" onclick="EntrepreneurModule.transitionOrderStatus('${order.id}', 'Preparing')">
          Preparing Order
        </button>
      `;
    }
    if (s === 'preparing') {
      if (isHome) {
        return `
          <button class="btn btn-primary btn-block" onclick="EntrepreneurModule.transitionOrderStatus('${order.id}', 'Out for Delivery')">
            Out for Delivery
            <span class="material-symbols-rounded">local_shipping</span>
          </button>
        `;
      } else {
        return `
          <button class="btn btn-primary btn-block" onclick="EntrepreneurModule.transitionOrderStatus('${order.id}', 'Ready for Pickup')">
            Ready for Pickup
            <span class="material-symbols-rounded">store</span>
          </button>
        `;
      }
    }
    if (s === 'out for delivery') {
      return `
        <button class="btn btn-primary btn-block" onclick="EntrepreneurModule.transitionOrderStatus('${order.id}', 'Delivered')">
          Mark as Delivered
          <span class="material-symbols-rounded">check_circle</span>
        </button>
      `;
    }
    if (s === 'ready for pickup') {
      return `
        <button class="btn btn-primary btn-block" onclick="EntrepreneurModule.transitionOrderStatus('${order.id}', 'Delivered')">
          Mark as Picked Up
          <span class="material-symbols-rounded">check_circle</span>
        </button>
      `;
    }
    if (s === 'delivered') {
      return `
        <div style="text-align:center; padding:10px 0; color:var(--color-success); font-weight:700; font-size:14px;">
          ✓ Order Completed
        </div>
      `;
    }
    return '';
  },

  transitionOrderStatus(orderId, nextStatus) {
    if (window.apiClient && window.apiClient.isOnline) {
      window.apiClient.updateOrderStatus(orderId, nextStatus).then(() => {
        AppUtils.showToast(`Order status updated to "${nextStatus}"`);
        AppRouter.renderActiveScreen();
      }).catch(() => {
        store.updateOrderStatus(orderId, nextStatus);
        AppUtils.showToast(`Order status updated to "${nextStatus}"`);
        AppRouter.renderActiveScreen();
      });
    } else {
      store.updateOrderStatus(orderId, nextStatus);
      AppUtils.showToast(`Order status updated to "${nextStatus}"`);
      AppRouter.renderActiveScreen();
    }
  },

  showAfterSalesRequests() {
    const ent = this.getEntrepreneur();
    const list = store.getOrders({ entrepreneurId: ent.id }).filter(o => o.refundRequest || o.replacementRequest);

    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin-bottom:12px;">
        🛡 After-Sales Requests (${list.length})
      </h3>
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${list.map(o => {
          const req = o.refundRequest || o.replacementRequest;
          const isRefund = !!o.refundRequest;
          return `
            <div class="card" style="padding:12px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="font-size:12px; font-weight:700;">${o.id} • ${o.customerName}</span>
                <span class="status-chip chip-warning">${isRefund ? 'Refund' : 'Replacement'} Req</span>
              </div>
              <p style="font-size:12px; color:var(--color-text-secondary); margin-bottom:6px;">
                Reason: "<strong>${req.reason}</strong>"<br>${req.description || ''}
              </p>
              <div class="ai-card" style="padding:8px 10px; margin:6px 0; font-size:11px;">
                <strong>🤖 AI Suggestion:</strong> ${req.aiSuggestion || 'Review photo evidence and decide.'}
              </div>
              <div style="display:flex; gap:8px; margin-top:8px;">
                <button class="btn btn-sm btn-primary" style="flex:1;" onclick="EntrepreneurModule.decideAfterSales('${o.id}', true)">Approve</button>
                <button class="btn btn-sm btn-danger-outline" style="flex:1;" onclick="EntrepreneurModule.decideAfterSales('${o.id}', false)">Reject</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `);
  },

  decideAfterSales(orderId, approved) {
    const o = store.getOrderById(orderId);
    if (!o) return;

    if (o.refundRequest) {
      o.refundRequest.status = approved ? 'Approved' : 'Rejected';
      if (approved && !o.refundRequest.returnRequired) {
        o.paymentStatus = 'Refund Completed';
      }
    }
    if (o.replacementRequest) {
      o.replacementRequest.status = approved ? 'Approved' : 'Rejected';
    }

    store.saveData();
    AppUtils.closeBottomSheet();
    AppUtils.showToast(`Request ${approved ? 'Approved' : 'Rejected'}. Customer notified.`);
    AppRouter.renderActiveScreen();
  },

  // -------------------------------------------------------------
  // EARNINGS SCREEN (TIME FILTER, BAR CHART & AI INSIGHTS)
  // -------------------------------------------------------------
  renderEarnings() {
    const ent = this.getEntrepreneur();
    const orders = store.getOrders({ entrepreneurId: ent.id, status: 'delivered' });
    const f = this.earningsTimeFilter;

    // Filter calculations
    const totalEarnings = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0) + (f === 'month' ? 18500 : f === 'week' ? 6200 : 900);
    const completedCount = orders.length + (f === 'month' ? 42 : f === 'week' ? 14 : 3);
    const avgOrderVal = Math.round(totalEarnings / (completedCount || 1));
    const aiInsights = AppAI.getBusinessInsights(orders, store.getProducts({ entrepreneurId: ent.id }));

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-ent-dashboard')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Earnings</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 6px; padding-bottom: 70px;">
        <!-- Time Filter Chips -->
        <div class="filter-chip-row">
          <button class="filter-chip ${f === 'today' ? 'active' : ''}" onclick="EntrepreneurModule.setEarningsFilter('today')">Today</button>
          <button class="filter-chip ${f === 'week' ? 'active' : ''}" onclick="EntrepreneurModule.setEarningsFilter('week')">This Week</button>
          <button class="filter-chip ${f === 'month' ? 'active' : ''}" onclick="EntrepreneurModule.setEarningsFilter('month')">This Month</button>
        </div>

        <!-- Total Earnings Card -->
        <div class="card" style="background:linear-gradient(135deg, #365B1F 0%, #4C7C2D 100%); color:#fff; padding:20px; text-align:center;">
          <span style="font-size:12px; color:var(--color-soft-yellow); font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">
            💰 Total Earnings (${f.toUpperCase()})
          </span>
          <div style="font-size:32px; font-weight:700; margin-top:4px;">
            ₹${totalEarnings.toLocaleString()}
          </div>
        </div>

        <!-- Single MD3 Bar Chart -->
        <div class="card" style="padding:14px; margin-bottom:14px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">
            📊 Earnings Trend
          </h4>
          <div class="simple-bar-chart">
            ${f === 'today' ? `
              <div class="chart-bar-col"><div class="chart-bar-fill" style="height:35%;"></div><span class="chart-bar-val">₹250</span><span class="chart-bar-label">10 AM</span></div>
              <div class="chart-bar-col"><div class="chart-bar-fill" style="height:70%;"></div><span class="chart-bar-val">₹480</span><span class="chart-bar-label">1 PM</span></div>
              <div class="chart-bar-col accent"><div class="chart-bar-fill" style="height:90%;"></div><span class="chart-bar-val">₹650</span><span class="chart-bar-label">5 PM</span></div>
              <div class="chart-bar-col"><div class="chart-bar-fill" style="height:40%;"></div><span class="chart-bar-val">₹300</span><span class="chart-bar-label">8 PM</span></div>
            ` : f === 'week' ? `
              <div class="chart-bar-col"><div class="chart-bar-fill" style="height:45%;"></div><span class="chart-bar-val">₹850</span><span class="chart-bar-label">Mon</span></div>
              <div class="chart-bar-col"><div class="chart-bar-fill" style="height:60%;"></div><span class="chart-bar-val">₹1.1k</span><span class="chart-bar-label">Tue</span></div>
              <div class="chart-bar-col"><div class="chart-bar-fill" style="height:50%;"></div><span class="chart-bar-val">₹950</span><span class="chart-bar-label">Wed</span></div>
              <div class="chart-bar-col"><div class="chart-bar-fill" style="height:75%;"></div><span class="chart-bar-val">₹1.4k</span><span class="chart-bar-label">Thu</span></div>
              <div class="chart-bar-col"><div class="chart-bar-fill" style="height:85%;"></div><span class="chart-bar-val">₹1.6k</span><span class="chart-bar-label">Fri</span></div>
              <div class="chart-bar-col accent"><div class="chart-bar-fill" style="height:100%;"></div><span class="chart-bar-val">₹2.1k</span><span class="chart-bar-label">Sat</span></div>
              <div class="chart-bar-col accent"><div class="chart-bar-fill" style="height:95%;"></div><span class="chart-bar-val">₹1.9k</span><span class="chart-bar-label">Sun</span></div>
            ` : `
              <div class="chart-bar-col"><div class="chart-bar-fill" style="height:60%;"></div><span class="chart-bar-val">₹6.2k</span><span class="chart-bar-label">W1</span></div>
              <div class="chart-bar-col"><div class="chart-bar-fill" style="height:75%;"></div><span class="chart-bar-val">₹7.8k</span><span class="chart-bar-label">W2</span></div>
              <div class="chart-bar-col accent"><div class="chart-bar-fill" style="height:95%;"></div><span class="chart-bar-val">₹9.5k</span><span class="chart-bar-label">W3</span></div>
              <div class="chart-bar-col"><div class="chart-bar-fill" style="height:55%;"></div><span class="chart-bar-val">₹5.8k</span><span class="chart-bar-label">W4</span></div>
            `}
          </div>
        </div>

        <!-- Business Summary Cards -->
        <div class="card" style="padding:14px; margin-bottom:14px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:10px;">
            📈 Business Summary
          </h4>
          <div style="display:flex; flex-direction:column; gap:8px; font-size:13px;">
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--color-text-secondary);">📦 Completed Orders:</span>
              <strong style="color:var(--color-text-primary);">${completedCount} Orders</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--color-text-secondary);">🏆 Best Selling Product:</span>
              <strong style="color:var(--color-primary);">Chocolate Cake</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--color-text-secondary);">⭐ Average Order Value:</span>
              <strong style="color:var(--color-text-primary);">₹${avgOrderVal}</strong>
            </div>
          </div>
        </div>

        <!-- AI Business Insights -->
        <div class="ai-card">
          <div class="ai-card-header">
            <span class="material-symbols-rounded">psychology</span>
            🤖 AI Business Insights
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; font-size:12px; color:var(--color-text-secondary); line-height:1.45;">
            ${aiInsights.map(ins => `<div>• ${ins}</div>`).join('')}
          </div>
        </div>
      </div>

      ${this.renderBottomNav('earnings')}
    `;
  },

  setEarningsFilter(f) {
    this.earningsTimeFilter = f;
    AppRouter.renderActiveScreen();
  },

  // -------------------------------------------------------------
  // ENTREPRENEUR PROFILE & SETTINGS
  // -------------------------------------------------------------
  renderProfile() {
    const ent = this.getEntrepreneur();
    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-ent-dashboard')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Entrepreneur Profile</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 70px;">
        <!-- Current Portal Mode Indicator -->
        <div style="background:#FFF9C4; border:1px solid #FFF176; border-radius:var(--radius-md); padding:8px 12px; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
          <span class="material-symbols-rounded" style="color:#F57F17; font-size:18px;">storefront</span>
          <span style="font-size:12px; font-weight:700; color:#E65100;">Current Mode: Entrepreneur Business Portal</span>
        </div>

        <!-- Profile Banner -->
        <div class="card" style="display:flex; align-items:center; gap:14px; padding:16px; margin-bottom:16px;">
          <div style="width:64px; height:64px; border-radius:50%; background:#E8F5E9; color:var(--color-primary); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <span class="material-symbols-rounded" style="font-size:38px;">account_circle</span>
          </div>
          <div>
            <h3 style="font-size:16px; font-weight:700; color:var(--color-text-primary);">${ent.name}</h3>
            <p style="font-size:13px; font-weight:600; color:var(--color-primary);">${ent.businessName}</p>
            <span style="font-size:11px; color:var(--color-text-secondary);">${ent.businessCategory}</span>
          </div>
        </div>

        <!-- Menu List -->
        <div class="card" style="padding:4px; display:flex; flex-direction:column;">
          <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; cursor:pointer;" onclick="AppRouter.navigate('screen-ent-availability')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-primary);">schedule</span>
              <span style="font-size:13px; font-weight:600;">🕒 Business Availability</span>
            </div>
            <span class="material-symbols-rounded" style="color:var(--color-text-tertiary);">chevron_right</span>
          </div>

          <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-top:1px solid #F0EEE4; cursor:pointer;" onclick="AppRouter.navigate('screen-ent-payment-settings')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-primary);">payments</span>
              <span style="font-size:13px; font-weight:600;">💳 Payment Settings</span>
            </div>
            <span class="material-symbols-rounded" style="color:var(--color-text-tertiary);">chevron_right</span>
          </div>

          <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-top:1px solid #F0EEE4; cursor:pointer;" onclick="AppRouter.navigate('screen-ent-offers')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-primary);">local_offer</span>
              <span style="font-size:13px; font-weight:600;">🏷️ Offers & Discounts</span>
            </div>
            <span class="material-symbols-rounded" style="color:var(--color-text-tertiary);">chevron_right</span>
          </div>

          <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-top:1px solid #F0EEE4; cursor:pointer;" onclick="AppRouter.navigate('screen-ent-advertisements')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-primary);">campaign</span>
              <span style="font-size:13px; font-weight:600;">📢 My Advertisements</span>
            </div>
            <span class="material-symbols-rounded" style="color:var(--color-text-tertiary);">chevron_right</span>
          </div>

          <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-top:1px solid #F0EEE4; cursor:pointer;" onclick="AppRouter.navigate('screen-ent-reviews')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-primary);">star</span>
              <span style="font-size:13px; font-weight:600;">⭐ Customer Reviews (${ent.reviewCount || 185})</span>
            </div>
            <span class="material-symbols-rounded" style="color:var(--color-text-tertiary);">chevron_right</span>
          </div>

          <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-top:1px solid #F0EEE4; cursor:pointer;" onclick="EntrepreneurModule.showNotificationPrefs()">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-primary);">notifications</span>
              <span style="font-size:13px; font-weight:600;">🔔 Notification Preferences</span>
            </div>
            <span class="material-symbols-rounded" style="color:var(--color-text-tertiary);">chevron_right</span>
          </div>

          <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-top:1px solid #F0EEE4; cursor:pointer;" onclick="EntrepreneurModule.showSecurityModal()">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-primary);">lock</span>
              <span style="font-size:13px; font-weight:600;">🔐 Security Settings</span>
            </div>
            <span class="material-symbols-rounded" style="color:var(--color-text-tertiary);">chevron_right</span>
          </div>

          <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-top:1px solid #F0EEE4; cursor:pointer;" onclick="EntrepreneurModule.showHelpModal()">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-primary);">help</span>
              <span style="font-size:13px; font-weight:600;">❓ Help & Support</span>
            </div>
            <span class="material-symbols-rounded" style="color:var(--color-text-tertiary);">chevron_right</span>
          </div>

          <!-- ROLE SWITCHING: Switch to Customer without logout -->
          <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:14px; border-top:1px solid #F0EEE4; cursor:pointer; background:#F5F9EE;" onclick="AppRouter.switchActiveRole('customer')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-primary); font-size:22px;">shopping_bag</span>
              <div>
                <div style="font-size:13px; font-weight:700; color:var(--color-primary);">Switch to Customer</div>
                <span style="font-size:11px; color:var(--color-text-secondary);">Return to shopping interface</span>
              </div>
            </div>
            <span class="material-symbols-rounded" style="color:var(--color-primary);">arrow_forward</span>
          </div>

          <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-top:1px solid #F0EEE4; cursor:pointer;" onclick="EntrepreneurModule.confirmLogout()">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-error);">logout</span>
              <span style="font-size:13px; font-weight:600; color:var(--color-error);">🚪 Logout</span>
            </div>
          </div>
        </div>
      </div>

      ${this.renderBottomNav('profile')}
    `;
  },

  // -------------------------------------------------------------
  // BUSINESS AVAILABILITY (OPEN / CLOSED / SCHEDULE)
  // -------------------------------------------------------------
  renderAvailability() {
    const ent = this.getEntrepreneur();
    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-ent-profile')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Business Availability</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 14px;">
        <h2 style="font-size: 19px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 6px;">
          Store Schedule & Controls
        </h2>
        <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 20px;">
          When closed, customers will see your reopening time and will not be able to checkout.
        </p>

        <!-- Current Open/Closed Toggle -->
        <div class="card" style="padding:16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h4 style="font-size:15px; font-weight:700; color:var(--color-text-primary);">Accept Customer Orders</h4>
            <span style="font-size:12px; color:var(--color-text-secondary);">Currently: <strong>${ent.isStoreOpen ? '🟢 OPEN' : '🔴 CLOSED'}</strong></span>
          </div>
          <input type="checkbox" id="avail-toggle-chk" ${ent.isStoreOpen ? 'checked' : ''} style="accent-color:var(--color-primary); width:24px; height:24px;">
        </div>

        <div class="form-group">
          <label class="form-label">Weekly Schedule / Opening Time</label>
          <input type="text" id="avail-schedule-input" class="form-input" placeholder="e.g. Opens Daily at 9:00 AM" value="${ent.openingSchedule || 'Opens Daily at 9:00 AM'}">
        </div>

        <button class="btn btn-primary btn-block" onclick="EntrepreneurModule.saveAvailability()">
          Save Availability Settings
        </button>
      </div>
    `;
  },

  saveAvailability() {
    const ent = this.getEntrepreneur();
    const isOpen = document.getElementById('avail-toggle-chk').checked;
    const schedule = document.getElementById('avail-schedule-input').value.trim();

    store.updateEntrepreneur(ent.id, {
      isStoreOpen: isOpen,
      openingSchedule: schedule
    });

    if (window.apiClient && window.apiClient.isOnline) {
      window.apiClient.updateAvailability(ent.id, isOpen, schedule);
    }

    AppUtils.showToast(`Store status updated: ${isOpen ? 'Open' : 'Closed'}`);
    AppRouter.navigate('screen-ent-profile');
  },

  // -------------------------------------------------------------
  // CUSTOMER REVIEWS (READ ONLY WITH AI SENTIMENT SUMMARY)
  // -------------------------------------------------------------
  renderReviews() {
    const ent = this.getEntrepreneur();
    const reviews = store.getReviewsForEntrepreneur(ent.id);
    const summary = AppAI.getReviewSummary(reviews);

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-ent-profile')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Customer Reviews</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 70px;">
        <!-- Rating Header -->
        <div class="card" style="text-align:center; padding:18px; margin-bottom:14px;">
          <div style="font-size:28px; font-weight:700; color:var(--color-primary);">
            ⭐ ${ent.rating || 4.8}
          </div>
          <div style="font-size:13px; color:var(--color-text-secondary); margin-top:2px;">
            Based on ${reviews.length + (ent.reviewCount || 185)} Verified Customer Reviews
          </div>
        </div>

        <!-- AI Review Summary -->
        <div class="ai-card" style="margin-bottom:16px;">
          <div class="ai-card-header">
            <span class="material-symbols-rounded">insights</span>
            🤖 AI Review Summary
          </div>
          <div style="font-size:12px; color:var(--color-text-secondary); display:flex; flex-direction:column; gap:6px;">
            <div><strong>😊 Overall Sentiment:</strong> <span class="status-chip chip-delivered" style="font-size:11px; padding:2px 8px;">${summary.sentiment}</span></div>
            <div><strong>Customers Love:</strong> ${summary.customersLove.join(', ')}</div>
            <div><strong>Customers Suggest:</strong> ${summary.customersSuggest.join(', ')}</div>
          </div>
        </div>

        <!-- Reviews List (Read-only for entrepreneur) -->
        <h4 style="font-size:14px; font-weight:700; color:var(--color-text-primary); margin-bottom:10px;">
          Recent Reviews
        </h4>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${reviews.map(r => `
            <div class="card" style="padding:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="font-size:13px; font-weight:700; color:var(--color-text-primary);">${r.customerName}</span>
                <span style="font-size:12px; color:var(--color-text-accent); font-weight:700;">⭐ ${r.rating}</span>
              </div>
              <p style="font-size:12px; color:var(--color-text-secondary); line-height:1.4; margin-bottom:6px;">
                "${r.comment}"
              </p>
              <div style="font-size:10px; color:var(--color-text-tertiary);">${r.date} • Verified Buyer</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // PAYMENT SETTINGS
  // -------------------------------------------------------------
  renderPaymentSettings() {
    const ent = this.getEntrepreneur();
    const p = ent.paymentSettings || {};

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-ent-profile')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Payment Settings</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 14px;">
        <h2 style="font-size: 19px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 6px;">
          Settlement Bank Account
        </h2>
        <p style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 18px;">
          Customer payouts and online order settlements are deposited into this account.
        </p>

        <div class="form-group">
          <label class="form-label">Account Holder Name <span class="req">*</span></label>
          <input type="text" id="pay-holder" class="form-input" value="${p.accountHolder || ent.name}">
        </div>

        <div class="form-group">
          <label class="form-label">Bank Name <span class="req">*</span></label>
          <input type="text" id="pay-bank" class="form-input" value="${p.bankName || 'State Bank of India'}">
        </div>

        <div class="form-group">
          <label class="form-label">Bank Account Number <span class="req">*</span></label>
          <input type="text" id="pay-acc" class="form-input" value="${p.accountNumber || '38192847192'}">
        </div>

        <div class="form-group">
          <label class="form-label">IFSC Code <span class="req">*</span></label>
          <input type="text" id="pay-ifsc" class="form-input" value="${p.ifsc || 'SBIN0004128'}">
        </div>

        <div class="form-group">
          <label class="form-label">UPI ID (VPA) <span class="req">*</span></label>
          <input type="text" id="pay-upi" class="form-input" value="${p.upiId || 'anithabakery@okaxis'}">
        </div>

        <button class="btn btn-primary btn-block" onclick="EntrepreneurModule.savePaymentSettings()">
          Save Payment Details
        </button>
      </div>
    `;
  },

  savePaymentSettings() {
    const ent = this.getEntrepreneur();
    store.updateEntrepreneur(ent.id, {
      paymentSettings: {
        accountHolder: document.getElementById('pay-holder').value.trim(),
        bankName: document.getElementById('pay-bank').value.trim(),
        accountNumber: document.getElementById('pay-acc').value.trim(),
        ifsc: document.getElementById('pay-ifsc').value.trim(),
        upiId: document.getElementById('pay-upi').value.trim()
      }
    });
    AppUtils.showToast('Payment settings saved successfully.');
    AppRouter.navigate('screen-ent-profile');
  },

  showNotificationPrefs() {
    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin-bottom:12px;">🔔 Notification Preferences</h3>
      <div style="display:flex; flex-direction:column; gap:10px;">
        <label style="display:flex; align-items:center; gap:8px; font-size:13px;">
          <input type="checkbox" checked style="accent-color:var(--color-primary);"> New Order Updates
        </label>
        <label style="display:flex; align-items:center; gap:8px; font-size:13px;">
          <input type="checkbox" checked style="accent-color:var(--color-primary);"> Customer Reviews
        </label>
        <label style="display:flex; align-items:center; gap:8px; font-size:13px;">
          <input type="checkbox" checked style="accent-color:var(--color-primary);"> Account & Admin Notifications
        </label>
      </div>
      <button class="btn btn-primary btn-block" onclick="AppUtils.closeBottomSheet(); AppUtils.showToast('Preferences saved');" style="margin-top:16px;">
        Save Preferences
      </button>
    `);
  },

  showSecurityModal() {
    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin-bottom:12px;">🔐 Security Settings</h3>
      <div class="form-group">
        <label class="form-label">Current Password</label>
        <input type="password" class="form-input" value="password123">
      </div>
      <div class="form-group">
        <label class="form-label">New Password</label>
        <input type="password" class="form-input" placeholder="Min 6 characters">
      </div>
      <button class="btn btn-primary btn-block" onclick="AppUtils.closeBottomSheet(); AppUtils.showToast('Password updated');" style="margin-top:12px;">
        Save Changes
      </button>
    `);
  },

  showHelpModal() {
    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin-bottom:10px;">❓ Entrepreneur Help & Support</h3>
      <div style="font-size:13px; color:var(--color-text-secondary); line-height:1.5;">
        <p><strong>Admin Contact:</strong> support@maneyinda.com</p>
        <p style="margin-top:6px;"><strong>Hyperlocal Rules:</strong> Maintain fresh food quality, pack with care, and keep stock counts updated.</p>
      </div>
      <button class="btn btn-primary btn-block" onclick="AppUtils.closeBottomSheet()" style="margin-top:16px;">Close</button>
    `);
  },

  confirmLogout() {
    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-text-primary); margin-bottom:8px;">Are you sure you want to logout?</h3>
      <p style="font-size:13px; color:var(--color-text-secondary); margin-bottom:16px;">Your business data and listings will remain active for customers.</p>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline" style="flex:1;" onclick="AppUtils.closeBottomSheet()">Cancel</button>
        <button class="btn btn-danger" style="flex:1;" onclick="AppUtils.closeBottomSheet(); store.setRole('customer'); AppRouter.navigate('screen-welcome');">Logout</button>
      </div>
    `);
  },

  renderBottomNav(activeItem) {
    return `
      <div class="bottom-nav-bar">
        <button class="nav-item-btn ${activeItem === 'home' ? 'active' : ''}" onclick="AppRouter.navigate('screen-ent-dashboard')">
          <div class="nav-icon-wrapper">
            <span class="material-symbols-rounded ${activeItem === 'home' ? 'icon-filled' : 'icon-outlined'}">home</span>
          </div>
          <span class="nav-label">Home</span>
        </button>

        <button class="nav-item-btn ${activeItem === 'orders' ? 'active' : ''}" onclick="AppRouter.navigate('screen-ent-orders')">
          <div class="nav-icon-wrapper">
            <span class="material-symbols-rounded ${activeItem === 'orders' ? 'icon-filled' : 'icon-outlined'}">inventory_2</span>
          </div>
          <span class="nav-label">Orders</span>
        </button>

        <button class="nav-item-btn ${activeItem === 'products' ? 'active' : ''}" onclick="AppRouter.navigate('screen-ent-products')">
          <div class="nav-icon-wrapper">
            <span class="material-symbols-rounded ${activeItem === 'products' ? 'icon-filled' : 'icon-outlined'}">storefront</span>
          </div>
          <span class="nav-label">Products</span>
        </button>

        <button class="nav-item-btn ${activeItem === 'earnings' ? 'active' : ''}" onclick="AppRouter.navigate('screen-ent-earnings')">
          <div class="nav-icon-wrapper">
            <span class="material-symbols-rounded ${activeItem === 'earnings' ? 'icon-filled' : 'icon-outlined'}">payments</span>
          </div>
          <span class="nav-label">Earnings</span>
        </button>

        <button class="nav-item-btn ${activeItem === 'profile' ? 'active' : ''}" onclick="AppRouter.navigate('screen-ent-profile')">
          <div class="nav-icon-wrapper">
            <span class="material-symbols-rounded ${activeItem === 'profile' ? 'icon-filled' : 'icon-outlined'}">person</span>
          </div>
          <span class="nav-label">Profile</span>
        </button>
      </div>
    `;
  },

  // -------------------------------------------------------------------
  // SCREEN: ENTREPRENEUR OFFERS & DISCOUNTS MANAGEMENT
  // -------------------------------------------------------------------
  renderOffers(params = {}) {
    const ent = this.getEntrepreneur();
    const allOffers = ((store.data && store.data.offers) || []).filter(o => o.entrepreneurId === ent.id);
    const now = new Date();

    // KPI Metrics Calculation
    const activeOffers = allOffers.filter(o => 
      o.active && 
      (!o.endDate || new Date(o.endDate) >= now) && 
      (!o.startDate || new Date(o.startDate) <= now) &&
      o.moderationStatus !== 'deactivated'
    );
    const scheduledOffers = allOffers.filter(o => o.startDate && new Date(o.startDate) > now);
    const expiredOffers = allOffers.filter(o => o.endDate && new Date(o.endDate) < now);
    const inactiveOffers = allOffers.filter(o => !o.active || o.moderationStatus === 'deactivated');

    const totalRedemptions = allOffers.reduce((sum, o) => sum + (o.usageCount || 0), 0);
    const totalOrdersCount = allOffers.reduce((sum, o) => sum + (o.ordersCount || 0), 0);
    const totalSavings = allOffers.reduce((sum, o) => sum + (o.totalSavedAmount || 0), 0);

    // Active Tab Filtering
    const activeFilter = this.offerFilter || 'all';
    let filteredOffers = allOffers;
    if (activeFilter === 'active') filteredOffers = activeOffers;
    else if (activeFilter === 'scheduled') filteredOffers = scheduledOffers;
    else if (activeFilter === 'expired') filteredOffers = expiredOffers;
    else if (activeFilter === 'inactive') filteredOffers = inactiveOffers;

    return `
      <!-- Top App Bar -->
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-ent-dashboard')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Offers & Discounts</span>
        </div>
        <div class="top-app-bar-actions">
          <button class="btn btn-sm btn-primary" onclick="EntrepreneurModule.openCreateOfferModal()" style="display:flex; align-items:center; gap:4px; font-weight:700;">
            <span class="material-symbols-rounded" style="font-size:16px;">add</span>
            <span>New Offer</span>
          </button>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 12px; padding-bottom: 80px;">
        <!-- Shop Identity Bar -->
        <div style="background:#FFFDE7; border:1px solid #FFF59D; border-radius:var(--radius-md); padding:10px 14px; margin-bottom:14px; display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="material-symbols-rounded" style="color:var(--color-primary); font-size:20px;">store</span>
            <div>
              <div style="font-size:13px; font-weight:700; color:var(--color-text-primary);">${ent.businessName}</div>
              <div style="font-size:11px; color:var(--color-text-secondary);">Manage shop-level discounts & promotional coupons</div>
            </div>
          </div>
          <span class="chip-badge" style="background:#E8F5E9; color:var(--color-primary); font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full);">
            Verified Shop
          </span>
        </div>

        <!-- 4 Offer Performance Summary Cards -->
        <div class="stat-card-grid" style="grid-template-columns: repeat(2, 1fr); gap:10px; margin-bottom:16px;">
          <div class="stat-card" style="padding:12px;">
            <div class="stat-icon-wrap" style="background:#E8F5E9; color:var(--color-primary);">
              <span class="material-symbols-rounded">local_offer</span>
            </div>
            <div class="stat-value" style="font-size:18px;">${activeOffers.length}</div>
            <div class="stat-label">Active Promotions</div>
          </div>

          <div class="stat-card" style="padding:12px;">
            <div class="stat-icon-wrap" style="background:#FFF3E0; color:var(--color-warning);">
              <span class="material-symbols-rounded">receipt_long</span>
            </div>
            <div class="stat-value" style="font-size:18px;">${totalRedemptions}</div>
            <div class="stat-label">Total Redemptions</div>
          </div>

          <div class="stat-card" style="padding:12px;">
            <div class="stat-icon-wrap" style="background:#E1F5FE; color:var(--color-info);">
              <span class="material-symbols-rounded">shopping_bag</span>
            </div>
            <div class="stat-value" style="font-size:18px;">${totalOrdersCount}</div>
            <div class="stat-label">Orders Generated</div>
          </div>

          <div class="stat-card" style="padding:12px;">
            <div class="stat-icon-wrap" style="background:#F3E5F5; color:#7B1FA2;">
              <span class="material-symbols-rounded">savings</span>
            </div>
            <div class="stat-value" style="font-size:18px;">₹${totalSavings.toLocaleString()}</div>
            <div class="stat-label">Customer Savings</div>
          </div>
        </div>

        <!-- Status Filter Tabs -->
        <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:8px; margin-bottom:14px; -webkit-overflow-scrolling:touch;">
          <button class="chip-filter ${activeFilter === 'all' ? 'active' : ''}" onclick="EntrepreneurModule.setOfferFilter('all')" style="padding:6px 12px; font-size:12px; font-weight:600; border-radius:var(--radius-full); cursor:pointer; white-space:nowrap; border:1px solid ${activeFilter === 'all' ? 'var(--color-primary)' : 'var(--color-border)'}; background:${activeFilter === 'all' ? 'var(--color-primary)' : '#FFF'}; color:${activeFilter === 'all' ? '#FFF' : 'var(--color-text-primary)'};">
            All (${allOffers.length})
          </button>
          <button class="chip-filter ${activeFilter === 'active' ? 'active' : ''}" onclick="EntrepreneurModule.setOfferFilter('active')" style="padding:6px 12px; font-size:12px; font-weight:600; border-radius:var(--radius-full); cursor:pointer; white-space:nowrap; border:1px solid ${activeFilter === 'active' ? 'var(--color-primary)' : 'var(--color-border)'}; background:${activeFilter === 'active' ? 'var(--color-primary)' : '#FFF'}; color:${activeFilter === 'active' ? '#FFF' : 'var(--color-text-primary)'};">
            Active (${activeOffers.length})
          </button>
          <button class="chip-filter ${activeFilter === 'scheduled' ? 'active' : ''}" onclick="EntrepreneurModule.setOfferFilter('scheduled')" style="padding:6px 12px; font-size:12px; font-weight:600; border-radius:var(--radius-full); cursor:pointer; white-space:nowrap; border:1px solid ${activeFilter === 'scheduled' ? 'var(--color-primary)' : 'var(--color-border)'}; background:${activeFilter === 'scheduled' ? 'var(--color-primary)' : '#FFF'}; color:${activeFilter === 'scheduled' ? '#FFF' : 'var(--color-text-primary)'};">
            Scheduled (${scheduledOffers.length})
          </button>
          <button class="chip-filter ${activeFilter === 'expired' ? 'active' : ''}" onclick="EntrepreneurModule.setOfferFilter('expired')" style="padding:6px 12px; font-size:12px; font-weight:600; border-radius:var(--radius-full); cursor:pointer; white-space:nowrap; border:1px solid ${activeFilter === 'expired' ? 'var(--color-primary)' : 'var(--color-border)'}; background:${activeFilter === 'expired' ? 'var(--color-primary)' : '#FFF'}; color:${activeFilter === 'expired' ? '#FFF' : 'var(--color-text-primary)'};">
            Expired (${expiredOffers.length})
          </button>
          <button class="chip-filter ${activeFilter === 'inactive' ? 'active' : ''}" onclick="EntrepreneurModule.setOfferFilter('inactive')" style="padding:6px 12px; font-size:12px; font-weight:600; border-radius:var(--radius-full); cursor:pointer; white-space:nowrap; border:1px solid ${activeFilter === 'inactive' ? 'var(--color-primary)' : 'var(--color-border)'}; background:${activeFilter === 'inactive' ? 'var(--color-primary)' : '#FFF'}; color:${activeFilter === 'inactive' ? '#FFF' : 'var(--color-text-primary)'};">
            Inactive (${inactiveOffers.length})
          </button>
        </div>

        <!-- Offers Cards List -->
        ${filteredOffers.length === 0 ? `
          <div class="empty-state" style="padding:40px 16px; text-align:center;">
            <div style="width:64px; height:64px; border-radius:50%; background:#F1F8E9; color:var(--color-primary); display:flex; align-items:center; justify-content:center; margin:0 auto 12px auto;">
              <span class="material-symbols-rounded" style="font-size:32px;">local_offer</span>
            </div>
            <h4 style="font-size:15px; font-weight:700; color:var(--color-text-primary); margin-bottom:4px;">No Offers Found</h4>
            <p style="font-size:12px; color:var(--color-text-secondary); max-width:280px; margin:0 auto 16px auto;">
              ${activeFilter === 'all' 
                ? 'Attract more local buyers by launching festive discounts or shop coupons!' 
                : `No offers currently under the "${activeFilter}" tab.`}
            </p>
            <button class="btn btn-primary btn-sm" onclick="EntrepreneurModule.openCreateOfferModal()" style="display:inline-flex; align-items:center; gap:6px;">
              <span class="material-symbols-rounded" style="font-size:16px;">add_circle</span>
              <span>Create Your First Offer</span>
            </button>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${filteredOffers.map(o => {
              const isDeactivated = o.moderationStatus === 'deactivated';
              const isFlagged = o.moderationStatus === 'flagged';
              const isCurrentlyActive = o.active && !isDeactivated && (!o.endDate || new Date(o.endDate) >= now) && (!o.startDate || new Date(o.startDate) <= now);

              return `
                <div class="card" style="padding:14px; border:1px solid var(--color-border); border-radius:var(--radius-md); background:#FFF; position:relative; overflow:hidden;">
                  <!-- Top Row: Title, Code & Moderation Pill -->
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; gap:8px;">
                    <div>
                      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                        <h4 style="font-size:14px; font-weight:700; color:var(--color-text-primary); margin:0;">
                          ${o.title}
                        </h4>
                        ${o.code ? `
                          <span style="display:inline-flex; align-items:center; gap:4px; background:#F5F9EE; border:1px dashed var(--color-primary); color:var(--color-primary); font-family:monospace; font-weight:700; font-size:11px; padding:2px 8px; border-radius:var(--radius-full); cursor:pointer;" onclick="EntrepreneurModule.copyCouponCode('${o.code}')" title="Click to copy code">
                            <span>${o.code}</span>
                            <span class="material-symbols-rounded" style="font-size:12px;">content_copy</span>
                          </span>
                        ` : ''}
                      </div>
                      ${o.description ? `<p style="font-size:11px; color:var(--color-text-secondary); margin:4px 0 0 0;">${o.description}</p>` : ''}
                    </div>

                    <!-- Status Pill -->
                    <div>
                      ${isDeactivated ? `
                        <span style="background:#FFEBEE; color:#C62828; font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:3px;">
                          <span class="material-symbols-rounded" style="font-size:12px;">block</span>
                          Deactivated
                        </span>
                      ` : isFlagged ? `
                        <span style="background:#FFF8E1; color:#F57F17; font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:3px;">
                          <span class="material-symbols-rounded" style="font-size:12px;">flag</span>
                          Under Review
                        </span>
                      ` : isCurrentlyActive ? `
                        <span style="background:#E8F5E9; color:#2E7D32; font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:3px;">
                          <span class="material-symbols-rounded" style="font-size:12px;">check_circle</span>
                          Active
                        </span>
                      ` : `
                        <span style="background:#ECEFF1; color:#546E7A; font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full);">
                          Paused
                        </span>
                      `}
                    </div>
                  </div>

                  <!-- Details Badges Row -->
                  <div style="display:flex; flex-wrap:wrap; gap:6px; margin:8px 0; font-size:11px;">
                    <span style="background:#F5F9EE; color:var(--color-primary); font-weight:700; padding:3px 8px; border-radius:var(--radius-sm);">
                      🏷️ ${o.badgeText || (o.discountType === 'percentage' ? `${o.discountValue}% OFF` : `₹${o.discountValue} OFF`)}
                      ${o.maxDiscount ? ` (Cap: ₹${o.maxDiscount})` : ''}
                    </span>

                    <span style="background:#FAFAFA; color:var(--color-text-secondary); border:1px solid #EEEEEE; padding:3px 8px; border-radius:var(--radius-sm);">
                      ${o.scope === 'product' ? `📦 ${(o.productIds && o.productIds.length) || 1} Selected Products` : '🏪 All Shop Products'}
                    </span>

                    ${o.minOrderAmount ? `
                      <span style="background:#FAFAFA; color:var(--color-text-secondary); border:1px solid #EEEEEE; padding:3px 8px; border-radius:var(--radius-sm);">
                        Min Order: ₹${o.minOrderAmount}
                      </span>
                    ` : ''}

                    ${o.endDate ? `
                      <span style="background:#FAFAFA; color:var(--color-text-secondary); border:1px solid #EEEEEE; padding:3px 8px; border-radius:var(--radius-sm);">
                        📅 Valid till ${new Date(o.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    ` : `
                      <span style="background:#FAFAFA; color:var(--color-text-secondary); border:1px solid #EEEEEE; padding:3px 8px; border-radius:var(--radius-sm);">
                        📅 Ongoing
                      </span>
                    `}
                  </div>

                  <!-- Performance Metrics Bar -->
                  <div style="background:#F9F8F3; border-radius:var(--radius-sm); padding:8px 10px; margin:8px 0; display:flex; justify-content:space-between; align-items:center; font-size:11px;">
                    <div>
                      <span style="color:var(--color-text-secondary);">Used:</span> 
                      <strong style="color:var(--color-text-primary);">${o.usageCount || 0}</strong>
                      ${o.usageLimit ? `<span style="color:var(--color-text-tertiary);"> / ${o.usageLimit}</span>` : ''}
                    </div>
                    <div>
                      <span style="color:var(--color-text-secondary);">Orders:</span> 
                      <strong style="color:var(--color-text-primary);">${o.ordersCount || 0}</strong>
                    </div>
                    <div>
                      <span style="color:var(--color-text-secondary);">Customer Savings:</span> 
                      <strong style="color:var(--color-primary);">₹${o.totalSavedAmount || 0}</strong>
                    </div>
                  </div>

                  <!-- Action Buttons Row -->
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; padding-top:8px; border-top:1px solid #F0EEE4;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <button class="btn btn-sm btn-text" onclick="EntrepreneurModule.previewOfferInModal('${o.id}')" style="display:flex; align-items:center; gap:4px; font-size:11px; padding:4px 8px;">
                        <span class="material-symbols-rounded" style="font-size:14px;">visibility</span>
                        Preview
                      </button>

                      <button class="btn btn-sm btn-text" onclick="EntrepreneurModule.openEditOfferModal('${o.id}')" style="display:flex; align-items:center; gap:4px; font-size:11px; padding:4px 8px;">
                        <span class="material-symbols-rounded" style="font-size:14px;">edit</span>
                        Edit
                      </button>

                      <button class="btn btn-sm btn-text" onclick="EntrepreneurModule.confirmDeleteOffer('${o.id}')" style="display:flex; align-items:center; gap:4px; font-size:11px; padding:4px 8px; color:var(--color-error);">
                        <span class="material-symbols-rounded" style="font-size:14px;">delete</span>
                        Delete
                      </button>
                    </div>

                    <div>
                      ${!isDeactivated ? `
                        <button class="btn btn-sm ${o.active ? 'btn-outline' : 'btn-primary'}" onclick="EntrepreneurModule.toggleOffer('${o.id}')" style="font-size:11px; padding:4px 10px;">
                          ${o.active ? 'Pause Offer' : 'Activate Offer'}
                        </button>
                      ` : `
                        <span style="font-size:10px; color:#C62828;">Contact Admin to Re-enable</span>
                      `}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      ${this.renderBottomNav('profile')}
    `;
  },

  setOfferFilter(filter) {
    this.offerFilter = filter;
    AppRouter.navigate('screen-ent-offers');
  },

  copyCouponCode(code) {
    if (!code) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    AppUtils.showToast(`Coupon code "${code}" copied to clipboard!`);
  },

  // -------------------------------------------------------------------
  // OFFER CREATION & EDIT MODAL WITH LIVE REAL-TIME PREVIEW
  // -------------------------------------------------------------------
  openCreateOfferModal() {
    this.editingOfferId = null;
    this.showOfferFormModal();
  },

  openEditOfferModal(offerId) {
    this.editingOfferId = offerId;
    this.showOfferFormModal(offerId);
  },

  showOfferFormModal(offerId = null) {
    const ent = this.getEntrepreneur();
    const existing = offerId ? ((store.data && store.data.offers) || []).find(o => o.id === offerId) : null;
    const myProducts = store.getProducts({ entrepreneurId: ent.id });

    const title = existing ? existing.title : '';
    const description = existing ? (existing.description || '') : '';
    const discountType = existing ? existing.discountType : 'percentage';
    const discountValue = existing ? existing.discountValue : 15;
    const maxDiscount = existing && existing.maxDiscount ? existing.maxDiscount : '';
    const minOrderAmount = existing && existing.minOrderAmount ? existing.minOrderAmount : '';
    const scope = existing ? existing.scope : 'shop';
    const selectedProductIds = existing && existing.productIds ? existing.productIds : (existing && existing.targetProductId ? [existing.targetProductId] : []);
    const code = existing ? (existing.code || '') : '';
    const startDate = existing && existing.startDate ? existing.startDate.substring(0, 10) : new Date().toISOString().substring(0, 10);
    const endDate = existing && existing.endDate ? existing.endDate.substring(0, 10) : '';
    const usageLimit = existing && existing.usageLimit ? existing.usageLimit : '';

    const contentHtml = `
      <div style="max-height:82vh; overflow-y:auto; padding-right:4px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #F0EEE4; padding-bottom:8px;">
          <div>
            <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin:0;">
              ${existing ? '✏️ Edit Promotional Offer' : '🏷️ Create New Shop Offer'}
            </h3>
            <span style="font-size:11px; color:var(--color-text-secondary);">${ent.businessName}</span>
          </div>
          <button class="icon-action-btn" onclick="AppUtils.closeBottomSheet()">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <!-- LIVE PREVIEW ACCORDION / CONTAINER -->
        <div style="background:#F9F8F3; border:1px solid #E6E1D3; border-radius:var(--radius-md); padding:12px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:11px; font-weight:700; color:var(--color-primary); text-transform:uppercase; letter-spacing:0.5px; display:flex; align-items:center; gap:4px;">
              <span class="material-symbols-rounded" style="font-size:14px;">visibility</span>
              Live Customer Preview
            </span>
            <span style="font-size:10px; color:var(--color-text-secondary);">Updates live as you type</span>
          </div>

          <!-- Customer Home Banner Preview -->
          <div style="font-size:10px; font-weight:600; color:var(--color-text-secondary); margin-bottom:4px;">Home Banner View:</div>
          <div id="offer-preview-banner" style="background:linear-gradient(135deg, #4A6B32 0%, #2E451E 100%); border-radius:var(--radius-md); padding:12px; color:#FFF; margin-bottom:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span id="preview-badge-pill" style="background:rgba(255,255,255,0.2); font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full);">
                ${discountType === 'percentage' ? `${discountValue}% OFF` : `₹${discountValue} OFF`}
              </span>
              <span style="font-size:10px; font-weight:600; color:#F4EBD9; background:rgba(0,0,0,0.25); padding:2px 8px; border-radius:var(--radius-full);">
                🏪 ${ent.businessName}
              </span>
              <span id="preview-code-pill" style="font-family:monospace; background:#FFF; color:#2E451E; font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full);">
                ${code || 'SPECIAL DEAL'}
              </span>
            </div>
            <div id="preview-title" style="font-size:13px; font-weight:700; margin-top:4px;">
              ${title || 'Your Promotional Offer Title'}
            </div>
            <div id="preview-desc" style="font-size:11px; opacity:0.9; color:#F4EBD9; margin-top:2px;">
              ${description || 'Promotional description of your festive offer'}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:10px;">
              <span id="preview-conditions" style="opacity:0.85; color:#F4EBD9;">
                ${minOrderAmount ? `Min order ₹${minOrderAmount}` : 'No minimum order required'}
              </span>
              <button class="btn btn-sm" style="background:#FFF; color:#2E451E; font-weight:700; border:none; padding:4px 10px; border-radius:var(--radius-full); font-size:10px;" onclick="event.preventDefault()">
                Shop Now >
              </button>
            </div>
          </div>

          <!-- Product Card Preview -->
          <div style="font-size:10px; font-weight:600; color:var(--color-text-secondary); margin-bottom:4px;">Product Card View:</div>
          <div style="background:#FFF; border:1px solid #E6E1D3; border-radius:var(--radius-md); padding:10px; display:flex; align-items:center; gap:12px;">
            <div style="width:50px; height:50px; border-radius:var(--radius-sm); background:#E8F5E9; display:flex; align-items:center; justify-content:center; color:var(--color-primary); flex-shrink:0;">
              <span class="material-symbols-rounded" style="font-size:26px;">local_mall</span>
            </div>
            <div style="flex:1;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span id="preview-card-badge" style="background:#E8F5E9; color:var(--color-primary); font-size:10px; font-weight:700; padding:2px 6px; border-radius:var(--radius-sm);">
                  ${discountType === 'percentage' ? `${discountValue}% OFF` : `₹${discountValue} OFF`}
                </span>
                <span style="font-size:12px; font-weight:600; color:var(--color-text-primary);">Sample Shop Product</span>
              </div>
              <div style="display:flex; align-items:baseline; gap:6px; margin-top:3px;">
                <span id="preview-card-discounted" style="font-size:14px; font-weight:700; color:var(--color-primary);">₹382</span>
                <span id="preview-card-original" style="font-size:11px; text-decoration:line-through; color:var(--color-text-tertiary);">₹450</span>
                <span id="preview-card-savings" style="font-size:10px; color:#2E7D32; font-weight:600;">Save ₹68</span>
              </div>
            </div>
          </div>
        </div>

        <!-- FORM FIELDS -->
        <form id="entrepreneur-offer-form" onsubmit="EntrepreneurModule.saveOffer(event)">
          <!-- 1. Offer Title -->
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label" style="font-size:12px; font-weight:700;">Offer Title *</label>
            <input type="text" id="offer-title" class="form-input" required 
                   placeholder="e.g., Grand Diwali Sweets Discount" 
                   value="${title}" 
                   oninput="EntrepreneurModule.updateOfferPreview()">
          </div>

          <!-- 2. Promotional Description -->
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label" style="font-size:12px; font-weight:700;">Promotional Description</label>
            <textarea id="offer-description" class="form-input" rows="2" 
                      placeholder="e.g., Get 15% off traditional handcrafted festive sweets freshly prepared this week." 
                      oninput="EntrepreneurModule.updateOfferPreview()">${description}</textarea>
          </div>

          <!-- 3. Discount Type & Value Row -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px;">
            <div class="form-group">
              <label class="form-label" style="font-size:12px; font-weight:700;">Discount Type *</label>
              <select id="offer-discount-type" class="form-input" onchange="EntrepreneurModule.updateOfferPreview()">
                <option value="percentage" ${discountType === 'percentage' ? 'selected' : ''}>Percentage (%)</option>
                <option value="fixed" ${discountType === 'fixed' || discountType === 'flat' ? 'selected' : ''}>Fixed Amount (₹)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-size:12px; font-weight:700;">Discount Value *</label>
              <input type="number" id="offer-discount-value" class="form-input" required min="1" max="10000"
                     value="${discountValue}" 
                     oninput="EntrepreneurModule.updateOfferPreview()">
            </div>
          </div>

          <!-- 4. Max Discount & Minimum Order -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px;">
            <div class="form-group" id="max-discount-container">
              <label class="form-label" style="font-size:12px; font-weight:700;">Max Discount Cap (₹)</label>
              <input type="number" id="offer-max-discount" class="form-input" min="0"
                     placeholder="e.g., 150 (Optional)" 
                     value="${maxDiscount}" 
                     oninput="EntrepreneurModule.updateOfferPreview()">
            </div>

            <div class="form-group">
              <label class="form-label" style="font-size:12px; font-weight:700;">Min Order Subtotal (₹)</label>
              <input type="number" id="offer-min-order" class="form-input" min="0"
                     placeholder="e.g., 299 (Optional)" 
                     value="${minOrderAmount}" 
                     oninput="EntrepreneurModule.updateOfferPreview()">
            </div>
          </div>

          <!-- 5. Scope: All Shop Products vs Selected Products -->
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label" style="font-size:12px; font-weight:700;">Applicable Products *</label>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
                <input type="radio" name="offer-scope" value="shop" ${scope !== 'product' ? 'checked' : ''} 
                       onchange="document.getElementById('product-checklist-container').style.display='none'; EntrepreneurModule.updateOfferPreview();">
                <span>Apply to <strong>All Eligible Products</strong> in my shop (${myProducts.length} items)</span>
              </label>

              <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
                <input type="radio" name="offer-scope" value="product" ${scope === 'product' ? 'checked' : ''} 
                       onchange="document.getElementById('product-checklist-container').style.display='block'; EntrepreneurModule.updateOfferPreview();">
                <span>Apply only to <strong>Selected Products</strong></span>
              </label>
            </div>

            <!-- Product Selection Checklist -->
            <div id="product-checklist-container" style="display:${scope === 'product' ? 'block' : 'none'}; border:1px solid #E6E1D3; border-radius:var(--radius-sm); padding:8px 10px; margin-top:8px; max-height:160px; overflow-y:auto; background:#FFF;">
              <div style="font-size:11px; color:var(--color-text-secondary); margin-bottom:6px;">Select products from your catalog:</div>
              ${myProducts.length === 0 ? `
                <div style="font-size:12px; color:var(--color-text-tertiary); padding:6px 0;">No products listed yet. Please add products first.</div>
              ` : myProducts.map(p => `
                <label style="display:flex; align-items:center; gap:8px; padding:4px 0; font-size:12px; cursor:pointer; border-bottom:1px solid #F5F5F5;">
                  <input type="checkbox" name="selected-product-ids" value="${p.id}" ${selectedProductIds.includes(p.id) ? 'checked' : ''} style="accent-color:var(--color-primary);" onchange="EntrepreneurModule.updateOfferPreview()">
                  <span style="flex:1;">${p.name}</span>
                  <span style="font-weight:700; color:var(--color-primary);">₹${p.price}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- 6. Start Date & End Date -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px;">
            <div class="form-group">
              <label class="form-label" style="font-size:12px; font-weight:700;">Start Date *</label>
              <input type="date" id="offer-start-date" class="form-input" required 
                     value="${startDate}">
            </div>

            <div class="form-group">
              <label class="form-label" style="font-size:12px; font-weight:700;">Expiry Date</label>
              <input type="date" id="offer-end-date" class="form-input" 
                     value="${endDate}">
            </div>
          </div>

          <!-- 7. Optional Coupon Code & Usage Limit -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:14px;">
            <div class="form-group">
              <label class="form-label" style="font-size:12px; font-weight:700;">Coupon Code</label>
              <input type="text" id="offer-code" class="form-input" 
                     placeholder="e.g. ANITA15 (Optional)" 
                     style="text-transform:uppercase;" 
                     value="${code}" 
                     oninput="this.value = this.value.toUpperCase(); EntrepreneurModule.updateOfferPreview();">
            </div>

            <div class="form-group">
              <label class="form-label" style="font-size:12px; font-weight:700;">Usage Limit</label>
              <input type="number" id="offer-usage-limit" class="form-input" min="1" 
                     placeholder="e.g. 50 orders (Optional)" 
                     value="${usageLimit}">
            </div>
          </div>

          <!-- Submit Buttons -->
          <div style="display:flex; gap:10px; margin-top:16px;">
            <button type="button" class="btn btn-outline" style="flex:1;" onclick="AppUtils.closeBottomSheet()">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" style="flex:2; font-weight:700;">
              ${existing ? '💾 Save Changes' : '🚀 Publish Offer'}
            </button>
          </div>
        </form>
      </div>
    `;

    AppUtils.showBottomSheet(contentHtml);
    setTimeout(() => this.updateOfferPreview(), 50);
  },

  updateOfferPreview() {
    const titleEl = document.getElementById('offer-title');
    const descEl = document.getElementById('offer-description');
    const typeEl = document.getElementById('offer-discount-type');
    const valEl = document.getElementById('offer-discount-value');
    const maxEl = document.getElementById('offer-max-discount');
    const minEl = document.getElementById('offer-min-order');
    const codeEl = document.getElementById('offer-code');
    const maxContainer = document.getElementById('max-discount-container');

    if (!titleEl || !valEl) return;

    const title = titleEl.value.trim() || 'Your Promotional Offer Title';
    const desc = (descEl && descEl.value.trim()) || 'Promotional description of your festive offer';
    const type = (typeEl && typeEl.value) || 'percentage';
    const val = Number(valEl.value) || 10;
    const maxVal = maxEl && maxEl.value ? Number(maxEl.value) : null;
    const minVal = minEl && minEl.value ? Number(minEl.value) : null;
    const code = (codeEl && codeEl.value.trim()) || '';

    if (maxContainer) {
      maxContainer.style.display = type === 'percentage' ? 'block' : 'none';
    }

    const badgeText = type === 'percentage' ? `${val}% OFF` : `₹${val} OFF`;

    // 1. Update Home Banner Preview
    const pTitle = document.getElementById('preview-title');
    const pDesc = document.getElementById('preview-desc');
    const pBadge = document.getElementById('preview-badge-pill');
    const pCode = document.getElementById('preview-code-pill');
    const pCond = document.getElementById('preview-conditions');

    if (pTitle) pTitle.textContent = title;
    if (pDesc) pDesc.textContent = desc;
    if (pBadge) pBadge.textContent = badgeText;
    if (pCode) pCode.textContent = code ? code.toUpperCase() : 'SPECIAL DEAL';
    if (pCond) {
      pCond.textContent = minVal ? `Min order ₹${minVal}` : (maxVal ? `Max discount ₹${maxVal}` : 'No minimum order required');
    }

    // 2. Update Product Card Preview (using sample ₹450 product)
    const cardBadge = document.getElementById('preview-card-badge');
    const cardDisc = document.getElementById('preview-card-discounted');
    const cardOrig = document.getElementById('preview-card-original');
    const cardSave = document.getElementById('preview-card-savings');

    const samplePrice = 450;
    let discAmt = 0;
    if (type === 'percentage') {
      discAmt = Math.round((samplePrice * val) / 100);
      if (maxVal) discAmt = Math.min(discAmt, maxVal);
    } else {
      discAmt = Math.min(samplePrice, val);
    }
    const finalPrice = Math.max(0, samplePrice - discAmt);

    if (cardBadge) cardBadge.textContent = badgeText;
    if (cardDisc) cardDisc.textContent = `₹${finalPrice}`;
    if (cardOrig) cardOrig.textContent = `₹${samplePrice}`;
    if (cardSave) cardSave.textContent = `Save ₹${discAmt}`;
  },

  async saveOffer(event) {
    if (event) event.preventDefault();
    const ent = this.getEntrepreneur();

    const titleEl = document.getElementById('offer-title');
    const descEl = document.getElementById('offer-description');
    const typeEl = document.getElementById('offer-discount-type');
    const valEl = document.getElementById('offer-discount-value');
    const maxEl = document.getElementById('offer-max-discount');
    const minEl = document.getElementById('offer-min-order');
    const startEl = document.getElementById('offer-start-date');
    const endEl = document.getElementById('offer-end-date');
    const codeEl = document.getElementById('offer-code');
    const limitEl = document.getElementById('offer-usage-limit');

    const scopeRadio = document.querySelector('input[name="offer-scope"]:checked');
    const scope = scopeRadio ? scopeRadio.value : 'shop';

    const selectedCheckboxes = document.querySelectorAll('input[name="selected-product-ids"]:checked');
    const selectedProductIds = Array.from(selectedCheckboxes).map(cb => cb.value);

    if (!titleEl || !titleEl.value.trim()) {
      AppUtils.showToast('Please enter an offer title');
      return;
    }

    const discountVal = Number(valEl.value);
    if (isNaN(discountVal) || discountVal <= 0) {
      AppUtils.showToast('Please enter a valid discount value');
      return;
    }

    if (scope === 'product' && selectedProductIds.length === 0) {
      AppUtils.showToast('Please select at least one product for this offer');
      return;
    }

    const offerPayload = {
      title: titleEl.value.trim(),
      description: descEl ? descEl.value.trim() : '',
      discountType: typeEl ? typeEl.value : 'percentage',
      discountValue: discountVal,
      maxDiscount: maxEl && maxEl.value ? Number(maxEl.value) : null,
      minOrderAmount: minEl && minEl.value ? Number(minEl.value) : 0,
      scope: scope,
      productIds: scope === 'product' ? selectedProductIds : [],
      startDate: startEl && startEl.value ? new Date(startEl.value).toISOString() : new Date().toISOString(),
      endDate: endEl && endEl.value ? new Date(endEl.value + 'T23:59:59').toISOString() : null,
      code: codeEl && codeEl.value.trim() ? codeEl.value.trim().toUpperCase() : null,
      usageLimit: limitEl && limitEl.value ? Number(limitEl.value) : null,
      storeName: ent.businessName
    };

    try {
      let res = null;
      if (this.editingOfferId) {
        res = await apiClient.updateEntrepreneurOffer(this.editingOfferId, offerPayload);
      } else {
        res = await apiClient.createEntrepreneurOffer(offerPayload);
      }

      if (res && res.success) {
        AppUtils.closeBottomSheet();
        AppUtils.showToast(res.message || 'Offer published successfully!');

        // Refresh offers from API or store
        const freshOffers = await apiClient.getEntrepreneurOffers();
        if (freshOffers && freshOffers.data) {
          // Sync with store
          const otherOffers = ((store.data && store.data.offers) || []).filter(o => o.entrepreneurId !== ent.id);
          store.data.offers = [...freshOffers.data, ...otherOffers];
          store.saveData();
        }

        AppRouter.navigate('screen-ent-offers');
      } else {
        AppUtils.showToast((res && res.message) || 'Failed to save offer');
      }
    } catch (e) {
      console.error('[OFFER_SAVE_ERROR]', e);
      AppUtils.showToast(e.message || 'Error saving offer. Please try again.');
    }
  },

  async toggleOffer(offerId) {
    try {
      const res = await apiClient.toggleEntrepreneurOffer(offerId);
      if (res && res.success) {
        AppUtils.showToast(res.message || 'Offer status updated');
        // Refresh local store
        const target = ((store.data && store.data.offers) || []).find(o => o.id === offerId);
        if (target) {
          target.active = res.data ? res.data.active : !target.active;
          store.saveData();
        }
        AppRouter.navigate('screen-ent-offers');
      } else {
        AppUtils.showToast((res && res.message) || 'Could not update offer status');
      }
    } catch (e) {
      AppUtils.showToast(e.message || 'Failed to toggle offer');
    }
  },

  confirmDeleteOffer(offerId) {
    const offer = ((store.data && store.data.offers) || []).find(o => o.id === offerId);
    const offerName = offer ? offer.title : 'this offer';

    AppUtils.showBottomSheet(`
      <div style="text-align:center; padding:16px 8px;">
        <div style="width:56px; height:56px; border-radius:50%; background:#FFEBEE; color:var(--color-error); display:flex; align-items:center; justify-content:center; margin:0 auto 12px auto;">
          <span class="material-symbols-rounded" style="font-size:28px;">delete_forever</span>
        </div>
        <h3 style="font-size:16px; font-weight:700; color:var(--color-text-primary); margin-bottom:6px;">Delete Offer?</h3>
        <p style="font-size:12px; color:var(--color-text-secondary); margin-bottom:16px;">
          Are you sure you want to permanently delete "<strong>${offerName}</strong>"? This action cannot be undone.
        </p>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-outline" style="flex:1;" onclick="AppUtils.closeBottomSheet()">Cancel</button>
          <button class="btn btn-danger" style="flex:1; background:var(--color-error); color:#FFF; font-weight:700;" onclick="EntrepreneurModule.executeDeleteOffer('${offerId}')">
            Delete Permanently
          </button>
        </div>
      </div>
    `);
  },

  async executeDeleteOffer(offerId) {
    try {
      const res = await apiClient.deleteEntrepreneurOffer(offerId);
      AppUtils.closeBottomSheet();
      if (res && res.success) {
        AppUtils.showToast(res.message || 'Offer deleted successfully');
        const idx = ((store.data && store.data.offers) || []).findIndex(o => o.id === offerId);
        if (idx !== -1) {
          store.data.offers.splice(idx, 1);
          store.saveData();
        }
        AppRouter.navigate('screen-ent-offers');
      } else {
        AppUtils.showToast((res && res.message) || 'Failed to delete offer');
      }
    } catch (e) {
      AppUtils.closeBottomSheet();
      AppUtils.showToast(e.message || 'Failed to delete offer');
    }
  },

  previewOfferInModal(offerId) {
    const ent = this.getEntrepreneur();
    const offer = ((store.data && store.data.offers) || []).find(o => o.id === offerId);
    if (!offer) return;

    AppUtils.showBottomSheet(`
      <div style="padding-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="font-size:15px; font-weight:700; color:var(--color-primary); margin:0;">
            👁️ Customer View Preview
          </h3>
          <button class="icon-action-btn" onclick="AppUtils.closeBottomSheet()">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <div style="font-size:11px; color:var(--color-text-secondary); margin-bottom:12px;">
          Here is how your offer "${offer.title}" appears to shoppers on the platform:
        </div>

        <!-- Banner preview -->
        <div style="background:linear-gradient(135deg, #4A6B32 0%, #2E451E 100%); border-radius:var(--radius-md); padding:14px; color:#FFF; margin-bottom:14px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="background:rgba(255,255,255,0.2); font-size:11px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full);">
              ${offer.badgeText || (offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`)}
            </span>
            <span style="font-size:10px; font-weight:600; color:#F4EBD9; background:rgba(0,0,0,0.25); padding:2px 8px; border-radius:var(--radius-full);">
              🏪 ${ent.businessName}
            </span>
            ${offer.code ? `
              <span style="font-family:monospace; background:#FFF; color:#2E451E; font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full);">
                ${offer.code}
              </span>
            ` : ''}
          </div>
          <div style="font-size:14px; font-weight:700; margin-top:4px;">${offer.title}</div>
          <div style="font-size:11px; opacity:0.9; color:#F4EBD9; margin-top:2px;">
            ${offer.description || 'Special store promotion from local women entrepreneurs'}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:10px;">
            <span style="opacity:0.85; color:#F4EBD9;">
              ${offer.minOrderAmount ? `Min order ₹${offer.minOrderAmount}` : 'Limited time deal'}
            </span>
            <span style="background:#FFF; color:#2E451E; font-weight:700; padding:4px 10px; border-radius:var(--radius-full);">
              Shop Now >
            </span>
          </div>
        </div>

        <button class="btn btn-primary btn-block" onclick="AppUtils.closeBottomSheet()">
          Done
        </button>
      </div>
    `);
  },

  // -------------------------------------------------------------------
  // SCREEN: ENTREPRENEUR ADVERTISEMENT MANAGEMENT
  // -------------------------------------------------------------------
  renderAdvertisements(params = {}) {
    const ent = this.getEntrepreneur();
    const allAds = store.getEntrepreneurAds ? store.getEntrepreneurAds(ent.id) : (((store.data && store.data.advertisements) || []).filter(a => a.entrepreneurId === ent.id));
    const now = new Date();

    // KPI Metrics Calculation
    const activeAds = allAds.filter(a => 
      (a.status === 'Approved' || a.status === 'Active') && 
      (!a.endDate || new Date(a.endDate) >= now) && 
      (!a.startDate || new Date(a.startDate) <= now)
    );
    const pendingAds = allAds.filter(a => a.status === 'Pending Approval');
    const approvedAds = allAds.filter(a => a.status === 'Approved' || a.status === 'Active');
    const rejectedAds = allAds.filter(a => a.status === 'Rejected');
    const pausedAds = allAds.filter(a => a.status === 'Paused');
    const expiredAds = allAds.filter(a => a.status === 'Expired' || (a.endDate && new Date(a.endDate) < now));

    const totalImpressions = allAds.reduce((sum, a) => sum + (a.impressions || 0), 0);
    const totalClicks = allAds.reduce((sum, a) => sum + (a.clicks || 0), 0);
    const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';
    const totalOrdersAttributed = allAds.reduce((sum, a) => sum + (a.ordersAttributed || 0), 0);

    // Active Filter
    const activeFilter = this.adFilter || 'all';
    let filteredAds = allAds;
    if (activeFilter === 'active') filteredAds = activeAds;
    else if (activeFilter === 'pending') filteredAds = pendingAds;
    else if (activeFilter === 'approved') filteredAds = approvedAds;
    else if (activeFilter === 'rejected') filteredAds = rejectedAds;
    else if (activeFilter === 'paused') filteredAds = pausedAds;
    else if (activeFilter === 'expired') filteredAds = expiredAds;

    return `
      <!-- Top App Bar -->
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-ent-dashboard')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">My Advertisements</span>
        </div>
        <div class="top-app-bar-actions">
          <button class="btn btn-sm btn-primary" onclick="EntrepreneurModule.openCreateAdModal()" style="display:flex; align-items:center; gap:4px; font-weight:700;">
            <span class="material-symbols-rounded" style="font-size:16px;">campaign</span>
            <span>New Ad</span>
          </button>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 12px; padding-bottom: 80px;">
        <!-- Shop Identity Bar -->
        <div style="background:#FFFDE7; border:1px solid #FFF59D; border-radius:var(--radius-md); padding:10px 14px; margin-bottom:14px; display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="material-symbols-rounded" style="color:var(--color-primary); font-size:20px;">campaign</span>
            <div>
              <div style="font-size:13px; font-weight:700; color:var(--color-text-primary);">${ent.businessName}</div>
              <div style="font-size:11px; color:var(--color-text-secondary);">Promote your kitchen & craft studio on the customer home carousel</div>
            </div>
          </div>
          <span class="chip-badge" style="background:#E8F5E9; color:var(--color-primary); font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full);">
            Verified Seller
          </span>
        </div>

        <!-- KPI Performance Grid -->
        <div class="stat-card-grid" style="grid-template-columns: repeat(2, 1fr); gap:10px; margin-bottom:16px;">
          <div class="stat-card" style="padding:12px;">
            <div class="stat-icon-wrap" style="background:#E8F5E9; color:var(--color-primary);">
              <span class="material-symbols-rounded">visibility</span>
            </div>
            <div class="stat-value" style="font-size:18px;">${totalImpressions.toLocaleString()}</div>
            <div class="stat-label">Total Impressions</div>
          </div>

          <div class="stat-card" style="padding:12px;">
            <div class="stat-icon-wrap" style="background:#E1F5FE; color:var(--color-info);">
              <span class="material-symbols-rounded">ads_click</span>
            </div>
            <div class="stat-value" style="font-size:18px;">${totalClicks.toLocaleString()}</div>
            <div class="stat-label">Total Ad Clicks</div>
          </div>

          <div class="stat-card" style="padding:12px;">
            <div class="stat-icon-wrap" style="background:#FFF3E0; color:var(--color-warning);">
              <span class="material-symbols-rounded">trending_up</span>
            </div>
            <div class="stat-value" style="font-size:18px;">${avgCtr}%</div>
            <div class="stat-label">Click-Through Rate</div>
          </div>

          <div class="stat-card" style="padding:12px;">
            <div class="stat-icon-wrap" style="background:#F3E5F5; color:#7B1FA2;">
              <span class="material-symbols-rounded">shopping_cart_checkout</span>
            </div>
            <div class="stat-value" style="font-size:18px;">${totalOrdersAttributed}</div>
            <div class="stat-label">Attributed Orders</div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:8px; margin-bottom:14px; -webkit-overflow-scrolling:touch;">
          <button class="chip-filter ${activeFilter === 'all' ? 'active' : ''}" onclick="EntrepreneurModule.setAdFilter('all')" style="padding:6px 12px; font-size:12px; font-weight:600; border-radius:var(--radius-full); cursor:pointer; white-space:nowrap; border:1px solid ${activeFilter === 'all' ? 'var(--color-primary)' : 'var(--color-border)'}; background:${activeFilter === 'all' ? 'var(--color-primary)' : '#FFF'}; color:${activeFilter === 'all' ? '#FFF' : 'var(--color-text-primary)'};">
            All (${allAds.length})
          </button>
          <button class="chip-filter ${activeFilter === 'active' ? 'active' : ''}" onclick="EntrepreneurModule.setAdFilter('active')" style="padding:6px 12px; font-size:12px; font-weight:600; border-radius:var(--radius-full); cursor:pointer; white-space:nowrap; border:1px solid ${activeFilter === 'active' ? 'var(--color-primary)' : 'var(--color-border)'}; background:${activeFilter === 'active' ? 'var(--color-primary)' : '#FFF'}; color:${activeFilter === 'active' ? '#FFF' : 'var(--color-text-primary)'};">
            Active (${activeAds.length})
          </button>
          <button class="chip-filter ${activeFilter === 'pending' ? 'active' : ''}" onclick="EntrepreneurModule.setAdFilter('pending')" style="padding:6px 12px; font-size:12px; font-weight:600; border-radius:var(--radius-full); cursor:pointer; white-space:nowrap; border:1px solid ${activeFilter === 'pending' ? 'var(--color-primary)' : 'var(--color-border)'}; background:${activeFilter === 'pending' ? 'var(--color-primary)' : '#FFF'}; color:${activeFilter === 'pending' ? '#FFF' : 'var(--color-text-primary)'};">
            Pending (${pendingAds.length})
          </button>
          <button class="chip-filter ${activeFilter === 'rejected' ? 'active' : ''}" onclick="EntrepreneurModule.setAdFilter('rejected')" style="padding:6px 12px; font-size:12px; font-weight:600; border-radius:var(--radius-full); cursor:pointer; white-space:nowrap; border:1px solid ${activeFilter === 'rejected' ? 'var(--color-primary)' : 'var(--color-border)'}; background:${activeFilter === 'rejected' ? 'var(--color-primary)' : '#FFF'}; color:${activeFilter === 'rejected' ? '#FFF' : 'var(--color-text-primary)'};">
            Rejected (${rejectedAds.length})
          </button>
          <button class="chip-filter ${activeFilter === 'paused' ? 'active' : ''}" onclick="EntrepreneurModule.setAdFilter('paused')" style="padding:6px 12px; font-size:12px; font-weight:600; border-radius:var(--radius-full); cursor:pointer; white-space:nowrap; border:1px solid ${activeFilter === 'paused' ? 'var(--color-primary)' : 'var(--color-border)'}; background:${activeFilter === 'paused' ? 'var(--color-primary)' : '#FFF'}; color:${activeFilter === 'paused' ? '#FFF' : 'var(--color-text-primary)'};">
            Paused (${pausedAds.length})
          </button>
        </div>

        <!-- Advertisements List -->
        ${filteredAds.length === 0 ? `
          <div class="empty-state" style="padding:40px 16px; text-align:center;">
            <div style="width:64px; height:64px; border-radius:50%; background:#F1F8E9; color:var(--color-primary); display:flex; align-items:center; justify-content:center; margin:0 auto 12px auto;">
              <span class="material-symbols-rounded" style="font-size:32px;">campaign</span>
            </div>
            <h4 style="font-size:15px; font-weight:700; color:var(--color-text-primary); margin-bottom:4px;">No Advertisements Found</h4>
            <p style="font-size:12px; color:var(--color-text-secondary); max-width:280px; margin:0 auto 16px auto;">
              ${activeFilter === 'all' 
                ? 'Promote your homemade delicacies or handcrafted treasures to local shoppers near you!' 
                : `No advertisements currently under "${activeFilter}".`}
            </p>
            <button class="btn btn-primary btn-sm" onclick="EntrepreneurModule.openCreateAdModal()" style="display:inline-flex; align-items:center; gap:6px;">
              <span class="material-symbols-rounded" style="font-size:16px;">add_circle</span>
              <span>Create Your First Advertisement</span>
            </button>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:14px;">
            ${filteredAds.map(ad => {
              const isApproved = ad.status === 'Approved' || ad.status === 'Active';
              const isPending = ad.status === 'Pending Approval';
              const isRejected = ad.status === 'Rejected';
              const isPaused = ad.status === 'Paused';

              return `
                <div class="card" style="padding:14px; border:1px solid var(--color-border); border-radius:var(--radius-md); background:#FFF; position:relative; overflow:hidden;">
                  <!-- Top Row: Title, Type & Status Pill -->
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; gap:8px;">
                    <div>
                      <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                        <h4 style="font-size:14px; font-weight:700; color:var(--color-text-primary); margin:0;">
                          ${ad.title}
                        </h4>
                        <span style="font-size:10px; background:#F5F9EE; color:var(--color-primary); font-weight:700; padding:2px 6px; border-radius:var(--radius-sm);">
                          ${ad.adType || 'Shop Promotion'}
                        </span>
                      </div>
                      ${ad.description ? `<p style="font-size:11px; color:var(--color-text-secondary); margin:4px 0 0 0;">${ad.description}</p>` : ''}
                    </div>

                    <!-- Status Pill -->
                    <div>
                      ${isApproved ? `
                        <span style="background:#E8F5E9; color:#2E7D32; font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:3px;">
                          <span class="material-symbols-rounded" style="font-size:12px;">check_circle</span>
                          Approved
                        </span>
                      ` : isPending ? `
                        <span style="background:#FFF8E1; color:#F57F17; font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:3px;">
                          <span class="material-symbols-rounded" style="font-size:12px;">pending</span>
                          Pending Review
                        </span>
                      ` : isRejected ? `
                        <span style="background:#FFEBEE; color:#C62828; font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:3px;">
                          <span class="material-symbols-rounded" style="font-size:12px;">error</span>
                          Action Required
                        </span>
                      ` : `
                        <span style="background:#ECEFF1; color:#546E7A; font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full);">
                          Paused
                        </span>
                      `}
                    </div>
                  </div>

                  <!-- Rejection Notice (if rejected) -->
                  ${isRejected ? `
                    <div style="background:#FFEBEE; border:1px solid #FFCDD2; border-radius:var(--radius-sm); padding:10px 12px; margin:8px 0; display:flex; justify-content:space-between; align-items:center;">
                      <div>
                        <div style="font-size:11px; font-weight:700; color:#C62828;">⚠️ Rejection Reason from Admin:</div>
                        <div style="font-size:11px; color:#B71C1C; margin-top:2px;">"${ad.rejectionReason || 'Please review image quality or promotional details.'}"</div>
                      </div>
                      <button class="btn btn-sm" style="background:#C62828; color:#FFF; font-size:10px; font-weight:700; border:none; padding:4px 8px; border-radius:var(--radius-full); cursor:pointer;" onclick="EntrepreneurModule.openEditAdModal('${ad.id}')">
                        ✏️ Correct &amp; Resubmit
                      </button>
                    </div>
                  ` : ''}

                  <!-- Media Banner Preview Thumbnail -->
                  ${ad.imageUrl ? `
                    <div style="width:100%; height:110px; border-radius:var(--radius-sm); overflow:hidden; margin:8px 0; background:#2E451E; position:relative;">
                      <img src="${ad.imageUrl}" alt="${ad.title}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/uploads/banner_anita_cakes.svg'">
                      <div style="position:absolute; bottom:6px; left:8px; background:rgba(0,0,0,0.6); color:#FFF; font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full);">
                        CTA: "${ad.ctaText || 'Shop Now'}"
                      </div>
                      ${ad.discountText ? `
                        <div style="position:absolute; top:6px; right:8px; background:var(--color-primary); color:#FFF; font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full);">
                          ${ad.discountText}
                        </div>
                      ` : ''}
                    </div>
                  ` : ''}

                  <!-- Ad Details Badges -->
                  <div style="display:flex; flex-wrap:wrap; gap:6px; margin:6px 0; font-size:11px;">
                    <span style="background:#FAFAFA; color:var(--color-text-secondary); border:1px solid #EEEEEE; padding:3px 8px; border-radius:var(--radius-sm);">
                      📍 Placement: ${ad.placement === 'home_carousel' ? 'Main Carousel' : (ad.placement === 'category_page' ? 'Category Page' : 'Shop Page')}
                    </span>
                    ${ad.couponCode ? `
                      <span style="background:#F5F9EE; color:var(--color-primary); font-family:monospace; font-weight:700; padding:3px 8px; border-radius:var(--radius-sm);">
                        Coupon: ${ad.couponCode}
                      </span>
                    ` : ''}
                    ${ad.endDate ? `
                      <span style="background:#FAFAFA; color:var(--color-text-secondary); border:1px solid #EEEEEE; padding:3px 8px; border-radius:var(--radius-sm);">
                        📅 Valid till ${new Date(ad.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    ` : ''}
                  </div>

                  <!-- Live Performance Bar -->
                  <div style="background:#F9F8F3; border-radius:var(--radius-sm); padding:8px 10px; margin:8px 0; display:flex; justify-content:space-between; align-items:center; font-size:11px;">
                    <div>
                      <span style="color:var(--color-text-secondary);">Impressions:</span>
                      <strong style="color:var(--color-text-primary);">${ad.impressions || 0}</strong>
                    </div>
                    <div>
                      <span style="color:var(--color-text-secondary);">Clicks:</span>
                      <strong style="color:var(--color-text-primary);">${ad.clicks || 0}</strong>
                    </div>
                    <div>
                      <span style="color:var(--color-text-secondary);">CTR:</span>
                      <strong style="color:var(--color-primary);">${ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0}%</strong>
                    </div>
                    <div>
                      <span style="color:var(--color-text-secondary);">Orders:</span>
                      <strong style="color:var(--color-text-primary);">${ad.ordersAttributed || 0}</strong>
                    </div>
                  </div>

                  <!-- Actions Row -->
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; padding-top:8px; border-top:1px solid #F0EEE4;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <button class="btn btn-sm btn-text" onclick="EntrepreneurModule.previewAdInModal('${ad.id}')" style="display:flex; align-items:center; gap:4px; font-size:11px; padding:4px 8px;">
                        <span class="material-symbols-rounded" style="font-size:14px;">visibility</span>
                        Preview
                      </button>

                      <button class="btn btn-sm btn-text" onclick="EntrepreneurModule.openEditAdModal('${ad.id}')" style="display:flex; align-items:center; gap:4px; font-size:11px; padding:4px 8px;">
                        <span class="material-symbols-rounded" style="font-size:14px;">edit</span>
                        Edit
                      </button>

                      <button class="btn btn-sm btn-text" onclick="EntrepreneurModule.confirmDeleteAd('${ad.id}')" style="display:flex; align-items:center; gap:4px; font-size:11px; padding:4px 8px; color:var(--color-error);">
                        <span class="material-symbols-rounded" style="font-size:14px;">delete</span>
                        Delete
                      </button>
                    </div>

                    <div>
                      ${isApproved || isPaused ? `
                        <button class="btn btn-sm ${isPaused ? 'btn-primary' : 'btn-outline'}" onclick="EntrepreneurModule.toggleAd('${ad.id}')" style="font-size:11px; padding:4px 10px;">
                          ${isPaused ? 'Resume Ad' : 'Pause Ad'}
                        </button>
                      ` : isPending ? `
                        <span style="font-size:10px; color:#F57F17; font-weight:600;">Under Review</span>
                      ` : `
                        <button class="btn btn-sm btn-outline" onclick="EntrepreneurModule.openEditAdModal('${ad.id}')" style="font-size:11px; padding:4px 10px;">
                          Edit Ad
                        </button>
                      `}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      ${this.renderBottomNav('profile')}
    `;
  },

  setAdFilter(filter) {
    this.adFilter = filter;
    AppRouter.navigate('screen-ent-advertisements');
  },

  // -------------------------------------------------------------------
  // ADVERTISEMENT CREATION / EDIT MODAL WITH LIVE PREVIEW & UPLOAD
  // -------------------------------------------------------------------
  openCreateAdModal() {
    this.editingAdId = null;
    this.currentUploadedAdImageUrl = null;
    this.showAdFormModal();
  },

  openEditAdModal(adId) {
    this.editingAdId = adId;
    const existing = store.getAdvertisementById ? store.getAdvertisementById(adId) : (((store.data && store.data.advertisements) || []).find(a => a.id === adId));
    this.currentUploadedAdImageUrl = existing ? existing.imageUrl : null;
    this.showAdFormModal(adId);
  },

  showAdFormModal(adId = null) {
    const ent = this.getEntrepreneur();
    const existing = adId ? (((store.data && store.data.advertisements) || []).find(a => a.id === adId)) : null;
    const myProducts = store.getProducts({ entrepreneurId: ent.id });
    const myOffers = ((store.data && store.data.offers) || []).filter(o => o.entrepreneurId === ent.id && o.active);

    const title = existing ? existing.title : '';
    const description = existing ? (existing.description || '') : '';
    const adType = existing ? existing.adType : 'Shop Promotion';
    const placement = existing ? existing.placement : 'home_carousel';
    const targetCategory = existing ? (existing.targetCategory || '') : '';
    const selectedProductIds = existing && existing.productIds ? existing.productIds : [];
    const offerId = existing ? (existing.offerId || '') : '';
    const discountText = existing ? (existing.discountText || '') : '';
    const ctaText = existing ? existing.ctaText : 'Shop Now';
    const ctaTarget = existing ? existing.ctaTarget : 'shop';
    const startDate = existing && existing.startDate ? existing.startDate.substring(0, 10) : new Date().toISOString().substring(0, 10);
    const endDate = existing && existing.endDate ? existing.endDate.substring(0, 10) : '';
    const imageUrl = this.currentUploadedAdImageUrl || (existing ? existing.imageUrl : '/uploads/banner_anita_cakes.svg');

    const contentHtml = `
      <div style="max-height:82vh; overflow-y:auto; padding-right:4px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #F0EEE4; padding-bottom:8px;">
          <div>
            <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin:0;">
              ${existing ? '✏️ Edit Advertisement' : '📢 Create New Advertisement'}
            </h3>
            <span style="font-size:11px; color:var(--color-text-secondary);">${ent.businessName}</span>
          </div>
          <button class="icon-action-btn" onclick="AppUtils.closeBottomSheet()">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <!-- LIVE CAROUSEL PREVIEW -->
        <div style="background:#F9F8F3; border:1px solid #E6E1D3; border-radius:var(--radius-md); padding:12px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:11px; font-weight:700; color:var(--color-primary); text-transform:uppercase; letter-spacing:0.5px; display:flex; align-items:center; gap:4px;">
              <span class="material-symbols-rounded" style="font-size:14px;">visibility</span>
              Live Customer Carousel Preview
            </span>
            <span style="font-size:10px; color:var(--color-text-secondary);">Updates live as you type</span>
          </div>

          <!-- The Banner Card -->
          <div id="ad-live-preview-card" style="background:linear-gradient(135deg, #4A6B32 0%, #233714 100%); border-radius:var(--radius-md); padding:14px; color:#FFF; position:relative; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.12);">
            <div id="preview-ad-img-container" style="position:absolute; right:0; top:0; width:45%; height:100%; opacity:0.85; pointer-events:none; display:flex; align-items:center; justify-content:center;">
              <img id="preview-ad-img" src="${imageUrl}" alt="Preview" style="width:100%; height:100%; object-fit:cover; border-radius:0 var(--radius-md) var(--radius-md) 0;" onerror="this.src='/uploads/banner_anita_cakes.svg'">
            </div>
            <div style="position:relative; z-index:2; max-width:65%;">
              <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                <span id="preview-ad-type-badge" style="background:rgba(255,255,255,0.22); color:#FFF; font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full);">
                  ${discountText || adType}
                </span>
                <span style="font-size:10px; font-weight:600; color:#F4EBD9; background:rgba(0,0,0,0.3); padding:2px 8px; border-radius:var(--radius-full);">
                  🏪 ${ent.businessName}
                </span>
              </div>
              <div id="preview-ad-title" style="font-size:14px; font-weight:700; line-height:1.3;">
                ${title || 'Your Eye-Catching Advertisement Title'}
              </div>
              <div id="preview-ad-desc" style="font-size:11px; opacity:0.9; color:#F4EBD9; margin-top:3px; max-height:36px; overflow:hidden;">
                ${description || 'Promotional message showcasing your homemade delicacies or artisan crafts'}
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:10px;">
                <span id="preview-ad-dates" style="opacity:0.85; color:#F4EBD9;">
                  ${endDate ? `Valid till ${new Date(endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}` : 'Limited time deal'}
                </span>
                <button class="btn btn-sm" style="background:#FFF; color:#2E451E; font-weight:700; border:none; padding:4px 10px; border-radius:var(--radius-full); font-size:10px;" onclick="event.preventDefault()">
                  <span id="preview-ad-cta">${ctaText}</span> &gt;
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- FORM -->
        <form id="entrepreneur-ad-form" onsubmit="EntrepreneurModule.saveAdvertisement(event)">
          <!-- 1. Title -->
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label" style="font-size:12px; font-weight:700;">Advertisement Title *</label>
            <input type="text" id="ad-title" class="form-input" required 
                   placeholder="e.g., Grand Festive Bakes — 15% Off Handcrafted Sweets" 
                   value="${title}" 
                   oninput="EntrepreneurModule.updateAdLivePreview()">
          </div>

          <!-- 2. Description -->
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label" style="font-size:12px; font-weight:700;">Short Promotional Description</label>
            <textarea id="ad-description" class="form-input" rows="2" 
                      placeholder="e.g., Prepared fresh daily with pure ingredients by Anita Ramesh." 
                      oninput="EntrepreneurModule.updateAdLivePreview()">${description}</textarea>
          </div>

          <!-- 3. Image / Banner Upload & Preview -->
          <div class="form-group" style="margin-bottom:14px;">
            <label class="form-label" style="font-size:12px; font-weight:700;">Upload Advertisement Banner Image *</label>
            <div style="border:2px dashed #C8E6C9; border-radius:var(--radius-md); padding:14px; text-align:center; background:#FAFCF8; cursor:pointer;" onclick="document.getElementById('ad-file-input').click()">
              <input type="file" id="ad-file-input" accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm" style="display:none;" onchange="EntrepreneurModule.handleAdMediaFile(this)">
              <div id="ad-upload-prompt" style="display:${this.currentUploadedAdImageUrl ? 'none' : 'block'};">
                <span class="material-symbols-rounded" style="font-size:32px; color:var(--color-primary);">cloud_upload</span>
                <div style="font-size:12px; font-weight:700; color:var(--color-primary); margin-top:4px;">Click to Upload Banner Image or Video</div>
                <div style="font-size:10px; color:var(--color-text-secondary); margin-top:2px;">Supports JPG, PNG, WEBP (Max 5MB) or MP4 (Max 15MB)</div>
              </div>
              <div id="ad-upload-preview" style="display:${this.currentUploadedAdImageUrl ? 'block' : 'none'};">
                <img id="ad-uploaded-thumb" src="${imageUrl}" alt="Uploaded" style="max-height:90px; border-radius:var(--radius-sm); margin:0 auto 6px auto; display:block;">
                <span style="font-size:11px; color:var(--color-primary); font-weight:700;">✓ Image ready! Click to change</span>
              </div>
              <div id="ad-upload-progress" style="display:none; font-size:11px; color:var(--color-primary); margin-top:4px;">
                Uploading media... Please wait.
              </div>
            </div>
            <input type="hidden" id="ad-image-url" value="${imageUrl}">
          </div>

          <!-- 4. Ad Type & Placement -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px;">
            <div class="form-group">
              <label class="form-label" style="font-size:12px; font-weight:700;">Ad Type *</label>
              <select id="ad-type" class="form-input" onchange="EntrepreneurModule.updateAdLivePreview()">
                <option value="Shop Promotion" ${adType === 'Shop Promotion' ? 'selected' : ''}>Shop Promotion</option>
                <option value="Product Promotion" ${adType === 'Product Promotion' ? 'selected' : ''}>Product Promotion</option>
                <option value="Festival Offer" ${adType === 'Festival Offer' ? 'selected' : ''}>Festival Offer</option>
                <option value="New Collection" ${adType === 'New Collection' ? 'selected' : ''}>New Collection</option>
                <option value="Special Announcement" ${adType === 'Special Announcement' ? 'selected' : ''}>Special Announcement</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-size:12px; font-weight:700;">Placement *</label>
              <select id="ad-placement" class="form-input" onchange="EntrepreneurModule.updateAdLivePreview()">
                <option value="home_carousel" ${placement === 'home_carousel' ? 'selected' : ''}>Main Home Carousel</option>
                <option value="category_page" ${placement === 'category_page' ? 'selected' : ''}>Category Page Banner</option>
                <option value="shop_page" ${placement === 'shop_page' ? 'selected' : ''}>My Shop Page Header</option>
              </select>
            </div>
          </div>

          <!-- 5. Link an Eligible Offer & Discount Text -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px;">
            <div class="form-group">
              <label class="form-label" style="font-size:12px; font-weight:700;">Promote Shop Offer</label>
              <select id="ad-linked-offer" class="form-input" onchange="EntrepreneurModule.onAdOfferSelected(this.value)">
                <option value="">-- None (No Coupon) --</option>
                ${myOffers.map(o => `
                  <option value="${o.id}" data-code="${o.code || ''}" data-badge="${o.badgeText || ''}" ${offerId === o.id ? 'selected' : ''}>
                    ${o.code ? o.code + ' - ' : ''}${o.title}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-size:12px; font-weight:700;">Discount Tag / Badge</label>
              <input type="text" id="ad-discount-text" class="form-input" 
                     placeholder="e.g. 15% OFF, FESTIVE SPECIAL" 
                     value="${discountText}" 
                     oninput="EntrepreneurModule.updateAdLivePreview()">
            </div>
          </div>

          <!-- 6. Applicable Products Checklist -->
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label" style="font-size:12px; font-weight:700;">Promoted Products (Optional)</label>
            <div style="border:1px solid #E6E1D3; border-radius:var(--radius-sm); padding:8px 10px; max-height:130px; overflow-y:auto; background:#FFF;">
              ${myProducts.length === 0 ? `
                <div style="font-size:11px; color:var(--color-text-secondary);">No products listed yet.</div>
              ` : myProducts.map(p => `
                <label style="display:flex; align-items:center; gap:8px; padding:3px 0; font-size:12px; cursor:pointer;">
                  <input type="checkbox" name="ad-product-ids" value="${p.id}" ${selectedProductIds.includes(p.id) ? 'checked' : ''} style="accent-color:var(--color-primary);">
                  <span style="flex:1;">${p.name}</span>
                  <span style="font-weight:700; color:var(--color-primary);">₹${p.price}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- 7. CTA Text & Destination -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px;">
            <div class="form-group">
              <label class="form-label" style="font-size:12px; font-weight:700;">CTA Button Text *</label>
              <select id="ad-cta-text" class="form-input" onchange="EntrepreneurModule.updateAdLivePreview()">
                <option value="Shop Now" ${ctaText === 'Shop Now' ? 'selected' : ''}>Shop Now</option>
                <option value="Explore Collection" ${ctaText === 'Explore Collection' ? 'selected' : ''}>Explore Collection</option>
                <option value="Order Now" ${ctaText === 'Order Now' ? 'selected' : ''}>Order Now</option>
                <option value="View Deals" ${ctaText === 'View Deals' ? 'selected' : ''}>View Deals</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-size:12px; font-weight:700;">Click Destination *</label>
              <select id="ad-cta-target" class="form-input" onchange="EntrepreneurModule.updateAdLivePreview()">
                <option value="shop" ${ctaTarget === 'shop' ? 'selected' : ''}>My Shop Page</option>
                <option value="product" ${ctaTarget === 'product' ? 'selected' : ''}>Promoted Product</option>
                <option value="category" ${ctaTarget === 'category' ? 'selected' : ''}>Category Listing</option>
              </select>
            </div>
          </div>

          <!-- 8. Start Date & Expiry Date -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:14px;">
            <div class="form-group">
              <label class="form-label" style="font-size:12px; font-weight:700;">Start Date *</label>
              <input type="date" id="ad-start-date" class="form-input" required 
                     value="${startDate}">
            </div>

            <div class="form-group">
              <label class="form-label" style="font-size:12px; font-weight:700;">Expiry Date</label>
              <input type="date" id="ad-end-date" class="form-input" 
                     value="${endDate}" 
                     onchange="EntrepreneurModule.updateAdLivePreview()">
            </div>
          </div>

          <!-- Buttons -->
          <div style="display:flex; gap:10px; margin-top:16px;">
            <button type="button" class="btn btn-outline" style="flex:1;" onclick="AppUtils.closeBottomSheet()">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" style="flex:2; font-weight:700;">
              ${existing ? '💾 Save & Resubmit' : '🚀 Submit for Admin Review'}
            </button>
          </div>
        </form>
      </div>
    `;

    AppUtils.showBottomSheet(contentHtml);
    setTimeout(() => this.updateAdLivePreview(), 50);
  },

  async handleAdMediaFile(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    // Client-side format & size validation
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (!allowed.includes(file.type)) {
      AppUtils.showToast('Please select a valid image (JPG, PNG, WEBP) or video (MP4)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      AppUtils.showToast('File size exceeds 15MB limit');
      return;
    }

    const progressEl = document.getElementById('ad-upload-progress');
    const promptEl = document.getElementById('ad-upload-prompt');
    const previewEl = document.getElementById('ad-upload-preview');
    const thumbEl = document.getElementById('ad-uploaded-thumb');

    if (progressEl) progressEl.style.display = 'block';

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result;
      try {
        const res = await window.apiClient.uploadMedia(base64Data, file.name);
        if (progressEl) progressEl.style.display = 'none';

        if (res && res.success) {
          this.currentUploadedAdImageUrl = res.url;
          const urlInput = document.getElementById('ad-image-url');
          if (urlInput) urlInput.value = res.url;

          if (promptEl) promptEl.style.display = 'none';
          if (previewEl) previewEl.style.display = 'block';
          if (thumbEl) thumbEl.src = res.url;

          this.updateAdLivePreview();
          AppUtils.showToast('Banner uploaded successfully!');
        } else {
          AppUtils.showToast((res && res.message) || 'Upload failed');
        }
      } catch (err) {
        if (progressEl) progressEl.style.display = 'none';
        AppUtils.showToast(err.message || 'Media upload error');
      }
    };
    reader.readAsDataURL(file);
  },

  onAdOfferSelected(offerId) {
    const sel = document.getElementById('ad-linked-offer');
    if (!sel) return;
    const opt = sel.options[sel.selectedIndex];
    if (opt && opt.value) {
      const badge = opt.getAttribute('data-badge');
      const discountInput = document.getElementById('ad-discount-text');
      if (discountInput && badge) discountInput.value = badge;
    }
    this.updateAdLivePreview();
  },

  updateAdLivePreview() {
    const titleEl = document.getElementById('ad-title');
    const descEl = document.getElementById('ad-description');
    const typeEl = document.getElementById('ad-type');
    const discEl = document.getElementById('ad-discount-text');
    const ctaEl = document.getElementById('ad-cta-text');
    const endEl = document.getElementById('ad-end-date');
    const imgUrlEl = document.getElementById('ad-image-url');

    const pTitle = document.getElementById('preview-ad-title');
    const pDesc = document.getElementById('preview-ad-desc');
    const pBadge = document.getElementById('preview-ad-type-badge');
    const pCta = document.getElementById('preview-ad-cta');
    const pDates = document.getElementById('preview-ad-dates');
    const pImg = document.getElementById('preview-ad-img');

    if (pTitle && titleEl) pTitle.textContent = titleEl.value.trim() || 'Your Eye-Catching Advertisement Title';
    if (pDesc && descEl) pDesc.textContent = descEl.value.trim() || 'Promotional message showcasing your homemade delicacies or artisan crafts';
    if (pBadge) {
      const disc = discEl && discEl.value.trim();
      const type = typeEl && typeEl.value;
      pBadge.textContent = disc || type || 'Shop Promotion';
    }
    if (pCta && ctaEl) pCta.textContent = ctaEl.value || 'Shop Now';
    if (pDates) {
      pDates.textContent = endEl && endEl.value ? `Valid till ${new Date(endEl.value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}` : 'Limited time deal';
    }
    if (pImg && imgUrlEl && imgUrlEl.value) {
      pImg.src = imgUrlEl.value;
    }
  },

  async saveAdvertisement(event) {
    if (event) event.preventDefault();
    const ent = this.getEntrepreneur();

    const titleEl = document.getElementById('ad-title');
    const descEl = document.getElementById('ad-description');
    const typeEl = document.getElementById('ad-type');
    const placeEl = document.getElementById('ad-placement');
    const offerEl = document.getElementById('ad-linked-offer');
    const discEl = document.getElementById('ad-discount-text');
    const ctaTextEl = document.getElementById('ad-cta-text');
    const ctaTargetEl = document.getElementById('ad-cta-target');
    const startEl = document.getElementById('ad-start-date');
    const endEl = document.getElementById('ad-end-date');
    const imgUrlEl = document.getElementById('ad-image-url');

    if (!titleEl || !titleEl.value.trim()) {
      AppUtils.showToast('Please enter an advertisement title');
      return;
    }

    const imgUrl = (imgUrlEl && imgUrlEl.value) || this.currentUploadedAdImageUrl || '/uploads/banner_anita_cakes.svg';
    const checkedProds = document.querySelectorAll('input[name="ad-product-ids"]:checked');
    const productIds = Array.from(checkedProds).map(cb => cb.value);

    const payload = {
      title: titleEl.value.trim(),
      description: descEl ? descEl.value.trim() : '',
      imageUrl: imgUrl,
      adType: typeEl ? typeEl.value : 'Shop Promotion',
      placement: placeEl ? placeEl.value : 'home_carousel',
      offerId: offerEl && offerEl.value ? offerEl.value : null,
      discountText: discEl ? discEl.value.trim() : null,
      productIds,
      ctaText: ctaTextEl ? ctaTextEl.value : 'Shop Now',
      ctaTarget: ctaTargetEl ? ctaTargetEl.value : 'shop',
      targetId: ctaTargetEl && ctaTargetEl.value === 'product' && productIds.length > 0 ? productIds[0] : ent.id,
      startDate: startEl && startEl.value ? new Date(startEl.value).toISOString() : new Date().toISOString(),
      endDate: endEl && endEl.value ? new Date(endEl.value + 'T23:59:59').toISOString() : null,
      storeName: ent.businessName
    };

    try {
      let res = null;
      if (this.editingAdId) {
        res = await window.apiClient.updateEntrepreneurAd(this.editingAdId, payload);
      } else {
        res = await window.apiClient.createEntrepreneurAd(payload);
      }

      if (res && res.success) {
        AppUtils.closeBottomSheet();
        AppUtils.showToast(res.message || 'Advertisement submitted for review!');

        // Refresh list
        const fresh = await window.apiClient.getEntrepreneurAds();
        if (fresh && fresh.data) {
          const other = ((store.data && store.data.advertisements) || []).filter(a => a.entrepreneurId !== ent.id);
          store.data.advertisements = [...fresh.data, ...other];
          store.saveData();
        }
        AppRouter.navigate('screen-ent-advertisements');
      } else {
        AppUtils.showToast((res && res.message) || 'Could not save advertisement');
      }
    } catch (e) {
      AppUtils.showToast(e.message || 'Error saving advertisement');
    }
  },

  async toggleAd(adId) {
    try {
      const res = await window.apiClient.toggleEntrepreneurAd(adId);
      if (res && res.success) {
        AppUtils.showToast(res.message || 'Advertisement status updated');
        const target = ((store.data && store.data.advertisements) || []).find(a => a.id === adId);
        if (target) {
          target.status = res.data ? res.data.status : (target.status === 'Paused' ? 'Active' : 'Paused');
          store.saveData();
        }
        AppRouter.navigate('screen-ent-advertisements');
      } else {
        AppUtils.showToast((res && res.message) || 'Could not toggle advertisement');
      }
    } catch (e) {
      AppUtils.showToast(e.message || 'Error toggling advertisement');
    }
  },

  confirmDeleteAd(adId) {
    const ad = ((store.data && store.data.advertisements) || []).find(a => a.id === adId);
    const title = ad ? ad.title : 'this advertisement';

    AppUtils.showBottomSheet(`
      <div style="text-align:center; padding:16px 8px;">
        <div style="width:56px; height:56px; border-radius:50%; background:#FFEBEE; color:var(--color-error); display:flex; align-items:center; justify-content:center; margin:0 auto 12px auto;">
          <span class="material-symbols-rounded" style="font-size:28px;">delete_forever</span>
        </div>
        <h3 style="font-size:16px; font-weight:700; color:var(--color-text-primary); margin-bottom:6px;">Delete Advertisement?</h3>
        <p style="font-size:12px; color:var(--color-text-secondary); margin-bottom:16px;">
          Are you sure you want to permanently delete "<strong>${title}</strong>"?
        </p>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-outline" style="flex:1;" onclick="AppUtils.closeBottomSheet()">Cancel</button>
          <button class="btn btn-danger" style="flex:1; background:var(--color-error); color:#FFF; font-weight:700;" onclick="EntrepreneurModule.executeDeleteAd('${adId}')">
            Delete Permanently
          </button>
        </div>
      </div>
    `);
  },

  async executeDeleteAd(adId) {
    try {
      const res = await window.apiClient.deleteEntrepreneurAd(adId);
      AppUtils.closeBottomSheet();
      if (res && res.success) {
        AppUtils.showToast('Advertisement deleted successfully');
        const idx = ((store.data && store.data.advertisements) || []).findIndex(a => a.id === adId);
        if (idx !== -1) {
          store.data.advertisements.splice(idx, 1);
          store.saveData();
        }
        AppRouter.navigate('screen-ent-advertisements');
      } else {
        AppUtils.showToast((res && res.message) || 'Failed to delete advertisement');
      }
    } catch (e) {
      AppUtils.closeBottomSheet();
      AppUtils.showToast(e.message || 'Error deleting advertisement');
    }
  },

  previewAdInModal(adId) {
    const ent = this.getEntrepreneur();
    const ad = ((store.data && store.data.advertisements) || []).find(a => a.id === adId);
    if (!ad) return;

    AppUtils.showBottomSheet(`
      <div style="padding-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="font-size:15px; font-weight:700; color:var(--color-primary); margin:0;">
            👁️ Live Advertisement Preview
          </h3>
          <button class="icon-action-btn" onclick="AppUtils.closeBottomSheet()">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <div style="font-size:11px; color:var(--color-text-secondary); margin-bottom:12px;">
          Here is how your advertisement appears to shoppers on the platform:
        </div>

        <!-- Carousel Card -->
        <div style="background:linear-gradient(135deg, #4A6B32 0%, #223613 100%); border-radius:var(--radius-md); padding:14px; color:#FFF; position:relative; overflow:hidden; margin-bottom:14px; box-shadow:0 4px 12px rgba(0,0,0,0.12);">
          ${ad.imageUrl ? `
            <div style="position:absolute; right:0; top:0; width:45%; height:100%; opacity:0.85; pointer-events:none; display:flex; align-items:center; justify-content:center;">
              <img src="${ad.imageUrl}" alt="${ad.title}" style="width:100%; height:100%; object-fit:cover; border-radius:0 var(--radius-md) var(--radius-md) 0;" onerror="this.src='/uploads/banner_anita_cakes.svg'">
            </div>
          ` : ''}
          <div style="position:relative; z-index:2; max-width:${ad.imageUrl ? '65%' : '100%'};">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
              <span style="background:rgba(255,255,255,0.22); color:#FFF; font-size:10px; font-weight:700; padding:2px 8px; border-radius:var(--radius-full);">
                ${ad.discountText || ad.adType || 'FEATURED'}
              </span>
              <span style="font-size:10px; font-weight:600; color:#F4EBD9; background:rgba(0,0,0,0.3); padding:2px 8px; border-radius:var(--radius-full);">
                🏪 ${ent.businessName}
              </span>
            </div>
            <div style="font-size:14px; font-weight:700; line-height:1.3;">${ad.title}</div>
            <div style="font-size:11px; opacity:0.9; color:#F4EBD9; margin-top:3px; max-height:40px; overflow:hidden;">${ad.description}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:10px;">
              <span style="opacity:0.85; color:#F4EBD9;">
                ${ad.endDate ? `Valid till ${new Date(ad.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}` : 'Limited time deal'}
              </span>
              <span style="background:#FFF; color:#2E451E; font-weight:700; padding:4px 10px; border-radius:var(--radius-full);">
                ${ad.ctaText || 'Shop Now'} &gt;
              </span>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-block" onclick="AppUtils.closeBottomSheet()">
          Done
        </button>
      </div>
    `);
  }
};
