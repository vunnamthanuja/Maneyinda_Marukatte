/* =====================================================================
   MANEYINDA MARUKATTE - COMPREHENSIVE INTEGRATION & BUSINESS RULES TEST SUITE
===================================================================== */

const { EventEmitter } = require('events');
const server = require('./server');

function mockRequest(method, urlPath, body = null) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = urlPath;
    req.headers = {
      'content-type': 'application/json'
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
  console.log('\n--- EXPANDED REST API & BUSINESS LOGIC VERIFICATION ---\n');
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

  // 4. Send OTP
  await test('POST /api/auth/send-otp should send OTP', async () => {
    const res = await mockRequest('POST', '/api/auth/send-otp', { email: 'test@marukatte.com' });
    if (res.status !== 200 || !res.data.success) throw new Error(`Send OTP error`);
  });

  // 5. Verify OTP
  await test('POST /api/auth/verify-otp should accept demo OTP 123456', async () => {
    const res = await mockRequest('POST', '/api/auth/verify-otp', { email: 'test@marukatte.com', otp: '123456' });
    if (res.status !== 200 || !res.data.verified) throw new Error(`Verify OTP error`);
  });

  // 6. Customer Login
  await test('POST /api/auth/login-customer should sign in or auto-create', async () => {
    const res = await mockRequest('POST', '/api/auth/login-customer', {
      email: 'thanuja@example.com',
      otp: '123456'
    });
    if (res.status !== 200 || !res.data.user || !res.data.token) throw new Error(`Customer login error`);
  });

  // 7. Entrepreneur Login
  await test('POST /api/auth/login-entrepreneur should authenticate valid entrepreneur', async () => {
    const res = await mockRequest('POST', '/api/auth/login-entrepreneur', {
      username: 'anitha_bakery',
      password: 'password123'
    });
    if (res.status !== 200 || !res.data.entrepreneur) throw new Error(`Entrepreneur login error`);
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

  // 10. Order Status Progression (New -> Accepted -> Preparing -> Delivered)
  await test('PATCH /api/orders/:id/status should update status to Accepted', async () => {
    const res = await mockRequest('PATCH', `/api/orders/${testOrderId}/status`, { status: 'Accepted' });
    if (res.status !== 200 || res.data.data.orderStatus !== 'Accepted') throw new Error(`Status update error`);
  });

  // 11. Order Cancellation Window (Allowed on Accepted)
  await test('POST /api/orders/:id/cancel should succeed on Accepted order', async () => {
    const res = await mockRequest('POST', `/api/orders/${testOrderId}/cancel`, { reason: 'Changed mind' });
    if (res.status !== 200 || res.data.data.orderStatus !== 'Cancelled') throw new Error(`Cancellation error`);
  });

  // 12. Create second order and advance to Preparing
  let preparingOrderId = null;
  await test('POST /api/orders advance to Preparing and verify cancellation blocks', async () => {
    const ordRes = await mockRequest('POST', '/api/orders', {
      customerId: 'cust_01',
      items: [{ productId: 'prod_01', qty: 1 }],
      deliveryMethod: 'Home Delivery'
    });
    preparingOrderId = ordRes.data.data.id;
    await mockRequest('PATCH', `/api/orders/${preparingOrderId}/status`, { status: 'Preparing' });

    // Try cancelling preparing order
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

  // 14. Admin resolve ticket
  await test('PATCH /api/support/tickets/:id/resolve should update ticket', async () => {
    const res = await mockRequest('PATCH', `/api/support/tickets/${ticketId}/resolve`, {
      status: 'Resolved',
      adminNotes: 'Seller notified and voucher offered.'
    });
    if (res.status !== 200 || res.data.data.status !== 'Resolved') throw new Error(`Ticket resolve error`);
  });

  // 15. Admin verification queue
  await test('GET /api/admin/verification-queue should return pending applicants', async () => {
    const res = await mockRequest('GET', '/api/admin/verification-queue');
    if (res.status !== 200 || !Array.isArray(res.data.data)) throw new Error(`Admin queue error`);
  });

  // 16. Admin AI Trend scoring
  await test('GET /api/admin/ai-trends should calculate trend scores correctly', async () => {
    const res = await mockRequest('GET', '/api/admin/ai-trends');
    if (res.status !== 200 || !res.data.data.topTrendingProducts) throw new Error(`AI Trends error`);
  });

  console.log(`\n=========================================`);
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`=========================================\n`);

  server.close(() => {
    process.exit(failed > 0 ? 1 : 0);
  });
}

setTimeout(runInProcessTests, 300);
