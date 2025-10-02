# Script de PowerShell para compilar y ejecutar
Write-Host "========================================" -ForegroundColor Green
Write-Host "    COMPILANDO Y EJECUTANDO PROYECTO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "1. Compilando proyecto..." -ForegroundColor Yellow
.\mvnw.cmd compile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilación exitosa!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "2. Iniciando servidor..." -ForegroundColor Yellow
    Write-Host "Servidor disponible en: http://localhost:8080" -ForegroundColor Cyan
    Write-Host "Frontend disponible en: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para detener el servidor: Ctrl+C" -ForegroundColor Red
    Write-Host ""
    
    .\mvnw.cmd spring-boot:run
} else {
    Write-Host "❌ Error en la compilación!" -ForegroundColor Red
    Write-Host "Revisa los errores arriba." -ForegroundColor Red
}
