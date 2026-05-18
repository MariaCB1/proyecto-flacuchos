const express = require('express');
const router = express.Router();
const voluntarioController = require('../controllers/voluntario.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');

router.post('/', authMiddleware, voluntarioController.crearSolicitud);
router.get('/mis-datos', authMiddleware, voluntarioController.getMisDatos);
router.put('/mi-estado', authMiddleware, voluntarioController.handleMiEstado);
router.get('/', authMiddleware, roleMiddleware('admin'), voluntarioController.getAll);
router.put('/:usuarioId/toggle', authMiddleware, roleMiddleware('admin'), voluntarioController.toggleActivo);
router.put('/', authMiddleware, voluntarioController.actualizarVoluntario);

module.exports = router;