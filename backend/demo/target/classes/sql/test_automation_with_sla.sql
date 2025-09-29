-- Script para probar reglas de automatización con SLA
-- Ejecutar después de insertar los tickets de prueba

-- 1. Verificar reglas de automatización existentes
SELECT '=== REGLAS DE AUTOMATIZACIÓN ===' as info;
SELECT 
    id,
    nombre,
    descripcion,
    condicion,
    accion,
    prioridad,
    activa,
    ejecuciones,
    ultima_ejecucion
FROM automation_rules
ORDER BY id;

-- 2. Insertar reglas de automatización que usen SLA
INSERT INTO automation_rules (
    nombre, 
    descripcion, 
    condicion, 
    accion, 
    prioridad, 
    activa, 
    fecha_creacion, 
    ejecuciones
) VALUES 
-- Regla 1: Escalación por SLA vencido
(
    'Escalación por SLA vencido',
    'Escala automáticamente tickets con SLA vencido a prioridad crítica',
    'slaVencido == true',
    'Cambiar prioridad a CRITICA y notificar supervisor',
    'high',
    TRUE,
    NOW(),
    0
),

-- Regla 2: Asignación automática por categoría y prioridad
(
    'Asignación automática Redes - Alta Prioridad',
    'Asigna automáticamente tickets de redes con prioridad alta a técnico especializado',
    'categoria == "Redes" AND prioridad == "ALTA"',
    'Asignar a técnico especializado en redes',
    'high',
    TRUE,
    NOW(),
    0
),

-- Regla 3: Notificación de SLA próximo a vencer
(
    'Notificación SLA próximo a vencer',
    'Notifica cuando un ticket está próximo a vencer su SLA de respuesta',
    'tiempo_restante_sla < 30 AND estado == "PENDIENTE"',
    'Enviar notificación de alerta de SLA',
    'medium',
    TRUE,
    NOW(),
    0
),

-- Regla 4: Cierre automático de tickets resueltos
(
    'Cierre automático de tickets resueltos',
    'Cierra automáticamente tickets que han sido resueltos por más de 24 horas',
    'estado == "RESUELTO" AND fecha_resolucion < DATE_SUB(NOW(), INTERVAL 24 HOUR)',
    'Cambiar estado a CERRADO',
    'low',
    TRUE,
    NOW(),
    0
);

-- 3. Verificar tickets que cumplen las condiciones de las reglas
SELECT '=== TICKETS QUE CUMPLEN CONDICIONES DE REGLAS ===' as info;

-- Regla 1: SLA vencido
SELECT 
    'Regla 1: SLA vencido' as regla,
    t.id,
    t.asunto,
    t.prioridad,
    t.estado,
    t.sla_vencido,
    'slaVencido == true' as condicion
FROM tickets t
WHERE t.sla_vencido = TRUE
  AND t.estado IN ('PENDIENTE', 'EN_PROGRESO');

-- Regla 2: Redes - Alta Prioridad
SELECT 
    'Regla 2: Redes - Alta Prioridad' as regla,
    t.id,
    t.asunto,
    t.prioridad,
    t.estado,
    t.categoria_nombre,
    'categoria == "Redes" AND prioridad == "ALTA"' as condicion
FROM tickets t
WHERE t.categoria_nombre = 'Redes' 
  AND t.prioridad = 'ALTA'
  AND t.estado IN ('PENDIENTE', 'EN_PROGRESO');

-- Regla 3: SLA próximo a vencer (menos de 30 minutos)
SELECT 
    'Regla 3: SLA próximo a vencer' as regla,
    t.id,
    t.asunto,
    t.prioridad,
    t.estado,
    t.sla_respuesta_vencimiento,
    CASE 
        WHEN t.sla_respuesta_vencimiento > NOW() THEN 
            TIMESTAMPDIFF(MINUTE, NOW(), t.sla_respuesta_vencimiento)
        ELSE 0
    END as minutos_restantes,
    'tiempo_restante_sla < 30 AND estado == "PENDIENTE"' as condicion
FROM tickets t
WHERE t.estado = 'PENDIENTE'
  AND t.sla_respuesta_vencimiento IS NOT NULL
  AND t.sla_respuesta_vencimiento > NOW()
  AND t.sla_respuesta_vencimiento <= DATE_ADD(NOW(), INTERVAL 30 MINUTE);

-- Regla 4: Tickets resueltos por más de 24 horas
SELECT 
    'Regla 4: Tickets resueltos > 24h' as regla,
    t.id,
    t.asunto,
    t.prioridad,
    t.estado,
    t.fecha_resolucion,
    TIMESTAMPDIFF(HOUR, t.fecha_resolucion, NOW()) as horas_resuelto,
    'estado == "RESUELTO" AND fecha_resolucion < DATE_SUB(NOW(), INTERVAL 24 HOUR)' as condicion
FROM tickets t
WHERE t.estado = 'RESUELTO'
  AND t.fecha_resolucion < DATE_SUB(NOW(), INTERVAL 24 HOUR);

-- 4. Simular ejecución de reglas (actualizar campos según las acciones)
-- Regla 1: Cambiar prioridad a CRITICA para tickets con SLA vencido
UPDATE tickets 
SET prioridad = 'CRITICA',
    fecha_actualizacion = NOW()
WHERE sla_vencido = TRUE
  AND estado IN ('PENDIENTE', 'EN_PROGRESO')
  AND prioridad != 'CRITICA';

-- Regla 2: Asignar tickets de Redes - Alta Prioridad (simular asignación)
UPDATE tickets 
SET estado = 'EN_PROGRESO',
    fecha_actualizacion = NOW()
WHERE categoria_nombre = 'Redes' 
  AND prioridad = 'ALTA'
  AND estado = 'PENDIENTE';

-- Regla 4: Cerrar tickets resueltos por más de 24 horas
UPDATE tickets 
SET estado = 'CERRADO',
    fecha_actualizacion = NOW()
WHERE estado = 'RESUELTO'
  AND fecha_resolucion < DATE_SUB(NOW(), INTERVAL 24 HOUR);

-- 5. Actualizar contadores de ejecución de reglas
UPDATE automation_rules 
SET ejecuciones = ejecuciones + 1,
    ultima_ejecucion = NOW()
WHERE activa = TRUE;

-- 6. Verificar resultados de la automatización
SELECT '=== RESULTADOS DE AUTOMATIZACIÓN ===' as info;
SELECT 
    t.id,
    t.asunto,
    t.prioridad,
    t.estado,
    t.categoria_nombre,
    t.sla_vencido,
    t.sla_alerta_enviada,
    t.fecha_actualizacion,
    CASE 
        WHEN t.prioridad = 'CRITICA' AND t.sla_vencido = TRUE THEN 'Escalado por SLA vencido'
        WHEN t.estado = 'EN_PROGRESO' AND t.categoria_nombre = 'Redes' AND t.prioridad = 'ALTA' THEN 'Asignado automáticamente'
        WHEN t.estado = 'CERRADO' AND t.fecha_resolucion < DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 'Cerrado automáticamente'
        ELSE 'Sin automatización aplicada'
    END as accion_aplicada
FROM tickets t
WHERE t.fecha_actualizacion >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY t.fecha_actualizacion DESC;

-- 7. Verificar estadísticas de reglas de automatización
SELECT '=== ESTADÍSTICAS DE REGLAS ===' as info;
SELECT 
    ar.nombre,
    ar.descripcion,
    ar.ejecuciones,
    ar.ultima_ejecucion,
    ar.activa
FROM automation_rules ar
ORDER BY ar.ejecuciones DESC;
