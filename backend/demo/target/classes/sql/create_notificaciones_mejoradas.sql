-- Crear tabla de notificaciones mejoradas
CREATE TABLE IF NOT EXISTS notificaciones_mejoradas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    mensaje VARCHAR(1000) NOT NULL,
    destinatarios TEXT NOT NULL,
    ticket_id BIGINT,
    usuario_actor_id BIGINT,
    usuario_actor_email VARCHAR(255),
    usuario_actor_nombre VARCHAR(255),
    prioridad VARCHAR(20) DEFAULT 'normal',
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP NULL,
    
    INDEX idx_destinatarios (destinatarios(255)),
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_usuario_actor (usuario_actor_email),
    INDEX idx_tipo (tipo),
    INDEX idx_prioridad (prioridad),
    INDEX idx_leida (leida),
    INDEX idx_fecha_creacion (fecha_creacion)
);

-- Insertar datos de ejemplo
INSERT INTO notificaciones_mejoradas (tipo, mensaje, destinatarios, ticket_id, usuario_actor_email, usuario_actor_nombre, prioridad, leida, fecha_creacion) VALUES
('ticket_creado', 'Nuevo ticket creado por Rober Rodrigues (#26)', '["rol:administrador"]', 26, 'roberrodrigues@gmail.com', 'Rober Rodrigues', 'normal', false, NOW()),
('ticket_asignado', 'Se te asignó el ticket #26 del cliente Rober Rodrigues', '["tecnico:juanperez@gmail.com"]', 26, 'admin@test.com', 'Admin Sistema', 'normal', false, NOW()),
('ticket_asignado', 'Tu ticket #26 fue asignado al técnico Juan Pérez', '["funcionario:roberrodrigues@gmail.com"]', 26, 'admin@test.com', 'Admin Sistema', 'normal', false, NOW()),
('ticket_resuelto', 'Tu ticket #26 ha sido resuelto por Juan Pérez', '["funcionario:roberrodrigues@gmail.com"]', 26, 'juanperez@gmail.com', 'Juan Pérez', 'normal', false, NOW()),
('comentario_agregado', 'Nuevo comentario en tu ticket #26 por Juan Pérez', '["funcionario:roberrodrigues@gmail.com"]', 26, 'juanperez@gmail.com', 'Juan Pérez', 'normal', false, NOW()),
('sla_vencido', '⚠️ SLA vencido para el ticket #26', '["rol:tecnico", "rol:administrador"]', 26, NULL, 'Sistema', 'critica', false, NOW()),
('alerta_sistema', '🚨 Alerta del sistema: Múltiples tickets bloqueados', '["rol:super_admin"]', NULL, NULL, 'Sistema', 'critica', false, NOW());
