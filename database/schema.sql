-- ============================================
-- ESQUEMA COMPLETO: PROTECTORA FLACUCHOS
-- PostgreSQL compatible con Supabase
-- Única fuente de verdad para el esquema de base de datos
-- Solamente estructura (tablas, enums, índices, triggers, funciones).
-- Los datos de ejemplo están en seed_datos_ejemplo.sql y seed.js
-- ============================================

-- ============================================
-- EXTENSIONES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================
DROP TYPE IF EXISTS rol_usuario CASCADE;
CREATE TYPE rol_usuario AS ENUM ('admin', 'usuario');

DROP TYPE IF EXISTS estado_animal CASCADE;
CREATE TYPE estado_animal AS ENUM ('disponible', 'adoptado');

DROP TYPE IF EXISTS estado_solicitud CASCADE;
CREATE TYPE estado_solicitud AS ENUM ('pending', 'approved', 'rejected');

DROP TYPE IF EXISTS tipo_vivienda_acogida CASCADE;
CREATE TYPE tipo_vivienda_acogida AS ENUM ('piso', 'casa', 'otro');

DROP TYPE IF EXISTS propiedad_vivienda CASCADE;
CREATE TYPE propiedad_vivienda AS ENUM ('propia', 'alquiler');

DROP TYPE IF EXISTS disponibilidad_acogida CASCADE;
CREATE TYPE disponibilidad_acogida AS ENUM ('dias', 'semanas', 'meses', 'indefinido');

DROP TYPE IF EXISTS tipo_notificacion CASCADE;
CREATE TYPE tipo_notificacion AS ENUM (
    'solicitud_adopcion',
    'cambio_estado',
    'solicitud_socio',
    'solicitud_acogida',
    'mensaje_contacto',
    'sistema',
    'solicitud_rechazada',
    'solicitud_aprobada',
    'solicitud_eliminada',
    'nueva_noticia',
    'nuevo_evento',
    'evento_cancelado',
    'solicitud_inscripcion',
    'inscripcion_cancelada',
    'evento_modificado',
    'solicitud_acogida_aprobada',
    'solicitud_acogida_asignada',
    'solicitud_acogida_aceptada',
    'donacion_exitosa',
    'donacion_cancelada',
    'donacion_pending',
    'solicitud_voluntario',
    'voluntario_registrado',
    'socio_aprobado',
    'nuevo_socio',
    'socio_cancelado',
    'socio_caido',
    'solicitud_apadrinamiento',
    'apadrinamiento_aprobado',
    'apadrinamiento_rechazado',
    'apadrinamiento_cancelado',
    'cobro_apadrinamiento',
    'solicitud_acogida_recibida',
    'solicitud_acogida_rechazada'
);

-- ============================================
-- TABLA: USUARIOS
-- ============================================
DROP TABLE IF EXISTS usuarios CASCADE;
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    contrasena TEXT NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'usuario',
    token_recuperacion TEXT,
    token_expiracion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    es_voluntario BOOLEAN DEFAULT FALSE,
    voluntario_activo BOOLEAN DEFAULT FALSE,
    es_socio BOOLEAN DEFAULT FALSE,
    email_verificado BOOLEAN DEFAULT FALSE,
    token_verificacion TEXT,
    token_verificacion_expiracion TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- TABLA: ANIMALES
-- ============================================
DROP TABLE IF EXISTS animales CASCADE;
CREATE TABLE animales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    especie TEXT CHECK (especie IN ('perro', 'gato')),
    edad TEXT NOT NULL,
    tamano TEXT CHECK (tamano IN ('pequeño', 'mediano', 'grande')),
    caracter TEXT,
    salud TEXT,
    imagen_url TEXT,
    peso DECIMAL(5,2),
    urgente BOOLEAN DEFAULT FALSE,
    estado estado_animal DEFAULT 'disponible',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    en_acogida BOOLEAN DEFAULT FALSE,
    nombre_padrino TEXT
);

-- ============================================
-- TABLA: SOLICITUDES_ADOPCION
-- ============================================
DROP TABLE IF EXISTS solicitudes_adopcion CASCADE;
CREATE TABLE solicitudes_adopcion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    animal_id UUID REFERENCES animales(id) ON DELETE SET NULL,
    nombre_perro TEXT,
    nombre_completo TEXT,
    fecha_nacimiento DATE,
    residencia TEXT,
    telefono TEXT,
    redes_sociales TEXT,
    tiempo_en_espana TEXT,
    posibilidad_regreso TEXT,
    plan_con_animal TEXT,
    personas_hogar INTEGER,
    convivencia_aceptada TEXT,
    ocupaciones_horarios TEXT,
    tipo_vivienda TEXT,
    metros_cuadrados INTEGER,
    es_alquiler BOOLEAN,
    permiso_propietario TEXT,
    tiene_exterior BOOLEAN,
    posibilidad_bebe TEXT,
    opinion_convivencia_bebes TEXT,
    en_separacion_quien_cuida TEXT,
    problema_ladridos TEXT,
    solucion_ladridos TEXT,
    plan_mudanza TEXT,
    lugar_dormir TEXT,
    restricciones_vivienda TEXT,
    tipo_cama TEXT,
    actividades TEXT,
    vacaciones_cuidado TEXT,
    paseos_dia INTEGER,
    duracion_paseos TEXT,
    necesidades_perro TEXT,
    coste_veterinario_opinion TEXT,
    cuando_veterinario TEXT,
    tipo_alimentacion TEXT,
    horas_solo TEXT,
    acepta_cambios_estimacion TEXT,
    relacion_con_perros TEXT,
    motivo_socializacion TEXT,
    gestion_problemas_conducta TEXT,
    necesidades TEXT,
    esterilizacion TEXT,
    ha_tenido_animales BOOLEAN,
    edad_animales TEXT,
    motivo_perdida TEXT,
    puede_asumir_costes TEXT,
    alternativa_costes TEXT,
    ha_visitado_refugio BOOLEAN,
    nombre_refugio TEXT,
    acepta_seguimiento BOOLEAN,
    acepta_tasa_adopcion BOOLEAN,
    motivos_devolucion TEXT,
    adoptaria_otro_animal TEXT,
    como_conocio TEXT,
    estado estado_solicitud DEFAULT 'pending',
    motivo_rechazo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    es_extranjero BOOLEAN DEFAULT FALSE,
    parentesco_personas TEXT
);

-- ============================================
-- TABLA: ADOPCIONES
-- ============================================
DROP TABLE IF EXISTS adopciones CASCADE;
CREATE TABLE adopciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitud_id UUID REFERENCES solicitudes_adopcion(id) ON DELETE SET NULL,
    animal_id UUID REFERENCES animales(id) ON DELETE SET NULL,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_adopcion DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: NOTICIAS
-- ============================================
DROP TABLE IF EXISTS noticias CASCADE;
CREATE TABLE noticias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    contenido TEXT,
    categoria TEXT DEFAULT 'General',
    imagen_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: EVENTOS
-- ============================================
DROP TABLE IF EXISTS eventos CASCADE;
CREATE TABLE eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    hora TEXT,
    ubicacion TEXT,
    precio TEXT DEFAULT 'Gratis',
    imagen_url TEXT,
    categoria TEXT DEFAULT 'Otro',
    estado TEXT DEFAULT 'activo',
    permitir_inscripcion BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: INSCRIPCIONES_EVENTO
-- ============================================
DROP TABLE IF EXISTS inscripciones_evento CASCADE;
CREATE TABLE inscripciones_evento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id),
    evento_id UUID REFERENCES eventos(id),
    estado TEXT DEFAULT 'confirmada',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: SOLICITUD_CASA_ACOGIDA
-- ============================================
DROP TABLE IF EXISTS solicitud_casa_acogida CASCADE;
CREATE TABLE solicitud_casa_acogida (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre_completo TEXT NOT NULL,
    dni TEXT NOT NULL,
    telefono TEXT NOT NULL,
    tipo_vivienda TEXT,
    otra_vivienda TEXT,
    vivienda_propia TEXT,
    permiso_alquiler BOOLEAN DEFAULT FALSE,
    tiene_exterior BOOLEAN DEFAULT FALSE,
    exterior_descripcion TEXT,
    otras_personas BOOLEAN DEFAULT FALSE,
    num_personas INTEGER,
    todos_de_acuerdo BOOLEAN DEFAULT FALSE,
    hay_ninos BOOLEAN DEFAULT FALSE,
    edad_ninos TEXT,
    tiene_otros_animales BOOLEAN DEFAULT FALSE,
    tipo_otros_animales TEXT,
    vaccinated_otros BOOLEAN DEFAULT FALSE,
    tiempo_acogida TEXT,
    horas_solo TEXT,
    tipo_animal TEXT,
    experiencia_previa BOOLEAN DEFAULT FALSE,
    experiencia_detalles TEXT,
    motivo_acogida TEXT,
    comentarios TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estado TEXT DEFAULT 'pending',
    motivo_rechazo TEXT,
    animal_id_asignado UUID REFERENCES animales(id),
    animal_asignado_id UUID REFERENCES animales(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: MENSAJES_CONTACTO
-- ============================================
DROP TABLE IF EXISTS mensajes_contacto CASCADE;
CREATE TABLE mensajes_contacto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    mensaje TEXT,
    tipo_consulta TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: NOTIFICACIONES
-- ============================================
DROP TABLE IF EXISTS notificaciones CASCADE;
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    tipo tipo_notificacion NOT NULL,
    mensaje TEXT NOT NULL,
    referencia_id UUID,
    leido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: SOCIOS
-- ============================================
DROP TABLE IF EXISTS socios CASCADE;
CREATE TABLE socios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    stripe_subscription_id TEXT NOT NULL,
    stripe_customer_id TEXT,
    stripe_price_id TEXT NOT NULL,
    dni_nie TEXT,
    telefono TEXT,
    direccion TEXT,
    codigo_postal TEXT,
    ciudad_provincia TEXT,
    aportacion INTEGER NOT NULL,
    metodo_pago TEXT NOT NULL DEFAULT 'card',
    estado TEXT NOT NULL DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    canceled_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- TABLA: DONACIONES
-- ============================================
DROP TABLE IF EXISTS donaciones CASCADE;
CREATE TABLE donaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    stripe_payment_id TEXT NOT NULL,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    tipo TEXT DEFAULT 'puntual',
    estado TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: DOCUMENTOS_TRANSPARENCIA
-- ============================================
DROP TABLE IF EXISTS documentos_transparencia CASCADE;
CREATE TABLE documentos_transparencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT UNIQUE NOT NULL,
    titulo TEXT NOT NULL,
    contenido TEXT,
    archivo_url TEXT,
    botones_json JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: JUSTIFICANTES_GASTOS
-- ============================================
DROP TABLE IF EXISTS justificantes_gastos CASCADE;
CREATE TABLE justificantes_gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    año INTEGER NOT NULL,
    concepto TEXT NOT NULL,
    importe DECIMAL(12,2) NOT NULL,
    archivo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: APADRINAMIENTOS
-- ============================================
DROP TABLE IF EXISTS apadrinamientos CASCADE;
CREATE TABLE apadrinamientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    animal_id UUID REFERENCES animales(id) ON DELETE SET NULL,
    stripe_payment_id TEXT,
    stripe_customer_id TEXT,
    stripe_payment_method_id TEXT,
    importe DECIMAL(10,2) NOT NULL,
    dni_nie TEXT,
    telefono TEXT,
    mostrar_publico BOOLEAN DEFAULT FALSE,
    estado TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    canceled_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- TABLA: COBROS_APADRINAMIENTO
-- ============================================
DROP TABLE IF EXISTS cobros_apadrinamiento CASCADE;
CREATE TABLE cobros_apadrinamiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apadrinamiento_id UUID REFERENCES apadrinamientos(id) ON DELETE CASCADE,
    stripe_payment_id TEXT,
    monto DECIMAL(10,2) NOT NULL,
    estado TEXT DEFAULT 'pending',
    fecha_cobro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: VOLUNTARIOS
-- ============================================
DROP TABLE IF EXISTS voluntarios CASCADE;
CREATE TABLE voluntarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    telefono TEXT NOT NULL,
    dni TEXT NOT NULL,
    disponibilidad_dias TEXT,
    disponibilidad_horario TEXT,
    tiene_vehiculo BOOLEAN DEFAULT FALSE,
    motivacion TEXT,
    experiencia TEXT,
    comentarios TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_es_socio ON usuarios(es_socio);

CREATE INDEX IF NOT EXISTS idx_animales_estado ON animales(estado);
CREATE INDEX IF NOT EXISTS idx_animales_urgente ON animales(urgente);
CREATE INDEX IF NOT EXISTS idx_animales_en_acogida ON animales(en_acogida);

CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario ON solicitudes_adopcion(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_animal ON solicitudes_adopcion(animal_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_adopcion(estado);

CREATE INDEX IF NOT EXISTS idx_adopciones_solicitud ON adopciones(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_adopciones_fecha ON adopciones(fecha_adopcion);

CREATE INDEX IF NOT EXISTS idx_noticias_created_at ON noticias(created_at);

CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);

CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leido ON notificaciones(leido);

CREATE INDEX IF NOT EXISTS idx_socios_usuario ON socios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_socios_estado ON socios(estado);
CREATE INDEX IF NOT EXISTS idx_socios_stripe ON socios(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_solicitud_acogida_estado ON solicitud_casa_acogida(estado);
CREATE INDEX IF NOT EXISTS idx_solicitud_acogida_animal_asignado ON solicitud_casa_acogida(animal_id_asignado);

CREATE INDEX IF NOT EXISTS idx_inscripciones_evento_usuario ON inscripciones_evento(usuario_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_evento_evento ON inscripciones_evento(evento_id);

CREATE INDEX IF NOT EXISTS idx_donaciones_usuario ON donaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_donaciones_estado ON donaciones(estado);
CREATE INDEX IF NOT EXISTS idx_donaciones_stripe ON donaciones(stripe_payment_id);

CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos_transparencia(tipo);

CREATE INDEX IF NOT EXISTS idx_justificantes_año ON justificantes_gastos(año);

CREATE INDEX IF NOT EXISTS idx_apadrinamientos_usuario ON apadrinamientos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_apadrinamientos_animal ON apadrinamientos(animal_id);
CREATE INDEX IF NOT EXISTS idx_apadrinamientos_estado ON apadrinamientos(estado);

CREATE INDEX IF NOT EXISTS idx_cobros_apadrinamiento ON cobros_apadrinamiento(apadrinamiento_id);

CREATE INDEX IF NOT EXISTS idx_voluntarios_usuario ON voluntarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_voluntarios_created_at ON voluntarios(created_at);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función: actualizar timestamp
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger timestamp usuarios
DROP TRIGGER IF EXISTS trg_usuarios_timestamp ON usuarios;
CREATE TRIGGER trg_usuarios_timestamp
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- Trigger timestamp animales
DROP TRIGGER IF EXISTS trg_animales_timestamp ON animales;
CREATE TRIGGER trg_animales_timestamp
    BEFORE UPDATE ON animales
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- Trigger timestamp solicitudes
DROP TRIGGER IF EXISTS trg_solicitudes_timestamp ON solicitudes_adopcion;
CREATE TRIGGER trg_solicitudes_timestamp
    BEFORE UPDATE ON solicitudes_adopcion
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- Trigger timestamp voluntarios
DROP TRIGGER IF EXISTS trg_voluntarios_timestamp ON voluntarios;
CREATE TRIGGER trg_voluntarios_timestamp
    BEFORE UPDATE ON voluntarios
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- Función: notificar nueva solicitud adopción
CREATE OR REPLACE FUNCTION fn_notificar_nueva_solicitud_adopcion()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
    SELECT u.id, 'solicitud_adopcion',
           'Nueva solicitud de adopción para ' || COALESCE(a.nombre, 'un animal'),
           NEW.id
    FROM usuarios u, animales a
    WHERE u.rol = 'admin'
    AND a.id = NEW.animal_id;

    INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
    VALUES (
        NEW.usuario_id,
        'solicitud_adopcion',
        'Tu solicitud de adopción ha sido enviada correctamente',
        NEW.id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_nueva_solicitud_adopcion ON solicitudes_adopcion;
CREATE TRIGGER trg_nueva_solicitud_adopcion
    AFTER INSERT ON solicitudes_adopcion
    FOR EACH ROW EXECUTE FUNCTION fn_notificar_nueva_solicitud_adopcion();

-- Función: notificar cambio estado
CREATE OR REPLACE FUNCTION fn_notificar_cambio_estado_adopcion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
        VALUES (
            NEW.usuario_id,
            CASE
                WHEN NEW.estado = 'approved' THEN 'solicitud_aprobada'::tipo_notificacion
                WHEN NEW.estado = 'rejected' THEN 'solicitud_rechazada'::tipo_notificacion
                ELSE 'cambio_estado'::tipo_notificacion
            END,
            CASE
                WHEN NEW.estado = 'approved' THEN '¡Tu solicitud de adopción ha sido aprobada!'
                WHEN NEW.estado = 'rejected' THEN 'Tu solicitud de adopción ha sido rechazada'
                ELSE 'Tu solicitud de adopción ha sido: ' || NEW.estado
            END,
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_cambio_estado_adopcion ON solicitudes_adopcion;
CREATE TRIGGER trg_cambio_estado_adopcion
    AFTER UPDATE OF estado ON solicitudes_adopcion
    FOR EACH ROW EXECUTE FUNCTION fn_notificar_cambio_estado_adopcion();

-- Función: notificar nueva solicitud socio
CREATE OR REPLACE FUNCTION fn_notificar_nueva_solicitud_socio()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
    SELECT u.id, 'solicitud_socio', 'Nueva solicitud de socio recibida', NEW.id
    FROM usuarios u WHERE u.rol = 'admin';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_nueva_solicitud_socio ON solicitud_socio;
CREATE TRIGGER trg_nueva_solicitud_socio
    AFTER INSERT ON solicitud_socio
    FOR EACH ROW EXECUTE FUNCTION fn_notificar_nueva_solicitud_socio();

-- Función: notificar nueva solicitud acogida
CREATE OR REPLACE FUNCTION fn_notificar_nueva_solicitud_acogida()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
    SELECT u.id, 'solicitud_acogida', 'Nueva solicitud de casa de acogida', NEW.id
    FROM usuarios u WHERE u.rol = 'admin';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_nueva_solicitud_acogida ON solicitud_casa_acogida;
CREATE TRIGGER trg_nueva_solicitud_acogida
    AFTER INSERT ON solicitud_casa_acogida
    FOR EACH ROW EXECUTE FUNCTION fn_notificar_nueva_solicitud_acogida();

-- Función: notificar nuevo mensaje contacto
CREATE OR REPLACE FUNCTION fn_notificar_nuevo_mensaje_contacto()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
    SELECT u.id, 'mensaje_contacto', 'Nuevo mensaje de: ' || NEW.nombre, NEW.id
    FROM usuarios u WHERE u.rol = 'admin';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_nuevo_mensaje_contacto ON mensajes_contacto;
CREATE TRIGGER trg_nuevo_mensaje_contacto
    AFTER INSERT ON mensajes_contacto
    FOR EACH ROW EXECUTE FUNCTION fn_notificar_nuevo_mensaje_contacto();

-- Función: notificar nueva solicitud voluntario
CREATE OR REPLACE FUNCTION fn_notificar_nueva_solicitud_voluntario()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
    SELECT u.id, 'solicitud_voluntario', 'Nueva solicitud de voluntariado de: ' || NEW.nombre, NEW.id
    FROM usuarios u WHERE u.rol = 'admin';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_nueva_solicitud_voluntario ON voluntarios;
CREATE TRIGGER trg_nueva_solicitud_voluntario
    AFTER INSERT ON voluntarios
    FOR EACH ROW EXECUTE FUNCTION fn_notificar_nueva_solicitud_voluntario();

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================
