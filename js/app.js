/* =====================================================================
   MANEYINDA MARUKATTE - APPLICATION ROUTER & CONTROLLER
   Global Router, Utilities, Viewport Management & Screen Dispatcher
===================================================================== */

const AppRouter = {
  currentScreenId: 'screen-splash',
  currentParams: {},
  historyStack: [],

  init() {
    this.updateClock();
    setInterval(() => this.updateClock(), 30000);

    // Initial screen check
    const hash = window.location.hash.replace('#', '');
    const initialScreen = hash || 'screen-splash';
    this.navigate(initialScreen, {}, false);

    // Initial render
    this.syncDemoRolePills();
    if (window.AppLang) AppLang.updateLangUI();
  },

  updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const timeStr = `${hours}:${minutes}`;

    const clockEl = document.getElementById('status-bar-clock');
    if (clockEl) clockEl.textContent = timeStr;
  },

  navigate(screenId, params = {}, pushToHistory = true) {
    // 1. SECURITY GUARD: Private Admin Portal Access Control
    if (screenId.startsWith('screen-admin-') && screenId !== 'screen-admin-login') {
      const hasAdminAuth = (window.apiClient && window.apiClient.hasAdminAuth()) ||
                           sessionStorage.getItem('ADMIN_TOKEN');
      if (!hasAdminAuth) {
        AppUtils.showToast('🔒 Administrator login required.');
        screenId = 'screen-admin-login';
      }
    }

    // 2. SECURITY GUARD: Entrepreneur Access Control
    if (screenId.startsWith('screen-ent-') &&
        !['screen-ent-login', 'screen-ent-reg-1', 'screen-ent-reg-2', 'screen-ent-reg-3',
          'screen-ent-reg-submitted', 'screen-ent-reg-status', 'screen-ent-rejected-correctable',
          'screen-ent-rejected-perm', 'screen-ent-approved', 'screen-ent-account-setup',
          'screen-ent-security-questions'].includes(screenId)) {
      const user = store.getUser();
      const ent = user.entrepreneurId ? store.getEntrepreneurById(user.entrepreneurId) : null;
      if (!ent || ent.status !== 'approved') {
        AppUtils.showToast('⚠️ Entrepreneur approval required to access selling features.');
        screenId = 'screen-customer-home';
      }
    }

    if (pushToHistory && this.currentScreenId !== screenId) {
      this.historyStack.push({ screenId: this.currentScreenId, params: this.currentParams });
    }

    this.currentScreenId = screenId;
    this.currentParams = params;
    window.location.hash = screenId;

    this.renderActiveScreen();
    this.syncDemoRolePills();
  },

  goBack() {
    if (this.historyStack.length > 0) {
      const prev = this.historyStack.pop();
      this.navigate(prev.screenId, prev.params, false);
    } else {
      // Default fallback
      const role = store.getRole();
      if (role === 'admin') this.navigate('screen-admin-dashboard', {}, false);
      else if (role === 'entrepreneur') this.navigate('screen-ent-dashboard', {}, false);
      else this.navigate('screen-customer-home', {}, false);
    }
  },

  renderActiveScreen() {
    const container = document.getElementById('app-viewport');
    if (!container) return;

    let html = '';
    const id = this.currentScreenId;
    const params = this.currentParams;

    // Dispatcher
    switch (id) {
      // Auth
      case 'screen-splash': html = AuthModule.renderSplash(); break;
      case 'screen-welcome': html = AuthModule.renderWelcome(); break;
      case 'screen-choose-role': html = AuthModule.renderChooseRole(); break;
      case 'screen-email-verify': html = AuthModule.renderEmailVerify(); break;
      case 'screen-otp-verify': html = AuthModule.renderOtpVerify(); break;
      case 'screen-basic-info': html = AuthModule.renderBasicInfo(); break;
      case 'screen-login-select': html = AuthModule.renderLoginSelect(); break;
      case 'screen-customer-login': html = AuthModule.renderCustomerLogin(); break;
      case 'screen-customer-otp': html = AuthModule.renderCustomerOtp(); break;
      case 'screen-ent-login': html = AuthModule.renderEntrepreneurLogin(); break;
      case 'screen-forgot-pass-email': html = AuthModule.renderForgotPassEmail(); break;
      case 'screen-forgot-pass-security': html = AuthModule.renderForgotPassSecurity(); break;

      // Entrepreneur Registration
      case 'screen-ent-reg-1': html = EntrepreneurRegModule.renderStep1(); break;
      case 'screen-ent-reg-2': html = EntrepreneurRegModule.renderStep2(); break;
      case 'screen-ent-reg-3': html = EntrepreneurRegModule.renderStep3(); break;
      case 'screen-ent-reg-submitted': html = EntrepreneurRegModule.renderSubmitted(); break;
      case 'screen-ent-reg-status': html = EntrepreneurRegModule.renderStatus(); break;
      case 'screen-ent-rejected-correctable': html = EntrepreneurRegModule.renderRejectedCorrectable(); break;
      case 'screen-ent-rejected-perm': html = EntrepreneurRegModule.renderRejectedPermanent(); break;
      case 'screen-ent-approved': html = EntrepreneurRegModule.renderApproved(); break;
      case 'screen-ent-account-setup': html = EntrepreneurRegModule.renderAccountSetup(); break;
      case 'screen-ent-security-questions': html = EntrepreneurRegModule.renderSecurityQuestions(); break;

      // Customer
      case 'screen-customer-home': html = CustomerModule.renderHome(); break;
      case 'screen-customer-search': html = CustomerModule.renderSearch(); break;
      case 'screen-customer-product-details': html = CustomerModule.renderProductDetails(params); break;
      case 'screen-public-store': html = CustomerModule.renderPublicStore(params); break;
      case 'screen-category-listing': html = CustomerModule.renderCategoryListing(params); break;
      case 'screen-customer-wishlist': html = CustomerModule.renderWishlist(); break;
      case 'screen-customer-cart': html = CustomerModule.renderCart(); break;
      case 'screen-customer-checkout': html = CustomerModule.renderCheckout(params); break;
      case 'screen-order-success': html = CustomerModule.renderOrderSuccess(params); break;
      case 'screen-payment-failure': html = CustomerModule.renderPaymentFailure(params); break;
      case 'screen-customer-orders': html = CustomerModule.renderMyOrders(); break;
      case 'screen-customer-order-details': html = CustomerModule.renderCustomerOrderDetails(params); break;
      case 'screen-customer-rate-review': html = CustomerModule.renderRateReview(params); break;
      case 'screen-customer-notifications': html = CustomerModule.renderNotifications(); break;
      case 'screen-customer-profile': html = CustomerModule.renderProfile(); break;
      case 'screen-customer-address-book': html = CustomerModule.renderAddressBook(); break;
      case 'screen-customer-help-support': html = CustomerModule.renderHelpSupport(); break;
      case 'screen-customer-ai-guide': html = CustomerModule.renderAiGuide(); break;

      // Entrepreneur
      case 'screen-ent-dashboard': html = EntrepreneurModule.renderDashboard(); break;
      case 'screen-ent-products': html = EntrepreneurModule.renderProducts(); break;
      case 'screen-ent-add-product': html = EntrepreneurModule.renderAddOrEditProduct(); break;
      case 'screen-ent-orders': html = EntrepreneurModule.renderOrders(); break;
      case 'screen-ent-order-details': html = EntrepreneurModule.renderOrderDetails(params); break;
      case 'screen-ent-earnings': html = EntrepreneurModule.renderEarnings(); break;
      case 'screen-ent-profile': html = EntrepreneurModule.renderProfile(); break;
      case 'screen-ent-availability': html = EntrepreneurModule.renderAvailability(); break;
      case 'screen-ent-reviews': html = EntrepreneurModule.renderReviews(); break;
      case 'screen-ent-payment-settings': html = EntrepreneurModule.renderPaymentSettings(); break;

      // Admin
      case 'screen-admin-login': html = AdminModule.renderLogin(); break;
      case 'screen-admin-dashboard': html = AdminModule.renderDashboard(); break;
      case 'screen-admin-verification': html = AdminModule.renderVerificationQueue(); break;
      case 'screen-admin-entrepreneurs': html = AdminModule.renderEntrepreneurs(); break;
      case 'screen-admin-products': html = AdminModule.renderProducts(); break;
      case 'screen-admin-categories': html = AdminModule.renderCategories(); break;
      case 'screen-admin-trends': html = AdminModule.renderTrends(); break;
      case 'screen-admin-moderation': html = AdminModule.renderModeration(); break;
      case 'screen-admin-support': html = AdminModule.renderSupportCenter(); break;
      case 'screen-admin-analytics': html = AdminModule.renderAnalytics(); break;
      case 'screen-admin-profile': html = AdminModule.renderProfile(); break;
      case 'screen-admin-payments': html = AdminModule.renderPayments(); break;

      default:
        html = CustomerModule.renderHome();
        break;
    }

    container.innerHTML = html;
  },

  syncDemoRolePills() {
    const s = this.currentScreenId;
    let activeRole = 'customer';
    if (s.startsWith('screen-admin')) activeRole = 'admin';
    else if (s.startsWith('screen-ent')) activeRole = 'entrepreneur';
    else if (s.startsWith('screen-customer')) activeRole = 'customer';

    const pCust = document.getElementById('pill-role-customer');
    const pEnt = document.getElementById('pill-role-entrepreneur');
    const pAdm = document.getElementById('pill-role-admin');

    if (pCust) pCust.classList.toggle('active', activeRole === 'customer');
    if (pEnt) pEnt.classList.toggle('active', activeRole === 'entrepreneur');
    if (pAdm) pAdm.classList.toggle('active', activeRole === 'admin');
  },

  async switchActiveRole(targetRole) {
    if (window.apiClient) {
      const res = await window.apiClient.switchRole(targetRole);
      if (!res.success && res.error === 'ENTREPRENEUR_NOT_APPROVED') {
        AppUtils.showToast(res.message);
        return;
      }
    }
    store.setRole(targetRole);
    this.syncDemoRolePills();
    if (targetRole === 'entrepreneur') {
      this.navigate('screen-ent-dashboard');
      AppUtils.showToast('🏪 Switched to Entrepreneur Portal');
    } else {
      this.navigate('screen-customer-home');
      AppUtils.showToast('🛒 Switched to Customer Shopping Portal');
    }
  },

  switchDemoRole(role) {
    this.switchActiveRole(role);
  },

  toggleViewportMode() {
    const shell = document.getElementById('device-shell');
    if (!shell) return;
    const isFull = shell.classList.toggle('mode-fullscreen');
    AppUtils.showToast(isFull ? 'Responsive Fullscreen Mode' : 'Android 390x844 Frame Mode');
  }
};

// Utilities for Toast, Bottom Sheet, Status Formatters
const AppUtils = {
  showToast(message, duration = 2800) {
    const toast = document.getElementById('global-snackbar');
    const textEl = document.getElementById('snackbar-text');
    if (!toast || !textEl) return;

    textEl.textContent = message;
    toast.classList.add('visible');

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('visible');
    }, duration);
  },

  showBottomSheet(contentHtml) {
    const overlay = document.getElementById('global-bottom-sheet');
    const card = document.getElementById('bottom-sheet-content');
    if (!overlay || !card) return;

    card.innerHTML = contentHtml;
    overlay.classList.add('open');
  },

  closeBottomSheet() {
    const overlay = document.getElementById('global-bottom-sheet');
    if (overlay) overlay.classList.remove('open');
  },

  getStatusChipClass(status) {
    if (!status) return 'chip-new';
    const s = status.toLowerCase();
    if (s === 'new') return 'chip-new';
    if (s === 'accepted') return 'chip-accepted';
    if (s === 'preparing') return 'chip-preparing';
    if (s === 'out for delivery') return 'chip-delivery';
    if (s === 'ready for pickup') return 'chip-pickup';
    if (s === 'delivered') return 'chip-delivered';
    if (s === 'cancelled') return 'chip-cancelled';
    return 'chip-accepted';
  }
};

// Close bottom sheet if backdrop clicked
document.addEventListener('click', (e) => {
  const overlay = document.getElementById('global-bottom-sheet');
  if (overlay && e.target === overlay) {
    AppUtils.closeBottomSheet();
  }
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  AppRouter.init();
});
