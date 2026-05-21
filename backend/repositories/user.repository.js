const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

const userRepository = {
  async findById(id) {
    const result = await query(
      'SELECT id, nombre, email, contrasena, rol, es_voluntario, voluntario_activo, es_socio, email_verificado, created_at, updated_at FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await query(
      'SELECT id, nombre, email, rol, es_voluntario, voluntario_activo, es_socio, email_verificado FROM usuarios WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  async update(id, { nombre, email, contrasena, email_verificado }) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (nombre !== undefined) {
      fields.push(`nombre = $${paramIndex++}`);
      values.push(nombre);
    }
    if (email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (email_verificado !== undefined) {
      fields.push(`email_verificado = $${paramIndex++}`);
      values.push(email_verificado);
    }
    if (contrasena !== undefined) {
      const hashedPassword = await bcrypt.hash(contrasena, 10);
      fields.push(`contrasena = $${paramIndex++}`);
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE usuarios SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}
       RETURNING id, nombre, email, rol, es_voluntario, voluntario_activo, email_verificado, created_at, updated_at`,
      values
    );
    return result.rows[0];
  },

  async emailExists(email, excludeUserId) {
    const result = await query(
      'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
      [email, excludeUserId || '00000000-0000-0000-0000-000000000000']
    );
    return result.rows.length > 0;
  },

  async getAllUsuariosExceptoAdmin() {
    const result = await query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE rol = $1',
      ['usuario']
    );
    return result.rows;
  },

  async getByRol(rol) {
    const result = await query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE rol = $1',
      [rol]
    );
    return result.rows;
  },

  async getAll() {
    const result = await query(
      'SELECT id, nombre, email, rol, es_voluntario, voluntario_activo, es_socio FROM usuarios'
    );
    return result.rows;
  },

  async getById(id) {
    const result = await query(
      'SELECT id, nombre, email, rol, es_voluntario, voluntario_activo, es_socio FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async getAllAdmins() {
    const result = await query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE rol = $1',
      ['admin']
    );
    return result.rows;
  },

  async setVoluntarioActivo(id, activo) {
    const result = await query(
      `UPDATE usuarios SET es_voluntario = TRUE, voluntario_activo = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1
       RETURNING id, nombre, email, rol, es_voluntario, voluntario_activo`,
      [id, activo]
    );
    return result.rows[0];
  },

  async toggleVoluntarioActivo(id, activo) {
    const result = await query(
      `UPDATE usuarios SET voluntario_activo = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1
       RETURNING id, nombre, email, rol, es_voluntario, voluntario_activo`,
      [id, activo]
    );
    return result.rows[0];
  },

  async getVoluntarioByUsuarioId(usuarioId) {
    const result = await query(
      `SELECT u.id, u.nombre, u.email, u.es_voluntario, u.voluntario_activo,
              v.telefono, v.dni, v.disponibilidad_dias, v.disponibilidad_horario,
              v.tiene_vehiculo, v.motivacion, v.experiencia, v.comentarios, v.created_at
       FROM usuarios u
       LEFT JOIN voluntarios v ON v.usuario_id = u.id
       WHERE u.id = $1 AND u.es_voluntario = TRUE`,
      [usuarioId]
    );
    return result.rows[0];
  },

  async getAllVoluntarios() {
    const result = await query(
      `SELECT u.id as usuario_id, u.nombre, u.email, u.es_voluntario, u.voluntario_activo,
              v.telefono, v.dni, v.disponibilidad_dias, v.disponibilidad_horario,
              v.tiene_vehiculo, v.motivacion, v.experiencia, v.comentarios, v.created_at
       FROM usuarios u
       LEFT JOIN voluntarios v ON v.usuario_id = u.id
       WHERE u.es_voluntario = TRUE
       ORDER BY v.created_at DESC`
    );
    return result.rows;
  },

  async setEsSocio(id, esSocio) {
    const result = await query(
      `UPDATE usuarios SET es_socio = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1
       RETURNING id, nombre, email, rol, es_socio`,
      [id, esSocio]
    );
    return result.rows[0];
  }
};

module.exports = userRepository;