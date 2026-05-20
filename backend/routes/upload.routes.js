const express = require('express');
const multer = require('multer');
const storage = require('../config/storage');
const authMiddleware = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, png, gif, webp) o PDFs'), false);
    }
  }
});

router.post(
  '/imagen',
  authMiddleware,
  roleMiddleware('admin'),
  upload.single('imagen'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
      }

      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      console.log(`Subiendo archivo usando proveedor: ${storage.getProviderName()}`);

      const result = await storage.upload(req.file.buffer, fileName, req.file.mimetype);

      console.log('Upload successful. URL:', result.url);

      res.json({
        success: true,
        url: result.url,
        tipo: req.file.mimetype
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  '/transparencia',
  authMiddleware,
  roleMiddleware('admin'),
  upload.single('imagen'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
      }

      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `transparencia/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      console.log(`Subiendo archivo a transparencia usando proveedor: ${storage.getProviderName()}`);

      const result = await storage.upload(req.file.buffer, fileName, req.file.mimetype, 'transparencia');

      console.log('Upload successful. URL:', result.url);

      res.json({
        success: true,
        url: result.url,
        tipo: req.file.mimetype
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;