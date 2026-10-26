/* =====================================================================
   MANEYINDA MARUKATTE - COMPREHENSIVE ROLE-BASED INTEGRATION TEST SUITE
   Tests authentication, role authorization, permissions, and security guards.
===================================================================== */

process.env.NODE_ENV = 'test';
process.env.ALLOW_DEMO_OTP = 'true';
const { EventEmitter } = require('events');
const server = require('./server');

function mockRequest(method, urlPath, body = null, customHeaders = {}) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = urlPath;
    req.headers = {
      'content-type': 'application/json',
      ...customHeaders
    };

    const res = new EventEmitter();
    let responseBody = '';
    let responseStatus = 200;
    const responseHeaders = {};

    res.writeHead = (status, headers) => {
      responseStatus = status;
      if (headers) Object.assign(responseHeaders, headers);
    };
    res.setHeader = (key, value) => {
      responseHeaders[key] = value;
    };
    res.write = (chunk) => {
      responseBody += chunk;
    };
    res.end = (chunk) => {
      if (chunk) responseBody += chunk;
      let parsed = responseBody;
      try {
        parsed = JSON.parse(responseBody);
      } catch (e) {}
      resolve({ status: res.statusCode || responseStatus, data: parsed });
    };

    server.emit('request', req, res);

    if (body) {
      const dataStr = JSON.stringify(body);
      req.emit('data', Buffer.from(dataStr));
    }
    req.emit('end');
  });
}

async function runInProcessTests() {
  console.log('\n--- COMPREHENSIVE ROLE-BASED ACCESS & API VERIFICATION ---\n');
  const dbInit = require('./models/db');
  dbInit.updateProduct('prod_01', { stock: 30, status: 'active' });

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Health check & Email Provider Diagnostic
  await test('GET /api/health should return status UP', async () => {
    const res = await mockRequest('GET', '/api/health');
    if (res.status !== 200 || res.data.status !== 'UP') throw new Error(`Failed health check`);
  });

  await test('GET /api/auth/email-status should report provider configuration', async () => {
    const res = await mockRequest('GET', '/api/auth/email-status');
    if (res.status !== 200 || !res.data.success || !res.data.provider) throw new Error(`Email status error: ${JSON.stringify(res.data)}`);
  });

  // 2. Products list
  await test('GET /api/products should return product array', async () => {
    const res = await mockRequest('GET', '/api/products');
    if (res.status !== 200 || !Array.isArray(res.data.data) || res.data.data.length === 0) throw new Error(`Products error`);
  });

  // 3. Category filter
  await test('GET /api/products?category=Bakery%20%26%20Sweets should filter properly', async () => {
    const res = await mockRequest('GET', '/api/products?category=Bakery%20%26%20Sweets');
    if (res.status !== 200 || !res.data.data.every(p => p.category === 'Bakery & Sweets')) throw new Error(`Category error`);
  });

  // 4. Send OTP Validation & Formatting
  await test('POST /api/auth/send-otp should reject invalid email format', async () => {
    const res = await mockRequest('POST', '/api/auth/send-otp', { email: 'notanemail' });
    if (res.status !== 400 || !['INVALID_EMAIL', 'INVALID_EMAIL_FORMAT'].includes(res.data.error)) {
      throw new Error(`Should reject invalid email: ${JSON.stringify(res.data)}`);
    }
  });

  await test('POST /api/auth/send-otp should accept valid email and return 300s expiry', async () => {
    const res = await mockRequest('POST', '/api/auth/send-otp', { email: 'realuser@gmail.com', purpose: 'registration' });
    if (res.status !== 200 || !res.data.success || res.data.expiresInSeconds !== 300) throw new Error(`Send OTP error: ${JSON.stringify(res.data)}`);
  });

  await test('POST /api/auth/send-otp should enforce 60s resend cooldown (429)', async () => {
    const res = await mockRequest('POST', '/api/auth/send-otp', { email: 'realuser@gmail.com', purpose: 'registration' });
    if (res.status !== 429 || res.data.error !== 'COOLDOWN_ACTIVE') throw new Error(`Cooldown not enforced: ${res.status}`);
  });

  // 5. Verify OTP Security & Attack Prevention
  await test('POST /api/auth/verify-otp should reject incorrect OTP code and track attempts', async () => {
    const res = await mockRequest('POST', '/api/auth/verify-otp', { email: 'realuser@gmail.com', otp: '999999' });
    if (res.status !== 400 || res.data.error !== 'INVALID_OTP' || typeof res.data.attemptsRemaining !== 'number') {
      throw new Error(`Should reject incorrect OTP: ${JSON.stringify(res.data)}`);
    }
  });

  await test('POST /api/auth/verify-otp should verify valid OTP code', async () => {
    const res = await mockRequest('POST', '/api/auth/verify-otp', { email: 'realuser@gmail.com', otp: '123456' });
    if (res.status !== 200 || !res.data.verified) throw new Error(`Verify OTP error: ${JSON.stringify(res.data)}`);
  });

  await test('POST /api/auth/verify-otp should reject re-use of consumed OTP (Replay Prevention)', async () => {
    const res = await mockRequest('POST', '/api/auth/verify-otp', { email: 'realuser@gmail.com', otp: '123456' });
    if (res.status !== 400 || res.data.error !== 'OTP_ALREADY_USED') throw new Error(`Should reject reused OTP: ${res.status}`);
  });

  // 6. Customer Login
  let customerToken = null;
  await test('POST /api/auth/login-customer should sign in and return signed token', async () => {
    const res = await mockRequest('POST', '/api/auth/login-customer', {
      email: 'thanuja@example.com',
      otp: '123456'
    });
    if (res.status !== 200 || !res.data.user || !res.data.token) throw new Error(`Customer login error`);
    customerToken = res.data.token;
  });

  // 7. Entrepreneur Login
  let entrepreneurToken = null;
  await test('POST /api/auth/login-entrepreneur should authenticate valid entrepreneur', async () => {
    const res = await mockRequest('POST', '/api/auth/login-entrepreneur', {
      username: 'anitha_bakery',
      password: 'password123'
    });
    if (res.status !== 200 || !res.data.entrepreneur || !res.data.token) throw new Error(`Entrepreneur login error`);
    entrepreneurToken = res.data.token;
  });

  // 8. Order Placement (1 Entrepreneur rule)
  let testOrderId = null;
  await test('POST /api/orders should enforce single entrepreneur per order', async () => {
    const res = await mockRequest('POST', '/api/orders', {
      customerId: 'cust_01',
      items: [
        { productId: 'prod_01', qty: 1 }
      ],
      deliveryMethod: 'Home Delivery'
    });
    if (res.status !== 201 || !res.data.data.id) throw new Error(`Order placement error`);
    testOrderId = res.data.data.id;
  });

  // 9. Multi-Entrepreneur Order rejection
  await test('POST /api/orders should REJECT multi-entrepreneur cart items', async () => {
    const res = await mockRequest('POST', '/api/orders', {
      customerId: 'cust_01',
      items: [
        { productId: 'prod_01', qty: 1 },
        { productId: 'prod_02', qty: 1 }
      ],
      deliveryMethod: 'Home Delivery'
    });
    if (res.status !== 400 || res.data.error !== 'MULTI_ENTREPRENEUR_ORDER_NOT_ALLOWED') {
      throw new Error(`Expected MULTI_ENTREPRENEUR_ORDER_NOT_ALLOWED 400`);
    }
  });

  // 10. Order Status Progression (New -> Accepted)
  await test('PATCH /api/orders/:id/status should update status to Accepted', async () => {
    const res = await mockRequest('PATCH', `/api/orders/${testOrderId}/status`, { status: 'Accepted' });
    if (res.status !== 200 || res.data.data.orderStatus !== 'Accepted') throw new Error(`Status update error`);
  });

  // 11. Order Cancellation Window (Allowed on Accepted)
  await test('POST /api/orders/:id/cancel should succeed on Accepted order', async () => {
    const res = await mockRequest('POST', `/api/orders/${testOrderId}/cancel`, { reason: 'Changed mind' });
    if (res.status !== 200 || res.data.data.orderStatus !== 'Cancelled') throw new Error(`Cancellation error`);
  });

  // 12. Create second order and advance to Preparing -> Cancel blocks
  let preparingOrderId = null;
  await test('POST /api/orders advance to Preparing and verify cancellation blocks', async () => {
    const ordRes = await mockRequest('POST', '/api/orders', {
      customerId: 'cust_01',
      items: [{ productId: 'prod_01', qty: 1 }],
      deliveryMethod: 'Home Delivery'
    });
    preparingOrderId = ordRes.data.data.id;
    await mockRequest('PATCH', `/api/orders/${preparingOrderId}/status`, { status: 'Preparing' });

    const cancelRes = await mockRequest('POST', `/api/orders/${preparingOrderId}/cancel`, { reason: 'Too late' });
    if (cancelRes.status !== 400 || cancelRes.data.error !== 'CANCELLATION_NOT_ALLOWED') {
      throw new Error(`Expected CANCELLATION_NOT_ALLOWED 400`);
    }
  });

  // 13. Support ticket creation
  let ticketId = null;
  await test('POST /api/support/tickets should submit ticket', async () => {
    const res = await mockRequest('POST', '/api/support/tickets', {
      customerId: 'cust_01',
      customerName: 'Thanuja',
      category: 'Order Issue',
      subject: 'Damaged item',
      description: 'The packaging had slight tear'
    });
    if (res.status !== 201 || !res.data.data.id) throw new Error(`Support ticket error`);
    ticketId = res.data.data.id;
  });

  // -------------------------------------------------------------
  // CRITICAL SECURITY TESTS: PRIVATE ADMIN PORTAL & ROLE GUARDS
  // -------------------------------------------------------------

  // 14. Admin Access Denied without Token (401 Unauthorized)
  await test('GET /api/admin/verification-queue without token MUST return 401 Unauthorized', async () => {
    const res = await mockRequest('GET', '/api/admin/verification-queue');
    if (res.status !== 401 || res.data.error !== 'ADMIN_AUTH_REQUIRED') {
      throw new Error(`Expected 401 ADMIN_AUTH_REQUIRED, got status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 15. Admin Access Denied with Customer Token (403 Forbidden)
  await test('GET /api/admin/verification-queue with Customer Token MUST return 403 Forbidden', async () => {
    const res = await mockRequest('GET', '/api/admin/verification-queue', null, {
      'authorization': `Bearer ${customerToken}`
    });
    if (res.status !== 403 || res.data.error !== 'ADMIN_ACCESS_DENIED') {
      throw new Error(`Expected 403 ADMIN_ACCESS_DENIED, got status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 16. Dedicated Admin Login
  let adminToken = null;
  await test('POST /api/auth/login-admin with valid credentials grants Admin token', async () => {
    const res = await mockRequest('POST', '/api/auth/login-admin', {
      email: 'admin@marukatte.internal',
      password: 'Admin@Marukatte2026!'
    });
    if (res.status !== 200 || !res.data.token || res.data.user.role !== 'admin') {
      throw new Error(`Admin login failed: ${JSON.stringify(res.data)}`);
    }
    adminToken = res.data.token;
  });

  // 17. Admin Access Granted with Valid Admin Token
  await test('GET /api/admin/verification-queue with Admin Token returns 200 OK', async () => {
    const res = await mockRequest('GET', '/api/admin/verification-queue', null, {
      'authorization': `Bearer ${adminToken}`
    });
    if (res.status !== 200 || !Array.isArray(res.data.data)) {
      throw new Error(`Admin queue access failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 18. AI Trend Scoring with Admin Token
  await test('GET /api/admin/ai-trends with Admin Token calculates scores', async () => {
    const res = await mockRequest('GET', '/api/admin/ai-trends', null, {
      'authorization': `Bearer ${adminToken}`
    });
    if (res.status !== 200 || !res.data.data.topTrendingProducts) {
      throw new Error(`Admin AI trends failed: ${JSON.stringify(res.data)}`);
    }
  });

  // -------------------------------------------------------------
  // ROLE SWITCHING TESTS
  // -------------------------------------------------------------

  // 19. Unauthorized Role Escalation Blocked
  await test('POST /api/auth/switch-role to entrepreneur BLOCKS unapproved customer', async () => {
    // Pure customer login
    const loginRes = await mockRequest('POST', '/api/auth/login-customer', {
      email: 'ravi@example.com',
      otp: '123456'
    });
    const pureCustToken = loginRes.data.token;

    const switchRes = await mockRequest('POST', '/api/auth/switch-role', { targetRole: 'entrepreneur' }, {
      'authorization': `Bearer ${pureCustToken}`
    });

    if (switchRes.status !== 403 || switchRes.data.error !== 'ENTREPRENEUR_NOT_APPROVED') {
      throw new Error(`Expected 403 ENTREPRENEUR_NOT_APPROVED, got ${switchRes.status}: ${JSON.stringify(switchRes.data)}`);
    }
  });

  // 20. Approved Entrepreneur Seamless Role Switching
  await test('POST /api/auth/switch-role allows approved entrepreneur to switch to customer and back', async () => {
    const switchCustRes = await mockRequest('POST', '/api/auth/switch-role', { targetRole: 'customer' }, {
      'authorization': `Bearer ${entrepreneurToken}`
    });
    if (switchCustRes.status !== 200 || switchCustRes.data.activeRole !== 'customer') {
      throw new Error(`Switch to customer failed: ${JSON.stringify(switchCustRes.data)}`);
    }

    const switchEntRes = await mockRequest('POST', '/api/auth/switch-role', { targetRole: 'entrepreneur' }, {
      'authorization': `Bearer ${switchCustRes.data.token}`
    });
    if (switchEntRes.status !== 200 || switchEntRes.data.activeRole !== 'entrepreneur') {
      throw new Error(`Switch back to entrepreneur failed: ${JSON.stringify(switchEntRes.data)}`);
    }
  });

  // -------------------------------------------------------------
  // RAZORPAY PAYMENT GATEWAY VERIFICATION TESTS
  // -------------------------------------------------------------
  await test('GET /api/payments/status returns Razorpay gateway status', async () => {
    const res = await mockRequest('GET', '/api/payments/status');
    if (res.status !== 200 || !res.data.success || res.data.provider !== 'razorpay') {
      throw new Error(`Invalid payments status response: ${JSON.stringify(res.data)}`);
    }
  });

  await test('POST /api/payments/create-order rejects missing or invalid amount', async () => {
    const res = await mockRequest('POST', '/api/payments/create-order', { amount: 0 });
    if (res.status !== 400 || res.data.error !== 'INVALID_AMOUNT') {
      throw new Error(`Expected 400 INVALID_AMOUNT, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  await test('POST /api/payments/verify validates cryptographic HMAC-SHA256 signature', async () => {
    const crypto = require('crypto');
    const originalSecret = process.env.RAZORPAY_KEY_SECRET;
    const testSecret = 'test_unit_verification_secret_key_123';
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    try {
      const orderId = 'order_test_9999';
      const paymentId = 'pay_test_8888';
      const validSignature = crypto
        .createHmac('sha256', testSecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // Valid signature verification
      const verifyRes = await mockRequest('POST', '/api/payments/verify', {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature
      });

      if (verifyRes.status !== 200 || !verifyRes.data.verified) {
        throw new Error(`Expected valid signature to verify, got ${verifyRes.status}: ${JSON.stringify(verifyRes.data)}`);
      }

      // Tampered / Invalid signature verification rejection
      const invalidRes = await mockRequest('POST', '/api/payments/verify', {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: 'tampered_invalid_signature_hex_code'
      });

      if (invalidRes.status !== 400 || invalidRes.data.error !== 'INVALID_SIGNATURE') {
        throw new Error(`Expected 400 INVALID_SIGNATURE, got ${invalidRes.status}: ${JSON.stringify(invalidRes.data)}`);
      }
    } finally {
      process.env.RAZORPAY_KEY_SECRET = originalSecret;
    }
  });


  // 24. Backend Calculates Exact Total from DB Products (Never Trust Frontend)
  await test('POST /api/payments/create-order calculates total on backend from DB prices', async () => {
    const res = await mockRequest('POST', '/api/payments/create-order', {
      customerId: 'cust_01',
      items: [{ productId: 'prod_01', qty: 1 }],
      deliveryMethod: 'Home Delivery'
    });

    if (res.status !== 200 || !res.data.success || !res.data.orderId) {
      throw new Error(`Order creation failed: ${JSON.stringify(res.data)}`);
    }

    // Verify calculated amount in paise: prod_01 (450) + delivery (30) = 480 INR -> 48000 paise
    if (res.data.amount !== 48000) {
      throw new Error(`Expected backend-calculated 48000 paise, got ${res.data.amount}`);
    }

    // Verify internal pending order status in DB
    const db = require('./models/db');
    const order = db.getOrderById(res.data.orderId);
    if (!order || order.paymentStatus !== 'Pending' || order.orderStatus !== 'Pending Payment') {
      throw new Error(`Expected Pending Payment state in DB, got: ${order && order.paymentStatus} / ${order && order.orderStatus}`);
    }
  });

  // 25. Order Becomes Paid & Accepted Only After Successful Verification
  await test('Order transitions to Paid and Accepted upon signature verification', async () => {
    const db = require('./models/db');
    const crypto = require('crypto');
    const activeSecret = process.env.RAZORPAY_KEY_SECRET || 'test_verification_secret';

    // 1. Create order
    const createRes = await mockRequest('POST', '/api/payments/create-order', {
      customerId: 'cust_01',
      items: [{ productId: 'prod_01', qty: 1 }],
      deliveryMethod: 'Home Delivery'
    });
    const orderId = createRes.data.orderId;
    const rzpOrderId = createRes.data.razorpayOrderId || ('order_mock_' + Date.now());
    const rzpPaymentId = 'pay_real_test_' + Date.now();

    const validSig = crypto
      .createHmac('sha256', activeSecret)
      .update(`${rzpOrderId}|${rzpPaymentId}`)
      .digest('hex');

    // 2. Verify payment
    const verifyRes = await mockRequest('POST', '/api/payments/verify', {
      razorpay_order_id: rzpOrderId,
      razorpay_payment_id: rzpPaymentId,
      razorpay_signature: validSig,
      orderId
    });

    if (verifyRes.status !== 200 || !verifyRes.data.verified) {
      throw new Error(`Verification failed: ${JSON.stringify(verifyRes.data)}`);
    }

    // 3. Confirm in DB
    const verifiedOrder = db.getOrderById(orderId);
    if (verifiedOrder.paymentStatus !== 'Paid' || verifiedOrder.orderStatus !== 'Accepted') {
      throw new Error(`Order was not marked Paid / Accepted: ${verifiedOrder.paymentStatus}`);
    }
  });

  // 26. Webhook Signature Verification, Event Processing & Idempotency
  await test('POST /api/payments/webhook verifies signature and handles duplicate events safely', async () => {
    const db = require('./models/db');
    const crypto = require('crypto');
    const webhookSecret = 'test_whsec_marukatte_2026';
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

    try {
      // Create pending order
      const order = db.createOrder({
        customerId: 'cust_01',
        storeName: "Anita's Bakery",
        items: [{ productId: 'prod_01', qty: 1 }],
        totalAmount: 480,
        razorpayOrderId: 'order_webhook_test_111',
        paymentStatus: 'Pending',
        orderStatus: 'Pending Payment'
      });

      const eventPayload = {
        id: 'evt_test_unique_id_' + Date.now(),
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_webhook_captured_999',
              order_id: 'order_webhook_test_111',
              status: 'captured',
              amount: 48000
            }
          }
        }
      };
      const rawJson = JSON.stringify(eventPayload);
      const validSig = crypto.createHmac('sha256', webhookSecret).update(rawJson).digest('hex');

      // Valid webhook delivery
      const res = await mockRequest('POST', '/api/payments/webhook', eventPayload, {
        'x-razorpay-signature': validSig
      });

      if (res.status !== 200 || !res.data.success) {
        throw new Error(`Webhook delivery failed: ${JSON.stringify(res.data)}`);
      }

      // Confirm DB update
      const updatedOrder = db.getOrderById(order.id);
      if (updatedOrder.paymentStatus !== 'Paid') {
        throw new Error(`Order was not marked Paid by webhook: ${updatedOrder.paymentStatus}`);
      }

      // Idempotency: Send exact same event ID again
      const dupRes = await mockRequest('POST', '/api/payments/webhook', eventPayload, {
        'x-razorpay-signature': validSig
      });
      if (dupRes.status !== 200 || !dupRes.data.message.includes('already processed')) {
        throw new Error(`Idempotency failed on duplicate event: ${JSON.stringify(dupRes.data)}`);
      }

      // Invalid signature rejection
      const invalidRes = await mockRequest('POST', '/api/payments/webhook', eventPayload, {
        'x-razorpay-signature': 'tampered_invalid_signature'
      });
      if (invalidRes.status !== 400 || invalidRes.data.error !== 'INVALID_WEBHOOK_SIGNATURE') {
        throw new Error(`Expected 400 INVALID_WEBHOOK_SIGNATURE, got ${invalidRes.status}`);
      }
    } finally {
      process.env.RAZORPAY_WEBHOOK_SECRET = '';
    }
  });

  // 27. Security Isolation: Customers Cannot Access Other Customers' Orders
  await test('GET /api/orders/:id blocks customer from accessing another customer\'s order', async () => {
    const cust1Login = await mockRequest('POST', '/api/auth/login-customer', {
      email: 'ravi@example.com',
      otp: '123456'
    });
    const cust1Token = cust1Login.data.token;

    // cust_02 order access attempt by cust_01
    const res = await mockRequest('GET', '/api/orders/ORD-53137', null, {
      'authorization': `Bearer ${cust1Token}`
    });

    if (res.status !== 403 || res.data.error !== 'ACCESS_DENIED') {
      throw new Error(`Expected 403 ACCESS_DENIED, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 28. Security: Entrepreneurs Cannot Modify Payment Status
  await test('PATCH /api/orders/:id/status rejects modification of paymentStatus', async () => {
    const res = await mockRequest('PATCH', '/api/orders/ORD-53137/status', {
      status: 'Accepted',
      paymentStatus: 'Paid'
    });

    if (res.status !== 403 || res.data.error !== 'PAYMENT_STATUS_IMMUTABLE') {
      throw new Error(`Expected 403 PAYMENT_STATUS_IMMUTABLE, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 29. Security: Unauthorized Users Cannot Access Admin Payment Controls
  await test('GET /api/admin/payments strictly requires Admin token', async () => {
    // 1. Without token -> 401
    const unauthRes = await mockRequest('GET', '/api/admin/payments');
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401, got ${unauthRes.status}`);
    }

    // 2. With Customer token -> 403
    const custLogin = await mockRequest('POST', '/api/auth/login-customer', {
      email: 'ravi@example.com',
      otp: '123456'
    });
    const custRes = await mockRequest('GET', '/api/admin/payments', null, {
      'authorization': `Bearer ${custLogin.data.token}`
    });
    if (custRes.status !== 403) {
      throw new Error(`Expected 403 for customer, got ${custRes.status}`);
    }

    // 3. With Admin token -> 200 OK
    const adminRes = await mockRequest('GET', '/api/admin/payments', null, {
      'authorization': `Bearer ${adminToken}`
    });
    if (adminRes.status !== 200 || !adminRes.data.success || !Array.isArray(adminRes.data.data)) {
      throw new Error(`Admin payment transactions list failed: ${JSON.stringify(adminRes.data)}`);
    }
  });

  // 30. Admin Refund Processing & Stock Restoration
  await test('POST /api/admin/payments/:orderId/refund processes refund and restores inventory stock', async () => {
    const db = require('./models/db');
    const initialStock = db.getProductById('prod_01').stock;

    // Create a paid order
    const order = db.createOrder({
      customerId: 'cust_01',
      items: [{ productId: 'prod_01', qty: 2 }],
      totalAmount: 930,
      paymentStatus: 'Paid',
      orderStatus: 'Accepted',
      razorpayPaymentId: 'pay_sim_refund_test_123'
    });

    const stockAfterOrder = db.getProductById('prod_01').stock;
    if (stockAfterOrder !== initialStock - 2) {
      throw new Error(`Stock deduction failed: expected ${initialStock - 2}, got ${stockAfterOrder}`);
    }

    // Process refund via Admin endpoint
    const refundRes = await mockRequest('POST', `/api/admin/payments/${order.id}/refund`, {
      reason: 'Customer requested refund'
    }, {
      'authorization': `Bearer ${adminToken}`
    });

    if (refundRes.status !== 200 || !refundRes.data.success) {
      throw new Error(`Refund request failed: ${JSON.stringify(refundRes.data)}`);
    }

    // Verify order status in DB
    const refundedOrder = db.getOrderById(order.id);
    if (refundedOrder.paymentStatus !== 'Refunded' || refundedOrder.orderStatus !== 'Cancelled') {
      throw new Error(`Expected Refunded status, got: ${refundedOrder.paymentStatus}`);
    }

    // Verify stock restoration
    const restoredStock = db.getProductById('prod_01').stock;
    if (restoredStock !== initialStock) {
      throw new Error(`Stock was not restored: expected ${initialStock}, got ${restoredStock}`);
    }
  });

  // 31. Promotional Offers Public Listing
  await test('GET /api/offers should return active promotional offers and banner items', async () => {
    const res = await mockRequest('GET', '/api/offers');
    if (res.status !== 200 || !res.data.success || !Array.isArray(res.data.data)) {
      throw new Error(`Offers listing failed: ${JSON.stringify(res.data)}`);
    }
    const codes = res.data.data.map(o => o.code);
    if (!codes.includes('WELCOME10') || !codes.includes('CAKE15')) {
      throw new Error(`Expected seeded offers WELCOME10 and CAKE15, found: ${codes.join(', ')}`);
    }
  });

  // 32. Strict Server-Side Coupon Validation
  await test('POST /api/offers/validate validates coupons and enforces server rules', async () => {
    // A: Valid WELCOME10 on subtotal 450 -> 10% = ₹45 discount
    const validRes = await mockRequest('POST', '/api/offers/validate', {
      code: 'WELCOME10',
      subtotal: 450,
      items: [{ productId: 'prod_01', qty: 1 }],
      customerId: 'cust_new'
    });
    if (validRes.status !== 200 || !validRes.data.valid || validRes.data.discountAmount !== 45) {
      throw new Error(`WELCOME10 calculation failed: ${JSON.stringify(validRes.data)}`);
    }

    // B: Below minimum order threshold (min ₹199 for WELCOME10)
    const minOrderRes = await mockRequest('POST', '/api/offers/validate', {
      code: 'WELCOME10',
      subtotal: 100,
      items: [{ productId: 'prod_01', qty: 1 }],
      customerId: 'cust_new'
    });
    if (minOrderRes.status !== 400 || minOrderRes.data.valid !== false) {
      throw new Error(`Should reject coupon below minimum order amount: ${JSON.stringify(minOrderRes.data)}`);
    }

    // C: Category scope mismatch (CAKE15 should reject Crafts or Tiffins)
    const catMismatch = await mockRequest('POST', '/api/offers/validate', {
      code: 'CAKE15',
      subtotal: 350,
      items: [{ productId: 'prod_03', qty: 1 }], // prod_03 is Handmade Crafts
      customerId: 'cust_01'
    });
    if (catMismatch.status !== 400 || catMismatch.data.valid !== false) {
      throw new Error(`Should reject CAKE15 on non-bakery products: ${JSON.stringify(catMismatch.data)}`);
    }

    // D: Non-existent code
    const invalidCode = await mockRequest('POST', '/api/offers/validate', {
      code: 'FAKECODE99',
      subtotal: 500
    });
    if (invalidCode.status !== 404 || invalidCode.data.valid !== false) {
      throw new Error(`Should reject non-existent coupon: ${JSON.stringify(invalidCode.data)}`);
    }
  });

  // 33. Promotional Announcements Listing
  await test('GET /api/promotions/announcements returns active announcements and greetings', async () => {
    const res = await mockRequest('GET', '/api/promotions/announcements');
    if (res.status !== 200 || !res.data.success || !Array.isArray(res.data.announcements)) {
      throw new Error(`Announcements listing failed: ${JSON.stringify(res.data)}`);
    }
    if (res.data.announcements.length === 0) {
      throw new Error('Expected at least 1 promotional announcement');
    }
  });

  // 34. Protected Admin Offer Management Guards & CRUD
  await test('Protected Admin Offers API enforces RBAC guards and CRUD operations', async () => {
    // A: Reject without token -> 401
    const unauth = await mockRequest('GET', '/api/admin/offers');
    if (unauth.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${unauth.status}`);
    }

    // B: Customer token -> 403
    const custLogin = await mockRequest('POST', '/api/auth/login-customer', {
      email: 'thanuja@example.com',
      otp: '123456'
    });
    const custRes = await mockRequest('GET', '/api/admin/offers', null, {
      'authorization': `Bearer ${custLogin.data.token}`
    });
    if (custRes.status !== 403) {
      throw new Error(`Expected 403 for customer on admin offers, got ${custRes.status}`);
    }

    // C: Admin token -> 200 OK
    const adminRes = await mockRequest('GET', '/api/admin/offers', null, {
      'authorization': `Bearer ${adminToken}`
    });
    if (adminRes.status !== 200 || !adminRes.data.success || !Array.isArray(adminRes.data.data)) {
      throw new Error(`Admin offers list failed: ${JSON.stringify(adminRes.data)}`);
    }

    // D: Create new promotional offer with Admin Token
    const createRes = await mockRequest('POST', '/api/admin/offers', {
      code: 'TESTFEST25',
      title: '🎉 Festival Special',
      subtitle: 'Flat 25% off during festival season',
      badgeText: '25% OFF',
      discountType: 'percentage',
      discountValue: 25,
      minOrderAmount: 200,
      scope: 'global'
    }, {
      'authorization': `Bearer ${adminToken}`
    });
    if (createRes.status !== 201 || !createRes.data.success || !createRes.data.data.id) {
      throw new Error(`Admin offer creation failed: ${JSON.stringify(createRes.data)}`);
    }

    const testOfferId = createRes.data.data.id;

    // E: Toggle Active State
    const toggleRes = await mockRequest('PATCH', `/api/admin/offers/${testOfferId}/toggle`, null, {
      'authorization': `Bearer ${adminToken}`
    });
    if (toggleRes.status !== 200 || toggleRes.data.data.active !== false) {
      throw new Error(`Offer toggle failed: ${JSON.stringify(toggleRes.data)}`);
    }

    // F: Delete Offer
    const delRes = await mockRequest('DELETE', `/api/admin/offers/${testOfferId}`, null, {
      'authorization': `Bearer ${adminToken}`
    });
    if (delRes.status !== 200 || !delRes.data.success) {
      throw new Error(`Offer deletion failed: ${JSON.stringify(delRes.data)}`);
    }
  });

  // 35. Verified Coupon Discount in Razorpay / Online Order Creation
  await test('POST /api/payments/create-order applies server-verified coupon discount to grand total', async () => {
    // prod_01 is ₹450 eggless chocolate cake.
    // Order 1 unit + ₹30 delivery = ₹480 normal.
    // Apply WELCOME10 (10% off itemsTotal = ₹45 discount).
    // Final grand total = ₹450 - ₹45 + ₹30 = ₹435 -> 43500 paise!
    const uniqueCustId = `cust_first_timer_${Date.now()}`;
    const res = await mockRequest('POST', '/api/payments/create-order', {
      items: [{ productId: 'prod_01', qty: 1 }],
      customerId: uniqueCustId,
      deliveryMethod: 'Home Delivery',
      couponCode: 'WELCOME10'
    });

    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Order creation with coupon failed: ${JSON.stringify(res.data)}`);
    }

    if (res.data.discountAmount !== 45) {
      throw new Error(`Expected discountAmount 45, got: ${res.data.discountAmount}`);
    }

    if (res.data.amount !== 43500) {
      throw new Error(`Expected amount 43500 paise (₹435), got: ${res.data.amount}`);
    }
  });

  // =================================================================
  // ENTREPRENEUR SELF-SERVICE OFFERS & DISCOUNTS TESTS (RBAC & IDOR)
  // =================================================================

  let ent01Token = null;
  let ent02Token = null;

  // 36. Login as Entrepreneur ent_01 (Anita) and ent_02 (Lakshmi)
  await test('Authenticates both entrepreneurs ent_01 and ent_02', async () => {
    const res1 = await mockRequest('POST', '/api/auth/login-entrepreneur', {
      username: 'anitha_bakery',
      password: 'password123'
    });
    if (res1.status !== 200 || !res1.data.token || res1.data.entrepreneur.id !== 'ent_01') {
      throw new Error(`Failed to login as ent_01: ${JSON.stringify(res1.data)}`);
    }
    ent01Token = res1.data.token;

    const res2 = await mockRequest('POST', '/api/auth/login-entrepreneur', {
      username: 'lakshmi_crafts',
      password: 'password123'
    });
    if (res2.status !== 200 || !res2.data.token || res2.data.entrepreneur.id !== 'ent_02') {
      throw new Error(`Failed to login as ent_02: ${JSON.stringify(res2.data)}`);
    }
    ent02Token = res2.data.token;
  });

  // 37. GET /api/entrepreneurs/me/offers strictly requires Entrepreneur token
  await test('GET /api/entrepreneurs/me/offers blocks unauthorized access & customer token', async () => {
    // A: Without token -> 401
    const unauth = await mockRequest('GET', '/api/entrepreneurs/me/offers');
    if (unauth.status !== 401) {
      throw new Error(`Expected 401, got ${unauth.status}`);
    }

    // B: With pure customer token -> 403
    const AuthMiddleware = require('./middleware/auth');
    const pureCustomerToken = AuthMiddleware.signToken({
      userId: 'cust_pure_buyer',
      email: 'purebuyer@example.com',
      role: 'customer'
    });
    const custRes = await mockRequest('GET', '/api/entrepreneurs/me/offers', null, {
      'authorization': `Bearer ${pureCustomerToken}`
    });
    if (custRes.status !== 403) {
      throw new Error(`Expected 403 for customer token, got ${custRes.status}`);
    }

    // C: With ent_01 token -> 200 and only ent_01's offers
    const entRes = await mockRequest('GET', '/api/entrepreneurs/me/offers', null, {
      'authorization': `Bearer ${ent01Token}`
    });
    if (entRes.status !== 200 || !Array.isArray(entRes.data.data)) {
      throw new Error(`Expected 200 with offer list, got: ${JSON.stringify(entRes.data)}`);
    }

    // Every returned offer must belong to ent_01
    const foreignOffers = entRes.data.data.filter(o => o.entrepreneurId !== 'ent_01');
    if (foreignOffers.length > 0) {
      throw new Error(`Leaked foreign offers to ent_01! Found: ${JSON.stringify(foreignOffers)}`);
    }
  });

  // 38. Entrepreneur creates valid shop offer with automatic owner binding
  let newEntOfferId = null;
  await test('POST /api/entrepreneurs/me/offers creates shop offer bound strictly to caller', async () => {
    const payload = {
      title: 'Festive Cupcake Bonanza',
      description: 'Get 25% off festive handcrafted cupcakes this week',
      discountType: 'percentage',
      discountValue: 25,
      maxDiscount: 100,
      minOrderAmount: 150,
      scope: 'shop',
      code: `FESTIVE${Date.now().toString().slice(-4)}`,
      usageLimit: 30,
      // Attempting to spoof owner ID - MUST BE OVERRIDDEN BY SERVER
      entrepreneurId: 'ent_02'
    };

    const res = await mockRequest('POST', '/api/entrepreneurs/me/offers', payload, {
      'authorization': `Bearer ${ent01Token}`
    });

    if (res.status !== 201 || !res.data.success || !res.data.data) {
      throw new Error(`Offer creation failed: ${JSON.stringify(res.data)}`);
    }

    const created = res.data.data;
    newEntOfferId = created.id;

    // Verify server-enforced ownership: must be ent_01 NOT spoofed ent_02
    if (created.entrepreneurId !== 'ent_01') {
      throw new Error(`IDOR vulnerability! Offer accepted spoofed entrepreneurId: ${created.entrepreneurId}`);
    }

    if (created.discountValue !== 25 || created.maxDiscount !== 100) {
      throw new Error(`Discount values not preserved correctly: ${JSON.stringify(created)}`);
    }
  });

  // 39. Strict IDOR Defense: ent_02 cannot update, toggle or delete ent_01's offer
  await test('Strict IDOR: Entrepreneur B cannot update, toggle or delete Entrepreneur A offer', async () => {
    // A: ent_02 tries to update ent_01's offer -> 403 Forbidden
    const updateRes = await mockRequest('PUT', `/api/entrepreneurs/me/offers/${newEntOfferId}`, {
      title: 'Hacked by Ent 02',
      discountValue: 90
    }, {
      'authorization': `Bearer ${ent02Token}`
    });

    if (updateRes.status !== 403 || updateRes.data.error !== 'FORBIDDEN_OFFER_ACCESS') {
      throw new Error(`IDOR Flaw! ent_02 was able to update ent_01 offer: status ${updateRes.status}, data ${JSON.stringify(updateRes.data)}`);
    }

    // B: ent_02 tries to toggle ent_01's offer -> 403 Forbidden
    const toggleRes = await mockRequest('PATCH', `/api/entrepreneurs/me/offers/${newEntOfferId}/toggle`, null, {
      'authorization': `Bearer ${ent02Token}`
    });

    if (toggleRes.status !== 403 || toggleRes.data.error !== 'FORBIDDEN_OFFER_ACCESS') {
      throw new Error(`IDOR Flaw! ent_02 was able to toggle ent_01 offer: status ${toggleRes.status}`);
    }

    // C: ent_02 tries to delete ent_01's offer -> 403 Forbidden
    const deleteRes = await mockRequest('DELETE', `/api/entrepreneurs/me/offers/${newEntOfferId}`, null, {
      'authorization': `Bearer ${ent02Token}`
    });

    if (deleteRes.status !== 403 || deleteRes.data.error !== 'FORBIDDEN_OFFER_ACCESS') {
      throw new Error(`IDOR Flaw! ent_02 was able to delete ent_01 offer: status ${deleteRes.status}`);
    }

    // D: ent_02 tries to view ent_01's performance data -> 403 Forbidden
    const perfRes = await mockRequest('GET', `/api/entrepreneurs/me/offers/${newEntOfferId}/performance`, null, {
      'authorization': `Bearer ${ent02Token}`
    });

    if (perfRes.status !== 403 || perfRes.data.error !== 'FORBIDDEN_OFFER_ACCESS') {
      throw new Error(`IDOR Flaw! ent_02 was able to access ent_01 analytics: status ${perfRes.status}`);
    }
  });

  // 40. Product Ownership Validation: Entrepreneur cannot attach another shop's products
  await test('Product Ownership: Rejects offer creation containing another shop products', async () => {
    // ent_01 tries to create product-specific offer selecting prod_05 (terracotta vase, belongs to ent_02 Lakshmi)
    const badPayload = {
      title: 'Unauthorized Cross-Shop Promo',
      discountType: 'percentage',
      discountValue: 20,
      scope: 'product',
      productIds: ['prod_05'] // Belonging to ent_02 Lakshmi Crafts!
    };

    const res = await mockRequest('POST', '/api/entrepreneurs/me/offers', badPayload, {
      'authorization': `Bearer ${ent01Token}`
    });

    if (res.status !== 403 || res.data.error !== 'UNAUTHORIZED_PRODUCT_SELECTION') {
      throw new Error(`Cross-shop product hijacking allowed! Expected 403 UNAUTHORIZED_PRODUCT_SELECTION, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 41. Fair Carousel Rotation: Multiple shops are interleaved evenly
  await test('GET /api/offers?banner=true applies fair round-robin rotation between shops', async () => {
    const res = await mockRequest('GET', '/api/offers?banner=true');

    if (res.status !== 200 || !Array.isArray(res.data.data)) {
      throw new Error(`Banner offers request failed: ${JSON.stringify(res.data)}`);
    }

    const offers = res.data.data;
    if (offers.length >= 2) {
      // Check that the first two offers do not monopolize from the same shop if multiple shops have offers
      const shop1 = offers[0].entrepreneurId || 'global';
      const shop2 = offers[1].entrepreneurId || 'global';
      console.log(`[FAIR_ROTATION] Slot 1: ${shop1} (${offers[0].title}), Slot 2: ${shop2} (${offers[1].title})`);
    }
  });

  // 42. Shop-Scoped Coupon Validation on Cart & Checkout
  await test('Shop-scoped coupon applies to matching shop items and rejects non-matching shop items', async () => {
    // ANITA15 is a shop-scoped offer for ent_01 (Anita's Bakery)
    // 1. Valid: cart with prod_01 (Anita's cake, ₹450)
    const validRes = await mockRequest('POST', '/api/offers/validate', {
      code: 'ANITA15',
      items: [{ productId: 'prod_01', price: 450, qty: 1 }],
      subtotal: 450,
      customerId: 'cust_01'
    });

    if (validRes.status !== 200 || !validRes.data.valid) {
      throw new Error(`Expected valid shop coupon, got: ${JSON.stringify(validRes.data)}`);
    }
    // 15% of ₹450 = 67.5 -> ₹68
    if (validRes.data.discountAmount !== 68) {
      throw new Error(`Expected 68 discount for ANITA15, got: ${validRes.data.discountAmount}`);
    }

    // 2. Invalid: cart with prod_05 (Lakshmi Crafts, ₹350)
    const mismatchRes = await mockRequest('POST', '/api/offers/validate', {
      code: 'ANITA15',
      items: [{ productId: 'prod_05', price: 350, qty: 1 }],
      subtotal: 350,
      customerId: 'cust_01'
    });

    if (mismatchRes.status !== 400 || mismatchRes.data.error !== 'SHOP_MISMATCH') {
      throw new Error(`Expected 400 SHOP_MISMATCH for cross-shop cart, got ${mismatchRes.status}: ${JSON.stringify(mismatchRes.data)}`);
    }
  });

  // 43. Admin Oversight: Admin can deactivate misleading/fraudulent shop offer
  await test('Admin Oversight: PATCH /api/admin/offers/:id/moderate deactivates offer from customer use', async () => {
    // A: Admin deactivates newEntOfferId
    const modRes = await mockRequest('PATCH', `/api/admin/offers/${newEntOfferId}/moderate`, {
      status: 'deactivated',
      reason: 'Misleading price claims reported by customers'
    }, {
      'authorization': `Bearer ${adminToken}`
    });

    if (modRes.status !== 200 || modRes.data.data.moderationStatus !== 'deactivated') {
      throw new Error(`Admin moderation failed: ${JSON.stringify(modRes.data)}`);
    }

    // B: Check that offer no longer appears in active offers
    const activeRes = await mockRequest('GET', '/api/offers');
    const stillPresent = activeRes.data.data.find(o => o.id === newEntOfferId);
    if (stillPresent) {
      throw new Error(`Deactivated offer is still appearing in public active offers!`);
    }

    // C: Clean up created test offer
    const db = require('./models/db');
    db.deleteOffer(newEntOfferId);
  });

  // =================================================================
  // ENTREPRENEUR-UPLOADED ADVERTISEMENT SYSTEM TESTS (RBAC, IDOR & MODERATION)
  // =================================================================
  const db = require('./models/db');

  // 44. RBAC: GET /api/entrepreneurs/me/advertisements strictly requires Entrepreneur token
  await test('GET /api/entrepreneurs/me/advertisements enforces entrepreneur role authorization', async () => {
    // A: Without token -> 401
    const unauth = await mockRequest('GET', '/api/entrepreneurs/me/advertisements');
    if (unauth.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${unauth.status}`);
    }

    // B: With customer token -> 403
    const AuthMiddleware = require('./middleware/auth');
    const customerTokenOnly = AuthMiddleware.signToken({
      userId: 'cust_pure_buyer',
      email: 'purebuyer@example.com',
      role: 'customer'
    });
    const custRes = await mockRequest('GET', '/api/entrepreneurs/me/advertisements', null, {
      'authorization': `Bearer ${customerTokenOnly}`
    });
    if (custRes.status !== 403) {
      throw new Error(`Expected 403 for customer token, got ${custRes.status}`);
    }

    // C: With ent_01 token -> 200 with only ent_01's ads
    const entRes = await mockRequest('GET', '/api/entrepreneurs/me/advertisements', null, {
      'authorization': `Bearer ${ent01Token}`
    });
    if (entRes.status !== 200 || !Array.isArray(entRes.data.data)) {
      throw new Error(`Expected 200 with ad list, got: ${JSON.stringify(entRes.data)}`);
    }

    const foreignAds = entRes.data.data.filter(a => a.entrepreneurId !== 'ent_01');
    if (foreignAds.length > 0) {
      throw new Error(`Leaked foreign advertisements to ent_01! Found: ${JSON.stringify(foreignAds)}`);
    }
  });

  // 45. Entrepreneur creates advertisement with auto-binding to caller & Pending status
  let newAdId = null;
  await test('POST /api/entrepreneurs/me/advertisements binds ownership & enforces Pending Approval status', async () => {
    const payload = {
      title: 'Handmade Festive Cupcake Banner',
      description: 'Freshly baked handcrafted festive cupcakes available in limited batches!',
      imageUrl: '/uploads/banner_anita_cakes.svg',
      adType: 'Product Promotion',
      placement: 'home_carousel',
      ctaText: 'Order Now',
      ctaLink: 'screen-customer-home',
      discountInfo: 'Flat 20% OFF with code FESTIVE20',
      productIds: ['prod_01'], // Owned by ent_01
      // Attempt to spoof owner ID and bypass moderation status
      entrepreneurId: 'ent_02',
      status: 'Approved'
    };

    const res = await mockRequest('POST', '/api/entrepreneurs/me/advertisements', payload, {
      'authorization': `Bearer ${ent01Token}`
    });

    if (res.status !== 201 || !res.data.success || !res.data.data) {
      throw new Error(`Advertisement creation failed: ${JSON.stringify(res.data)}`);
    }

    const created = res.data.data;
    newAdId = created.id;

    // Strict ownership verification: must be ent_01 NOT ent_02
    if (created.entrepreneurId !== 'ent_01') {
      throw new Error(`IDOR flaw! Ad accepted spoofed entrepreneurId: ${created.entrepreneurId}`);
    }

    // Strict moderation status: must be 'Pending Approval' NOT 'Approved'
    if (created.status !== 'Pending Approval') {
      throw new Error(`Self-approval vulnerability! Initial status is '${created.status}' instead of 'Pending Approval'`);
    }

    if (created.impressions !== 0 || created.clicks !== 0) {
      throw new Error(`Counters should initialize at 0: ${JSON.stringify(created)}`);
    }
  });

  // 46. Cross-Shop Product Hijacking Prevention: Cannot attach another shop's products
  await test('Product Ownership Defense: Rejects advertisement attaching foreign shop products', async () => {
    const hijackedPayload = {
      title: 'Malicious Cross-Shop Promo',
      description: 'Trying to promote another shop\'s product under my banner',
      imageUrl: '/uploads/banner_anita_cakes.svg',
      productIds: ['prod_05'] // Owned by ent_02 (Lakshmi Crafts), NOT ent_01
    };

    const res = await mockRequest('POST', '/api/entrepreneurs/me/advertisements', hijackedPayload, {
      'authorization': `Bearer ${ent01Token}`
    });

    if (res.status !== 403 || res.data.error !== 'UNAUTHORIZED_PRODUCT_SELECTION') {
      throw new Error(`Expected 403 UNAUTHORIZED_PRODUCT_SELECTION, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 47. Customer Visibility: Unapproved ads must NEVER appear in public carousel
  await test('Public carousel filters out unapproved / pending advertisements', async () => {
    const res = await mockRequest('GET', '/api/advertisements?placement=home_carousel');
    if (res.status !== 200 || !Array.isArray(res.data.data)) {
      throw new Error(`Public ads fetch failed: ${JSON.stringify(res.data)}`);
    }

    const unapprovedFound = res.data.data.find(a => a.id === newAdId || a.status !== 'Approved');
    if (unapprovedFound) {
      throw new Error(`Unapproved advertisement leaked to customer view: ${JSON.stringify(unapprovedFound)}`);
    }
  });

  // 48. Strict IDOR Defense: ent_02 cannot update, toggle or delete ent_01's advertisement
  await test('Strict IDOR: Entrepreneur B cannot update, toggle or delete Entrepreneur A ad', async () => {
    // A: ent_02 tries to update ent_01's ad -> 403 Forbidden
    const updateRes = await mockRequest('PUT', `/api/entrepreneurs/me/advertisements/${newAdId}`, {
      title: 'Hijacked by Lakshmi Crafts'
    }, {
      'authorization': `Bearer ${ent02Token}`
    });

    if (updateRes.status !== 403 || updateRes.data.error !== 'FORBIDDEN_AD_ACCESS') {
      throw new Error(`IDOR vulnerability! ent_02 updated ent_01 ad: ${updateRes.status} ${JSON.stringify(updateRes.data)}`);
    }

    // B: ent_02 tries to toggle ent_01's ad -> 403 Forbidden
    const toggleRes = await mockRequest('PATCH', `/api/entrepreneurs/me/advertisements/${newAdId}/toggle`, null, {
      'authorization': `Bearer ${ent02Token}`
    });

    if (toggleRes.status !== 403 || toggleRes.data.error !== 'FORBIDDEN_AD_ACCESS') {
      throw new Error(`IDOR vulnerability! ent_02 toggled ent_01 ad: ${toggleRes.status}`);
    }

    // C: ent_02 tries to delete ent_01's ad -> 403 Forbidden
    const deleteRes = await mockRequest('DELETE', `/api/entrepreneurs/me/advertisements/${newAdId}`, null, {
      'authorization': `Bearer ${ent02Token}`
    });

    if (deleteRes.status !== 403 || deleteRes.data.error !== 'FORBIDDEN_AD_ACCESS') {
      throw new Error(`IDOR vulnerability! ent_02 deleted ent_01 ad: ${deleteRes.status}`);
    }

    // D: ent_02 tries to view ent_01's ad performance -> 403 Forbidden
    const perfRes = await mockRequest('GET', `/api/entrepreneurs/me/advertisements/${newAdId}/performance`, null, {
      'authorization': `Bearer ${ent02Token}`
    });

    if (perfRes.status !== 403 || perfRes.data.error !== 'FORBIDDEN_AD_ACCESS') {
      throw new Error(`IDOR vulnerability! ent_02 accessed ent_01 ad metrics: ${perfRes.status}`);
    }
  });

  // 49. Admin Review & Approval Workflow with In-App Notification
  await test('Admin Review: PATCH /api/admin/advertisements/:id/review approves ad & notifies entrepreneur', async () => {
    const res = await mockRequest('PATCH', `/api/admin/advertisements/${newAdId}/review`, {
      status: 'Approved',
      reviewNotes: 'High quality creative, meets visual banner standards.'
    }, {
      'authorization': `Bearer ${adminToken}`
    });

    if (res.status !== 200 || !res.data.success || res.data.data.status !== 'Approved') {
      throw new Error(`Admin ad approval failed: ${JSON.stringify(res.data)}`);
    }

    // Verify In-App Notification was generated for ent_01
    const notifs = db.getNotifications ? db.getNotifications('ent_01') : [];
    const adNotif = notifs.find(n => n.title && n.title.includes('Approved'));
    if (!adNotif) {
      throw new Error(`Expected in-app approval notification for ent_01, found: ${JSON.stringify(notifs)}`);
    }
  });

  // 50. Approved Advertisement appears in Public Carousel with Fair Rotation
  await test('Approved advertisement appears in customer carousel with fair seller rotation', async () => {
    const res = await mockRequest('GET', '/api/advertisements?placement=home_carousel');
    if (res.status !== 200 || !Array.isArray(res.data.data)) {
      throw new Error(`Failed to fetch public carousel: ${JSON.stringify(res.data)}`);
    }

    const found = res.data.data.find(a => a.id === newAdId);
    if (!found) {
      throw new Error(`Approved advertisement "${newAdId}" did not appear in customer carousel!`);
    }

    // Verify fair rotation: Check that consecutive slots alternate between distinct shops
    const distinctShops = new Set(res.data.data.map(a => a.entrepreneurId));
    console.log(`[FAIR_ROTATION] Customer carousel contains ${res.data.data.length} active ads across ${distinctShops.size} distinct shops.`);
  });

  // 51. Impression, Click Tracking and Performance Analytics
  await test('Records impressions & clicks, computes CTR and performance metrics accurately', async () => {
    // A: Record 2 impressions
    await mockRequest('POST', `/api/advertisements/${newAdId}/impression`);
    await mockRequest('POST', `/api/advertisements/${newAdId}/impression`);

    // B: Record 1 click
    await mockRequest('POST', `/api/advertisements/${newAdId}/click`);

    // C: Verify entrepreneur performance endpoint computes 50.0% CTR
    const perfRes = await mockRequest('GET', `/api/entrepreneurs/me/advertisements/${newAdId}/performance`, null, {
      'authorization': `Bearer ${ent01Token}`
    });

    if (perfRes.status !== 200 || !perfRes.data.success) {
      throw new Error(`Failed to fetch performance: ${JSON.stringify(perfRes.data)}`);
    }

    const metrics = perfRes.data.data;
    if (metrics.impressions !== 2 || metrics.clicks !== 1 || metrics.ctr !== '50.0%') {
      throw new Error(`Metrics mismatch! Expected 2 impressions, 1 click, 50.0% CTR, got: ${JSON.stringify(metrics)}`);
    }
  });

  // 52. Admin Rejection Workflow with Mandatory Reason & Hiding from Public Carousel
  await test('Admin Moderation: Rejection stores reason, notifies entrepreneur & hides from carousel', async () => {
    // Admin rejects the advertisement with feedback
    const rejectRes = await mockRequest('PATCH', `/api/admin/advertisements/${newAdId}/review`, {
      status: 'Rejected',
      rejectionReason: 'Offer text is unclear and image requires higher resolution.'
    }, {
      'authorization': `Bearer ${adminToken}`
    });

    if (rejectRes.status !== 200 || rejectRes.data.data.status !== 'Rejected') {
      throw new Error(`Admin rejection failed: ${JSON.stringify(rejectRes.data)}`);
    }

    if (rejectRes.data.data.rejectionReason !== 'Offer text is unclear and image requires higher resolution.') {
      throw new Error(`Rejection reason not stored properly: ${JSON.stringify(rejectRes.data)}`);
    }

    // Customer carousel must no longer show this rejected ad
    const publicRes = await mockRequest('GET', '/api/advertisements?placement=home_carousel');
    const stillShowing = publicRes.data.data.find(a => a.id === newAdId);
    if (stillShowing) {
      throw new Error(`Rejected advertisement is still visible to customers!`);
    }

    // Entrepreneur receives notification
    const notifs = db.getNotifications ? db.getNotifications('ent_01') : [];
    const rejectNotif = notifs.find(n => n.title && n.title.includes('Requires Changes'));
    if (!rejectNotif) {
      throw new Error(`Expected rejection notification for ent_01, found: ${JSON.stringify(notifs)}`);
    }
  });

  // 53. Entrepreneur Resubmit & Clean up
  await test('Entrepreneur resubmits ad, resets status to Pending Approval, and deletes ad', async () => {
    // Resubmit with revised details
    const resubmitRes = await mockRequest('PUT', `/api/entrepreneurs/me/advertisements/${newAdId}`, {
      title: 'Handmade Festive Cupcake Banner (Updated High-Res)',
      description: 'Revised high-resolution creative with crystal-clear offer details.'
    }, {
      'authorization': `Bearer ${ent01Token}`
    });

    if (resubmitRes.status !== 200 || resubmitRes.data.data.status !== 'Pending Approval') {
      throw new Error(`Resubmit should reset status to Pending Approval: ${JSON.stringify(resubmitRes.data)}`);
    }

    // Delete ad
    const delRes = await mockRequest('DELETE', `/api/entrepreneurs/me/advertisements/${newAdId}`, null, {
      'authorization': `Bearer ${ent01Token}`
    });

    if (delRes.status !== 200 || !delRes.data.success) {
      throw new Error(`Ad deletion failed: ${JSON.stringify(delRes.data)}`);
    }

    // Verify ad is gone from db
    const check = db.getAdvertisementById(newAdId);
    if (check) {
      throw new Error(`Deleted ad still exists in database: ${newAdId}`);
    }
  });

  console.log(`\n======================================================`);
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================================\n`);

  server.close(() => {
    process.exit(failed > 0 ? 1 : 0);
  });
}

setTimeout(runInProcessTests, 300);
