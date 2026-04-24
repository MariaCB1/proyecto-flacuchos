-- Migration 003: Tablas del sistema
-- Fecha: 2026-04-20
-- Proyecto: Protectora Flacuchos

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE usuarios IS 'Usuarios del sistema (admin y adoptantes)';
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLA: ANIMALES
-- ============================================
DROP TABLE IF EXISTS animales CASCADE;
CREATE TABLE animales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
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

COMMENT ON TABLE animales IS 'Animales en el sistema de adopción';
ALTER TABLE animales ENABLE ROW LEVEL SECURITY;

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
    -- Devolución (multiselect almacenado como texto)
    motivos_devolucion TEXT,
    -- Adopción alternativa
    adoptaria_otro_animal TEXT,
    -- Origen
    como_conocio TEXT,
    -- Estado
    estado estado_solicitud DEFAULT 'pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE solicitudes_adopcion IS 'Solicitudes de adopción completas';
ALTER TABLE solicitudes_adopcion ENABLE ROW LEVEL SECURITY;

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

COMMENT ON TABLE adopciones IS 'Registro de adopciones finalizadas';
ALTER TABLE adopciones ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLA: NOTICIAS
-- ============================================
DROP TABLE IF EXISTS noticias CASCADE;
CREATE TABLE noticias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    contenido TEXT,
    imagen_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE noticias IS 'Noticias de la protectora';
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLA: EVENTOS
-- ============================================
DROP TABLE IF EXISTS eventos CASCADE;
CREATE TABLE eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    imagen_url TEXT,
    ubicacion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE eventos IS 'Eventos de la protectora';
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

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

COMMENT ON TABLE solicitud_socio IS 'Solicitudes de socio/anuario';
ALTER TABLE solicitud_socio ENABLE ROW LEVEL SECURITY;

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
    vacuna TEXT,
    disponibilidad disponibilidad_acogida,
    horas_solo TEXT,
    tipo_animal_acoger TEXT,
    experiencia_previa BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE solicitud_casa_acogida IS 'Solicitudes de casa de acogida';
ALTER TABLE solicitud_casa_acogida ENABLE ROW LEVEL SECURITY;

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

COMMENT ON TABLE mensajes_contacto IS 'Mensajes del formulario de contacto';
ALTER TABLE mensajes_contacto ENABLE ROW LEVEL SECURITY;

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

COMMENT ON TABLE notificaciones IS 'Sistema de notificaciones del sistema';
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;