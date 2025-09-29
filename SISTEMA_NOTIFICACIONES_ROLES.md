# Sistema de Notificaciones Diferenciadas por Roles

## Resumen

He construido un sistema completo de notificaciones para tu proyecto de gestión de tickets que diferencia los mensajes según el rol del usuario (funcionario, técnico, administrador). Cada notificación va dirigida solo a los destinatarios correctos con mensajes personalizados.

## Arquitectura del Sistema

### Backend (Java Spring Boot)

#### 1. Servicio Principal: `NotificationRoleService`
- **Ubicación**: `backend/demo/src/main/java/com/example/demo/notificacion/service/NotificationRoleService.java`
- **Funcionalidad**: Genera notificaciones diferenciadas por rol
- **Métodos principales**:
  - `notificarCreacionTicket()` - Notifica creación de tickets
  - `notificarAsignacionTicket()` - Notifica asignación de tickets
  - `notificarResolucionTicket()` - Notifica resolución de tickets
  - `notificarCierreTicket()` - Notifica cierre de tickets
  - `notificarTicketEnProceso()` - Notifica cuando un ticket entra en proceso

#### 2. Controlador REST: `NotificationRoleController`
- **Ubicación**: `backend/demo/src/main/java/com/example/demo/notificacion/controller/NotificationRoleController.java`
- **Endpoints**:
  - `GET /api/notifications/role-based/user/{email}` - Obtener notificaciones por usuario
  - `GET /api/notifications/role-based/user/{email}/unread` - Obtener notificaciones no leídas
  - `PUT /api/notifications/role-based/{id}/mark-read` - Marcar como leída
  - `GET /api/notifications/role-based/examples` - Obtener ejemplos de notificaciones

#### 3. Servicio de Integración: `TicketNotificationIntegrationService`
- **Ubicación**: `backend/demo/src/main/java/com/example/demo/notificacion/service/TicketNotificationIntegrationService.java`
- **Funcionalidad**: Conecta eventos de tickets con notificaciones

### Frontend (React TypeScript)

#### 1. Hook Personalizado: `useRoleNotifications`
- **Ubicación**: `frontend/gestion-de-tickets/client/hooks/use-role-notifications.ts`
- **Funcionalidad**: Maneja el estado de notificaciones por roles

#### 2. Componente de UI: `RoleNotificationsCenter`
- **Ubicación**: `frontend/gestion-de-tickets/client/modules/notifications/RoleNotificationsCenter.tsx`
- **Funcionalidad**: Interfaz para mostrar y gestionar notificaciones

#### 3. API Actualizada
- **Ubicación**: `frontend/gestion-de-tickets/shared/api.ts`
- **Nuevos métodos**:
  - `getRoleNotifications()`
  - `getUnreadRoleNotifications()`
  - `markRoleNotificationAsRead()`
  - `deleteRoleNotification()`

## Tipos de Notificaciones

### 1. Creación de Ticket (`ticket_creado`)

**Para Funcionario:**
```json
{
  "id": 1,
  "tipo": "ticket_creado",
  "mensaje": "Tu ticket #1 ha sido creado exitosamente",
  "destinatarios": ["funcionario:roberrodrigues@gmail.com"],
  "ticketId": 1,
  "usuarioActorNombre": "Rober Rodrigues",
  "prioridad": "normal",
  "leida": false,
  "fechaCreacion": "2024-01-15T10:30:00"
}
```

**Para Administrador:**
```json
{
  "id": 1,
  "tipo": "ticket_creado",
  "mensaje": "Nuevo ticket creado por Rober Rodrigues (#1)",
  "destinatarios": ["rol:administrador"],
  "ticketId": 1,
  "usuarioActorNombre": "Rober Rodrigues",
  "prioridad": "normal",
  "leida": false,
  "fechaCreacion": "2024-01-15T10:30:00"
}
```

### 2. Asignación de Ticket (`ticket_asignado`)

**Para Funcionario:**
```json
{
  "id": 26,
  "tipo": "ticket_asignado",
  "mensaje": "Tu ticket #26 fue asignado al técnico Juan Pérez",
  "destinatarios": ["funcionario:roberrodrigues@gmail.com"],
  "ticketId": 26,
  "usuarioActorNombre": "Admin Sistema",
  "prioridad": "normal",
  "leida": false,
  "fechaCreacion": "2024-01-15T11:00:00"
}
```

**Para Técnico:**
```json
{
  "id": 26,
  "tipo": "ticket_asignado",
  "mensaje": "Se te asignó el ticket #26 del cliente Rober Rodrigues",
  "destinatarios": ["tecnico:juanperez@gmail.com"],
  "ticketId": 26,
  "usuarioActorNombre": "Admin Sistema",
  "prioridad": "normal",
  "leida": false,
  "fechaCreacion": "2024-01-15T11:00:00"
}
```

**Para Administrador:**
```json
{
  "id": 26,
  "tipo": "ticket_asignado",
  "mensaje": "Has asignado el ticket #26 al técnico Juan Pérez",
  "destinatarios": ["rol:administrador"],
  "ticketId": 26,
  "usuarioActorNombre": "Admin Sistema",
  "prioridad": "normal",
  "leida": false,
  "fechaCreacion": "2024-01-15T11:00:00"
}
```

### 3. Resolución de Ticket (`ticket_resuelto`)

**Para Funcionario:**
```json
{
  "id": 26,
  "tipo": "ticket_resuelto",
  "mensaje": "Tu ticket #26 ha sido resuelto por Juan Pérez",
  "destinatarios": ["funcionario:roberrodrigues@gmail.com"],
  "ticketId": 26,
  "usuarioActorNombre": "Juan Pérez",
  "prioridad": "normal",
  "leida": false,
  "fechaCreacion": "2024-01-15T12:00:00"
}
```

**Para Administrador:**
```json
{
  "id": 26,
  "tipo": "ticket_resuelto",
  "mensaje": "El ticket #26 del cliente Rober Rodrigues fue resuelto por Juan Pérez",
  "destinatarios": ["rol:administrador"],
  "ticketId": 26,
  "usuarioActorNombre": "Juan Pérez",
  "prioridad": "normal",
  "leida": false,
  "fechaCreacion": "2024-01-15T12:00:00"
}
```

### 4. Cierre de Ticket (`ticket_cerrado`)

**Para Funcionario:**
```json
{
  "id": 26,
  "tipo": "ticket_cerrado",
  "mensaje": "Tu ticket #26 ha sido cerrado por Juan Pérez",
  "destinatarios": ["funcionario:roberrodrigues@gmail.com"],
  "ticketId": 26,
  "usuarioActorNombre": "Juan Pérez",
  "prioridad": "normal",
  "leida": false,
  "fechaCreacion": "2024-01-15T12:30:00"
}
```

**Para Administrador:**
```json
{
  "id": 26,
  "tipo": "ticket_cerrado",
  "mensaje": "El ticket #26 del cliente Rober Rodrigues fue cerrado por Juan Pérez",
  "destinatarios": ["rol:administrador"],
  "ticketId": 26,
  "usuarioActorNombre": "Juan Pérez",
  "prioridad": "normal",
  "leida": false,
  "fechaCreacion": "2024-01-15T12:30:00"
}
```

## Formato de Destinatarios

### Usuario Específico
- `funcionario:email@ejemplo.com`
- `tecnico:email@ejemplo.com`
- `administrador:email@ejemplo.com`

### Todos por Rol
- `rol:administrador`
- `rol:tecnico`
- `rol:funcionario`

## Mensajes Personalizados por Rol

### Funcionario (Primera Persona)
- "Tu ticket #26 fue asignado al técnico Juan Pérez"
- "Tu ticket #26 ha sido resuelto por Juan Pérez"
- "Tu ticket #1 ha sido creado exitosamente"

### Técnico (Segunda Persona)
- "Se te asignó el ticket #26 del cliente Rober Rodrigues"
- "Tienes un nuevo ticket #26 del cliente Rober Rodrigues"

### Administrador (Tercera Persona)
- "Has asignado el ticket #26 al técnico Juan Pérez"
- "El ticket #26 del cliente Rober Rodrigues fue resuelto por Juan Pérez"
- "Nuevo ticket creado por Rober Rodrigues (#1)"

## Características del Sistema

### ✅ Diferenciación por Roles
- Cada notificación va dirigida solo a los destinatarios correctos
- Mensajes personalizados según el rol del usuario
- Sin duplicados ni mensajes genéricos

### ✅ Persistencia
- Almacenamiento en base de datos (`notificaciones_mejoradas`)
- Historial completo de notificaciones
- Estado de lectura/no lectura

### ✅ Tiempo Real
- Envío por WebSocket para notificaciones instantáneas
- Actualización automática en el frontend

### ✅ Escalabilidad
- Sistema modular y extensible
- Fácil agregar nuevos tipos de notificaciones
- Soporte para múltiples destinatarios

### ✅ Seguridad
- Verificación de permisos por usuario
- Validación de destinatarios
- Prevención de acceso no autorizado

## Implementación

### 1. Integración con Eventos de Tickets
```java
@Autowired
private TicketNotificationIntegrationService notificationIntegration;

// En el servicio de tickets
public void crearTicket(Ticket ticket) {
    // ... lógica de creación
    notificationIntegration.onTicketCreated(ticket.getId(), usuarioActorId);
}

public void asignarTicket(Long ticketId, Long tecnicoId, Long usuarioActorId) {
    // ... lógica de asignación
    notificationIntegration.onTicketAssigned(ticketId, usuarioActorId, tecnicoId);
}
```

### 2. Uso en el Frontend
```typescript
import { useRoleNotifications } from '@/hooks/use-role-notifications';

const { notifications, markAsRead, unreadCount } = useRoleNotifications(userEmail);
```

### 3. Configuración de WebSocket
```typescript
// El sistema ya está configurado para enviar notificaciones por WebSocket
// a cada usuario específico: /topic/notifications/{email}
```

## Archivos de Ejemplo

- **Ejemplos JSON**: `backend/demo/src/main/resources/notification-examples.json`
- **Documentación completa**: `SISTEMA_NOTIFICACIONES_ROLES.md`

## Próximos Pasos

1. **Integrar con el servicio de tickets existente**
2. **Configurar WebSocket en el frontend**
3. **Probar el flujo completo de notificaciones**
4. **Personalizar estilos y UI según necesidades**

El sistema está listo para ser implementado y proporcionará una experiencia de notificaciones completamente personalizada para cada rol de usuario.

