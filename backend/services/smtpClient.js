/* =====================================================================
   MANEYINDA MARUKATTE - ZERO-DEPENDENCY NATIVE SMTP CLIENT
   Sends transactional emails over TLS (e.g. Gmail port 465, Brevo SMTP, etc.)
   using standard Node.js tls / net libraries.
===================================================================== */

const tls = require('tls');
const net = require('net');

class SmtpClient {
  /**
   * Sends an email via standard SMTP (TLS)
   * @param {Object} config - { host, port, user, pass, from, to, subject, html }
   */
  static sendMail({ host, port = 465, user, pass, from, to, subject, html }) {
    return new Promise((resolve, reject) => {
      const cleanTo = String(to).toLowerCase().trim();
      const cleanFrom = from.includes('<') ? from.match(/<([^>]+)>/)[1] : from;
      const portNum = parseInt(port, 10) || 465;

      let socket = null;
      let buffer = '';
      let step = 0;

      const cleanup = () => {
        if (socket && !socket.destroyed) {
          socket.destroy();
        }
      };

      const sendCommand = (cmd) => {
        if (socket && socket.writable) {
          socket.write(cmd + '\r\n');
        }
      };

      const onConnect = () => {
        // Connected to SMTP server; waiting for 220 greeting
      };

      try {
        if (portNum === 465) {
          // Direct SSL/TLS connection (Standard for Gmail, etc.)
          socket = tls.connect({
            host,
            port: portNum,
            rejectUnauthorized: false,
            timeout: 10000
          }, onConnect);
        } else {
          // Standard TCP (e.g. port 587 or 25)
          socket = net.connect({
            host,
            port: portNum,
            timeout: 10000
          }, onConnect);
        }
      } catch (err) {
        return resolve({
          success: false,
          error: 'SMTP_CONNECTION_FAILED',
          message: `Failed to connect to SMTP host ${host}:${portNum} - ${err.message}`
        });
      }

      socket.setEncoding('utf8');

      socket.on('timeout', () => {
        cleanup();
        resolve({
          success: false,
          error: 'SMTP_TIMEOUT',
          message: `Connection timed out while communicating with ${host}:${portNum}`
        });
      });

      socket.on('error', (err) => {
        cleanup();
        resolve({
          success: false,
          error: 'SMTP_SOCKET_ERROR',
          message: `SMTP error: ${err.message}`
        });
      });

      socket.on('data', (chunk) => {
        buffer += chunk;
        const lines = buffer.split('\r\n');
        buffer = lines.pop(); // Keep trailing incomplete line

        for (const line of lines) {
          if (!line) continue;
          const code = parseInt(line.substring(0, 3), 10);

          // Check if intermediate multiline response (e.g. "250-SIZE ...")
          if (line.charAt(3) === '-') continue;

          if (step === 0) {
            // Waiting for 220 Server Greeting
            if (code === 220) {
              step = 1;
              sendCommand(`EHLO [127.0.0.1]`);
            } else {
              cleanup();
              return resolve({ success: false, error: 'BAD_GREETING', message: `Server rejected greeting: ${line}` });
            }
          } else if (step === 1) {
            // Waiting for 250 EHLO response
            if (code === 250) {
              if (user && pass) {
                step = 2;
                sendCommand(`AUTH LOGIN`);
              } else {
                step = 4;
                sendCommand(`MAIL FROM:<${cleanFrom}>`);
              }
            } else {
              cleanup();
              return resolve({ success: false, error: 'EHLO_FAILED', message: `EHLO failed: ${line}` });
            }
          } else if (step === 2) {
            // Waiting for 334 Username prompt
            if (code === 334) {
              step = 3;
              sendCommand(Buffer.from(user).toString('base64'));
            } else {
              cleanup();
              return resolve({ success: false, error: 'AUTH_FAILED', message: `AUTH LOGIN rejected: ${line}` });
            }
          } else if (step === 3) {
            // Waiting for 334 Password prompt
            if (code === 334) {
              step = 4;
              sendCommand(Buffer.from(pass).toString('base64'));
            } else {
              cleanup();
              return resolve({ success: false, error: 'USER_REJECTED', message: `Username rejected: ${line}` });
            }
          } else if (step === 4) {
            // Waiting for 235 Authentication successful
            if (code === 235) {
              step = 5;
              sendCommand(`MAIL FROM:<${cleanFrom}>`);
            } else {
              cleanup();
              return resolve({ success: false, error: 'AUTH_REJECTED', message: `SMTP Authentication failed. Check SMTP_USER and SMTP_PASS: ${line}` });
            }
          } else if (step === 5) {
            // Waiting for 250 MAIL FROM response
            if (code === 250) {
              step = 6;
              sendCommand(`RCPT TO:<${cleanTo}>`);
            } else {
              cleanup();
              return resolve({ success: false, error: 'SENDER_REJECTED', message: `Sender address rejected (${cleanFrom}): ${line}` });
            }
          } else if (step === 6) {
            // Waiting for 250 RCPT TO response
            if (code === 250) {
              step = 7;
              sendCommand(`DATA`);
            } else {
              cleanup();
              return resolve({ success: false, error: 'RECIPIENT_REJECTED', message: `Recipient rejected (${cleanTo}): ${line}` });
            }
          } else if (step === 7) {
            // Waiting for 354 Start mail input
            if (code === 354) {
              step = 8;
              const rfc822 = [
                `From: ${from}`,
                `To: ${cleanTo}`,
                `Subject: ${subject}`,
                `MIME-Version: 1.0`,
                `Content-Type: text/html; charset=utf-8`,
                `Date: ${new Date().toUTCString()}`,
                ``,
                html,
                `.`
              ].join('\r\n');
              sendCommand(rfc822);
            } else {
              cleanup();
              return resolve({ success: false, error: 'DATA_REJECTED', message: `DATA command rejected: ${line}` });
            }
          } else if (step === 8) {
            // Waiting for 250 Message accepted for delivery
            if (code === 250) {
              step = 9;
              sendCommand(`QUIT`);
              cleanup();
              return resolve({
                success: true,
                provider: 'smtp',
                messageId: `smtp-${Date.now()}`,
                message: `Email accepted for delivery by SMTP server to ${cleanTo}`
              });
            } else {
              cleanup();
              return resolve({ success: false, error: 'MESSAGE_REJECTED', message: `SMTP server rejected message body: ${line}` });
            }
          }
        }
      });
    });
  }
}

module.exports = SmtpClient;
