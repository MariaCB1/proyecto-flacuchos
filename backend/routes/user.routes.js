const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/perfil', authMiddleware, userController.handleGetPerfil);
router.put('/perfil', authMiddleware, userController.handleUpdatePerfil);
router.post('/cambiar-contrasena', authMiddleware, userController.handleCambiarContrasena);

module.exports = router;