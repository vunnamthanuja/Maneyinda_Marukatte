/* =====================================================================
   MANEYINDA MARUKATTE - MULTI-PROVIDER REAL TRANSACTIONAL EMAIL SERVICE
   Supports:
   1. Resend API (HTTPS REST via official api.resend.com)
   2. Brevo API (HTTPS REST via official api.brevo.com)
   3. Native SMTP (Direct TLS on port 465, e.g. Gmail App Password, Brevo SMTP)
   4. Safe Test Transport (strictly for automated in-process test runner)
   Zero external npm dependencies.
===================================================================== */

const https = require('https');
const url = require('url');
const SmtpClient = require('./smtpClient');
require('../config/env');

class EmailService {
  constructor() {
    this.lastDeliveryStatus = null;
  }

  getActiveProvider() {
    const resendKey = process.env.RESEND_API_KEY || '';
    if (resendKey && resendKey.startsWith('re_') && !resendKey.includes('your_api_key')) {
      return 'resend';
    }

    const brevoKey = process.env.BREVO_API_KEY || '';
    if (brevoKey && (brevoKey.startsWith('xkeysib-') || brevoKey.length > 20) && !brevoKey.includes('your_api_key')) {
      return 'brevo';
    }

    const smtpHost = process.env.SMTP_HOST || '';
    if (smtpHost && !smtpHost.includes('your_smtp')) {
      return 'smtp';
    }

    if (process.env.NODE_ENV === 'test') {
      return 'test';
    }

    return 'none';
  }

  isConfigured() {
    return this.getActiveProvider() !== 'none';
  }

  getFromAddress() {
    if (process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes('verified_sender')) {
      return process.env.EMAIL_FROM;
    }
    if (process.env.SMTP_USER) {
      return `Maneyindha Marukatte <${process.env.SMTP_USER}>`;
    }
    return 'Maneyindha Marukatte <onboarding@resend.dev>';
  }

  /**
   * Diagnostic summary of email configuration
   */
  getStatus() {
    const provider = this.getActiveProvider();
    const from = this.getFromAddress();

    let details = 'No email delivery provider is configured.';
    let ready = false;

    if (provider === 'resend') {
      ready = true;
      const isSandboxDomain = from.includes('resend.dev');
      details = isSandboxDomain
        ? 'Using Resend Sandbox domain (onboarding@resend.dev). Note: Free sandbox domain can only send to your own registered Resend email.'
        : `Resend API configured with custom verified sender: ${from}`;
    } else if (provider === 'brevo') {
      ready = true;
      details = `Brevo API configured with sender: ${from}`;
    } else if (provider === 'smtp') {
      ready = true;
      details = `Native SMTP configured via ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 465} (User: ${process.env.SMTP_USER || 'anonymous'})`;
    } else if (provider === 'test') {
      ready = true;
      details = 'Automated test environment (in-memory mock delivery).';
    }

    return {
      provider,
      isConfigured: ready,
      sender: from,
      details,
      lastDelivery: this.lastDeliveryStatus
    };
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
        We received a request to ${purposeText} using the email address <strong>${email}</strong>. Please enter the verification code below:
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
   * Main dispatch method - sends to user's real email using configured provider
   */
  async sendOtpEmail(toEmail, otp, purpose = 'registration') {
    const cleanTo = String(toEmail).toLowerCase().trim();
    const provider = this.getActiveProvider();

    if (provider === 'none') {
      const err = {
        success: false,
        error: 'EMAIL_PROVIDER_NOT_CONFIGURED',
        provider: 'none',
        message: 'No email delivery provider is configured. Please add RESEND_API_KEY, BREVO_API_KEY, or SMTP credentials in your .env file.'
      };
      this.lastDeliveryStatus = { ...err, timestamp: new Date().toISOString(), recipient: cleanTo };
      console.warn(`[EMAIL] Delivery failed: No email provider configured in .env for ${cleanTo}`);
      return err;
    }

    if (provider === 'test') {
      console.log(`[EMAIL:TEST] Test mode: generated OTP for ${cleanTo}`);
      return {
        success: true,
        provider: 'test',
        messageId: `test-${Date.now()}`,
        message: `Test email dispatched to ${cleanTo}`
      };
    }

    if (provider === 'resend') {
      return await this.sendViaResend(cleanTo, otp, purpose);
    }

    if (provider === 'brevo') {
      return await this.sendViaBrevo(cleanTo, otp, purpose);
    }

    if (provider === 'smtp') {
      return await this.sendViaSmtp(cleanTo, otp, purpose);
    }
  }

  // --- 1. RESEND API DELIVERY ---
  async sendViaResend(cleanTo, otp, purpose) {
    const apiKey = process.env.RESEND_API_KEY.trim();
    const from = this.getFromAddress();
    const payload = JSON.stringify({
      from,
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
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);

        res.on('end', () => {
          let parsed = {};
          try {
            parsed = JSON.parse(responseBody);
          } catch (e) {
            parsed = { message: responseBody };
          }

          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[EMAIL:RESEND] Dispatched email to ${cleanTo}. Resend Message ID: ${parsed.id}`);
            const result = {
              success: true,
              provider: 'resend',
              messageId: parsed.id,
              message: `Verification code delivered to ${cleanTo}.`
            };
            this.lastDeliveryStatus = { ...result, timestamp: new Date().toISOString(), recipient: cleanTo };
            return resolve(result);
          }

          let errorMessage = parsed.message || 'Resend API rejected the email request.';
          if (res.statusCode === 403 && from.includes('resend.dev')) {
            errorMessage = `Resend sandbox domain (onboarding@resend.dev) can only send to your own Resend account email. To send to ${cleanTo}, please add & verify your custom domain in Resend dashboard, or configure SMTP in .env.`;
          } else if (res.statusCode === 401) {
            errorMessage = 'Invalid Resend API Key. Please verify RESEND_API_KEY in your .env file.';
          }

          console.error(`[EMAIL:RESEND] Error ${res.statusCode}:`, errorMessage);
          const failure = {
            success: false,
            error: 'PROVIDER_REJECTED',
            provider: 'resend',
            statusCode: res.statusCode,
            message: errorMessage
          };
          this.lastDeliveryStatus = { ...failure, timestamp: new Date().toISOString(), recipient: cleanTo };
          resolve(failure);
        });
      });

      req.on('timeout', () => {
        req.destroy();
        const err = { success: false, error: 'TIMEOUT', provider: 'resend', message: 'Resend API connection timed out.' };
        this.lastDeliveryStatus = { ...err, timestamp: new Date().toISOString(), recipient: cleanTo };
        resolve(err);
      });

      req.on('error', (err) => {
        console.error(`[EMAIL:RESEND] Network error: ${err.message}`);
        const result = {
          success: false,
          error: 'NETWORK_ERROR',
          provider: 'resend',
          message: `Network error connecting to Resend: ${err.message}`
        };
        this.lastDeliveryStatus = { ...result, timestamp: new Date().toISOString(), recipient: cleanTo };
        resolve(result);
      });

      req.write(payload);
      req.end();
    });
  }

  // --- 2. BREVO API DELIVERY ---
  async sendViaBrevo(cleanTo, otp, purpose) {
    const apiKey = process.env.BREVO_API_KEY.trim();
    const fromRaw = this.getFromAddress();
    const fromEmail = fromRaw.includes('<') ? fromRaw.match(/<([^>]+)>/)[1] : fromRaw;
    const fromName = fromRaw.includes('<') ? fromRaw.split('<')[0].trim() : 'Maneyindha Marukatte';

    const payload = JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: cleanTo }],
      subject: 'Verify Your Email – Maneyindha Marukatte',
      htmlContent: this.generateOtpTemplate(otp, cleanTo, purpose)
    });

    return new Promise((resolve) => {
      const options = {
        hostname: 'api.brevo.com',
        port: 443,
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);

        res.on('end', () => {
          let parsed = {};
          try { parsed = JSON.parse(responseBody); } catch (e) { parsed = { message: responseBody }; }

          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[EMAIL:BREVO] Dispatched email to ${cleanTo}. Brevo Message ID: ${parsed.messageId}`);
            const result = {
              success: true,
              provider: 'brevo',
              messageId: parsed.messageId,
              message: `Verification code delivered to ${cleanTo}.`
            };
            this.lastDeliveryStatus = { ...result, timestamp: new Date().toISOString(), recipient: cleanTo };
            return resolve(result);
          }

          console.error(`[EMAIL:BREVO] Error ${res.statusCode}:`, parsed);
          const failure = {
            success: false,
            error: 'BREVO_ERROR',
            provider: 'brevo',
            statusCode: res.statusCode,
            message: parsed.message || 'Brevo API rejected email dispatch.'
          };
          this.lastDeliveryStatus = { ...failure, timestamp: new Date().toISOString(), recipient: cleanTo };
          resolve(failure);
        });
      });

      req.on('error', (err) => {
        const result = { success: false, error: 'BREVO_NETWORK_ERROR', message: `Brevo connection failed: ${err.message}` };
        this.lastDeliveryStatus = { ...result, timestamp: new Date().toISOString(), recipient: cleanTo };
        resolve(result);
      });

      req.write(payload);
      req.end();
    });
  }

  // --- 3. NATIVE SMTP DELIVERY (e.g. Gmail App Password, Brevo SMTP) ---
  async sendViaSmtp(cleanTo, otp, purpose) {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = this.getFromAddress();
    const subject = 'Verify Your Email – Maneyindha Marukatte';
    const html = this.generateOtpTemplate(otp, cleanTo, purpose);

    console.log(`[EMAIL:SMTP] Connecting to ${host}:${port} for ${cleanTo}...`);
    const res = await SmtpClient.sendMail({
      host,
      port,
      user,
      pass,
      from,
      to: cleanTo,
      subject,
      html
    });

    this.lastDeliveryStatus = { ...res, timestamp: new Date().toISOString(), recipient: cleanTo };
    return res;
  }
}

module.exports = new EmailService();
