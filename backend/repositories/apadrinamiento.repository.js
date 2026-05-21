const { query } = require('../config/db');

const apadrinamientoRepository = {
  async getAnimalesDisponibles(usuarioId = null) {
    let excludeCondition = "1=1";
    if (usuarioId) {
      excludeCondition += ` AND a.id NOT IN (SELECT animal_id FROM apadrinamientos WHERE usuario_id = '${usuarioId}' AND estado = 'active')`;
      excludeCondition += ` AND a.id NOT IN (SELECT animal_id FROM apadrinamientos WHERE usuario_id = '${usuarioId}' AND estado = 'pending')`;
    }
    const result = await query(
      `SELECT a.*,
              COALESCE(
                (SELECT json_agg(json_build_object('nombre', u.nombre, 'mostrar', ap.mostrar_publico))
                 FROM usuarios u
                 JOIN apadrinamientos ap ON u.id = ap.usuario_id
                 WHERE ap.animal_id = a.id AND ap.estado = 'active'),
                '[]'::json
              ) as padrinos
       FROM animales a
       WHERE a.estado != 'adoptado'
       AND ${excludeCondition}
       ORDER BY a.nombre ASC`
    );
    return result.rows;
  },

  async getAnimalesConPadrino() {
    const result = await query(
      `SELECT a.*, 
              COALESCE(
                (SELECT json_agg(
                  json_build_object(
                    'nombre', u.nombre,
                    'mostrar', ap.mostrar_publico,
                    'importe', ap.importe,
                    'apadrinamiento_id', ap.id,
                    'estado', ap.estado
                  )
                )
                FROM usuarios u
                JOIN apadrinamientos ap ON u.id = ap.usuario_id
                WHERE ap.animal_id = a.id AND ap.estado = 'active'),
                '[]'::json
              ) as padrinos
       FROM animales a
       WHERE a.estado != 'adoptado'
       AND a.id IN (SELECT animal_id FROM apadrinamientos WHERE estado = 'active')
       ORDER BY a.nombre ASC`
    );
    return result.rows;
  },

  async getMiApadrinamiento(usuarioId) {
    const result = await query(
      `SELECT ap.*, a.nombre as animal_nombre, a.imagen_url as animal_imagen, a.especie as animal_especie, u.nombre as usuario_nombre
       FROM apadrinamientos ap
       LEFT JOIN animales a ON ap.animal_id = a.id
       LEFT JOIN usuarios u ON ap.usuario_id = u.id
       WHERE ap.usuario_id = $1
       ORDER BY ap.created_at DESC`,
      [usuarioId]
    );
    return result.rows;
  },

  async getAll() {
    const result = await query(
      `SELECT ap.*, 
              a.nombre as animal_nombre, 
              a.imagen_url as animal_imagen,
              u.nombre as usuario_nombre, 
              u.email as usuario_email
       FROM apadrinamientos ap
       LEFT JOIN animales a ON ap.animal_id = a.id
       LEFT JOIN usuarios u ON ap.usuario_id = u.id
       ORDER BY ap.created_at DESC`
    );
    return result.rows;
  },

  async getAllConStats() {
    const result = await query(
      `SELECT ap.*, 
              a.nombre as animal_nombre, 
              a.imagen_url as animal_imagen,
              u.nombre as usuario_nombre, 
              u.email as usuario_email
       FROM apadrinamientos ap
       LEFT JOIN animales a ON ap.animal_id = a.id
       LEFT JOIN usuarios u ON ap.usuario_id = u.id
       ORDER BY ap.created_at DESC`
    );
    const rows = result.rows;
    const activos = rows.filter(r => r.estado === 'active');
    const pendientes = rows.filter(r => r.estado === 'pending');
    const rechazados = rows.filter(r => r.estado === 'rejected');
    const cancelados = rows.filter(r => r.estado === 'canceled');
    const ingresosActivos = activos.reduce((sum, r) => sum + parseFloat(r.importe || 0), 0);
    return {
      apadrinamientos: rows,
      stats: {
        total: rows.length,
        activos: activos.length,
        pendientes: pendientes.length,
        rechazados: rechazados.length,
        cancelados: cancelados.length,
        ingresosMensuales: ingresosActivos
      }
    };
  },

  async getById(id) {
    const result = await query(
      `SELECT ap.*, 
              a.nombre as animal_nombre, 
              a.imagen_url as animal_imagen,
              u.nombre as usuario_nombre, 
              u.email as usuario_email
       FROM apadrinamientos ap
       LEFT JOIN animales a ON ap.animal_id = a.id
       LEFT JOIN usuarios u ON ap.usuario_id = u.id
       WHERE ap.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async crear(datos) {
    const result = await query(
      `INSERT INTO apadrinamientos (
        usuario_id, animal_id, stripe_payment_id, stripe_customer_id, 
        stripe_payment_method_id, importe, dni_nie, telefono, mostrar_publico, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
       RETURNING *`,
      [
        datos.usuario_id,
        datos.animal_id,
        datos.stripe_payment_id || null,
        datos.stripe_customer_id || null,
        datos.stripe_payment_method_id || null,
        datos.importe,
        datos.dni_nie || null,
        datos.telefono || null,
        datos.mostrar_publico || false
      ]
    );
    return result.rows[0];
  },

  async actualizarEstado(id, estado, motivo = null) {
    const result = await query(
      `UPDATE apadrinamientos 
       SET estado = $1, updated_at = CURRENT_TIMESTAMP, canceled_at = CASE WHEN $1 = 'canceled' THEN CURRENT_TIMESTAMP ELSE canceled_at END
       WHERE id = $2
       RETURNING *`,
      [estado, id]
    );
    return result.rows[0];
  },

  async getActivos() {
    const result = await query(
      `SELECT ap.*, u.email as usuario_email
       FROM apadrinamientos ap
       JOIN usuarios u ON ap.usuario_id = u.id
       WHERE ap.estado = 'active'
       AND ap.stripe_customer_id IS NOT NULL
       AND ap.stripe_payment_method_id IS NOT NULL`
    );
    return result.rows;
  },

  async getByAnimalId(animalId) {
    const result = await query(
      `SELECT ap.*, u.nombre as usuario_nombre, u.email as usuario_email
       FROM apadrinamientos ap
       LEFT JOIN usuarios u ON ap.usuario_id = u.id
       WHERE ap.animal_id = $1 AND ap.estado = 'active'`,
      [animalId]
    );
    return result.rows[0];
  },

  async getByAnimalIdMultiple(animalId) {
    const result = await query(
      `SELECT ap.*, u.nombre as usuario_nombre, u.email as usuario_email
       FROM apadrinamientos ap
       LEFT JOIN usuarios u ON ap.usuario_id = u.id
       WHERE ap.animal_id = $1 AND ap.estado = 'active'`,
      [animalId]
    );
    return result.rows;
  },

  async delete(id, usuarioId) {
    const result = await query(
      `DELETE FROM apadrinamientos 
       WHERE id = $1 AND usuario_id = $2 AND estado = 'pending'
       RETURNING *`,
      [id, usuarioId]
    );
    return result.rows[0];
  },

  async checkTuvoApadrinamientoCancelado(usuarioId) {
    const result = await query(
      `SELECT COUNT(*) as count FROM apadrinamientos 
       WHERE usuario_id = $1 AND estado = 'canceled'`,
      [usuarioId]
    );
    return parseInt(result.rows[0].count) > 0;
  }
};

module.exports = apadrinamientoRepository;