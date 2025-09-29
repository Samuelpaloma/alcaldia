-- Crear tabla de configuraciones SLA
CREATE TABLE IF NOT EXISTS sla_configurations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria_id BIGINT NULL,
    prioridad VARCHAR(20) NULL,
    tiempo_respuesta_horas INT NOT NULL,
    tiempo_resolucion_horas INT NOT NULL,
    tiempo_alerta_horas INT NOT NULL DEFAULT 2,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_activo (activo),
    INDEX idx_categoria (categoria_id),
    INDEX idx_prioridad (prioridad),
    INDEX idx_fecha_creacion (fecha_creacion),
    INDEX idx_nombre (nombre),
    
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

-- Insertar configuraciones SLA de ejemplo
INSERT INTO sla_configurations (nombre, descripcion, categoria_id, prioridad, tiempo_respuesta_horas, tiempo_resolucion_horas, tiempo_alerta_horas, activo, fecha_creacion) VALUES
('SLA General', 'SLA por defecto para todos los tickets', NULL, NULL, 4, 24, 2, true, NOW()),
('SLA Redes - Alta Prioridad', 'SLA específico para tickets de redes con alta prioridad', 1, 'ALTA', 1, 4, 1, true, NOW()),
('SLA Redes - Media Prioridad', 'SLA específico para tickets de redes con media prioridad', 1, 'MEDIA', 2, 8, 2, true, NOW()),
('SLA Soporte Técnico - Alta Prioridad', 'SLA específico para soporte técnico con alta prioridad', 2, 'ALTA', 2, 6, 1, true, NOW()),
('SLA Soporte Técnico - Media Prioridad', 'SLA específico para soporte técnico con media prioridad', 2, 'MEDIA', 4, 12, 2, true, NOW()),
('SLA Facturación - Alta Prioridad', 'SLA específico para facturación con alta prioridad', 3, 'ALTA', 1, 2, 1, true, NOW()),
('SLA Facturación - Media Prioridad', 'SLA específico para facturación con media prioridad', 3, 'MEDIA', 2, 4, 2, true, NOW()),
('SLA Accesos - Alta Prioridad', 'SLA específico para accesos con alta prioridad', 4, 'ALTA', 1, 2, 1, true, NOW()),
('SLA Accesos - Media Prioridad', 'SLA específico para accesos con media prioridad', 4, 'MEDIA', 2, 4, 2, true, NOW());
