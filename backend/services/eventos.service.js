const eventosRepository = require('../repositories/eventos.repository');
const inscripcionesRepository = require('../repositories/inscripciones.repository');
const notificationRepository = require('../repositories/notification.repository');
const emailService = require('./email.service');

const eventosService = {
  async getAll(filtros = {}) {
    return await eventosRepository.getAll(filtros);
  },

  async getById(id) {
    const evento = await eventosRepository.getById(id);
    if (!evento) {
      throw new Error('Evento no encontrado');
    }
    return evento;
  },

  async create(eventoData) {
    if (!eventoData.titulo) {
      throw new Error('El título es obligatorio');
    }
    if (!eventoData.fecha) {
      throw new Error('La fecha es obligatoria');
    }
    const nuevoEvento = await eventosRepository.create(eventoData);

    const usuarios = await emailService.getTodosLosUsuarios();
    if (usuarios.length > 0) {
      await emailService.enviarEmailNuevoEvento(nuevoEvento, usuarios);
    }

    return nuevoEvento;
  },

  async update(id, eventoData) {
    const existente = await eventosRepository.getById(id);
    if (!existente) {
      throw new Error('Evento no encontrado');
    }

    const cambioFecha = existente.fecha !== eventoData.fecha;
    const cambioHora = existente.hora !== eventoData.hora;
    const cambioUbicacion = existente.ubicacion !== eventoData.ubicacion;
    const huboCambio = cambioFecha || cambioHora || cambioUbicacion;

    const eventoActualizado = await eventosRepository.update(id, eventoData);

    if (huboCambio) {
      const usuariosInscritos = await inscripcionesRepository.getUsuariosByEvento(id);
      
      if (usuariosInscritos.length > 0) {
        for (const inscripcion of usuariosInscritos) {
          await notificationRepository.create({
            usuarioId: inscripcion.usuario_id,
            tipo: 'evento_modificado',
            mensaje: `El evento "${existente.titulo}" ha sido modificado.`,
            referenciaId: id
          });
        }
      }

      const todosUsuarios = await emailService.getTodosLosUsuarios();
      if (todosUsuarios.length > 0) {
        await emailService.enviarEmailEventoModificado(eventoActualizado, todosUsuarios);
      }
    }

    return eventoActualizado;
  },

  async delete(id) {
    const existente = await eventosRepository.getById(id);
    if (!existente) {
      throw new Error('Evento no encontrado');
    }

    const usuariosInscritos = await inscripcionesRepository.getUsuariosByEvento(id);
    const idsInscritos = usuariosInscritos.map(u => u.usuario_id);
    
    await inscripcionesRepository.deleteByEventoId(id);
    
    const todosUsuarios = await emailService.getTodosLosUsuarios();
    const usuariosConInscripcion = todosUsuarios.filter(u => idsInscritos.includes(u.id));
    const usuariosSinInscripcion = todosUsuarios.filter(u => !idsInscritos.includes(u.id));
    
    if (usuariosInscritos.length > 0) {
      for (const inscripcion of usuariosInscritos) {
        await notificationRepository.create({
          usuarioId: inscripcion.usuario_id,
          tipo: 'evento_cancelado',
          mensaje: `El evento "${existente.titulo}" ha sido cancelado y tu inscripción ha sido eliminada.`,
          referenciaId: id
        });
      }
    }

    if (usuariosConInscripcion.length > 0) {
      await emailService.enviarEmailEventoCancelado(existente, usuariosConInscripcion, true);
    }

    if (usuariosSinInscripcion.length > 0) {
      await emailService.enviarEmailEventoCancelado(existente, usuariosSinInscripcion, false);
    }

    return await eventosRepository.delete(id);
  }
};

module.exports = eventosService;