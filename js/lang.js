/* =====================================================================
   MANEYINDA MARUKATTE - MULTI-LINGUAL VERNACULAR LOCALIZATION
   Provides seamless English & Kannada (ಕನ್ನಡ) dual-language switching
===================================================================== */

const AppLang = {
  currentLang: localStorage.getItem('MANEYINDA_LANG') || 'en',

  translations: {
    en: {
      appName: 'Maneyinda Marukatte',
      tagline: 'Empowering Local Women Entrepreneurs',
      welcome: 'Welcome',
      deliverTo: 'Deliver to:',
      searchPlaceholder: 'Search Products, Stores or Categories...',
      popularProducts: '🔥 Popular Products',
      trendingThisWeek: '🔥 Trending This Week',
      categories: 'Categories',
      customer: 'Customer',
      entrepreneur: 'Entrepreneur',
      admin: 'Admin',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      checkout: 'Checkout',
      cartEmpty: 'Your Cart is Empty',
      storeOpen: 'Open & Accepting Orders',
      storeClosed: 'Store Closed',
      orderPlaced: 'Order Placed Successfully!',
      myOrders: 'My Orders',
      helpSupport: 'Help & Support',
      wishlist: 'Wishlist',
      profile: 'Profile',
      home: 'Home',
      search: 'Search',
      cart: 'Cart',
      orders: 'Orders'
    },
    kn: {
      appName: 'ಮನೆಯಿಂದ ಮಾರುಕಟ್ಟೆ',
      tagline: 'ಸ್ಥಳೀಯ ಮಹಿಳಾ ಉದ್ಯಮಿಗಳ ಸಬಲೀಕರಣ',
      welcome: 'ನಮಸ್ಕಾರ',
      deliverTo: 'ತಲುಪಿಸುವ ವಿಳಾಸ:',
      searchPlaceholder: 'ಹುಡುಕಿ: ಉತ್ಪನ್ನಗಳು, ಅಂಗಡಿಗಳು ಅಥವಾ ವರ್ಗಗಳು...',
      popularProducts: '🔥 ಜನಪ್ರಿಯ ಉತ್ಪನ್ನಗಳು',
      trendingThisWeek: '🔥 ಈ ವಾರದ ಟ್ರೆಂಡಿಂಗ್',
      categories: 'ವರ್ಗಗಳು',
      customer: 'ಗ್ರಾಹಕ',
      entrepreneur: 'ಉದ್ಯಮಿ',
      admin: 'ನಿರ್ವಾಹಕ',
      addToCart: 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ',
      buyNow: 'ಈಗಲೇ ಖರೀದಿಸಿ',
      checkout: 'ಚೆಕ್‌ಔಟ್',
      cartEmpty: 'ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ',
      storeOpen: 'ಅಂಗಡಿ ತೆರೆದಿದೆ - ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಲಾಗುತ್ತಿದೆ',
      storeClosed: 'ಅಂಗಡಿ ಮುಚ್ಚಿದೆ',
      orderPlaced: 'ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ!',
      myOrders: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು',
      helpSupport: 'ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ',
      wishlist: 'ಮೆಚ್ಚಿನವುಗಳು',
      profile: 'ಪ್ರೊಫೈಲ್',
      home: 'ಮುಖಪುಟ',
      search: 'ಹುಡುಕಿ',
      cart: 'ಕಾರ್ಟ್',
      orders: 'ಆರ್ಡರ್‌ಗಳು'
    }
  },

  categoryTranslations: {
    'Bakery & Sweets': 'ಬೇಕರಿ & ಸಿಹಿತಿಂಡಿ',
    'Food & Tiffin': 'ಮನೆ ಊಟ & ಟಿಫಿನ್',
    'Tailoring & Alterations': 'ಟೈಲರಿಂಗ್ & ಆಲ್ಟರೇಶನ್',
    'Handmade Crafts': 'ಕರಕುಶಲ ವಸ್ತುಗಳು',
    'Home Decor': 'ಮನೆ ಅಲಂಕಾರ',
    'Beauty & Wellness': 'ಸೌಂದರ್ಯ & ಸ್ವಾಸ್ಥ್ಯ'
  },

  t(key, fallback = '') {
    const langDict = this.translations[this.currentLang] || this.translations.en;
    return langDict[key] || fallback || key;
  },

  tCategory(catName) {
    if (this.currentLang === 'kn' && this.categoryTranslations[catName]) {
      return this.categoryTranslations[catName];
    }
    return catName;
  },

  toggleLang() {
    this.currentLang = this.currentLang === 'en' ? 'kn' : 'en';
    localStorage.setItem('MANEYINDA_LANG', this.currentLang);
    this.updateLangUI();
    if (window.AppRouter && typeof AppRouter.renderActiveScreen === 'function') {
      AppRouter.renderActiveScreen();
    }
    if (window.AppUtils && typeof AppUtils.showToast === 'function') {
      AppUtils.showToast(this.currentLang === 'kn' ? 'ಭಾಷೆ: ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ' : 'Language set to English');
    }
  },

  updateLangUI() {
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) {
      btn.innerHTML = this.currentLang === 'kn' ? '🌐 ಕನ್ನಡ (KN)' : '🌐 English (EN)';
    }

    const pillCust = document.getElementById('pill-role-customer');
    if (pillCust) {
      pillCust.innerHTML = `<span class="material-symbols-rounded" style="font-size:16px;">shopping_basket</span> ${this.t('customer')}`;
    }
    const pillEnt = document.getElementById('pill-role-entrepreneur');
    if (pillEnt) {
      pillEnt.innerHTML = `<span class="material-symbols-rounded" style="font-size:16px;">storefront</span> ${this.t('entrepreneur')}`;
    }
    const pillAdm = document.getElementById('pill-role-admin');
    if (pillAdm) {
      pillAdm.innerHTML = `<span class="material-symbols-rounded" style="font-size:16px;">shield_person</span> ${this.t('admin')}`;
    }
  }
};

window.AppLang = AppLang;
