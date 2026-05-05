const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

const userRepository = {
  async findById(id) {
    const result = await query(
      'SELECT id, nombre, email, contrasena, rol, created_at, updated_at FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  async update(id, { nombre, email, contrasena }) {
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
       RETURNING id, nombre, email, rol, created_at, updated_at`,
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
      'SELECT id, nombre, email, rol FROM usuarios'
    );
    return result.rows;
  }
};

module.exports = userRepository;