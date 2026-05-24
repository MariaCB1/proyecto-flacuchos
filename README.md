# Flacuchos

Plataforma web completa para la gestión de una protectora de animales sin ánimo de lucro.
Cubre adopciones, casas de acogida, apadrinamiento económico, socios mensuales,
donaciones, voluntariado, eventos, noticias y transparencia financiera.

---

## Características Principales

- **Adopciones** — Catálogo público con filtros, solicitud de 60+ campos, aprobación o rechazo por admin
- **Casas de Acogida** — Solicitud, asignación de animal, aceptación o rechazo por el usuario
- **Apadrinamiento** — Suscripción mensual por animal con cobros automáticos vía Stripe
- **Socios** — Cuota mensual recurrente con tarjeta o SEPA y gestión de cancelaciones
- **Donaciones** — Puntuales con Stripe, importes predefinidos o personalizados
- **Voluntariado** — Registro con disponibilidad y estado activo o inactivo
- **Eventos** — CRUD completo, inscripciones de usuarios y notificaciones por email
- **Noticias** — CRUD con lightbox, zoom progresivo, arrastre y notificaciones push
- **Dashboard Admin** — Resumen económico con gráfico de ingresos a 12 meses
- **Notificaciones** — 34 tipos con campana en el header y panel dedicado
- **Autenticación** — JWT, verificación de email, recuperación de contraseña, roles admin y usuario

## Tecnologías Utilizadas

| Frontend | Backend | Base de datos | Pagos |
|----------|---------|---------------|-------|
| React 19 | Express 4 | PostgreSQL 15 | Stripe 22 |
| Vite 8 | JWT + bcryptjs | Supabase | Cards y SEPA |
| React Router 7 | Joi + Multer | node-pg | Webhooks |

Email con Nodemailer · Storage con Supabase · Cron con node-cron

## Requisitos Previos

- Node.js 18 o superior
- PostgreSQL 15 (o una instancia en Supabase)
- Cuenta de Stripe con clave pública y secreta
- Cuenta de Supabase para almacenamiento de imágenes y PDFs
- Cuenta SMTP para el envío de correos electrónicos

## Instalación y Uso

```bash
# Clonar el repositorio
git clone <repo-url>
cd proyecto-flacuchos

# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..

# Configurar variables de entorno
cp backend/.env.example backend/.env
# Edita backend/.env con tus credenciales:
#   DATABASE_URL, STRIPE_SECRET_KEY, SUPABASE_URL, etc.

# Inicializar la base de datos
psql $DATABASE_URL < database/schema.sql
node database/seed.js

# Iniciar el backend (puerto 3001)
cd backend && npm start

# En otra terminal, iniciar el frontend (puerto 5173)
cd proyecto-flacuchos && npm run dev
```

### Credenciales por defecto

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@flacuchos.org | admin123 | admin |

## Colaboradores

- **María** — Code review, validación de PRs y aseguramiento de calidad
- **Francisco** — Desarrollo full-stack (autor de los commits)

> Ambos trabajaron en el mismo equipo durante todo el desarrollo del proyecto, es debido a eso que aparece solo un autor en los commits.
