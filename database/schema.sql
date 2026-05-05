-- ============================================
-- ESQUEMA COMPLETO: PROTECTORA FLACUCHOS
-- PostgreSQL compatible con Supabase
-- Fecha: 2026-04-20
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
    'nueva_noticia'
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: SOLICITUDES_ADOPCION
-- ============================================
DROP TABLE IF EXISTS solicitudes_adopcion CASCADE;
CREATE TABLE solicitudes_adopcion (
    -- Datos generales
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    animal_id UUID REFERENCES animales(id) ON DELETE SET NULL,
    nombre_perro TEXT,
    -- Datos personales
    nombre_completo TEXT,
    fecha_nacimiento DATE,
    residencia TEXT,
    telefono TEXT,
    redes_sociales TEXT,
    -- Extranjeros
    tiempo_en_espana TEXT,
    posibilidad_regreso TEXT,
    plan_con_animal TEXT,
    -- Unidad familiar
    personas_hogar INTEGER,
    convivencia_aceptada TEXT,
    ocupaciones_horarios TEXT,
    -- Vivienda
    tipo_vivienda TEXT,
    metros_cuadrados INTEGER,
    es_alquiler BOOLEAN,
    permiso_propietario TEXT,
    tiene_exterior BOOLEAN,
    -- Familia y futuro
    posibilidad_bebe TEXT,
    opinion_convivencia_bebes TEXT,
    en_separacion_quien_cuida TEXT,
    -- Convivencia
    problema_ladridos TEXT,
    solucion_ladridos TEXT,
    plan_mudanza TEXT,
    -- Vida del animal
    lugar_dormir TEXT,
    restricciones_vivienda TEXT,
    tipo_cama TEXT,
    actividades TEXT,
    vacaciones_cuidado TEXT,
    -- Cuidados
    paseos_dia INTEGER,
    duracion_paseos TEXT,
    necesidades_perro TEXT,
    coste_veterinario_opinion TEXT,
    cuando_veterinario TEXT,
    -- Alimentación
    tipo_alimentacion TEXT,
    -- Tiempo solo
    horas_solo TEXT,
    -- Adaptabilidad
    acepta_cambios_estimacion TEXT,
    -- Socialización
    relacion_con_perros TEXT,
    motivo_socializacion TEXT,
    -- Comportamiento
    gestion_problemas_conducta TEXT,
    -- Educación
    problema_necesidades TEXT,
    solucion_necesidades TEXT,
    -- Esterilización
    opinion_esterilizacion TEXT,
    plan_esterilizacion TEXT,
    -- Historial
    ha_tenido_animales BOOLEAN,
    edad_animales TEXT,
    motivo_perdida TEXT,
    -- Economía
    puede_asumir_costes TEXT,
    alternativa_costes TEXT,
    -- Experiencia
    ha_visitado_refugio BOOLEAN,
    nombre_refugio TEXT,
    -- Seguimiento
    acepta_seguimiento BOOLEAN,
    -- Costes
    acepta_tasa_adopcion BOOLEAN,
    -- Devolución
    motivos_devolucion TEXT,
    -- Adopción alternativa
    adoptaria_otro_animal TEXT,
    -- Origen
    como_conocio TEXT,
    -- Estado
    estado estado_solicitud DEFAULT 'pending',
    motivo_rechazo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
-- TABLA: SOLICITUD_SOCIO
-- ============================================
DROP TABLE IF EXISTS solicitud_socio CASCADE;
CREATE TABLE solicitud_socio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    direccion TEXT,
    codigo_postal TEXT,
    ciudad_provincia TEXT,
    aportacion TEXT,
    participacion BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: SOLICITUD_CASA_ACOGIDA
-- ============================================
DROP TABLE IF EXISTS solicitud_casa_acogida CASCADE;
CREATE TABLE solicitud_casa_acogida (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    tipo_vivienda tipo_vivienda_acogida,
    propiedad_vivienda propiedad_vivienda,
    animales BOOLEAN DEFAULT FALSE,
    espacio_extra BOOLEAN DEFAULT FALSE,
    mas_personas BOOLEAN DEFAULT FALSE,
    concordia BOOLEAN DEFAULT FALSE,
    ninos BOOLEAN DEFAULT FALSE,
    otros_animales BOOLEAN DEFAULT FALSE,
    tipo_animal TEXT,
    vacunas BOOLEAN DEFAULT FALSE,
    disponibilidad disponibilidad_acogida,
    horas_solo TEXT,
    tipo_animal_acoger TEXT,
    experiencia_previa BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
-- ÍNDICES
-- ============================================
-- Usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- Animales
CREATE INDEX IF NOT EXISTS idx_animales_estado ON animales(estado);
CREATE INDEX IF NOT EXISTS idx_animales_urgente ON animales(urgente);

-- Solicitudes adopción
CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario ON solicitudes_adopcion(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_animal ON solicitudes_adopcion(animal_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_adopcion(estado);

-- Adopciones
CREATE INDEX IF NOT EXISTS idx_adopciones_solicitud ON adopciones(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_adopciones_fecha ON adopciones(fecha_adopcion);

-- Noticias
CREATE INDEX IF NOT EXISTS idx_noticias_created_at ON noticias(created_at);

-- Eventos
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);

-- Notificaciones
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leido ON notificaciones(leido);

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
DECLARE
    mensaje TEXT;
    tipo_notif tipo_notificacion;
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        IF NEW.estado = 'approved' THEN
            tipo_notif := 'solicitud_aprobada'::tipo_notificacion;
            mensaje := '¡Enhorabuena! Tu solicitud de adopción ha sido aprobada. Por favor, contacta con nosotros para formalizar la adopción.';
        ELSIF NEW.estado = 'rejected' THEN
            tipo_notif := 'solicitud_rechazada'::tipo_notificacion;
            IF NEW.motivo_rechazo IS NOT NULL AND NEW.motivo_rechazo != '' THEN
                mensaje := 'Tu solicitud de adopción ha sido rechazada. Motivo: ' || NEW.motivo_rechazo;
            ELSE
                mensaje := 'Tu solicitud de adopción ha sido rechazada.';
            END IF;
        ELSE
            tipo_notif := 'cambio_estado'::tipo_notificacion;
            mensaje := 'Tu solicitud ha sido: ' || NEW.estado;
        END IF;
        
        INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
        VALUES (NEW.usuario_id, tipo_notif, mensaje, NEW.id);
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

-- ============================================
-- SEEDS: USUARIO ADMIN Y DATOS EJEMPLO
-- ============================================

-- Usuario administrador
INSERT INTO usuarios (nombre, email, contrasena, rol)
VALUES ('Admin', 'admin@flacuchos.org', crypt('admin123', gen_salt('bf')), 'admin')
ON CONFLICT (email) DO NOTHING;

-- Animales de ejemplo
INSERT INTO animales (nombre, especie, edad, tamano, caracter, salud, peso, urgente, estado, imagen_url) VALUES
('Luna', 'perro', '2 años', 'mediano', 'Juguetona, cariñosa, activa', 'Vacunada, desparasitada', 15.5, false, 'disponible', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'),
('Rocky', 'perro', '5 años', 'grande', 'Tranquilo, leal, protector', 'Vacunado, esterilizado', 32.0, true, 'disponible', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400'),
('Maya', 'gato', '8 meses', 'pequeño', 'Activa, curiosa, mimosa', 'Vacunada, sin esterilizar', 8.0, false, 'disponible', 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=400'),
('Thor', 'perro', '4 años', 'grande', 'Protector, noble, inteligente', 'Vacunado, microchipado', 28.5, false, 'disponible', 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400'),
('Nala', 'gato', '3 años', 'mediano', 'Dulce, observadora, independiente', 'Vacunada, desparasitada', 18.0, true, 'disponible', 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400'),
('Buddy', 'perro', '6 años', 'mediano', 'Sociable, amigable, juguetón', 'Vacunado, castrado', 22.0, false, 'adoptado', 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=400'),
('Luna', 'gato', '1 año', 'pequeño', 'Juguetona, cariñosa', 'Vacunada', 4.0, false, 'disponible', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400'),
('Max', 'perro', '3 años', 'mediano', 'Energético, leal', 'Vacunado, castrado', 20.0, false, 'disponible', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'),
('Miranda', 'gato', '5 años', 'mediano', 'Tranquila, afectuosa', 'Vacunada, esterilizada', 4.5, false, 'disponible', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'),
('Killer', 'perro', '2 años', 'grande', 'Afectuoso, protector', 'Vacunado', 30.0, true, 'disponible', 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400');

-- Noticias de ejemplo
INSERT INTO noticias (titulo, contenido, imagen_url) VALUES
('Nueva campaña de adopción', 'Este fin de semana tendremos nuestra campaña de adopción en la plaza central. ¡Ven a conocernos!', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400'),
('Necesitamos voluntarios', 'Buscamos personas comprometidas para ayudar en el refugio. ¡Únete a nuestro equipo!', 'https://images.unsplash.com/photo-1593137137816-d5232b25230c?w=400'),
('Gracias a nuestros padrinos', 'Agradecemos a todas las personas que apadrinan a nuestros peludos. ¡Sois fundamentales!', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400');

-- Eventos de ejemplo
INSERT INTO eventos (titulo, descripcion, fecha, hora, ubicacion, precio, categoria, imagen_url, permitir_inscripcion) VALUES
('Jornada de adopción', 'Ven a conocer a nuestros amigos peludos y encuentra tu compañero ideal', '2026-05-15', '11:00 - 18:00', 'Plaza del Pueblo', 'Gratis', 'Adopción', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400', TRUE),
('Mercadillo benéfico', 'Venta de productos hechos a mano para ayudar a los animales', '2026-06-01', '10:00 - 15:00', 'Centro Cultural', 'Gratis', 'Solidario', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', TRUE),
('Paseo con perros', 'Paseo gratuito con los perros del refugio', '2026-05-20', '10:00 - 12:00', 'Parque Municipal', 'Gratis', 'Otro', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', TRUE),
('Charla de adopción responsable', 'Charla informativa sobre la adopción responsável de mascotas. Aprende todo lo que necesitas saber antes de adoptar.', '2026-03-10', '18:00 - 20:00', 'Biblioteca Municipal', 'Gratis', 'Educativo', 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400', TRUE);

-- ============================================
-- TABLA: INSCRIPCIONES A EVENTOS
-- ============================================
DROP TABLE IF EXISTS inscripciones_evento CASCADE;
CREATE TABLE inscripciones_evento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
    estado TEXT DEFAULT 'confirmada',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inscripciones_evento_usuario ON inscripciones_evento(usuario_id);
CREATE INDEX idx_inscripciones_evento_evento ON inscripciones_evento(evento_id);

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================