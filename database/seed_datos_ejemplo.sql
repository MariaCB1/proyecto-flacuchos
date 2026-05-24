-- Seeds: Datos de ejemplo para desarrollo local
-- Todos los datos son ficticios y para pruebas únicamente

-- ============================================
-- USUARIOS DEMO
-- ============================================
INSERT INTO usuarios (id, nombre, email, contrasena, rol, es_voluntario, voluntario_activo, es_socio) VALUES
('a1000000-0000-0000-0000-000000000001', 'Juan Pérez', 'juan@example.com', crypt('password123', gen_salt('bf')), 'usuario', false, false, false),
('a1000000-0000-0000-0000-000000000002', 'María García', 'maria@example.com', crypt('password123', gen_salt('bf')), 'usuario', true, true, true),
('a1000000-0000-0000-0000-000000000003', 'Carlos López', 'carlos@example.com', crypt('password123', gen_salt('bf')), 'usuario', false, false, false),
('a1000000-0000-0000-0000-000000000004', 'Laura Martínez', 'laura@example.com', crypt('password123', gen_salt('bf')), 'usuario', true, true, false),
('a1000000-0000-0000-0000-000000000005', 'David Sánchez', 'david@example.com', crypt('password123', gen_salt('bf')), 'usuario', false, false, true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- ANIMALES
-- ============================================
INSERT INTO animales (id, nombre, especie, edad, tamano, caracter, salud, peso, urgente, estado, imagen_url, en_acogida, nombre_padrino) VALUES
('b1000000-0000-0000-0000-000000000001', 'Luna', 'perro', '2 años', 'mediano', 'Juguetona, cariñosa, activa', 'Vacunada, desparasitada, esterilizada', 15.5, false, 'disponible', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', false, NULL),
('b1000000-0000-0000-0000-000000000002', 'Rocky', 'perro', '5 años', 'grande', 'Tranquilo, leal, protector', 'Vacunado, esterilizado, buen estado general', 32.0, true, 'disponible', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', false, 'Carlos López'),
('b1000000-0000-0000-0000-000000000003', 'Maya', 'gato', '8 meses', 'pequeño', 'Activa, curiosa, mimosa', 'Vacunada, pendiente esterilización', 8.0, false, 'disponible', 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=400', true, NULL),
('b1000000-0000-0000-0000-000000000004', 'Thor', 'perro', '4 años', 'grande', 'Protector, noble, inteligente', 'Vacunado, microchipado, sano', 28.5, false, 'disponible', 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400', false, 'María García'),
('b1000000-0000-0000-0000-000000000005', 'Nala', 'gato', '3 años', 'mediano', 'Dulce, observadora, independiente', 'Vacunada, desparasitada, esterilizada', 18.0, true, 'disponible', 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400', false, NULL),
('b1000000-0000-0000-0000-000000000006', 'Buddy', 'perro', '6 años', 'mediano', 'Sociable, amigable, juguetón', 'Vacunado, castrado, sano', 22.0, false, 'adoptado', 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=400', false, NULL),
('b1000000-0000-0000-0000-000000000007', 'Max', 'perro', '3 años', 'mediano', 'Energético, leal, obediente', 'Vacunado, castrado', 20.0, false, 'disponible', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400', true, 'Laura Martínez'),
('b1000000-0000-0000-0000-000000000008', 'Miranda', 'gato', '5 años', 'mediano', 'Tranquila, afectuosa, sociable', 'Vacunada, esterilizada', 4.5, false, 'disponible', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', false, NULL),
('b1000000-0000-0000-0000-000000000009', 'Killer', 'perro', '2 años', 'grande', 'Afectuoso, protector, juguetón', 'Vacunado, pendiente castración', 30.0, true, 'disponible', 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400', false, 'Juan Pérez');

-- ============================================
-- NOTICIAS
-- ============================================
INSERT INTO noticias (id, titulo, contenido, categoria, imagen_url) VALUES
('c1000000-0000-0000-0000-000000000001', 'Bruno encuentra su hogar definitivo después de 2 años en el refugio', 'Bruno llegó al refugio muy deteriorado, con problemas de salud y muy temeroso de las personas. Después de 2 años de rehabilitación, hoy vive feliz con una familia que lo adora.', 'Final Feliz', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'),
('c1000000-0000-0000-0000-000000000002', 'Rescatados 12 gatos en situación de abandono', 'Gracias a la alerta de un vecino, nuestro equipo pudo rescatar a 12 gatos que vivían en condiciones muy precarias. Todos han sido atendidos y esterilizados.', 'Rescate', 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=400'),
('c1000000-0000-0000-0000-000000000003', 'Mercadillo solidario: recaudados más de 3.000€', 'El pasado fin de semana celebramos nuestro mercadillo solidario. Gracias a todos los voluntarios y asistentes por hacerlo posible.', 'Evento', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400'),
('c1000000-0000-0000-0000-000000000004', 'Max supera su operación con éxito', 'Max, nuestro caso más urgente, ha superado la operación de tumor con éxito. Ahora necesita recuperarse y buscar una familia.', 'Veterinario', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400'),
('c1000000-0000-0000-0000-000000000005', 'Nueva alianza con clínicas veterinarias', 'Hemos llegado a acuerdos con varias clínicas para ofrecer descuentos a los animales de nuestra protectora.', 'Colaboración', 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400');

-- ============================================
-- EVENTOS
-- ============================================
INSERT INTO eventos (id, titulo, descripcion, fecha, hora, ubicacion, precio, categoria, imagen_url, permitir_inscripcion) VALUES
('d1000000-0000-0000-0000-000000000001', 'Jornada de adopción', 'Ven a conocer a nuestros amigos peludos y encuentra tu compañero ideal', '2026-06-15', '11:00 - 18:00', 'Plaza del Pueblo', 'Gratis', 'Adopción', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400', true),
('d1000000-0000-0000-0000-000000000002', 'Mercadillo benéfico', 'Venta de productos artesanales para ayudar a los animales', '2026-07-01', '10:00 - 15:00', 'Centro Cultural', 'Gratis', 'Solidario', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', true),
('d1000000-0000-0000-0000-000000000003', 'Paseo con perros del refugio', 'Paseo gratuito con los perros del refugio, ven a conocerlos', '2026-06-20', '10:00 - 12:00', 'Parque Municipal', 'Gratis', 'Actividad', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', true),
('d1000000-0000-0000-0000-000000000004', 'Charla: Adopción responsable', 'Aprende todo lo que necesitas saber antes de adoptar una mascota', '2026-05-10', '18:00 - 20:00', 'Biblioteca Municipal', 'Gratis', 'Educativo', 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400', true),
('d1000000-0000-0000-0000-000000000005', 'Cena benéfica anual', 'Cena solidaria con sorteo de regalos para recaudar fondos', '2026-09-15', '21:00 - 23:30', 'Restaurante El Refugio', '35€', 'Solidario', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', true);

-- ============================================
-- INSCRIPCIONES A EVENTOS
-- ============================================
INSERT INTO inscripciones_evento (id, usuario_id, evento_id, estado) VALUES
('e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'confirmada'),
('e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'confirmada'),
('e1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 'confirmada');

-- ============================================
-- SOLICITUDES DE ADOPCIÓN
-- ============================================
INSERT INTO solicitudes_adopcion (id, usuario_id, animal_id, nombre_perro, nombre_completo, telefono, tipo_vivienda, personas_hogar, estado, es_extranjero, parentesco_personas, ha_tenido_animales, acepta_seguimiento) VALUES
('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'Nala', 'Juan Pérez', '612345678', 'piso', 2, 'pending', false, 'Pareja', true, true),
('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000009', 'Killer', 'Carlos López', '698765432', 'casa', 4, 'approved', false, 'Familia con hijos', true, true);

-- ============================================
-- ADOPCIONES
-- ============================================
INSERT INTO adopciones (id, solicitud_id, animal_id, usuario_id, fecha_adopcion) VALUES
('g1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', '2026-04-01');

-- ============================================
-- DONACIONES
-- ============================================
INSERT INTO donaciones (id, usuario_id, stripe_payment_id, nombre, email, monto, tipo, estado) VALUES
('h1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'pi_test_001', 'María García', 'maria@example.com', 50.00, 'puntual', 'completada'),
('h1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 'pi_test_002', 'David Sánchez', 'david@example.com', 25.00, 'puntual', 'completada'),
('h1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'pi_test_003', 'Juan Pérez', 'juan@example.com', 15.00, 'puntual', 'completada');

-- ============================================
-- SOCIOS (Stripe)
-- ============================================
INSERT INTO socios (id, usuario_id, stripe_subscription_id, stripe_customer_id, stripe_price_id, dni_nie, telefono, aportacion, metodo_pago, estado) VALUES
('i1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'sub_test_001', 'cus_test_001', 'price_1TTmVnFbcNKRoxlNXkxis3e5', '12345678A', '611111111', 5, 'card', 'active'),
('i1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 'sub_test_002', 'cus_test_002', 'price_1TTmXMFbcNKRoxlNCHPT8AFd', '87654321B', '622222222', 10, 'card', 'active');

-- ============================================
-- APADRINAMIENTOS
-- ============================================
INSERT INTO apadrinamientos (id, usuario_id, animal_id, stripe_payment_id, stripe_customer_id, importe, dni_nie, telefono, mostrar_publico, estado) VALUES
('j1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'pi_test_004', 'cus_test_003', 20.00, '11223344C', '698765432', true, 'active'),
('j1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', 'pi_test_005', 'cus_test_004', 15.00, '12345678A', '611111111', true, 'active');

-- ============================================
-- COBROS DE APADRINAMIENTO
-- ============================================
INSERT INTO cobros_apadrinamiento (id, apadrinamiento_id, stripe_payment_id, monto, estado) VALUES
('k1000000-0000-0000-0000-000000000001', 'j1000000-0000-0000-0000-000000000001', 'pi_test_004_01', 20.00, 'completada'),
('k1000000-0000-0000-0000-000000000002', 'j1000000-0000-0000-0000-000000000002', 'pi_test_005_01', 15.00, 'completada');

-- ============================================
-- VOLUNTARIOS
-- ============================================
INSERT INTO voluntarios (id, usuario_id, telefono, dni, disponibilidad_dias, disponibilidad_horario, tiene_vehiculo, motivacion, experiencia) VALUES
('l1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', '611111111', '12345678A', 'Lunes, Miércoles, Viernes', 'Mañanas', true, 'Me encantan los animales y quiero ayudar', 'He sido voluntario en otras protectoras'),
('l1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', '633333333', '44332211D', 'Sábados, Domingos', 'Todo el día', false, 'Quiero contribuir a mejorar la vida de los animales', 'Tengo experiencia en rescates');

-- ============================================
-- SOLICITUDES DE CASA DE ACOGIDA
-- ============================================
INSERT INTO solicitud_casa_acogida (id, usuario_id, nombre_completo, dni, telefono, tipo_vivienda, tiene_exterior, otras_personas, num_personas, hay_ninos, tiene_otros_animales, tiempo_acogida, experiencia_previa, estado) VALUES
('m1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'Laura Martínez', '44332211D', '633333333', 'casa', true, true, 3, false, true, 'meses', true, 'approved'),
('m1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Juan Pérez', '55667788E', '612345678', 'piso', false, false, 2, false, false, 'semanas', false, 'pending');

-- ============================================
-- DOCUMENTOS DE TRANSPARENCIA
-- ============================================
INSERT INTO documentos_transparencia (id, tipo, titulo, contenido, botones_json) VALUES
('n1000000-0000-0000-0000-000000000001', 'cif', 'Identificación Legal', 'Protectora Flacuchos es una asociación sin ánimo de lucro registrada en España con CIF G-56120157.', '[]'),
('n1000000-0000-0000-0000-000000000002', 'estatutos', 'Estatutos de la Asociación', 'Los estatutos rigen el funcionamiento de nuestra protectora: objetivos, estructura y normas.', '[{"label": "Descargar Estatutos", "url": ""}]'),
('n1000000-0000-0000-0000-000000000003', 'memoria', 'Memorias de Actividades', 'Resumen anual de rescates, adopciones, campañas y eventos realizados.', '[{"label": "Memoria 2025", "url": ""}, {"label": "Memoria 2024", "url": ""}]'),
('n1000000-0000-0000-0000-000000000004', 'gastos', 'Transparencia Económica', 'Distribución de gastos e ingresos de la asociación.', '[]'),
('n1000000-0000-0000-0000-000000000005', 'donacion', 'Certificado Fiscal para Donantes', 'Solicita tu certificado fiscal para desgravar tus donaciones.', '[{"label": "Solicitar Certificado", "url": "mailto:flacuchosbaena@gmail.com"}]');

-- ============================================
-- JUSTIFICANTES DE GASTOS
-- ============================================
INSERT INTO justificantes_gastos (id, año, concepto, importe, archivo_url) VALUES
('o1000000-0000-0000-0000-000000000001', 2025, 'Gastos veterinarios Q1', 1250.50, NULL),
('o1000000-0000-0000-0000-000000000002', 2025, 'Alimentación y suministros', 2340.00, NULL),
('o1000000-0000-0000-0000-000000000003', 2025, 'Mantenimiento instalaciones', 980.75, NULL);

-- ============================================
-- MENSAJES DE CONTACTO
-- ============================================
INSERT INTO mensajes_contacto (nombre, email, telefono, mensaje, tipo_consulta) VALUES
('Ana Martínez', 'ana@email.com', '612345678', 'Me interesa adoptar un perro pequeño, tengo experiencia previa con perros.', 'adopcion'),
('Pedro Sánchez', 'pedro@email.com', '698765432', 'Quiero ser voluntario, tengo los fines de semana libres.', 'voluntariado'),
('Laura Rodríguez', 'laura@email.com', '654321987', 'Me gustaría información sobre cómo apadrinar a un animal.', 'apadrinamiento'),
('Miguel Torres', 'miguel@email.com', NULL, 'Buenas, ¿tenéis gatos disponibles para adopción en estos momentos?', 'informacion');
