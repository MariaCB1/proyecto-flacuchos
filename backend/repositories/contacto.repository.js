const db = require('../config/db');
const { query } = require('../config/db');

const contactoRepository = {
  async create({ nombre, email, telefono, mensaje, tipoConsulta }) {
    const query = `
      INSERT INTO mensajes_contacto (nombre, email, telefono, mensaje, tipo_consulta)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nombre, email, telefono, mensaje, tipo_consulta, created_at
    `;
    const values = [nombre, email, telefono, mensaje, tipoConsulta];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getAll() {
    const query = `
      SELECT id, nombre, email, telefono, mensaje, tipo_consulta, created_at
      FROM mensajes_contacto
      ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  },

  async getById(id) {
    const query = `
      SELECT id, nombre, email, telefono, mensaje, tipo_consulta, created_at
      FROM mensajes_contacto
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  async createSolicitudAcogida(data) {
    const query = `
      INSERT INTO solicitud_casa_acogida (
        nombre_completo, dni, telefono,
        tipo_vivienda, otra_vivienda, vivienda_propia, permiso_alquiler,
        tiene_exterior, exterior_descripcion,
        otras_personas, num_personas, todos_de_acuerdo,
        hay_ninos, edad_ninos,
        tiene_otros_animales, tipo_otros_animales, vaccinated_otros,
        tiempo_acogida, horas_solo,
        tipo_animal,
        experiencia_previa, experiencia_detalles,
        motivo_acogida, comentarios,
        usuario_id, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING *
    `;
    const values = [
      data.nombre_completo, data.dni, data.telefono,
      data.tipo_vivienda, data.otra_vivienda, data.vivienda_propia, data.permiso_alquiler,
      data.tiene_exterior, data.exterior_descripcion,
      data.otras_personas, data.num_personas, data.todos_de_acuerdo,
      data.hay_ninos, data.edad_ninos,
      data.tiene_otros_animales, data.tipo_otros_animales, data.vaccinated_otros,
      data.tiempo_acogida, data.horas_solo,
      data.tipo_animal,
      data.experiencia_previa, data.experiencia_detalles,
      data.motivo_acogida, data.comentarios,
      data.usuario_id || null,
      'pending'
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getSolicitudesAcogida(filtros = {}) {
    let sql = `
      SELECT sca.*, 
             a.nombre as animal_nombre, 
             a.imagen_url as animal_imagen,
             a.especie as animal_especie,
             a.edad as animal_edad,
             a.tamano as animal_tamano,
             u.email as email
      FROM solicitud_casa_acogida sca
      LEFT JOIN animales a ON sca.animal_asignado_id = a.id
      LEFT JOIN usuarios u ON sca.usuario_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (filtros.estado) {
      sql += ` AND sca.estado = $${paramIndex++}`;
      values.push(filtros.estado);
    }

    if (filtros.usuario_id) {
      sql += ` AND sca.usuario_id = $${paramIndex++}`;
      values.push(filtros.usuario_id);
    }

    sql += ` ORDER BY sca.created_at DESC`;

    const result = await query(sql, values);
    return result.rows;
  },

  async getSolicitudAcogidaById(id) {
    const result = await query(
      `SELECT sca.*, 
              a.nombre as animal_nombre, 
              a.imagen_url as animal_imagen,
              a.especie as animal_especie,
              u.email as email
       FROM solicitud_casa_acogida sca
       LEFT JOIN animales a ON sca.animal_asignado_id = a.id
       LEFT JOIN usuarios u ON sca.usuario_id = u.id
       WHERE sca.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async updateEstadoAcogida(id, estado, motivo = null) {
    const result = await query(
      `UPDATE solicitud_casa_acogida 
       SET estado = $1, motivo_rechazo = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
      [estado, motivo, id]
    );
    return result.rows[0];
  },

  async asignarAnimalAcogida(solicitudId, animalId) {
    const result = await query(
      `UPDATE solicitud_casa_acogida 
       SET animal_asignado_id = $1, estado = 'asignado_pendiente', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [animalId, solicitudId]
    );

    await query(
      `UPDATE animales SET en_acogida = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [animalId]
    );

    return result.rows[0];
  },

  async getAnimalesDisponibles() {
    const result = await query(
      `SELECT * FROM animales 
       WHERE estado = 'disponible' AND (en_acogida = false OR en_acogida IS NULL)
       ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async getMisAcogidas(usuarioId) {
    const result = await query(
      `SELECT sca.*, 
              a.nombre as animal_nombre, 
              a.imagen_url as animal_imagen,
              a.especie as animal_especie,
              a.edad as animal_edad,
              a.tamano as animal_tamano,
              a.caracter as animal_caracter
       FROM solicitud_casa_acogida sca
       LEFT JOIN animales a ON sca.animal_asignado_id = a.id
       WHERE sca.usuario_id = $1
       ORDER BY sca.created_at DESC`,
      [usuarioId]
    );
    return result.rows;
  },

  async eliminarSolicitudAcogida(id, usuarioId) {
    const result = await query(
      `DELETE FROM solicitud_casa_acogida 
       WHERE id = $1 AND usuario_id = $2 AND estado = 'pending'
       RETURNING *`,
      [id, usuarioId]
    );
    return result.rows[0];
  },

  async getAcogidaActivaPorAnimal(animalId) {
    const result = await query(
      `SELECT * FROM solicitud_casa_acogida 
       WHERE animal_asignado_id = $1 
       AND estado IN ('asignado_pendiente', 'aceptado')
       LIMIT 1`,
      [animalId]
    );
    return result.rows[0];
  },

  async getAcogidasActivasPorAnimal(animalId) {
    const result = await query(
      `SELECT sca.*, u.nombre as usuario_nombre, u.email as usuario_email
       FROM solicitud_casa_acogida sca
       LEFT JOIN usuarios u ON sca.usuario_id = u.id
       WHERE sca.animal_asignado_id = $1 
       AND sca.estado IN ('asignado_pendiente', 'aceptado')`,
      [animalId]
    );
    return result.rows;
  }
};

module.exports = contactoRepository;