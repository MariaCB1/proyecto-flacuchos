-- Seeds adicionales: Datos de ejemplo para desarrollo
-- Fecha: 2026-04-20

-- ============================================
-- USUARIOS DE EJEMPLO
-- ============================================
-- Contraseñas hardcodeadas SOLO para desarrollo local.
-- En producción, usar database/seed.js con variables de entorno.
INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES
('Juan Pérez', 'juan@example.com', crypt('password123', gen_salt('bf')), 'usuario'),
('María García', 'maria@example.com', crypt('password123', gen_salt('bf')), 'usuario'),
('Carlos López', 'carlos@example.com', crypt('password123', gen_salt('bf')), 'usuario')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- ANIMALES ADICIONALES
-- ============================================
INSERT INTO animales (nombre, edad, tamano, caracter, salud, peso, urgente, estado) VALUES
('Sultan', '7 años', 'grande', 'Calmado y companion', 'Esterilizado, buena salud', 30.0, false, 'disponible'),
('Kira', '1 año', 'mediano', 'Energética y juguetona', 'Vacunada, en tratamiento', 16.0, true, 'disponible'),
('Max', '10 años', 'mediano', 'Senior tranquilo', 'Articulaciones, medicación', 20.0, false, 'disponible'),
('Luna', '2 años', 'pequeño', 'Cariñosa', 'Sana', 7.5, false, 'adoptado'),
('Duke', '3 años', 'grande', 'Activo', 'Castrado', 35.0, false, 'disponible'),
('Coco', '5 meses', 'pequeño', 'Curioso', 'Vacunas al día', 4.0, true, 'disponible');

-- ============================================
-- NOTICIAS ADICIONALES
-- ============================================
INSERT INTO noticias (titulo, contenido) VALUES
('Celebramos nuestro 10º aniversario', 'Diez años salvando vidas de animales juntos. ¡Gracias a todos!'),
('Nuevo refugio inaugurado', 'Hemos ampliado nuestras instalaciones para dar mejor atención a más animales'),
('Campaña de esterilización', 'Ofrecemos servicios de esterilización a bajo costo para prevenir abandonos');

-- ============================================
-- EVENTOS ADICIONALES
-- ============================================
INSERT INTO eventos (titulo, descripcion, fecha, ubicacion) VALUES
('Charla sobre tenencia responsable', 'Aprende todo lo que necesitas saber antes de adoptar', '2026-07-10', 'Biblioteca Municipal'),
('Fiesta de verano', 'Diviértete con nosotros y nuestros peludos', '2026-07-25', 'Jardín Botánico'),
('Taller de educación canina', 'Clases gratuitas de adiestramiento básico', '2026-08-05', 'Parque Central');

-- ============================================
-- MENSAJES DE CONTACTO DE EJEMPLO
-- ============================================
INSERT INTO mensajes_contacto (nombre, email, telefono, mensaje, tipo_consulta) VALUES
('Ana Martínez', 'ana@email.com', '612345678', 'Me interesa adoptar un perro pequeño', 'adopcion'),
('Pedro Sánchez', 'pedro@email.com', '698765432', 'Quiero ser voluntario', 'voluntariado'),
('Laura Rodríguez', 'laura@email.com', '654321987', 'Información sobre apadrinamiento', 'apadrinamiento'),
('Miguel Torres', 'miguel@email.com', NULL, '¿Tienen gatos disponibles?', 'informacion');