# 🧪 GUÍA COMPLETA DE PRUEBAS - SLA Y AUTOMATIZACIÓN

## 📋 **PREPARACIÓN**

### 1. **Iniciar Backend**
```bash
cd backend/demo
mvn spring-boot:run
```
- Verificar que el puerto 8080 esté disponible
- Esperar a que aparezca "Started DemoApplication"

### 2. **Iniciar Frontend**
```bash
cd frontend/gestion-de-tickets
npm run dev
```
- Verificar que el puerto 3000 esté disponible
- Abrir http://localhost:3000

## 🔧 **PRUEBAS MANUALES**

### **PRUEBA 1: Configurar SLA**

1. **Acceder al Frontend**
   - Ir a http://localhost:3000
   - Iniciar sesión como administrador
   - Navegar a "Configuración SLA"

2. **Crear Configuración SLA**
   - Clic en "Nueva Configuración"
   - Llenar formulario:
     - **Nombre**: "SLA Prueba - Hardware Alta"
     - **Categoría**: "Hardware"
     - **Prioridad**: "ALTA"
     - **Tiempo Respuesta**: 2 horas
     - **Tiempo Resolución**: 8 horas
     - **Tiempo Alerta**: 1 hora
   - Guardar configuración

3. **Verificar Creación**
   - La configuración debe aparecer en la lista
   - Estado debe ser "Activa"

### **PRUEBA 2: Configurar Automatización**

1. **Navegar a Reglas de Automatización**
   - Ir a "Automatización" en el menú
   - Clic en "Nueva Regla"

2. **Crear Regla de Automatización**
   - Llenar formulario:
     - **Nombre**: "Auto-asignación Hardware Alta"
     - **Descripción**: "Asigna automáticamente tickets de hardware con prioridad alta"
     - **Condición**: `categoria == "Hardware" AND prioridad == "ALTA"`
     - **Acción**: `asignar_tecnico_por_minima_carga`
     - **Prioridad**: 5
     - **Estado**: Activa
   - Guardar regla

3. **Verificar Creación**
   - La regla debe aparecer en la lista
   - Estado debe ser "Activa"

### **PRUEBA 3: Crear Ticket y Verificar SLA**

1. **Crear Ticket de Prueba**
   - Ir a "Crear Ticket"
   - Llenar formulario:
     - **Ubicación**: "Oficina Principal"
     - **Consulta**: "Problema con impresora - no imprime documentos"
     - **Categoría**: "Hardware"
     - **Prioridad**: "ALTA"
   - Enviar ticket

2. **Verificar Aplicación de SLA**
   - El ticket debe crearse exitosamente
   - Verificar en la base de datos que el ticket tenga:
     - `sla_configuracion_id` no nulo
     - `sla_tiempo_respuesta_horas` = 2
     - `sla_tiempo_resolucion_horas` = 8
     - `sla_fecha_limite_respuesta` calculada
     - `sla_fecha_limite_resolucion` calculada

3. **Verificar Aplicación de Automatización**
   - El ticket debe ser asignado automáticamente a un técnico
   - El estado debe cambiar a "ASIGNADO"
   - Verificar en la base de datos que la regla se ejecutó

### **PRUEBA 4: Verificar Monitoreo de SLA**

1. **Acceder al Dashboard de SLA**
   - Ir a "Dashboard" → "Monitoreo SLA"
   - Verificar que aparezcan estadísticas

2. **Verificar Estadísticas**
   - Total tickets activos debe ser > 0
   - Tickets en tiempo debe incluir el ticket creado
   - Porcentaje de cumplimiento debe calcularse

3. **Ejecutar Verificación Manual**
   - Clic en "Verificar Ahora"
   - Verificar que se ejecute sin errores
   - Las estadísticas deben actualizarse

### **PRUEBA 5: Probar Notificaciones**

1. **Esperar Vencimiento de SLA**
   - Cambiar la configuración SLA a 1 minuto para prueba rápida
   - O esperar 2 horas para la configuración normal

2. **Verificar Notificaciones**
   - Las notificaciones deben aparecer en tiempo real
   - Verificar en el centro de notificaciones
   - Debe haber notificaciones de tipo "sla_vencido" o "sla_proximo_vencer"

## 🤖 **PRUEBAS AUTOMATIZADAS**

### **Opción 1: Usar archivo HTTP**
```bash
# Usar el archivo test-sla-automation-complete.http
# Ejecutar en VS Code con REST Client extension
```

### **Opción 2: Usar script Node.js**
```bash
# Instalar dependencias si es necesario
npm install node-fetch

# Ejecutar script
node test-sla-automation.js
```

## 📊 **VERIFICACIONES ESPECÍFICAS**

### **Backend - Logs a Verificar**
```
🔍 [SLA Monitoring] Iniciando monitoreo continuo de SLA...
✅ Aplicando configuración SLA 'SLA Prueba - Hardware Alta' al ticket X
✅ Regla 'Auto-asignación Hardware Alta' ejecutada para ticket X
🚨 [SLA Monitoring] Ticket X con SLA VENCIDO
```

### **Frontend - Elementos a Verificar**
- Dashboard muestra estadísticas en tiempo real
- Notificaciones aparecen como toasts
- Centro de notificaciones muestra alertas SLA
- Configuración SLA se guarda correctamente
- Reglas de automatización se crean y ejecutan

### **Base de Datos - Tablas a Verificar**
```sql
-- Verificar configuración SLA
SELECT * FROM sla_configurations WHERE nombre LIKE '%Prueba%';

-- Verificar reglas de automatización
SELECT * FROM reglas_automatizacion WHERE nombre LIKE '%Prueba%';

-- Verificar tickets con SLA
SELECT id, consulta, sla_configuracion_id, sla_tiempo_respuesta_horas 
FROM tickets WHERE consulta LIKE '%Prueba%';

-- Verificar notificaciones SLA
SELECT * FROM notificaciones_mejoradas WHERE tipo LIKE '%sla%';
```

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **Problema: SLA no se aplica**
- Verificar que la configuración SLA esté activa
- Verificar que la categoría y prioridad coincidan exactamente
- Revisar logs del backend

### **Problema: Automatización no funciona**
- Verificar que la regla esté activa
- Verificar la sintaxis de la condición
- Revisar logs del backend

### **Problema: Notificaciones no aparecen**
- Verificar conexión WebSocket
- Verificar que el usuario tenga permisos
- Revisar consola del navegador

### **Problema: Monitoreo no funciona**
- Verificar que @EnableScheduling esté en DemoApplication
- Revisar logs del backend cada 5 minutos
- Verificar que no haya errores en la base de datos

## ✅ **CRITERIOS DE ÉXITO**

El sistema funciona al 100% cuando:
- [ ] Configuración SLA se crea y guarda correctamente
- [ ] Reglas de automatización se crean y ejecutan
- [ ] Tickets se crean con SLA aplicado automáticamente
- [ ] Monitoreo ejecuta cada 5 minutos sin errores
- [ ] Notificaciones aparecen en tiempo real
- [ ] Dashboard muestra estadísticas actualizadas
- [ ] Verificación manual funciona correctamente
- [ ] Tickets vencidos se detectan correctamente

## 📞 **SOPORTE**

Si encuentras problemas:
1. Revisar logs del backend
2. Revisar consola del navegador
3. Verificar configuración de base de datos
4. Verificar que todos los servicios estén ejecutándose
