-- Script para crear la tabla de reglas de automatización
CREATE TABLE IF NOT EXISTS reglas_automatizacion (
    id_regla BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion VARCHAR(500),
    condicion TEXT NOT NULL,
    accion TEXT NOT NULL,
    prioridad INT NOT NULL DEFAULT 1,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    ejecuciones INT NOT NULL DEFAULT 0,
    ultima_ejecucion DATETIME,
    creado_por VARCHAR(100),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para optimizar consultas
    INDEX idx_activa_prioridad (activa, prioridad DESC, fecha_creacion ASC),
    INDEX idx_nombre (nombre),
    INDEX idx_ultima_ejecucion (ultima_ejecucion),
    INDEX idx_creado_por (creado_por)
);

-- Insertar algunas reglas de ejemplo
INSERT INTO reglas_automatizacion (nombre, descripcion, condicion, accion, prioridad, activa, creado_por) VALUES
('Asignación automática por categoría', 'Asigna automáticamente tickets de redes a técnicos especializados', 'categoria == "Redes" AND prioridad == "high"', 'Asignar a técnico especializado en redes', 3, TRUE, 'Sistema'),
('Escalación por tiempo', 'Escala tickets que llevan más de 24 horas sin resolver', 'tiempo_sin_resolver > 24 AND estado == "EN_PROGRESO"', 'Escalar a supervisor técnico', 2, TRUE, 'Sistema'),
('Notificación de SLA crítico', 'Envía notificación cuando un ticket crítico está próximo a vencer', 'prioridad == "critical" AND tiempo_restante < 2', 'Enviar notificación de SLA crítico', 4, TRUE, 'Sistema'),
('Cierre automático de tickets resueltos', 'Cierra automáticamente tickets que han estado resueltos por más de 48 horas', 'estado == "RESUELTO" AND tiempo_resuelto > 48', 'Cerrar ticket automáticamente', 1, TRUE, 'Sistema'),
('Reasignación por ausencia', 'Reasigna tickets cuando el técnico asignado está ausente', 'tecnico_ausente == true AND estado == "ASIGNADO"', 'Reasignar a técnico disponible', 2, TRUE, 'Sistema');
