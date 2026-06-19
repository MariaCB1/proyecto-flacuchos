const express = require('express');
const router = express.Router();
const transparenciaController = require('../controllers/transparencia.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');

router.get('/documentos', transparenciaController.getDocumentos);
router.put('/documentos/:tipo', authMiddleware, roleMiddleware('admin'), transparenciaController.updateDocumento);

router.get('/justificantes', transparenciaController.getJustificantes);
router.get('/justificantes/anios', transparenciaController.getAñosJustificantes);
router.post('/justificantes', authMiddleware, roleMiddleware('admin'), transparenciaController.createJustificante);
router.put('/justificantes/:id', authMiddleware, roleMiddleware('admin'), transparenciaController.updateJustificante);
router.delete('/justificantes/:id', authMiddleware, roleMiddleware('admin'), transparenciaController.deleteJustificante);

module.exports = router;