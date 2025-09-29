-- Script para insertar evidencias de prueba
-- Asegúrate de que existan tickets en estado COMPLETADO

-- Primero, vamos a verificar qué tickets existen
SELECT id, estado, consulta FROM tickets WHERE estado = 'COMPLETADO' LIMIT 5;

-- Insertar evidencias de prueba para tickets finalizados
-- (Ajusta los IDs de ticket según los que tengas en tu BD)

-- Evidencia 1: Imagen para ticket 1
INSERT INTO evidencias (
    ticket_id, 
    subido_por_id, 
    tipo_evidencia, 
    descripcion, 
    nombre_archivo, 
    extension_archivo, 
    tamanio_archivo, 
    ruta_archivo, 
    url_archivo, 
    fecha_subida, 
    activa
) VALUES (
    1, 
    2, 
    'IMAGEN', 
    'Captura de pantalla del error reportado por el usuario', 
    'screenshot_error_001', 
    'png', 
    1024000, 
    '/uploads/evidencias/1/screenshot_error_001.png', 
    'http://localhost:8080/uploads/evidencias/1/screenshot_error_001.png', 
    NOW(), 
    1
);

-- Evidencia 2: Documento para ticket 1
INSERT INTO evidencias (
    ticket_id, 
    subido_por_id, 
    tipo_evidencia, 
    descripcion, 
    nombre_archivo, 
    extension_archivo, 
    tamanio_archivo, 
    ruta_archivo, 
    url_archivo, 
    fecha_subida, 
    activa
) VALUES (
    1, 
    2, 
    'DOCUMENTO', 
    'Logs del sistema durante el incidente', 
    'system_logs_001', 
    'txt', 
    512000, 
    '/uploads/evidencias/1/system_logs_001.txt', 
    'http://localhost:8080/uploads/evidencias/1/system_logs_001.txt', 
    NOW(), 
    1
);

-- Evidencia 3: Video para ticket 2 (si existe)
INSERT INTO evidencias (
    ticket_id, 
    subido_por_id, 
    tipo_evidencia, 
    descripcion, 
    nombre_archivo, 
    extension_archivo, 
    tamanio_archivo, 
    ruta_archivo, 
    url_archivo, 
    fecha_subida, 
    activa
) VALUES (
    2, 
    2, 
    'VIDEO', 
    'Video demostrativo del problema reportado', 
    'video_demo_001', 
    'mp4', 
    5242880, 
    '/uploads/evidencias/2/video_demo_001.mp4', 
    'http://localhost:8080/uploads/evidencias/2/video_demo_001.mp4', 
    NOW(), 
    1
);

-- Evidencia 4: Imagen para ticket 3 (si existe)
INSERT INTO evidencias (
    ticket_id, 
    subido_por_id, 
    tipo_evidencia, 
    descripcion, 
    nombre_archivo, 
    extension_archivo, 
    tamanio_archivo, 
    ruta_archivo, 
    url_archivo, 
    fecha_subida, 
    activa
) VALUES (
    3, 
    2, 
    'IMAGEN', 
    'Antes y después de la solución implementada', 
    'before_after_001', 
    'jpg', 
    2048000, 
    '/uploads/evidencias/3/before_after_001.jpg', 
    'http://localhost:8080/uploads/evidencias/3/before_after_001.jpg', 
    NOW(), 
    1
);

-- Evidencia 5: Documento para ticket 4 (si existe)
INSERT INTO evidencias (
    ticket_id, 
    subido_por_id, 
    tipo_evidencia, 
    descripcion, 
    nombre_archivo, 
    extension_archivo, 
    tamanio_archivo, 
    ruta_archivo, 
    url_archivo, 
    fecha_subida, 
    activa
) VALUES (
    4, 
    2, 
    'DOCUMENTO', 
    'Reporte técnico de la solución implementada', 
    'technical_report_001', 
    'pdf', 
    1536000, 
    '/uploads/evidencias/4/technical_report_001.pdf', 
    'http://localhost:8080/uploads/evidencias/4/technical_report_001.pdf', 
    NOW(), 
    1
);

-- Verificar las evidencias insertadas
SELECT 
    e.id_evidencia,
    e.ticket_id,
    t.consulta as ticket_consulta,
    t.estado as ticket_estado,
    e.tipo_evidencia,
    e.descripcion,
    e.nombre_archivo,
    e.extension_archivo,
    e.tamanio_archivo,
    e.fecha_subida,
    u.nombre as subido_por_nombre,
    u.email as subido_por_email
FROM evidencias e
JOIN tickets t ON e.ticket_id = t.id
JOIN usuarios u ON e.subido_por_id = u.id_usuario
WHERE e.activa = 1
ORDER BY e.fecha_subida DESC;
