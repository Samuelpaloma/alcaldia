# Script simple para eliminar archivos de prueba
Write-Host "ELIMINANDO ARCHIVOS DE PRUEBA..." -ForegroundColor Red

# Lista de patrones de archivos de prueba
$patterns = @(
    "test-*",
    "create-*", 
    "setup-*",
    "demo-*",
    "cleanup-*"
)

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
            Write-Host "  [ERROR] $file - Error" -ForegroundColor Red
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
