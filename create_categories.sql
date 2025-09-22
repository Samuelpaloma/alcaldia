-- Script para crear categorías en la base de datos
USE ticketflow;

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion, color_hex, icono, orden, activa, fecha_creacion) VALUES
('Atención al Ciudadano', 'Problemas relacionados con atención al ciudadano', '#FF5733', 'user', 1, 1, NOW()),
('Quejas y Reclamos', 'Problemas relacionados con quejas y reclamos', '#E74C3C', 'alert-triangle', 2, 1, NOW()),
('Solicitudes', 'Solicitudes generales de servicios', '#3498DB', 'file-text', 3, 1, NOW()),
('General', 'Categoría general para tickets sin clasificar', '#95A5A6', 'help-circle', 4, 1, NOW());

-- Verificar que se crearon
SELECT * FROM categorias;
