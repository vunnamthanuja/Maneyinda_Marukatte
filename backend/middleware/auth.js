/* =====================================================================
   MANEYINDA MARUKATTE - AUTH & ROLE AUTHORIZATION MIDDLEWARE
   Universal HMAC-SHA256 Token Signing & Role-Based Access Control
===================================================================== */

const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'maneyinda_marukatte_secure_jwt_secret_key_2026';

function toBase64Url(str) {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(base64url) {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

class AuthMiddleware {
  // Sign a secure payload with HMAC-SHA256
  static signToken(payload, expiresInHours = 24) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const exp = Date.now() + (expiresInHours * 60 * 60 * 1000);
    const body = { ...payload, exp };

    const headerB64 = toBase64Url(JSON.stringify(header));
    const bodyB64 = toBase64Url(JSON.stringify(body));

    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${bodyB64}`)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return `${headerB64}.${bodyB64}.${signature}`;
  }

  // Verify and decode token
  static verifyToken(tokenString) {
    if (!tokenString || typeof tokenString !== 'string') return null;

    const parts = tokenString.trim().split('.');
    if (parts.length !== 3) return null;

    const [headerB64, bodyB64, signature] = parts;

    // Verify cryptographic signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${bodyB64}`)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    if (signature !== expectedSignature) {
      return null; // Signature mismatch! Tampered token.
    }

    try {
      const payload = JSON.parse(fromBase64Url(bodyB64));
      if (payload.exp && Date.now() > payload.exp) {
        return null; // Token expired!
      }
      return payload;
    } catch (e) {
      return null;
    }
  }

  // Hash password using SHA-256 with salt
  static hashPassword(password, salt = 'maneyinda_salt_2026') {
    return crypto
      .createHash('sha256')
      .update(password + salt)
      .digest('hex');
  }

  // Extract Bearer token from Request Header
  static extractToken(req) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
    return null;
  }

  // Middleware: Authenticate any logged-in user
  static authenticate(req, res, next) {
    const token = AuthMiddleware.extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication token is required to access this resource.'
      });
    }

    const decoded = AuthMiddleware.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_OR_EXPIRED_TOKEN',
        message: 'Your session has expired or the token is invalid. Please sign in again.'
      });
    }

    req.user = decoded;
    if (next) next();
  }

  // Middleware: Strictly Require Admin Role
  static requireAdmin(req, res, next) {
    const token = AuthMiddleware.extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'ADMIN_AUTH_REQUIRED',
        message: 'Admin authorization token required.'
      });
    }

    const decoded = AuthMiddleware.verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'ADMIN_ACCESS_DENIED',
        message: 'Forbidden: Access restricted strictly to Platform Administrators.'
      });
    }

    req.user = decoded;
    if (next) next();
  }

  // Middleware: Require Entrepreneur Role
  static requireEntrepreneur(req, res, next) {
    const token = AuthMiddleware.extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'ENTREPRENEUR_AUTH_REQUIRED',
        message: 'Entrepreneur authorization token required.'
      });
    }

    const decoded = AuthMiddleware.verifyToken(token);
    if (!decoded || (decoded.role !== 'entrepreneur' && decoded.role !== 'both' && decoded.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        error: 'ENTREPRENEUR_ACCESS_DENIED',
        message: 'Forbidden: You must be a registered and approved Entrepreneur to access this resource.'
      });
    }

    req.user = decoded;
    if (next) next();
  }
}

module.exports = AuthMiddleware;
