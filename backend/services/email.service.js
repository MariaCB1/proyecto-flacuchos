const nodemailer = require('nodemailer');
const userRepository = require('../repositories/user.repository');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const emailService = {
  async enviarEmailNuevoEvento(evento, usuarios) {
    const asunto = `Nuevo evento: ${evento.titulo}`;
    
    for (const usuario of usuarios) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: usuario.email,
          subject: asunto,
          html: this.generarHtmlNuevoEvento(evento, usuario.nombre)
        });
      } catch (err) {
        console.error(`Error sending email to ${usuario.email}:`, err);
      }
    }
  },

  generarHtmlNuevoEvento(evento, nombreUsuario) {
    const fecha = new Date(evento.fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return `
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
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .email-body { padding: 30px 40px; }
    .greeting { font-size: 16px; color: #333333; margin-bottom: 20px; }
    .event-image { width: 100%; max-height: 300px; object-fit: cover; border-radius: 12px; margin-bottom: 20px; }
    .event-card { background: #E8F5E9; border-radius: 12px; padding: 25px; border-left: 4px solid #00897B; margin-bottom: 20px; }
    .event-title { color: #00695C; font-size: 20px; font-weight: 700; margin-bottom: 15px; }
    .event-detail { margin-bottom: 8px; font-size: 14px; }
    .event-label { font-weight: 600; color: #00695C; }
    .event-value { color: #333333; }
    .description { color: #555555; font-size: 14px; line-height: 1.6; margin-top: 15px; }
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
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj4k24WBr9WJDfNaTU7KK-y0C3nBEr5_Q79g&s" alt="Flacuchos Baena" />
      <h1>Flacuchos Baena</h1>
      <p>Nuevo evento programado</p>
    </div>
    <div class="email-body">
      <p class="greeting">Hola <strong>${nombreUsuario}</strong>,</p>
      <p style="margin-bottom: 20px;">¡Se ha creado un nuevo evento en la Asociación Flacuchos!</p>
      ${evento.imagen_url ? `<img src="${evento.imagen_url}" alt="${evento.titulo}" class="event-image" />` : ''}
      <div class="event-card">
        <div class="event-title">${evento.titulo}</div>
        <div class="event-detail">
          <span class="event-label">📅 Fecha:</span>
          <span class="event-value"> ${fecha}</span>
        </div>
        ${evento.hora ? `
        <div class="event-detail">
          <span class="event-label">🕐 Hora:</span>
          <span class="event-value"> ${evento.hora}</span>
        </div>
        ` : ''}
        ${evento.ubicacion ? `
        <div class="event-detail">
          <span class="event-label">📍 Ubicación:</span>
          <span class="event-value"> ${evento.ubicacion}</span>
        </div>
        ` : ''}
        ${evento.precio ? `
        <div class="event-detail">
          <span class="event-label">💰 Precio:</span>
          <span class="event-value"> ${evento.precio}</span>
        </div>
        ` : ''}
        ${evento.descripcion ? `
        <p class="description">${evento.descripcion}</p>
        ` : ''}
      </div>
    </div>
    <div class="email-footer">
      <p>Flacuchos Baena - Protectora de animales</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  async enviarEmailEventoCancelado(evento, usuarios, tieneInscripcion) {
    const asunto = tieneInscripcion 
      ? `Evento cancelado e inscripción eliminada: ${evento.titulo}`
      : `Evento cancelado: ${evento.titulo}`;
    
    for (const usuario of usuarios) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: usuario.email,
          subject: asunto,
          html: this.generarHtmlEventoCancelado(evento, usuario.nombre, tieneInscripcion)
        });
      } catch (err) {
        console.error(`Error sending email to ${usuario.email}:`, err);
      }
    }
  },

  generarHtmlEventoCancelado(evento, nombreUsuario, tieneInscripcion) {
    const fecha = new Date(evento.fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return `
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
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .email-body { padding: 30px 40px; }
    .greeting { font-size: 16px; color: #333333; margin-bottom: 20px; }
    .event-card { background: #FFEBEE; border-radius: 12px; padding: 25px; border-left: 4px solid #c62828; margin-bottom: 20px; }
    .event-title { color: #c62828; font-size: 20px; font-weight: 700; margin-bottom: 15px; }
    .event-detail { margin-bottom: 8px; font-size: 14px; }
    .event-label { font-weight: 600; color: #c62828; }
    .event-value { color: #333333; }
    .inscription-lost { background: #FFF3E0; border-radius: 12px; padding: 20px; border-left: 4px solid #f57c00; margin-top: 20px; }
    .inscription-title { color: #f57c00; font-weight: 700; margin-bottom: 8px; }
    .inscription-text { color: #555555; font-size: 14px; }
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
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj4k24WBr9WJDfNaTU7KK-y0C3nBEr5_Q79g&s" alt="Flacuchos Baena" />
      <h1>Flacuchos Baena</h1>
      <p>Evento cancelado</p>
    </div>
    <div class="email-body">
      <p class="greeting">Hola <strong>${nombreUsuario}</strong>,</p>
      <p style="margin-bottom: 20px;">Lamentamos informarte de que el siguiente evento ha sido cancelado:</p>
      <div class="event-card">
        <div class="event-title">${evento.titulo}</div>
        <div class="event-detail">
          <span class="event-label">📅 Fecha:</span>
          <span class="event-value"> ${fecha}</span>
        </div>
        ${evento.hora ? `
        <div class="event-detail">
          <span class="event-label">🕐 Hora:</span>
          <span class="event-value"> ${evento.hora}</span>
        </div>
        ` : ''}
        ${evento.ubicacion ? `
        <div class="event-detail">
          <span class="event-label">📍 Ubicación:</span>
          <span class="event-value"> ${evento.ubicacion}</span>
        </div>
        ` : ''}
      </div>
      ${tieneInscripcion ? `
      <div class="inscription-lost">
        <div class="inscription-title">❌ Tu inscripción ha sido eliminada</div>
        <p class="inscription-text">Estás inscrito en este evento. Tu inscripción ha sido automáticamente eliminada debido a la cancelación.</p>
      </div>
      ` : ''}
      <p style="margin-top: 20px; color: #555555; font-size: 14px;">Sentimos las molestias. Esperamos verte en futuros eventos.</p>
    </div>
    <div class="email-footer">
      <p>Flacuchos Baena - Protectora de animales</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  async enviarEmailEventoModificado(eventoActualizado, usuarios) {
    const asunto = `Evento modificado: ${eventoActualizado.titulo}`;
    
    for (const usuario of usuarios) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: usuario.email,
          subject: asunto,
          html: this.generarHtmlEventoModificado(eventoActualizado, usuario.nombre)
        });
      } catch (err) {
        console.error(`Error sending email to ${usuario.email}:`, err);
      }
    }
  },

  generarHtmlEventoModificado(eventoActualizado, nombreUsuario) {
    const fechaActualizada = new Date(eventoActualizado.fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return `
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
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .email-body { padding: 30px 40px; }
    .greeting { font-size: 16px; color: #333333; margin-bottom: 20px; }
    .event-card { background: #FFF8E1; border-radius: 12px; padding: 25px; border-left: 4px solid #ffa000; margin-bottom: 20px; }
    .event-title { color: #00695C; font-size: 20px; font-weight: 700; margin-bottom: 15px; }
    .change-item { margin-bottom: 12px; font-size: 14px; }
    .change-label { font-weight: 600; color: #f57c00; }
    .change-value { color: #333333; }
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
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj4k24WBr9WJDfNaTU7KK-y0C3nBEr5_Q79g&s" alt="Flacuchos Baena" />
      <h1>Flacuchos Baena</h1>
      <p>Evento modificado</p>
    </div>
    <div class="email-body">
      <p class="greeting">Hola <strong>${nombreUsuario}</strong>,</p>
      <p style="margin-bottom: 20px;">Se ha modificado el siguiente evento:</p>
      <div class="event-card">
        <div class="event-title">${eventoActualizado.titulo}</div>
        <div class="change-item">
          <span class="change-label">📅 Fecha:</span>
          <span class="change-value"> ${fechaActualizada}</span>
        </div>
        ${eventoActualizado.hora ? `
        <div class="change-item">
          <span class="change-label">🕐 Hora:</span>
          <span class="change-value"> ${eventoActualizado.hora}</span>
        </div>
        ` : ''}
        ${eventoActualizado.ubicacion ? `
        <div class="change-item">
          <span class="change-label">📍 Ubicación:</span>
          <span class="change-value"> ${eventoActualizado.ubicacion}</span>
        </div>
        ` : ''}
      </div>
      <p style="color: #555555; font-size: 14px;">Si te has suscrito y no puedes asistir, puedes cancelar tu inscripción desde el evento.</p>
    </div>
    <div class="email-footer">
      <p>Flacuchos Baena - Protectora de animales</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  async getTodosLosUsuarios() {
    const usuarios = await userRepository.getAllUsuariosExceptoAdmin();
    return usuarios;
  },

  async enviarEmailVoluntarioRegistrado(usuario, voluntario) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: usuario.email,
        subject: '¡Te has registrado como voluntario! - Flacuchos Baena',
        html: this.generarHtmlVoluntarioRegistrado(usuario, voluntario)
      });
    } catch (err) {
      console.error(`Error sending email to ${usuario.email}:`, err);
    }
  },

  generarHtmlVoluntarioRegistrado(usuario, datos) {
    const diasLabels = {
      lunes: 'Lunes',
      martes: 'Martes',
      miercoles: 'Miércoles',
      jueves: 'Jueves',
      viernes: 'Viernes',
      sabado: 'Sábado',
      domingo: 'Domingo'
    };
    const horariosLabels = {
      manana: 'Mañanas',
      tarde: 'Tardes',
      todo: 'Todo el día'
    };

    let diasTexto = 'No especificada';
    if (datos.disponibilidad_dias) {
      let diasArray = [];
      if (Array.isArray(datos.disponibilidad_dias)) {
        diasArray = datos.disponibilidad_dias;
      } else if (typeof datos.disponibilidad_dias === 'string') {
        if (datos.disponibilidad_dias.startsWith('[')) {
          try {
            diasArray = JSON.parse(datos.disponibilidad_dias);
          } catch {
            diasArray = datos.disponibilidad_dias.split(',').map(d => d.trim());
          }
        } else {
          diasArray = datos.disponibilidad_dias.split(',').map(d => d.trim());
        }
      }
      diasTexto = diasArray.map(d => diasLabels[d.trim()] || d.trim()).join(', ');
    }

    const horarioTexto = datos.disponibilidad_horario
      ? horariosLabels[datos.disponibilidad_horario] || datos.disponibilidad_horario
      : 'No especificado';

    return `
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
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .email-body { padding: 30px 40px; }
    .greeting { font-size: 16px; color: #333333; margin-bottom: 20px; }
    .success-card { background: #E8F5E9; border-radius: 12px; padding: 25px; border-left: 4px solid #00897B; margin-bottom: 20px; }
    .success-title { color: #00695C; font-size: 20px; font-weight: 700; margin-bottom: 10px; text-align: center; }
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
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj4k24WBr9WJDfNaTU7KK-y0C3nBEr5_Q79g&s" alt="Flacuchos Baena" />
      <h1>Flacuchos Baena</h1>
      <p>Confirmación de voluntariado</p>
    </div>
    <div class="email-body">
      <p class="greeting">Hola <strong>${usuario.nombre}</strong>,</p>
      <div class="success-card">
        <div class="success-title">¡Gracias por unirte como voluntario!</div>
        <p style="text-align: center; color: #555555; font-size: 14px; margin-top: 10px;">
          Tu registro como voluntario se ha completado correctamente.
        </p>
        <div class="info-item" style="margin-top: 20px;">
          <span class="info-label">Teléfono:</span>
          <span class="info-value"> ${datos.telefono}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Días disponibles:</span>
          <span class="info-value"> ${diasTexto}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Horario:</span>
          <span class="info-value"> ${horarioTexto}</span>
        </div>
        ${datos.tiene_vehiculo ? `
        <div class="info-item">
          <span class="info-label">Vehículo:</span>
          <span class="info-value"> Disponible para traslados</span>
        </div>
        ` : ''}
      </div>
      <p style="color: #555555; font-size: 14px; text-align: center;">
        ¡Gracias por tu compromiso con los animales! Juntos podemos hacer la diferencia.
      </p>
    </div>
    <div class="email-footer">
      <p>Flacuchos Baena - Protectora de animales</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  async enviarEmailSocioRegistrado(datos) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: datos.email,
        subject: `¡Bienvenido/a Socio de Flacuchos!`,
        html: this.generarHtmlSocioRegistrado(datos)
      });
    } catch (err) {
      console.error(`Error sending socio registered email to ${datos.email}:`, err);
    }
  },

  generarHtmlSocioRegistrado(datos) {
    return `
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
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .email-body { padding: 30px 40px; }
    .greeting { font-size: 16px; color: #333333; margin-bottom: 20px; }
    .success-card { background: #E8F5E9; border-radius: 12px; padding: 25px; border-left: 4px solid #00897B; margin-bottom: 20px; }
    .success-title { color: #00695C; font-size: 20px; font-weight: 700; margin-bottom: 10px; text-align: center; }
    .info-item { margin-bottom: 8px; font-size: 14px; }
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
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj4k24WBr9WJDfNaTU7KK-y0C3nBEr5_Q79g&s" alt="Flacuchos Baena" />
      <h1>Flacuchos Baena</h1>
      <p>Confirmación de Socio</p>
    </div>
    <div class="email-body">
      <p class="greeting">Hola <strong>${datos.nombre}</strong>,</p>
      <div class="success-card">
        <div class="success-title">¡Bienvenido/a Socio de Flacuchos!</div>
        <p style="text-align: center; color: #555555; font-size: 14px; margin-top: 10px;">
          Tu aportacion como socio se ha registrado correctamente.
        </p>
        <div class="info-item" style="margin-top: 20px; text-align: center;">
          <span class="info-label">Tu aportacion mensual:</span>
          <span class="info-value" style="font-size: 24px; color: #00897B; font-weight: bold;"> ${datos.aportacion}€/mes</span>
        </div>
      </div>
      <p style="color: #555555; font-size: 14px; text-align: center;">
        Gracias a personas como tú, podemos seguir rescueando y cuidando a los animales que más lo necesitan.
      </p>
      <div style="background: #FFF3E0; border-radius: 8px; padding: 15px; margin-top: 20px; text-align: center;">
        <p style="color: #E65100; font-size: 14px; margin: 0;">
          <strong>¿Cuándo se cobrará tu cuota?</strong><br>
          Tu domiciliación bancaria está activa. El primer cobro se procesará en <strong>1-2 días hábiles</strong>.
        </p>
      </div>
      <p style="color: #888888; font-size: 12px; text-align: center; margin-top: 15px;">
        Si el pago es rechazado por el banco, te notificaremos para que puedas usar otro método de pago.
      </p>
    </div>
    <div class="email-footer">
      <p>Flacuchos Baena - Protectora de animales</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  async enviarEmailSocioCancelado(datos) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: datos.email,
        subject: `Confirmacion de baja como socio - Flacuchos`,
        html: this.generarHtmlSocioCancelado(datos)
      });
    } catch (err) {
      console.error(`Error sending socio canceled email to ${datos.email}:`, err);
    }
  },

  generarHtmlSocioCancelado(datos) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .email-header { background: linear-gradient(135deg, #607D8B 0%, #455A64 100%); padding: 30px 40px; text-align: center; }
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .email-body { padding: 30px 40px; }
    .greeting { font-size: 16px; color: #333333; margin-bottom: 20px; }
    .cancel-card { background: #ECEFF1; border-radius: 12px; padding: 25px; border-left: 4px solid #607D8B; margin-bottom: 20px; }
    .cancel-title { color: #455A64; font-size: 20px; font-weight: 700; margin-bottom: 10px; text-align: center; }
    .message { color: #555555; font-size: 14px; line-height: 1.6; text-align: center; }
    .email-footer { background: #607D8B; padding: 20px 40px; text-align: center; }
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
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj4k24WBr9WJDfNaTU7KK-y0C3nBEr5_Q79g&s" alt="Flacuchos Baena" />
      <h1>Flacuchos Baena</h1>
      <p>Confirmacion de baja</p>
    </div>
    <div class="email-body">
      <p class="greeting">Hola <strong>${datos.nombre}</strong>,</p>
      <div class="cancel-card">
        <div class="cancel-title">Has causado baja como socio</div>
        <p class="message" style="margin-top: 15px;">
          Tu membresía como socio de Flacuchos ha sido cancelada correctamente.
        </p>
        <p class="message" style="margin-top: 15px;">
          Gracias por todo el tiempo que has estado con nosotros. Esperamos que en el futuro puedas volver a unirte a nuestra familia.
        </p>
      </div>
    </div>
    <div class="email-footer">
      <p>Flacuchos Baena - Protectora de animales</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  async enviarEmailSolicitudApadrinamiento(datos) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: datos.email,
      subject: 'Tu solicitud de apadrinamiento - Flacuchos Baena',
      html: this.generarHtmlSolicitudApadrinamiento(datos)
    };
    await transporter.sendMail(mailOptions);
  },

  generarHtmlSolicitudApadrinamiento(datos) {
    return `
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
    .email-header h1 { color: white; font-size: 24px; margin-bottom: 5px; }
    .email-header p { color: #B2DFDB; font-size: 14px; }
    .email-body { padding: 40px; }
    .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
    .info-card { background: #E8F5E9; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #00897B; }
    .info-card p { margin: 8px 0; color: #333; }
    .info-card strong { color: #00897B; }
    .message { font-size: 14px; color: #666; line-height: 1.6; }
    .email-footer { background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Flacuchos Baena</h1>
      <p>Solicitud de Apadrinamiento</p>
    </div>
    <div class="email-body">
      <p class="greeting">Hola <strong>${datos.nombre}</strong>,</p>
      <div class="info-card">
        <p><strong>Animal:</strong> ${datos.animal}</p>
        <p><strong>Importe:</strong> ${datos.importe}€/mes</p>
      </div>
      <p class="message">Tu solicitud de apadrinamiento ha sido enviada correctamente. Un administrador la revisará pronto y te informaremos.</p>
      <p class="message" style="margin-top: 15px;">¡Gracias por tu apoyo a los animales de Flacuchos!</p>
    </div>
    <div class="email-footer">
      <p>Flacuchos Baena - Protectora de animales</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  async enviarEmailAdminNuevoApadrinamiento(datos) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: datos.email,
      subject: `Nueva solicitud de apadrinamiento: ${datos.animal}`,
      html: this.generarHtmlAdminNuevoApadrinamiento(datos)
    };
    await transporter.sendMail(mailOptions);
  },

  generarHtmlAdminNuevoApadrinamiento(datos) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .email-header { background: linear-gradient(135deg, #FF6F00 0%, #E65100 100%); padding: 30px 40px; text-align: center; }
    .email-header h1 { color: white; font-size: 24px; }
    .email-body { padding: 40px; }
    .info-card { background: #FFF3E0; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #FF6F00; }
    .info-card p { margin: 8px 0; color: #333; }
    .info-card strong { color: #E65100; }
    .email-footer { background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Nueva Solicitud de Apadrinamiento</h1>
    </div>
    <div class="email-body">
      <div class="info-card">
        <p><strong>Usuario:</strong> ${datos.nombre}</p>
        <p><strong>Email:</strong> ${datos.emailUsuario}</p>
        <p><strong>Animal:</strong> ${datos.animal}</p>
        <p><strong>Importe:</strong> ${datos.importe}€/mes</p>
      </div>
      <p>Hay una nueva solicitud de apadrinamiento pendiente de revisión en el panel de administración.</p>
    </div>
    <div class="email-footer">
      <p>Flacuchos Baena - Protectora de animales</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  async enviarEmailApadrinamientoAprobado(datos) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: datos.email,
      subject: 'Tu apadrinamiento ha sido aprobado - Flacuchos Baena',
      html: this.generarHtmlApadrinamientoAprobado(datos)
    };
    await transporter.sendMail(mailOptions);
  },

  generarHtmlApadrinamientoAprobado(datos) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .email-header { background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%); padding: 30px 40px; text-align: center; }
    .email-header h1 { color: white; font-size: 24px; }
    .email-body { padding: 40px; }
    .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
    .success-card { background: #E8F5E9; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #2E7D32; text-align: center; }
    .success-card h2 { color: #2E7D32; margin-bottom: 10px; }
    .info-card { background: #F1F8E9; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #2E7D32; }
    .info-card p { margin: 8px 0; color: #333; }
    .info-card strong { color: #2E7D32; }
    .message { font-size: 14px; color: #666; line-height: 1.6; }
    .email-footer { background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Apadrinamiento Aprobado</h1>
    </div>
    <div class="email-body">
      <p class="greeting">Hola <strong>${datos.nombre}</strong>,</p>
      <div class="success-card">
        <h2>¡Enhorabuena!</h2>
        <p>Tu apadrinamiento ha sido aprobado</p>
      </div>
      <div class="info-card">
        <p><strong>Animal apadrinado:</strong> ${datos.animal}</p>
        <p><strong>Aportación mensual:</strong> ${datos.importe}€/mes</p>
      </div>
      ${datos.primerCobroExitoso ? `
      <p class="message">El primer cobro de ${datos.importe}€ ha sido realizado correctamente. Los cobros mensuales se procesarán automáticamente.</p>
      ` : `
      <p class="message" style="background: #FFF3E0; padding: 15px; border-radius: 8px; border-left: 4px solid #FF9800;">
        <strong>Nota:</strong> El primer cobro no se ha podido procesar automáticamente. Nos pondremos en contacto contigo para solucionarlo.
      </p>
      `}
      <p class="message">Tu apoyo es fundamental para nosotros. Gracias a personas como tú, podemos seguir cuidando de los animales.</p>
      <p class="message" style="margin-top: 15px;">¡Muchas gracias por tu generosidad!</p>
    </div>
    <div class="email-footer">
      <p>Flacuchos Baena - Protectora de animales</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  async enviarEmailApadrinamientoRechazado(datos) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: datos.email,
      subject: 'Tu solicitud de apadrinamiento - Flacuchos Baena',
      html: this.generarHtmlApadrinamientoRechazado(datos)
    };
    await transporter.sendMail(mailOptions);
  },

  generarHtmlApadrinamientoRechazado(datos) {
    const motivoHtml = datos.motivo ? `<p class="motivo"><strong>Motivo:</strong> ${datos.motivo}</p>` : '';
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .email-header { background: linear-gradient(135deg, #C62828 0%, #B71C1C 100%); padding: 30px 40px; text-align: center; }
    .email-header h1 { color: white; font-size: 24px; }
    .email-body { padding: 40px; }
    .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
    .reject-card { background: #FFEBEE; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #C62828; }
    .reject-card h2 { color: #C62828; margin-bottom: 10px; }
    .motivo { margin-top: 15px; color: #666; }
    .message { font-size: 14px; color: #666; line-height: 1.6; }
    .email-footer { background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Solicitud de Apadrinamiento</h1>
    </div>
    <div class="email-body">
      <p class="greeting">Hola <strong>${datos.nombre}</strong>,</p>
      <div class="reject-card">
        <h2>Tu solicitud ha sido rechazada</h2>
        <p>Lamentamos informarte que tu solicitud de apadrinamiento para <strong>${datos.animal}</strong> no ha sido aprobada.</p>
        ${motivoHtml}
      </div>
      <p class="message">Si tienes alguna pregunta, no dudes en contactarnos.</p>
    </div>
    <div class="email-footer">
      <p>Flacuchos Baena - Protectora de animales</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  async enviarEmailCobroMensual(datos) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: datos.email,
      subject: 'Cobro mensual de apadrinamiento - Flacuchos Baena',
      html: this.generarHtmlCobroMensual(datos)
    };
    await transporter.sendMail(mailOptions);
  },

  generarHtmlCobroMensual(datos) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .email-header { background: linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%); padding: 30px 40px; text-align: center; }
    .email-header h1 { color: white; font-size: 24px; }
    .email-body { padding: 40px; }
    .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
    .info-card { background: #F3E5F5; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #7B1FA2; }
    .info-card p { margin: 8px 0; color: #333; }
    .info-card strong { color: #7B1FA2; }
    .monto { font-size: 28px; color: #7B1FA2; font-weight: bold; text-align: center; margin: 20px 0; }
    .message { font-size: 14px; color: #666; line-height: 1.6; }
    .email-footer { background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Cobro Mensual de Apadrinamiento</h1>
    </div>
    <div class="email-body">
      <p class="greeting">Hola <strong>${datos.nombre}</strong>,</p>
      <p class="message">Se ha procesado el cobro mensual de tu apadrinamiento:</p>
      <div class="info-card">
        <p><strong>Animal:</strong> ${datos.animal}</p>
        <p><strong>Importe:</strong></p>
        <div class="monto">${datos.importe}€</div>
      </div>
      <p class="message">Gracias por tu apoyo continuo. Tu contribución hace posible el cuidado de los animales.</p>
    </div>
    <div class="email-footer">
      <p>Flacuchos Baena - Protectora de animales</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  async enviarEmailSolicitudAdopcionCreada(usuario, animal) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: usuario.email,
        subject: 'Tu solicitud de adopción ha sido enviada - Flacuchos Baena',
        html: this.generarHtmlSolicitudAdopcionCreada(usuario.nombre, animal)
      });
    } catch (err) {
      console.error(`Error sending email to ${usuario.email}:`, err);
    }
  },

  generarHtmlSolicitudAdopcionCreada(nombre, animal) {
    const animalImage = animal.imagen_url ? `<img src="${animal.imagen_url}" alt="${animal.nombre}" class="animal-image" />` : '';
    return `
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
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .email-body { padding: 30px 40px; }
    .greeting { font-size: 16px; color: #333333; margin-bottom: 20px; }
    .success-card { background: #E8F5E9; border-radius: 12px; padding: 25px; border-left: 4px solid #00897B; margin-bottom: 20px; }
    .success-title { color: #00695C; font-size: 20px; font-weight: 700; margin-bottom: 10px; text-align: center; }
    .animal-image { width: 80px; height: 80px; object-fit: cover; border-radius: 50%; margin: 15px auto; display: block; }
    .animal-name { font-size: 18px; font-weight: 700; color: #00695C; text-align: center; margin: 10px 0; }
    .info-item { margin-bottom: 8px; font-size: 14px; }
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
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj4k24WBr9WJDfNaTU7KK-y0C3nBEr5_Q79g&s" alt="Flacuchos Baena" />
      <h1>Flacuchos Baena</h1>
      <p>Solicitud de adopción enviada</p>
    </div>
    <div class="email-body">
      <p class="greeting">Hola <strong>${nombre}</strong>,</p>
      <div class="success-card">
        <div class="success-title">¡Solicitud enviada correctamente!</div>
        <p style="text-align: center; color: #555555; font-size: 14px; margin-top: 10px;">
          Tu solicitud de adopción ha sido recibida y será revisada por nuestro equipo.
        </p>
        ${animalImage}
        <div class="animal-name">${animal.nombre}</div>
        ${animal.especie ? `
        <div class="info-item" style="text-align: center;">
          <span class="info-label">Especie:</span>
          <span class="info-value"> ${animal.especie}</span>
        </div>
        ` : ''}
        ${animal.edad ? `
        <div class="info-item" style="text-align: center;">
          <span class="info-label">Edad:</span>
          <span class="info-value"> ${animal.edad}</span>
        </div>
        ` : ''}
        ${animal.tamano ? `
        <div class="info-item" style="text-align: center;">
          <span class="info-label">Tamaño:</span>
          <span class="info-value"> ${animal.tamano}</span>
        </div>
        ` : ''}
      </div>
      <p style="color: #555555; font-size: 14px; text-align: center;">
        Te notificaremos cuando tu solicitud sea revisada. Gracias por querer dar un hogar a uno de nuestros animales.
      </p>
    </div>
    <div class="email-footer">
      <p>Flacuchos Baena - Protectora de animales</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  async enviarEmailSolicitudAprobada(usuario, animal) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: usuario.email,
        subject: '¡Tu solicitud de adopción ha sido aprobada! - Flacuchos Baena',
        html: this.generarHtmlSolicitudAprobada(usuario.nombre, animal)
      });
    } catch (err) {
      console.error(`Error sending email to ${usuario.email}:`, err);
    }
  },

  generarHtmlSolicitudAprobada(nombre, animal) {
    const animalImage = animal.imagen_url ? `<img src="${animal.imagen_url}" alt="${animal.nombre}" class="animal-image" />` : '';
    return `
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
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .email-body { padding: 30px 40px; }
    .greeting { font-size: 16px; color: #333333; margin-bottom: 20px; }
    .success-card { background: #E8F5E9; border-radius: 12px; padding: 25px; border-left: 4px solid #00897B; margin-bottom: 20px; }
    .success-title { color: #00695C; font-size: 20px; font-weight: 700; margin-bottom: 10px; text-align: center; }
    .animal-image { width: 80px; height: 80px; object-fit: cover; border-radius: 50%; margin: 15px auto; display: block; }
    .animal-name { font-size: 18px; font-weight: 700; color: #00695C; text-align: center; margin: 10px 0; }
    .info-item { margin-bottom: 8px; font-size: 14px; }
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
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj4k24WBr9WJDfNaTU7KK-y0C3nBEr5_Q79g&s" alt="Flacuchos Baena" />
      <h1>Flacuchos Baena</h1>
      <p>¡Adopción aprobada!</p>
    </div>
    <div class="email-body">
      <p class="greeting">Hola <strong>${nombre}</strong>,</p>
      <div class="success-card">
        <div class="success-title">¡Enhorabuena! Tu solicitud ha sido aprobada</div>
        <p style="text-align: center; color: #555555; font-size: 14px; margin-top: 10px;">
          Nos complace informarte que tu solicitud de adopción ha sido aprobada. Pronto nos pondremos en contacto contigo para coordinar la entrega.
        </p>
        ${animalImage}
        <div class="animal-name">${animal.nombre}</div>
        ${animal.especie ? `
        <div class="info-item" style="text-align: center;">
          <span class="info-label">Especie:</span>
          <span class="info-value"> ${animal.especie}</span>
        </div>
        ` : ''}
        ${animal.edad ? `
        <div class="info-item" style="text-align: center;">
          <span class="info-label">Edad:</span>
          <span class="info-value"> ${animal.edad}</span>
        </div>
        ` : ''}
        ${animal.tamano ? `
        <div class="info-item" style="text-align: center;">
          <span class="info-label">Tamaño:</span>
          <span class="info-value"> ${animal.tamano}</span>
        </div>
        ` : ''}
      </div>
      <p style="color: #555555; font-size: 14px; text-align: center;">
        ¡Gracias por abrir tu corazón y darle un hogar a ${animal.nombre}!
      </p>
    </div>
    <div class="email-footer">
      <p>Flacuchos Baena - Protectora de animales</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  async enviarEmailSolicitudRechazada(usuario, animal, motivo) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: usuario.email,
        subject: 'Tu solicitud de adopción - Flacuchos Baena',
        html: this.generarHtmlSolicitudRechazada(usuario.nombre, animal, motivo)
      });
    } catch (err) {
      console.error(`Error sending email to ${usuario.email}:`, err);
    }
  },

  generarHtmlSolicitudRechazada(nombre, animal, motivo) {
    const animalImage = animal.imagen_url ? `<img src="${animal.imagen_url}" alt="${animal.nombre}" class="animal-image" />` : '';
    const motivoHtml = motivo ? `<p class="motivo"><strong>Motivo:</strong> ${motivo}</p>` : '';
    return `
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
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .email-body { padding: 30px 40px; }
    .greeting { font-size: 16px; color: #333333; margin-bottom: 20px; }
    .reject-card { background: #FFEBEE; border-radius: 12px; padding: 25px; border-left: 4px solid #c62828; margin-bottom: 20px; }
    .reject-title { color: #c62828; font-size: 20px; font-weight: 700; margin-bottom: 10px; }
    .animal-image { width: 80px; height: 80px; object-fit: cover; border-radius: 50%; margin: 15px auto; display: block; }
    .animal-name { font-size: 18px; font-weight: 700; color: #c62828; text-align: center; margin: 10px 0; }
    .motivo { margin-top: 15px; color: #555555; font-size: 14px; }
    .info-item { margin-bottom: 8px; font-size: 14px; }
    .info-label { font-weight: 600; color: #c62828; }
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
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj4k24WBr9WJDfNaTU7KK-y0C3nBEr5_Q79g&s" alt="Flacuchos Baena" />
      <h1>Flacuchos Baena</h1>
      <p>Solicitud de adopción</p>
    </div>
    <div class="email-body">
      <p class="greeting">Hola <strong>${nombre}</strong>,</p>
      <div class="reject-card">
        <div class="reject-title">Tu solicitud ha sido rechazada</div>
        ${animalImage}
        <div class="animal-name">${animal.nombre}</div>
        <p style="color: #555555; font-size: 14px;">
          Lamentamos informarte que tu solicitud de adopción no ha sido aprobada.
        </p>
        ${motivoHtml}
        ${animal.especie ? `
        <div class="info-item" style="text-align: center; margin-top: 15px;">
          <span class="info-label">Especie:</span>
          <span class="info-value"> ${animal.especie}</span>
        </div>
        ` : ''}
        ${animal.edad ? `
        <div class="info-item" style="text-align: center;">
          <span class="info-label">Edad:</span>
          <span class="info-value"> ${animal.edad}</span>
        </div>
        ` : ''}
      </div>
      <p style="color: #555555; font-size: 14px;">
        Si tienes alguna pregunta o deseas más información, no dudes en contactarnos.
      </p>
    </div>
    <div class="email-footer">
      <p>Flacuchos Baena - Protectora de animales</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  },

  async enviarEmailApadrinamientoCanceladoPorAdopcion(datos) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: datos.email,
        subject: 'Tu apadrinamiento ha sido cancelado - Flacuchos Baena',
        html: this.generarHtmlApadrinamientoCanceladoPorAdopcion(datos)
      });
    } catch (err) {
      console.error(`Error sending email to ${datos.email}:`, err);
    }
  },

  generarHtmlApadrinamientoCanceladoPorAdopcion(datos) {
    return `
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
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; }
    .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 5px; }
    .email-header p { color: rgba(255,255,255,0.9); font-size: 14px; }
    .email-body { padding: 30px 40px; }
    .greeting { font-size: 16px; color: #333333; margin-bottom: 20px; }
    .info-card { background: #FFF8E1; border-radius: 12px; padding: 25px; border-left: 4px solid #ffa000; margin-bottom: 20px; }
    .info-title { color: #f57c00; font-size: 20px; font-weight: 700; margin-bottom: 10px; }
    .info-item { margin-bottom: 8px; font-size: 14px; }
    .info-label { font-weight: 600; color: #f57c00; }
    .info-value { color: #333333; }
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
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj4k24WBr9WJDfNaTU7KK-y0C3nBEr5_Q79g&s" alt="Flacuchos Baena" />
      <h1>Flacuchos Baena</h1>
      <p>Apadrinamiento cancelado</p>
    </div>
    <div class="email-body">
      <p class="greeting">Hola <strong>${datos.nombre}</strong>,</p>
      <div class="info-card">
        <div class="info-title">Tu apadrinamiento ha sido cancelado</div>
        <p style="color: #555555; font-size: 14px; margin-bottom: 15px;">
          El animal que apadrinabas ha encontrado un hogar. ¡Esto es una gran noticia!
        </p>
        <div class="info-item">
          <span class="info-label">Animal:</span>
          <span class="info-value"> ${datos.animal}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Aportación mensual:</span>
          <span class="info-value"> ${datos.importe}€</span>
        </div>
      </div>
      <div class="good-news">
        <p><strong>¡${datos.animal} ya tiene familia!</strong></p>
        <p style="margin-top: 8px;">Tu apoyo ha sido fundamental para que este animal llegara hasta aquí. Gracias de corazón.</p>
      </div>
      <p style="color: #555555; font-size: 14px; margin-top: 20px;">
        Los cobros mensuales han sido cancelados. Si deseas apadrinar a otro animal, puedes hacerlo desde nuestra web.
      </p>
    </div>
    <div class="email-footer">
      <p>Flacuchos Baena - Protectora de animales</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
};

module.exports = emailService;