/* =====================================================================
   MANEYINDA MARUKATTE - RAZORPAY LIVE CREDENTIALS DIAGNOSTIC
   Verifies whether the provided Razorpay Key ID and Secret can
   successfully connect to https://api.razorpay.com/v1/orders
===================================================================== */

const https = require('https');
require('./config/env');

const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

console.log('======================================================');
console.log('💳 RAZORPAY API CREDENTIALS VERIFICATION');
console.log('======================================================');
console.log(`Key ID     : ${keyId}`);
console.log(`Key Secret : ${keySecret ? keySecret.substring(0, 4) + '...' + keySecret.substring(keySecret.length - 4) : 'MISSING'}`);

if (!keyId || !keySecret) {
  console.error('\n❌ ERROR: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing from .env');
  process.exit(1);
}

const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
const testPayload = JSON.stringify({
  amount: 48000, // ₹480 in paise
  currency: 'INR',
  receipt: `rcpt_diag_${Date.now()}`,
  notes: {
    test: 'diagnostic_check',
    platform: 'Maneyindha Marukatte'
  }
});

const req = https.request({
  hostname: 'api.razorpay.com',
  port: 443,
  path: '/v1/orders',
  method: 'POST',
  headers: {
    'Authorization': authHeader,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testPayload)
  },
  timeout: 10000
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('\n🎉 SUCCESS! RAZORPAY CREDENTIALS ARE 100% VALID!');
        console.log(`Order ID Created : ${data.id}`);
        console.log(`Amount           : ₹${data.amount / 100} (${data.amount} paise)`);
        console.log(`Currency         : ${data.currency}`);
        console.log(`Status           : ${data.status}`);
        console.log('======================================================\n');
        process.exit(0);
      } else {
        console.error(`\n❌ RAZORPAY REJECTED CREDENTIALS (Status ${res.statusCode}):`);
        console.error(data.error || data);
        console.log('======================================================\n');
        process.exit(1);
      }
    } catch (e) {
      console.error('\n❌ Invalid response from Razorpay:', body);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('\n❌ Network error connecting to Razorpay:', err.message);
  process.exit(1);
});

req.write(testPayload);
req.end();
