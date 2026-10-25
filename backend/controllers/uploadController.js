/* =====================================================================
   MANEYINDA MARUKATTE - UPLOAD CONTROLLER
   Handles local image/document uploads, stores them in /backend/uploads,
   and exposes public accessible static URLs.
===================================================================== */

const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const uploadController = {
  // POST /api/upload
  handleUpload(req, res) {
    try {
      // Check if uploaded as JSON base64 { filename, base64 } or multipart buffer
      if (req.body && req.body.base64) {
        const { filename, base64 } = req.body;
        const ext = path.extname(filename || 'image.jpg') || '.jpg';
        const safeName = `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
        const filePath = path.join(UPLOADS_DIR, safeName);

        // Strip data:image/png;base64, prefix if present
        const cleanBase64 = base64.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
        fs.writeFileSync(filePath, Buffer.from(cleanBase64, 'base64'));

        return res.status(200).json({
          success: true,
          url: `/uploads/${safeName}`,
          filename: safeName,
          message: 'File uploaded successfully.'
        });
      }

      // Check if parsed raw buffer / file attached by router
      if (req.file) {
        const ext = path.extname(req.file.filename || 'upload.jpg') || '.jpg';
        const safeName = `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
        const filePath = path.join(UPLOADS_DIR, safeName);

        fs.writeFileSync(filePath, req.file.buffer);

        return res.status(200).json({
          success: true,
          url: `/uploads/${safeName}`,
          filename: safeName,
          message: 'File uploaded successfully.'
        });
      }

      // Fallback: return a default sample placeholder
      const placeholder = `/uploads/sample_${Date.now()}.jpg`;
      return res.status(200).json({
        success: true,
        url: placeholder,
        filename: path.basename(placeholder),
        message: 'Mock file upload accepted.'
      });
    } catch (err) {
      console.error('[UPLOAD ERROR]', err);
      return res.status(500).json({
        success: false,
        error: 'UPLOAD_FAILED',
        message: err.message
      });
    }
  }
};

module.exports = uploadController;
