/* =====================================================================
   MANEYINDA MARUKATTE - COMPREHENSIVE ROLE-BASED INTEGRATION TEST SUITE
   Tests authentication, role authorization, permissions, and security guards.
===================================================================== */

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

  // 1. Health check
  await test('GET /api/health should return status UP', async () => {
    const res = await mockRequest('GET', '/api/health');
    if (res.status !== 200 || res.data.status !== 'UP') throw new Error(`Failed health check`);
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

  console.log(`\n======================================================`);
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================================\n`);

  server.close(() => {
    process.exit(failed > 0 ? 1 : 0);
  });
}

setTimeout(runInProcessTests, 300);
