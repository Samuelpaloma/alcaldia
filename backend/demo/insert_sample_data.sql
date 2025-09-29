-- =====================================================
-- SQL PARA INSERTAR DATOS DE MUESTRA EN EL SISTEMA
-- =====================================================

-- 1. VERIFICAR QUE EL TÉCNICO EXISTE
SELECT id_usuario, email, nombre, apellido, tipo_usuario 
FROM usuarios 
WHERE email = 'tecnico@alcaldianevila.gov.co';

-- 2. CREAR CATEGORÍAS SI NO EXISTEN
INSERT IGNORE INTO categorias (nombre, descripcion, activa, fecha_creacion, fecha_actualizacion) VALUES 
('Hardware', 'Problemas relacionados con equipos físicos', true, NOW(), NOW()),
('Software', 'Problemas relacionados con aplicaciones y sistemas', true, NOW(), NOW()),
('Red', 'Problemas de conectividad y red', true, NOW(), NOW()),
('Usuario', 'Solicitudes de soporte de usuario', true, NOW(), NOW());

-- 3. INSERTAR TICKETS EN LA TABLA 'tickets'
-- Obtener IDs necesarios
SET @tecnico_id = (SELECT id_usuario FROM usuarios WHERE email = 'tecnico@alcaldianevila.gov.co');
SET @hardware_id = (SELECT id FROM categorias WHERE nombre = 'Hardware');
SET @software_id = (SELECT id FROM categorias WHERE nombre = 'Software');
SET @red_id = (SELECT id FROM categorias WHERE nombre = 'Red');
SET @usuario_id = (SELECT id FROM categorias WHERE nombre = 'Usuario');

-- Insertar tickets
INSERT INTO tickets (
    consulta, 
    descripcion, 
    prioridad, 
    estado, 
    ubicacion, 
    tecnico_id, 
    creador_id, 
    categoria_id,
    fecha_creacion,
    fecha_actualizacion,
    asunto
) VALUES 
-- Ticket 1: Pendiente - Hardware
(
    'Problema con impresora en oficina 201',
    'La impresora HP LaserJet no está imprimiendo correctamente. Los documentos se quedan en cola.',
    'MEDIA',
    'PENDIENTE',
    'Oficina 201 - Piso 2',
    @tecnico_id,
    @tecnico_id,
    @hardware_id,
    NOW(),
    NOW(),
    'Problema con impresora'
),
-- Ticket 2: En Proceso - Software
(
    'Actualización de software requerida',
    'Necesito actualizar el sistema operativo en los equipos del área administrativa.',
    'ALTA',
    'EN_PROCESO',
    'Área Administrativa',
    @tecnico_id,
    @tecnico_id,
    @software_id,
    NOW(),
    NOW(),
    'Actualización de software'
),
-- Ticket 3: Completado - Red
(
    'Configuración de red WiFi',
    'Configurar nueva red WiFi para el área de reuniones.',
    'BAJA',
    'COMPLETADO',
    'Sala de Reuniones',
    @tecnico_id,
    @tecnico_id,
    @red_id,
    NOW(),
    NOW(),
    'Configuración WiFi'
),
-- Ticket 4: Pendiente - Usuario
(
    'Solicitud de capacitación',
    'El personal necesita capacitación en el nuevo sistema de gestión.',
    'MEDIA',
    'PENDIENTE',
    'Sala de Capacitación',
    @tecnico_id,
    @tecnico_id,
    @usuario_id,
    NOW(),
    NOW(),
    'Capacitación requerida'
),
-- Ticket 5: En Proceso - Hardware
(
    'Mantenimiento preventivo',
    'Realizar mantenimiento preventivo a los servidores del sistema.',
    'ALTA',
    'EN_PROCESO',
    'Sala de Servidores',
    @tecnico_id,
    @tecnico_id,
    @hardware_id,
    NOW(),
    NOW(),
    'Mantenimiento servidores'
);

-- 4. INSERTAR REGISTROS EN 'ticket_accesos' (historial de asignaciones)
-- Obtener IDs de tickets recién creados
SET @ticket1_id = (SELECT id FROM tickets WHERE consulta = 'Problema con impresora en oficina 201' ORDER BY fecha_creacion DESC LIMIT 1);
SET @ticket2_id = (SELECT id FROM tickets WHERE consulta = 'Actualización de software requerida' ORDER BY fecha_creacion DESC LIMIT 1);
SET @ticket3_id = (SELECT id FROM tickets WHERE consulta = 'Configuración de red WiFi' ORDER BY fecha_creacion DESC LIMIT 1);
SET @ticket4_id = (SELECT id FROM tickets WHERE consulta = 'Solicitud de capacitación' ORDER BY fecha_creacion DESC LIMIT 1);
SET @ticket5_id = (SELECT id FROM tickets WHERE consulta = 'Mantenimiento preventivo' ORDER BY fecha_creacion DESC LIMIT 1);

-- Insertar accesos de tickets
INSERT INTO ticket_accesos (ticket_id, tecnico_id, tipo_acceso, activo, fecha_asignacion) VALUES
(@ticket1_id, @tecnico_id, 'ASIGNADO', true, NOW()),
(@ticket2_id, @tecnico_id, 'ASIGNADO', true, NOW()),
(@ticket3_id, @tecnico_id, 'ASIGNADO', true, NOW()),
(@ticket4_id, @tecnico_id, 'ASIGNADO', true, NOW()),
(@ticket5_id, @tecnico_id, 'ASIGNADO', true, NOW());

-- 5. INSERTAR NOTIFICACIONES DE MUESTRA
-- Crear notificaciones para el técnico
INSERT INTO notificaciones (
    titulo,
    mensaje,
    tipo,
    leida,
    fecha_creacion,
    usuario_id,
    ticket_id
) VALUES
(
    'Nuevo ticket asignado',
    'Se te ha asignado un nuevo ticket: "Problema con impresora en oficina 201"',
    'TICKET_ASIGNADO',
    false,
    NOW(),
    @tecnico_id,
    @ticket1_id
),
(
    'Ticket en progreso',
    'El ticket "Actualización de software requerida" está en proceso',
    'TICKET_EN_PROCESO',
    false,
    NOW(),
    @tecnico_id,
    @ticket2_id
),
(
    'Ticket completado',
    'El ticket "Configuración de red WiFi" ha sido completado',
    'TICKET_COMPLETADO',
    true,
    NOW(),
    @tecnico_id,
    @ticket3_id
),
(
    'Nuevo ticket asignado',
    'Se te ha asignado un nuevo ticket: "Solicitud de capacitación"',
    'TICKET_ASIGNADO',
    false,
    NOW(),
    @tecnico_id,
    @ticket4_id
),
(
    'Ticket en progreso',
    'El ticket "Mantenimiento preventivo" está en proceso',
    'TICKET_EN_PROCESO',
    false,
    NOW(),
    @tecnico_id,
    @ticket5_id
);

-- 6. VERIFICAR DATOS INSERTADOS
-- Verificar tickets
SELECT 
    t.id,
    t.consulta,
    t.estado,
    t.prioridad,
    t.ubicacion,
    c.nombre as categoria,
    u.nombre as tecnico_nombre,
    u.email as tecnico_email
FROM tickets t
LEFT JOIN categorias c ON t.categoria_id = c.id
LEFT JOIN usuarios u ON t.tecnico_id = u.id_usuario
WHERE t.tecnico_id = @tecnico_id
ORDER BY t.fecha_creacion DESC;

-- Verificar notificaciones
SELECT 
    n.id,
    n.titulo,
    n.mensaje,
    n.tipo,
    n.leida,
    n.fecha_creacion,
    u.nombre as usuario_nombre
FROM notificaciones n
LEFT JOIN usuarios u ON n.usuario_id = u.id_usuario
WHERE n.usuario_id = @tecnico_id
ORDER BY n.fecha_creacion DESC;

-- Verificar estadísticas
SELECT 
    COUNT(*) as total_tickets,
    SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) as pendientes,
    SUM(CASE WHEN estado = 'EN_PROCESO' THEN 1 ELSE 0 END) as en_proceso,
    SUM(CASE WHEN estado = 'COMPLETADO' THEN 1 ELSE 0 END) as completados
FROM tickets 
WHERE tecnico_id = @tecnico_id;

-- Verificar accesos de tickets
SELECT 
    ta.id,
    t.consulta as ticket_consulta,
    u.nombre as tecnico_nombre,
    ta.tipo_acceso,
    ta.activo,
    ta.fecha_asignacion
FROM ticket_accesos ta
LEFT JOIN tickets t ON ta.ticket_id = t.id
LEFT JOIN usuarios u ON ta.tecnico_id = u.id_usuario
WHERE ta.tecnico_id = @tecnico_id
ORDER BY ta.fecha_asignacion DESC;
