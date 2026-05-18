const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');

let socioController;
try {
  socioController = require('../controllers/socio.controller');
} catch (e) {
  console.error('[socio.routes] Failed to load socioController:', e.message);
}

const fallback = (req, res) => res.status(500).json({ error: 'Controller not loaded' });

const getMiSocio = socioController?.getMiSocio || fallback;
const listarSocios = socioController?.listarSocios || fallback;
const cancelarMiSocio = socioController?.cancelarMiSocio || fallback;
const getSociosConStats = socioController?.getSociosConStats || fallback;
const checkFueSocioEsteMes = socioController?.checkFueSocioEsteMes || fallback;
const getMiTotalHistorico = socioController?.getMiTotalHistorico || fallback;

const authenticate = authMiddleware.authenticate || authMiddleware;
const requireAdmin = (req, res, next) => roleMiddleware('admin')(req, res, next);

router.get('/mis-socio', authenticate, getMiSocio);
router.delete('/mi-socio', authenticate, cancelarMiSocio);
router.get('/check-fue-socio', authenticate, checkFueSocioEsteMes);
router.get('/total-historico', authenticate, getMiTotalHistorico);

router.get('/', authenticate, requireAdmin, listarSocios);
router.get('/stats', authenticate, requireAdmin, getSociosConStats);

module.exports = router;