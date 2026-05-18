const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/resumen-ayudas', async (req, res) => {
  try {
    const { periodo = 'ano' } = req.query;
    
    let fechaInicio;
    const ahora = new Date();
    
    if (periodo === 'mes') {
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    } else if (periodo === 'tres_meses') {
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth() - 3, 1);
    } else if (periodo === 'seis_meses') {
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth() - 6, 1);
    } else if (periodo === 'ano') {
      fechaInicio = new Date(ahora.getFullYear(), 0, 1);
    } else {
      fechaInicio = new Date(2000, 0, 1);
    }

    const fechaInicioStr = fechaInicio.toISOString().split('T')[0];

    // Total donations completadas
    const donationsResult = await db.query(
      `SELECT COALESCE(SUM(monto), 0) as total, COUNT(*) as cantidad
       FROM donaciones
       WHERE estado = 'completada' AND created_at >= $1`,
      [fechaInicioStr]
    );

    // Total socios activos (aportación mensual)
    const sociosResult = await db.query(
      `SELECT COALESCE(SUM(aportacion), 0) as total
       FROM socios
       WHERE estado = 'active'`
    );

    // Total apadrinamientos activos
    const apadrinamientosResult = await db.query(
      `SELECT COALESCE(SUM(importe), 0) as total
       FROM apadrinamientos
       WHERE estado = 'active'`
    );

    // Ingresos históricos totales
    const historicoResult = await db.query(`
      SELECT 
        (SELECT COALESCE(SUM(monto), 0) FROM donaciones WHERE estado = 'completada') as total_donaciones,
        (SELECT COALESCE(SUM(aportacion), 0) FROM socios WHERE estado = 'active') as total_socios_mensual,
        (SELECT COALESCE(SUM(importe), 0) FROM apadrinamientos WHERE estado = 'active') as total_apadr_mensual
    `);

    // Datos para gráfico por meses (últimos 12 meses)
    const ultimos12Meses = [];
    for (let i = 11; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mes = fecha.toLocaleString('es-ES', { month: 'short' });
      const year = fecha.getFullYear();
      const fechaInicioMes = fecha.toISOString().split('T')[0];
      const fechaFinMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).toISOString().split('T')[0];

      // Donaciones del mes
      const donMes = await db.query(
        `SELECT COALESCE(SUM(monto), 0) as total FROM donaciones 
         WHERE estado = 'completada' AND created_at >= $1 AND created_at <= $2`,
        [fechaInicioMes, fechaFinMes]
      );

      ultimos12Meses.push({
        mes: mes.charAt(0).toUpperCase() + mes.slice(1),
        donaciones: parseFloat(donMes.rows[0].total) || 0,
        socios: 0,
        apadrinamientos: 0
      });
    }

    // Calcular ingresos mensuales de socios y apadrinamientos (para el mes actual)
    const socioMensual = parseFloat(sociosResult.rows[0].total) || 0;
    const apadrMensual = parseFloat(apadrinamientosResult.rows[0].total) || 0;

    // Actualizar el último mes con los valores mensuales
    if (ultimos12Meses.length > 0) {
      ultimos12Meses[ultimos12Meses.length - 1].socios = socioMensual;
      ultimos12Meses[ultimos12Meses.length - 1].apadrinamientos = apadrMensual;
    }

    // Calcular ingresos del período (aproximado para socios y apadrinamientos)
    const mesesPeriodo = periodo === 'mes' ? 1 : periodo === 'tres_meses' ? 3 : periodo === 'seis_meses' ? 6 : 12;
    
    res.json({
      periodo: periodo,
      ingresosPeriodo: {
        donaciones: parseFloat(donationsResult.rows[0].total) || 0,
        socios: socioMensual * mesesPeriodo,
        apadrinamientos: apadrMensual * mesesPeriodo,
        total: (parseFloat(donationsResult.rows[0].total) || 0) + (socioMensual * mesesPeriodo) + (apadrMensual * mesesPeriodo)
      },
      ingresosMesActual: {
        donaciones: parseFloat(donationsResult.rows[0].total) || 0,
        socios: socioMensual,
        apadrinamientos: apadrMensual,
        total: (parseFloat(donationsResult.rows[0].total) || 0) + socioMensual + apadrMensual
      },
      ingresosHistoricos: {
        donaciones: parseFloat(historicoResult.rows[0].total_donaciones) || 0,
        sociosActivos: socioMensual,
        apadrinamientosActivos: apadrMensual
      },
      grafico: ultimos12Meses
    });
  } catch (error) {
    console.error('Error fetching resumen ayudas:', error);
    res.status(500).json({ error: 'Error al obtener el resumen de ayudas' });
  }
});

module.exports = router;