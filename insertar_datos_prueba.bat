@echo off
echo ========================================
echo INSERTANDO DATOS DE PRUEBA
echo ========================================
echo.

echo Verificando que el backend este corriendo...
curl -s http://localhost:8080/actuator/health > nul
if %errorlevel% == 0 (
    echo ✅ Backend esta corriendo
    echo.
    echo Insertando datos de prueba...
    echo.
    
    echo Creando base de datos...
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS ticket;"
    
    echo Insertando datos...
    mysql -u root ticket < insert_test_data_mysql.sql
    
    if %errorlevel% == 0 (
        echo ✅ Datos insertados correctamente
        echo.
        echo USUARIOS DE PRUEBA DISPONIBLES:
        echo ========================================
        echo SuperAdmin: rarodrigues.300@gmail.com / SuperAdmin123
        echo Admin: roberto.silva@alcaldia.gov.co / Admin123
        echo Tecnico: carlos.mendoza@alcaldia.gov.co / Tecnico123
        echo Funcionario: juan.perez@alcaldia.gov.co / Funcionario123
        echo ========================================
        echo.
        echo ¡Ahora puedes probar el sistema!
    ) else (
        echo ❌ Error insertando datos
        echo.
        echo SOLUCION: Verifica que MySQL este corriendo y que el archivo SQL exista
    )
) else (
    echo ❌ Backend NO esta corriendo
    echo.
    echo SOLUCION: Primero ejecuta solucionar_problema.bat
)

echo.
pause
