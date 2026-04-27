const userRepository = require('../repositories/user.repository');

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

  async updatePerfil(usuarioId, datos) {
    const { nombre, email, contrasena } = datos;

    if (email) {
      const emailExistente = await userRepository.emailExists(email, usuarioId);
      if (emailExistente) {
        const error = new Error('El email ya está en uso');
        error.status = 400;
        throw error;
      }
    }

    const updates = {};
    if (nombre !== undefined) updates.nombre = nombre;
    if (email !== undefined) updates.email = email;
    if (contrasena !== undefined) updates.contrasena = contrasena;

    const usuario = await userRepository.update(usuarioId, updates);
    return usuario;
  },

  async validarEmail(email, excludeUserId) {
    return userRepository.emailExists(email, excludeUserId);
  }
};

module.exports = userService;