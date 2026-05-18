const socioRepository = require('../repositories/socio.repository');
const notificationService = require('./notification.service');
const userService = require('./user.service');
const emailService = require('./email.service');
const stripeService = require('./stripe.service');

const socioService = {
  async listarSocios() {
    return await socioRepository.getAllSocios();
  },

  async getSocioByUsuarioId(usuarioId) {
    return await socioRepository.getSocioByUsuarioId(usuarioId);
  },

  async crearSocioDesdeStripe(datos) {
    return await socioRepository.crearSocio(datos);
  },

  async cancelarMiSocio(usuarioId) {
    const socioActual = await socioRepository.getSocioByUsuarioId(usuarioId);
    if (!socioActual) {
      throw new Error('No eres socio actualmente');
    }

    console.log('DEBUG cancelarMiSocio: Socio actual:', socioActual);

    // Cancelar la suscripción en Stripe si existe
    if (socioActual.stripe_subscription_id && !socioActual.stripe_subscription_id.startsWith('pending')) {
      try {
        await stripeService.cancelarSuscripcionStripe(socioActual.stripe_subscription_id);
        console.log('Suscripción de Stripe cancelada:', socioActual.stripe_subscription_id);
      } catch (stripeErr) {
        console.error('Error cancelando en Stripe:', stripeErr.message);
      }
    }

    // Cancelar en la base de datos
    await socioRepository.cancelarSocio(usuarioId);
    
    // Actualizar es_socio en la tabla de usuarios
    await userService.setEsSocio(usuarioId, false);

    const usuario = await userService.getUsuarioById(usuarioId);
    console.log('DEBUG cancelarMiSocio: Usuario:', usuario);
    
    if (usuario) {
      // Crear notificación para el usuario
      try {
        await notificationService.crearNotificacion({
          usuarioId: usuarioId,
          tipo: 'socio_cancelado',
          mensaje: 'Has causado baja como socio de Flacucos. Gracias por todo el tiempo que has estado con nosotros.',
          referenciaId: socioActual.id
        });
        console.log('DEBUG cancelarMiSocio: Notificación creada');
      } catch (notifErr) {
        console.error('Error creando notificación:', notifErr.message);
      }

      // Enviar email de cancelación
      try {
        await emailService.enviarEmailSocioCancelado({
          nombre: socioActual.nombre_apellidos,
          email: usuario.email
        });
        console.log('DEBUG cancelarMiSocio: Email enviado');
      } catch (emailErr) {
        console.error('Error enviando email de cancelación:', emailErr.message);
      }
    }

    // Notificar a admins
    const admins = await userService.getAdmins();
    console.log('DEBUG cancelarMiSocio: Admins:', admins.length);
    for (const admin of admins) {
      try {
        await notificationService.crearNotificacion({
          usuarioId: admin.id,
          tipo: 'socio_caido',
          mensaje: `El socio ${socioActual.nombre_apellidos} se ha dado de baja`,
          referenciaId: socioActual.id
        });
      } catch (adminNotifErr) {
        console.error('Error notificando admin:', adminNotifErr.message);
      }
    }

    return { mensaje: 'Baja de socio procesada correctamente' };
  },

  async getSociosConStats() {
    return await socioRepository.getAllSociosConStats();
  },

  async fueSocioEsteMes(usuarioId) {
    return await socioRepository.fueSocioEsteMes(usuarioId);
  },

  async getTotalHistorico(usuarioId) {
    return await socioRepository.getTotalHistorico(usuarioId);
  }
};

module.exports = socioService;