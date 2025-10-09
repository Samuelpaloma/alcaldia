-- Script simple para resetear contraseña del administrador
-- Ejecutar en MySQL Workbench o consola de MySQL

USE tickets;

-- Ver el usuario actual
SELECT 
    id_usuario,
    email,
    nombre,
    apellido,
    tipo_usuario,
    activo
FROM usuarios 
WHERE email = 'admin@alcaldianevila.gov.co';

-- Cambiar contraseña a "123456" (hash bcrypt conocido)
-- Este hash corresponde a la contraseña "123456"
UPDATE usuarios 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@alcaldianevila.gov.co';

-- Verificar el cambio
SELECT 
    id_usuario,
    email,
    nombre,
    apellido,
    tipo_usuario,
    activo
FROM usuarios 
WHERE email = 'admin@alcaldianevila.gov.co';

-- Mensaje de confirmación
SELECT 'Contraseña cambiada a: 123456' as mensaje;

