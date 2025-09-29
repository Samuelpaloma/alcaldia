@echo off
echo ========================================
echo    INICIANDO BACKEND SLA - ALCALDIA
echo ========================================
echo.

echo Verificando Java...
java -version
if %errorlevel% neq 0 (
    echo ERROR: Java no esta instalado o no esta en el PATH
    pause
    exit /b 1
)

echo.
echo Verificando Maven...
mvn -version
if %errorlevel% neq 0 (
    echo ERROR: Maven no esta instalado o no esta en el PATH
    pause
    exit /b 1
)

echo.
echo Navegando al directorio del backend...
cd /d "D:\trabajo\alcaldia-1\backend\demo"

echo.
echo Limpiando y compilando el proyecto...
mvn clean compile

if %errorlevel% neq 0 (
    echo ERROR: Fallo en la compilacion
    pause
    exit /b 1
)

echo.
echo ========================================
echo    INICIANDO SERVIDOR SPRING BOOT
echo ========================================
echo.
echo El backend se iniciara en: http://localhost:8080
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

mvn spring-boot:run

pause