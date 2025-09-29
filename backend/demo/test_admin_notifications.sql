-- ========================================
-- SCRIPT PARA PROBAR NOTIFICACIONES DEL ADMINISTRADOR
-- ========================================

-- 1. Verificar usuarios administradores
SELECT 
    id_usuario,
    nombre,
    apellido,
    email,
    tipo_usuario,
    activo
FROM usuarios 
WHERE tipo_usuario = 'ADMINISTRADOR';

-- 2. Limpiar notificaciones existentes para administradores
DELETE FROM notificaciones_mejoradas WHERE destinatarios LIKE '%rol:administrador%';

-- 3. Insertar notificaciones específicas para administradores
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

-- Notificaciones por rol de administrador
('ticket_creado', 'Nuevo ticket creado por Rober Rodrigues (#1)', '["rol:administrador"]', 1, 1, 'admin@test.com', 'Admin Sistema', 'normal', false, NOW()),
('ticket_asignado', 'Has asignado el ticket #1 al técnico Juan Pérez', '["rol:administrador"]', 1, 1, 'admin@test.com', 'Admin Sistema', 'normal', false, NOW()),
('ticket_resuelto', 'El ticket #1 del cliente Rober Rodrigues fue resuelto por Juan Pérez', '["rol:administrador"]', 1, 2, 'juanperez@gmail.com', 'Juan Pérez', 'normal', false, NOW()),
('ticket_cerrado', 'El ticket #1 del cliente Rober Rodrigues fue cerrado por Juan Pérez', '["rol:administrador"]', 1, 2, 'juanperez@gmail.com', 'Juan Pérez', 'normal', false, NOW()),
('comentario_agregado', 'El cliente ligand2025@gmail.com agregó un comentario al ticket #1', '["rol:administrador"]', 1, 3, 'ligand2025@gmail.com', 'Rober Rodrigues', 'normal', false, NOW()),

-- Notificaciones específicas para administradores por email
('ticket_creado', 'Nuevo ticket creado por ligand2025@gmail.com (#2)', '["administrador:rarodrigues.300@gmail.com"]', 2, 3, 'ligand2025@gmail.com', 'Rober Rodrigues', 'normal', false, NOW()),
('ticket_asignado', 'Has asignado el ticket #2 al técnico Carlos López', '["administrador:rarodrigues.300@gmail.com"]', 2, 1, 'admin@test.com', 'Admin Sistema', 'normal', false, NOW()),

-- Notificaciones de alta prioridad para administradores
('sla_vencido', '⚠️ SLA vencido para el ticket #1 - Requiere atención inmediata', '["rol:administrador"]', 1, NULL, 'Sistema', 'Sistema', 'critica', false, NOW()),
('alerta_sistema', '🚨 Alerta del sistema: 3 tickets pendientes de asignación', '["rol:administrador"]', NULL, NULL, 'Sistema', 'Sistema', 'alta', false, NOW());

-- 4. Verificar que se insertaron correctamente
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
WHERE destinatarios LIKE '%rol:administrador%' OR destinatarios LIKE '%administrador:%'
ORDER BY fecha_creacion DESC;

-- 5. Contar notificaciones por tipo para administradores
SELECT 
    tipo,
    COUNT(*) as cantidad,
    COUNT(CASE WHEN leida = false THEN 1 END) as no_leidas
FROM notificaciones_mejoradas 
WHERE destinatarios LIKE '%rol:administrador%' OR destinatarios LIKE '%administrador:%'
GROUP BY tipo;

-- 6. Mostrar resumen final para administradores
SELECT 
    'Notificaciones por rol administrador' as tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN leida = false THEN 1 END) as no_leidas
FROM notificaciones_mejoradas 
WHERE destinatarios LIKE '%rol:administrador%'

UNION ALL

SELECT 
    'Notificaciones específicas por email admin' as tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN leida = false THEN 1 END) as no_leidas
FROM notificaciones_mejoradas 
WHERE destinatarios LIKE '%administrador:%'

UNION ALL

SELECT 
    'Total notificaciones en BD' as tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN leida = false THEN 1 END) as no_leidas
FROM notificaciones_mejoradas;

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- Después de ejecutar este script:
-- 1. Los administradores deberían ver 5 notificaciones por rol
-- 2. Plus 2 notificaciones específicas por email
-- 3. Total: 7 notificaciones no leídas para administradores
-- 4. El modal del administrador debería mostrar estas notificaciones
-- 5. Las acciones del admin (asignar, comentar, etc.) deberían crear nuevas notificaciones
-- ========================================

