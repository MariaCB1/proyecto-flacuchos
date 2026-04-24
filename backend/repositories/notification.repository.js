const { query } = require('../config/db');

const notificationRepository = {
  async findByUserId(usuarioId) {
    const result = await query(
      `SELECT id, usuario_id, tipo, mensaje, referencia_id, leido, created_at
       FROM notificaciones
       WHERE usuario_id = $1
       ORDER BY created_at DESC`,
      [usuarioId]
    );
    return result.rows;
  },

  async findUnreadByUserId(usuarioId) {
    const result = await query(
      `SELECT id, usuario_id, tipo, mensaje, referencia_id, leido, created_at
       FROM notificaciones
       WHERE usuario_id = $1 AND leido = false
       ORDER BY created_at DESC`,
      [usuarioId]
    );
    return result.rows;
  },

  async countUnread(usuarioId) {
    const result = await query(
      'SELECT COUNT(*) as count FROM notificaciones WHERE usuario_id = $1 AND leido = false',
      [usuarioId]
    );
    return parseInt(result.rows[0].count, 10);
  },

  async markAsRead(id, usuarioId) {
    const result = await query(
      `UPDATE notificaciones
       SET leido = true
       WHERE id = $1 AND usuario_id = $2
       RETURNING id, usuario_id, tipo, mensaje, referencia_id, leido, created_at`,
      [id, usuarioId]
    );
    return result.rows[0];
  },

  async create({ usuarioId, tipo, mensaje, referenciaId }) {
    const result = await query(
      `INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, usuario_id, tipo, mensaje, referencia_id, leido, created_at`,
      [usuarioId, tipo, mensaje, referenciaId]
    );
    return result.rows[0];
  }
};

module.exports = notificationRepository;