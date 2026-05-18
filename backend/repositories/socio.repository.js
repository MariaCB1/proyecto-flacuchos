const { query } = require('../config/db');

const socioRepository = {
  async crearSocio(datos) {
    const result = await query(
      `INSERT INTO socios (
        usuario_id, stripe_subscription_id, stripe_customer_id, stripe_price_id,
        nombre_apellidos, dni_nie, telefono,
        direccion, codigo_postal, ciudad_provincia, aportacion,
        metodo_pago, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'active')
      RETURNING *`,
      [
        datos.usuario_id,
        datos.stripe_subscription_id || '',
        datos.stripe_customer_id || '',
        datos.stripe_price_id || '',
        datos.nombre_apellidos,
        datos.dni_nie,
        datos.telefono,
        datos.direccion,
        datos.codigo_postal,
        datos.ciudad_provincia,
        datos.aportacion,
        datos.metodo_pago || 'tarjeta'
      ]
    );
    return result.rows[0];
  },

  async getAllSocios() {
    const result = await query(
      `SELECT s.*, u.nombre as nombre_usuario, u.email as email_usuario
       FROM socios s
       LEFT JOIN usuarios u ON s.usuario_id = u.id
       ORDER BY s.started_at DESC`
    );
    return result.rows;
  },

  async getSocioByUsuarioId(usuarioId) {
    const result = await query(
      `SELECT s.*, u.email as email_usuario
       FROM socios s
       LEFT JOIN usuarios u ON s.usuario_id = u.id
       WHERE usuario_id = $1 AND estado IN ('active', 'pending')`,
      [usuarioId]
    );
    return result.rows[0];
  },

  async cancelarSocio(usuarioId) {
    const result = await query(
      `UPDATE socios 
       SET estado = 'canceled', canceled_at = CURRENT_TIMESTAMP
       WHERE usuario_id = $1 AND estado = 'active'
       RETURNING *`,
      [usuarioId]
    );
    return result.rows[0];
  },

  async getSocioByUsuarioIdAnyStatus(usuarioId) {
    const result = await query(
      `SELECT * FROM socios WHERE usuario_id = $1 ORDER BY started_at DESC LIMIT 1`,
      [usuarioId]
    );
    return result.rows[0];
  },

  async deleteSociosCancelados(usuarioId) {
    await query(
      `DELETE FROM socios WHERE usuario_id = $1 AND estado = 'canceled'`,
      [usuarioId]
    );
  },

  async fueSocioEsteMes(usuarioId) {
    const result = await query(
      `SELECT id, aportacion, started_at, estado
       FROM socios
       WHERE usuario_id = $1
       AND (
         (estado = 'active') OR
         (estado = 'canceled' AND DATE_TRUNC('month', canceled_at) = DATE_TRUNC('month', CURRENT_DATE))
       )
       ORDER BY started_at DESC
       LIMIT 1`,
      [usuarioId]
    );
    return result.rows[0] || null;
  },

  async getTotalHistorico(usuarioId) {
    const result = await query(
      `SELECT COALESCE(SUM(aportacion), 0) as total
       FROM socios
       WHERE usuario_id = $1`,
      [usuarioId]
    );
    return parseFloat(result.rows[0]?.total || 0);
  },

  async getAllSociosConStats() {
    const result = await query(
      `SELECT s.*, u.nombre as nombre_usuario, u.email as email_usuario
       FROM socios s
       LEFT JOIN usuarios u ON s.usuario_id = u.id
       ORDER BY s.started_at DESC`
    );
    const rows = result.rows;

    const activos = rows.filter(r => r.estado === 'active');
    const cancelados = rows.filter(r => r.estado === 'canceled');
    const pendientes = rows.filter(r => r.estado === 'pending');
    const totalAportacion = rows.reduce((sum, r) => sum + parseFloat(r.aportacion || 0), 0);
    const aportacionActivos = activos.reduce((sum, r) => sum + parseFloat(r.aportacion || 0), 0);

    return {
      socios: rows,
      stats: {
        total: rows.length,
        activos: activos.length,
        cancelados: cancelados.length,
        pendientes: pendientes.length,
        ingresosHistoricos: totalAportacion,
        ingresosMensuales: aportacionActivos
      }
    };
  }
};

module.exports = socioRepository;