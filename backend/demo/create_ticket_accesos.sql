-- Crear tabla para control de acceso de técnicos a tickets
CREATE TABLE IF NOT EXISTS ticket_accesos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    tecnico_id BIGINT NOT NULL,
    tipo_acceso ENUM('ASIGNADO', 'ESCALADO', 'CERRADO') NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP NULL,
    motivo_cierre VARCHAR(500),
    
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    INDEX idx_ticket_tecnico (ticket_id, tecnico_id),
    INDEX idx_tecnico_activo (tecnico_id, activo),
    INDEX idx_ticket_activo (ticket_id, activo)
);
