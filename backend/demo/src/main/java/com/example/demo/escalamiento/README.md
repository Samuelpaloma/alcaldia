# Sistema de Escalamiento de Tickets

## Descripción
Este módulo implementa un sistema de escalamiento automático de tickets basado en el nivel de los técnicos. Cuando un técnico no puede resolver un ticket, se reasigna automáticamente a un técnico de mayor nivel.

## Niveles de Técnicos
- **BAJO**: Técnicos junior o de nivel inicial
- **MEDIO**: Técnicos con experiencia intermedia
- **ALTO**: Técnicos senior o especialistas

## Flujo de Escalamiento

### Escalamiento Automático
1. Un técnico de nivel BAJO no puede resolver un ticket
2. El sistema automáticamente reasigna el ticket a un técnico de nivel MEDIO
3. Si el técnico de nivel MEDIO tampoco puede resolverlo, se reasigna a nivel ALTO

### Escalamiento Manual
Los administradores pueden escalar manualmente un ticket a cualquier nivel específico.

## Endpoints Disponibles

### 1. Escalar Ticket Automáticamente
```
POST /api/escalamiento/escalar/{ticketId}?motivo=No puedo resolver este problema
```

### 2. Escalar Ticket a Nivel Específico
```
POST /api/escalamiento/escalar/{ticketId}/nivel/{nivel}?motivo=Problema complejo
```
Niveles disponibles: `BAJO`, `MEDIO`, `ALTO`

### 3. Verificar si un Ticket Puede Ser Escalado
```
GET /api/escalamiento/puede-escalar/{ticketId}
```

### 4. Obtener Estadísticas de Escalamiento
```
GET /api/escalamiento/estadisticas
```

## Configuración de Técnicos

### Crear Técnico con Nivel
```json
{
  "email": "tecnico@empresa.com",
  "password": "Password123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "123456789",
  "nivelTecnico": "MEDIO",
  "areaEspecializacion": "Redes y Comunicaciones",
  "observaciones": "Especialista en routers Cisco"
}
```

### Actualizar Nivel de Técnico
```json
{
  "nivelTecnico": "ALTO",
  "areaEspecializacion": "Seguridad Informática",
  "observaciones": "Promovido a especialista senior"
}
```

## Lógica de Asignación

### Criterios de Selección
1. **Nivel requerido**: Se busca técnicos del nivel específico
2. **Especialización**: Se prioriza técnicos con área de especialización coincidente
3. **Carga de trabajo**: Se selecciona el técnico con menos tickets activos

### Estados de Ticket
- `ASIGNADO`: Ticket asignado a técnico
- `EN_EJECUCION`: Técnico trabajando en el ticket
- `ESCALADO`: Ticket escalado a otro técnico
- `RESUELTO`: Ticket resuelto
- `CERRADO`: Ticket cerrado

## Ejemplo de Uso

### Desde el Frontend (Técnico)
```javascript
// Un técnico no puede resolver un ticket
const escalarTicket = async (ticketId) => {
  const response = await fetch(`/api/escalamiento/escalar/${ticketId}?motivo=Problema complejo de red`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  if (result.success) {
    alert('Ticket escalado exitosamente');
    // Actualizar la interfaz
  }
};
```

### Desde el Frontend (Administrador)
```javascript
// Un administrador escala manualmente a nivel alto
const escalarManual = async (ticketId) => {
  const response = await fetch(`/api/escalamiento/escalar/${ticketId}/nivel/ALTO?motivo=Problema crítico`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  console.log('Ticket escalado:', result.data);
};
```

## Beneficios del Sistema

1. **Escalamiento Automático**: Reduce la intervención manual
2. **Distribución Equitativa**: Asigna tickets según carga de trabajo
3. **Especialización**: Prioriza técnicos especializados
4. **Trazabilidad**: Registra todos los escalamientos
5. **Estadísticas**: Proporciona métricas de rendimiento

## Consideraciones Técnicas

- Los técnicos existentes se actualizan automáticamente a nivel BAJO
- El sistema valida que existan técnicos del nivel requerido
- Se mantiene historial completo de asignaciones
- Los tickets escalados mantienen su prioridad original
