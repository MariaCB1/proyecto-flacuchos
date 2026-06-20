const express = require('express');
const router = express.Router();

router.post('/ejecutar-cobros', async (req, res) => {
  const apiKey = req.query.key;

  if (!apiKey || apiKey !== process.env.CRON_SECRET_KEY) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const apadrinamientoService = require('../services/apadrinamiento.service');
    const resultados = await apadrinamientoService.ejecutarCobrosMensuales();
    res.json({ success: true, resultados });
  } catch (err) {
    console.error('Error en cron ejecutar-cobros:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
