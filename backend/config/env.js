/* =====================================================================
   MANEYINDA MARUKATTE - ENVIRONMENT CONFIGURATION LOADER
   Loads and parses .env file into process.env with zero dependencies,
   and provides safe development defaults when .env is absent.
===================================================================== */

const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '..', '.env');

  if (fs.existsSync(envPath)) {
    try {
      const raw = fs.readFileSync(envPath, 'utf-8');
      const lines = raw.split(/\r?\n/);

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.substring(0, eqIdx).trim();
          let val = trimmed.substring(eqIdx + 1).trim();

          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }

          if (process.env[key] === undefined) {
            process.env[key] = val;
          }
        }
      }
    } catch (err) {
      console.warn('[ENV] Warning: Failed to parse .env file:', err.message);
    }
  }

  // Safe development defaults when running locally without .env
  if (process.env.PORT === undefined) process.env.PORT = '5000';
  if (process.env.NODE_ENV === undefined) process.env.NODE_ENV = 'development';
  if (process.env.PASSWORD_SALT === undefined) process.env.PASSWORD_SALT = 'maneyinda_salt_2026';
  if (process.env.ALLOW_DEMO_OTP === undefined) process.env.ALLOW_DEMO_OTP = 'true';
}

loadEnv();

module.exports = {
  loadEnv
};
