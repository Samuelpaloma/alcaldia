-- Crear tabla para historial de asignaciones
CREATE TABLE IF NOT EXISTS historial_asignaciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    tecnico_id BIGINT,
    usuario_que_asigna_id BIGINT NOT NULL,
    tipo_operacion ENUM('ASIGNAR', 'REASIGNAR', 'ESCALAR', 'DESASIGNAR', 'REABRIR') NOT NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),
    comentario TEXT,
    fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_que_asigna_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_fecha_operacion (fecha_operacion)
);
