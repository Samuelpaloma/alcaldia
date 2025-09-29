-- Script para crear la tabla de preferencias de notificación
-- Ejecutar este script en la base de datos antes de usar los endpoints de notificaciones

CREATE TABLE IF NOT EXISTS preferencias_notificacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL UNIQUE,
    push_activo BOOLEAN NOT NULL DEFAULT TRUE,
    email_activo BOOLEAN NOT NULL DEFAULT FALSE,
    notificaciones_ticket_asignado BOOLEAN NOT NULL DEFAULT TRUE,
    notificaciones_ticket_en_proceso BOOLEAN NOT NULL DEFAULT TRUE,
    notificaciones_ticket_resuelto BOOLEAN NOT NULL DEFAULT TRUE,
    notificaciones_comentarios BOOLEAN NOT NULL DEFAULT TRUE,
    notificaciones_evidencias BOOLEAN NOT NULL DEFAULT TRUE,
    notificaciones_sla BOOLEAN NOT NULL DEFAULT TRUE,
    notificaciones_sistema BOOLEAN NOT NULL DEFAULT TRUE,
    frecuencia_email VARCHAR(50) NOT NULL DEFAULT 'inmediata',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para mejorar el rendimiento
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_push_activo (push_activo),
    INDEX idx_email_activo (email_activo)
);

-- Comentarios para documentar la tabla
ALTER TABLE preferencias_notificacion COMMENT = 'Tabla para almacenar las preferencias de notificación de los usuarios';

-- Insertar preferencias por defecto para usuarios existentes (opcional)
-- Descomenta las siguientes líneas si quieres crear preferencias por defecto para usuarios existentes
/*
INSERT INTO preferencias_notificacion (usuario_id, push_activo, email_activo, notificaciones_ticket_asignado, notificaciones_ticket_en_proceso, notificaciones_ticket_resuelto, notificaciones_comentarios, notificaciones_evidencias, notificaciones_sla, notificaciones_sistema, frecuencia_email)
SELECT 
    id as usuario_id,
    TRUE as push_activo,
    FALSE as email_activo,
    TRUE as notificaciones_ticket_asignado,
    TRUE as notificaciones_ticket_en_proceso,
    TRUE as notificaciones_ticket_resuelto,
    TRUE as notificaciones_comentarios,
    TRUE as notificaciones_evidencias,
    TRUE as notificaciones_sla,
    TRUE as notificaciones_sistema,
    'inmediata' as frecuencia_email
FROM usuarios 
WHERE id NOT IN (SELECT usuario_id FROM preferencias_notificacion);
*/
