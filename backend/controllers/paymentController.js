/* =====================================================================
   MANEYINDA MARUKATTE - RAZORPAY REAL PAYMENT CONTROLLER
   Zero-dependency implementation of Razorpay Orders API &
   Cryptographic HMAC-SHA256 Signature Verification.
===================================================================== */

const https = require('https');
const crypto = require('crypto');
const db = require('../models/db');
require('../config/env');

class PaymentController {
  constructor() {
    this.getKeyId = this.getKeyId.bind(this);
    this.getKeySecret = this.getKeySecret.bind(this);
    this.isConfigured = this.isConfigured.bind(this);
    this.getPaymentConfigStatus = this.getPaymentConfigStatus.bind(this);
    this.createRazorpayOrder = this.createRazorpayOrder.bind(this);
    this.verifyPaymentSignature = this.verifyPaymentSignature.bind(this);
  }

  getKeyId() {
    return process.env.RAZORPAY_KEY_ID || '';
  }

  getKeySecret() {
    return process.env.RAZORPAY_KEY_SECRET || '';
  }

  isConfigured() {
    const key = this.getKeyId();
    const secret = this.getKeySecret();
    return Boolean(key && secret && !key.includes('your_key') && !secret.includes('your_secret'));
  }

  // GET /api/payments/status
  getPaymentConfigStatus(req, res) {
    const configured = this.isConfigured();
    return res.status(200).json({
      success: true,
      provider: 'razorpay',
      isConfigured: configured,
      keyId: configured ? this.getKeyId() : null,
      mode: this.getKeyId().startsWith('rzp_live_') ? 'live' : 'test',
      message: configured
        ? `Razorpay configured in ${this.getKeyId().startsWith('rzp_live_') ? 'LIVE' : 'TEST'} mode.`
        : 'Razorpay keys not configured in .env. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
    });
  }

  // POST /api/payments/create-order
  async createRazorpayOrder(req, res) {
    const { amount, receipt, notes } = req.body || {};

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_AMOUNT',
        message: 'A valid payment amount in INR is required.'
      });
    }

    const keyId = this.getKeyId();
    const keySecret = this.getKeySecret();

    if (!this.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'PAYMENT_GATEWAY_NOT_CONFIGURED',
        message: 'Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.'
      });
    }

    // Convert amount in INR to Paise (e.g. ₹450 -> 45000 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const payload = JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || { platform: 'Maneyindha Marukatte' }
    });

    const authHeader = 'Basic ' + Buffer.from(`${keyId.trim()}:${keySecret.trim()}`).toString('base64');

    return new Promise((resolve) => {
      const options = {
        hostname: 'api.razorpay.com',
        port: 443,
        path: '/v1/orders',
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 10000
      };

      const request = https.request(options, (response) => {
        let responseBody = '';
        response.on('data', chunk => responseBody += chunk);

        response.on('end', () => {
          let parsed = {};
          try {
            parsed = JSON.parse(responseBody);
          } catch (e) {
            parsed = { message: responseBody };
          }

          if (response.statusCode >= 200 && response.statusCode < 300) {
            console.log(`[PAYMENT:RAZORPAY] Order created successfully. Order ID: ${parsed.id}`);
            return resolve(res.status(200).json({
              success: true,
              orderId: parsed.id,
              amount: parsed.amount,
              currency: parsed.currency,
              keyId: keyId.trim(),
              receipt: parsed.receipt
            }));
          }

          console.error(`[PAYMENT:RAZORPAY] Error ${response.statusCode}:`, parsed);
          return resolve(res.status(response.statusCode || 502).json({
            success: false,
            error: 'RAZORPAY_ORDER_FAILED',
            statusCode: response.statusCode,
            message: (parsed.error && parsed.error.description) || parsed.message || 'Razorpay order creation failed.'
          }));
        });
      });

      request.on('timeout', () => {
        request.destroy();
        resolve(res.status(504).json({
          success: false,
          error: 'GATEWAY_TIMEOUT',
          message: 'Razorpay payment gateway timed out.'
        }));
      });

      request.on('error', (err) => {
        console.error(`[PAYMENT:RAZORPAY] Network Error:`, err.message);
        resolve(res.status(502).json({
          success: false,
          error: 'GATEWAY_NETWORK_ERROR',
          message: `Network error connecting to Razorpay: ${err.message}`
        }));
      });

      request.write(payload);
      request.end();
    });
  }

  // POST /api/payments/verify
  verifyPaymentSignature(req, res) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'MISSING_PAYMENT_DETAILS',
        message: 'Order ID, Payment ID, and Signature are mandatory for verification.'
      });
    }

    const keySecret = this.getKeySecret();
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        error: 'SERVER_CONFIG_ERROR',
        message: 'Razorpay secret key not configured on server.'
      });
    }

    // Cryptographic HMAC-SHA256 Signature Verification
    const generatedSignature = crypto
      .createHmac('sha256', keySecret.trim())
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isAuthentic = generatedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.warn(`[PAYMENT:RAZORPAY] Signature mismatch for Payment ID: ${razorpay_payment_id}`);
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'INVALID_SIGNATURE',
        message: 'Payment verification failed: Signature mismatch or tampering detected.'
      });
    }

    console.log(`[PAYMENT:RAZORPAY] Payment verified authentic! ID: ${razorpay_payment_id}`);

    // Update order in database if orderId was provided
    if (orderId) {
      const order = db.getOrderById(orderId);
      if (order) {
        db.updateOrderStatus(orderId, 'Accepted', `Paid via Razorpay (${razorpay_payment_id})`);
        order.paymentStatus = 'Paid';
        order.paymentDetails = {
          provider: 'razorpay',
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          paidAt: new Date().toISOString()
        };
        db.save();
      }
    }

    return res.status(200).json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      message: 'Payment verified and confirmed successfully.'
    });
  }
}

module.exports = new PaymentController();
