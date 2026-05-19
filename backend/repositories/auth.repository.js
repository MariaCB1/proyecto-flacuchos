const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../config/db');

const authRepository = {
  async findByEmail(email) {
    const result = await query(
      'SELECT id, nombre, email, contrasena, rol, es_voluntario, voluntario_activo, es_socio, created_at, updated_at FROM usuarios WHERE email = $1',
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
      'SELECT id, nombre, email, contrasena, rol, es_voluntario, voluntario_activo, es_socio, created_at, updated_at FROM usuarios WHERE id = $1',
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
  },

  async generarTokenRecuperacion(email) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = new Date(Date.now() + 15 * 60 * 1000);
    const result = await query(
      `UPDATE usuarios SET token_recuperacion = $1, token_expiracion = $2 WHERE email = $3
       RETURNING id, nombre, email`,
      [token, expiracion, email]
    );
    return { token, usuario: result.rows[0] };
  },

  async findByToken(token) {
    const result = await query(
      `SELECT id, nombre, email FROM usuarios 
       WHERE token_recuperacion = $1 AND token_expiracion > NOW()`,
      [token]
    );
    return result.rows[0];
  },

  async actualizarContrasena(id, contrasena) {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const result = await query(
      `UPDATE usuarios SET contrasena = $1, token_recuperacion = NULL, token_expiracion = NULL 
       WHERE id = $2
       RETURNING id, nombre, email, rol`,
      [hashedPassword, id]
    );
    return result.rows[0];
  },

  async clearToken(email) {
    await query(
      `UPDATE usuarios SET token_recuperacion = NULL, token_expiracion = NULL WHERE email = $1`,
      [email]
    );
  }
};

module.exports = authRepository;