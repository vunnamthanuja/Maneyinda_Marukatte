/* =====================================================================
   MANEYINDA MARUKATTE - REAL TRANSACTIONAL EMAIL SERVICE
   Integrates directly with Resend API (HTTPS REST) with zero dependencies.
   Delivers branded, responsive OTP verification emails to real recipients.
===================================================================== */

const https = require('https');
const url = require('url');
require('../config/env');

class EmailService {
  constructor() {
    this.provider = 'resend';
  }

  getApiKey() {
    return process.env.RESEND_API_KEY || '';
  }

  getFromAddress() {
    return process.env.EMAIL_FROM || 'Maneyindha Marukatte <onboarding@resend.dev>';
  }

  isConfigured() {
    const key = this.getApiKey();
    return Boolean(key && key.trim().startsWith('re_') && !key.includes('your_api_key'));
  }

  /**
   * Generates a branded, responsive HTML template for OTP verification
   */
  generateOtpTemplate(otp, email, purpose = 'registration') {
    const purposeText = purpose === 'login'
      ? 'sign in to your customer account'
      : purpose === 'entrepreneur'
      ? 'verify your entrepreneur application'
      : 'complete your customer account registration';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email – Maneyindha Marukatte</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F4F6F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1B1F; }
    .email-container { max-width: 560px; margin: 30px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E0E3D8; }
    .email-header { background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%); padding: 32px 24px; text-align: center; color: #FFFFFF; }
    .email-header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .email-header p { margin: 6px 0 0 0; font-size: 13px; color: #C8E6C9; }
    .email-content { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 600; color: #1C1B1F; margin-bottom: 12px; }
    .intro-text { font-size: 14px; line-height: 1.6; color: #49454F; margin-bottom: 24px; }
    .otp-card { background: #F1F8E9; border: 2px dashed #81C784; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #2E7D32; margin-bottom: 8px; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #1B5E20; padding-left: 10px; }
    .expiry-badge { display: inline-block; background: #FFF3E0; color: #E65100; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 16px; margin-top: 10px; }
    .security-notice { background: #FFFDE7; border-left: 4px solid #FBC02D; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 24px 0; font-size: 13px; line-height: 1.5; color: #5D4037; }
    .help-text { font-size: 12px; color: #79747E; line-height: 1.6; border-top: 1px solid #ECEFF1; padding-top: 20px; margin-top: 24px; }
    .email-footer { background: #FAF9F6; padding: 20px 24px; text-align: center; font-size: 11px; color: #79747E; border-top: 1px solid #E0E3D8; }
    .email-footer a { color: #2E7D32; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>ಮನೆಯಿಂದ ಮಾರುಕಟ್ಟೆ</h1>
      <p>Maneyindha Marukatte — Empowering Home-Based Women Entrepreneurs</p>
    </div>
    <div class="email-content">
      <div class="greeting">Hello,</div>
      <p class="intro-text">
        We received a request to ${purposeText} using the email address <strong>${email}</strong>. Please enter the verification code below to verify your email address:
      </p>

      <div class="otp-card">
        <div class="otp-label">Your Verification Code</div>
        <div class="otp-code">${otp}</div>
        <div class="expiry-badge">⏱️ Valid for 5 minutes only</div>
      </div>

      <div class="security-notice">
        <strong>🛡️ Security Advice:</strong> Never share this verification code with anyone. Maneyindha Marukatte administrators and staff will never ask for your code.
      </div>

      <p class="help-text">
        If you did not request this verification code, you can safely ignore this email. No changes will be made to your account.
      </p>
    </div>
    <div class="email-footer">
      <p>© 2026 Maneyindha Marukatte Platform. Built with care for Karnataka's women entrepreneurs.</p>
      <p>Hyperlocal Marketplace • Zero Platform Commission • Direct Local Selling</p>
    </div>
  </div>
</body>
</html>
`;
  }

  /**
   * Sends real email via Resend API
   * @param {string} toEmail - Recipient email address
   * @param {string} otp - 6-digit OTP code
   * @param {string} purpose - Purpose of verification
   * @returns {Promise<{success: boolean, messageId?: string, error?: string, message: string}>}
   */
  async sendOtpEmail(toEmail, otp, purpose = 'registration') {
    const cleanTo = String(toEmail).toLowerCase().trim();
    const apiKey = this.getApiKey();

    if (!apiKey) {
      console.warn(`[EMAIL] RESEND_API_KEY is not configured in .env. Cannot deliver to ${cleanTo}`);
      return {
        success: false,
        error: 'EMAIL_PROVIDER_NOT_CONFIGURED',
        message: 'Email service is not configured. Please set RESEND_API_KEY in your server environment or .env file.'
      };
    }

    const payload = JSON.stringify({
      from: this.getFromAddress(),
      to: [cleanTo],
      subject: 'Verify Your Email – Maneyindha Marukatte',
      html: this.generateOtpTemplate(otp, cleanTo, purpose)
    });

    return new Promise((resolve) => {
      const options = {
        hostname: 'api.resend.com',
        port: 443,
        path: '/emails',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 10000 // 10s timeout
      };

      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          let parsed = {};
          try {
            parsed = JSON.parse(responseBody);
          } catch (e) {
            parsed = { message: responseBody };
          }

          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[EMAIL] Successfully dispatched OTP to ${cleanTo} via Resend. Message ID: ${parsed.id}`);
            return resolve({
              success: true,
              provider: 'resend',
              messageId: parsed.id,
              message: `Verification code sent to ${cleanTo}.`
            });
          }

          // Provider rejected request
          console.error(`[EMAIL] Resend API error (${res.statusCode}):`, parsed);
          let errorMessage = parsed.message || 'Failed to deliver email through provider.';
          
          // Provide actionable guidance if on free unverified domain
          if (parsed.statusCode === 403 && parsed.name === 'validation_error') {
            errorMessage = 'Resend free testing domain (onboarding@resend.dev) can only send to your account email, or verify your custom domain in Resend dashboard.';
          }

          return resolve({
            success: false,
            error: 'PROVIDER_REJECTED',
            providerStatusCode: res.statusCode,
            message: errorMessage
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        console.error(`[EMAIL] Delivery timeout sending to ${cleanTo}`);
        resolve({
          success: false,
          error: 'PROVIDER_TIMEOUT',
          message: 'Email provider timed out while delivering the verification email.'
        });
      });

      req.on('error', (err) => {
        console.error(`[EMAIL] HTTPS network error delivering to ${cleanTo}:`, err.message);
        resolve({
          success: false,
          error: 'NETWORK_ERROR',
          message: `Network error communicating with email provider: ${err.message}`
        });
      });

      req.write(payload);
      req.end();
    });
  }
}

module.exports = new EmailService();
