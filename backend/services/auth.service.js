const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const authRepository = require('../repositories/auth.repository');
const notificationService = require('./notification.service');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const authService = {
  async registro({ nombre, email, contrasena }) {
    const existeUsuario = await authRepository.findByEmail(email);
    if (existeUsuario) {
      const error = new Error('El email ya está registrado');
      error.status = 400;
      throw error;
    }

    const usuario = await authRepository.create({ nombre, email, contrasena });

    const { token: tokenVerificacion } = await authRepository.generarTokenVerificacion(email);
    await this.enviarEmailVerificacion(email, nombre, tokenVerificacion);

    const token = this.generateToken(usuario);

    return {
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        es_voluntario: usuario.es_voluntario || false,
        voluntario_activo: usuario.voluntario_activo || false,
        es_socio: usuario.es_socio || false,
        email_verificado: false,
      },
    };
  },

  async login({ email, contrasena }) {
    const usuario = await authRepository.findByEmail(email);
    if (!usuario) {
      const error = new Error('Email o contraseña incorrectos');
      error.status = 401;
      throw error;
    }

    const esValida = await authRepository.comparePassword(contrasena, usuario.contrasena);
    if (!esValida) {
      const error = new Error('Email o contraseña incorrectos');
      error.status = 401;
      throw error;
    }

    const token = this.generateToken(usuario);

    return {
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        es_voluntario: usuario.es_voluntario || false,
        voluntario_activo: usuario.voluntario_activo || false,
        es_socio: usuario.es_socio || false,
        email_verificado: usuario.email_verificado || false,
      },
    };
  },

  generateToken(usuario) {
    return jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  },

async verificarToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const usuario = await authRepository.findById(decoded.id);
      if (!usuario) {
        const error = new Error('Usuario no encontrado');
        error.status = 401;
        throw error;
      }
      return {
        ...usuario,
        email_verificado: usuario.email_verificado || false
      };
    } catch (error) {
      const err = new Error('Token inválido');
      err.status = 401;
      throw err;
    }
  },

  async solicitarRecuperacion(email) {
    const usuario = await authRepository.findByEmail(email);
    if (!usuario) {
      return { message: 'Si el email existe, recibirás un enlace de recuperación' };
    }

    const { token, usuario: usuarioActualizado } = await authRepository.generarTokenRecuperacion(email);

    await this.enviarEmailRecuperacion(usuarioActualizado.email, usuarioActualizado.nombre, token);

    return { message: 'Si el email existe, recibirás un enlace de recuperación' };
  },

  async enviarEmailRecuperacion(email, nombre, token) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const linkRecuperacion = `${frontendUrl}/recuperar?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Recuperar tu contraseña - Flacuchos Baena',
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
    .email-body { padding: 30px 40px; }
    .section { margin-bottom: 25px; }
    .btn { display: inline-block; background: #00897B; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; margin: 20px 0; }
    .warning { background: #fff3e0; border-radius: 12px; padding: 20px; border-left: 4px solid #ff9800; margin-top: 20px; }
    .warning-title { color: #e65100; font-weight: 700; margin-bottom: 8px; }
    .warning-text { color: #333333; font-size: 14px; }
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
    </div>
    <div class="email-body">
      <div class="section">
        <p style="color: #333333; font-size: 16px; margin-bottom: 20px;">
          Hola <strong>${nombre}</strong>,
        </p>
        <p style="color: #333333; font-size: 16px; margin-bottom: 20px;">
          Has solicitado recuperar tu contraseña. Click en el siguiente botón para crear una nueva contraseña:
        </p>
        <div style="text-align: center;">
          <a href="${linkRecuperacion}" class="btn" style="color: white; text-decoration: none;">Restablecer mi contraseña</a>
        </div>
      </div>
      <div class="warning">
        <div class="warning-title">⚠️ Importante</div>
        <div class="warning-text">
          Este enlace caduca en <strong>15 minutos</strong>. Si no solicitaste este cambio, puedes ignorar este email.
        </div>
      </div>
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
  },

  async restablecerContrasena(token, nuevaContrasena) {
    const usuario = await authRepository.findByToken(token);
    if (!usuario) {
      const error = new Error('Token inválido o expirado');
      error.status = 400;
      throw error;
    }

    await authRepository.actualizarContrasena(usuario.id, nuevaContrasena);
    await this.enviarEmailConfirmacion(usuario.email, usuario.nombre);
    await notificationService.crearNotificacion({
      usuarioId: usuario.id,
      tipo: 'sistema',
      mensaje: 'Tu contraseña ha sido restablecida correctamente. Si no has sido tú, contacta con nosotros.'
    });

    return { message: 'Contraseña actualizada correctamente' };
  },

  async enviarEmailConfirmacion(email, nombre) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Tu contraseña ha sido actualizada - Flacuchos Baena',
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
    .email-body { padding: 30px 40px; }
    .alert { background: #e8f5e9; border-radius: 12px; padding: 20px; border-left: 4px solid #00897B; margin: 20px 0; }
    .alert-title { color: #00695C; font-weight: 700; margin-bottom: 8px; }
    .alert-text { color: #333333; font-size: 14px; }
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
    </div>
    <div class="email-body">
      <p style="color: #333333; font-size: 16px; margin-bottom: 20px;">
        Hola <strong>${nombre}</strong>,
      </p>
      <div class="alert">
        <div class="alert-title">✅ Contraseña actualizada</div>
        <div class="alert-text">
          Tu contraseña ha sido restablecida correctamente. Si no has sido tú, contacta con nosotros inmediatamente.
        </div>
      </div>
      <p style="color: #333333; font-size: 14px;">
        Por seguridad, te recomendamos cambiar tu contraseña regularmente y no usar la misma en otros sitios.
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
  },

  async verificarEmail(token) {
    const usuario = await authRepository.findByTokenVerificacion(token);
    if (!usuario) {
      const error = new Error('Token inválido o expirado');
      error.status = 400;
      throw error;
    }

    const usuarioVerificado = await authRepository.verificarEmail(usuario.id);
    return { message: 'Email verificado correctamente', email: usuarioVerificado.email };
  },

  async reenviarVerificacion(email) {
    const usuario = await authRepository.findByEmail(email);
    if (!usuario) {
      return { message: 'Si el email existe, recibirás un enlace de verificación' };
    }

    if (usuario.email_verificado) {
      return { message: 'El email ya está verificado' };
    }

    const { token } = await authRepository.generarTokenVerificacion(email);
    await this.enviarEmailVerificacion(email, usuario.nombre, token);

    return { message: 'Se ha enviado un nuevo email de verificación' };
  },

  async getEstadoVerificacion(usuarioId) {
    const verificado = await authRepository.getEmailVerificado(usuarioId);
    return { verificado };
  },

  async reenviarVerificacionPublico(email) {
    const usuario = await authRepository.findByEmail(email);
    if (!usuario) {
      const error = new Error('El email no está registrado');
      error.status = 404;
      throw error;
    }

    if (usuario.email_verificado) {
      const error = new Error('El email ya está verificado');
      error.status = 400;
      throw error;
    }

    const { token } = await authRepository.generarTokenVerificacion(email);
    await this.enviarEmailVerificacion(email, usuario.nombre, token);

    return { message: 'Email de verificación enviado' };
  },

  async enviarEmailVerificacion(email, nombre, token) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const linkVerificacion = `${frontendUrl}/verificar?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Verifica tu email - Flacuchos Baena',
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
    .btn { display: inline-block; background: #00897B; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; margin: 20px 0; }
    .info { background: #e3f2fd; border-radius: 12px; padding: 20px; border-left: 4px solid #1976d2; margin-top: 20px; }
    .info-title { color: #1565c0; font-weight: 700; margin-bottom: 8px; }
    .info-text { color: #333333; font-size: 14px; }
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
      <p>Verificación de email</p>
    </div>
    <div class="email-body">
      <div class="section">
        <p style="color: #333333; font-size: 16px; margin-bottom: 20px;">
          Hola <strong>${nombre}</strong>,
        </p>
        <p style="color: #333333; font-size: 16px; margin-bottom: 20px;">
          ¡Gracias por registrarte en Flacuchos Baena! Para completar tu registro, por favor verifica tu email haciendo clic en el siguiente botón:
        </p>
        <div style="text-align: center;">
          <a href="${linkVerificacion}" class="btn" style="color: white; text-decoration: none;">Verificar mi email</a>
        </div>
      </div>
      <div class="info">
        <div class="info-title">📧 Importante</div>
        <div class="info-text">
          Este enlace de verificación caduca en <strong>24 horas</strong>. Si no verificas tu email, no podrás acceder a todas las funciones de la web.
        </div>
      </div>
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

module.exports = authService;