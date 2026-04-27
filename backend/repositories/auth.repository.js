const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

const authRepository = {
  async findByEmail(email) {
    const result = await query(
      'SELECT id, nombre, email, contrasena, rol, created_at, updated_at FROM usuarios WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  async create({ nombre, email, contrasena }) {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const result = await query(
      `INSERT INTO usuarios (nombre, email, contrasena, rol)
       VALUES ($1, $2, $3, 'usuario')
       RETURNING id, nombre, email, rol, created_at, updated_at`,
      [nombre, email, hashedPassword]
    );
    return result.rows[0];
  },

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  async findById(id) {
    const result = await query(
      'SELECT id, nombre, email, rol, created_at, updated_at FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async update(id, { nombre, email, contrasena }) {
    let updates = [];
    let values = [];
    let paramIndex = 1;

    if (nombre) {
      updates.push(`nombre = $${paramIndex++}`);
      values.push(nombre);
    }
    if (email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (contrasena) {
      const hashedPassword = await bcrypt.hash(contrasena, 10);
      updates.push(`contrasena = $${paramIndex++}`);
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, nombre, email, rol, created_at, updated_at`,
      values
    );
    return result.rows[0];
  }
};

module.exports = authRepository;