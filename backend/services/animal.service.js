const animalRepository = require('../repositories/animal.repository');
const notificationService = require('../services/notification.service');
const emailService = require('../services/email.service');
const userRepository = require('../repositories/user.repository');

const animalService = {
  async getAnimales(filtros) {
    return await animalRepository.getAll(filtros);
  },

  async getAnimalById(id) {
    const animal = await animalRepository.getById(id);
    if (!animal) {
      throw new Error('Animal no encontrado');
    }
    return animal;
  },

  async crearSolicitud(solicitudData, usuarioId, animalId) {
    solicitudData.usuario_id = usuarioId;
    solicitudData.animal_id = animalId;
    
    const animal = await animalRepository.getById(animalId);
    if (!animal) {
      throw new Error('Animal no encontrado');
    }
    
    if (animal.estado !== 'disponible') {
      throw new Error('El animal no está disponible para adopción');
    }

    const resultado = await animalRepository.createSolicitud(solicitudData);

    // Enviar email al usuario
    try {
      const usuario = await userRepository.findById(usuarioId);
      if (usuario) {
        await emailService.enviarEmailSolicitudAdopcionCreada(usuario, animal);
      }
    } catch (emailErr) {
      console.error('Error enviando email de solicitud:', emailErr.message);
    }

    return resultado;
  },

  async getMisSolicitudes(usuarioId) {
    return await animalRepository.getMisSolicitudes(usuarioId);
  },

  async getAllSolicitudes() {
    return await animalRepository.getAllSolicitudes();
  },

  async getSolicitudesPendientes() {
    return await animalRepository.getSolicitudesPendientes();
  },

  async aprobarSolicitud(solicitudId) {
    const solicitud = await animalRepository.getAllSolicitudes();
    const solicitudObj = solicitud.find(s => s.id === solicitudId);
    
    if (!solicitudObj) {
      throw new Error('Solicitud no encontrada');
    }

    if (solicitudObj.estado !== 'pending') {
      throw new Error('La solicitud ya ha sido procesada');
    }

    await animalRepository.updateSolicitudEstado(solicitudId, 'approved');
    
    await animalRepository.createAdopcion(
      solicitudId,
      solicitudObj.animal_id,
      solicitudObj.usuario_id
    );

    await animalRepository.rechazarOtrasSolicitudes(
      solicitudObj.animal_id,
      solicitudId,
      'Animal adoptado por otro usuario'
    );

    // Cancelar apadrinamientos activos del animal
    try {
      const apadrinamientoService = require('./apadrinamiento.service');
      await apadrinamientoService.cancelarPorAdopcion(solicitudObj.animal_id);
    } catch (apadrErr) {
      console.error('Error cancelando apadrinamientos por adopción:', apadrErr.message);
    }

    // Cancelar acogidas activas del animal
    try {
      const contactoService = require('./contacto.service');
      await contactoService.cancelarAcogidaPorAdopcion(solicitudObj.animal_id);
    } catch (acogidaErr) {
      console.error('Error cancelando acogidas por adopción:', acogidaErr.message);
    }

    // Enviar email al usuario
    try {
      const usuario = await userRepository.findById(solicitudObj.usuario_id);
      const animal = await animalRepository.getById(solicitudObj.animal_id);
      if (usuario && animal) {
        await emailService.enviarEmailSolicitudAprobada(usuario, animal);
      }
    } catch (emailErr) {
      console.error('Error enviando email de aprobación:', emailErr.message);
    }

    return { message: 'Solicitud aprobada y adopción creada' };
  },

  async rechazarSolicitud(solicitudId, motivo) {
    const solicitudes = await animalRepository.getAllSolicitudes();
    const solicitudObj = solicitudes.find(s => s.id === solicitudId);
    
    if (!solicitudObj) {
      throw new Error('Solicitud no encontrada');
    }

    if (solicitudObj.estado !== 'pending') {
      throw new Error('La solicitud ya ha sido procesada');
    }

    await animalRepository.updateSolicitudConMotivo(solicitudId, 'rejected', motivo);
    
    // Enviar email al usuario
    try {
      const usuario = await userRepository.findById(solicitudObj.usuario_id);
      const animal = await animalRepository.getById(solicitudObj.animal_id);
      if (usuario && animal) {
        await emailService.enviarEmailSolicitudRechazada(usuario, animal, motivo);
      }
    } catch (emailErr) {
      console.error('Error enviando email de rechazo:', emailErr.message);
    }
    
    return { message: 'Solicitud rechazada' };
  },

  async eliminarMiSolicitud(solicitudId, usuarioId) {
    const eliminado = await animalRepository.eliminarMiSolicitud(solicitudId, usuarioId);
    if (!eliminado) {
      throw new Error('No puedes eliminar esta solicitud');
    }
    return { message: 'Solicitud eliminada correctamente' };
  },

  async getMisAdopciones(usuarioId) {
    return await animalRepository.getMisAdopciones(usuarioId);
  },

  async getSolicitudById(solicitudId) {
    const solicitud = await animalRepository.getSolicitudDetalle(solicitudId);
    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }
    return solicitud;
  },

  async getAllAnimalesAdmin() {
    return await animalRepository.getAllAnimalesAdmin();
  },

  async createAnimal(animalData) {
    return await animalRepository.createAnimal(animalData);
  },

  async updateAnimal(id, animalData) {
    const animal = await animalRepository.getById(id);
    if (!animal) {
      throw new Error('Animal no encontrado');
    }
    return await animalRepository.updateAnimal(id, animalData);
  },

  async deleteAnimal(id) {
    const animal = await animalRepository.getById(id);
    if (!animal) {
      throw new Error('Animal no encontrado');
    }
    
    const solicitudes = await animalRepository.getSolicitudesPorAnimal(id);
    
    const tieneAprobada = solicitudes.find(s => s.estado === 'approved');
    if (tieneAprobada) {
      throw new Error('No se puede eliminar un animal que ha sido adoptado. Primero debes eliminar la solicitud.');
    }
    
    for (const sol of solicitudes) {
      if (sol.usuario_id) {
        try {
          await notificationService.crearNotificacion({
            usuarioId: sol.usuario_id,
            tipo: 'solicitud_eliminada',
            mensaje: `Tu solicitud de adopción para ${animal.nombre} ha sido eliminada. El animal ya no está disponible en nuestra web. Datos del animal: ${animal.especie}, ${animal.edad}, ${animal.tamano}. Si tienes alguna duda, contacta con nosotros.`,
            referenciaId: sol.id
          });
        } catch (notifError) {
          console.warn('No se pudo crear notificación para usuario:', sol.usuario_id, notifError.message);
        }
      }
    }
    
    if (solicitudes.length > 0) {
      await animalRepository.eliminarAdopcionesPorAnimal(id);
      await animalRepository.eliminarSolicitudesPorAnimal(id);
    }
    
    return await animalRepository.deleteAnimal(id);
  },

  async getSolicitudDetalle(solicitudId) {
    const solicitud = await animalRepository.getSolicitudDetalle(solicitudId);
    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }
    return solicitud;
  }
};

module.exports = animalService;