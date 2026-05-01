const nodemailer = require('nodemailer');
const contactoRepository = require('../repositories/contacto.repository');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

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
    .email-header img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px; }
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
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj4k24WBr9WJDfNaTU7KK-y0C3nBEr5_Q79g&s" alt="Flacuchos Baena" />
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
  }
};

module.exports = contactoService;