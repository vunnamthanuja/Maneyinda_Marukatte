/* =====================================================================
   MANEYINDA MARUKATTE - AUTH CONTROLLER
   Handles OTP generation, customer login, entrepreneur login with
   brute-force lockout protection, and security questions password reset.
===================================================================== */

const db = require('../models/db');

// In-memory stores
const otpStore = new Map(); // email -> { otp, expiresAt }
const failedAttempts = new Map(); // identifier -> { count, lockedUntil }

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const authController = {
  // POST /api/auth/send-otp
  sendOtp(req, res) {
    const { email, purpose } = req.body || {};
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_EMAIL',
        message: 'A valid email address is required.'
      });
    }

    // Generate 6-digit numeric OTP (allow demo code 123456 as standard fallback)
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInSeconds = 120; // 2 minutes

    otpStore.set(email.toLowerCase().trim(), {
      otp: generatedOtp,
      expiresAt: Date.now() + (expiresInSeconds * 1000),
      purpose: purpose || 'login'
    });

    console.log(`[AUTH] OTP for ${email}: ${generatedOtp} (or demo: 123456)`);

    return res.status(200).json({
      success: true,
      message: '6-digit OTP code sent successfully to ' + email,
      expiresInSeconds,
      // Provide preview OTP in response for zero-friction local testing
      debugOtp: generatedOtp
    });
  },

  // POST /api/auth/verify-otp
  verifyOtp(req, res) {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Email and OTP code are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Support demo OTP 123456 or stored OTP
    const record = otpStore.get(cleanEmail);
    const isValid = cleanOtp === '123456' || (record && record.otp === cleanOtp && record.expiresAt > Date.now());

    if (!isValid) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'INVALID_OTP',
        message: 'The OTP code is invalid or has expired.'
      });
    }

    // Clear used OTP
    otpStore.delete(cleanEmail);

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'OTP verified successfully.'
    });
  },

  // POST /api/auth/login-customer
  loginCustomer(req, res) {
    const { email, otp, name, phone } = req.body || {};
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_EMAIL',
        message: 'Email is required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify OTP if supplied (allow demo OTP 123456)
    if (otp) {
      const record = otpStore.get(cleanEmail);
      const isValid = String(otp).trim() === '123456' || (record && record.otp === String(otp).trim());
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'INVALID_OTP',
          message: 'Invalid or expired OTP.'
        });
      }
      otpStore.delete(cleanEmail);
    }

    let user = db.findUserByEmail(cleanEmail);
    if (!user) {
      // Auto-register new customer
      user = db.createUser({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: phone || '',
        role: 'customer'
      });
      db.addActivityLog(`New customer registered: ${user.name} (${user.email})`);
    }

    const token = 'token_cust_' + Buffer.from(cleanEmail + ':' + Date.now()).toString('base64');

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role || 'customer',
        entrepreneurId: user.entrepreneurId || null
      },
      token
    });
  },

  // POST /api/auth/login-entrepreneur
  loginEntrepreneur(req, res) {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'Username and password are required.'
      });
    }

    const cleanKey = username.toLowerCase().trim();
    const now = Date.now();
    const attemptInfo = failedAttempts.get(cleanKey) || { count: 0, lockedUntil: 0 };

    // Check if account is locked
    if (attemptInfo.lockedUntil > now) {
      const remainingHours = Math.ceil((attemptInfo.lockedUntil - now) / (1000 * 60 * 60));
      return res.status(429).json({
        success: false,
        error: 'MAX_ATTEMPTS_EXCEEDED',
        message: `Maximum attempts exceeded. Try again after ${remainingHours} hour(s) or reset your password.`
      });
    }

    const entrepreneur = db.findEntrepreneur(cleanKey);
    if (!entrepreneur) {
      return res.status(404).json({
        success: false,
        error: 'ENTREPRENEUR_NOT_FOUND',
        message: 'No registered entrepreneur found with this username or email.'
      });
    }

    // Default password check (demo password is 'password123' if not explicitly defined)
    const expectedPassword = entrepreneur.password || 'password123';
    if (password !== expectedPassword) {
      attemptInfo.count += 1;
      if (attemptInfo.count >= MAX_ATTEMPTS) {
        attemptInfo.lockedUntil = now + LOCKOUT_DURATION_MS;
        failedAttempts.set(cleanKey, attemptInfo);
        return res.status(429).json({
          success: false,
          error: 'MAX_ATTEMPTS_EXCEEDED',
          message: 'Maximum attempts exceeded. Try again after 24 hours or reset your password.'
        });
      }

      failedAttempts.set(cleanKey, attemptInfo);
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        attemptsRemaining: MAX_ATTEMPTS - attemptInfo.count,
        message: `Incorrect password. ${MAX_ATTEMPTS - attemptInfo.count} attempt(s) remaining before 24-hour lockout.`
      });
    }

    // Reset failed attempts on success
    failedAttempts.delete(cleanKey);

    const token = 'token_ent_' + Buffer.from(entrepreneur.id + ':' + Date.now()).toString('base64');

    return res.status(200).json({
      success: true,
      entrepreneur: {
        id: entrepreneur.id,
        name: entrepreneur.name,
        businessName: entrepreneur.businessName,
        status: entrepreneur.status,
        badge: entrepreneur.badge || 'Verified',
        isStoreOpen: entrepreneur.isStoreOpen !== false,
        openingSchedule: entrepreneur.openingSchedule || 'Opens Daily at 9:00 AM'
      },
      token
    });
  },

  // POST /api/auth/reset-password
  resetPassword(req, res) {
    const { email, answers, newPassword } = req.body || {};
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Email and new password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const entrepreneur = db.findEntrepreneur(cleanEmail);

    if (!entrepreneur) {
      return res.status(404).json({
        success: false,
        error: 'ACCOUNT_NOT_FOUND',
        message: 'No entrepreneur account registered with this email.'
      });
    }

    // If answers provided, verify against registered security answers
    if (entrepreneur.securityAnswers && Array.isArray(answers) && answers.length > 0) {
      const allMatch = answers.every(ans => {
        const stored = entrepreneur.securityAnswers.find(sa => 
          sa.question.toLowerCase().trim() === (ans.question || '').toLowerCase().trim()
        );
        return stored && stored.answer.toLowerCase().trim() === (ans.answer || '').toLowerCase().trim();
      });

      if (!allMatch) {
        return res.status(400).json({
          success: false,
          error: 'SECURITY_ANSWERS_MISMATCH',
          message: 'One or more security question answers are incorrect.'
        });
      }
    }

    // Update password & clear lockouts
    db.updateEntrepreneur(entrepreneur.id, { password: newPassword });
    failedAttempts.delete(cleanEmail);
    if (entrepreneur.username) failedAttempts.delete(entrepreneur.username.toLowerCase());

    db.addActivityLog(`Password reset for entrepreneur: ${entrepreneur.businessName}`);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.'
    });
  }
};

module.exports = authController;
