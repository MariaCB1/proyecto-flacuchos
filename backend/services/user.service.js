const userRepository = require('../repositories/user.repository');
const authService = require('./auth.service');

const userService = {
  async getPerfil(usuarioId) {
    const usuario = await userRepository.findById(usuarioId);
    if (!usuario) {
      const error = new Error('Usuario no encontrado');
      error.status = 404;
      throw error;
    }
    return usuario;
  },

  async getAdmins() {
    return await userRepository.getByRol('admin');
  },

  async updatePerfil(usuarioId, datos) {
    const { nombre, email, contrasena } = datos;

    const usuarioActual = await userRepository.findById(usuarioId);
    let emailCambiado = false;

    if (email && email !== usuarioActual.email) {
      const emailExistente = await userRepository.emailExists(email, usuarioId);
      if (emailExistente) {
        const error = new Error('El email ya está en uso');
        error.status = 400;
        throw error;
      }
      emailCambiado = true;
    }

    const updates = {};
    if (nombre !== undefined) updates.nombre = nombre;
    if (email !== undefined) {
      updates.email = email;
      updates.email_verificado = false;
    }
    if (contrasena !== undefined) updates.contrasena = contrasena;

    const usuario = await userRepository.update(usuarioId, updates);

    if (emailCambiado) {
      const { token } = await require('../repositories/auth.repository').generarTokenVerificacion(email);
      await authService.enviarEmailVerificacion(email, usuario.nombre, token);
    }

    return {
      ...usuario,
      email_verificado: false
    };
  },

  async validarEmail(email, excludeUserId) {
    return userRepository.emailExists(email, excludeUserId);
  },

  async cambiarContrasena(usuarioId, contrasenaActual, nuevaContrasena) {
    const usuario = await userRepository.findById(usuarioId);
    if (!usuario) {
      const error = new Error('Usuario no encontrado');
      error.status = 404;
      throw error;
    }

    const authRepository = require('../repositories/auth.repository');
    const esValida = await authRepository.comparePassword(contrasenaActual, usuario.contrasena);
    if (!esValida) {
      const error = new Error('La contraseña actual es incorrecta');
      error.status = 400;
      throw error;
    }

    await userRepository.update(usuarioId, { contrasena: nuevaContrasena });
  },

  async setEsSocio(usuarioId, esSocio) {
    return await userRepository.setEsSocio(usuarioId, esSocio);
  },

  async getUsuarioById(usuarioId) {
    return await userRepository.findById(usuarioId);
  }
};

module.exports = userService;