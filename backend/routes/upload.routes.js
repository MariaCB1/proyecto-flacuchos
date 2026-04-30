const express = require('express');
const multer = require('multer');
const storage = require('../config/storage');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
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
        return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
      }

      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      console.log(`Subiendo imagen usando proveedor: ${storage.getProviderName()}`);
      
      const result = await storage.upload(req.file.buffer, fileName, req.file.mimetype);

      console.log('Upload successful. URL:', result.url);

      res.json({ 
        success: true, 
        url: result.url 
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;