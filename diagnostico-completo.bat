@echo off
echo ========================================
echo DIAGNOSTICO COMPLETO DEL SISTEMA SLA
echo ========================================
echo.

echo 1. VERIFICANDO JAVA...
java -version
if %errorlevel% neq 0 (
    echo ❌ Java no esta instalado
    goto :error
)
echo ✅ Java OK
echo.

echo 2. VERIFICANDO MAVEN...
mvn -version
if %errorlevel% neq 0 (
    echo ❌ Maven no esta instalado
    goto :error
)
echo ✅ Maven OK
echo.

echo 3. VERIFICANDO MYSQL...
echo    Verificando si MySQL esta ejecutandose...
netstat -an | findstr :3306
if %errorlevel% neq 0 (
    echo ⚠️ MySQL no parece estar ejecutandose en puerto 3306
    echo    Asegurate de iniciar MySQL antes de ejecutar el backend
) else (
    echo ✅ MySQL esta ejecutandose
)
echo.

echo 4. VERIFICANDO PUERTO 8080...
netstat -an | findstr :8080
if %errorlevel% neq 0 (
    echo ⚠️ Puerto 8080 libre - Backend no ejecutandose
) else (
    echo ✅ Puerto 8080 en uso - Backend probablemente ejecutandose
)
echo.

echo 5. PROBANDO CONEXION AL BACKEND...
curl -s -o nul -w "%%{http_code}" http://localhost:8080/api/sla
if %errorlevel% equ 0 (
    echo ✅ Backend responde correctamente
) else (
    echo ❌ Backend no responde
)
echo.

echo 6. VERIFICANDO ARCHIVOS DEL BACKEND...
if exist "backend\demo\pom.xml" (
    echo ✅ Archivo pom.xml encontrado
) else (
    echo ❌ Archivo pom.xml no encontrado
    goto :error
)

if exist "backend\demo\src\main\java\com\example\demo\sla\controller\SLAConfigurationController.java" (
    echo ✅ Controlador SLA encontrado
) else (
    echo ❌ Controlador SLA no encontrado
    goto :error
)
echo.

echo ========================================
echo RESUMEN DEL DIAGNOSTICO
echo ========================================
echo.

echo Si todos los checks estan OK, ejecuta:
echo    iniciar-backend-sla.bat
echo.
echo Si hay errores, solucionalos antes de continuar.
echo.

goto :end

:error
echo.
echo ========================================
echo ERRORES ENCONTRADOS
echo ========================================
echo.
echo Por favor soluciona los errores antes de continuar.
echo.

:end
pause
