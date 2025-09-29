# Script de pruebas para el sistema de notificaciones por roles
# Ejecutar desde PowerShell en el directorio backend/demo

Write-Host "🧪 INICIANDO PRUEBAS DEL SISTEMA DE NOTIFICACIONES POR ROLES" -ForegroundColor Green
Write-Host "=" * 60

# Configuración
$baseUrl = "http://localhost:8080/api"
$testEmail = "ligand2025@gmail.com"

Write-Host "📋 Configuración de pruebas:" -ForegroundColor Yellow
Write-Host "   Base URL: $baseUrl"
Write-Host "   Email de prueba: $testEmail"
Write-Host ""

# Función para hacer peticiones HTTP
function Invoke-TestRequest {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Body = $null
    )
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Body) {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -Body $Body
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers
        }
        
        return $response
    }
    catch {
        Write-Host "❌ Error en petición: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. Verificar que el backend esté funcionando
Write-Host "1️⃣ Verificando estado del backend..." -ForegroundColor Cyan
$healthCheck = Invoke-TestRequest -Method "GET" -Url "$baseUrl/usuarios/profile"
if ($healthCheck) {
    Write-Host "✅ Backend funcionando correctamente" -ForegroundColor Green
    Write-Host "   Usuario: $($healthCheck.nombreCompleto)" -ForegroundColor Gray
    Write-Host "   Email: $($healthCheck.email)" -ForegroundColor Gray
} else {
    Write-Host "❌ Backend no responde" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Probar endpoint de ejemplos
Write-Host "2️⃣ Probando endpoint de ejemplos..." -ForegroundColor Cyan
$examples = Invoke-TestRequest -Method "GET" -Url "$baseUrl/notifications/role-based/examples"
if ($examples) {
    Write-Host "✅ Endpoint de ejemplos funcionando" -ForegroundColor Green
    Write-Host "   Tipos disponibles: $($examples.PSObject.Properties.Name -join ', ')" -ForegroundColor Gray
} else {
    Write-Host "❌ Error en endpoint de ejemplos" -ForegroundColor Red
}
Write-Host ""

# 3. Verificar notificaciones actuales del usuario
Write-Host "3️⃣ Verificando notificaciones actuales..." -ForegroundColor Cyan
$currentNotifications = Invoke-TestRequest -Method "GET" -Url "$baseUrl/notifications/role-based/user/$testEmail"
if ($currentNotifications) {
    Write-Host "✅ Notificaciones obtenidas correctamente" -ForegroundColor Green
    Write-Host "   Total elementos: $($currentNotifications.totalElements)" -ForegroundColor Gray
    Write-Host "   Páginas totales: $($currentNotifications.totalPages)" -ForegroundColor Gray
    Write-Host "   Contenido: $($currentNotifications.content.Count) notificaciones" -ForegroundColor Gray
} else {
    Write-Host "❌ Error obteniendo notificaciones" -ForegroundColor Red
}
Write-Host ""

# 4. Crear notificaciones de prueba
Write-Host "4️⃣ Creando notificaciones de prueba..." -ForegroundColor Cyan
$createTest = Invoke-TestRequest -Method "POST" -Url "$baseUrl/notifications/role-based/create-test-notifications"
if ($createTest) {
    Write-Host "✅ Notificaciones de prueba creadas" -ForegroundColor Green
    Write-Host "   Mensaje: $($createTest.message)" -ForegroundColor Gray
} else {
    Write-Host "❌ Error creando notificaciones de prueba" -ForegroundColor Red
}
Write-Host ""

# 5. Verificar notificaciones después de crear pruebas
Write-Host "5️⃣ Verificando notificaciones después de crear pruebas..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
$newNotifications = Invoke-TestRequest -Method "GET" -Url "$baseUrl/notifications/role-based/user/$testEmail"
if ($newNotifications) {
    Write-Host "✅ Notificaciones actualizadas" -ForegroundColor Green
    Write-Host "   Total elementos: $($newNotifications.totalElements)" -ForegroundColor Gray
    Write-Host "   Páginas totales: $($newNotifications.totalPages)" -ForegroundColor Gray
    Write-Host "   Contenido: $($newNotifications.content.Count) notificaciones" -ForegroundColor Gray
    
    if ($newNotifications.content.Count -gt 0) {
        Write-Host "   📋 Detalles de las notificaciones:" -ForegroundColor Yellow
        foreach ($notif in $newNotifications.content) {
            Write-Host "      ID: $($notif.id) | Tipo: $($notif.tipo) | Mensaje: $($notif.mensaje)" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ Error obteniendo notificaciones actualizadas" -ForegroundColor Red
}
Write-Host ""

# 6. Probar endpoint de notificaciones no leídas
Write-Host "6️⃣ Probando notificaciones no leídas..." -ForegroundColor Cyan
$unreadNotifications = Invoke-TestRequest -Method "GET" -Url "$baseUrl/notifications/role-based/user/$testEmail/unread"
if ($unreadNotifications) {
    Write-Host "✅ Notificaciones no leídas obtenidas" -ForegroundColor Green
    Write-Host "   Total no leídas: $($unreadNotifications.totalElements)" -ForegroundColor Gray
} else {
    Write-Host "❌ Error obteniendo notificaciones no leídas" -ForegroundColor Red
}
Write-Host ""

# 7. Probar marcar como leída (si hay notificaciones)
if ($newNotifications -and $newNotifications.content.Count -gt 0) {
    $firstNotificationId = $newNotifications.content[0].id
    Write-Host "7️⃣ Probando marcar como leída (ID: $firstNotificationId)..." -ForegroundColor Cyan
    $markRead = Invoke-TestRequest -Method "PUT" -Url "$baseUrl/notifications/role-based/$firstNotificationId/mark-read?email=$testEmail"
    if ($markRead) {
        Write-Host "✅ Notificación marcada como leída" -ForegroundColor Green
    } else {
        Write-Host "❌ Error marcando como leída" -ForegroundColor Red
    }
    Write-Host ""
}

# 8. Verificar estado final
Write-Host "8️⃣ Verificando estado final..." -ForegroundColor Cyan
$finalNotifications = Invoke-TestRequest -Method "GET" -Url "$baseUrl/notifications/role-based/user/$testEmail"
if ($finalNotifications) {
    Write-Host "✅ Estado final verificado" -ForegroundColor Green
    Write-Host "   Total elementos: $($finalNotifications.totalElements)" -ForegroundColor Gray
    Write-Host "   Páginas totales: $($finalNotifications.totalPages)" -ForegroundColor Gray
    Write-Host "   Contenido: $($finalNotifications.content.Count) notificaciones" -ForegroundColor Gray
} else {
    Write-Host "❌ Error en verificación final" -ForegroundColor Red
}
Write-Host ""

Write-Host "🎉 PRUEBAS COMPLETADAS" -ForegroundColor Green
Write-Host "=" * 60
Write-Host "Revisa los resultados arriba para verificar el funcionamiento del sistema." -ForegroundColor Yellow

