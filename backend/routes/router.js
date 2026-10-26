/* =====================================================================
   MANEYINDA MARUKATTE - REST API ROUTER
   High-performance zero-dependency path pattern matcher & request dispatcher
   with Role-Based Access Control and Protected Admin Guards.
===================================================================== */

const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const entrepreneurController = require('../controllers/entrepreneurController');
const reviewController = require('../controllers/reviewController');
const supportController = require('../controllers/supportController');
const adminController = require('../controllers/adminController');
const uploadController = require('../controllers/uploadController');
const paymentController = require('../controllers/paymentController');
const offerController = require('../controllers/offerController');
const advertisementController = require('../controllers/advertisementController');
const AuthMiddleware = require('../middleware/auth');

class Router {
  constructor() {
    this.routes = [];
    this.initRoutes();
  }

  add(method, pathPattern, handler) {
    const paramNames = [];
    const regexPath = pathPattern.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^\\/]+)';
    });

    const regex = new RegExp(`^${regexPath}\\/?$`);
    this.routes.push({
      method: method.toUpperCase(),
      pattern: pathPattern,
      regex,
      paramNames,
      handler
    });
  }

  initRoutes() {
    // Root & API Welcome Index
    const indexHandler = (req, res) => {
      return res.status(200).json({
        success: true,
        service: 'Maneyinda Marukatte (ಮನೆಯಿಂದ ಮಾರುಕಟ್ಟೆ) REST API',
        version: '1.0.0',
        status: 'UP',
        message: 'Welcome to the Maneyinda Marukatte API. Below are the primary endpoints.',
        endpoints: {
          health: '/api/health',
          products: '/api/products',
          categories: '/api/admin/categories',
          orders: '/api/orders',
          entrepreneurs: '/api/entrepreneurs',
          aiTrends: '/api/admin/ai-trends'
        },
        documentation: 'Refer to API_CONTRACT.md for the full specification'
      });
    };

    // Root route: Serve frontend index.html
    this.add('GET', '/', (req, res) => {
      const fs = require('fs');
      const path = require('path');
      const candidates = [
        path.join(__dirname, '../../index.html'),
        path.join(__dirname, '../index.html'),
        path.join(process.cwd(), 'index.html')
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          if (res.setHeader) res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.end(fs.readFileSync(p));
        }
      }
      if (res.setHeader) res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end('<!DOCTYPE html><html><body>Maneyindha Marukatte</body></html>');
    });

    this.add('GET', '/api', indexHandler);
    this.add('GET', '/api/', indexHandler);

    // Health check
    this.add('GET', '/api/health', (req, res) => {
      return res.status(200).json({
        success: true,
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'Maneyinda Marukatte REST API'
      });
    });

    // --- Authentication & Session Security ---
    this.add('GET', '/api/auth/email-status', authController.getEmailStatus);
    this.add('POST', '/api/auth/send-otp', authController.sendOtp);
    this.add('POST', '/api/auth/verify-otp', authController.verifyOtp);
    this.add('POST', '/api/auth/login-customer', authController.loginCustomer);
    this.add('POST', '/api/auth/login-entrepreneur', authController.loginEntrepreneur);
    this.add('POST', '/api/auth/login-admin', authController.loginAdmin);
    this.add('GET', '/api/auth/me', authController.getCurrentUser);
    this.add('POST', '/api/auth/switch-role', authController.switchRole);
    this.add('POST', '/api/auth/reset-password', authController.resetPassword);

    // --- Products ---
    this.add('GET', '/api/products', productController.getProducts);
    this.add('GET', '/api/products/:id', productController.getProductById);
    this.add('POST', '/api/products', productController.createProduct);
    this.add('PUT', '/api/products/:id', productController.updateProduct);
    this.add('PATCH', '/api/products/:id/stock', productController.updateStock);
    this.add('DELETE', '/api/products/:id', productController.deleteProduct);

    // --- Orders ---
    this.add('GET', '/api/orders', orderController.getOrders);
    this.add('GET', '/api/orders/:id', orderController.getOrderById);
    this.add('POST', '/api/orders', orderController.createOrder);
    this.add('PATCH', '/api/orders/:id/status', orderController.updateStatus);
    this.add('POST', '/api/orders/:id/cancel', orderController.cancelOrder);
    this.add('POST', '/api/orders/:id/after-sales', orderController.submitAfterSales);

    // --- Entrepreneurs ---
    this.add('GET', '/api/entrepreneurs', entrepreneurController.getEntrepreneurs);
    this.add('GET', '/api/entrepreneurs/:id', entrepreneurController.getEntrepreneurById);
    this.add('POST', '/api/entrepreneurs/register', entrepreneurController.registerEntrepreneur);
    this.add('PATCH', '/api/entrepreneurs/:id/availability', entrepreneurController.updateAvailability);
    this.add('PUT', '/api/entrepreneurs/:id', entrepreneurController.updateProfile);

    // --- Reviews ---
    this.add('GET', '/api/reviews', reviewController.getReviews);
    this.add('POST', '/api/reviews', reviewController.createReview);
    this.add('DELETE', '/api/reviews/:id', reviewController.deleteReview);

    // --- Support Tickets ---
    this.add('GET', '/api/support/tickets', supportController.getTickets);
    this.add('GET', '/api/support/tickets/:id', supportController.getTicketById);
    this.add('POST', '/api/support/tickets', supportController.createTicket);
    this.add('PATCH', '/api/support/tickets/:id/resolve', supportController.resolveTicket);

    // --- Admin & Platform (STRICT SERVER-SIDE AUTHORIZATION GUARD) ---
    // Every admin endpoint strictly checks cryptographic admin signature
    const adminGuard = (handler) => (req, res) => {
      AuthMiddleware.requireAdmin(req, res, () => handler(req, res));
    };

    // --- Entrepreneur Self-Service (STRICT SERVER-SIDE AUTHORIZATION GUARD) ---
    // Every entrepreneur endpoint strictly checks cryptographic token & entrepreneur identity
    const entrepreneurGuard = (handler) => (req, res) => {
      AuthMiddleware.requireEntrepreneur(req, res, () => handler(req, res));
    };

    this.add('GET', '/api/admin/verification-queue', adminGuard(adminController.getVerificationQueue));
    this.add('POST', '/api/admin/verify/:id', adminGuard(adminController.verifyEntrepreneur));
    this.add('POST', '/api/admin/assign-badge/:id', adminGuard(adminController.assignBadge));
    this.add('GET', '/api/admin/ai-trends', adminGuard(adminController.getAiTrends));
    this.add('GET', '/api/admin/categories', adminGuard(adminController.getCategories));
    this.add('POST', '/api/admin/categories', adminGuard(adminController.createCategory));
    this.add('PATCH', '/api/admin/categories/:id/toggle', adminGuard(adminController.toggleCategory));
    this.add('GET', '/api/admin/logs', adminGuard(adminController.getActivityLogs));
    this.add('GET', '/api/admin/reports', adminGuard(adminController.getReportedProducts));
    this.add('POST', '/api/admin/reports/:index/dismiss', adminGuard(adminController.dismissReport));

    // --- Media Upload ---
    this.add('POST', '/api/upload', uploadController.handleUpload);

    // --- Payments (Razorpay Real Payment Gateway) ---
    this.add('GET', '/api/payments/status', paymentController.getPaymentConfigStatus);
    this.add('POST', '/api/payments/create-order', paymentController.createRazorpayOrder);
    this.add('POST', '/api/payments/verify', paymentController.verifyPaymentSignature);
    this.add('POST', '/api/payments/webhook', paymentController.handleWebhook);
    this.add('GET', '/api/admin/payments', adminGuard(paymentController.getAllTransactions));
    this.add('POST', '/api/admin/payments/:orderId/refund', adminGuard(paymentController.processRefund));

    // --- Entrepreneur Offers Management (Self-Service & Protected) ---
    this.add('GET', '/api/entrepreneurs/me/offers', entrepreneurGuard(offerController.getEntrepreneurOffers));
    this.add('GET', '/api/entrepreneurs/me/offers/:id', entrepreneurGuard(offerController.getEntrepreneurOfferById));
    this.add('POST', '/api/entrepreneurs/me/offers', entrepreneurGuard(offerController.createEntrepreneurOffer));
    this.add('PUT', '/api/entrepreneurs/me/offers/:id', entrepreneurGuard(offerController.updateEntrepreneurOffer));
    this.add('PATCH', '/api/entrepreneurs/me/offers/:id/toggle', entrepreneurGuard(offerController.toggleEntrepreneurOffer));
    this.add('DELETE', '/api/entrepreneurs/me/offers/:id', entrepreneurGuard(offerController.deleteEntrepreneurOffer));
    this.add('GET', '/api/entrepreneurs/me/offers/:id/performance', entrepreneurGuard(offerController.getOfferPerformance));

    // --- Entrepreneur Advertisements (Self-Service & Protected) ---
    this.add('GET', '/api/entrepreneurs/me/advertisements', entrepreneurGuard(advertisementController.getEntrepreneurAds));
    this.add('GET', '/api/entrepreneurs/me/advertisements/:id', entrepreneurGuard(advertisementController.getEntrepreneurAdById));
    this.add('POST', '/api/entrepreneurs/me/advertisements', entrepreneurGuard(advertisementController.createEntrepreneurAd));
    this.add('PUT', '/api/entrepreneurs/me/advertisements/:id', entrepreneurGuard(advertisementController.updateEntrepreneurAd));
    this.add('PATCH', '/api/entrepreneurs/me/advertisements/:id/toggle', entrepreneurGuard(advertisementController.toggleEntrepreneurAd));
    this.add('DELETE', '/api/entrepreneurs/me/advertisements/:id', entrepreneurGuard(advertisementController.deleteEntrepreneurAd));
    this.add('GET', '/api/entrepreneurs/me/advertisements/:id/performance', entrepreneurGuard(advertisementController.getAdPerformance));

    // --- Public Advertisements & Analytics Tracking ---
    this.add('GET', '/api/advertisements', advertisementController.getPublicAdvertisements);
    this.add('GET', '/api/advertisements/:id', advertisementController.getAdvertisementById);
    this.add('POST', '/api/advertisements/:id/impression', advertisementController.recordImpression);
    this.add('POST', '/api/advertisements/:id/click', advertisementController.recordClick);

    // --- Admin Advertisements Review & Moderation (Protected) ---
    this.add('GET', '/api/admin/advertisements', adminGuard(advertisementController.getAdminAds));
    this.add('PATCH', '/api/admin/advertisements/:id/review', adminGuard(advertisementController.reviewAdminAd));
    this.add('DELETE', '/api/admin/advertisements/:id', adminGuard(advertisementController.deleteAdminAd));

    // --- Promotional Offers & Announcements ---
    this.add('GET', '/api/offers', offerController.getActiveOffers);
    this.add('GET', '/api/offers/:id', offerController.getOfferById);
    this.add('POST', '/api/offers/validate', offerController.validateCoupon);
    this.add('GET', '/api/promotions/announcements', offerController.getAnnouncements);
    this.add('GET', '/api/admin/offers', adminGuard(offerController.getAdminOffers));
    this.add('POST', '/api/admin/offers', adminGuard(offerController.createOffer));
    this.add('PUT', '/api/admin/offers/:id', adminGuard(offerController.updateOffer));
    this.add('PATCH', '/api/admin/offers/:id/toggle', adminGuard(offerController.toggleOffer));
    this.add('PATCH', '/api/admin/offers/:id/moderate', adminGuard(offerController.moderateOffer));
    this.add('DELETE', '/api/admin/offers/:id', adminGuard(offerController.deleteOffer));
  }

  match(method, pathname) {
    const targetMethod = method.toUpperCase();

    for (const route of this.routes) {
      if (route.method !== targetMethod) continue;
      const match = pathname.match(route.regex);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, i) => {
          params[name] = decodeURIComponent(match[i + 1]);
        });
        return {
          handler: route.handler,
          params
        };
      }
    }

    return null;
  }
}

module.exports = new Router();
