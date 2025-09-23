-- Script para insertar las 19 categorías del sistema de tickets
-- Ejecutar en la base de datos 'ticket'

USE ticket;

-- Verificar si la tabla existe
DESCRIBE categorias;

-- Insertar las categorías
INSERT INTO categorias (nombre, descripcion, activa, orden, color_hex, icono, fecha_creacion, fecha_actualizacion) VALUES
('Atención al Ciudadano', 'Gestión de consultas y solicitudes de ciudadanos', true, 1, '#FF5733', 'user', NOW(), NOW()),
('Quejas y Reclamos', 'Manejo de quejas y reclamos ciudadanos', true, 2, '#E74C3C', 'alert-triangle', NOW(), NOW()),
('Solicitudes', 'Procesamiento de solicitudes generales', true, 3, '#3498DB', 'file-text', NOW(), NOW()),
('General', 'Categoría general para consultas diversas', true, 4, '#95A5A6', 'help-circle', NOW(), NOW()),
('Administración y Gestión', 'Temas administrativos y de gestión', true, 5, '#9B59B6', 'briefcase', NOW(), NOW()),
('Contabilidad', 'Asuntos contables y financieros', true, 6, '#8E44AD', 'calculator', NOW(), NOW()),
('Recursos Humanos', 'Gestión de personal y RRHH', true, 7, '#8E44AD', 'users', NOW(), NOW()),
('Gestión Documental', 'Manejo de documentos y archivos', true, 8, '#8E44AD', 'folder', NOW(), NOW()),
('Tecnología e IT', 'Sistemas de información y tecnología', true, 9, '#2ECC71', 'monitor', NOW(), NOW()),
('Sistemas de Información', 'Gestión de sistemas informáticos', true, 10, '#27AE60', 'database', NOW(), NOW()),
('Redes y Comunicaciones', 'Infraestructura de red y comunicaciones', true, 11, '#27AE60', 'wifi', NOW(), NOW()),
('Desarrollo de Software', 'Desarrollo y mantenimiento de software', true, 12, '#27AE60', 'code', NOW(), NOW()),
('Infraestructura y Mantenimiento', 'Mantenimiento de infraestructura', true, 13, '#F39C12', 'wrench', NOW(), NOW()),
('Mantenimiento', 'Servicios de mantenimiento general', true, 14, '#E67E22', 'tool', NOW(), NOW()),
('Servicios Generales', 'Servicios generales de la entidad', true, 15, '#E67E22', 'shield', NOW(), NOW()),
('Hardware', 'Equipos de cómputo y hardware', true, 16, '#34495E', 'cpu', NOW(), NOW()),
('Software', 'Aplicaciones y software', true, 17, '#2C3E50', 'layers', NOW(), NOW()),
('Redes', 'Infraestructura de red', true, 18, '#1ABC9C', 'globe', NOW(), NOW()),
('Soporte Técnico', 'Asistencia técnica especializada', true, 19, '#16A085', 'headphones', NOW(), NOW());

-- Verificar la inserción
SELECT * FROM categorias ORDER BY orden;

-- Mostrar estadísticas
SELECT 
    COUNT(*) as total_categorias,
    SUM(CASE WHEN activa = true THEN 1 ELSE 0 END) as categorias_activas,
    SUM(CASE WHEN activa = false THEN 1 ELSE 0 END) as categorias_inactivas
FROM categorias;

