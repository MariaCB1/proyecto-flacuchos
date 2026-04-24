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
INSERT INTO noticias (titulo, contenido, imagen_url) VALUES
('Nueva campaña de adopción', 'Este fin de semana tendremos nuestra campaña de adopción en la plaza central. ¡Ven a conocernos!', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400'),
('Necesitamos voluntarios', 'Buscamos personas comprometidas para ayudar en el refugio. ¡Únete a nuestro equipo!', 'https://images.unsplash.com/photo-1593137137816-d5232b25230c?w=400'),
('Gracias a nuestros padrinos', 'Agradecemos a todas las personas que apadrinan a nuestros peludos. ¡Sois fundamentales!', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400');

-- ============================================
-- EVENTOS DE EJEMPLO
-- ============================================
INSERT INTO eventos (titulo, descripcion, fecha, ubicacion) VALUES
('Jornada de adopción', 'Ven a conocer a nuestros amigos peludos y encuentra tu compañero ideal', '2026-05-15', 'Plaza del Pueblo'),
('Mercadillo benéfico', 'Venta de productos hechos a mano para ayudar a los animales', '2026-06-01', 'Centro Cultural'),
('Paseo con perros', 'Paseo gratuito con los perros del refugio', '2026-05-20', 'Parque Municipal');