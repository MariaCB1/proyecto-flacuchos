const { query } = require('../config/db');

const cobroRepository = {
  async registrarCobro(datos) {
    const result = await query(
      `INSERT INTO cobros_apadrinamiento (
        apadrinamiento_id, stripe_payment_id, monto, estado
      ) VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        datos.apadrinamiento_id,
        datos.stripe_payment_id || null,
        datos.monto,
        datos.estado || 'pending'
      ]
    );
    return result.rows[0];
  },

  async getAll() {
    const result = await query(
      `SELECT c.*, 
              a.animal_id,
              an.nombre as animal_nombre,
              u.nombre as usuario_nombre,
              u.email as usuario_email
       FROM cobros_apadrinamiento c
       JOIN apadrinamientos a ON c.apadrinamiento_id = a.id
       LEFT JOIN animales an ON a.animal_id = an.id
       LEFT JOIN usuarios u ON a.usuario_id = u.id
       ORDER BY c.fecha_cobro DESC`
    );
    return result.rows;
  },

  async getStats() {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'completada' THEN monto ELSE 0 END) as total_cobrado,
        SUM(CASE WHEN estado = 'pending' THEN monto ELSE 0 END) as total_pendiente,
        SUM(CASE WHEN estado = 'fallida' THEN monto ELSE 0 END) as total_fallido
       FROM cobros_apadrinamiento`
    );
    return result.rows[0];
  }
};

module.exports = cobroRepository;