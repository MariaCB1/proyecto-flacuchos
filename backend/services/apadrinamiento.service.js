const apadrinamientoRepository = require('../repositories/apadrinamiento.repository');
const cobroRepository = require('../repositories/cobro.repository');
const notificationService = require('./notification.service');
const emailService = require('./email.service');
const userService = require('./user.service');
const animalRepository = require('../repositories/animal.repository');

const apadrinamientoService = {
  async getAnimalesDisponibles(usuarioId) {
    return await apadrinamientoRepository.getAnimalesDisponibles(usuarioId);
  },

  async getAnimalesConPadrino() {
    return await apadrinamientoRepository.getAnimalesConPadrino();
  },

  async getMiApadrinamiento(usuarioId) {
    return await apadrinamientoRepository.getMiApadrinamiento(usuarioId);
  },

  async getAll() {
    return await apadrinamientoRepository.getAll();
  },

  async getAllConStats() {
    return await apadrinamientoRepository.getAllConStats();
  },

  async getById(id) {
    return await apadrinamientoRepository.getById(id);
  },

  async crear(datos) {
    const apadrinamiento = await apadrinamientoRepository.crear(datos);
    
    const usuario = await userService.getUsuarioById(datos.usuario_id);
    const animal = await animalRepository.getById(datos.animal_id);
    
    await notificationService.crearNotificacion({
      usuarioId: datos.usuario_id,
      tipo: 'solicitud_apadrinamiento',
      mensaje: `Tu solicitud de apadrinamiento para ${animal.nombre} ha sido enviada. Te notificaremos cuando sea revisada.`
    });

    const admins = await userService.getAdmins();
    for (const admin of admins) {
      await notificationService.crearNotificacion({
        usuarioId: admin.id,
        tipo: 'solicitud_apadrinamiento',
        mensaje: `Nueva solicitud de apadrinamiento: ${usuario.nombre} quiere apadrinar a ${animal.nombre} (${datos.importe}€/mes)`,
        referenciaId: apadrinamiento.id
      });
    }

    try {
      await emailService.enviarEmailSolicitudApadrinamiento({
        email: usuario.email,
        nombre: usuario.nombre,
        animal: animal.nombre,
        importe: datos.importe
      });
    } catch (emailErr) {
      console.error('Error enviando email de solicitud:', emailErr.message);
    }

    return apadrinamiento;
  },

  async aceptar(id) {
    const apadrinamiento = await apadrinamientoRepository.getById(id);
    if (!apadrinamiento) {
      throw new Error('Apadrinamiento no encontrado');
    }

    await apadrinamientoRepository.actualizarEstado(id, 'active');

    const animal = await animalRepository.getById(apadrinamiento.animal_id);
    const usuario = await userService.getUsuarioById(apadrinamiento.usuario_id);

    let primerCobroExitoso = true;
    let primerCobroError = null;

    if (apadrinamiento.stripe_customer_id && apadrinamiento.stripe_payment_method_id) {
      try {
        const stripeService = require('./stripe.service');
        const paymentIntent = await stripeService.ejecutarCobroDirecto(
          apadrinamiento.stripe_customer_id,
          apadrinamiento.stripe_payment_method_id,
          apadrinamiento.importe * 100,
          `Primer cobro apadrinamiento ${animal.nombre}`
        );

        if (paymentIntent.status === 'succeeded') {
          await cobroRepository.registrarCobro({
            apadrinamiento_id: id,
            stripe_payment_id: paymentIntent.id,
            monto: apadrinamiento.importe,
            estado: 'completada'
          });
        } else {
          primerCobroExitoso = false;
          primerCobroError = 'El cobro pendiente no se pudo completar';
        }
      } catch (cobroErr) {
        primerCobroExitoso = false;
        primerCobroError = cobroErr.message;
        console.error('Error en primer cobro:', cobroErr.message);
      }
    }

    const mensaje = primerCobroExitoso
      ? `¡Enhorabuena! Tu apadrinamiento de ${animal.nombre} ha sido aprobado y el primer cobro se ha realizado. ¡Gracias por tu apoyo!`
      : `Tu apadrinamiento de ${animal.nombre} ha sido aprobado, pero el primer cobro no se pudo procesar. Te contactaremos pronto.`;

    await notificationService.crearNotificacion({
      usuarioId: apadrinamiento.usuario_id,
      tipo: 'apadrinamiento_aprobado',
      mensaje: mensaje,
      referenciaId: id
    });

    try {
      await emailService.enviarEmailApadrinamientoAprobado({
        email: usuario.email,
        nombre: usuario.nombre,
        animal: animal.nombre,
        importe: apadrinamiento.importe,
        primerCobroExitoso
      });
    } catch (emailErr) {
      console.error('Error enviando email de aprobación:', emailErr.message);
    }

    return await apadrinamientoRepository.getById(id);
  },

  async rechazar(id, motivo = null) {
    const apadrinamiento = await apadrinamientoRepository.getById(id);
    if (!apadrinamiento) {
      throw new Error('Apadrinamiento no encontrado');
    }

    await apadrinamientoRepository.actualizarEstado(id, 'rejected');

    const animal = await animalRepository.getById(apadrinamiento.animal_id);
    const usuario = await userService.getUsuarioById(apadrinamiento.usuario_id);

    const mensaje = motivo 
      ? `Tu solicitud de apadrinamiento de ${animal.nombre} ha sido rechazada. Motivo: ${motivo}`
      : `Tu solicitud de apadrinamiento de ${animal.nombre} ha sido rechazada.`;

    await notificationService.crearNotificacion({
      usuarioId: apadrinamiento.usuario_id,
      tipo: 'apadrinamiento_rechazado',
      mensaje: mensaje,
      referenciaId: id
    });

    try {
      await emailService.enviarEmailApadrinamientoRechazado({
        email: usuario.email,
        nombre: usuario.nombre,
        animal: animal.nombre,
        motivo: motivo
      });
    } catch (emailErr) {
      console.error('Error enviando email de rechazo:', emailErr.message);
    }

    return await apadrinamientoRepository.getById(id);
  },

  async cancelar(id, usuarioId) {
    const apadrinamiento = await apadrinamientoRepository.getById(id);
    if (!apadrinamiento) {
      throw new Error('Apadrinamiento no encontrado');
    }

    if (apadrinamiento.usuario_id !== usuarioId) {
      throw new Error('No tienes permiso para cancelar este apadrinamiento');
    }

    await apadrinamientoRepository.actualizarEstado(id, 'canceled');

    const animal = await animalRepository.getById(apadrinamiento.animal_id);
    
    await animalRepository.updateAnimal(apadrinamiento.animal_id, {
      nombre_padrino: null
    });

    const admins = await userService.getAdmins();
    for (const admin of admins) {
      await notificationService.crearNotificacion({
        usuarioId: admin.id,
        tipo: 'apadrinamiento_cancelado',
        mensaje: `El usuario ${apadrinamiento.usuario_nombre} ha cancelado su apadrinamiento de ${animal.nombre}`,
        referenciaId: id
      });
    }

    return await apadrinamientoRepository.getById(id);
  },

  async cancelarPorAdopcion(animalId) {
    const apadrinamientosActivos = await apadrinamientoRepository.getByAnimalIdMultiple(animalId);
    
    if (!apadrinamientosActivos || apadrinamientosActivos.length === 0) {
      return { cancelados: 0 };
    }

    const animal = await animalRepository.getById(animalId);
    const resultados = [];

    for (const apadr of apadrinamientosActivos) {
      await apadrinamientoRepository.actualizarEstado(apadr.id, 'canceled');

      const usuario = await userService.getUsuarioById(apadr.usuario_id);

      await notificationService.crearNotificacion({
        usuarioId: apadr.usuario_id,
        tipo: 'apadrinamiento_cancelado',
        mensaje: `Tu apadrinamiento de ${animal.nombre} ha sido cancelado porque el animal ha sido adoptado. ¡Gracias por tu apoyo!`,
        referenciaId: apadr.id
      });

      try {
        await emailService.enviarEmailApadrinamientoCanceladoPorAdopcion({
          email: usuario.email,
          nombre: usuario.nombre,
          animal: animal.nombre,
          importe: apadr.importe
        });
      } catch (emailErr) {
        console.error('Error enviando email de cancelación por adopción:', emailErr.message);
      }

      resultados.push({
        apadrinamiento_id: apadr.id,
        usuario_id: apadr.usuario_id,
        cancelado: true
      });
    }

    await animalRepository.updateAnimal(animalId, {
      nombre_padrino: null
    });

    return { cancelados: resultados.length, resultados };
  },

  async eliminar(id, usuarioId) {
    const apadrinamiento = await apadrinamientoRepository.getById(id);
    if (!apadrinamiento) {
      throw new Error('Apadrinamiento no encontrado');
    }

    if (apadrinamiento.usuario_id !== usuarioId) {
      throw new Error('No tienes permiso para eliminar esta solicitud');
    }

    return await apadrinamientoRepository.delete(id, usuarioId);
  },

  async getCobros() {
    return await cobroRepository.getAll();
  },

  async getStatsCobros() {
    return await cobroRepository.getStats();
  },

  async ejecutarCobrosMensuales() {
    const apadrinamientosActivos = await apadrinamientoRepository.getActivos();
    const results = {
      exitosos: 0,
      fallidos: 0,
      detalles: []
    };

    for (const apadr of apadrinamientosActivos) {
      try {
        const stripeService = require('./stripe.service');
        const paymentIntent = await stripeService.procesarCobroMensual(
          apadr.stripe_customer_id,
          apadr.stripe_payment_method_id,
          apadr.importe,
          `Cobro mensual apadrinamiento ${apadr.animal_id}`
        );

        await cobroRepository.registrarCobro({
          apadrinamiento_id: apadr.id,
          stripe_payment_id: paymentIntent.id,
          monto: apadr.importe,
          estado: paymentIntent.status === 'succeeded' ? 'completada' : 'fallida'
        });

        if (paymentIntent.status === 'succeeded') {
          results.exitosos++;
        } else {
          results.fallidos++;
        }

        results.detalles.push({
          apadrinamiento_id: apadr.id,
          estado: paymentIntent.status,
          payment_id: paymentIntent.id
        });
      } catch (err) {
        console.error(`Error en cobro mensual apadrinamiento ${apadr.id}:`, err.message);
        
        await cobroRepository.registrarCobro({
          apadrinamiento_id: apadr.id,
          monto: apadr.importe,
          estado: 'fallida'
        });

        results.fallidos++;
        results.detalles.push({
          apadrinamiento_id: apadr.id,
          estado: 'error',
          error: err.message
        });

        const admins = await userService.getAdmins();
        for (const admin of admins) {
          await notificationService.crearNotificacion({
            usuarioId: admin.id,
            tipo: 'cobro_apadrinamiento',
            mensaje: `Error en cobro mensual de apadrinamiento ID ${apadr.id}: ${err.message}`
          });
        }
      }
    }

    return results;
  },

  async checkTuvoApadrinamientoCancelado(usuarioId) {
    return await apadrinamientoRepository.checkTuvoApadrinamientoCancelado(usuarioId);
  }
};

module.exports = apadrinamientoService;