@echo off
echo ========================================
echo INICIANDO BACKEND DEL SISTEMA DE TICKETS
echo ========================================
echo.

echo 1. Verificando directorio...
cd /d "%~dp0"
cd backend\demo

echo 2. Compilando proyecto...
call mvn clean compile -q
if %errorlevel% neq 0 (
    echo ERROR: No se pudo compilar el proyecto
    echo Verifica que Java y Maven esten instalados
    pause
    exit /b 1
)

echo 3. Iniciando servidor Spring Boot...
echo NOTA: Deja esta ventana abierta mientras usas el sistema
echo.
echo El backend estara disponible en: http://localhost:8080
echo.
call mvn spring-boot:run
