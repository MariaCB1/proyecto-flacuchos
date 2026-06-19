const contactoRepository = require('../repositories/contacto.repository');
const notificationService = require('./notification.service');
const animalRepository = require('../repositories/animal.repository');
const transporter = require('../config/email');

const LOGO_URL = process.env.APP_LOGO_URL || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj4k24WBr9WJDfNaTU7KK-y0C3nBEr5_Q79g&s';

const contactoService = {
  async crearMensaje({ nombre, email, telefono, mensaje, tipoConsulta }) {
    const mensajeGuardado = await contactoRepository.create({
      nombre,
      email,
      telefono,
      mensaje,
      tipoConsulta
    });

    await this.enviarEmail({ nombre, email, telefono, mensaje, tipoConsulta });

    return mensajeGuardado;
  },

  async enviarEmail({ nombre, email, telefono, mensaje, tipoConsulta }) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.EMAIL_DESTINO,
      subject: `Nueva solicitud de contacto: ${tipoConsulta}`,
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .email-header { background: linear-gradient(135deg, #00897B 0%, #00695C 100%); padding: 30px 40px; text-align: center; }
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; background: #ffffff; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .email-body { padding: 30px 40px; }
    .section { margin-bottom: 25px; }
    .section-title { color: #00695C; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .info-card { background: #F5F9F8; border-radius: 12px; padding: 20px; border-left: 4px solid #00897B; }
    .info-row { display: flex; margin-bottom: 12px; }
    .info-row:last-child { margin-bottom: 0; }
    .info-label { font-weight: 600; color: #00695C; width: 100px; flex-shrink: 0; font-size: 13px; }
    .info-value { color: #333333; font-size: 14px; word-break: break-word; }
    .message-card { background: #F5F9F8; border-radius: 12px; padding: 20px; border-left: 4px solid #00897B; }
    .message-text { color: #333333; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
    .email-footer { background: #00897B; padding: 20px 40px; text-align: center; }
    .email-footer p { color: rgba(255,255,255,0.9); font-size: 12px; }
    .email-footer a { color: #ffffff; text-decoration: none; }
    @media (max-width: 600px) {
      body { padding: 10px; }
      .email-container { border-radius: 0; }
      .email-header, .email-body, .email-footer { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="${LOGO_URL}" alt="Flacuchos Baena" />
      <h1>Flacuchos Baena</h1>
      <p>Nueva solicitud de contacto</p>
    </div>
    <div class="email-body">
      <div class="section">
        <div class="section-title">Datos del contacto</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Nombre</span>
            <span class="info-value">${nombre}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value">${email}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Teléfono</span>
            <span class="info-value">${telefono || 'No proporcionado'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tipo</span>
            <span class="info-value">${tipoConsulta}</span>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Mensaje</div>
        <div class="message-card">
          <p class="message-text">${mensaje || 'Sin mensaje'}</p>
        </div>
      </div>
    </div>
    <div class="email-footer">
      <p>Enviado desde el formulario de contacto de flacuchosbaena@gmail.com</p>
    </div>
  </div>
</body>
</html>
      `
    };

    await transporter.sendMail(mailOptions);
  },

  async crearSolicitudAcogida(data) {
    const solicitud = await contactoRepository.createSolicitudAcogida(data);
    
    try {
      if (data.usuario_id) {
        await notificationService.crearNotificacion({
          usuarioId: data.usuario_id,
          tipo: 'solicitud_acogida_recibida',
          mensaje: 'Tu solicitud de casa de acogida ha sido enviada correctamente',
          referenciaId: solicitud.id
        });
      }

      await this.enviarEmailAcogidaRecibida(data);
      
      await notificationService.crearNotificacion({
        usuarioId: null,
        tipo: 'solicitud_acogida',
        mensaje: `Nueva solicitud de casa de acogida de ${data.nombre_completo}`,
        referenciaId: solicitud.id
      });
    } catch (emailErr) {
      console.error('Error enviando email:', emailErr);
    }
    return solicitud;
  },

  async enviarEmailAcogidaRecibida(data) {
    const destinatario = data.correo || data.email;
    if (!destinatario) {
      console.error('No se pudo determinar destinatario del email de acogida recibida');
      return;
    }
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: destinatario,
      subject: 'Tu solicitud de casa de acogida ha sido recibida - Flacuchos Baena',
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .email-header { background: linear-gradient(135deg, #00897B 0%, #00695C 100%); padding: 30px 40px; text-align: center; }
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; background: #ffffff; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .email-body { padding: 30px 40px; }
    .greeting { font-size: 16px; color: #333333; margin-bottom: 20px; }
    .success-card { background: #E8F5E9; border-radius: 12px; padding: 25px; border-left: 4px solid #00897B; margin-bottom: 20px; }
    .success-title { color: #00695C; font-size: 18px; font-weight: 700; margin-bottom: 10px; text-align: center; }
    .info-item { margin-bottom: 10px; font-size: 14px; }
    .info-label { font-weight: 600; color: #00695C; }
    .info-value { color: #333333; }
    .email-footer { background: #00897B; padding: 20px 40px; text-align: center; }
    .email-footer p { color: rgba(255,255,255,0.9); font-size: 12px; }
    @media (max-width: 600px) {
      body { padding: 10px; }
      .email-container { border-radius: 0; }
      .email-header, .email-body, .email-footer { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="${LOGO_URL}" alt="Flacuchos Baena" />
      <h1>Flacuchos Baena</h1>
      <p>Tu solicitud de casa de acogida ha sido recibida</p>
    </div>
    <div class="email-body">
      <p class="greeting">Hola <strong>${data.nombre_completo}</strong>,</p>
      <div class="success-card">
        <div class="success-title">¡Gracias por tu solicitud de casa de acogida!</div>
        <p>Tu solicitud ha sido recibida correctamente. Nuestro equipo la revisará y te contactará pronto.</p>
        <p style="margin-top: 10px;">Mientras tanto, puedes hacer seguimiento de tu solicitud en tu perfil.</p>
      </div>
      <div class="info-item">
        <span class="info-label">Nombre:</span> <span class="info-value">${data.nombre_completo}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Email:</span> <span class="info-value">${data.correo || data.email}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Teléfono:</span> <span class="info-value">${data.telefono}</span>
      </div>
      <p style="margin-top: 20px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p style="margin-top: 10px;">Un saludo,<br>El equipo de Flacuchos Baena</p>
    </div>
    <div class="email-footer">
      <p>Enviado desde Flacuchos Baena</p>
    </div>
  </div>
</body>
</html>
      `
    };
    await transporter.sendMail(mailOptions);
  },

  async aprobarAcogida(solicitudId) {
    const solicitud = await contactoRepository.getSolicitudAcogidaById(solicitudId);
    if (!solicitud) throw new Error('Solicitud no encontrada');

    await contactoRepository.updateEstadoAcogida(solicitudId, 'approved');

    if (solicitud.usuario_id) {
      await notificationService.crearNotificacion({
        usuarioId: solicitud.usuario_id,
        tipo: 'solicitud_acogida_aprobada',
        mensaje: 'Tu solicitud de casa de acogida ha sido aprobada',
        referenciaId: solicitudId
      });

      await this.enviarEmailAcogidaAprobada(solicitud);
    }

    return { success: true };
  },

  async rechazarAcogida(solicitudId, motivo) {
    const solicitud = await contactoRepository.getSolicitudAcogidaById(solicitudId);
    if (!solicitud) throw new Error('Solicitud no encontrada');

    await contactoRepository.updateEstadoAcogida(solicitudId, 'rejected', motivo);

    if (solicitud.usuario_id) {
      await notificationService.crearNotificacion({
        usuarioId: solicitud.usuario_id,
        tipo: 'solicitud_acogida_rechazada',
        mensaje: 'Tu solicitud de casa de acogida ha sido rechazada',
        referenciaId: solicitudId
      });

      await this.enviarEmailAcogidaRechazada(solicitud, motivo);
    }

    return { success: true };
  },

  async asignarAnimalAcogida(solicitudId, animalId) {
    const solicitud = await contactoRepository.getSolicitudAcogidaById(solicitudId);
    if (!solicitud) throw new Error('Solicitud no encontrada');

    const animal = await animalRepository.getById(animalId);
    if (!animal) throw new Error('Animal no encontrado');

    if (animal.en_acogida) {
      const acogidaActiva = await contactoRepository.getAcogidaActivaPorAnimal(animalId);
      if (acogidaActiva) {
        throw new Error('Este animal ya está en una casa de acogida activa');
      }
    }

    await contactoRepository.asignarAnimalAcogida(solicitudId, animalId);

    if (solicitud.usuario_id) {
      await notificationService.crearNotificacion({
        usuarioId: solicitud.usuario_id,
        tipo: 'solicitud_acogida_asignada',
        mensaje: `Se te ha asignado el animal: ${animal.nombre}`,
        referenciaId: solicitudId
      });

      await this.enviarEmailAnimalAsignado(solicitud, animal);
    }

    return { success: true };
  },

  async aceptarAnimalAsignado(solicitudId) {
    const solicitud = await contactoRepository.getSolicitudAcogidaById(solicitudId);
    if (!solicitud) throw new Error('Solicitud no encontrada');
    if (solicitud.estado !== 'asignado_pendiente') {
      throw new Error('La solicitud no está en estado de asignación pendiente');
    }

    await contactoRepository.updateEstadoAcogida(solicitudId, 'aceptado');

    if (solicitud.animal_asignado_id) {
      await animalRepository.updateAnimal(solicitud.animal_asignado_id, { en_acogida: true });
    }

    await notificationService.crearNotificacion({
      usuarioId: null,
      tipo: 'solicitud_acogida_aceptada',
      mensaje: `${solicitud.nombre_completo} ha aceptado la acogida del animal`,
      referenciaId: solicitudId
    });

    await this.enviarEmailAcogidaConfirmada(solicitud);

    return { success: true };
  },

  async rechazarAnimalAsignado(solicitudId) {
    const solicitud = await contactoRepository.getSolicitudAcogidaById(solicitudId);
    if (!solicitud) throw new Error('Solicitud no encontrada');
    if (solicitud.estado !== 'asignado_pendiente') {
      throw new Error('La solicitud no está en estado de asignación pendiente');
    }

    const animalId = solicitud.animal_asignado_id;
    await contactoRepository.updateEstadoAcogida(solicitudId, 'approved');

    if (animalId) {
      await animalRepository.updateAnimal(animalId, { en_acogida: false });
    }

    await notificationService.crearNotificacion({
      usuarioId: null,
      tipo: 'solicitud_acogida',
      mensaje: `${solicitud.nombre_completo} ha rechazado el animal asignado. Por favor, asígnale otro.`,
      referenciaId: solicitudId
    });

    return { success: true, message: 'Has rechazado el animal asignado. El admin te asignará otro.' };
  },

  async enviarEmailAcogidaAprobada(solicitud) {
    const destinatario = solicitud.correo || solicitud.email;
    if (!destinatario) {
      console.error('No se pudo determinar destinatario del email de acogida aprobada');
      return;
    }
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: destinatario,
      subject: 'Tu solicitud de casa de acogida ha sido aprobada',
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .email-header { background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); padding: 30px 40px; text-align: center; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-body { padding: 30px 40px; }
    .email-footer { background: #4CAF50; padding: 20px 40px; text-align: center; }
    .email-footer p { color: rgba(255,255,255,0.9); font-size: 12px; }
    .info-card { background: #E8F5E9; border-radius: 12px; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>¡Tu solicitud ha sido aprobada!</h1>
    </div>
    <div class="email-body">
      <p>Hola <strong>${solicitud.nombre_completo}</strong>,</p>
      <div class="info-card">
        <p>¡Enhorabuena! Tu solicitud de casa de acogida ha sido aprobada por el equipo de Flacuchos Baena.</p>
        <p style="margin-top: 10px;">Próximamente te asignaremos un animal que necesite hogar temporal. Te notificaremos cuando esto ocurra.</p>
      </div>
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p style="margin-top: 20px;">Un saludo,<br>El equipo de Flacuchos Baena</p>
    </div>
    <div class="email-footer">
      <p>Enviado desde Flacuchos Baena</p>
    </div>
  </div>
</body>
</html>
      `
    };
    await transporter.sendMail(mailOptions);
  },

  async enviarEmailAcogidaRechazada(solicitud, motivo) {
    const destinatario = solicitud.correo || solicitud.email;
    if (!destinatario) {
      console.error('No se pudo determinar destinatario del email de acogida rechazada');
      return;
    }
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: destinatario,
      subject: 'Tu solicitud de casa de acogida ha sido rechazada',
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .email-header { background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); padding: 30px 40px; text-align: center; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-body { padding: 30px 40px; }
    .email-footer { background: #f44336; padding: 20px 40px; text-align: center; }
    .email-footer p { color: rgba(255,255,255,0.9); font-size: 12px; }
    .info-card { background: #FFEBEE; border-radius: 12px; padding: 20px; border-left: 4px solid #f44336; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Solicitud rechazada</h1>
    </div>
    <div class="email-body">
      <p>Hola <strong>${solicitud.nombre_completo}</strong>,</p>
      <div class="info-card">
        <p>Lamentamos informarte que tu solicitud de casa de acogida ha sido rechazada.</p>
        <p style="margin-top: 10px;"><strong>Motivo:</strong> ${motivo || 'No especificado'}</p>
      </div>
      <p>Si crees que ha sido un error o quieres más información, puedes contactarnos.</p>
      <p style="margin-top: 20px;">Un saludo,<br>El equipo de Flacuchos Baena</p>
    </div>
    <div class="email-footer">
      <p>Enviado desde Flacuchos Baena</p>
    </div>
  </div>
</body>
</html>
      `
    };
    await transporter.sendMail(mailOptions);
  },

  async enviarEmailAnimalAsignado(solicitud, animal) {
    const destinatario = solicitud.correo || solicitud.email;
    if (!destinatario) {
      console.error('No se pudo determinar el destinatario del email de animal asignado');
      return;
    }
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: destinatario,
      subject: `Se te ha asignado un animal: ${animal.nombre} - Flacuchos Baena`,
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .email-header { background: linear-gradient(135deg, #00897B 0%, #00695C 100%); padding: 30px 40px; text-align: center; }
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; background: #ffffff; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .email-body { padding: 30px 40px; }
    .email-footer { background: #00897B; padding: 20px 40px; text-align: center; }
    .email-footer p { color: rgba(255,255,255,0.9); font-size: 12px; }
    .animal-card { background: #E8F5E9; border-radius: 12px; padding: 20px; border-left: 4px solid #00897B; margin: 20px 0; text-align: center; }
    .animal-card img { max-width: 200px; border-radius: 8px; margin: 10px 0; }
    .animal-name { font-size: 20px; font-weight: bold; color: #00897B; }
    .buttons { text-align: center; margin: 20px 0; }
    .btn { display: inline-block; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 0 10px; }
    .btn-accept { background: #00897B; color: white; }
    .btn-reject { background: #f44336; color: white; }
    @media (max-width: 600px) {
      body { padding: 10px; }
      .email-container { border-radius: 0; }
      .email-header, .email-body, .email-footer { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="${LOGO_URL}" alt="Flacuchos Baena" />
      <h1>Flacuchos Baena</h1>
      <p>Nuevo animal asignado</p>
    </div>
    <div class="email-body">
      <p>Hola <strong>${solicitud.nombre_completo}</strong>,</p>
      <p style="margin-top: 10px;">El equipo de Flacuchos Baena te ha asignado un animal para acogida:</p>
      <div class="animal-card">
        ${animal.imagen_url ? `<img src="${animal.imagen_url}" alt="${animal.nombre}" />` : ''}
        <div class="animal-name">${animal.nombre}</div>
        <p>${animal.especie} | ${animal.edad} | ${animal.tamano}</p>
      </div>
      <p>Por favor, entra en tu perfil para <strong>aceptar o rechazar</strong> este animal asignado.</p>
      <div class="buttons">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/perfil?tab=acogidas" class="btn btn-accept">Ver en mi perfil</a>
      </div>
      <p style="margin-top: 20px;">Un saludo,<br>El equipo de Flacuchos Baena</p>
    </div>
    <div class="email-footer">
      <p>Enviado desde Flacuchos Baena</p>
    </div>
  </div>
</body>
</html>
      `
    };
    await transporter.sendMail(mailOptions);
  },

  async enviarEmailAcogidaConfirmada(solicitud) {
    const destinatario = solicitud.correo || solicitud.email;
    if (!destinatario) {
      console.error('No se pudo determinar destinatario del email de acogida confirmada');
      return;
    }
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: destinatario,
      subject: 'Has confirmado la acogida - Flacuchos Baena',
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .email-header { background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); padding: 30px 40px; text-align: center; }
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; background: #ffffff; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .email-body { padding: 30px 40px; }
    .email-footer { background: #4CAF50; padding: 20px 40px; text-align: center; }
    .email-footer p { color: rgba(255,255,255,0.9); font-size: 12px; }
    .info-card { background: #E8F5E9; border-radius: 12px; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0; }
    @media (max-width: 600px) {
      body { padding: 10px; }
      .email-container { border-radius: 0; }
      .email-header, .email-body, .email-footer { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="${LOGO_URL}" alt="Flacuchos Baena" />
      <h1>Flacuchos Baena</h1>
      <p>Acogida Confirmada</p>
    </div>
    <div class="email-body">
      <p>Hola <strong>${solicitud.nombre_completo}</strong>,</p>
      <div class="info-card">
        <p>¡Gracias por confirmar la acogida! Tu compromiso ayuda a salvar vidas.</p>
        <p style="margin-top: 10px;">El equipo de Flacuchos Baena se pondría en contacto contigo pronto para coordinar los detalles de la entrega del animal.</p>
      </div>
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p style="margin-top: 20px;">Un saludo,<br>El equipo de Flacuchos Baena</p>
    </div>
    <div class="email-footer">
      <p>Enviado desde Flacuchos Baena</p>
    </div>
  </div>
</body>
</html>
      `
    };
    await transporter.sendMail(mailOptions);
  },

  async enviarEmailAcogida(data) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.EMAIL_DESTINO,
      subject: 'Nueva solicitud de Casa de Acogida',
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .email-header { background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%); padding: 30px 40px; text-align: center; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-body { padding: 30px 40px; }
    .section { margin-bottom: 20px; }
    .section-title { color: #1976D2; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .info-card { background: #E3F2FD; border-radius: 12px; padding: 20px; border-left: 4px solid #1976D2; }
    .info-row { display: flex; margin-bottom: 10px; }
    .info-label { font-weight: 600; color: #1565C0; width: 120px; flex-shrink: 0; font-size: 13px; }
    .info-value { color: #333333; font-size: 14px; }
    .email-footer { background: #1976D2; padding: 20px 40px; text-align: center; }
    .email-footer p { color: rgba(255,255,255,0.9); font-size: 12px; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>🐾 Nueva Solicitud de Acogida</h1>
    </div>
    <div class="email-body">
      <div class="section">
        <div class="section-title">Datos Personales</div>
        <div class="info-card">
          <div class="info-row"><span class="info-label">Nombre</span><span class="info-value">${data.nombre_completo}</span></div>
          <div class="info-row"><span class="info-label">DNI</span><span class="info-value">${data.dni}</span></div>
          <div class="info-row"><span class="info-label">Teléfono</span><span class="info-value">${data.telefono}</span></div>
          <div class="info-row"><span class="info-label">Email</span><span class="info-value">${data.correo || data.email}</span></div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Vivienda</div>
        <div class="info-card">
          <div class="info-row"><span class="info-label">Tipo</span><span class="info-value">${data.tipo_vivienda === 'otro' ? data.otra_vivienda : data.tipo_vivienda}</span></div>
          <div class="info-row"><span class="info-label">Propia/Alquiler</span><span class="info-value">${data.vivienda_propia}${data.vivienda_propia === 'alquiler' && data.permiso_alquiler ? ' (permite animales)' : ''}</span></div>
          <div class="info-row"><span class="info-label">Exterior</span><span class="info-value">${data.tiene_exterior ? 'Sí' : 'No'}</span></div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Otros Datos</div>
        <div class="info-card">
          <div class="info-row"><span class="info-label">Otras personas</span><span class="info-value">${data.otras_personas ? 'Sí' : 'No'}</span></div>
          <div class="info-row"><span class="info-label">Niños</span><span class="info-value">${data.hay_ninos ? 'Sí' : 'No'}</span></div>
          <div class="info-row"><span class="info-label">Otros animales</span><span class="info-value">${data.tiene_otros_animales ? data.tipo_otros_animales : 'No'}</span></div>
          <div class="info-row"><span class="info-label">Tiempo</span><span class="info-value">${data.tiempo_acogida}</span></div>
          <div class="info-row"><span class="info-label">Tipo animal</span><span class="info-value">${data.tipo_animal}</span></div>
          <div class="info-row"><span class="info-label">Experiencia</span><span class="info-value">${data.experiencia_previa ? 'Sí' : 'No'}</span></div>
        </div>
      </div>
    </div>
    <div class="email-footer">
      <p>Enviado desde el formulario de Flacuchos Baena</p>
    </div>
  </div>
</body>
</html>
      `
    };

    await transporter.sendMail(mailOptions);
  },

  async cancelarAcogidaPorAdopcion(animalId) {
    const acogidasActivas = await contactoRepository.getAcogidasActivasPorAnimal(animalId);
    
    if (!acogidasActivas || acogidasActivas.length === 0) {
      return { canceladas: 0 };
    }

    const animal = await animalRepository.getById(animalId);
    const resultados = [];

    for (const acogida of acogidasActivas) {
      await contactoRepository.updateEstadoAcogida(acogida.id, 'rejected', 'Animal adoptado');

      if (acogida.usuario_id) {
        await notificationService.crearNotificacion({
          usuarioId: acogida.usuario_id,
          tipo: 'solicitud_acogida_rechazada',
          mensaje: `La acogida de ${animal.nombre} ha sido cancelada porque el animal ha sido adoptado. ¡Gracias por tu apoyo!`,
          referenciaId: acogida.id
        });

        try {
          await this.enviarEmailAcogidaCanceladaPorAdopcion(acogida, animal);
        } catch (emailErr) {
          console.error('Error enviando email de cancelación de acogida por adopción:', emailErr.message);
        }
      }

      resultados.push({
        acogida_id: acogida.id,
        usuario_id: acogida.usuario_id,
        cancelada: true
      });
    }

    await animalRepository.updateAnimal(animalId, { en_acogida: false });

    return { canceladas: resultados.length, resultados };
  },

  async enviarEmailAcogidaCanceladaPorAdopcion(acogida, animal) {
    const destinatario = acogida.correo || acogida.email || acogida.usuario_email;
    if (!destinatario) {
      console.error('No se pudo determinar destinatario del email de acogida cancelada por adopcion');
      return;
    }
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: destinatario,
      subject: `Acogida de ${animal.nombre} cancelada - Flacuchos Baena`,
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .email-header { background: linear-gradient(135deg, #00897B 0%, #00695C 100%); padding: 30px 40px; text-align: center; }
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; background: #ffffff; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .email-body { padding: 30px 40px; }
    .greeting { font-size: 16px; color: #333333; margin-bottom: 20px; }
    .info-card { background: #FFF8E1; border-radius: 12px; padding: 25px; border-left: 4px solid #ffa000; margin-bottom: 20px; }
    .info-title { color: #f57c00; font-size: 20px; font-weight: 700; margin-bottom: 10px; }
    .good-news { background: #E8F5E9; border-radius: 12px; padding: 20px; margin-top: 20px; text-align: center; }
    .good-news p { color: #00695C; font-size: 14px; }
    .email-footer { background: #00897B; padding: 20px 40px; text-align: center; }
    .email-footer p { color: rgba(255,255,255,0.9); font-size: 12px; }
    @media (max-width: 600px) {
      body { padding: 10px; }
      .email-container { border-radius: 0; }
      .email-header, .email-body, .email-footer { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="${LOGO_URL}" alt="Flacuchos Baena" />
      <h1>Flacuchos Baena</h1>
      <p>Acogida cancelada</p>
    </div>
    <div class="email-body">
      <p class="greeting">Hola <strong>${acogida.nombre_completo}</strong>,</p>
      <div class="info-card">
        <div class="info-title">La acogida ha sido cancelada</div>
        <p style="color: #555555; font-size: 14px; margin-bottom: 15px;">
          El animal que tenías en acogida ha encontrado un hogar definitivo. ¡Esto es una gran noticia!
        </p>
        <div class="info-item" style="margin-bottom: 8px; font-size: 14px;">
          <span style="font-weight: 600; color: #f57c00;">Animal:</span>
          <span style="color: #333333;"> ${animal.nombre}</span>
        </div>
      </div>
      <div class="good-news">
        <p><strong>¡${animal.nombre} ya tiene familia!</strong></p>
        <p style="margin-top: 8px;">Tu labor como casa de acogida ha sido fundamental para que este animal llegara hasta aquí. Gracias de corazón.</p>
      </div>
      <p style="color: #555555; font-size: 14px; margin-top: 20px;">
        Si deseas seguir ayudando como casa de acogida, podemos asignarte otro animal que lo necesite.
      </p>
    </div>
    <div class="email-footer">
      <p>Flacuchos Baena - Protectora de animales</p>
    </div>
  </div>
</body>
</html>
      `
    };
    await transporter.sendMail(mailOptions);
  }
};

module.exports = contactoService;