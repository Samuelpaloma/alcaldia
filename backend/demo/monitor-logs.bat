@echo off
echo ========================================
echo    MONITOR DE LOGS DE REPORTES
echo ========================================
echo.
echo Este script monitorea los logs de reportes en tiempo real
echo Presiona Ctrl+C para salir
echo.

REM Crear directorio de logs si no existe
if not exist "logs" mkdir logs

echo Iniciando monitoreo de logs...
echo.

REM Monitorear logs en tiempo real
powershell -Command "Get-Content -Path 'logs\reports-debug.log' -Wait -Tail 50"
