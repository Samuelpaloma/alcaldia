# Script de PowerShell para iniciar el servidor
Write-Host "========================================" -ForegroundColor Green
Write-Host "    INICIANDO SERVIDOR SPRING BOOT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Iniciando servidor..." -ForegroundColor Yellow
.\mvnw.cmd spring-boot:run

Write-Host ""
Write-Host "Servidor iniciado en: http://localhost:8080" -ForegroundColor Green
Write-Host "Frontend disponible en: http://localhost:3000" -ForegroundColor Green
