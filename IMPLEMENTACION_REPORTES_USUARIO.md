# Implementación de Reportes de Usuario en Base de Datos

## 📋 Resumen de Cambios

Se ha implementado la funcionalidad para guardar los reportes generados por los usuarios en la base de datos en lugar de usar localStorage. Ahora los reportes se persisten entre sesiones y se pueden compartir entre usuarios.

## 🗄️ Base de Datos

### Nueva Tabla: `reportes_usuario`

```sql
CREATE TABLE IF NOT EXISTS reportes_usuario (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    subtitulo VARCHAR(500),
    tipo_periodo VARCHAR(50) NOT NULL COMMENT 'daily, weekly, monthly, yearly',
    valor_periodo VARCHAR(100) NOT NULL COMMENT 'fecha, mes, año específico',
    nombre_archivo VARCHAR(255) NOT NULL,
    datos_reporte TEXT COMMENT 'JSON con los datos del reporte',
    estadisticas TEXT COMMENT 'JSON con las estadísticas',
    categorias_top TEXT COMMENT 'JSON con las categorías top',
    tecnicos_top TEXT COMMENT 'JSON con los técnicos top',
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    observaciones TEXT,
    
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_tipo_periodo (tipo_periodo),
    INDEX idx_fecha_generacion (fecha_generacion),
    INDEX idx_activo (activo)
);
```

## 🔧 Backend (Java Spring Boot)

### Nuevos Archivos Creados:

1. **Entidad**: `ReporteUsuario.java`
   - Modelo JPA para la tabla `reportes_usuario`
   - Incluye relaciones con la tabla `usuarios`

2. **Repositorio**: `ReporteUsuarioRepository.java`
   - Interfaz JPA con métodos de consulta personalizados
   - Búsquedas por usuario, tipo de período, fechas, etc.

3. **DTOs**:
   - `GuardarReporteUsuarioRequestDTO.java` - Para crear reportes
   - `ReporteUsuarioResponseDTO.java` - Para devolver datos

4. **Servicio**: `ReporteUsuarioService.java`
   - Lógica de negocio para manejar reportes
   - Operaciones CRUD completas
   - Filtros y búsquedas

5. **Controlador**: `ReporteUsuarioController.java`
   - Endpoints REST para la API
   - Autenticación y autorización
   - Manejo de errores

### Endpoints Disponibles:

- `POST /api/reports/usuario/guardar` - Guardar reporte
- `GET /api/reports/usuario/mis-reportes` - Obtener reportes del usuario
- `GET /api/reports/usuario/{id}` - Obtener reporte específico
- `DELETE /api/reports/usuario/{id}` - Eliminar reporte
- `GET /api/reports/usuario/estadisticas` - Estadísticas del usuario
- `GET /api/reports/usuario/todos` - Todos los reportes (solo admin)

## 🎨 Frontend (React/TypeScript)

### Cambios en `Reports.tsx`:

1. **Reemplazado localStorage por API**:
   - `loadSavedReports()` ahora usa `api.obtenerMisReportes()`
   - `saveReportToDatabase()` usa `api.guardarReporteUsuario()`
   - `deleteSavedReport()` usa `api.eliminarReporteUsuario()`

2. **Nuevas funciones**:
   - `aplicarFiltros()` - Filtra reportes usando la API
   - Filtros automáticos con `useEffect`

3. **Integración con API**:
   - Manejo de errores mejorado
   - Loading states
   - Actualizaciones automáticas

### Cambios en `api.ts`:

1. **Nuevas interfaces**:
   - `ReporteUsuario`
   - `GuardarReporteUsuarioRequest`
   - `EstadisticasReportesUsuario`

2. **Nuevas funciones API**:
   - `guardarReporteUsuario()`
   - `obtenerMisReportes()`
   - `obtenerReporteUsuario()`
   - `eliminarReporteUsuario()`
   - `obtenerEstadisticasReportesUsuario()`
   - `obtenerTodosLosReportes()`

## 🚀 Instrucciones de Instalación

### 1. Ejecutar Script SQL
```bash
# Ejecutar en la base de datos MySQL
mysql -u usuario -p nombre_base_datos < create_reportes_usuario_table.sql
```

### 2. Reiniciar Backend
```bash
cd backend/demo
./mvnw spring-boot:run
```

### 3. Reiniciar Frontend
```bash
cd frontend/gestion-de-tickets
npm install
npm run dev
```

## ✨ Funcionalidades Nuevas

### Para Usuarios:
- ✅ Reportes se guardan permanentemente
- ✅ Disponibles desde cualquier dispositivo
- ✅ Filtros por tipo de período y búsqueda de texto
- ✅ Estadísticas personales de reportes
- ✅ Eliminación de reportes propios

### Para Administradores:
- ✅ Ver todos los reportes del sistema
- ✅ Estadísticas globales de reportes
- ✅ Gestión completa de reportes

## 🔐 Seguridad

- Autenticación requerida para todas las operaciones
- Usuarios solo pueden ver/editar sus propios reportes
- Administradores pueden ver todos los reportes
- Validación de datos en frontend y backend

## 📊 Estructura de Datos

### Datos Almacenados:
- **Metadatos**: título, subtítulo, tipo de período, fecha
- **Datos del Reporte**: JSON completo del reporte generado
- **Estadísticas**: métricas calculadas
- **Categorías/Técnicos Top**: rankings
- **Archivo**: nombre del PDF generado

### Ventajas vs localStorage:
- ✅ Persistencia entre sesiones
- ✅ Compartir entre dispositivos
- ✅ Backup automático
- ✅ Búsqueda y filtros avanzados
- ✅ Estadísticas históricas
- ✅ Gestión centralizada

## 🐛 Solución de Problemas

### Si no aparecen reportes:
1. Verificar que la tabla existe en la BD
2. Revisar logs del backend
3. Verificar autenticación del usuario

### Si hay errores de compilación:
1. Limpiar cache: `./mvnw clean`
2. Recompilar: `./mvnw compile`
3. Verificar imports en Java

### Si el frontend no conecta:
1. Verificar que el backend esté corriendo
2. Revisar CORS en el controlador
3. Verificar autenticación JWT

## 📝 Notas Técnicas

- Los reportes se almacenan como JSON en campos TEXT
- Se usa soft delete (campo `activo`)
- Índices optimizados para consultas frecuentes
- Manejo de errores robusto en frontend y backend
- Logs detallados para debugging

## 🔄 Migración de Datos

Si ya tienes reportes en localStorage, puedes:
1. Exportar datos de localStorage
2. Convertir a formato de API
3. Importar usando endpoint de guardar reporte

---

**Implementación completada** ✅  
**Fecha**: $(date)  
**Desarrollador**: Asistente IA
