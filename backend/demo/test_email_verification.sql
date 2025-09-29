-- Script para probar verificación de email
-- Verificar estado actual del usuario técnico
SELECT id_usuario, email, email_verificado, activo, require_2fa 
FROM usuarios 
WHERE email = 'tecnico@alcaldianevila.gov.co';

-- Actualizar para probar verificación de email (desactivar email_verificado)
UPDATE usuarios 
SET email_verificado = false 
WHERE email = 'tecnico@alcaldianevila.gov.co';

-- Verificar que se actualizó correctamente
SELECT id_usuario, email, email_verificado, activo, require_2fa 
FROM usuarios 
WHERE email = 'tecnico@alcaldianevila.gov.co';
