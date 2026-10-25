/* =====================================================================
   MANEYINDA MARUKATTE - RESEND API DIAGNOSTIC & VERIFICATION TOOL
   Usage:
     node backend/test-resend.js <your_email@example.com>
===================================================================== */

require('./config/env');
const emailService = require('./services/emailService');

async function testResend() {
  const targetEmail = process.argv[2] || process.env.TEST_EMAIL;

  console.log('\n======================================================');
  console.log('📬 RESEND EMAIL DELIVERY DIAGNOSTIC CHECK');
  console.log('======================================================\n');

  const status = emailService.getStatus();
  console.log('Current Provider   :', status.provider);
  console.log('Is Configured?     :', status.isConfigured ? '✅ YES' : '❌ NO');
  console.log('Sender Address     :', status.sender);
  console.log('Diagnostic Details :', status.details);

  if (!status.isConfigured) {
    console.log('\n❌ SETUP INCOMPLETE:');
    console.log('Your .env file is missing a real RESEND_API_KEY.');
    console.log('\nTo fix this:');
    console.log('1. Go to https://resend.com/signup and create a free account.');
    console.log('2. Click "API Keys" -> "Create API Key".');
    console.log('3. Copy your key (starts with "re_").');
    console.log('4. Open .env in your project folder and replace:');
    console.log('   RESEND_API_KEY=re_your_actual_key_here');
    console.log('5. Run this test script again:\n   node backend/test-resend.js your_email@gmail.com\n');
    process.exit(1);
  }

  if (!targetEmail || !targetEmail.includes('@')) {
    console.log('\n⚠️ Please provide a destination email address to test delivery:');
    console.log('Example: node backend/test-resend.js yourname@gmail.com\n');
    process.exit(1);
  }

  const sampleOtp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`\n⏳ Attempting real delivery to: ${targetEmail}`);
  console.log(`🔑 Generated Unique OTP       : ${sampleOtp}`);

  const result = await emailService.sendOtpEmail(targetEmail, sampleOtp, 'registration');

  console.log('\n----------------- RESEND RESULT -----------------');
  if (result.success) {
    console.log('✅ SUCCESS! Resend accepted the email request.');
    console.log('📨 Resend Message ID :', result.messageId);
    console.log('📬 Sent to            :', targetEmail);
    console.log('\n👉 Check your inbox (or spam folder) for: "Verify Your Email – Maneyindha Marukatte".\n');
  } else {
    console.log('❌ FAILED: Resend rejected the email delivery.');
    console.log('Error Code    :', result.error);
    console.log('Status Code   :', result.statusCode || result.providerStatusCode || 'N/A');
    console.log('Server Message:', result.message);

    if (result.message && result.message.includes('sandbox domain')) {
      console.log('\n💡 IMPORTANT RESEND NOTICE:');
      console.log('You are using Resend’s default testing sender (onboarding@resend.dev).');
      console.log('Resend restricts this sandbox domain so it only sends to the email');
      console.log('you used when registering your Resend account.');
      console.log('To send to any customer email address, add and verify your custom');
      console.log('domain at: https://resend.com/domains\n');
    }
  }
}

testResend();
