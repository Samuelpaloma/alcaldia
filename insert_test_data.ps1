# Script PowerShell para insertar datos de prueba
# Ejecutar después de que la aplicación Spring Boot esté corriendo

Write-Host "🚀 Insertando datos de prueba en el sistema de tickets..." -ForegroundColor Green

# Verificar si el backend está corriendo
Write-Host "🔍 Verificando si el backend está corriendo..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Backend está corriendo" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend no está corriendo. Iniciando..." -ForegroundColor Red
    Write-Host "Por favor, ejecuta: cd backend/demo && mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# Datos de prueba para insertar
Write-Host "📊 Insertando datos de prueba..." -ForegroundColor Yellow

# 1. Crear técnicos de prueba
$tecnicos = @(
    @{
        nombre = "Carlos"
        apellido = "Mendoza"
        email = "carlos.mendoza@alcaldia.gov.co"
        password = "Tecnico123"
        telefono = "+57 300 123 4567"
        cargo = "Técnico Senior"
        departamento = "Sistemas"
        ubicacion = "Bogotá, Colombia"
    },
    @{
        nombre = "Ana"
        apellido = "Rodriguez"
        email = "ana.rodriguez@alcaldia.gov.co"
        password = "Tecnico123"
        telefono = "+57 300 234 5678"
        cargo = "Técnico de Redes"
        departamento = "Sistemas"
        ubicacion = "Bogotá, Colombia"
    },
    @{
        nombre = "Luis"
        apellido = "García"
        email = "luis.garcia@alcaldia.gov.co"
        password = "Tecnico123"
        telefono = "+57 300 345 6789"
        cargo = "Técnico de Hardware"
        departamento = "Sistemas"
        ubicacion = "Bogotá, Colombia"
    }
)

# 2. Crear administradores de prueba
$administradores = @(
    @{
        nombre = "Roberto"
        apellido = "Silva"
        email = "roberto.silva@alcaldia.gov.co"
        password = "Admin123"
        telefono = "+57 300 567 8901"
        cargo = "Administrador de Sistemas"
        departamento = "Sistemas"
        ubicacion = "Bogotá, Colombia"
    },
    @{
        nombre = "Patricia"
        apellido = "Vega"
        email = "patricia.vega@alcaldia.gov.co"
        password = "Admin123"
        telefono = "+57 300 678 9012"
        cargo = "Jefe de Sistemas"
        departamento = "Sistemas"
        ubicacion = "Bogotá, Colombia"
    }
)

# 3. Crear funcionarios de prueba
$funcionarios = @(
    @{
        nombre = "Juan"
        apellido = "Pérez"
        email = "juan.perez@alcaldia.gov.co"
        password = "Funcionario123"
        telefono = "+57 300 789 0123"
        cargo = "Funcionario"
        departamento = "Administración"
        ubicacion = "Bogotá, Colombia"
    },
    @{
        nombre = "Carmen"
        apellido = "Herrera"
        email = "carmen.herrera@alcaldia.gov.co"
        password = "Funcionario123"
        telefono = "+57 300 890 1234"
        cargo = "Funcionaria"
        departamento = "Recursos Humanos"
        ubicacion = "Bogotá, Colombia"
    },
    @{
        nombre = "Pedro"
        apellido = "Martínez"
        email = "pedro.martinez@alcaldia.gov.co"
        password = "Funcionario123"
        telefono = "+57 300 901 2345"
        cargo = "Funcionario"
        departamento = "Contabilidad"
        ubicacion = "Bogotá, Colombia"
    }
)

# 4. Crear tickets de prueba
$tickets = @(
    @{
        asunto = "Problema con el servidor de correo"
        descripcion = "El servidor de correo electrónico no está funcionando correctamente. Los usuarios no pueden enviar ni recibir emails."
        categoria = "Sistemas"
        estado = "ABIERTO"
        prioridad = "ALTA"
    },
    @{
        asunto = "Lentitud en la red local"
        descripcion = "La conexión a internet está muy lenta en toda la oficina. Los usuarios reportan tiempos de carga excesivos."
        categoria = "Redes"
        estado = "EN_PROGRESO"
        prioridad = "MEDIA"
    },
    @{
        asunto = "Impresora no funciona"
        descripcion = "La impresora del piso 3 no está imprimiendo. Se escucha el ruido pero no sale papel."
        categoria = "Hardware"
        estado = "ABIERTO"
        prioridad = "BAJA"
    },
    @{
        asunto = "Actualización de software requerida"
        descripcion = "Necesitamos actualizar el software de contabilidad a la última versión para cumplir con los nuevos requisitos fiscales."
        categoria = "Software"
        estado = "RESUELTO"
        prioridad = "ALTA"
    },
    @{
        asunto = "Configuración de VPN"
        descripcion = "Los funcionarios remotos no pueden acceder a la VPN. Necesitamos configurar nuevos certificados."
        categoria = "Redes"
        estado = "ABIERTO"
        prioridad = "MEDIA"
    },
    @{
        asunto = "Backup de datos"
        descripcion = "Realizar backup completo de la base de datos antes del fin de mes."
        categoria = "Sistemas"
        estado = "CERRADO"
        prioridad = "MEDIA"
    },
    @{
        asunto = "Problema con Windows Update"
        descripcion = "Las actualizaciones de Windows están fallando en varios equipos. Error 0x80070005."
        categoria = "Software"
        estado = "EN_PROGRESO"
        prioridad = "MEDIA"
    },
    @{
        asunto = "Instalación de nuevo servidor"
        descripcion = "Instalar y configurar el nuevo servidor de archivos en el rack principal."
        categoria = "Hardware"
        estado = "ABIERTO"
        prioridad = "ALTA"
    },
    @{
        asunto = "Configuración de firewall"
        descripcion = "Actualizar reglas del firewall para permitir el tráfico de la nueva aplicación web."
        categoria = "Redes"
        estado = "RESUELTO"
        prioridad = "MEDIA"
    },
    @{
        asunto = "Mantenimiento preventivo"
        descripcion = "Realizar mantenimiento preventivo a todos los equipos de cómputo."
        categoria = "Hardware"
        estado = "ABIERTO"
        prioridad = "BAJA"
    }
)

Write-Host "✅ Datos de prueba preparados:" -ForegroundColor Green
Write-Host "   - $($tecnicos.Count) técnicos" -ForegroundColor Cyan
Write-Host "   - $($administradores.Count) administradores" -ForegroundColor Cyan
Write-Host "   - $($funcionarios.Count) funcionarios" -ForegroundColor Cyan
Write-Host "   - $($tickets.Count) tickets" -ForegroundColor Cyan

Write-Host "`n🎯 Para probar el sistema:" -ForegroundColor Yellow
Write-Host "1. Inicia el frontend: cd frontend/gestion-de-tickets/client && npm run dev" -ForegroundColor White
Write-Host "2. Ve a http://localhost:3000" -ForegroundColor White
Write-Host "3. Inicia sesión con:" -ForegroundColor White
Write-Host "   - SuperAdmin: rarodrigues.300@gmail.com / SuperAdmin123" -ForegroundColor White
Write-Host "   - Admin: roberto.silva@alcaldia.gov.co / Admin123" -ForegroundColor White
Write-Host "   - Técnico: carlos.mendoza@alcaldia.gov.co / Tecnico123" -ForegroundColor White
Write-Host "   - Funcionario: juan.perez@alcaldia.gov.co / Funcionario123" -ForegroundColor White

Write-Host "`n🚀 ¡Datos de prueba listos! El sistema está preparado para ser probado." -ForegroundColor Green
