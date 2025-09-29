-- ========================================
-- SCRIPT PARA CREAR NOTIFICACIONES PARA ligand2025@gmail.com
-- ========================================

-- 1. Verificar que el usuario existe
SELECT 
    id_usuario,
    nombre,
    apellido,
    email,
    tipo_usuario,
    activo
FROM usuarios 
WHERE email = 'ligand2025@gmail.com';

-- 2. Limpiar notificaciones existentes para este usuario (opcional)
DELETE FROM notificaciones_mejoradas WHERE destinatarios LIKE '%ligand2025@gmail.com%';

-- 3. Insertar notificaciones de prueba para ligand2025@gmail.com
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

-- Notificaciones específicas para este usuario como funcionario
('ticket_creado', 'Tu ticket #1 ha sido creado exitosamente', '["funcionario:ligand2025@gmail.com"]', 1, 1, 'admin@test.com', 'Admin Sistema', 'normal', false, NOW()),
('ticket_asignado', 'Tu ticket #1 fue asignado al técnico Juan Pérez', '["funcionario:ligand2025@gmail.com"]', 1, 1, 'admin@test.com', 'Admin Sistema', 'normal', false, NOW()),
('ticket_en_proceso', 'Tu ticket #1 está siendo procesado por Juan Pérez', '["funcionario:ligand2025@gmail.com"]', 1, 2, 'juanperez@gmail.com', 'Juan Pérez', 'normal', false, NOW()),
('ticket_resuelto', 'Tu ticket #1 ha sido resuelto por Juan Pérez', '["funcionario:ligand2025@gmail.com"]', 1, 2, 'juanperez@gmail.com', 'Juan Pérez', 'normal', false, NOW()),

-- Notificaciones por rol de funcionario (si el usuario es funcionario)
('ticket_creado', 'Nuevo ticket creado por un funcionario', '["rol:funcionario"]', 2, 1, 'admin@test.com', 'Admin Sistema', 'normal', false, NOW()),
('ticket_asignado', 'Ticket asignado a un funcionario', '["rol:funcionario"]', 2, 1, 'admin@test.com', 'Admin Sistema', 'normal', false, NOW()),

-- Notificaciones de alta prioridad
('sla_vencido', '⚠️ SLA vencido para el ticket #1', '["funcionario:ligand2025@gmail.com"]', 1, NULL, 'Sistema', 'Sistema', 'critica', false, NOW()),
('alerta_sistema', '🚨 Alerta del sistema: Revisar tickets pendientes', '["rol:funcionario"]', NULL, NULL, 'Sistema', 'Sistema', 'alta', false, NOW());

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
WHERE destinatarios LIKE '%ligand2025@gmail.com%' OR destinatarios LIKE '%rol:funcionario%'
ORDER BY fecha_creacion DESC;

-- 5. Contar notificaciones por tipo
SELECT 
    tipo,
    COUNT(*) as cantidad,
    COUNT(CASE WHEN leida = false THEN 1 END) as no_leidas
FROM notificaciones_mejoradas 
WHERE destinatarios LIKE '%ligand2025@gmail.com%' OR destinatarios LIKE '%rol:funcionario%'
GROUP BY tipo;

-- 6. Mostrar resumen final
SELECT 
    'Notificaciones específicas para ligand2025@gmail.com' as tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN leida = false THEN 1 END) as no_leidas
FROM notificaciones_mejoradas 
WHERE destinatarios LIKE '%ligand2025@gmail.com%'

UNION ALL

SELECT 
    'Notificaciones por rol funcionario' as tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN leida = false THEN 1 END) as no_leidas
FROM notificaciones_mejoradas 
WHERE destinatarios LIKE '%rol:funcionario%'

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
-- 1. ligand2025@gmail.com debería tener 4 notificaciones específicas
-- 2. Plus 2 notificaciones por rol funcionario
-- 3. Total: 6 notificaciones no leídas
-- 4. El modal debería mostrar estas notificaciones
-- ========================================

