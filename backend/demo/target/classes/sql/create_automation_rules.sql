-- Crear tabla de reglas de automatización
CREATE TABLE IF NOT EXISTS automation_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    condicion VARCHAR(1000) NOT NULL,
    accion VARCHAR(1000) NOT NULL,
    prioridad VARCHAR(20) NOT NULL DEFAULT 'medium',
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ejecuciones INT NOT NULL DEFAULT 0,
    ultima_ejecucion TIMESTAMP NULL,
    
    INDEX idx_activa (activa),
    INDEX idx_prioridad (prioridad),
    INDEX idx_fecha_creacion (fecha_creacion),
    INDEX idx_nombre (nombre)
);

-- Insertar datos de ejemplo
INSERT INTO automation_rules (nombre, descripcion, condicion, accion, prioridad, activa, fecha_creacion, ejecuciones) VALUES
('Asignación automática por categoría', 'Asigna automáticamente tickets de redes a técnicos especializados', 'categoria == "Redes" AND prioridad == "high"', 'Asignar a técnico especializado en redes', 'high', true, NOW(), 15),
('Escalación por tiempo', 'Escala tickets que llevan más de 24 horas sin resolver', 'tiempo_sin_resolver > 24 AND estado == "EN_PROGRESO"', 'Escalar a supervisor técnico', 'medium', true, NOW(), 8),
('Notificación de SLA crítico', 'Notifica cuando un ticket está próximo a vencer su SLA', 'tiempo_restante_sla < 2 AND estado != "RESUELTO"', 'Enviar notificación de alerta de SLA', 'high', true, NOW(), 3),
('Asignación por carga de trabajo', 'Asigna tickets a técnicos con menor carga de trabajo', 'carga_trabajo_tecnico < 5', 'Asignar al técnico con menor carga', 'medium', false, NOW(), 0);
