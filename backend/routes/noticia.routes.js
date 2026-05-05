const express = require('express');
const router = express.Router();
const noticiaController = require('../controllers/noticia.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.get('/noticias', noticiaController.getNoticias);
router.get('/noticias/:id', noticiaController.getNoticiaById);

router.post(
  '/noticias',
  authMiddleware,
  roleMiddleware('admin'),
  noticiaController.createNoticia
);

router.put(
  '/noticias/:id',
  authMiddleware,
  roleMiddleware('admin'),
  noticiaController.updateNoticia
);

router.delete(
  '/noticias/:id',
  authMiddleware,
  roleMiddleware('admin'),
  noticiaController.deleteNoticia
);

module.exports = router;