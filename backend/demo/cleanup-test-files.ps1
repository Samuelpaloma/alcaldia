# Script para eliminar archivos de prueba
Write-Host "========================================" -ForegroundColor Red
Write-Host "    ELIMINANDO ARCHIVOS DE PRUEBA" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red

Write-Host ""
Write-Host "Este script eliminará todos los archivos de prueba creados." -ForegroundColor Yellow
Write-Host ""

# Lista de archivos de prueba a eliminar
$testFiles = @(
    "test-auth-debug.ps1",
    "test-auth-simple.ps1", 
    "test-auth-complete.ps1",
    "test-token.ps1",
    "test-token-format.ps1",
    "test-download-debug.ps1",
    "test-generar-reporte.ps1",
    "test-deshabilitar-simulacion.ps1",
    "test-generar-reporte.bat",
    "test-deshabilitar-simulacion.bat",
    "test-simulacion.bat",
    "test-simulacion.ps1",
    "test-simular-tiempo.bat",
    "test-reportes-automaticos.bat",
    "test-simple.bat",
    "test-stats.bat",
    "create-admin-user.sql",
    "create-users-via-api.ps1",
    "setup-database.ps1",
    "setup-complete.ps1",
    "demo-completo.ps1",
    "start-server.ps1",
    "run.ps1"
)

Write-Host "Archivos de prueba encontrados:" -ForegroundColor Yellow
$foundFiles = @()
foreach ($file in $testFiles) {
    if (Test-Path $file) {
        $foundFiles += $file
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (no encontrado)" -ForegroundColor Gray
    }
}

if ($foundFiles.Count -eq 0) {
    Write-Host ""
    Write-Host "No se encontraron archivos de prueba para eliminar." -ForegroundColor Yellow
    Read-Host "Presiona Enter para continuar"
    exit
}

Write-Host ""
Write-Host "Se eliminarán $($foundFiles.Count) archivos de prueba." -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "¿Estás seguro de que quieres eliminar estos archivos? (s/N)"
if ($confirm -ne "s" -and $confirm -ne "S" -and $confirm -ne "si" -and $confirm -ne "SI") {
    Write-Host "Operación cancelada." -ForegroundColor Yellow
    Read-Host "Presiona Enter para continuar"
    exit
}

Write-Host ""
Write-Host "Eliminando archivos..." -ForegroundColor Yellow

$deletedCount = 0
$errorCount = 0

foreach ($file in $foundFiles) {
    try {
        Remove-Item $file -Force
        Write-Host "  ✅ Eliminado: $file" -ForegroundColor Green
        $deletedCount++
    } catch {
        Write-Host "  ❌ Error eliminando: $file - $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "    LIMPIEZA COMPLETADA" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Archivos eliminados: $deletedCount" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "Errores: $errorCount" -ForegroundColor Red
}
Write-Host ""

# Verificar si quedan archivos de prueba
Write-Host "Verificando archivos restantes..." -ForegroundColor Yellow
$remainingFiles = @()
foreach ($file in $testFiles) {
    if (Test-Path $file) {
        $remainingFiles += $file
    }
}

if ($remainingFiles.Count -eq 0) {
    Write-Host "✅ Todos los archivos de prueba han sido eliminados." -ForegroundColor Green
} else {
    Write-Host "⚠️  Quedan $($remainingFiles.Count) archivos:" -ForegroundColor Yellow
    foreach ($file in $remainingFiles) {
        Write-Host "  - $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Archivos del sistema que NO se eliminaron:" -ForegroundColor Cyan
Write-Host "  - mvnw.cmd (Maven wrapper)" -ForegroundColor White
Write-Host "  - pom.xml (Configuración Maven)" -ForegroundColor White
Write-Host "  - src/ (Código fuente)" -ForegroundColor White
Write-Host "  - target/ (Archivos compilados)" -ForegroundColor White
Write-Host "  - uploads/ (Archivos subidos)" -ForegroundColor White
Write-Host ""
Read-Host "Presiona Enter para continuar"
