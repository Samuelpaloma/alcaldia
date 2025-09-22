-- Script SQL para crear categorías del sistema de tickets
-- Ejecutar en MySQL: mysql -u root -p ticketflow < create_categories_complete.sql

USE ticketflow;

-- Limpiar categorías existentes (opcional)
-- DELETE FROM categorias;

-- Insertar categorías principales para el bot automatizado
INSERT INTO categorias (nombre, descripcion, color_hex, icono, orden, activa, fecha_creacion) VALUES
-- Categorías principales del bot
('Atención al Ciudadano', 'Problemas relacionados con atención al ciudadano y servicios públicos', '#FF5733', 'user', 1, 1, NOW()),
('Quejas y Reclamos', 'Quejas, reclamos y denuncias de los ciudadanos', '#E74C3C', 'alert-triangle', 2, 1, NOW()),
('Solicitudes', 'Solicitudes generales de servicios y trámites', '#3498DB', 'file-text', 3, 1, NOW()),
('General', 'Categoría general para tickets sin clasificar específicamente', '#95A5A6', 'help-circle', 4, 1, NOW()),

-- Categorías específicas por área SENA
('Administración y Gestión', 'Problemas relacionados con administración, contabilidad y recursos humanos', '#9B59B6', 'briefcase', 5, 1, NOW()),
('Contabilidad', 'Problemas de contabilidad, facturación y estados financieros', '#8E44AD', 'calculator', 6, 1, NOW()),
('Recursos Humanos', 'Problemas de selección, capacitación y evaluación de personal', '#8E44AD', 'users', 7, 1, NOW()),
('Gestión Documental', 'Problemas de archivo, correspondencia y procedimientos', '#8E44AD', 'folder', 8, 1, NOW()),

('Tecnología e IT', 'Problemas relacionados con sistemas, redes y desarrollo de software', '#2ECC71', 'monitor', 9, 1, NOW()),
('Sistemas de Información', 'Problemas de bases de datos, ERP, CRM', '#27AE60', 'database', 10, 1, NOW()),
('Redes y Comunicaciones', 'Problemas de infraestructura de red, internet y telefonía', '#27AE60', 'wifi', 11, 1, NOW()),
('Desarrollo de Software', 'Problemas de aplicaciones web, móviles y de escritorio', '#27AE60', 'code', 12, 1, NOW()),

('Infraestructura y Mantenimiento', 'Problemas de edificios, equipos y servicios generales', '#F39C12', 'wrench', 13, 1, NOW()),
('Mantenimiento', 'Problemas de mantenimiento de equipos e instalaciones', '#E67E22', 'tool', 14, 1, NOW()),
('Servicios Generales', 'Problemas de limpieza, seguridad y servicios auxiliares', '#E67E22', 'shield', 15, 1, NOW()),

-- Categorías adicionales para casos específicos
('Hardware', 'Problemas con equipos de cómputo, impresoras y dispositivos', '#34495E', 'cpu', 16, 1, NOW()),
('Software', 'Problemas con aplicaciones, sistemas operativos y programas', '#2C3E50', 'layers', 17, 1, NOW()),
('Redes', 'Problemas de conectividad, internet e intranet', '#1ABC9C', 'globe', 18, 1, NOW()),
('Soporte Técnico', 'Solicitudes de soporte técnico general', '#16A085', 'headphones', 19, 1, NOW());

-- Verificar que se crearon correctamente
SELECT 
    id,
    nombre,
    descripcion,
    color_hex,
    icono,
    orden,
    activa,
    fecha_creacion
FROM categorias 
ORDER BY orden;

-- Mostrar resumen
SELECT 
    COUNT(*) as total_categorias,
    SUM(CASE WHEN activa = 1 THEN 1 ELSE 0 END) as categorias_activas,
    SUM(CASE WHEN activa = 0 THEN 1 ELSE 0 END) as categorias_inactivas
FROM categorias;
