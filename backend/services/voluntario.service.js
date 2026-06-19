const userRepository = require('../repositories/user.repository');
const voluntarioRepository = require('../repositories/voluntario.repository');
const notificationRepository = require('../repositories/notification.repository');
const emailService = require('./email.service');

const voluntarioService = {
  async crearVoluntario(data) {
    const { usuario_id, telefono, dni, disponibilidad_dias, disponibilidad_horario, tiene_vehiculo, motivacion, experiencia, comentarios } = data;

    const existe = await userRepository.getVoluntarioByUsuarioId(usuario_id);
    if (existe) {
      throw new Error('Ya estás registrado como voluntario');
    }

    const user = await userRepository.findById(usuario_id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const voluntariosData = {
      usuario_id,
      telefono,
      dni,
      disponibilidad_dias,
      disponibilidad_horario,
      tiene_vehiculo,
      motivacion,
      experiencia,
      comentarios
    };
    await voluntarioRepository.create(voluntariosData);

    await userRepository.setVoluntarioActivo(usuario_id, true);

    const admins = await userRepository.getAllAdmins();
    if (admins.length > 0) {
      await notificationRepository.create({
        usuarioId: admins[0].id,
        tipo: 'solicitud_voluntario',
        mensaje: `Nuevo voluntario registrado: ${user.nombre}`,
        referenciaId: usuario_id
      });
    }

    await notificationRepository.create({
      usuarioId: usuario_id,
      tipo: 'voluntario_registrado',
      mensaje: '¡Te has registrado como voluntario! Gracias por tu compromiso.',
      referenciaId: usuario_id
    });

    await emailService.enviarEmailVoluntarioRegistrado(user, {
      telefono,
      disponibilidad_dias,
      disponibilidad_horario,
      tiene_vehiculo
    });

    return { usuario_id, telefono, dni };
  },

  async getVoluntarioByUsuarioId(usuarioId) {
    return voluntarioRepository.getByUsuarioId(usuarioId);
  },

  async getAllVoluntarios() {
    return voluntarioRepository.getAll();
  },

  async toggleMiEstado(usuarioId, activo) {
    await userRepository.toggleVoluntarioActivo(usuarioId, activo);
    return true;
  },

  async actualizarVoluntario(usuarioId, data) {
    const {
      telefono, dni,
      disponibilidad_dias, disponibilidad_horario,
      tiene_vehiculo, motivacion, experiencia, comentarios
    } = data;

    const actualizado = await voluntarioRepository.updateVoluntarioActivo(
      usuarioId,
      telefono, dni,
      disponibilidad_dias, disponibilidad_horario,
      tiene_vehiculo, motivacion, experiencia, comentarios
    );

    if (!actualizado) {
      throw new Error('No se pudo actualizar los datos');
    }

    return actualizado;
  }
};

module.exports = voluntarioService;