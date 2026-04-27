const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/registro', authController.handleRegistro);
router.post('/login', authController.handleLogin);
router.post('/logout', authController.handleLogout);
router.get('/verify', authMiddleware, authController.handleVerify);

module.exports = router;