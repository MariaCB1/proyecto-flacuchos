require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const notificationRoutes = require('./routes/notification.routes');
const animalRoutes = require('./routes/animal.routes');
const uploadRoutes = require('./routes/upload.routes');
const contactoRoutes = require('./routes/contacto.routes');
const noticiaRoutes = require('./routes/noticia.routes');
const eventosRoutes = require('./routes/eventos.routes');
const inscripcionesRoutes = require('./routes/inscripciones.routes');
const stripeRoutes = require('./routes/stripe.routes');
const socioRoutes = require('./routes/socio.routes');
const voluntarioRoutes = require('./routes/voluntario.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/usuarios', userRoutes);
app.use('/notificaciones', notificationRoutes);
app.use('/', animalRoutes);
app.use('/upload', uploadRoutes);
app.use('/contacto', contactoRoutes);
app.use('/', noticiaRoutes);
app.use('/eventos', eventosRoutes);
app.use('/inscripciones', inscripcionesRoutes);
app.use('/stripe', stripeRoutes);
app.use('/socios', socioRoutes);
app.use('/voluntarios', voluntarioRoutes);
const apadrinamientoRoutes = require('./routes/apadrinamiento.routes');
const resumenRoutes = require('./routes/resumen.routes');
app.use('/apadrinamientos', apadrinamientoRoutes);
app.use('/admin', resumenRoutes);

cron.schedule('0 8 1 * *', async () => {
  console.log('🔄 Iniciando cobro mensual de apadrinamientos...');
  try {
    const apadrinamientoService = require('./services/apadrinamiento.service');
    const resultados = await apadrinamientoService.ejecutarCobrosMensuales();
    console.log('📊 Resultados cobros mensuales:', JSON.stringify(resultados));
  } catch (err) {
    console.error('❌ Error en cobro mensual:', err.message);
  }
});
console.log('✅ Cron job de cobros mensuales programado (día 1 de cada mes a las 8:00)');

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   POST /auth/registro`);
  console.log(`   POST /auth/login`);
  console.log(`   POST /auth/logout`);
  console.log(`   GET  /auth/verify`);
  console.log(`   GET  /usuarios/perfil`);
  console.log(`   PUT  /usuarios/perfil`);
  console.log(`   GET  /notificaciones`);
  console.log(`   GET  /notificaciones/no-leidas`);
  console.log(`   PUT  /notificaciones/:id/leer`);
  console.log(`   GET  /animales`);
  console.log(`   GET  /animales/todos`);
  console.log(`   GET  /animales/:id`);
  console.log(`   POST /animales`);
  console.log(`   PUT  /animales/:id`);
  console.log(`   DELETE /animales/:id`);
  console.log(`   POST /solicitudes/:animalId`);
  console.log(`   GET  /solicitudes/mis-solicitudes`);
  console.log(`   GET  /solicitudes`);
  console.log(`   PUT  /solicitudes/:id/aprobar`);
  console.log(`   PUT  /solicitudes/:id/rechazar`);
  console.log(`   GET  /adopciones/mis-adopciones`);
  console.log(`   GET  /noticias`);
  console.log(`   GET  /noticias/:id`);
  console.log(`   POST /noticias (admin)`);
  console.log(`   PUT  /noticias/:id (admin)`);
  console.log(`   DELETE /noticias/:id (admin)`);
  console.log(`   GET  /eventos`);
  console.log(`   GET  /eventos/:id`);
  console.log(`   POST /eventos (admin)`);
  console.log(`   PUT  /eventos/:id (admin)`);
  console.log(`   DELETE /eventos/:id (admin)`);
  console.log(`   POST /inscripciones`);
  console.log(`   GET  /inscripciones/mis-inscripciones`);
  console.log(`   DELETE /inscripciones`);
  console.log(`   GET  /inscripciones (admin)`);
  console.log(`   GET  /inscripciones/evento/:eventoId (admin)`);
});

module.exports = app;