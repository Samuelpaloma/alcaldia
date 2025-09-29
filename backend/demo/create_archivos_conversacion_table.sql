-- Crear tabla para archivos de conversación
CREATE TABLE IF NOT EXISTS archivos_conversacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    tamaño_archivo BIGINT NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    extension VARCHAR(10) NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Índices
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_subida (fecha_subida),
    INDEX idx_activo (activo),
    
    -- Claves foráneas
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    
    -- Índice único para evitar duplicados
    UNIQUE KEY uk_ticket_nombre_archivo (ticket_id, nombre_archivo)
);

-- Insertar algunos datos de ejemplo (opcional)
-- INSERT INTO archivos_conversacion (ticket_id, usuario_id, nombre_archivo, nombre_original, tipo_mime, tamaño_archivo, ruta_archivo, extension) VALUES
-- (1, 1, 'ejemplo_123.pdf', 'documento.pdf', 'application/pdf', 1024000, 'uploads/conversacion/ejemplo_123.pdf', 'pdf');

-- Verificar la tabla creada
SELECT 'Tabla archivos_conversacion creada exitosamente' as resultado;
