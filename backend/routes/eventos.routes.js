const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventos.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.get('/', eventosController.getEventos);
router.get('/:id', eventosController.getEventoById);
router.post('/', authMiddleware, roleMiddleware('admin'), eventosController.createEvento);
router.put('/:id', authMiddleware, roleMiddleware('admin'), eventosController.updateEvento);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), eventosController.deleteEvento);

module.exports = router;