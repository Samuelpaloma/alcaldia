@echo off
echo Iniciando el backend de la aplicacion...
echo.
echo Verificando que Java este instalado...
java -version
echo.
echo Navegando al directorio del backend...
cd backend\demo
echo.
echo Compilando el proyecto...
call mvn clean compile
echo.
echo Iniciando el servidor Spring Boot...
echo El servidor estara disponible en: http://localhost:8080
echo.
call mvn spring-boot:run
pause
