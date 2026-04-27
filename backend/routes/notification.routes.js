const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, notificationController.handleGetNotificaciones);
router.get('/no-leidas', authMiddleware, notificationController.handleGetNoLeidas);
router.put('/:id/leer', authMiddleware, notificationController.handleMarcarLeida);

module.exports = router;