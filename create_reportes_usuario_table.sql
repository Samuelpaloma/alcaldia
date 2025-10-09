-- Script para crear la tabla de reportes de usuario
-- Ejecutar este script en la base de datos para crear la nueva tabla

CREATE TABLE IF NOT EXISTS reportes_usuario (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    subtitulo VARCHAR(500),
    tipo_periodo VARCHAR(50) NOT NULL COMMENT 'daily, weekly, monthly, yearly',
    valor_periodo VARCHAR(100) NOT NULL COMMENT 'fecha, mes, año específico',
    nombre_archivo VARCHAR(255) NOT NULL,
    datos_reporte TEXT COMMENT 'JSON con los datos del reporte',
    estadisticas TEXT COMMENT 'JSON con las estadísticas',
    categorias_top TEXT COMMENT 'JSON con las categorías top',
    tecnicos_top TEXT COMMENT 'JSON con los técnicos top',
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    observaciones TEXT,
    
    -- Índices para mejorar el rendimiento
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_tipo_periodo (tipo_periodo),
    INDEX idx_fecha_generacion (fecha_generacion),
    INDEX idx_activo (activo),
    
    -- Clave foránea (opcional, descomenta si quieres mantener integridad referencial)
    -- FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Comentarios sobre la tabla
ALTER TABLE reportes_usuario COMMENT = 'Tabla para almacenar reportes generados por usuarios del sistema';

-- Insertar algunos datos de ejemplo (opcional)
-- INSERT INTO reportes_usuario (usuario_id, titulo, subtitulo, tipo_periodo, valor_periodo, nombre_archivo, datos_reporte, estadisticas, categorias_top, tecnicos_top, observaciones) 
-- VALUES 
-- (1, 'Reporte Mensual Octubre 2024', 'Análisis completo de tickets', 'monthly', '2024-10', 'reporte-mensual-2024-10.pdf', '{"totalTickets": 150, "ticketsResueltos": 120}', '{"tiempoPromedio": 48, "satisfaccion": 4.5}', '{"Soporte": 50, "Mantenimiento": 30}', '{"Juan Pérez": 25, "María García": 20}', 'Reporte generado automáticamente'),
-- (1, 'Reporte Diario 15 Noviembre', 'Resumen del día', 'daily', '2024-11-15', 'reporte-daily-2024-11-15.pdf', '{"totalTickets": 8, "ticketsResueltos": 6}', '{"tiempoPromedio": 24, "satisfaccion": 4.8}', '{"Soporte": 5, "Mantenimiento": 2}', '{"Juan Pérez": 4, "María García": 2}', 'Reporte diario generado');
