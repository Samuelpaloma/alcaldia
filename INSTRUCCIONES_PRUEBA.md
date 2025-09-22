# 🚀 INSTRUCCIONES PARA PROBAR EL SISTEMA

## 📋 DATOS DE PRUEBA DISPONIBLES

### 👤 USUARIOS DE PRUEBA

#### SuperAdmin
- **Email:** `rarodrigues.300@gmail.com`
- **Password:** `SuperAdmin123`
- **Acceso:** Panel completo del sistema

#### Administradores
- **Email:** `roberto.silva@alcaldia.gov.co`
- **Password:** `Admin123`
- **Email:** `patricia.vega@alcaldia.gov.co`
- **Password:** `Admin123`
- **Acceso:** Gestión de tickets, usuarios y evidencias

#### Técnicos
- **Email:** `carlos.mendoza@alcaldia.gov.co`
- **Password:** `Tecnico123`
- **Email:** `ana.rodriguez@alcaldia.gov.co`
- **Password:** `Tecnico123`
- **Email:** `luis.garcia@alcaldia.gov.co`
- **Password:** `Tecnico123`
- **Email:** `maria.lopez@alcaldia.gov.co`
- **Password:** `Tecnico123`
- **Acceso:** Gestión de tickets asignados

#### Funcionarios
- **Email:** `juan.perez@alcaldia.gov.co`
- **Password:** `Funcionario123`
- **Email:** `carmen.herrera@alcaldia.gov.co`
- **Password:** `Funcionario123`
- **Email:** `pedro.martinez@alcaldia.gov.co`
- **Password:** `Funcionario123`
- **Acceso:** Crear tickets y seguimiento

## 🎯 FUNCIONALIDADES A PROBAR

### 1. **Dashboard de Administrador**
- ✅ Métricas en tiempo real
- ✅ Distribución por prioridad
- ✅ Tickets recientes
- ✅ Estadísticas de usuarios

### 2. **Gestión de Tickets**
- ✅ Lista de todos los tickets
- ✅ Filtros por estado y prioridad
- ✅ Búsqueda de tickets
- ✅ Asignación a técnicos
- ✅ Cambio de estado

### 3. **Gestión de Usuarios**
- ✅ Lista de técnicos y administradores
- ✅ Crear nuevos usuarios
- ✅ Activar/desactivar usuarios
- ✅ Filtros por tipo y estado

### 4. **Gestión de Evidencias**
- ✅ Lista de evidencias por ticket
- ✅ Filtros por tipo de archivo
- ✅ Descarga de archivos
- ✅ Metadatos de evidencias

## 🚀 PASOS PARA PROBAR

### 1. **Iniciar el Backend**
```bash
cd backend/demo
mvn spring-boot:run
```

### 2. **Iniciar el Frontend**
```bash
cd frontend/gestion-de-tickets/client
npm run dev
```

### 3. **Acceder al Sistema**
- Abrir navegador en: `http://localhost:3000`
- Usar cualquiera de los usuarios de prueba

## 📊 DATOS DE PRUEBA INCLUIDOS

### Tickets (10)
- **Abiertos:** 6 tickets
- **En Progreso:** 2 tickets
- **Resueltos:** 2 tickets
- **Cerrados:** 1 ticket

### Usuarios (9)
- **Técnicos:** 4 (3 activos, 1 inactivo)
- **Administradores:** 2 (ambos activos)
- **Funcionarios:** 3 (todos activos)

### Categorías (5)
- Sistemas, Redes, Hardware, Software, Soporte

### Evidencias (5)
- Imágenes y documentos de ejemplo
- Diferentes tipos de archivo
- Metadatos completos

## 🎨 CARACTERÍSTICAS DEL DISEÑO

### ✅ Diseño Profesional
- Cards con hover effects
- Colores consistentes
- Iconos descriptivos
- Responsive design

### ✅ Interactividad
- Filtros en tiempo real
- Búsqueda instantánea
- Modales para acciones
- Estados de carga

### ✅ Funcionalidad Completa
- CRUD completo
- Validaciones
- Manejo de errores
- Actualización automática

## 🔧 TROUBLESHOOTING

### Si el backend no inicia:
1. Verificar que Java 17 esté instalado
2. Verificar que Maven esté instalado
3. Verificar que el puerto 8080 esté libre

### Si el frontend no inicia:
1. Verificar que Node.js esté instalado
2. Ejecutar `npm install` en el directorio del frontend
3. Verificar que el puerto 3000 esté libre

### Si hay errores de conexión:
1. Verificar que ambos servicios estén corriendo
2. Verificar la configuración de CORS
3. Revisar la consola del navegador

## 📝 NOTAS IMPORTANTES

- **Todos los passwords son temporales** y deben cambiarse en producción
- **Los datos son de prueba** y se pueden modificar libremente
- **El sistema está configurado** para desarrollo local
- **Las evidencias son simuladas** (archivos no existen físicamente)

## 🎉 ¡LISTO PARA PROBAR!

El sistema está completamente funcional con datos de prueba realistas. Puedes probar todas las funcionalidades implementadas siguiendo las instrucciones anteriores.

**¡Disfruta probando el sistema! 🚀**
