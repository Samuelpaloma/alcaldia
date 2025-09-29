@echo off
echo ========================================
echo    VERIFICACION BACKEND SLA
echo ========================================
echo.

echo 1. Verificando si el puerto 8080 esta en uso...
netstat -an | findstr :8080
if %errorlevel% equ 0 (
    echo ✓ Puerto 8080 esta en uso - Backend probablemente ejecutandose
) else (
    echo ✗ Puerto 8080 no esta en uso - Backend no esta ejecutandose
)

echo.
echo 2. Verificando conexion a MySQL...
echo Intentando conectar a MySQL en localhost:3306...
mysql -u root -p -e "SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo ✓ MySQL esta disponible
) else (
    echo ✗ MySQL no esta disponible o no se puede conectar
    echo   Asegurate de que MySQL este ejecutandose
)

echo.
echo 3. Verificando archivos del backend...
if exist "D:\trabajo\alcaldia-1\backend\demo\pom.xml" (
    echo ✓ Archivo pom.xml encontrado
) else (
    echo ✗ Archivo pom.xml no encontrado
)

if exist "D:\trabajo\alcaldia-1\backend\demo\src\main\java\com\example\demo\sla" (
    echo ✓ Directorio SLA encontrado
) else (
    echo ✗ Directorio SLA no encontrado
)

echo.
echo 4. Verificando configuracion de aplicacion...
if exist "D:\trabajo\alcaldia-1\backend\demo\src\main\resources\application.properties" (
    echo ✓ Archivo application.properties encontrado
    echo.
    echo Contenido de application.properties:
    echo ----------------------------------------
    type "D:\trabajo\alcaldia-1\backend\demo\src\main\resources\application.properties"
    echo ----------------------------------------
) else (
    echo ✗ Archivo application.properties no encontrado
)

echo.
echo ========================================
echo    INSTRUCCIONES
echo ========================================
echo.
echo Si el backend no esta ejecutandose:
echo 1. Ejecuta: iniciar-backend-sla.bat
echo.
echo Si MySQL no esta disponible:
echo 1. Inicia el servicio MySQL
echo 2. Verifica que la base de datos 'ticket' exista
echo.
echo Si hay errores de compilacion:
echo 1. Verifica que Java y Maven esten instalados
echo 2. Ejecuta: mvn clean install
echo.

pause