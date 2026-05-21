const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/registro', authController.handleRegistro);
router.post('/login', authController.handleLogin);
router.post('/logout', authController.handleLogout);
router.get('/verify', authMiddleware, authController.handleVerify);
router.post('/recuperar-solicitud', authController.handleRecuperarSolicitud);
router.post('/recuperar-restablecer', authController.handleRecuperarRestablecer);
router.post('/verificar', authController.handleVerificarEmail);
router.post('/reenviar-verificacion', authController.handleReenviarVerificacion);
router.get('/verificado', authMiddleware, authController.handleGetEstadoVerificacion);
router.post('/reenviar-publico', authController.handleReenviarPublico);

module.exports = router;