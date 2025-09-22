@echo off
echo ========================================
echo SOLUCIONANDO PROBLEMA DEL BACKEND
echo ========================================
echo.

echo 1. Verificando si MySQL esta corriendo...
netstat -an | findstr :3306
if %errorlevel% == 0 (
    echo ✅ MySQL esta corriendo
) else (
    echo ❌ MySQL NO esta corriendo
    echo.
    echo SOLUCION: Inicia MySQL desde XAMPP o ejecuta:
    echo net start mysql
    echo.
    pause
    exit /b 1
)

echo.
echo 2. Verificando si el backend esta corriendo...
netstat -an | findstr :8080
if %errorlevel% == 0 (
    echo ✅ Backend esta corriendo
    echo.
    echo 3. Probando conexion al backend...
    curl -s http://localhost:8080/actuator/health
    if %errorlevel% == 0 (
        echo ✅ Backend responde correctamente
    ) else (
        echo ❌ Backend no responde correctamente
    )
) else (
    echo ❌ Backend NO esta corriendo
    echo.
    echo 3. Iniciando backend...
    cd backend\demo
    echo Compilando proyecto...
    mvn clean compile -q
    if %errorlevel% == 0 (
        echo ✅ Compilacion exitosa
        echo.
        echo Iniciando servidor Spring Boot...
        echo NOTA: Deja esta ventana abierta mientras usas el sistema
        echo.
        mvn spring-boot:run
    ) else (
        echo ❌ Error en la compilacion
        echo.
        echo SOLUCION: Verifica que Java y Maven esten instalados
        echo java -version
        echo mvn -version
    )
)

echo.
echo ========================================
echo INSTRUCCIONES:
echo ========================================
echo 1. Si MySQL no esta corriendo: Inicia XAMPP
echo 2. Si el backend no esta corriendo: Ejecuta este script
echo 3. Una vez que ambos esten corriendo, prueba el frontend
echo 4. Usa: rarodrigues.300@gmail.com / SuperAdmin123
echo ========================================
pause
