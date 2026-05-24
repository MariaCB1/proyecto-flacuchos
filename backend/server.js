require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
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
const transparenciaRoutes = require('./routes/transparencia.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/usuarios', userRoutes);
app.use('/notificaciones', notificationRoutes);
app.use('/upload', uploadRoutes);
app.use('/contacto', contactoRoutes);
app.use('/eventos', eventosRoutes);
app.use('/inscripciones', inscripcionesRoutes);
app.use('/stripe', stripeRoutes);
app.use('/socios', socioRoutes);
app.use('/voluntarios', voluntarioRoutes);
app.use('/transparencia', transparenciaRoutes);
app.use('/', animalRoutes);
app.use('/', noticiaRoutes);

const apadrinamientoRoutes = require('./routes/apadrinamiento.routes');
const resumenRoutes = require('./routes/resumen.routes');
app.use('/apadrinamientos', apadrinamientoRoutes);
app.use('/admin', resumenRoutes);

cron.schedule('0 8 1 * *', async () => {
  try {
    const apadrinamientoService = require('./services/apadrinamiento.service');
    const resultados = await apadrinamientoService.ejecutarCobrosMensuales();
  } catch (err) {
    console.error('❌ Error en cobro mensual:', err.message);
  }
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;