-- ========================================
-- SCRIPT PARA CORREGIR TICKETS CON CREADOR NULL
-- ========================================

-- 1. Verificar tickets con creador null
SELECT 
    id,
    asunto,
    descripcion,
    categoria,
    estado,
    fecha_creacion,
    creador_id
FROM tickets 
WHERE creador_id IS NULL;

-- 2. Crear un usuario por defecto si no existe
INSERT IGNORE INTO usuarios (
    nombre, 
    apellido, 
    email, 
    password, 
    tipo_usuario, 
    activo, 
    fecha_creacion
) VALUES (
    'Usuario',
    'Sistema',
    'sistema@admin.com',
    '$2a$10$dummy.hash.for.system.user',
    'FUNCIONARIO',
    TRUE,
    NOW()
);

-- 3. Obtener el ID del usuario sistema
SET @usuario_sistema_id = (SELECT id_usuario FROM usuarios WHERE email = 'sistema@admin.com' LIMIT 1);

-- 4. Actualizar tickets con creador null
UPDATE tickets 
SET creador_id = @usuario_sistema_id
WHERE creador_id IS NULL;

-- 5. Verificar que se corrigieron
SELECT 
    COUNT(*) as tickets_corregidos
FROM tickets 
WHERE creador_id = @usuario_sistema_id;

-- 6. Verificar que no quedan tickets con creador null
SELECT 
    COUNT(*) as tickets_sin_creador
FROM tickets 
WHERE creador_id IS NULL;

-- 7. Mostrar resumen de corrección
SELECT 
    'Tickets corregidos' as descripcion,
    COUNT(*) as cantidad
FROM tickets 
WHERE creador_id = @usuario_sistema_id

UNION ALL

SELECT 
    'Tickets sin creador (deberían ser 0)' as descripcion,
    COUNT(*) as cantidad
FROM tickets 
WHERE creador_id IS NULL;

-- ========================================
-- OPCIONAL: Si quieres asignar tickets a usuarios específicos
-- ========================================

-- Ejemplo: Asignar tickets de categoría "Tecnología e IT" a un técnico específico
-- UPDATE tickets 
-- SET creador_id = (
--     SELECT id_usuario 
--     FROM usuarios 
--     WHERE tipo_usuario = 'TECNICO' 
--     AND activo = TRUE 
--     LIMIT 1
-- )
-- WHERE categoria_id = 9 -- ID de "Tecnología e IT"
-- AND creador_id = @usuario_sistema_id;

