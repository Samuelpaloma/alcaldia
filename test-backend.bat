@echo off
echo ========================================
echo    PRUEBA DE CONEXION BACKEND
echo ========================================
echo.

echo Probando conexion a http://localhost:8080/api/sla...
echo.

curl -X GET "http://localhost:8080/api/sla" -H "Content-Type: application/json" 2>nul
if %errorlevel% equ 0 (
    echo ✓ Backend responde correctamente
) else (
    echo ✗ Backend no responde
    echo.
    echo Posibles causas:
    echo 1. El backend no esta ejecutandose
    echo 2. El puerto 8080 esta bloqueado
    echo 3. Hay un error en la aplicacion
    echo.
    echo Solucion:
    echo 1. Ejecuta: iniciar-backend-sla.bat
    echo 2. Verifica los logs del backend
)

echo.
echo Probando con PowerShell...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8080/api/sla' -Method GET -ContentType 'application/json'; Write-Host '✓ Backend responde: Status' $response.StatusCode } catch { Write-Host '✗ Error:' $_.Exception.Message }"

echo.
pause
