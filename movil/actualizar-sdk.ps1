# Script para actualizar Expo SDK a la versión 54
# Ejecutar desde la carpeta movil

Write-Host "🚀 Actualizando Expo SDK a la versión 54..." -ForegroundColor Green

# Limpiar node_modules y package-lock.json
Write-Host "🧹 Limpiando archivos anteriores..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ node_modules eliminado" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "✅ package-lock.json eliminado" -ForegroundColor Green
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias actualizadas..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
    exit 1
}

# Verificar configuración
Write-Host "🔍 Verificando configuración..." -ForegroundColor Yellow
npx expo doctor

# Limpiar caché de Metro
Write-Host "🧹 Limpiando caché de Metro..." -ForegroundColor Yellow
npx expo start --clear --no-dev --minify

Write-Host "🎉 Actualización completada!" -ForegroundColor Green
Write-Host "📱 Ahora puedes escanear el código QR con Expo Go" -ForegroundColor Cyan
Write-Host "💡 Ejecuta 'npx expo start' para iniciar el servidor" -ForegroundColor Cyan
