/* =====================================================================
   MANEYINDA MARUKATTE - ENTREPRENEUR MODULE
   Dashboard, Product Management, Orders, Earnings & Profile
===================================================================== */

const EntrepreneurModule = {
  currentFilter: 'all',
  earningsTimeFilter: 'month',
  activeProductModalId: null,
  dynamicCustomFields: [],

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
  openAddProduct() {
    this.activeProductModalId = null;
    this.dynamicCustomFields = [];
    AppRouter.navigate('screen-ent-add-product');
  },

  openEditProduct(productId) {
    this.activeProductModalId = productId;
    const p = store.getProductById(productId);
    if (!p) return;
    this.dynamicCustomFields = JSON.parse(JSON.stringify(p.customizationFields || []));
    AppRouter.navigate('screen-ent-add-product');
  },

  renderAddOrEditProduct() {
    const isEdit = !!this.activeProductModalId;
    const p = isEdit ? store.getProductById(this.activeProductModalId) : null;
    const cats = store.data.categories.filter(c => c.active);

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
        <!-- Images -->
        <div class="form-group">
          <label class="form-label">Product Images (Up to 5) <span class="req">*</span></label>
          <div style="display:flex; gap:8px; overflow-x:auto; padding:6px 0;">
            <div class="doc-upload-box" style="width:72px; height:72px; padding:0; display:flex; align-items:center; justify-content:center; flex-shrink:0;" onclick="AppUtils.showToast('Image uploaded!')">
              <span class="material-symbols-rounded" style="color:var(--color-primary); font-size:28px;">add_a_photo</span>
            </div>
            <img src="${p ? p.images[0] : 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300'}" style="width:72px; height:72px; border-radius:var(--radius-md); object-fit:cover;">
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
    const cat = document.getElementById('prod-form-category').value;
    input.value = AppAI.improveProductTitle(input.value, cat);
    AppUtils.showToast('✨ Title improved by AI!');
  },

  aiSuggestPrice() {
    const cat = document.getElementById('prod-form-category').value;
    const name = document.getElementById('prod-form-name').value;
    const input = document.getElementById('prod-form-price');
    input.value = AppAI.suggestProductPrice(cat, name);
    AppUtils.showToast('🤖 Price suggested based on market data!');
  },

  aiGenerateDesc() {
    const title = document.getElementById('prod-form-name').value;
    const cat = document.getElementById('prod-form-category').value;
    const desc = document.getElementById('prod-form-desc');
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
      images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'],
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
      AppUtils.showToast('✅ Product Updated Successfully');
    } else {
      store.addProduct(prodPayload);
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
    store.updateOrderStatus(orderId, nextStatus);
    AppUtils.showToast(`Order status updated to "${nextStatus}"`);
    AppRouter.renderActiveScreen();
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

          <!-- Switch to Customer if user is Both -->
          ${store.getUser().role === 'both' ? `
            <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-top:1px solid #F0EEE4; cursor:pointer; background:#F5F9EE;" onclick="store.setRole('customer'); AppRouter.navigate('screen-customer-home');">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="material-symbols-rounded" style="color:var(--color-primary);">sync_alt</span>
                <span style="font-size:13px; font-weight:700; color:var(--color-primary);">🔄 Switch to Customer View</span>
              </div>
              <span class="material-symbols-rounded" style="color:var(--color-primary);">chevron_right</span>
            </div>
          ` : ''}

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
  }
};
