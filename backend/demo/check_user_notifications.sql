-- ========================================
-- SCRIPT PARA VERIFICAR USUARIO Y NOTIFICACIONES
-- ========================================

-- 1. Verificar si el usuario existe
SELECT 
    id_usuario,
    nombre,
    apellido,
    email,
    tipo_usuario,
    activo
FROM usuarios 
WHERE email = 'ligand2025@gmail.com';

-- 2. Verificar todas las notificaciones existentes
SELECT 
    id,
    tipo,
    mensaje,
    destinatarios,
    ticket_id,
    usuario_actor_nombre,
    prioridad,
    leida,
    fecha_creacion
FROM notificaciones_mejoradas 
ORDER BY fecha_creacion DESC;

-- 3. Buscar notificaciones específicas para este usuario
SELECT 
    id,
    tipo,
    mensaje,
    destinatarios,
    ticket_id,
    usuario_actor_nombre,
    prioridad,
    leida,
    fecha_creacion
FROM notificaciones_mejoradas 
WHERE destinatarios LIKE '%ligand2025@gmail.com%'
ORDER BY fecha_creacion DESC;

-- 4. Buscar notificaciones por rol de funcionario
SELECT 
    id,
    tipo,
    mensaje,
    destinatarios,
    ticket_id,
    usuario_actor_nombre,
    prioridad,
    leida,
    fecha_creacion
FROM notificaciones_mejoradas 
WHERE destinatarios LIKE '%rol:funcionario%'
ORDER BY fecha_creacion DESC;

-- 5. Crear notificaciones de prueba para este usuario específico
INSERT INTO notificaciones_mejoradas (
    tipo, 
    mensaje, 
    destinatarios, 
    ticket_id, 
    usuario_actor_id, 
    usuario_actor_email, 
    usuario_actor_nombre, 
    prioridad, 
    leida, 
    fecha_creacion
) VALUES

-- Notificación específica para este usuario
('ticket_creado', 'Tu ticket #1 ha sido creado exitosamente', '["funcionario:ligand2025@gmail.com"]', 1, 1, 'admin@test.com', 'Admin Sistema', 'normal', false, NOW()),

-- Notificación por rol de funcionario
('ticket_asignado', 'Tu ticket #1 fue asignado al técnico Juan Pérez', '["funcionario:ligand2025@gmail.com"]', 1, 1, 'admin@test.com', 'Admin Sistema', 'normal', false, NOW()),

-- Notificación de alta prioridad
('ticket_resuelto', 'Tu ticket #1 ha sido resuelto por Juan Pérez', '["funcionario:ligand2025@gmail.com"]', 1, 2, 'juanperez@gmail.com', 'Juan Pérez', 'normal', false, NOW());

-- 6. Verificar que se insertaron correctamente
SELECT 
    id,
    tipo,
    mensaje,
    destinatarios,
    ticket_id,
    usuario_actor_nombre,
    prioridad,
    leida,
    fecha_creacion
FROM notificaciones_mejoradas 
WHERE destinatarios LIKE '%ligand2025@gmail.com%'
ORDER BY fecha_creacion DESC;

-- 7. Contar notificaciones por tipo de destinatario
SELECT 
    CASE 
        WHEN destinatarios LIKE '%ligand2025@gmail.com%' THEN 'Usuario específico'
        WHEN destinatarios LIKE '%rol:funcionario%' THEN 'Rol funcionario'
        WHEN destinatarios LIKE '%rol:tecnico%' THEN 'Rol técnico'
        WHEN destinatarios LIKE '%rol:administrador%' THEN 'Rol administrador'
        ELSE 'Otro'
    END as tipo_destinatario,
    COUNT(*) as cantidad,
    COUNT(CASE WHEN leida = false THEN 1 END) as no_leidas
FROM notificaciones_mejoradas 
GROUP BY tipo_destinatario;

-- 8. Verificar endpoint del backend
-- El endpoint debería ser: GET /api/notifications/role-based/user/ligand2025@gmail.com
-- Esto se puede probar desde Postman o curl:
-- curl -X GET "http://localhost:8080/api/notifications/role-based/user/ligand2025@gmail.com"

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- Después de ejecutar este script, el usuario ligand2025@gmail.com debería tener:
-- - 3 notificaciones específicas
-- - El modal debería mostrar estas notificaciones
-- - El contador debería mostrar 3 notificaciones no leídas
-- ========================================

