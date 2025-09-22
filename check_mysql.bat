@echo off
echo Verificando estado de MySQL...
echo.

echo Verificando si MySQL esta corriendo...
netstat -an | findstr :3306
if %errorlevel% == 0 (
    echo MySQL esta corriendo en el puerto 3306
) else (
    echo MySQL NO esta corriendo en el puerto 3306
    echo.
    echo Para iniciar MySQL:
    echo 1. Abre XAMPP Control Panel
    echo 2. Inicia MySQL
    echo 3. O ejecuta: net start mysql
)

echo.
echo Verificando si el backend esta corriendo...
netstat -an | findstr :8080
if %errorlevel% == 0 (
    echo Backend esta corriendo en el puerto 8080
) else (
    echo Backend NO esta corriendo en el puerto 8080
    echo.
    echo Para iniciar el backend:
    echo 1. Ejecuta: start_backend.bat
    echo 2. O ejecuta: cd backend\demo && mvn spring-boot:run
)

pause
