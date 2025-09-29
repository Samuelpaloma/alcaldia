-- Script para crear tickets de muestra para el técnico
-- Ejecutar después de que el servidor esté funcionando

-- Primero, verificar que el técnico existe
SELECT id_usuario, email, nombre, apellido, tipo_usuario 
FROM usuarios 
WHERE email = 'tecnico@alcaldianevila.gov.co';

-- Crear categorías de ejemplo si no existen
INSERT IGNORE INTO categorias (nombre, descripcion, activa) VALUES 
('Hardware', 'Problemas relacionados con equipos físicos', true),
('Software', 'Problemas relacionados con aplicaciones y sistemas', true),
('Red', 'Problemas de conectividad y red', true),
('Usuario', 'Solicitudes de soporte de usuario', true);

-- Crear tickets de muestra para el técnico
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
    fecha_actualizacion
) VALUES 
-- Ticket 1: Pendiente
(
    'Problema con impresora en oficina 201',
    'La impresora HP LaserJet no está imprimiendo correctamente. Los documentos se quedan en cola.',
    'MEDIA',
    'PENDIENTE',
    'Oficina 201 - Piso 2',
    (SELECT id_usuario FROM usuarios WHERE email = 'tecnico@alcaldianevila.gov.co'),
    (SELECT id_usuario FROM usuarios WHERE email = 'tecnico@alcaldianevila.gov.co'),
    (SELECT id FROM categorias WHERE nombre = 'Hardware'),
    NOW(),
    NOW()
),
-- Ticket 2: En Proceso
(
    'Actualización de software requerida',
    'Necesito actualizar el sistema operativo en los equipos del área administrativa.',
    'ALTA',
    'EN_PROCESO',
    'Área Administrativa',
    (SELECT id_usuario FROM usuarios WHERE email = 'tecnico@alcaldianevila.gov.co'),
    (SELECT id_usuario FROM usuarios WHERE email = 'tecnico@alcaldianevila.gov.co'),
    (SELECT id FROM categorias WHERE nombre = 'Software'),
    NOW(),
    NOW()
),
-- Ticket 3: Completado
(
    'Configuración de red WiFi',
    'Configurar nueva red WiFi para el área de reuniones.',
    'BAJA',
    'COMPLETADO',
    'Sala de Reuniones',
    (SELECT id_usuario FROM usuarios WHERE email = 'tecnico@alcaldianevila.gov.co'),
    (SELECT id_usuario FROM usuarios WHERE email = 'tecnico@alcaldianevila.gov.co'),
    (SELECT id FROM categorias WHERE nombre = 'Red'),
    NOW(),
    NOW()
),
-- Ticket 4: Pendiente
(
    'Solicitud de capacitación',
    'El personal necesita capacitación en el nuevo sistema de gestión.',
    'MEDIA',
    'PENDIENTE',
    'Sala de Capacitación',
    (SELECT id_usuario FROM usuarios WHERE email = 'tecnico@alcaldianevila.gov.co'),
    (SELECT id_usuario FROM usuarios WHERE email = 'tecnico@alcaldianevila.gov.co'),
    (SELECT id FROM categorias WHERE nombre = 'Usuario'),
    NOW(),
    NOW()
),
-- Ticket 5: En Proceso
(
    'Mantenimiento preventivo',
    'Realizar mantenimiento preventivo a los servidores del sistema.',
    'ALTA',
    'EN_PROCESO',
    'Sala de Servidores',
    (SELECT id_usuario FROM usuarios WHERE email = 'tecnico@alcaldianevila.gov.co'),
    (SELECT id_usuario FROM usuarios WHERE email = 'tecnico@alcaldianevila.gov.co'),
    (SELECT id FROM categorias WHERE nombre = 'Hardware'),
    NOW(),
    NOW()
);

-- Verificar los tickets creados
SELECT 
    t.id,
    t.consulta,
    t.estado,
    t.prioridad,
    t.ubicacion,
    c.nombre as categoria,
    u.nombre as tecnico_nombre
FROM tickets t
LEFT JOIN categorias c ON t.categoria_id = c.id
LEFT JOIN usuarios u ON t.tecnico_id = u.id_usuario
WHERE t.tecnico_id = (SELECT id_usuario FROM usuarios WHERE email = 'tecnico@alcaldianevila.gov.co')
ORDER BY t.fecha_creacion DESC;

-- Mostrar estadísticas
SELECT 
    COUNT(*) as total_tickets,
    SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) as pendientes,
    SUM(CASE WHEN estado = 'EN_PROCESO' THEN 1 ELSE 0 END) as en_proceso,
    SUM(CASE WHEN estado = 'COMPLETADO' THEN 1 ELSE 0 END) as completados
FROM tickets 
WHERE tecnico_id = (SELECT id_usuario FROM usuarios WHERE email = 'tecnico@alcaldianevila.gov.co');
