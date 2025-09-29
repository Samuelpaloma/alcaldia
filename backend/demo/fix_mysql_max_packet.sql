-- Aumentar el límite de max_allowed_packet en MySQL
-- Ejecutar como administrador de MySQL

SET GLOBAL max_allowed_packet = 67108864; -- 64MB

-- Verificar el cambio
SHOW VARIABLES LIKE 'max_allowed_packet';

-- Nota: Para hacer este cambio permanente, agregar al archivo my.cnf:
-- [mysqld]
-- max_allowed_packet = 64M
