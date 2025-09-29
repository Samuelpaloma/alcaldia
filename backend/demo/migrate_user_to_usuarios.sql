-- Script para migrar datos de la tabla 'user' a 'usuarios'
-- Ejecutar este script después de agregar los campos faltantes a la entidad Usuario

-- 1. Insertar usuarios de la tabla 'user' que no existan en 'usuarios'
INSERT INTO usuarios (
    email, 
    password_hash, 
    nombre, 
    apellido, 
    telefono, 
    tipo_usuario, 
    activo, 
    require_2fa, 
    email_verificado, 
    password_temporal,
    ultimo_acceso, 
    fecha_creacion, 
    fecha_actualizacion, 
    device_token, 
    rol
)
SELECT 
    u.email,
    u.password as password_hash,
    u.nombre,
    u.apellido,
    u.telefono,
    u.tipo_usuario,
    u.activo,
    u.require_2fa,
    u.email_verificado,
    false as password_temporal, -- Por defecto no es temporal
    u.ultimo_acceso,
    u.fecha_creacion,
    u.fecha_actualizacion,
    u.device_token,
    u.rol
FROM user u
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios us WHERE us.email = u.email
);

-- 2. Verificar la migración
SELECT 
    'user' as tabla, 
    COUNT(*) as total_registros 
FROM user
UNION ALL
SELECT 
    'usuarios' as tabla, 
    COUNT(*) as total_registros 
FROM usuarios;

-- 3. Mostrar usuarios migrados
SELECT 
    id_usuario,
    email,
    nombre,
    apellido,
    tipo_usuario,
    activo,
    device_token,
    rol
FROM usuarios 
WHERE email IN (SELECT email FROM user)
ORDER BY fecha_creacion;
