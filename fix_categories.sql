-- Script corregido para crear categorías
-- Verificar estructura de tabla primero

-- Mostrar estructura de la tabla categorias
DESCRIBE categorias;

-- Si la tabla no existe, crearla
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    color_hex VARCHAR(7),
    icono VARCHAR(50),
    orden INT DEFAULT 0,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Limpiar datos existentes
DELETE FROM categorias;

-- Insertar categorías con estructura correcta
INSERT INTO categorias (nombre, descripcion, color_hex, icono, orden, activa) VALUES
('Atención al Ciudadano', 'Problemas relacionados con atención al ciudadano y servicios públicos', '#FF5733', 'user', 1, TRUE),
('Quejas y Reclamos', 'Quejas, reclamos y denuncias de los ciudadanos', '#E74C3C', 'alert-triangle', 2, TRUE),
('Solicitudes', 'Solicitudes generales de servicios y trámites', '#3498DB', 'file-text', 3, TRUE),
('General', 'Categoría general para tickets sin clasificar específicamente', '#95A5A6', 'help-circle', 4, TRUE),
('Administración y Gestión', 'Problemas relacionados con administración, contabilidad y recursos humanos', '#9B59B6', 'briefcase', 5, TRUE),
('Contabilidad', 'Problemas de contabilidad, facturación y estados financieros', '#8E44AD', 'calculator', 6, TRUE),
('Recursos Humanos', 'Problemas de selección, capacitación y evaluación de personal', '#8E44AD', 'users', 7, TRUE),
('Gestión Documental', 'Problemas de archivo, correspondencia y procedimientos', '#8E44AD', 'folder', 8, TRUE),
('Tecnología e IT', 'Problemas relacionados con sistemas, redes y desarrollo de software', '#2ECC71', 'monitor', 9, TRUE),
('Sistemas de Información', 'Problemas de bases de datos, ERP, CRM', '#27AE60', 'database', 10, TRUE),
('Redes y Comunicaciones', 'Problemas de infraestructura de red, internet y telefonía', '#27AE60', 'wifi', 11, TRUE),
('Desarrollo de Software', 'Problemas de aplicaciones web, móviles y de escritorio', '#27AE60', 'code', 12, TRUE),
('Infraestructura y Mantenimiento', 'Problemas de edificios, equipos y servicios generales', '#F39C12', 'wrench', 13, TRUE),
('Mantenimiento', 'Problemas de mantenimiento de equipos e instalaciones', '#E67E22', 'tool', 14, TRUE),
('Servicios Generales', 'Problemas de limpieza, seguridad y servicios auxiliares', '#E67E22', 'shield', 15, TRUE),
('Hardware', 'Problemas con equipos de cómputo, impresoras y dispositivos', '#34495E', 'cpu', 16, TRUE),
('Software', 'Problemas con aplicaciones, sistemas operativos y programas', '#2C3E50', 'layers', 17, TRUE),
('Redes', 'Problemas de conectividad, internet e intranet', '#1ABC9C', 'globe', 18, TRUE),
('Soporte Técnico', 'Solicitudes de soporte técnico general', '#16A085', 'headphones', 19, TRUE);

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
