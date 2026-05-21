-- Migration 005: Triggers y Funciones
-- Fecha: 2026-04-20
-- Proyecto: Protectora Flacuchos

-- ============================================
-- FUNCIÓN: Notificar nueva solicitud de adopción
-- ============================================
CREATE OR REPLACE FUNCTION fn_notificar_nueva_solicitud_adopcion()
RETURNS TRIGGER AS $$
BEGIN
    -- Notificar a todos los admins
    INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
    SELECT
        u.id,
        'solicitud_adopcion',
        'Nueva solicitud de adopción para ' || COALESCE(a.nombre, 'un animal'),
        NEW.id
    FROM usuarios u
    CROSS JOIN animales a
    WHERE u.rol = 'admin'
    AND a.id = NEW.animal_id;

    -- Notificar al usuario solicitante
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
    FOR EACH ROW
    EXECUTE FUNCTION fn_notificar_nueva_solicitud_adopcion();

-- ============================================
-- FUNCIÓN: Notificar cambio de estado en solicitud
-- ============================================
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
    FOR EACH ROW
    EXECUTE FUNCTION fn_notificar_cambio_estado_adopcion();

-- ============================================
-- FUNCIÓN: Notificar nueva solicitud de socio
-- ============================================
CREATE OR REPLACE FUNCTION fn_notificar_nueva_solicitud_socio()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
    SELECT u.id, 'solicitud_socio', 'Nueva solicitud de socio recibida', NEW.id
    FROM usuarios u
    WHERE u.rol = 'admin';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_nueva_solicitud_socio ON solicitud_socio;
CREATE TRIGGER trg_nueva_solicitud_socio
    AFTER INSERT ON solicitud_socio
    FOR EACH ROW
    EXECUTE FUNCTION fn_notificar_nueva_solicitud_socio();

-- ============================================
-- FUNCIÓN: Notificar nueva solicitud de acogida
-- ============================================
CREATE OR REPLACE FUNCTION fn_notificar_nueva_solicitud_acogida()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
    SELECT u.id, 'solicitud_acogida', 'Nueva solicitud de casa de acogida recibida', NEW.id
    FROM usuarios u
    WHERE u.rol = 'admin';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_nueva_solicitud_acogida ON solicitud_casa_acogida;
CREATE TRIGGER trg_nueva_solicitud_acogida
    AFTER INSERT ON solicitud_casa_acogida
    FOR EACH ROW
    EXECUTE FUNCTION fn_notificar_nueva_solicitud_acogida();

-- ============================================
-- FUNCIÓN: Notificar nuevo mensaje de contacto
-- ============================================
CREATE OR REPLACE FUNCTION fn_notificar_nuevo_mensaje_contacto()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id)
    SELECT u.id, 'mensaje_contacto', 'Nuevo mensaje de contacto de: ' || NEW.nombre, NEW.id
    FROM usuarios u
    WHERE u.rol = 'admin';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_nuevo_mensaje_contacto ON mensajes_contacto;
CREATE TRIGGER trg_nuevo_mensaje_contacto
    AFTER INSERT ON mensajes_contacto
    FOR EACH ROW
    EXECUTE FUNCTION fn_notificar_nuevo_mensaje_contacto();

-- ============================================
-- FUNCIÓN: Actualizar timestamp en tablas
-- ============================================
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers de timestamp para todas las tablas principales
DROP TRIGGER IF EXISTS trg_usuarios_timestamp ON usuarios;
CREATE TRIGGER trg_usuarios_timestamp
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_animales_timestamp ON animales;
CREATE TRIGGER trg_animales_timestamp
    BEFORE UPDATE ON animales
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_solicitudes_timestamp ON solicitudes_adopcion;
CREATE TRIGGER trg_solicitudes_timestamp
    BEFORE UPDATE ON solicitudes_adopcion
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();