/* =====================================================================
   MANEYINDA MARUKATTE - REAL EMAIL DELIVERY DIAGNOSTIC TOOL
   Usage:
     node backend/test-resend.js <your_email@example.com>
===================================================================== */

require('./config/env');
const emailService = require('./services/emailService');

async function testEmail() {
  const targetEmail = process.argv[2] || process.env.TEST_EMAIL;

  console.log('\n======================================================');
  console.log('📬 REAL TRANSACTIONAL EMAIL DELIVERY DIAGNOSTIC CHECK');
  console.log('======================================================\n');

  const status = emailService.getStatus();
  console.log('Current Provider   :', status.provider.toUpperCase());
  console.log('Is Configured?     :', status.isConfigured ? '✅ YES' : '❌ NO');
  console.log('Sender Address     :', status.sender);
  console.log('Diagnostic Details :', status.details);

  if (!status.isConfigured) {
    console.log('\n❌ SETUP INCOMPLETE:');
    console.log('Your .env file has no email credentials configured.');
    process.exit(1);
  }

  if (!targetEmail || !targetEmail.includes('@')) {
    console.log('\n⚠️ Please provide a destination email address to test delivery:');
    console.log('Example: node backend/test-resend.js yourname@gmail.com\n');
    process.exit(1);
  }

  const sampleOtp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`\n⏳ Connecting to ${status.provider.toUpperCase()} and delivering to: ${targetEmail}`);
  console.log(`🔑 Generated Unique 6-Digit OTP: ${sampleOtp}`);

  const result = await emailService.sendOtpEmail(targetEmail, sampleOtp, 'registration');

  console.log('\n----------------- DELIVERY RESULT -----------------');
  if (result.success) {
    console.log('✅ SUCCESS! Email accepted for real delivery.');
    console.log('📨 Delivery Message ID :', result.messageId);
    console.log('📬 Sent to              :', targetEmail);
    console.log('🏢 Delivered via        :', result.provider.toUpperCase());
    console.log('\n👉 Check your inbox (and spam folder) for: "Verify Your Email – Maneyindha Marukatte"!\n');
  } else {
    console.log('❌ FAILED: Email provider rejected the request.');
    console.log('Error Code    :', result.error);
    console.log('Server Message:', result.message);
  }
}

testEmail();
