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
  }
};

module.exports = emailService;