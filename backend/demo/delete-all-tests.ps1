# Script simple para eliminar archivos de prueba
Write-Host "Eliminando archivos de prueba..." -ForegroundColor Red

# Patrones de archivos a eliminar
$patterns = @("test-*", "create-*", "setup-*", "demo-*")

$deletedCount = 0
$errorCount = 0

foreach ($pattern in $patterns) {
    $files = Get-ChildItem -Name $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        try {
            Remove-Item $file -Force
            Write-Host "  [OK] $file" -ForegroundColor Green
            $deletedCount++
        } catch {
            Write-Host "  [ERROR] $file" -ForegroundColor Red
            $errorCount++
        }
    }
}

Write-Host ""
Write-Host "RESUMEN:" -ForegroundColor Yellow
Write-Host "  Archivos eliminados: $deletedCount" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "  Errores: $errorCount" -ForegroundColor Red
}
Write-Host ""
Write-Host "LIMPIEZA COMPLETADA" -ForegroundColor Green
