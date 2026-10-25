/* =====================================================================
   MANEYINDA MARUKATTE - CUSTOMER MODULE
   Home, Search, Product Details, Wishlist, Cart, Checkout,
   Address Book, Orders, Reviews, Notifications & AI Guide
===================================================================== */

const CustomerModule = {
  activeSearchQuery: '',
  searchFilterCategory: 'all',
  selectedCartItemKeys: [], // Format: "productId|customizationHash"
  selectedOrderTab: 'active',
  carouselActiveIndex: 0,
  activeDetailQty: 1,
  activeDetailCustomization: {},

  // -------------------------------------------------------------
  // SCREEN 1: CUSTOMER HOME
  // -------------------------------------------------------------
  renderHome() {
    const user = store.getUser();
    const selAddr = store.getSelectedAddress();
    const unreadCount = store.getUnreadNotificationsCount(user.id, 'customer');
    const wishlistCount = store.getWishlist().length;
    const popularProducts = store.getProducts({ activeOnly: true });
    const trendingProducts = AppAI.calculateTrendingProducts(popularProducts, store.getOrders(), '7days');

    return `
      <!-- Home Header -->
      <div class="home-header-bar">
        <div class="home-greeting-wrap">
          <span class="home-user-name">👋 ${(window.AppLang && AppLang.t('welcome')) || 'Welcome'}, ${user.name ? user.name.split(' ')[0] : 'Customer'}</span>
          <button class="delivery-location-btn" onclick="CustomerModule.openLocationBottomSheet()">
            <span class="material-symbols-rounded" style="font-size:16px;">location_on</span>
            <span>${(window.AppLang && AppLang.t('deliverTo')) || 'Deliver to:'} <strong>${selAddr ? selAddr.label : 'Select Location'}</strong></span>
            <span class="material-symbols-rounded" style="font-size:16px;">expand_more</span>
          </button>
        </div>

        <div style="display:flex; align-items:center; gap:4px;">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-wishlist')">
            <span class="material-symbols-rounded">favorite</span>
            ${wishlistCount > 0 ? `<span class="badge-counter">${wishlistCount}</span>` : ''}
          </button>
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-notifications')">
            <span class="material-symbols-rounded">notifications</span>
            ${unreadCount > 0 ? `<span class="badge-counter">${unreadCount}</span>` : ''}
          </button>
        </div>
      </div>

      <!-- Search Bar Trigger -->
      <div class="search-bar-trigger" onclick="AppRouter.navigate('screen-customer-search')">
        <span class="material-symbols-rounded" style="color:var(--color-primary); font-size:20px;">search</span>
        <span>${(window.AppLang && AppLang.t('searchPlaceholder')) || 'Search Products, Stores or Categories...'}</span>
      </div>

      <div class="screen-content" style="padding-top:0; padding-bottom:70px;">
        <!-- Categories Quick Horizontal List -->
        <div class="filter-chip-row" style="margin-bottom:6px;">
          ${store.data.categories.filter(c => c.active).map(cat => `
            <button class="filter-chip" onclick="CustomerModule.viewCategoryListing('${cat.name}')">
              <span class="material-symbols-rounded" style="font-size:15px; vertical-align:middle; margin-right:4px;">${cat.icon || 'category'}</span>
              ${(window.AppLang && AppLang.tCategory(cat.name)) || cat.name}
            </button>
          `).join('')}
        </div>

        <!-- Section: Popular Products (Horizontally Scrollable, NO View All) -->
        <div class="section-header-row">
          <h3 class="section-header-title">
            <span class="material-symbols-rounded" style="color:var(--color-accent); font-size:20px;">local_fire_department</span>
            ${(window.AppLang && AppLang.t('popularProducts')) || '🔥 Popular Products'}
          </h3>
        </div>

        ${popularProducts.length === 0 ? `
          <div class="empty-state" style="padding:24px 0;">
            <span class="material-symbols-rounded empty-state-icon">storefront</span>
            <div class="empty-state-title">No Products Available Yet</div>
            <div class="empty-state-desc">Products from local entrepreneurs will appear here soon.</div>
          </div>
        ` : `
          <div class="horizontal-product-track">
            ${popularProducts.map(p => this.renderProductCard(p)).join('')}
          </div>
        `}

        <!-- Section: Trending This Week (Data-Driven AI Algorithm) -->
        <div class="section-header-row" style="margin-top:20px;">
          <h3 class="section-header-title">
            <span class="material-symbols-rounded" style="color:var(--color-primary); font-size:20px;">trending_up</span>
            ${(window.AppLang && AppLang.t('trendingThisWeek')) || '🔥 Trending This Week'}
          </h3>
        </div>

        <div class="two-column-product-grid">
          ${trendingProducts.slice(0, 4).map(p => this.renderProductCard(p, true)).join('')}
        </div>
      </div>

      ${this.renderBottomNav('home')}
    `;
  },

  renderProductCard(p, showTrend = false) {
    const isSaved = store.isInWishlist(p.id);
    return `
      <div class="product-card" onclick="CustomerModule.viewProductDetails('${p.id}')" style="cursor:pointer;">
        <div class="product-thumb-wrap">
          <img src="${p.images[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300'}" alt="${p.name}">
          <button class="product-wishlist-btn ${isSaved ? 'active' : ''}" onclick="event.stopPropagation(); CustomerModule.toggleWishlist('${p.id}', this)">
            <span class="material-symbols-rounded ${isSaved ? 'icon-filled' : 'icon-outlined'}" style="font-size:18px;">favorite</span>
          </button>
          ${showTrend && p.trendGrowth ? `
            <span style="position:absolute; bottom:6px; left:6px; background:rgba(54,91,31,0.85); color:#fff; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px;">
              ${p.trendGrowth}
            </span>
          ` : ''}
        </div>

        <div class="product-info-wrap">
          <h4 class="product-title">${p.name}</h4>
          
          <div class="product-store-row" onclick="event.stopPropagation(); CustomerModule.viewPublicStore('${p.entrepreneurId}')">
            <span>${p.storeName}</span>
            <span class="material-symbols-rounded verified-badge">check_circle</span>
          </div>

          <div class="product-price-row">
            <div>
              <div class="product-price">₹${p.price}</div>
              <div class="product-rating-badge">
                <span class="material-symbols-rounded" style="font-size:14px; color:var(--color-accent);">star</span>
                ${p.rating || 4.8}
              </div>
            </div>

            <button class="btn-add-cart-mini" onclick="event.stopPropagation(); CustomerModule.quickAddToCart('${p.id}')">
              <span class="material-symbols-rounded" style="font-size:18px;">add_shopping_cart</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  toggleWishlist(productId, btn) {
    const added = store.toggleWishlist(productId);
    if (btn) {
      btn.classList.toggle('active', added);
      const icon = btn.querySelector('.material-symbols-rounded');
      if (icon) {
        icon.className = `material-symbols-rounded ${added ? 'icon-filled' : 'icon-outlined'}`;
      }
    }
    AppUtils.showToast(added ? 'Saved to Wishlist' : 'Removed from Wishlist');
  },

  quickAddToCart(productId) {
    const res = store.addToCart(productId, 1, {});
    if (res.success) {
      AppUtils.showToast('Added to Cart!');
    }
  },

  viewProductDetails(productId) {
    this.carouselActiveIndex = 0;
    this.activeDetailQty = 1;
    this.activeDetailCustomization = {};
    AppRouter.navigate('screen-customer-product-details', { productId });
  },

  viewPublicStore(entrepreneurId) {
    AppRouter.navigate('screen-public-store', { entrepreneurId });
  },

  viewCategoryListing(categoryName) {
    AppRouter.navigate('screen-category-listing', { category: categoryName });
  },

  // -------------------------------------------------------------
  // DELIVERY LOCATION BOTTOM SHEET
  // -------------------------------------------------------------
  openLocationBottomSheet() {
    const addresses = store.getAddresses();
    const selId = store.getUser().selectedAddressId;

    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin-bottom:12px;">
        📍 Select Delivery Location
      </h3>

      <div style="display:flex; flex-direction:column; gap:10px;">
        <!-- Use Current Location -->
        <div class="card card-clickable" style="padding:12px; display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="CustomerModule.useCurrentDeviceLocation()">
          <span class="material-symbols-rounded" style="color:var(--color-secondary);">my_location</span>
          <div style="flex:1;">
            <div style="font-size:13px; font-weight:600; color:var(--color-text-primary);">Use Current Location</div>
            <div style="font-size:11px; color:var(--color-text-tertiary);">Using GPS coordinates</div>
          </div>
        </div>

        <div style="font-size:12px; font-weight:700; color:var(--color-text-secondary); margin-top:4px;">
          Saved Addresses:
        </div>

        ${addresses.map(a => `
          <div class="selectable-card ${a.id === selId ? 'selected' : ''}" style="padding:12px; margin:0;" onclick="CustomerModule.selectDeliveryAddress('${a.id}')">
            <div class="selection-radio">${a.id === selId ? '<span class="material-symbols-rounded" style="font-size:14px;">check</span>' : ''}</div>
            <div style="flex:1;">
              <div style="font-size:13px; font-weight:700; color:var(--color-text-primary);">${a.label}</div>
              <div style="font-size:11px; color:var(--color-text-secondary); line-height:1.3; margin-top:2px;">
                ${a.door}, ${a.street}, ${a.area}, ${a.city} - ${a.pincode}
              </div>
            </div>
          </div>
        `).join('')}

        <button class="btn btn-outline btn-block" onclick="AppUtils.closeBottomSheet(); AppRouter.navigate('screen-customer-address-book');">
          ➕ Add New Address
        </button>
      </div>
    `);
  },

  selectDeliveryAddress(addressId) {
    store.setSelectedAddress(addressId);
    AppUtils.closeBottomSheet();
    AppUtils.showToast('Delivery location updated');
    AppRouter.renderActiveScreen();
  },

  useCurrentDeviceLocation() {
    AppUtils.closeBottomSheet();
    AppUtils.showToast('Location detected: Malleshwaram, Bangalore');
  },

  // -------------------------------------------------------------
  // SCREEN 2: SEARCH
  // -------------------------------------------------------------
  renderSearch() {
    const q = this.activeSearchQuery.toLowerCase().trim();
    const recent = store.data.recentSearches || [];

    // Filter matching products, stores, categories
    const allProds = store.getProducts({ activeOnly: true });
    const allStores = store.getEntrepreneurs().filter(e => e.status === 'approved');
    const allCats = store.data.categories.filter(c => c.active);

    const matchingProds = q ? allProds.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) : [];
    const matchingStores = q ? allStores.filter(s => s.businessName.toLowerCase().includes(q) || s.businessCategory.toLowerCase().includes(q)) : [];
    const matchingCats = q ? allCats.filter(c => c.name.toLowerCase().includes(q)) : [];

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-home')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Search</span>
        </div>
        <button class="icon-action-btn" onclick="CustomerModule.openSearchFilterModal()">
          <span class="material-symbols-rounded">tune</span>
        </button>
      </div>

      <div class="screen-content" style="padding-top: 10px;">
        <div class="input-with-icon" style="margin-bottom:16px;">
          <span class="material-symbols-rounded input-icon-left">search</span>
          <input type="text" id="main-search-input" class="form-input" placeholder="Search Products, Stores or Categories..." value="${this.activeSearchQuery}" oninput="CustomerModule.onSearchInput(this.value)">
          ${this.activeSearchQuery ? `
            <button class="input-icon-right" onclick="CustomerModule.clearSearchInput()">
              <span class="material-symbols-rounded">close</span>
            </button>
          ` : ''}
        </div>

        ${!q ? `
          <!-- Recent Searches Section -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:13px; font-weight:700; color:var(--color-text-primary);">Recent Searches</span>
            <button class="btn btn-text btn-sm" onclick="CustomerModule.clearAllRecentSearches()">Clear All</button>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
            ${recent.map((item, i) => `
              <div style="display:flex; justify-content:space-between; align-items:center; background:var(--color-surface); padding:8px 12px; border-radius:var(--radius-md); border:1px solid var(--color-border);">
                <div style="display:flex; align-items:center; gap:8px; cursor:pointer;" onclick="CustomerModule.onSearchInput('${item}')">
                  <span class="material-symbols-rounded" style="font-size:18px; color:var(--color-text-tertiary);">history</span>
                  <span style="font-size:13px; color:var(--color-text-primary);">${item}</span>
                </div>
                <button class="icon-action-btn" style="width:28px; height:28px;" onclick="CustomerModule.removeRecentSearch(${i})">
                  <span class="material-symbols-rounded" style="font-size:16px;">close</span>
                </button>
              </div>
            `).join('')}
          </div>
        ` : `
          <!-- Search Results Grouped -->
          <div style="display:flex; flex-direction:column; gap:16px; padding-bottom:40px;">
            <!-- Categories matches -->
            ${matchingCats.length > 0 ? `
              <div>
                <span style="font-size:12px; font-weight:700; color:var(--color-text-tertiary); text-transform:uppercase;">Categories</span>
                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
                  ${matchingCats.map(c => `
                    <button class="filter-chip" onclick="CustomerModule.viewCategoryListing('${c.name}')">
                      ${c.name}
                    </button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Stores matches -->
            ${matchingStores.length > 0 ? `
              <div>
                <span style="font-size:12px; font-weight:700; color:var(--color-text-tertiary); text-transform:uppercase;">Stores</span>
                <div style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">
                  ${matchingStores.map(s => `
                    <div class="card card-clickable" style="padding:10px 14px; display:flex; align-items:center; justify-content:space-between; cursor:pointer;" onclick="CustomerModule.viewPublicStore('${s.id}')">
                      <div style="display:flex; align-items:center; gap:10px;">
                        <span class="material-symbols-rounded" style="color:var(--color-primary);">storefront</span>
                        <div>
                          <div style="font-size:13px; font-weight:700; color:var(--color-text-primary); display:flex; align-items:center; gap:4px;">
                            ${s.businessName}
                            <span class="material-symbols-rounded verified-badge">check_circle</span>
                          </div>
                          <span style="font-size:11px; color:var(--color-text-secondary);">${s.businessCategory} • ${s.address.area}</span>
                        </div>
                      </div>
                      <span class="material-symbols-rounded" style="color:var(--color-text-tertiary);">chevron_right</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Products matches -->
            <div>
              <span style="font-size:12px; font-weight:700; color:var(--color-text-tertiary); text-transform:uppercase;">
                Products (${matchingProds.length})
              </span>
              ${matchingProds.length === 0 ? `
                <div style="font-size:13px; color:var(--color-text-secondary); padding:16px 0;">No matching products found.</div>
              ` : `
                <div class="two-column-product-grid" style="margin-top:8px;">
                  ${matchingProds.map(p => this.renderProductCard(p)).join('')}
                </div>
              `}
            </div>
          </div>
        `}
      </div>
    `;
  },

  onSearchInput(val) {
    this.activeSearchQuery = val;
    AppRouter.renderActiveScreen();
    const input = document.getElementById('main-search-input');
    if (input) {
      input.focus();
      input.setSelectionRange(val.length, val.length);
    }
  },

  clearSearchInput() {
    this.activeSearchQuery = '';
    AppRouter.renderActiveScreen();
  },

  clearAllRecentSearches() {
    store.data.recentSearches = [];
    store.saveData();
    AppRouter.renderActiveScreen();
  },

  removeRecentSearch(idx) {
    store.data.recentSearches.splice(idx, 1);
    store.saveData();
    AppRouter.renderActiveScreen();
  },

  openSearchFilterModal() {
    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin-bottom:12px;">Filter Results</h3>
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-select">
          <option value="all">All Categories</option>
          ${store.data.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Price Range</label>
        <select class="form-select">
          <option value="any">Any Price</option>
          <option value="under200">Under ₹200</option>
          <option value="200-500">₹200 - ₹500</option>
          <option value="above500">Above ₹500</option>
        </select>
      </div>
      <button class="btn btn-primary btn-block" onclick="AppUtils.closeBottomSheet(); AppUtils.showToast('Filters applied');">
        Apply Filters
      </button>
    `);
  },

  // -------------------------------------------------------------
  // SCREEN 3: PRODUCT DETAILS
  // -------------------------------------------------------------
  renderProductDetails(params) {
    const p = store.getProductById(params.productId);
    if (!p) return `<div class="screen-content">Product not found</div>`;

    const isSaved = store.isInWishlist(p.id);
    const ent = store.getEntrepreneurById(p.entrepreneurId);
    const isStoreOpen = ent ? ent.isStoreOpen : true;
    const relatedProducts = store.getProducts({ activeOnly: true }).filter(item => item.id !== p.id && item.category === p.category);
    const reviews = store.getReviewsForProduct(p.id);

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-home')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Product Details</span>
        </div>
        <div style="display:flex; align-items:center; gap:4px;">
          <button class="icon-action-btn ${isSaved ? 'active' : ''}" onclick="CustomerModule.toggleWishlist('${p.id}', this)">
            <span class="material-symbols-rounded ${isSaved ? 'icon-filled' : 'icon-outlined'}" style="color:${isSaved ? '#D32F2F' : 'inherit'};">favorite</span>
          </button>
          <button class="icon-action-btn" onclick="CustomerModule.openReportModal('${p.id}')">
            <span class="material-symbols-rounded">flag</span>
          </button>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 6px; padding-bottom: 90px;">
        <!-- Image Carousel -->
        <div class="product-carousel-wrap">
          <img src="${p.images[this.carouselActiveIndex] || p.images[0]}" class="carousel-slide-img" alt="${p.name}">
          ${p.images.length > 1 ? `
            <div class="carousel-indicator-dots">
              ${p.images.map((_, idx) => `
                <div class="carousel-dot ${idx === this.carouselActiveIndex ? 'active' : ''}" onclick="CustomerModule.setCarouselIndex(${idx})"></div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Store Closed Warning if Entrepreneur closed shop -->
        ${!isStoreOpen ? `
          <div style="background:#FFF3E0; border:1.5px solid #FFB74D; border-radius:var(--radius-md); padding:10px 14px; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            <span class="material-symbols-rounded" style="color:var(--color-warning);">store_mall_directory</span>
            <div>
              <div style="font-size:12px; font-weight:700; color:#E65100;">🟠 Store Closed</div>
              <div style="font-size:11px; color:var(--color-text-secondary);">${(ent && ent.openingSchedule) || 'Orders are currently unavailable.'}</div>
            </div>
          </div>
        ` : ''}

        <!-- Product Name & Price -->
        <h2 style="font-size:18px; font-weight:700; color:var(--color-text-primary); line-height:1.35; margin-bottom:6px;">
          ${p.name}
        </h2>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="font-size:24px; font-weight:700; color:var(--color-primary);">
            ₹${p.price}
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="status-chip ${p.stock > 0 ? 'chip-delivered' : 'chip-cancelled'}">
              ${p.stock > 0 ? '🟢 In Stock' : '🔴 Out of Stock'}
            </span>
            <div class="product-rating-badge" style="font-size:13px;">
              <span class="material-symbols-rounded" style="font-size:16px; color:var(--color-accent);">star</span>
              ${p.rating} (${p.reviewCount} Reviews)
            </div>
          </div>
        </div>

        <!-- Product Attributes Chips -->
        ${p.attributes && p.attributes.length > 0 ? `
          <div style="margin-bottom:14px;">
            ${p.attributes.map(att => `<span class="product-detail-badge-pill">🌿 ${att}</span>`).join('')}
          </div>
        ` : ''}

        <!-- Sold By Banner -->
        <div class="seller-info-banner">
          <div class="seller-name-row">
            <span class="material-symbols-rounded" style="color:var(--color-primary); font-size:26px;">storefront</span>
            <div>
              <span style="font-size:11px; color:var(--color-text-secondary);">Sold by</span>
              <div style="font-size:13px; font-weight:700; color:var(--color-text-primary); display:flex; align-items:center; gap:4px;">
                ${p.storeName}
                <span class="material-symbols-rounded verified-badge">check_circle</span>
              </div>
            </div>
          </div>
          <button class="btn btn-sm btn-outline" onclick="CustomerModule.viewPublicStore('${p.entrepreneurId}')">
            View Store →
          </button>
        </div>

        <!-- Quantity Stepper -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:12px 14px; margin-bottom:14px;">
          <span style="font-size:13px; font-weight:600; color:var(--color-text-primary);">Quantity</span>
          <div class="quantity-stepper">
            <button class="stepper-btn" onclick="CustomerModule.adjustDetailQty(-1, ${p.stock})">-</button>
            <span class="stepper-value" id="detail-qty-val">${this.activeDetailQty}</span>
            <button class="stepper-btn" onclick="CustomerModule.adjustDetailQty(1, ${p.stock})">+</button>
          </div>
        </div>

        <!-- Dynamic Customization Options Configured by Entrepreneur -->
        ${p.customizationFields && p.customizationFields.length > 0 ? `
          <div class="card" style="padding:14px; margin-bottom:14px;">
            <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:10px;">
              🛠 Customization Options
            </h4>
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${p.customizationFields.map((f, idx) => `
                <div class="form-group" style="margin-bottom:0;">
                  <label class="form-label">${f.name} ${f.required ? '<span class="req">*</span>' : ''}</label>
                  ${f.type === 'select' ? `
                    <select class="form-select custom-field-input" data-field="${f.name}" onchange="CustomerModule.onCustomFieldChange('${f.name}', this.value)">
                      <option value="">Select ${f.name}</option>
                      ${f.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                  ` : `
                    <input type="text" class="form-input custom-field-input" data-field="${f.name}" placeholder="${f.placeholder || 'Enter ' + f.name}" oninput="CustomerModule.onCustomFieldChange('${f.name}', this.value)">
                  `}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Delivery Information Configured by Entrepreneur -->
        <div class="card" style="padding:14px; margin-bottom:14px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">
            📍 Delivery Information
          </h4>
          <div style="font-size:12px; color:var(--color-text-secondary); margin-bottom:8px;">
            Deliver to: <strong>${(store.getSelectedAddress() && store.getSelectedAddress().label) || 'Home'}</strong>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; font-size:12px;">
            ${(p.deliveryMethod && p.deliveryMethod.homeDelivery) ? `
              <div style="display:flex; align-items:center; gap:6px; color:var(--color-primary); font-weight:600;">
                <span class="material-symbols-rounded" style="font-size:18px;">local_shipping</span>
                Home Delivery: ₹${p.deliveryMethod.deliveryCharge || 30} • Estimated: ${p.deliveryMethod.estimatedDelivery || 'Today before 5:30 PM'}
              </div>
            ` : ''}
            ${(p.deliveryMethod && p.deliveryMethod.pickup) ? `
              <div style="display:flex; align-items:center; gap:6px; color:var(--color-secondary); font-weight:600;">
                <span class="material-symbols-rounded" style="font-size:18px;">store</span>
                🏪 Pickup Available (No delivery charge)
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Description -->
        <div class="card" style="padding:14px; margin-bottom:14px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:6px;">Description</h4>
          <p style="font-size:13px; color:var(--color-text-secondary); line-height:1.5;">
            ${p.description}
          </p>
        </div>

        <!-- Specifications -->
        ${p.specifications && Object.keys(p.specifications).length > 0 ? `
          <div class="card" style="padding:14px; margin-bottom:14px;">
            <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">Specifications</h4>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:12px;">
              ${Object.entries(p.specifications).map(([k, v]) => `
                <div><span style="color:var(--color-text-tertiary);">${k}:</span> <strong>${v}</strong></div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- After-Sales Support Box -->
        <div class="after-sales-box">
          <div class="after-sales-title">
            <span class="material-symbols-rounded">verified_user</span>
            After-Sales Support
          </div>
          <div class="after-sales-grid">
            <div class="after-sales-item">
              <span class="material-symbols-rounded" style="font-size:16px; color:var(--color-primary);">
                ${(p.afterSales && p.afterSales.type.indexOf('Replacement') !== -1) ? 'check_circle' : 'cancel'}
              </span>
              <span>Replacement: <strong>${(p.afterSales && p.afterSales.type.indexOf('Replacement') !== -1) ? 'Available' : 'No'}</strong></span>
            </div>
            <div class="after-sales-item">
              <span class="material-symbols-rounded" style="font-size:16px; color:var(--color-primary);">
                ${(p.afterSales && p.afterSales.type.indexOf('Return') !== -1) ? 'check_circle' : 'cancel'}
              </span>
              <span>Refund: <strong>${(p.afterSales && p.afterSales.type.indexOf('Return') !== -1) ? 'Available' : 'No'}</strong></span>
            </div>
            <div class="after-sales-item">
              <span class="material-symbols-rounded" style="font-size:16px; color:var(--color-secondary);">assignment_return</span>
              <span>Return Required: <strong>${(p.afterSales && p.afterSales.returnRequired) ? 'Yes' : 'No'}</strong></span>
            </div>
            <div class="after-sales-item">
              <span class="material-symbols-rounded" style="font-size:16px; color:var(--color-secondary);">schedule</span>
              <span>Window: <strong>${(p.afterSales && p.afterSales.supportWindow) || '3 Days'}</strong></span>
            </div>
          </div>
        </div>

        <!-- Verified Reviews Section -->
        <div class="card" style="padding:14px; margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h4 style="font-size:13px; font-weight:700; color:var(--color-primary);">Customer Reviews (${reviews.length})</h4>
            <span style="font-size:12px; font-weight:700; color:var(--color-text-accent);">⭐ ${p.rating} / 5</span>
          </div>

          ${reviews.length === 0 ? `
            <p style="font-size:12px; color:var(--color-text-tertiary); font-style:italic;">No customer reviews yet. Be the first verified buyer to review!</p>
          ` : `
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${reviews.slice(0, 2).map(r => `
                <div style="border-bottom:1px solid #F0EEE4; padding-bottom:8px;">
                  <div style="display:flex; justify-content:space-between; font-size:12px;">
                    <strong>${r.customerName}</strong>
                    <span style="color:var(--color-accent); font-weight:700;">⭐ ${r.rating}</span>
                  </div>
                  <p style="font-size:11px; color:var(--color-text-secondary); margin-top:2px;">"${r.comment}"</p>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- You May Also Like Section -->
        ${relatedProducts.length > 0 ? `
          <div class="section-header-row" style="margin-top:14px;">
            <h3 class="section-header-title">You May Also Like</h3>
          </div>
          <div class="two-column-product-grid">
            ${relatedProducts.slice(0, 2).map(rp => this.renderProductCard(rp)).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Fixed Bottom Purchase Actions -->
      <div class="fixed-bottom-action">
        <div style="display:flex; gap:10px;">
          <button class="btn btn-secondary" style="flex:1;" onclick="CustomerModule.handleAddToCart('${p.id}', false)" ${!isStoreOpen ? 'disabled' : ''}>
            <span class="material-symbols-rounded">add_shopping_cart</span>
            Add to Cart
          </button>
          <button class="btn btn-primary" style="flex:1;" onclick="CustomerModule.handleAddToCart('${p.id}', true)" ${!isStoreOpen ? 'disabled' : ''}>
            <span class="material-symbols-rounded">bolt</span>
            Buy Now
          </button>
        </div>
      </div>
    `;
  },

  setCarouselIndex(idx) {
    this.carouselActiveIndex = idx;
    AppRouter.renderActiveScreen();
  },

  adjustDetailQty(delta, stock) {
    let next = this.activeDetailQty + delta;
    if (next < 1) next = 1;
    if (next > stock) {
      AppUtils.showToast(`Only ${stock} items in stock.`);
      return;
    }
    this.activeDetailQty = next;
    const el = document.getElementById('detail-qty-val');
    if (el) el.textContent = next;
  },

  onCustomFieldChange(fieldName, val) {
    this.activeDetailCustomization[fieldName] = val;
  },

  handleAddToCart(productId, buyNow = false) {
    const p = store.getProductById(productId);
    if (!p) return;

    // Validate required custom fields
    if (p.customizationFields && p.customizationFields.length > 0) {
      for (const f of p.customizationFields) {
        if (f.required && !this.activeDetailCustomization[f.name]) {
          AppUtils.showToast(`Please select/enter "${f.name}" before proceeding.`);
          return;
        }
      }
    }

    const res = store.addToCart(productId, this.activeDetailQty, this.activeDetailCustomization);
    if (res.success) {
      if (buyNow) {
        AppRouter.navigate('screen-customer-checkout', { directProductId: productId });
      } else {
        AppUtils.showToast(`Added ${this.activeDetailQty} to Cart!`);
      }
    }
  },

  openReportModal(productId) {
    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-error); margin-bottom:8px;">
        🚩 Report Product
      </h3>
      <p style="font-size:12px; color:var(--color-text-secondary); margin-bottom:12px;">
        Help keep Maneyinda Marukatte safe and trustworthy. Reports are audited directly by our Admin.
      </p>
      <div class="form-group">
        <label class="form-label">Reason for Report</label>
        <select id="report-reason-sel" class="form-select">
          <option value="Inappropriate Content">Inappropriate Content</option>
          <option value="Misleading Information">Misleading Information</option>
          <option value="Prohibited Item">Prohibited Item</option>
          <option value="Wrong Category">Wrong Category</option>
          <option value="Other Policy Violation">Other Policy Violation</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Description (Optional)</label>
        <textarea id="report-desc-input" class="form-textarea" placeholder="Provide any details..."></textarea>
      </div>
      <button class="btn btn-danger btn-block" onclick="CustomerModule.submitProductReport('${productId}')">
        Submit Report to Admin
      </button>
    `);
  },

  submitProductReport(productId) {
    const p = store.getProductById(productId);
    const reason = document.getElementById('report-reason-sel').value;
    if (p) {
      p.reportsCount = (p.reportsCount || 0) + 1;
      store.data.reportedProducts.push({
        productId: p.id,
        productName: p.name,
        storeName: p.storeName,
        reportsCount: p.reportsCount,
        reason,
        status: 'reported',
        adminActionReason: ''
      });
      store.addActivityLog(`Customer reported product: ${p.name} (${reason})`);
      store.saveData();
    }
    AppUtils.closeBottomSheet();
    AppUtils.showToast('Report submitted for Admin review.');
  },

  // -------------------------------------------------------------
  // REUSABLE PUBLIC ENTREPRENEUR STORE SCREEN
  // -------------------------------------------------------------
  renderPublicStore(params) {
    const ent = store.getEntrepreneurById(params.entrepreneurId);
    if (!ent) return `<div class="screen-content">Store not found</div>`;

    const products = store.getProducts({ entrepreneurId: ent.id, activeOnly: true });

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-home')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">${ent.businessName}</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 70px;">
        <!-- Store Banner -->
        <div class="card" style="padding:16px; margin-bottom:14px; text-align:center;">
          <div style="width:64px; height:64px; border-radius:50%; background:var(--color-soft-yellow); color:var(--color-primary); display:flex; align-items:center; justify-content:center; margin:0 auto 10px auto;">
            <span class="material-symbols-rounded" style="font-size:36px;">storefront</span>
          </div>

          <h3 style="font-size:18px; font-weight:700; color:var(--color-text-primary); display:flex; align-items:center; justify-content:center; gap:6px;">
            ${ent.businessName}
            <span class="material-symbols-rounded verified-badge">check_circle</span>
          </h3>

          <div style="font-size:12px; color:var(--color-text-secondary); margin-top:2px;">
            Owned by <strong>${ent.name}</strong> • ${ent.businessCategory}
          </div>

          <div style="margin:8px 0; display:flex; justify-content:center; gap:8px;">
            <span class="chip-badge" style="font-size:11px; padding:3px 10px;">⭐ ${ent.badge || 'Verified Seller'}</span>
            <span class="status-chip ${ent.isStoreOpen ? 'chip-delivered' : 'chip-warning'}" style="font-size:11px; padding:3px 10px;">
              ${ent.isStoreOpen ? '🟢 Open Now' : '🟠 Store Closed'}
            </span>
          </div>

          <p style="font-size:12px; color:var(--color-text-secondary); line-height:1.45; margin-top:8px;">
            "${ent.about || 'Homemade local products prepared with utmost care.'}"
          </p>
        </div>

        <h4 style="font-size:14px; font-weight:700; color:var(--color-text-primary); margin-bottom:10px;">
          Products from this Entrepreneur (${products.length})
        </h4>

        <div class="two-column-product-grid">
          ${products.map(p => this.renderProductCard(p)).join('')}
        </div>
      </div>

      ${this.renderBottomNav('home')}
    `;
  },

  // -------------------------------------------------------------
  // REUSABLE CATEGORY PRODUCT LISTING SCREEN
  // -------------------------------------------------------------
  renderCategoryListing(params) {
    const cat = params.category;
    const prods = store.getProducts({ category: cat, activeOnly: true });

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-home')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">${cat}</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 70px;">
        <div style="font-size:13px; color:var(--color-text-secondary); margin-bottom:14px;">
          Showing ${prods.length} homemade products in <strong>${cat}</strong>
        </div>

        ${prods.length === 0 ? `
          <div class="empty-state">
            <span class="material-symbols-rounded empty-state-icon">inventory_2</span>
            <div class="empty-state-title">No products in this category</div>
            <div class="empty-state-desc">Local entrepreneurs will be adding items here soon.</div>
          </div>
        ` : `
          <div class="two-column-product-grid">
            ${prods.map(p => this.renderProductCard(p)).join('')}
          </div>
        `}
      </div>

      ${this.renderBottomNav('home')}
    `;
  },

  // -------------------------------------------------------------
  // SCREEN: CUSTOMER WISHLIST MODULE
  // -------------------------------------------------------------
  renderWishlist() {
    const list = store.getWishlist();
    const prods = list.map(id => store.getProductById(id)).filter(Boolean);

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-home')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">❤️ My Wishlist</span>
        </div>
        <span style="font-size:12px; font-weight:600; color:var(--color-primary);">${prods.length} Items</span>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 70px;">
        ${prods.length === 0 ? `
          <div class="empty-state" style="padding-top:60px;">
            <div style="font-size:48px; margin-bottom:8px;">💔</div>
            <div class="empty-state-title">Your Wishlist is Empty</div>
            <div class="empty-state-desc">Save products you like for later.</div>
            <button class="btn btn-primary" onclick="AppRouter.navigate('screen-customer-home')" style="margin-top:16px;">
              Continue Shopping
            </button>
          </div>
        ` : `
          <div class="two-column-product-grid">
            ${prods.map(p => this.renderProductCard(p)).join('')}
          </div>
        `}
      </div>

      ${this.renderBottomNav('home')}
    `;
  },

  // -------------------------------------------------------------
  // SCREEN: CUSTOMER CART MODULE (FROZEN 1-ENTREPRENEUR RULE)
  // -------------------------------------------------------------
  renderCart() {
    const cart = store.getCart();
    const count = store.getCartCount();

    // Group items by entrepreneur/store
    const storeGroups = {};
    cart.forEach(item => {
      const p = store.getProductById(item.productId);
      if (!p) return;
      if (!storeGroups[p.entrepreneurId]) {
        storeGroups[p.entrepreneurId] = {
          storeName: p.storeName,
          entrepreneurId: p.entrepreneurId,
          deliveryInfo: p.deliveryMethod,
          items: []
        };
      }
      storeGroups[p.entrepreneurId].items.push({ ...item, product: p });
    });

    // Default selection: if none selected, auto-select all items of the FIRST entrepreneur
    if (this.selectedCartItemKeys.length === 0 && Object.keys(storeGroups).length > 0) {
      const firstEntId = Object.keys(storeGroups)[0];
      this.selectedCartItemKeys = storeGroups[firstEntId].items.map(i => `${i.productId}|${JSON.stringify(i.customization || {})}`);
    }

    // Calculate Order Summary for selected items
    let selectedSubtotal = 0;
    let selectedDelivery = 0;
    let activeEntrepreneurId = null;

    cart.forEach(item => {
      const key = `${item.productId}|${JSON.stringify(item.customization || {})}`;
      if (this.selectedCartItemKeys.includes(key)) {
        const p = store.getProductById(item.productId);
        if (p) {
          selectedSubtotal += p.price * item.qty;
          activeEntrepreneurId = p.entrepreneurId;
          selectedDelivery = (p.deliveryMethod && p.deliveryMethod.homeDelivery) ? (p.deliveryMethod.deliveryCharge || 30) : 0;
        }
      }
    });

    const grandTotal = selectedSubtotal + selectedDelivery;
    const canCheckout = this.selectedCartItemKeys.length > 0 && selectedSubtotal > 0;

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-home')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">My Cart</span>
        </div>
        <span style="font-size:12px; font-weight:600; color:var(--color-primary);">${count} Items</span>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 20px;">
        ${cart.length === 0 ? `
          <div class="empty-state" style="padding-top:60px;">
            <span class="material-symbols-rounded empty-state-icon">remove_shopping_cart</span>
            <div class="empty-state-title">Your Cart is Empty</div>
            <div class="empty-state-desc">Add products from local entrepreneurs to start shopping.</div>
            <button class="btn btn-primary" onclick="AppRouter.navigate('screen-customer-home')" style="margin-top:16px;">
              Continue Shopping
            </button>
          </div>
        ` : `
          <!-- Notice regarding 1 entrepreneur rule -->
          <div style="font-size:11px; color:var(--color-text-secondary); background:#F4F7EE; border-left:3px solid var(--color-primary); padding:6px 10px; border-radius:4px; margin-bottom:12px;">
            💡 <strong>Hyperlocal Rule:</strong> You can checkout products from one entrepreneur per order to ensure fresh local handling.
          </div>

          <!-- Store Groups -->
          ${Object.values(storeGroups).map(group => {
            const ent = store.getEntrepreneurById(group.entrepreneurId);
            const isStoreOpen = ent ? ent.isStoreOpen : true;

            return `
              <div class="cart-store-group">
                <div class="cart-store-header">
                  <div style="display:flex; align-items:center; gap:6px;">
                    <span class="material-symbols-rounded" style="color:var(--color-primary); font-size:20px;">storefront</span>
                    <strong style="font-size:14px; color:var(--color-text-primary);">${group.storeName}</strong>
                    <span class="material-symbols-rounded verified-badge">check_circle</span>
                  </div>
                  ${!isStoreOpen ? `
                    <span class="status-chip chip-warning" style="font-size:10px;">Store Closed</span>
                  ` : ''}
                </div>

                ${!isStoreOpen ? `
                  <div style="font-size:11px; color:#C62828; margin-bottom:8px;">
                    🟠 Store Closed: Orders are currently unavailable. ${(ent && ent.openingSchedule) || ''}
                  </div>
                ` : ''}

                <!-- Items inside this store group -->
                ${group.items.map(item => {
                  const p = item.product;
                  const key = `${item.productId}|${JSON.stringify(item.customization || {})}`;
                  const isChecked = this.selectedCartItemKeys.includes(key);

                  return `
                    <div class="cart-item-row">
                      <input type="checkbox" class="cart-item-checkbox" ${isChecked ? 'checked' : ''} onchange="CustomerModule.handleCartItemCheck('${p.id}', '${escape(JSON.stringify(item.customization || {}))}', '${p.entrepreneurId}', this.checked)">
                      
                      <img src="${p.images[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200'}" class="cart-item-thumb" alt="${p.name}">

                      <div class="cart-item-details">
                        <div style="font-size:13px; font-weight:700; color:var(--color-text-primary); line-height:1.3;">
                          ${p.name}
                        </div>
                        <div style="font-size:13px; font-weight:700; color:var(--color-primary);">
                          ₹${p.price}
                        </div>

                        ${item.customization && Object.keys(item.customization).length > 0 ? `
                          <div style="font-size:11px; color:var(--color-secondary); font-style:italic;">
                            ${Object.entries(item.customization).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                          </div>
                        ` : ''}

                        <div class="cart-item-actions">
                          <div class="quantity-stepper" style="height:32px;">
                            <button class="stepper-btn" style="width:30px; height:30px;" onclick="CustomerModule.updateCartQuantity('${p.id}', ${item.qty - 1}, '${escape(JSON.stringify(item.customization || {}))}')">-</button>
                            <span class="stepper-value" style="font-size:12px;">${item.qty}</span>
                            <button class="stepper-btn" style="width:30px; height:30px;" onclick="CustomerModule.updateCartQuantity('${p.id}', ${item.qty + 1}, '${escape(JSON.stringify(item.customization || {}))}', ${p.stock})">+</button>
                          </div>

                          <div style="display:flex; gap:8px;">
                            <button class="btn btn-sm btn-text" style="padding:2px 6px; font-size:11px;" onclick="CustomerModule.moveCartItemToWishlist('${p.id}', '${escape(JSON.stringify(item.customization || {}))}')">
                              ❤️ Wishlist
                            </button>
                            <button class="btn btn-sm btn-text" style="color:var(--color-error); padding:2px 6px; font-size:11px;" onclick="CustomerModule.removeCartItem('${p.id}', '${escape(JSON.stringify(item.customization || {}))}')">
                              🗑 Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          }).join('')}

          <!-- Sticky Bottom Summary for currently selected items -->
          <div class="cart-sticky-summary">
            <div class="order-summary-row">
              <span>Subtotal (${this.selectedCartItemKeys.length} items)</span>
              <span>₹${selectedSubtotal}</span>
            </div>
            <div class="order-summary-row">
              <span>Estimated Delivery</span>
              <span>₹${selectedDelivery}</span>
            </div>
            <div class="order-summary-row total-row">
              <span>Total</span>
              <span>₹${grandTotal}</span>
            </div>

            <button class="btn btn-primary btn-block" ${!canCheckout ? 'disabled' : ''} onclick="CustomerModule.proceedToCheckout()">
              Proceed to Checkout
              <span class="material-symbols-rounded">arrow_forward</span>
            </button>
          </div>
        `}
      </div>

      ${this.renderBottomNav('cart')}
    `;
  },

  handleCartItemCheck(productId, custStrEscaped, entrepreneurId, isChecked) {
    const custStr = unescape(custStrEscaped);
    const key = `${productId}|${custStr}`;

    // Verify if other selected items belong to a different entrepreneur
    if (isChecked) {
      const cart = store.getCart();
      const otherSelectedEnts = [];

      this.selectedCartItemKeys.forEach(k => {
        const [pId] = k.split('|');
        const p = store.getProductById(pId);
        if (p && p.entrepreneurId !== entrepreneurId) {
          otherSelectedEnts.push(p.storeName);
        }
      });

      if (otherSelectedEnts.length > 0) {
        AppUtils.showToast('Please place separate orders for products from different entrepreneurs.');
        // Reset checkbox
        AppRouter.renderActiveScreen();
        return;
      }

      if (!this.selectedCartItemKeys.includes(key)) {
        this.selectedCartItemKeys.push(key);
      }
    } else {
      this.selectedCartItemKeys = this.selectedCartItemKeys.filter(k => k !== key);
    }

    AppRouter.renderActiveScreen();
  },

  updateCartQuantity(productId, newQty, custStrEscaped, maxStock = 99) {
    const cust = JSON.parse(unescape(custStrEscaped));
    if (newQty > maxStock) {
      AppUtils.showToast(`Only ${maxStock} items available in stock.`);
      return;
    }
    store.updateCartQty(productId, newQty, cust);
    AppRouter.renderActiveScreen();
  },

  moveCartItemToWishlist(productId, custStrEscaped) {
    const cust = JSON.parse(unescape(custStrEscaped));
    store.removeFromCart(productId, cust);
    store.toggleWishlist(productId);
    AppUtils.showToast('Moved to Wishlist');
    AppRouter.renderActiveScreen();
  },

  removeCartItem(productId, custStrEscaped) {
    const cust = JSON.parse(unescape(custStrEscaped));
    store.removeFromCart(productId, cust);
    const key = `${productId}|${JSON.stringify(cust)}`;
    this.selectedCartItemKeys = this.selectedCartItemKeys.filter(k => k !== key);
    AppUtils.showToast('Removed from Cart');
    AppRouter.renderActiveScreen();
  },

  proceedToCheckout() {
    AppRouter.navigate('screen-customer-checkout');
  },

  // -------------------------------------------------------------
  // SCREEN: CHECKOUT & PAYMENT MODULE
  // -------------------------------------------------------------
  renderCheckout(params = {}) {
    const selAddr = store.getSelectedAddress();
    const cart = store.getCart();

    // Collect items for this checkout
    let checkoutItems = [];
    if (params.directProductId) {
      const p = store.getProductById(params.directProductId);
      if (p) {
        checkoutItems = [{
          product: p,
          qty: 1,
          customization: CustomerModule.activeDetailCustomization
        }];
      }
    } else {
      cart.forEach(item => {
        const key = `${item.productId}|${JSON.stringify(item.customization || {})}`;
        if (CustomerModule.selectedCartItemKeys.includes(key)) {
          const p = store.getProductById(item.productId);
          if (p) checkoutItems.push({ ...item, product: p });
        }
      });
    }

    if (checkoutItems.length === 0) {
      return `
        <div class="screen-content content-centered">
          <p>No products selected for checkout.</p>
          <button class="btn btn-primary" onclick="AppRouter.navigate('screen-customer-cart')">Return to Cart</button>
        </div>
      `;
    }

    const firstProduct = checkoutItems[0].product;
    const ent = store.getEntrepreneurById(firstProduct.entrepreneurId);
    const subtotal = checkoutItems.reduce((sum, i) => sum + (i.product.price * i.qty), 0);
    const deliveryCharge = (firstProduct.deliveryMethod && firstProduct.deliveryMethod.homeDelivery) ? (firstProduct.deliveryMethod.deliveryCharge || 30) : 0;
    const grandTotal = subtotal + deliveryCharge;

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-cart')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Checkout</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 90px;">
        <!-- Single Entrepreneur Badge -->
        <div style="background:#F4F7EE; border-radius:var(--radius-md); padding:10px 14px; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
          <span class="material-symbols-rounded" style="color:var(--color-primary);">storefront</span>
          <div>
            <div style="font-size:13px; font-weight:700; color:var(--color-text-primary);">${firstProduct.storeName}</div>
            <div style="font-size:11px; color:var(--color-text-secondary);">One order • Dedicated local packaging</div>
          </div>
        </div>

        <!-- Delivery Address Card -->
        <div class="card" style="padding:14px; margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <h4 style="font-size:13px; font-weight:700; color:var(--color-primary);">📍 Delivery Address</h4>
            <button class="btn btn-sm btn-text" onclick="AppRouter.navigate('screen-customer-address-book')">Change Address</button>
          </div>
          ${selAddr ? `
            <div style="font-size:13px; font-weight:600; color:var(--color-text-primary);">${selAddr.label}</div>
            <div style="font-size:12px; color:var(--color-text-secondary); line-height:1.4; margin-top:2px;">
              ${selAddr.door}, ${selAddr.street}, ${selAddr.area}, ${selAddr.city} - ${selAddr.pincode}
            </div>
          ` : `
            <button class="btn btn-sm btn-outline" onclick="AppRouter.navigate('screen-customer-address-book')">+ Add Delivery Address</button>
          `}
        </div>

        <!-- Delivery Method Option -->
        <div class="card" style="padding:14px; margin-bottom:14px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">Delivery Method</h4>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <label style="display:flex; align-items:center; gap:8px; font-size:13px;">
              <input type="radio" name="chk-del-method" value="Home Delivery" checked style="accent-color:var(--color-primary);" onchange="CustomerModule.onDeliveryMethodChange(true, ${subtotal}, ${deliveryCharge})">
              🚚 Home Delivery (₹${deliveryCharge})
            </label>
            ${(firstProduct.deliveryMethod && firstProduct.deliveryMethod.pickup) ? `
              <label style="display:flex; align-items:center; gap:8px; font-size:13px;">
                <input type="radio" name="chk-del-method" value="Pickup" style="accent-color:var(--color-primary);" onchange="CustomerModule.onDeliveryMethodChange(false, ${subtotal}, ${deliveryCharge})">
                🏪 Store Pickup (Free)
              </label>
            ` : ''}
          </div>
        </div>

        <!-- Selected Products List -->
        <div class="card" style="padding:14px; margin-bottom:14px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:10px;">Selected Products (${checkoutItems.length})</h4>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${checkoutItems.map(item => `
              <div style="display:flex; gap:10px; align-items:center;">
                <img src="${item.product.images[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200'}" style="width:48px; height:48px; border-radius:var(--radius-sm); object-fit:cover;">
                <div style="flex:1;">
                  <div style="font-size:13px; font-weight:600; color:var(--color-text-primary);">${item.product.name}</div>
                  <div style="font-size:12px; color:var(--color-text-secondary);">Qty: ${item.qty} × ₹${item.product.price}</div>
                  ${item.customization && Object.keys(item.customization).length > 0 ? `
                    <div style="font-size:11px; color:var(--color-secondary); font-style:italic;">
                      ${Object.entries(item.customization).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                    </div>
                  ` : ''}
                </div>
                <div style="font-size:13px; font-weight:700; color:var(--color-primary);">₹${item.product.price * item.qty}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Order Note (Optional) -->
        <div class="form-group">
          <label class="form-label">Order Note (Optional)</label>
          <input type="text" id="checkout-order-note" class="form-input" placeholder="e.g. Please leave at door, or pack tightly...">
        </div>

        <!-- Payment Method -->
        <div class="card" style="padding:14px; margin-bottom:14px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">Payment Method</h4>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <label class="selectable-card selected" id="pay-mode-card-online" style="margin:0; padding:10px;" onclick="CustomerModule.selectPayMode('Online Payment')">
              <input type="radio" name="pay-mode" id="pay-radio-online" checked style="accent-color:var(--color-primary);">
              <div>
                <strong style="font-size:13px;">Online Payment (UPI, Cards, NetBanking)</strong>
                <p style="font-size:11px; color:var(--color-text-secondary); margin-top:2px;">Fast, contactless and secure settlement</p>
              </div>
            </label>

            <label class="selectable-card" id="pay-mode-card-cod" style="margin:0; padding:10px;" onclick="CustomerModule.selectPayMode('Cash on Delivery')">
              <input type="radio" name="pay-mode" id="pay-radio-cod" style="accent-color:var(--color-primary);">
              <div>
                <strong style="font-size:13px;">Cash on Delivery (COD)</strong>
                <p style="font-size:11px; color:var(--color-text-secondary); margin-top:2px;">Pay upon delivery to the partner</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="card" style="padding:14px; margin-bottom:14px;">
          <div class="order-summary-row">
            <span>Subtotal</span>
            <span>₹${subtotal}</span>
          </div>
          <div class="order-summary-row" style="margin:4px 0;">
            <span>Delivery Charge</span>
            <span id="checkout-del-charge-val">₹${deliveryCharge}</span>
          </div>
          <div class="order-summary-row total-row">
            <span>Total Amount</span>
            <span id="checkout-grand-total-val" style="color:var(--color-primary);">₹${grandTotal}</span>
          </div>
        </div>
      </div>

      <!-- Sticky Place Order Button -->
      <div class="fixed-bottom-action">
        <button class="btn btn-primary btn-block" onclick="CustomerModule.handleExecuteOrder('${firstProduct.entrepreneurId}', ${subtotal}, ${deliveryCharge})">
          Place Order (₹<span id="btn-total-val">${grandTotal}</span>)
          <span class="material-symbols-rounded">verified</span>
        </button>
      </div>
    `;
  },

  onDeliveryMethodChange(isHome, subtotal, baseDel) {
    const del = isHome ? baseDel : 0;
    const total = subtotal + del;
    const delEl = document.getElementById('checkout-del-charge-val');
    const totEl = document.getElementById('checkout-grand-total-val');
    const btnTot = document.getElementById('btn-total-val');
    if (delEl) delEl.textContent = `₹${del}`;
    if (totEl) totEl.textContent = `₹${total}`;
    if (btnTot) btnTot.textContent = `${total}`;
  },

  selectPayMode(mode) {
    const isOnline = mode === 'Online Payment';
    document.getElementById('pay-radio-online').checked = isOnline;
    document.getElementById('pay-radio-cod').checked = !isOnline;
    document.getElementById('pay-mode-card-online').classList.toggle('selected', isOnline);
    document.getElementById('pay-mode-card-cod').classList.toggle('selected', !isOnline);
  },

  async handleExecuteOrder(entrepreneurId, subtotal, baseDeliveryCharge) {
    const isOnline = document.getElementById('pay-radio-online').checked;
    const delChecked = document.querySelector('input[name="chk-del-method"]:checked');
    const isHome = delChecked ? delChecked.value === 'Home Delivery' : true;
    const deliveryCharge = isHome ? baseDeliveryCharge : 0;
    const grandTotal = subtotal + deliveryCharge;
    const noteEl = document.getElementById('checkout-order-note');
    const note = noteEl ? noteEl.value : '';
    const selAddr = store.getSelectedAddress();
    const user = store.getUser() || {};
    const ent = store.getEntrepreneurById(entrepreneurId) || {};

    if (!selAddr) {
      AppUtils.showToast('Please add or select a delivery address.');
      return;
    }

    if (isOnline) {
      // Check if backend is live and Razorpay is configured
      if (window.apiClient && window.apiClient.isOnline && typeof window.Razorpay !== 'undefined') {
        const configRes = await window.apiClient.getPaymentConfig();
        if (configRes && configRes.isConfigured) {
          // Real Razorpay Checkout flow
          AppUtils.showBottomSheet(`
            <div style="text-align:center; padding:20px 0;">
              <div style="width:48px; height:48px; border:4px solid var(--color-border); border-top-color:var(--color-primary); border-radius:50%; margin:0 auto 16px auto; animation:spin 0.8s linear infinite;"></div>
              <h4 style="font-size:16px; font-weight:700; color:var(--color-text-primary);">Opening Razorpay Gateway...</h4>
              <p style="font-size:12px; color:var(--color-text-secondary); margin-top:4px;">Setting up secure UPI / Card / NetBanking session</p>
            </div>
          `);

          const orderRes = await window.apiClient.createPaymentOrder(grandTotal, `rcpt_${Date.now()}`, {
            entrepreneurId,
            customerId: user.id
          });

          AppUtils.closeBottomSheet();

          if (orderRes && orderRes.success && orderRes.orderId) {
            const options = {
              key: orderRes.keyId,
              amount: orderRes.amount,
              currency: orderRes.currency || 'INR',
              name: 'Maneyindha Marukatte',
              description: `Order from ${ent.businessName || 'Local Artisan'}`,
              order_id: orderRes.orderId,
              prefill: {
                name: user.name || 'Valued Customer',
                email: user.email || '',
                contact: user.phone || ''
              },
              theme: {
                color: '#8B4513'
              },
              handler: async (rzpResp) => {
                AppUtils.showBottomSheet(`
                  <div style="text-align:center; padding:20px 0;">
                    <div style="width:48px; height:48px; border:4px solid var(--color-border); border-top-color:var(--color-primary); border-radius:50%; margin:0 auto 16px auto; animation:spin 0.8s linear infinite;"></div>
                    <h4 style="font-size:16px; font-weight:700; color:var(--color-text-primary);">Verifying Payment...</h4>
                    <p style="font-size:12px; color:var(--color-text-secondary); margin-top:4px;">Verifying cryptographic signature with server</p>
                  </div>
                `);

                const verifyRes = await window.apiClient.verifyPaymentSignature({
                  razorpay_order_id: rzpResp.razorpay_order_id,
                  razorpay_payment_id: rzpResp.razorpay_payment_id,
                  razorpay_signature: rzpResp.razorpay_signature
                });

                AppUtils.closeBottomSheet();

                if (verifyRes && verifyRes.success && verifyRes.verified) {
                  AppUtils.showToast('Payment verified successfully!');
                  this.completeOrderCreation({
                    entrepreneurId,
                    subtotal,
                    deliveryCharge,
                    grandTotal,
                    deliveryMethod: isHome ? 'Home Delivery' : 'Pickup',
                    deliveryAddress: selAddr,
                    orderNote: note,
                    paymentMethod: 'Razorpay UPI / Online',
                    paymentStatus: 'Paid',
                    paymentDetails: {
                      provider: 'razorpay',
                      paymentId: rzpResp.razorpay_payment_id,
                      orderId: rzpResp.razorpay_order_id,
                      signature: rzpResp.razorpay_signature
                    }
                  });
                } else {
                  AppUtils.showToast(verifyRes.message || 'Payment signature verification failed.');
                }
              },
              modal: {
                ondismiss: () => {
                  AppUtils.showToast('Payment cancelled. Your cart is preserved.');
                }
              }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
              AppUtils.showToast(`Payment failed: ${(resp.error && resp.error.description) || 'Payment declined'}`);
            });
            rzp.open();
            return;
          } else {
            console.warn('[PAYMENT] Razorpay order creation failed, falling back:', orderRes);
            AppUtils.showToast(orderRes.message || 'Razorpay order creation failed. Falling back to test simulation.');
          }
        }
      }

      // Fallback: Simulated online payment processing dialog (when keys are pending or offline)
      AppUtils.showBottomSheet(`
        <div style="text-align:center; padding:20px 0;">
          <div style="width:48px; height:48px; border:4px solid var(--color-border); border-top-color:var(--color-primary); border-radius:50%; margin:0 auto 16px auto; animation:spin 0.8s linear infinite;"></div>
          <h4 style="font-size:16px; font-weight:700; color:var(--color-text-primary);">Processing Payment...</h4>
          <p style="font-size:12px; color:var(--color-text-secondary); margin-top:4px;">Connecting to Secure UPI Payment Gateway</p>
        </div>
      `);

      setTimeout(() => {
        AppUtils.closeBottomSheet();
        this.completeOrderCreation({
          entrepreneurId,
          subtotal,
          deliveryCharge,
          grandTotal,
          deliveryMethod: isHome ? 'Home Delivery' : 'Pickup',
          deliveryAddress: selAddr,
          orderNote: note,
          paymentMethod: 'Online Payment (Simulation)',
          paymentStatus: 'Paid'
        });
      }, 1500);
    } else {
      this.completeOrderCreation({
        entrepreneurId,
        subtotal,
        deliveryCharge,
        grandTotal,
        deliveryMethod: isHome ? 'Home Delivery' : 'Pickup',
        deliveryAddress: selAddr,
        orderNote: note,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'Pending'
      });
    }
  },

  completeOrderCreation(orderPayload) {
    const user = store.getUser();
    const ent = store.getEntrepreneurById(orderPayload.entrepreneurId);

    // Build items payload
    const cart = store.getCart();
    const items = [];
    cart.forEach(item => {
      const key = `${item.productId}|${JSON.stringify(item.customization || {})}`;
      if (CustomerModule.selectedCartItemKeys.includes(key)) {
        const p = store.getProductById(item.productId);
        if (p) {
          items.push({
            productId: p.id,
            name: p.name,
            price: p.price,
            qty: item.qty,
            customization: item.customization,
            image: p.images[0],
            afterSales: p.afterSales
          });
        }
      }
    });

    const payload = {
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      entrepreneurId: ent.id,
      storeName: ent.businessName,
      items,
      expectedDelivery: 'Today before 6:30 PM',
      ...orderPayload
    };

    if (window.apiClient && window.apiClient.isOnline) {
      window.apiClient.createOrder(payload).then(res => {
        if (!res.success) {
          AppUtils.showToast(res.message || 'Could not place order.');
          return;
        }
        CustomerModule.selectedCartItemKeys = [];
        const orderId = (res.data && res.data.id) ? res.data.id : 'ORD-1001';
        AppRouter.navigate('screen-order-success', { orderId });
      }).catch(() => {
        const newOrder = store.createOrder(payload);
        CustomerModule.selectedCartItemKeys = [];
        AppRouter.navigate('screen-order-success', { orderId: newOrder.id });
      });
    } else {
      const newOrder = store.createOrder(payload);
      CustomerModule.selectedCartItemKeys = [];
      AppRouter.navigate('screen-order-success', { orderId: newOrder.id });
    }
  },

  // -------------------------------------------------------------
  // SCREEN: ORDER PLACED SUCCESSFULLY
  // -------------------------------------------------------------
  renderOrderSuccess(params) {
    const o = store.getOrderById(params.orderId) || store.getOrders()[0];
    return `
      <div class="screen-content content-centered" style="padding-top: 30px;">
        <div style="width: 200px; height: 160px; margin-bottom: 12px;">
          ${AppIllustrations.orderSuccess}
        </div>

        <h2 style="font-size: 22px; font-weight: 700; color: var(--color-primary); margin-bottom: 4px;">
          Order Placed Successfully!
        </h2>
        <span class="status-chip chip-accepted" style="font-size:12px; margin-bottom:14px;">
          Order ID: ${o ? o.id : '#ORD-12345'}
        </span>

        <p style="font-size: 13px; color: var(--color-text-secondary); max-width: 280px; line-height: 1.45; margin-bottom: 24px;">
          Your order from <strong>${o ? o.storeName : "Anita's Bakery"}</strong> is confirmed. You will receive updates as your order is prepared.
        </p>

        <div style="width: 100%; max-width: 320px; display:flex; flex-direction:column; gap:10px;">
          <button class="btn btn-primary btn-block" onclick="AppRouter.navigate('screen-customer-order-details', { orderId: '${o ? o.id : ''}' })">
            View Order Details
          </button>
          <button class="btn btn-secondary btn-block" onclick="AppRouter.navigate('screen-customer-home')">
            Continue Shopping
          </button>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // SCREEN: MY ORDERS & ORDER DETAILS (WITH TIMELINE & AFTER-SALES)
  // -------------------------------------------------------------
  renderMyOrders() {
    const user = store.getUser();
    const orders = store.getOrders({ customerId: user.id });
    const tab = this.selectedOrderTab;

    let filtered = orders;
    if (tab === 'active') {
      filtered = orders.filter(o => ['new', 'accepted', 'preparing', 'out for delivery', 'ready for pickup'].includes(o.orderStatus.toLowerCase()));
    } else if (tab === 'completed') {
      filtered = orders.filter(o => o.orderStatus.toLowerCase() === 'delivered');
    } else if (tab === 'cancelled') {
      filtered = orders.filter(o => o.orderStatus.toLowerCase() === 'cancelled');
    }

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-home')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">My Orders</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 6px; padding-bottom: 70px;">
        <!-- Filter Tabs -->
        <div class="filter-chip-row">
          <button class="filter-chip ${tab === 'active' ? 'active' : ''}" onclick="CustomerModule.setOrderTab('active')">Active</button>
          <button class="filter-chip ${tab === 'completed' ? 'active' : ''}" onclick="CustomerModule.setOrderTab('completed')">Completed</button>
          <button class="filter-chip ${tab === 'cancelled' ? 'active' : ''}" onclick="CustomerModule.setOrderTab('cancelled')">Cancelled</button>
        </div>

        ${filtered.length === 0 ? `
          <div class="empty-state" style="padding-top:60px;">
            <span class="material-symbols-rounded empty-state-icon">package_2</span>
            <div class="empty-state-title">No ${tab.toUpperCase()} Orders</div>
            <div class="empty-state-desc">Your orders will appear here as they progress.</div>
            <button class="btn btn-primary" onclick="AppRouter.navigate('screen-customer-home')" style="margin-top:16px;">
              Start Shopping
            </button>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${filtered.map(o => `
              <div class="order-card card-clickable" onclick="AppRouter.navigate('screen-customer-order-details', { orderId: '${o.id}' })">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <div>
                    <h4 style="font-size:14px; font-weight:700; color:var(--color-text-primary);">${o.id}</h4>
                    <span style="font-size:12px; color:var(--color-text-secondary);">${o.storeName} ✓</span>
                  </div>
                  <span class="status-chip ${AppUtils.getStatusChipClass(o.orderStatus)}">
                    ${o.orderStatus}
                  </span>
                </div>

                <div style="font-size:12px; color:var(--color-text-secondary); margin:4px 0;">
                  ${o.items.length} Item(s) • Total: <strong style="color:var(--color-primary);">₹${o.grandTotal}</strong>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #F0EEE4; padding-top:8px;">
                  <span style="font-size:11px; color:var(--color-text-tertiary);">Expected: ${o.expectedDelivery || 'Today'}</span>
                  <div style="display:flex; gap:6px;">
                    ${o.orderStatus === 'Delivered' ? `
                      <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); AppRouter.navigate('screen-customer-rate-review', { orderId: '${o.id}' })">
                        ${o.reviewSubmitted ? 'View Review' : 'Write Review'}
                      </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline">View Details</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      ${this.renderBottomNav('orders')}
    `;
  },

  setOrderTab(tab) {
    this.selectedOrderTab = tab;
    AppRouter.renderActiveScreen();
  },

  renderCustomerOrderDetails(params) {
    const o = store.getOrderById(params.orderId);
    if (!o) return `<div class="screen-content">Order not found</div>`;

    const isHome = o.deliveryMethod.includes('Home');
    const s = o.orderStatus.toLowerCase();
    const canCancel = ['new', 'accepted'].includes(s);

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-orders')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Order ${o.id}</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 80px;">
        <!-- Header Info -->
        <div class="card" style="padding:14px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between;">
            <div>
              <h4 style="font-size:14px; font-weight:700;">Order ID: ${o.id}</h4>
              <span style="font-size:12px; color:var(--color-text-secondary);">${o.date} • Sold by <strong>${o.storeName} ✓</strong></span>
            </div>
            <span class="status-chip ${AppUtils.getStatusChipClass(o.orderStatus)}">${o.orderStatus}</span>
          </div>
        </div>

        <!-- Visual Timeline -->
        <div class="card" style="padding:14px; margin-bottom:12px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">Status Timeline</h4>
          ${this.renderVisualTimeline(o.orderStatus, isHome)}
        </div>

        <!-- Items Ordered (Historical Preservation) -->
        <div class="card" style="padding:14px; margin-bottom:12px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:10px;">Items Ordered (${o.items.length})</h4>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${o.items.map(item => `
              <div style="display:flex; gap:10px; align-items:center; cursor:pointer;" onclick="AppRouter.navigate('screen-customer-product-details', { productId: '${item.productId}' })">
                <img src="${item.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200'}" style="width:48px; height:48px; border-radius:var(--radius-sm); object-fit:cover;">
                <div style="flex:1;">
                  <div style="font-size:13px; font-weight:600; color:var(--color-text-primary);">${item.name}</div>
                  <div style="font-size:12px; color:var(--color-text-secondary);">Qty: ${item.qty} × ₹${item.price}</div>
                  ${item.customization && Object.keys(item.customization).length > 0 ? `
                    <div style="font-size:11px; color:var(--color-secondary);">
                      ${Object.entries(item.customization).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                    </div>
                  ` : ''}
                </div>
                <div style="font-size:13px; font-weight:700; color:var(--color-primary);">₹${item.price * item.qty}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Delivery & Payment Information -->
        <div class="card" style="padding:14px; margin-bottom:12px;">
          <div style="margin-bottom:8px;">
            <div style="font-size:11px; color:var(--color-text-tertiary); text-transform:uppercase;">Delivery Address</div>
            <div style="font-size:12px; color:var(--color-text-primary); line-height:1.4; margin-top:2px;">
              ${o.deliveryAddress ? `${o.deliveryAddress.door}, ${o.deliveryAddress.street}, ${o.deliveryAddress.area}, ${o.deliveryAddress.city} - ${o.deliveryAddress.pincode}` : 'Store Pickup'}
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; border-top:1px solid #F0EEE4; padding-top:8px; font-size:12px;">
            <span>Payment Method: <strong>${o.paymentMethod}</strong></span>
            <span>Status: <strong style="color:var(--color-success);">${o.paymentStatus}</strong></span>
          </div>
        </div>

        <!-- Cancellation Section Rule -->
        ${canCancel ? `
          <button class="btn btn-danger-outline btn-block" style="margin-bottom:12px;" onclick="CustomerModule.confirmCancelOrder('${o.id}')">
            Cancel Order
          </button>
        ` : s === 'preparing' || s === 'out for delivery' ? `
          <div style="font-size:11px; color:var(--color-text-secondary); background:#FAF7EC; padding:8px 12px; border-radius:var(--radius-sm); margin-bottom:12px;">
            ℹ This order cannot be cancelled because preparation has already started.
          </div>
        ` : ''}

        <!-- After-Sales / Return & Replacement (If Delivered) -->
        ${s === 'delivered' ? `
          <div class="card" style="padding:14px; margin-bottom:12px;">
            <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">After-Sales Support</h4>
            ${o.refundRequest ? `
              <div class="status-chip chip-warning" style="margin-bottom:8px;">Refund Status: ${o.refundRequest.status}</div>
              <p style="font-size:12px; color:var(--color-text-secondary);">Reason: "${o.refundRequest.reason}"</p>
              ${o.refundRequest.returnRequired ? `
                <div style="font-size:11px; color:var(--color-warning); background:#FFF8E1; padding:6px 10px; border-radius:var(--radius-sm); margin-top:6px;">
                  ⚠️ Return Required: Please return product to courier or entrepreneur.
                </div>
              ` : ''}
            ` : o.replacementRequest ? `
              <div class="status-chip chip-accepted" style="margin-bottom:8px;">Replacement Status: ${o.replacementRequest.status}</div>
              <p style="font-size:12px; color:var(--color-text-secondary);">Reason: "${o.replacementRequest.reason}"</p>
            ` : `
              <p style="font-size:12px; color:var(--color-text-secondary); margin-bottom:10px;">
                Support Window: Eligible until ${o.supportWindowExpiresDate || '3 days after delivery'}.
              </p>
              <div style="display:flex; gap:8px;">
                <button class="btn btn-sm btn-outline" style="flex:1;" onclick="CustomerModule.openAfterSalesForm('${o.id}', 'refund')">
                  Request Refund
                </button>
                <button class="btn btn-sm btn-outline" style="flex:1;" onclick="CustomerModule.openAfterSalesForm('${o.id}', 'replacement')">
                  Request Replacement
                </button>
              </div>
            `}
          </div>

          <button class="btn btn-secondary btn-block" onclick="AppRouter.navigate('screen-customer-rate-review', { orderId: '${o.id}' })">
            ${o.reviewSubmitted ? '⭐ View / Edit Your Review' : '⭐ Write a Review'}
          </button>
        ` : ''}
      </div>
    `;
  },

  renderVisualTimeline(status, isHome) {
    const s = status.toLowerCase();
    const steps = isHome 
      ? ['Order Confirmed', 'Preparing', 'Out for Delivery', 'Delivered']
      : ['Order Confirmed', 'Preparing', 'Ready for Pickup', 'Delivered'];

    let activeIdx = 0;
    if (s === 'accepted' || s === 'new') activeIdx = 0;
    if (s === 'preparing') activeIdx = 1;
    if (s === 'out for delivery' || s === 'ready for pickup') activeIdx = 2;
    if (s === 'delivered') activeIdx = 3;

    return `
      <div class="order-status-timeline">
        <div class="timeline-track-line"></div>
        ${steps.map((label, idx) => `
          <div class="timeline-step ${idx < activeIdx ? 'completed' : idx === activeIdx ? 'active' : ''}">
            <div class="timeline-dot">
              ${idx < activeIdx ? '✓' : idx === activeIdx ? '●' : '○'}
            </div>
            <span class="timeline-label">${label}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  confirmCancelOrder(orderId) {
    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-error); margin-bottom:8px;">Cancel Order?</h3>
      <p style="font-size:13px; color:var(--color-text-secondary); margin-bottom:16px;">Are you sure you want to cancel this order?</p>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline" style="flex:1;" onclick="AppUtils.closeBottomSheet()">Keep Order</button>
        <button class="btn btn-danger" style="flex:1;" onclick="CustomerModule.executeCancelOrder('${orderId}')">Cancel Order</button>
      </div>
    `);
  },

  executeCancelOrder(orderId) {
    if (window.apiClient && window.apiClient.isOnline) {
      window.apiClient.cancelOrder(orderId).then(res => {
        if (!res.success) {
          AppUtils.showToast(res.message || 'Cannot cancel this order.');
          return;
        }
        AppUtils.closeBottomSheet();
        AppUtils.showToast('Order cancelled and stock restored.');
        AppRouter.renderActiveScreen();
      }).catch(() => {
        store.updateOrderStatus(orderId, 'Cancelled');
        AppUtils.closeBottomSheet();
        AppUtils.showToast('Order cancelled.');
        AppRouter.renderActiveScreen();
      });
    } else {
      store.updateOrderStatus(orderId, 'Cancelled');
      const o = store.getOrderById(orderId);
      if (o && o.paymentMethod === 'Online Payment') {
        o.paymentStatus = 'Refund Completed';
      }
      AppUtils.closeBottomSheet();
      AppUtils.showToast('Order cancelled.');
      AppRouter.renderActiveScreen();
    }
  },

  openAfterSalesForm(orderId, type) {
    const isRefund = type === 'refund';
    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin-bottom:8px;">
        Request ${isRefund ? 'Refund' : 'Replacement'}
      </h3>
      <div class="form-group">
        <label class="form-label">Select Reason <span class="req">*</span></label>
        <select id="as-reason" class="form-select">
          <option value="Product damaged in transit">Product damaged in transit</option>
          <option value="Wrong item received">Wrong item received</option>
          <option value="Quality issue / Not fresh">Quality issue / Not fresh</option>
          <option value="Packaging seal was broken">Packaging seal was broken</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Description <span class="req">*</span></label>
        <textarea id="as-desc" class="form-textarea" placeholder="Explain the problem..."></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Upload Photo (Proof)</label>
        <div class="doc-upload-box" onclick="AppUtils.showToast('Photo attached')">
          <span class="material-symbols-rounded" style="color:var(--color-primary);">add_a_photo</span>
          <span style="font-size:11px; display:block; margin-top:2px;">Tap to attach photo</span>
        </div>
      </div>
      <button class="btn btn-primary btn-block" onclick="CustomerModule.submitAfterSalesRequest('${orderId}', '${type}')">
        Submit Request
      </button>
    `);
  },

  submitAfterSalesRequest(orderId, type) {
    const reason = document.getElementById('as-reason').value;
    const desc = document.getElementById('as-desc').value.trim();
    if (!desc) {
      AppUtils.showToast('Please provide a description.');
      return;
    }

    const o = store.getOrderById(orderId);
    if (!o) return;

    const aiEval = AppAI.evaluateAfterSalesRequest(o, type, reason, desc);
    const firstItem = o.items && o.items[0];
    const reqObj = {
      reason,
      description: desc,
      status: 'Pending',
      aiSuggestion: aiEval.recommendation + ' - ' + aiEval.rationale,
      returnRequired: (firstItem && firstItem.afterSales && firstItem.afterSales.returnRequired) || false,
      returnStatus: 'None'
    };

    if (type === 'refund') {
      o.refundRequest = reqObj;
    } else {
      o.replacementRequest = reqObj;
    }

    if (window.apiClient && window.apiClient.isOnline) {
      window.apiClient.request(`/orders/${orderId}/after-sales`, {
        method: 'POST',
        body: JSON.stringify({
          type,
          reason,
          description: desc,
          photos: []
        })
      });
    }

    // Notify entrepreneur
    store.addNotification({
      userId: o.entrepreneurId,
      role: 'entrepreneur',
      title: `New ${type === 'refund' ? 'Refund' : 'Replacement'} Request`,
      message: `${o.customerName} requested ${type} for ${o.id}.`,
      type: 'refund',
      targetScreen: 'orders',
      targetId: o.id
    });

    store.saveData();
    AppUtils.closeBottomSheet();
    AppUtils.showToast('Request submitted to entrepreneur.');
    AppRouter.renderActiveScreen();
  },

  // -------------------------------------------------------------
  // SCREEN: RATE & REVIEW MODULE
  // -------------------------------------------------------------
  renderRateReview(params) {
    const o = store.getOrderById(params.orderId);
    if (!o) return `<div class="screen-content">Order not found</div>`;

    const existingRev = store.data.reviews.find(r => r.orderId === o.id);

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-order-details', { orderId: '${o.id}' })">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Rate & Review</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 14px;">
        <div class="card" style="padding:14px; margin-bottom:16px;">
          <h4 style="font-size:14px; font-weight:700; color:var(--color-primary);">${(o.items && o.items[0] && o.items[0].name) || 'Purchased Item'}</h4>
          <span style="font-size:12px; color:var(--color-text-secondary);">${o.storeName} • ${o.id}</span>
        </div>

        <div style="text-align:center; margin-bottom:20px;">
          <label class="form-label" style="justify-content:center; margin-bottom:8px;">Overall Rating <span class="req">*</span></label>
          <div id="star-picker" style="display:flex; justify-content:center; gap:8px;">
            ${[1, 2, 3, 4, 5].map(star => `
              <span class="material-symbols-rounded" style="font-size:36px; color:var(--color-accent); cursor:pointer;" onclick="CustomerModule.setRatingValue(${star})" data-star="${star}">
                ${star <= (existingRev ? existingRev.rating : 5) ? 'star' : 'star_border'}
              </span>
            `).join('')}
          </div>
          <input type="hidden" id="rev-rating-val" value="${existingRev ? existingRev.rating : 5}">
        </div>

        <div class="form-group">
          <label class="form-label">Write Your Review <span class="req">*</span></label>
          <textarea id="rev-text" class="form-textarea" placeholder="Share your experience with the taste, packaging, and handmade freshness...">${existingRev ? existingRev.comment : ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Add Photos (Up to 3, Optional)</label>
          <div class="doc-upload-box" onclick="AppUtils.showToast('Photo added to review!')">
            <span class="material-symbols-rounded" style="color:var(--color-primary);">add_photo_alternate</span>
            <span style="font-size:11px; display:block;">Tap to upload product photo</span>
          </div>
        </div>

        <button class="btn btn-primary btn-block" onclick="CustomerModule.submitReview('${o.id}', '${(o.items && o.items[0] && o.items[0].productId) || ''}')">
          Submit Review
          <span class="material-symbols-rounded">check</span>
        </button>

        ${existingRev ? `
          <button class="btn btn-danger-outline btn-block" style="margin-top:10px;" onclick="CustomerModule.deleteMyReview('${existingRev.id}', '${o.id}')">
            Delete My Review
          </button>
        ` : ''}
      </div>
    `;
  },

  setRatingValue(val) {
    document.getElementById('rev-rating-val').value = val;
    const stars = document.querySelectorAll('#star-picker span');
    stars.forEach((s, idx) => {
      s.textContent = idx < val ? 'star' : 'star_border';
    });
  },

  submitReview(orderId, productId) {
    const rating = parseInt(document.getElementById('rev-rating-val').value, 10);
    const comment = document.getElementById('rev-text').value.trim();

    if (!comment) {
      AppUtils.showToast('Please write your review feedback.');
      return;
    }

    const user = store.getUser();
    const revPayload = {
      orderId,
      productId,
      customerId: user.id,
      customerName: user.name,
      rating,
      comment
    };

    store.addReview(revPayload);

    if (window.apiClient && window.apiClient.isOnline) {
      window.apiClient.submitReview(revPayload);
    }

    AppUtils.showToast('Thank you! Review published.');
    AppRouter.navigate('screen-customer-order-details', { orderId });
  },

  deleteMyReview(reviewId, orderId) {
    store.deleteReview(reviewId);
    if (window.apiClient && window.apiClient.isOnline) {
      window.apiClient.deleteReview(reviewId);
    }
    AppUtils.showToast('Review removed.');
    AppRouter.navigate('screen-customer-order-details', { orderId });
  },

  // -------------------------------------------------------------
  // SCREEN: NOTIFICATIONS
  // -------------------------------------------------------------
  renderNotifications() {
    const user = store.getUser();
    const notifs = store.getNotifications(user.id, 'customer');

    // Group chronologically
    const groups = { Today: [], Yesterday: [], 'Last Week': [] };
    notifs.forEach(n => {
      const g = n.timeGroup || 'Today';
      if (!groups[g]) groups[g] = [];
      groups[g].push(n);
    });

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-home')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Notifications</span>
        </div>
        ${notifs.length > 0 ? `
          <button class="btn btn-text btn-sm" onclick="CustomerModule.clearAllNotifications()">Clear All</button>
        ` : ''}
      </div>

      <div class="screen-content" style="padding-top: 6px; padding-bottom: 70px;">
        ${notifs.length === 0 ? `
          <div class="empty-state" style="padding-top:60px;">
            <span class="material-symbols-rounded empty-state-icon">notifications_off</span>
            <div class="empty-state-title">No Notifications Yet</div>
            <div class="empty-state-desc">We'll notify you about your order milestones and delivery updates.</div>
          </div>
        ` : `
          ${Object.entries(groups).map(([groupTitle, items]) => {
            if (items.length === 0) return '';
            return `
              <div class="notif-group-title">${groupTitle}</div>
              ${items.map(n => `
                <div class="notif-item-card ${!n.isRead ? 'unread' : ''}" onclick="CustomerModule.handleNotificationClick('${n.id}', '${n.targetScreen}', '${n.targetId}')">
                  ${!n.isRead ? '<div class="unread-indicator-dot"></div>' : ''}
                  <div style="flex:1;">
                    <div style="font-size:13px; font-weight:700; color:var(--color-text-primary); margin-bottom:2px;">
                      ${n.title}
                    </div>
                    <div style="font-size:12px; color:var(--color-text-secondary); line-height:1.4;">
                      ${n.message}
                    </div>
                    <span style="font-size:10px; color:var(--color-text-tertiary); margin-top:4px; display:block;">
                      ${n.timeFormatted}
                    </span>
                  </div>
                  <button class="icon-action-btn" style="width:28px; height:28px;" onclick="event.stopPropagation(); CustomerModule.deleteNotification('${n.id}')">
                    <span class="material-symbols-rounded" style="font-size:16px;">close</span>
                  </button>
                </div>
              `).join('')}
            `;
          }).join('')}
        `}
      </div>

      ${this.renderBottomNav('home')}
    `;
  },

  handleNotificationClick(id, targetScreen, targetId) {
    store.markNotificationRead(id);
    if (targetScreen === 'order_details') {
      AppRouter.navigate('screen-customer-order-details', { orderId: targetId });
    } else if (targetScreen === 'rate_review') {
      AppRouter.navigate('screen-customer-rate-review', { orderId: targetId });
    } else {
      AppRouter.navigate('screen-customer-orders');
    }
  },

  deleteNotification(id) {
    store.deleteNotification(id);
    AppRouter.renderActiveScreen();
  },

  clearAllNotifications() {
    store.clearAllNotifications('customer');
    AppRouter.renderActiveScreen();
  },

  // -------------------------------------------------------------
  // SCREEN: CUSTOMER PROFILE & ADDRESS BOOK & HELP
  // -------------------------------------------------------------
  renderProfile() {
    const user = store.getUser();
    let ent = null;
    if (user.entrepreneurId) {
      ent = store.getEntrepreneurById(user.entrepreneurId);
    } else {
      ent = (store.data.entrepreneurs || []).find(e => e.email === user.email);
    }

    const isApproved = ent && ent.status === 'approved';
    const isPending = ent && ent.status === 'pending';
    const isRejected = ent && ent.status === 'rejected';

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-home')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Profile</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 70px;">
        <!-- Current Portal Mode Indicator -->
        <div style="background:#E8F5E9; border:1px solid #C8E6C9; border-radius:var(--radius-md); padding:8px 12px; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
          <span class="material-symbols-rounded" style="color:var(--color-primary); font-size:18px;">shopping_basket</span>
          <span style="font-size:12px; font-weight:700; color:var(--color-primary);">Current Mode: Customer Shopping Portal</span>
        </div>

        <!-- Header Info -->
        <div class="card" style="display:flex; align-items:center; gap:14px; padding:16px; margin-bottom:16px;">
          <div style="width:64px; height:64px; border-radius:50%; background:#E8F5E9; color:var(--color-primary); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <span class="material-symbols-rounded" style="font-size:38px;">person</span>
          </div>
          <div>
            <h3 style="font-size:17px; font-weight:700; color:var(--color-text-primary);">${user.name}</h3>
            <span style="font-size:12px; color:var(--color-text-secondary);">${user.email}</span>
            <div style="font-size:11px; color:var(--color-primary); font-weight:600; margin-top:2px;">📱 ${user.phone}</div>
          </div>
        </div>

        <!-- Menu List (DO NOT DUPLICATE WISHLIST) -->
        <div class="card" style="padding:4px; display:flex; flex-direction:column;">
          <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; cursor:pointer;" onclick="AppRouter.navigate('screen-customer-address-book')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-primary);">home_pin</span>
              <span style="font-size:13px; font-weight:600;">📍 Address Book</span>
            </div>
            <span class="material-symbols-rounded" style="color:var(--color-text-tertiary);">chevron_right</span>
          </div>

          <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-top:1px solid #F0EEE4; cursor:pointer;" onclick="AppRouter.navigate('screen-customer-notifications')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-primary);">notifications</span>
              <span style="font-size:13px; font-weight:600;">🔔 Notifications</span>
            </div>
            <span class="material-symbols-rounded" style="color:var(--color-text-tertiary);">chevron_right</span>
          </div>

          <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-top:1px solid #F0EEE4; cursor:pointer;" onclick="AppRouter.navigate('screen-customer-help-support')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="material-symbols-rounded" style="color:var(--color-primary);">help_outline</span>
              <span style="font-size:13px; font-weight:600;">❓ Help & Support</span>
            </div>
            <span class="material-symbols-rounded" style="color:var(--color-text-tertiary);">chevron_right</span>
          </div>

          <!-- DYNAMIC PROFILE ROLE SWITCHING (ZERO-LOGOUT PERMISSION CHECKED) -->
          ${isApproved ? `
            <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:14px; border-top:1px solid #F0EEE4; cursor:pointer; background:#FAF7EC;" onclick="AppRouter.switchActiveRole('entrepreneur')">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="material-symbols-rounded" style="color:var(--color-primary); font-size:22px;">sync_alt</span>
                <div>
                  <div style="font-size:13px; font-weight:700; color:var(--color-primary);">🔄 Switch to Entrepreneur</div>
                  <span style="font-size:11px; color:var(--color-text-secondary);">Manage ${ent.businessName}</span>
                </div>
              </div>
              <span class="material-symbols-rounded" style="color:var(--color-primary);">arrow_forward</span>
            </div>
          ` : isPending ? `
            <div style="padding:14px; border-top:1px solid #F0EEE4; background:#FFFDE7;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span class="material-symbols-rounded" style="color:#F57F17; font-size:18px;">hourglass_top</span>
                <span style="font-size:12px; font-weight:700; color:#E65100;">Entrepreneur Application Under Review</span>
              </div>
              <p style="font-size:11px; color:var(--color-text-secondary); margin:0 0 8px 0; line-height:1.4;">
                Your application for <strong>${ent.businessName}</strong> is pending administrative verification. Selling features will unlock immediately upon approval.
              </p>
              <button class="btn btn-sm btn-outline" onclick="AppRouter.navigate('screen-ent-reg-status')">Check Application Status</button>
            </div>
          ` : isRejected ? `
            <div style="padding:14px; border-top:1px solid #F0EEE4; background:#FFEBEE;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span class="material-symbols-rounded" style="color:#C62828; font-size:18px;">error</span>
                <span style="font-size:12px; font-weight:700; color:#C62828;">Application Needs Revision</span>
              </div>
              <p style="font-size:11px; color:var(--color-text-secondary); margin:0 0 8px 0;">
                ${ent.rejectionReason || 'Please update your verification documents.'}
              </p>
              <button class="btn btn-sm btn-danger-outline" onclick="AppRouter.navigate('screen-ent-rejected-correctable')">Update Documents</button>
            </div>
          ` : `
            <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:14px; border-top:1px solid #F0EEE4; cursor:pointer; background:#F4F8EE;" onclick="AppRouter.navigate('screen-ent-reg-1')">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="material-symbols-rounded" style="color:var(--color-primary); font-size:22px;">storefront</span>
                <div>
                  <div style="font-size:13px; font-weight:700; color:var(--color-primary);">✨ Become an Entrepreneur</div>
                  <span style="font-size:11px; color:var(--color-text-secondary);">Start selling your homemade & handmade creations</span>
                </div>
              </div>
              <span class="material-symbols-rounded" style="color:var(--color-primary);">arrow_forward</span>
            </div>
          `}

          <div class="card-clickable" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-top:1px solid #F0EEE4; cursor:pointer;" onclick="CustomerModule.confirmLogout()">
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

  confirmLogout() {
    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-text-primary); margin-bottom:8px;">Logout</h3>
      <p style="font-size:13px; color:var(--color-text-secondary); margin-bottom:16px;">Are you sure you want to log out of your account?</p>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline" style="flex:1;" onclick="AppUtils.closeBottomSheet()">Cancel</button>
        <button class="btn btn-danger" style="flex:1;" onclick="AppUtils.closeBottomSheet(); AppRouter.navigate('screen-welcome');">Logout</button>
      </div>
    `);
  },

  // -------------------------------------------------------------
  // ADDRESS BOOK MODULE
  // -------------------------------------------------------------
  renderAddressBook() {
    const list = store.getAddresses();
    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-profile')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Address Book</span>
        </div>
        <button class="btn btn-primary btn-sm" onclick="CustomerModule.openAddAddressModal()">+ Add New</button>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 70px;">
        ${list.length === 0 ? `
          <div class="empty-state">
            <span class="material-symbols-rounded empty-state-icon">location_off</span>
            <div class="empty-state-title">No Saved Addresses</div>
            <div class="empty-state-desc">Add a delivery address for fast and easy checkout.</div>
            <button class="btn btn-primary" onclick="CustomerModule.openAddAddressModal()" style="margin-top:14px;">+ Add Address</button>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${list.map(a => `
              <div class="card" style="padding:14px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <strong style="font-size:14px; color:var(--color-primary);">${a.label}</strong>
                  ${a.isDefault ? '<span class="status-chip chip-delivered" style="font-size:10px; padding:2px 8px;">● Default</span>' : ''}
                </div>
                <div style="font-size:12px; color:var(--color-text-secondary); line-height:1.4; margin-bottom:10px;">
                  ${a.door}, ${a.street}, ${a.area}, ${a.city}, ${a.state} - ${a.pincode}
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-sm btn-outline" onclick="CustomerModule.openEditAddressModal('${a.id}')">Edit</button>
                  <button class="btn btn-sm btn-danger-outline" onclick="CustomerModule.deleteAddress('${a.id}')">Delete</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      ${this.renderBottomNav('profile')}
    `;
  },

  openAddAddressModal() {
    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin-bottom:12px;">+ Add Delivery Address</h3>
      <div class="form-group">
        <label class="form-label">Address Label (Home, Hostel, Office)</label>
        <input type="text" id="new-addr-label" class="form-input" placeholder="Home" value="Home">
      </div>
      <div style="display:grid; grid-template-columns:1fr 2fr; gap:8px;">
        <div class="form-group">
          <label class="form-label">Door No.</label>
          <input type="text" id="new-addr-door" class="form-input" placeholder="#12">
        </div>
        <div class="form-group">
          <label class="form-label">Street / Cross</label>
          <input type="text" id="new-addr-street" class="form-input" placeholder="MG Road">
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div class="form-group">
          <label class="form-label">Area</label>
          <input type="text" id="new-addr-area" class="form-input" placeholder="Malleshwaram">
        </div>
        <div class="form-group">
          <label class="form-label">City</label>
          <input type="text" id="new-addr-city" class="form-input" value="Bangalore">
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div class="form-group">
          <label class="form-label">State</label>
          <input type="text" id="new-addr-state" class="form-input" value="Karnataka">
        </div>
        <div class="form-group">
          <label class="form-label">Pincode (6 digits)</label>
          <input type="text" id="new-addr-pin" class="form-input" maxlength="6" placeholder="560001">
        </div>
      </div>
      <button class="btn btn-primary btn-block" onclick="CustomerModule.saveNewAddress()">Save Address</button>
    `);
  },

  saveNewAddress() {
    const label = document.getElementById('new-addr-label').value.trim() || 'Home';
    const door = document.getElementById('new-addr-door').value.trim();
    const street = document.getElementById('new-addr-street').value.trim();
    const area = document.getElementById('new-addr-area').value.trim();
    const city = document.getElementById('new-addr-city').value.trim();
    const state = document.getElementById('new-addr-state').value.trim();
    const pin = document.getElementById('new-addr-pin').value.trim();

    if (!door || !street || !area || pin.length !== 6) {
      AppUtils.showToast('Please enter all fields and a 6-digit pincode.');
      return;
    }

    store.addAddress({ label, door, street, area, city, state, pincode: pin });
    AppUtils.closeBottomSheet();
    AppUtils.showToast('Address added successfully.');
    AppRouter.renderActiveScreen();
  },

  deleteAddress(id) {
    store.deleteAddress(id);
    AppUtils.showToast('Address deleted.');
    AppRouter.renderActiveScreen();
  },

  // -------------------------------------------------------------
  // HELP & SUPPORT (MANEYINDA AI GUIDE & SUPPORT TICKETS)
  // -------------------------------------------------------------
  renderHelpSupport() {
    const user = store.getUser();
    const tickets = store.getSupportTickets(user.id);

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-profile')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Help & Support</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px; padding-bottom: 70px;">
        <!-- Card 1: Ask Maneyinda AI Guide -->
        <div class="card card-clickable" style="padding:16px; margin-bottom:12px; cursor:pointer;" onclick="AppRouter.navigate('screen-customer-ai-guide')">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:48px; height:48px; border-radius:var(--radius-md); background:var(--color-soft-yellow); color:var(--color-primary); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <span class="material-symbols-rounded" style="font-size:28px;">psychology</span>
            </div>
            <div style="flex:1;">
              <h4 style="font-size:15px; font-weight:700; color:var(--color-text-primary);">🤖 Ask Maneyinda AI</h4>
              <p style="font-size:12px; color:var(--color-text-secondary); margin-top:2px;">
                Learn how to place orders, delivery rules, or become an entrepreneur.
              </p>
            </div>
            <span class="material-symbols-rounded" style="color:var(--color-text-tertiary);">chevron_right</span>
          </div>
        </div>

        <!-- Card 2: Raise Support Ticket -->
        <div class="card card-clickable" style="padding:16px; margin-bottom:16px; cursor:pointer;" onclick="CustomerModule.openRaiseTicketModal()">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:48px; height:48px; border-radius:var(--radius-md); background:#E1F5FE; color:var(--color-info); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <span class="material-symbols-rounded" style="font-size:28px;">confirmation_number</span>
            </div>
            <div style="flex:1;">
              <h4 style="font-size:15px; font-weight:700; color:var(--color-text-primary);">📩 Raise Support Ticket</h4>
              <p style="font-size:12px; color:var(--color-text-secondary); margin-top:2px;">
                Report an account, payment, order issue, or appeal a refund.
              </p>
            </div>
            <span class="material-symbols-rounded" style="color:var(--color-text-tertiary);">chevron_right</span>
          </div>
        </div>

        <!-- My Support Tickets -->
        <h4 style="font-size:14px; font-weight:700; color:var(--color-text-primary); margin-bottom:10px;">
          🎫 My Support Tickets (${tickets.length})
        </h4>

        ${tickets.length === 0 ? `
          <div style="font-size:12px; color:var(--color-text-tertiary); font-style:italic;">No support tickets created yet.</div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${tickets.map(t => `
              <div class="card" style="padding:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <strong style="font-size:13px; color:var(--color-text-primary);">${t.id} • ${t.issueType}</strong>
                  <span class="status-chip ${t.status === 'Resolved' ? 'chip-delivered' : t.status === 'In Progress' ? 'chip-accepted' : 'chip-warning'}" style="font-size:10px; padding:2px 8px;">
                    ${t.status}
                  </span>
                </div>
                <p style="font-size:12px; color:var(--color-text-secondary); margin-bottom:6px;">"${t.description}"</p>
                ${t.adminNotes ? `
                  <div style="font-size:11px; color:#1B5E20; background:#E8F5E9; padding:6px 10px; border-radius:var(--radius-sm); margin-top:4px;">
                    <strong>Admin Note:</strong> ${t.adminNotes}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `}
      </div>

      ${this.renderBottomNav('profile')}
    `;
  },

  openRaiseTicketModal() {
    AppUtils.showBottomSheet(`
      <h3 style="font-size:16px; font-weight:700; color:var(--color-primary); margin-bottom:10px;">📩 Raise Support Ticket</h3>
      <div class="form-group">
        <label class="form-label">Issue Type <span class="req">*</span></label>
        <select id="ticket-issue-type" class="form-select">
          <option value="Payment Issue">Payment Issue</option>
          <option value="Order Issue">Order Issue</option>
          <option value="Refund Appeal">Refund Appeal</option>
          <option value="Replacement Appeal">Replacement Appeal</option>
          <option value="Account Issue">Account Issue</option>
          <option value="Other Issue">Other Issue</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Description <span class="req">*</span></label>
        <textarea id="ticket-desc" class="form-textarea" placeholder="Describe the issue with relevant order/payment details..."></textarea>
      </div>
      <button class="btn btn-primary btn-block" onclick="CustomerModule.submitSupportTicket()">
        Submit Support Ticket
      </button>
    `);
  },

  submitSupportTicket() {
    const issueType = document.getElementById('ticket-issue-type').value;
    const desc = document.getElementById('ticket-desc').value.trim();
    if (!desc) {
      AppUtils.showToast('Please describe your issue.');
      return;
    }

    const user = store.getUser();
    const t = store.createSupportTicket({
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      issueType,
      description: desc
    });

    if (window.apiClient && window.apiClient.isOnline) {
      window.apiClient.request('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({
          customerId: user.id,
          customerName: user.name,
          category: issueType,
          subject: issueType,
          description: desc
        })
      });
    }

    store.addActivityLog(`Customer raised new Support Ticket: ${t.id} (${issueType})`);
    AppUtils.closeBottomSheet();
    AppUtils.showToast(`Ticket ${t.id} created successfully.`);
    AppRouter.renderActiveScreen();
  },

  // -------------------------------------------------------------
  // SCREEN: MANEYINDA AI GUIDE (INTERACTIVE CHATBOT)
  // -------------------------------------------------------------
  renderAiGuide() {
    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-customer-help-support')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Maneyinda AI Guide</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 10px; display:flex; flex-direction:column;">
        <div class="ai-chat-thread" id="ai-chat-thread">
          <div class="ai-bubble ai-bubble-assistant">
            Namaskara! 🙏 I am your <strong>Maneyinda AI Guide</strong>.<br><br>
            I can help guide you through placing orders, delivery radii, refund windows, or how to register as a woman entrepreneur. What would you like to know?
          </div>
        </div>

        <!-- Quick Question Suggestions -->
        <div class="ai-quick-questions">
          <button class="ai-quick-btn" onclick="CustomerModule.sendAiQuery('How do I place an order?')">How do I place an order?</button>
          <button class="ai-quick-btn" onclick="CustomerModule.sendAiQuery('How do I become an entrepreneur?')">How do I become an entrepreneur?</button>
          <button class="ai-quick-btn" onclick="CustomerModule.sendAiQuery('How do I request a refund?')">How do I request a refund?</button>
          <button class="ai-quick-btn" onclick="CustomerModule.sendAiQuery('How does delivery radius work?')">Delivery radius rules</button>
        </div>

        <!-- Chat Input Bar -->
        <div class="fixed-bottom-action" style="flex-direction:row; align-items:center; gap:8px;">
          <input type="text" id="ai-user-query" class="form-input" style="flex:1;" placeholder="Ask about app guidance..." onkeydown="if(event.key==='Enter') CustomerModule.sendAiQuery(this.value)">
          <button class="btn btn-primary btn-sm" onclick="CustomerModule.sendAiQuery(document.getElementById('ai-user-query').value)">
            <span class="material-symbols-rounded">send</span>
          </button>
        </div>
      </div>
    `;
  },

  sendAiQuery(query) {
    if (!query || !query.trim()) return;
    const thread = document.getElementById('ai-chat-thread');
    const input = document.getElementById('ai-user-query');
    if (input) input.value = '';

    // Append user message
    thread.innerHTML += `
      <div class="ai-bubble ai-bubble-user">
        ${query}
      </div>
    `;

    // Response from AI engine
    const reply = AppAI.askCustomerGuide(query);
    setTimeout(() => {
      thread.innerHTML += `
        <div class="ai-bubble ai-bubble-assistant">
          ${reply.replace(/\n/g, '<br>')}
        </div>
      `;
      thread.scrollTop = thread.scrollHeight;
    }, 300);
  },

  renderBottomNav(activeItem) {
    return `
      <div class="bottom-nav-bar">
        <button class="nav-item-btn ${activeItem === 'home' ? 'active' : ''}" onclick="AppRouter.navigate('screen-customer-home')">
          <div class="nav-icon-wrapper">
            <span class="material-symbols-rounded ${activeItem === 'home' ? 'icon-filled' : 'icon-outlined'}">home</span>
          </div>
          <span class="nav-label">Home</span>
        </button>

        <button class="nav-item-btn ${activeItem === 'cart' ? 'active' : ''}" onclick="AppRouter.navigate('screen-customer-cart')">
          <div class="nav-icon-wrapper">
            <span class="material-symbols-rounded ${activeItem === 'cart' ? 'icon-filled' : 'icon-outlined'}">shopping_cart</span>
          </div>
          <span class="nav-label">Cart</span>
        </button>

        <button class="nav-item-btn ${activeItem === 'orders' ? 'active' : ''}" onclick="AppRouter.navigate('screen-customer-orders')">
          <div class="nav-icon-wrapper">
            <span class="material-symbols-rounded ${activeItem === 'orders' ? 'icon-filled' : 'icon-outlined'}">local_mall</span>
          </div>
          <span class="nav-label">My Orders</span>
        </button>

        <button class="nav-item-btn ${activeItem === 'profile' ? 'active' : ''}" onclick="AppRouter.navigate('screen-customer-profile')">
          <div class="nav-icon-wrapper">
            <span class="material-symbols-rounded ${activeItem === 'profile' ? 'icon-filled' : 'icon-outlined'}">person</span>
          </div>
          <span class="nav-label">Profile</span>
        </button>
      </div>
    `;
  }
};
