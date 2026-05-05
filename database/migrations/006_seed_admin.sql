-- Migration 006: Seeds - Usuario Admin y Animales
-- Fecha: 2026-04-20
-- Proyecto: Protectora Flacuchos

-- ============================================
-- USUARIO ADMINISTRADOR
-- ============================================
INSERT INTO usuarios (nombre, email, contrasena, rol)
VALUES (
    'Administrador',
    'admin@flacuchos.org',
    crypt('admin123', gen_salt('bf')),
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- ANIMALES DE EJEMPLO
-- ============================================
INSERT INTO animales (nombre, edad, tamano, caracter, salud, peso, urgente, estado, imagen_url) VALUES
('Luna', '2 años', 'mediano', 'Juguetona y cariñosa', 'Vacunada, desparasitada', 15.5, false, 'disponible', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'),
('Rocky', '5 años', 'grande', 'Tranquilo y leal', 'Vacunado, esterilizado', 32.0, true, 'disponible', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400'),
('Maya', '8 meses', 'pequeño', 'Activa y curiosa', 'Vacunada, pendiente esterilización', 8.0, false, 'disponible', 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=400'),
('Thor', '4 años', 'grande', 'Protector y noble', 'Vacunado, microchipado', 28.5, false, 'disponible', 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400'),
('Nala', '3 años', 'mediano', 'Dulce y observant', 'Vacunada, desparasitada', 18.0, true, 'disponible', 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400'),
('Buddy', '6 años', 'mediano', 'Sociable y amigable', 'Vacunado, casterizado', 22.0, false, 'adoptado', 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=400');

-- ============================================
-- NOTICIAS DE EJEMPLO
-- ============================================
INSERT INTO noticias (titulo, contenido, categoria, imagen_url) VALUES
('Bruno encuentra su hogar definitivo después de 2 años en el refugio', 'Bruno llegó al refugio muy deteriorado, con problemas de salud y muy temeroso de las personas. Después de 2 años de rehabilitación, hoy vive feliz con una familia que lo adora. «Es el perro más bonito que hemos tenido», nos dicen sus nuevos dueños.', 'Final Feliz', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'),
('Salvados 12 gatos de una situación de abandono en Fuenlabrada', 'Gracias a la alerta de un vecino, nuestro equipo pudo rescatar a 12 gatos que vivían en condiciones muy precarias. Todos han sido atendidos, esterilizados y algunos ya están en adopción. ¡Gracias a tod@s los que colaboraron!', 'Rescate', 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=400'),
('Gran éxito del mercadillo solidario en Alcobendas', 'El pasado fin de semana celebramos nuestro mercadillo solidario en Alcobendas. ¡Recaudamos más de 3.000€ para costear tratamientos veterinarios de nuestros animales! Gracias a todos los voluntarios y asistentes.', 'Evento', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400'),
('Max supera su operación con éxito', '¡Grandes noticias! Max, nuestro caso más urgente, ha superado la operación de tumor con éxito. Ahora necesita recuperarse y buscar una familia que lo cuida. ¡Ayúdanos a encontrarle hogar!', 'Veterinario', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400'),
('Nueva alianza con clínicas veterinarias', 'Nos alegra anunciar que hemos llegado a acuerdos con varias clínicas veterinarias de Madrid para ofrecer descuentos a los animales de nuestra protectora. ¡Esto nos ayudará a ahorrar mucho en gastos médicos!', 'Colaboración', 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400'),
('5 cachorros encuentran hogar en una semana', 'Esta semana ha sido especialmente emotiva. 5 cachorros que nacieron en nuestro refugio han encontrado familias definitivas. ¡Estamos muy felices!', 'Adopción', 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400'),
('Nueva campaña de adopción', 'Este fin de semana tendremos nuestra campaña de adopción en la plaza central. ¡Ven a conocernos!', 'Evento', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400'),
('Necesitamos voluntarios', 'Buscamos personas comprometidas para ayudar en el refugio. ¡Únete a nuestro equipo!', 'Colaboración', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400'),
('Gracias a nuestros padrinos', 'Agradecemos a todas las personas que apadrinan a nuestros peludos. ¡Sois fundamentales!', 'Colaboración', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400'),
('Nueva campaña de esterilización para controlar la población de gatos', 'Este mes lanzamos una campaña masiva de esterilización para controlar la población de gatos callejeros en nuestra zona. Gracias a la colaboración de varios voluntarios y clínicas aliadas, lograremos esterilizar a más de 50 gatos. Si quieres colaborar como voluntario o apadrinar a un gato, ¡contáctanos!', 'Veterinario', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400');

-- ============================================
-- EVENTOS DE EJEMPLO
-- ============================================
INSERT INTO eventos (titulo, descripcion, fecha, ubicacion) VALUES
('Jornada de adopción', 'Ven a conocer a nuestros amigos peludos y encuentra tu compañero ideal', '2026-05-15', 'Plaza del Pueblo'),
('Mercadillo benéfico', 'Venta de productos hechos a mano para ayudar a los animales', '2026-06-01', 'Centro Cultural'),
('Paseo con perros', 'Paseo gratuito con los perros del refugio', '2026-05-20', 'Parque Municipal');