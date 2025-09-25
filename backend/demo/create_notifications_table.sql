-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP NULL,
    ticket_id BIGINT NULL,
    usuario_id BIGINT NULL,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_creacion (fecha_creacion),
    INDEX idx_leida (leida)
);

-- Insertar algunas notificaciones de ejemplo
INSERT INTO notificaciones (titulo, mensaje, tipo, leida, ticket_id, usuario_id) VALUES
('Sistema Iniciado', 'El sistema de tickets ha sido iniciado correctamente', 'info', FALSE, NULL, NULL),
('Bienvenido', 'Bienvenido al sistema de gestión de tickets', 'success', FALSE, NULL, NULL);
CREATE TABLE IF NOT EXISTS notificaciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP NULL,
    ticket_id BIGINT NULL,
    usuario_id BIGINT NULL,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_creacion (fecha_creacion),
    INDEX idx_leida (leida)
);

-- Insertar algunas notificaciones de ejemplo
INSERT INTO notificaciones (titulo, mensaje, tipo, leida, ticket_id, usuario_id) VALUES
('Sistema Iniciado', 'El sistema de tickets ha sido iniciado correctamente', 'info', FALSE, NULL, NULL),
('Bienvenido', 'Bienvenido al sistema de gestión de tickets', 'success', FALSE, NULL, NULL);
