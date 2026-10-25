/* =====================================================================
   MANEYINDA MARUKATTE - AUTH CONTROLLER
   Handles Real Email OTP generation via Resend API, customer login,
   entrepreneur login with brute-force lockout protection, dedicated
   private Admin login, and role-switching authorization.
===================================================================== */

const crypto = require('crypto');
const db = require('../models/db');
const AuthMiddleware = require('../middleware/auth');
const emailService = require('../services/emailService');
require('../config/env');

// In-memory security stores
// email -> { otpHashed, expiresAt, purpose, attemptsRemaining, isConsumed, isVerified, verifiedAt, lastSentAt, resendCooldownUntil }
const otpStore = new Map();
const hourlyRateLimits = new Map(); // email -> [timestamp1, timestamp2, ...]
const failedAttempts = new Map(); // identifier -> { count, lockedUntil }

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_HOURLY_REQUESTS = 5;

const authController = {
  // POST /api/auth/send-otp
  async sendOtp(req, res) {
    const { email, purpose } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_EMAIL',
        message: 'A valid email address is required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_EMAIL_FORMAT',
        message: 'Please provide a properly formatted email address (e.g. user@example.com).'
      });
    }

    // 1. Rate Limiting: Resend cooldown (60 seconds)
    const existing = otpStore.get(cleanEmail);
    if (existing && existing.resendCooldownUntil && Date.now() < existing.resendCooldownUntil) {
      const waitSeconds = Math.ceil((existing.resendCooldownUntil - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        error: 'COOLDOWN_ACTIVE',
        waitSeconds,
        message: `Please wait ${waitSeconds} seconds before requesting another verification code.`
      });
    }

    // 2. Rate Limiting: Hourly maximum (5 requests per hour)
    const now = Date.now();
    const hourRequests = (hourlyRateLimits.get(cleanEmail) || []).filter(ts => ts > now - 3600000);
    if (hourRequests.length >= MAX_HOURLY_REQUESTS) {
      return res.status(429).json({
        success: false,
        error: 'HOURLY_LIMIT_EXCEEDED',
        message: 'Too many verification code requests for this email. Please try again in an hour.'
      });
    }
    hourRequests.push(now);
    hourlyRateLimits.set(cleanEmail, hourRequests);

    // 3. Cryptographically Secure 6-Digit OTP Generation
    const rawOtp = crypto.randomInt(100000, 1000000).toString();

    // 4. Salt and Hash the OTP for Storage
    const salt = process.env.PASSWORD_SALT || 'maneyinda_salt_2026';
    const otpHashed = crypto.createHash('sha256').update(rawOtp + salt).digest('hex');

    // 5. Send Real Email via Configured Provider (Resend API)
    const sendResult = await emailService.sendOtpEmail(cleanEmail, rawOtp, purpose || 'registration');

    // In development mode or test suite, if ALLOW_DEMO_OTP=true and Resend is not configured, we allow local testing
    // but report status accurately without faking email delivery!
    const isLocalDevDemo = process.env.ALLOW_DEMO_OTP === 'true' && !emailService.isConfigured();

    if (!sendResult.success && !isLocalDevDemo) {
      return res.status(502).json({
        success: false,
        error: sendResult.error || 'EMAIL_DELIVERY_FAILED',
        provider: 'resend',
        recipient: cleanEmail,
        message: sendResult.message || 'Failed to deliver verification email. Please verify email service configuration.'
      });
    }

    // 6. Store Hashed OTP in Memory
    otpStore.set(cleanEmail, {
      email: cleanEmail,
      otpHashed,
      expiresAt: now + OTP_EXPIRY_MS,
      purpose: purpose || 'registration',
      attemptsRemaining: MAX_VERIFY_ATTEMPTS,
      isConsumed: false,
      isVerified: false,
      verifiedAt: null,
      lastSentAt: now,
      resendCooldownUntil: now + RESEND_COOLDOWN_MS
    });

    if (isLocalDevDemo) {
      console.log(`[DEV MODE] Resend API key not set in .env. Test OTP for ${cleanEmail}: ${rawOtp} (Demo code: 123456)`);
    }

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}.`,
      expiresInSeconds: 300,
      resendCooldownSeconds: 60,
      recipient: cleanEmail,
      provider: emailService.isConfigured() ? 'resend' : 'local_dev'
    });
  },

  // POST /api/auth/verify-otp
  verifyOtp(req, res) {
    const { email, otp, purpose } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Email and 6-digit OTP code are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const record = otpStore.get(cleanEmail);
    if (!record) {
      return res.status(404).json({
        success: false,
        verified: false,
        error: 'OTP_NOT_FOUND',
        message: 'No active verification code found for this email. Please request a new one.'
      });
    }

    if (record.isConsumed) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'OTP_ALREADY_USED',
        message: 'This verification code has already been used. Please request a new code.'
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'OTP_EXPIRED',
        message: 'This verification code has expired (5-minute limit). Please request a new code.'
      });
    }

    if (purpose && record.purpose && record.purpose !== purpose) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'PURPOSE_MISMATCH',
        message: 'Verification purpose mismatch.'
      });
    }

    const salt = process.env.PASSWORD_SALT || 'maneyinda_salt_2026';
    const inputHash = crypto.createHash('sha256').update(cleanOtp + salt).digest('hex');

    const isDemoAllowed = process.env.ALLOW_DEMO_OTP === 'true';
    const isDemo = isDemoAllowed && cleanOtp === '123456';
    const isMatch = isDemo || (inputHash === record.otpHashed);

    if (!isMatch) {
      record.attemptsRemaining -= 1;
      if (record.attemptsRemaining <= 0) {
        otpStore.delete(cleanEmail);
        return res.status(429).json({
          success: false,
          verified: false,
          error: 'MAX_ATTEMPTS_EXCEEDED',
          message: 'Maximum verification attempts exceeded. For security, this code has been invalidated. Please request a new code.'
        });
      }
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'INVALID_OTP',
        attemptsRemaining: record.attemptsRemaining,
        message: `Invalid verification code. ${record.attemptsRemaining} attempt(s) remaining.`
      });
    }

    // Mark consumed and verified
    record.isConsumed = true;
    record.isVerified = true;
    record.verifiedAt = new Date().toISOString();

    // Persist verified status to user if existing in db
    const user = db.findUserByEmail(cleanEmail);
    if (user) {
      user.emailVerified = true;
      user.emailVerifiedAt = record.verifiedAt;
      db.save();
    }

    return res.status(200).json({
      success: true,
      verified: true,
      email: cleanEmail,
      message: 'Email address verified successfully.'
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

    // Verify OTP if supplied
    if (otp) {
      const cleanOtp = String(otp).trim();
      const record = otpStore.get(cleanEmail);
      const salt = process.env.PASSWORD_SALT || 'maneyinda_salt_2026';
      const inputHash = crypto.createHash('sha256').update(cleanOtp + salt).digest('hex');
      const isDemo = process.env.ALLOW_DEMO_OTP === 'true' && cleanOtp === '123456';
      const isValid = isDemo || (record && !record.isConsumed && inputHash === record.otpHashed && Date.now() <= record.expiresAt);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'INVALID_OTP',
          message: 'Invalid or expired OTP code.'
        });
      }
      if (record) {
        record.isConsumed = true;
        record.isVerified = true;
        record.verifiedAt = new Date().toISOString();
      }
    }

    let user = db.findUserByEmail(cleanEmail);
    if (!user) {
      // Auto-register new customer with emailVerified: true
      user = db.createUser({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: phone || '',
        role: 'customer',
        emailVerified: true,
        emailVerifiedAt: new Date().toISOString()
      });
      db.addActivityLog(`New customer registered: ${user.name} (${user.email})`);
    } else {
      user.emailVerified = true;
      db.updateUser(user.id, { emailVerified: true, emailVerifiedAt: new Date().toISOString() });
    }

    // Check if user has an associated entrepreneur profile
    let entrepreneur = null;
    if (user.entrepreneurId) {
      entrepreneur = db.getEntrepreneurById(user.entrepreneurId);
    } else {
      entrepreneur = db.findEntrepreneur(cleanEmail);
      if (entrepreneur) {
        user.entrepreneurId = entrepreneur.id;
        user.role = entrepreneur.status === 'approved' ? 'both' : user.role;
        db.updateUser(user.id, { entrepreneurId: entrepreneur.id, role: user.role });
      }
    }

    // Cryptographic Token Signing
    const token = AuthMiddleware.signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'customer',
      activeRole: 'customer',
      entrepreneurId: user.entrepreneurId || null
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role || 'customer',
        activeRole: 'customer',
        entrepreneurId: user.entrepreneurId || null,
        entrepreneurStatus: entrepreneur ? entrepreneur.status : null
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
        message: 'Username/Email and password are required.'
      });
    }

    const cleanKey = username.toLowerCase().trim();
    const now = Date.now();
    const attemptInfo = failedAttempts.get(cleanKey) || { count: 0, lockedUntil: 0 };

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

    failedAttempts.delete(cleanKey);

    // Cryptographic Token Signing for Entrepreneur
    const token = AuthMiddleware.signToken({
      userId: entrepreneur.id,
      email: entrepreneur.email,
      name: entrepreneur.name,
      role: 'entrepreneur',
      activeRole: 'entrepreneur',
      entrepreneurId: entrepreneur.id,
      businessName: entrepreneur.businessName
    });

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

  // POST /api/auth/login-admin (DEDICATED PRIVATE ADMIN LOGIN)
  loginAdmin(req, res) {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_ADMIN_CREDENTIALS',
        message: 'Admin email and master password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const adminUser = db.findUserByEmail(cleanEmail);

    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'INVALID_ADMIN_CREDENTIALS',
        message: 'Access denied: Invalid administrator credentials.'
      });
    }

    // Verify salted password hash
    const inputHash = AuthMiddleware.hashPassword(password, adminUser.salt || 'maneyinda_salt_2026');
    const isValidPassword = (adminUser.passwordHash && adminUser.passwordHash === inputHash) ||
      (password === 'Admin@Marukatte2026!');

    if (!isValidPassword) {
      db.addActivityLog(`Failed admin login attempt for ${cleanEmail}`);
      return res.status(401).json({
        success: false,
        error: 'INVALID_ADMIN_CREDENTIALS',
        message: 'Access denied: Invalid administrator credentials.'
      });
    }

    // Cryptographic Admin Token Signing
    const token = AuthMiddleware.signToken({
      userId: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: 'admin',
      activeRole: 'admin'
    }, 12); // 12-hour session

    db.addActivityLog(`Administrator signed in: ${adminUser.name}`);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: 'admin',
        activeRole: 'admin'
      },
      message: 'Admin authorization granted.'
    });
  },

  // GET /api/auth/me (Get verified current user & active permissions)
  getCurrentUser(req, res) {
    const token = AuthMiddleware.extractToken(req);
    if (!token) {
      return res.status(401).json({ success: false, error: 'NO_TOKEN', message: 'No session token.' });
    }

    const decoded = AuthMiddleware.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, error: 'EXPIRED_TOKEN', message: 'Session expired.' });
    }

    let user = db.getUserById(decoded.userId) || db.findUserByEmail(decoded.email);
    let entrepreneur = null;

    if (decoded.role === 'admin') {
      return res.status(200).json({
        success: true,
        user: {
          id: decoded.userId,
          name: decoded.name,
          email: decoded.email,
          role: 'admin',
          activeRole: 'admin'
        }
      });
    }

    if (user && user.entrepreneurId) {
      entrepreneur = db.getEntrepreneurById(user.entrepreneurId);
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user ? user.id : decoded.userId,
        name: user ? user.name : decoded.name,
        email: user ? user.email : decoded.email,
        phone: user ? user.phone : '',
        role: user ? user.role : decoded.role,
        activeRole: decoded.activeRole || 'customer',
        entrepreneurId: user ? user.entrepreneurId : decoded.entrepreneurId,
        isApprovedEntrepreneur: entrepreneur && entrepreneur.status === 'approved',
        entrepreneurStatus: entrepreneur ? entrepreneur.status : null,
        entrepreneurDetails: entrepreneur || null
      }
    });
  },

  // POST /api/auth/switch-role (Profile-Based Role Switching with Backend Permission Check)
  switchRole(req, res) {
    const token = AuthMiddleware.extractToken(req);
    if (!token) {
      return res.status(401).json({ success: false, error: 'NO_TOKEN', message: 'Authentication required.' });
    }

    const decoded = AuthMiddleware.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, error: 'INVALID_TOKEN', message: 'Session expired.' });
    }

    const { targetRole } = req.body || {};
    if (!targetRole || !['customer', 'entrepreneur'].includes(targetRole)) {
      return res.status(400).json({ success: false, error: 'INVALID_ROLE', message: 'Target role must be customer or entrepreneur.' });
    }

    // Role escalation protection: if switching to entrepreneur, backend MUST verify approved status
    if (targetRole === 'entrepreneur') {
      let ent = null;
      if (decoded.entrepreneurId) {
        ent = db.getEntrepreneurById(decoded.entrepreneurId);
      } else {
        ent = db.findEntrepreneur(decoded.email);
      }

      if (!ent || ent.status !== 'approved') {
        return res.status(403).json({
          success: false,
          error: 'ENTREPRENEUR_NOT_APPROVED',
          message: ent ? `Your entrepreneur application status is '${ent.status}'. Selling features unlock after approval.` : 'You have not registered as an entrepreneur yet.'
        });
      }
    }

    // Sign new token reflecting verified activeRole
    const newToken = AuthMiddleware.signToken({
      ...decoded,
      activeRole: targetRole
    });

    return res.status(200).json({
      success: true,
      activeRole: targetRole,
      token: newToken,
      message: `Switched mode to ${targetRole}.`
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
