@echo off
echo ========================================
echo    REINICIANDO BACKEND SLA
echo ========================================
echo.

echo 1. Deteniendo procesos Java en puerto 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do (
    echo Matando proceso %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo 2. Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo.
echo 3. Limpiando y compilando...
cd /d "D:\trabajo\alcaldia-1\backend\demo"
mvn clean compile -q

echo.
echo 4. Iniciando backend...
echo.
echo ========================================
echo    BACKEND INICIANDO...
echo ========================================
echo.
echo El backend se iniciara en: http://localhost:8080
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

mvn spring-boot:run
