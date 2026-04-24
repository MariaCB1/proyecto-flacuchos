const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');

const authService = {
  async registro({ nombre, email, contrasena }) {
    const existeUsuario = await authRepository.findByEmail(email);
    if (existeUsuario) {
      const error = new Error('El email ya está registrado');
      error.status = 400;
      throw error;
    }

    const usuario = await authRepository.create({ nombre, email, contrasena });

    const token = this.generateToken(usuario);

    return {
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  },

  async login({ email, contrasena }) {
    const usuario = await authRepository.findByEmail(email);
    if (!usuario) {
      const error = new Error('Email o contraseña incorrectos');
      error.status = 401;
      throw error;
    }

    const esValida = await authRepository.comparePassword(contrasena, usuario.contrasena);
    if (!esValida) {
      const error = new Error('Email o contraseña incorrectos');
      error.status = 401;
      throw error;
    }

    const token = this.generateToken(usuario);

    return {
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  },

  generateToken(usuario) {
    return jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  },

  async verificarToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const usuario = await authRepository.findById(decoded.id);
      if (!usuario) {
        const error = new Error('Usuario no encontrado');
        error.status = 401;
        throw error;
      }
      return usuario;
    } catch (error) {
      const err = new Error('Token inválido');
      err.status = 401;
      throw err;
    }
  },
};

module.exports = authService;