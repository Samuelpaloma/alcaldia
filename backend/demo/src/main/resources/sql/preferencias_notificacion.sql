-- Crear tabla de preferencias de notificación
CREATE TABLE IF NOT EXISTS preferencias_notificacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    push_activo BOOLEAN NOT NULL DEFAULT TRUE,
    email_activo BOOLEAN NOT NULL DEFAULT FALSE,
    notificaciones_ticket_asignado BOOLEAN NOT NULL DEFAULT TRUE,
    notificaciones_ticket_en_proceso BOOLEAN NOT NULL DEFAULT TRUE,
    notificaciones_ticket_resuelto BOOLEAN NOT NULL DEFAULT TRUE,
    notificaciones_comentarios BOOLEAN NOT NULL DEFAULT TRUE,
    notificaciones_evidencias BOOLEAN NOT NULL DEFAULT TRUE,
    notificaciones_sla BOOLEAN NOT NULL DEFAULT TRUE,
    notificaciones_sistema BOOLEAN NOT NULL DEFAULT TRUE,
    frecuencia_email VARCHAR(50) DEFAULT 'inmediata',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_usuario_id (usuario_id),
    UNIQUE KEY uk_usuario_preferencias (usuario_id)
);

-- Insertar preferencias por defecto para usuarios existentes (opcional)
-- INSERT INTO preferencias_notificacion (usuario_id, push_activo, email_activo)
-- SELECT id, TRUE, FALSE FROM usuario WHERE tipo_usuario = 'TECNICO';

