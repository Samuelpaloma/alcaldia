# 📚 **DOCUMENTACIÓN COMPLETA DEL SISTEMA NEITickets**

## 🏗️ **ARQUITECTURA GENERAL**

El sistema NEITickets es una aplicación completa de gestión de tickets para la Alcaldía de Neiva, compuesta por **3 aplicaciones principales**:

1. **Backend (Java/Spring Boot)** - API REST y lógica de negocio
2. **Frontend Web (React/TypeScript)** - Interfaz web para administradores y clientes  
3. **Aplicación Móvil (React Native/Expo)** - App móvil para técnicos

---

## 🔧 **BACKEND - Java/Spring Boot**

### **📁 Estructura del Proyecto**
```
backend/demo/src/main/java/com/example/demo/
├── tecnico/           # Módulo de técnicos
│   ├── controller/   # Controladores REST
│   ├── service/      # Lógica de negocio
│   └── dto/          # Objetos de transferencia de datos
├── ticket/           # Módulo de tickets
├── usuario/          # Módulo de usuarios
├── asignacion/       # Módulo de asignaciones
├── notificacion/     # Módulo de notificaciones
├── evidencia/        # Módulo de evidencias
├── admin/            # Módulo de administradores
└── security/         # Configuración de seguridad
```

### **🔐 Sistema de Seguridad**

#### **JWT Authentication**
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // Filtro que intercepta cada request HTTP
    // Extrae el token JWT del header "Authorization"
    // Valida el token y establece el contexto de seguridad
}
```

**¿Cómo funciona?**
1. Usuario hace login → recibe token JWT
2. Cada request incluye `Authorization: Bearer <token>`
3. El filtro valida el token y autentica al usuario
4. Spring Security establece el contexto de autenticación

#### **Roles y Permisos**
```java
public enum TipoUsuario {
    FUNCIONARIO,    // Usuarios que crean tickets
    TECNICO,        // Usuarios que resuelven tickets
    ADMINISTRADOR,  // Usuarios que gestionan el sistema
    SUPERADMIN      // Usuario con acceso total (solo configuración)
}
```

### **📋 Módulo de Tickets**

#### **Entidad Ticket**
```java
@Entity
@Table(name = "tickets")
public class Ticket {
    @Id @GeneratedValue
    private Long id;
    
    @Column(nullable = false)
    private String subject;        // Asunto del ticket
    
    @Column(columnDefinition = "TEXT")
    private String description;    // Descripción detallada
    
    @Enumerated(EnumType.STRING)
    private TicketStatus status;   // PENDIENTE, ASIGNADO, EN_PROCESO, etc.
    
    @Enumerated(EnumType.STRING)
    private Priority priority;     // BAJA, MEDIA, ALTA, URGENTE
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private Usuario creator;       // Usuario que creó el ticket
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_technician_id")
    private Usuario assignedTechnician; // Técnico asignado
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Categoria category;    // Categoría del ticket
}
```

#### **Estados del Ticket**
```java
public enum TicketStatus {
    PENDIENTE,      // Recién creado, esperando asignación
    ASIGNADO,       // Asignado a un técnico
    EN_PROCESO,     // Técnico trabajando en él
    RESUELTO,       // Técnico marcó como resuelto
    CERRADO,        // Cliente confirmó la resolución
    ESCALADO        // Escalado a otro técnico especializado
}
```

#### **Flujo de Estados**
```
PENDIENTE → ASIGNADO → EN_PROCESO → RESUELTO → CERRADO
     ↓           ↓           ↓
   ESCALADO   ESCALADO   ESCALADO
```

### **👥 Módulo de Usuarios**

#### **Entidad Usuario**
```java
@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id @GeneratedValue
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;          // Email único
    
    @Column(nullable = false)
    private String password;       // Contraseña encriptada
    
    @Column(nullable = false)
    private String nombre;         // Nombre
    
    @Column(nullable = false)
    private String apellido;       // Apellido
    
    @Enumerated(EnumType.STRING)
    private TipoUsuario userType;  // Tipo de usuario
    
    @Column(nullable = false)
    private Boolean activo;        // Si está activo o no
}
```

### **🔔 Sistema de Notificaciones**

#### **Notificaciones por Roles**
```java
@Service
public class NotificationRoleService {
    
    // Determina quién debe recibir cada notificación
    public void notificarCreacionTicket(Long ticketId, Long creadorId) {
        // FUNCIONARIO → ADMINISTRADORES
        // TECNICO → ADMINISTRADORES  
        // ADMINISTRADOR → TODOS LOS TÉCNICOS
        // SUPERADMIN → NO GENERA NOTIFICACIONES
    }
    
    public void notificarAsignacionTicket(Long ticketId, Long tecnicoId) {
        // ADMINISTRADOR → TÉCNICO ASIGNADO + CLIENTE
    }
}
```

#### **WebSocket para Notificaciones en Tiempo Real**
```java
@Controller
public class WebSocketController {
    
    @MessageMapping("/notifications")
    @SendTo("/topic/notifications")
    public NotificationMessage sendNotification(NotificationMessage message) {
        // Envía notificaciones en tiempo real via WebSocket
        return message;
    }
}
```

### **📊 Sistema de Asignaciones**

#### **Asignación de Tickets**
```java
@Entity
@Table(name = "asignaciones_tickets")
public class AsignacionTicket {
    @Id @GeneratedValue
    private Long id;
    
    @Column(nullable = false)
    private Long ticketId;         // ID del ticket
    
    @Column(nullable = false)
    private Long tecnicoId;        // ID del técnico
    
    @Column(nullable = false)
    private Boolean activa;        // Si la asignación está activa
    
    @Enumerated(EnumType.STRING)
    private TipoOperacion tipoOperacion; // ASIGNAR, REASIGNAR, ESCALAR
}
```

#### **Tipos de Operación**
```java
public enum TipoOperacion {
    ASIGNAR,        // Primera asignación
    REASIGNAR,      // Cambio de técnico
    ESCALAR         // Escalamiento a especialista
}
```

### **📎 Sistema de Evidencias**

#### **Entidad Evidencia**
```java
@Entity
@Table(name = "evidencias")
public class Evidencia {
    @Id @GeneratedValue
    private Long idEvidencia;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;         // Ticket relacionado
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subido_por_id")
    private Usuario subidoPor;     // Quien subió la evidencia
    
    @Enumerated(EnumType.STRING)
    private TipoEvidencia tipoEvidencia; // IMAGEN, DOCUMENTO, VIDEO
    
    private String nombreArchivo;  // Nombre del archivo
    private String extensionArchivo; // Extensión
    private Long tamanioArchivo;   // Tamaño en bytes
    private String urlArchivo;     // URL para descargar
}
```

### **🔧 Servicios Principales**

#### **TecnicoService**
```java
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TecnicoService {
    
    private final TicketRepository ticketRepository;
    private final UsuarioRepository usuarioRepository;
    private final EvidenciaRepository evidenciaRepository;
    private final HistorialEstadoTicketRepository historialRepository;
    private final AsignacionTicketRepository asignacionTicketRepository;
    
    /**
     * Obtener tickets asignados a un técnico
     */
    @Transactional(readOnly = true)
    public List<TicketTecnicoResponseDTO> obtenerTicketsAsignados(String emailTecnico) {
        // 1. Obtener tickets asignados directamente
        // 2. Obtener tickets escalados (asignaciones activas)
        // 3. Combinar ambas listas
        // 4. Convertir a DTOs
    }
    
    /**
     * Cambiar estado de un ticket
     */
    public TicketTecnicoResponseDTO cambiarEstadoTicket(CambiarEstadoTicketRequestDTO request, String emailTecnico) {
        // 1. Validar permisos del técnico
        // 2. Validar transición de estado
        // 3. Actualizar estado en BD
        // 4. Crear entrada en historial
        // 5. Enviar notificaciones
    }
}
```

---

## 🌐 **FRONTEND - React/TypeScript**

### **📁 Estructura del Proyecto**
```
frontend/gestion-de-tickets/client/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base (Shadcn/UI)
│   ├── NotificationToast.tsx
│   ├── GlobalSystemProvider.tsx
│   └── SimpleColorApplier.tsx
├── modules/            # Módulos por rol
│   ├── admin/         # Panel de administración
│   ├── client_create/ # Creación de tickets
│   ├── client_dashboard/ # Dashboard del cliente
│   ├── notifications/ # Sistema de notificaciones
│   └── _shared/       # Componentes compartidos
│       ├── AdminLayout.tsx
│       ├── ClientLayout.tsx
│       ├── TechnicianLayout.tsx
│       └── GlobalWebSocket.tsx
├── hooks/             # Custom hooks
│   ├── use-role-notifications.ts
│   ├── use-user-info.ts
│   └── useWebSocket.ts
├── i18n/              # Internacionalización
│   ├── index.tsx
│   └── locales/
│       ├── es.json
│       └── en.json
└── lib/               # Utilidades
    └── utils.ts
```

### **🎨 Sistema de Componentes**

#### **Componentes UI Base (Shadcn/UI)**
```typescript
// Button.tsx - Componente de botón
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

**Variantes disponibles:**
- `default` - Botón primario
- `destructive` - Botón de peligro (rojo)
- `outline` - Botón con borde
- `secondary` - Botón secundario
- `ghost` - Botón transparente

#### **Sistema de Layouts**
```typescript
// AdminLayout.tsx - Layout para administradores
export default function AdminLayout() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // Escuchar notificaciones en tiempo real
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      setToastMessage(event.detail.mensaje);
      setShowToast(true);
    };
    
    window.addEventListener('newNotification', handleNewNotification);
    return () => window.removeEventListener('newNotification', handleNewNotification);
  }, []);
  
  return (
    <div className="app-container grid md:grid-cols-[200px_1fr]">
      <aside>/* Sidebar de navegación */</aside>
      <main>/* Contenido principal */</main>
      <NotificationToast show={showToast} message={toastMessage} />
    </div>
  );
}
```

### **🔌 Sistema de APIs**

#### **Cliente HTTP Configurado**
```typescript
// api.ts - Cliente HTTP principal
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 30000,
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### **Servicios de API**
```typescript
// use-role-notifications.ts - Hook para notificaciones
export const useRoleNotifications = (userEmail: string, userRole: string) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const loadNotifications = async () => {
    try {
      const response = await api.get(`/notifications/role-based/user/${userEmail}`);
      const filteredNotifications = response.data.content.filter(notification => {
        // Filtrar notificaciones según el rol del usuario
        return notification.destinatarios.some(destinatario => {
          if (destinatario.startsWith('rol:')) {
            return destinatario === `rol:${userRole}`;
          }
          if (destinatario.startsWith(`${userRole}:`)) {
            return destinatario === `${userRole}:${userEmail}`;
          }
          return false;
        });
      });
      setNotifications(filteredNotifications);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };
  
  return { notifications, unreadCount, loadNotifications };
};
```

### **🌍 Sistema de Internacionalización**

#### **Configuración i18n**
```typescript
// i18n/index.tsx
const i18n = createI18n({
  locale: 'es', // idioma por defecto
  fallbackLocale: 'en',
  messages: {
    es: esMessages,
    en: enMessages,
  },
});
```

#### **Uso en Componentes**
```typescript
export default function CreateTicket() {
  const { t } = useI18n();
  
  return (
    <div>
      <h1>{t('client.create_ticket')}</h1>
      <p>{t('client.fill_form')}</p>
    </div>
  );
}
```

### **🔔 Sistema de Notificaciones en Tiempo Real**

#### **WebSocket Global**
```typescript
// GlobalWebSocket.tsx - Gestor global de WebSocket
export default function GlobalWebSocket() {
  const [socket, setSocket] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  
  useEffect(() => {
    const connectWebSocket = () => {
      const token = localStorage.getItem('authToken');
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      
      if (token && userInfo) {
        const newSocket = new SockJS('/ws');
        const stompClient = Stomp.over(newSocket);
        
        stompClient.connect({ Authorization: `Bearer ${token}` }, () => {
          stompClient.subscribe('/topic/notifications', (message) => {
            const notification = JSON.parse(message.body);
            
            // Filtrar notificaciones para el usuario actual
            if (shouldShowNotification(notification, userInfo)) {
              // Disparar evento personalizado
              window.dispatchEvent(new CustomEvent('newNotification', {
                detail: notification
              }));
            }
          });
        });
        
        setSocket(stompClient);
      }
    };
    
    connectWebSocket();
  }, []);
}
```

#### **Toast de Notificaciones**
```typescript
// NotificationToast.tsx - Toast para mostrar notificaciones
export default function NotificationToast({ show, message, onClose, onViewNotifications }) {
  if (!show) return null;
  
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm 
                    bg-card border border-border rounded-lg shadow-lg p-3 z-50">
      <div className="flex items-center gap-3">
        <Bell className="w-4 h-4 text-primary animate-pulse" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground truncate">
            {message}
          </p>
          <p className="text-xs text-muted-foreground">
            Toca para ver detalles
          </p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

---

## 📱 **APLICACIÓN MÓVIL - React Native/Expo**

### **📁 Estructura del Proyecto**
```
movil/
├── src/
│   ├── components/     # Componentes reutilizables
│   │   └── NotificationToast.tsx
│   ├── screens/        # Pantallas de la app
│   │   ├── TecnicoDashboard.tsx
│   │   ├── LoginScreen.tsx
│   │   └── NotificacionesModal.tsx
│   ├── services/       # Servicios de API
│   │   ├── TecnicoService.ts
│   │   ├── WebSocketService.ts
│   │   └── NotificacionService.ts
│   ├── hooks/          # Custom hooks
│   │   ├── useRealtimeNotifications.ts
│   │   ├── useTheme.ts
│   │   └── useTranslation.ts
│   ├── i18n/           # Internacionalización
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── es.json
│   │       └── en.json
│   └── utils/          # Utilidades
├── assets/             # Imágenes y recursos
│   ├── NEITickets.png
│   ├── icon.png
│   └── splash-icon.png
└── app.json           # Configuración de Expo
```

### **🔧 Configuración de Expo**
```json
// app.json
{
  "expo": {
    "name": "NEITickets Mobile",
    "slug": "neitickets-mobile",
    "version": "1.0.0",
    "icon": "./assets/NEITickets.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "backgroundColor": "#30692E"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/NEITickets.png"
      }
    }
  }
}
```

### **📱 Pantallas Principales**

#### **Dashboard del Técnico**
```typescript
// TecnicoDashboard.tsx - Pantalla principal del técnico
export default function TecnicoDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Hook personalizado para notificaciones en tiempo real
  const { 
    showToast, 
    toastMessage, 
    unreadCount, 
    hideToast 
  } = useRealtimeNotifications();
  
  const loadTickets = async () => {
    try {
      const response = await TecnicoService.getTickets();
      setTickets(response.data);
    } catch (error) {
      console.error('Error cargando tickets:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadTickets();
  }, []);
  
  return (
    <View style={styles.container}>
      {/* Header con notificaciones */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Tickets</Text>
        <TouchableOpacity onPress={() => setNotificacionesVisible(true)}>
          <Bell size={24} color={theme.colors.primary} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Lista de tickets */}
      <FlatList
        data={tickets}
        renderItem={({ item }) => <TicketCard ticket={item} />}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={loadTickets}
      />
      
      {/* Toast de notificaciones */}
      <NotificationToast
        visible={showToast}
        message={toastMessage}
        onPress={() => {
          hideToast();
          setNotificacionesVisible(true);
        }}
        onClose={hideToast}
      />
    </View>
  );
}
```

### **🔌 Servicios de API**

#### **Servicio de Técnico**
```typescript
// TecnicoService.ts - Servicio para operaciones del técnico
class TecnicoService {
  private static baseURL = 'http://localhost:8080/api/tecnico';
  
  static async getTickets(): Promise<ApiResponse<TicketTecnicoResponseDTO[]>> {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${this.baseURL}/tickets`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
  
  static async cambiarEstadoTicket(
    ticketId: number, 
    nuevoEstado: string, 
    comentario?: string
  ): Promise<ApiResponse<TicketTecnicoResponseDTO>> {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${this.baseURL}/tickets/cambiar-estado`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticketId,
        nuevoEstado,
        comentario,
      }),
    });
    return response.json();
  }
}
```

#### **Servicio de WebSocket**
```typescript
// WebSocketService.ts - Servicio para WebSocket
class WebSocketService {
  private stompClient: any = null;
  private isConnected = false;
  
  async connect(token: string, userEmail: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new SockJS('http://localhost:8080/ws');
      this.stompClient = Stomp.over(socket);
      
      this.stompClient.connect(
        { Authorization: `Bearer ${token}` },
        () => {
          this.isConnected = true;
          console.log('✅ WebSocket conectado');
          resolve();
        },
        (error: any) => {
          console.error('❌ Error conectando WebSocket:', error);
          reject(error);
        }
      );
    });
  }
  
  subscribeToNotifications(): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.subscribe('/topic/notifications', (message: any) => {
        const notification = JSON.parse(message.body);
        console.log('🔔 Notificación recibida:', notification);
        
        // Emitir evento personalizado
        this.emit('notification', notification);
      });
    }
  }
}
```

### **🎣 Custom Hooks**

#### **Hook de Notificaciones en Tiempo Real**
```typescript
// useRealtimeNotifications.ts - Hook para notificaciones en tiempo real
export const useRealtimeNotifications = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const connectWebSocket = async () => {
      const authToken = await AsyncStorage.getItem('authToken');
      const userInfoString = await AsyncStorage.getItem('userInfo');
      
      if (authToken && userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        try {
          await webSocketService.connect(authToken, userInfo.email);
          webSocketService.subscribeToNotifications();
          webSocketService.on('notification', handleNewNotification);
        } catch (error) {
          console.error('❌ Error conectando WebSocket:', error);
        }
      }
    };

    connectWebSocket();
    
    return () => {
      webSocketService.off('notification', handleNewNotification);
      webSocketService.disconnect();
    };
  }, []);

  const handleNewNotification = useCallback((notificationData: NotificationMessage['data']) => {
    setToastMessage(notificationData.mensaje);
    setShowToast(true);
    setUnreadCount(prev => prev + 1);
    
    // Auto-hide después de 5 segundos
    setTimeout(() => setShowToast(false), 5000);
  }, []);

  return {
    showToast,
    toastMessage,
    unreadCount,
    hideToast: () => setShowToast(false),
  };
};
```

#### **Toast de Notificaciones Móvil**
```typescript
// NotificationToast.tsx - Toast nativo para React Native
export default function NotificationToast({
  visible,
  message,
  onPress,
  onClose,
  autoHideDuration = 5000,
}) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animación de entrada
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide timer
      const timer = setTimeout(() => hideToast(), autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [visible, autoHideDuration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  return (
    <Animated.View style={[styles.toastContainer, { transform: [{ translateY }], opacity }]}>
      <TouchableOpacity onPress={onPress} style={styles.toastContent}>
        <Bell size={20} color={theme.colors.primary} />
        <View style={styles.messageContainer}>
          <Text style={styles.messageText} numberOfLines={1}>
            {message}
          </Text>
          <Text style={styles.tapToViewText}>Toca para ver detalles</Text>
        </View>
        <TouchableOpacity onPress={(e) => { e.stopPropagation(); hideToast(); }}>
          <X size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}
```

---

## 🔗 **INTEGRACIONES ENTRE COMPONENTES**

### **🔄 Flujo de Datos Completo**

#### **1. Creación de Ticket**
```
Cliente (Frontend) → API Backend → Base de Datos
                    ↓
                Notificación WebSocket → Todos los clientes conectados
                    ↓
            Toast aparece en tiempo real en Admin/Técnico/Móvil
```

#### **2. Asignación de Ticket**
```
Admin (Frontend) → API Backend → Base de Datos
                    ↓
                Notificación WebSocket → Técnico asignado + Cliente
                    ↓
            Toast aparece en móvil del técnico y web del cliente
```

#### **3. Cambio de Estado**
```
Técnico (Móvil) → API Backend → Base de Datos
                    ↓
                Notificación WebSocket → Cliente + Admin
                    ↓
            Toast aparece en web del cliente y admin
```

### **📡 Comunicación WebSocket**

#### **Backend - Configuración WebSocket**
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
```

#### **Frontend - Conexión WebSocket**
```typescript
// GlobalWebSocket.tsx
const connectWebSocket = () => {
  const socket = new SockJS('/ws');
  const stompClient = Stomp.over(socket);
  
  stompClient.connect({ Authorization: `Bearer ${token}` }, () => {
    stompClient.subscribe('/topic/notifications', (message) => {
      const notification = JSON.parse(message.body);
      
      // Filtrar para el usuario actual
      if (shouldShowNotification(notification, userInfo)) {
        window.dispatchEvent(new CustomEvent('newNotification', {
          detail: notification
        }));
      }
    });
  });
};
```

#### **Móvil - Conexión WebSocket**
```typescript
// WebSocketService.ts
async connect(token: string, userEmail: string): Promise<void> {
  const socket = new SockJS('http://localhost:8080/ws');
  this.stompClient = Stomp.over(socket);
  
  this.stompClient.connect(
    { Authorization: `Bearer ${token}` },
    () => {
      this.stompClient.subscribe('/topic/notifications', (message) => {
        const notification = JSON.parse(message.body);
        this.emit('notification', notification);
      });
    }
  );
}
```

---

## 🛠️ **TECNOLOGÍAS UTILIZADAS**

### **Backend**
- **Java 17** - Lenguaje de programación
- **Spring Boot 3.x** - Framework principal
- **Spring Security** - Autenticación y autorización
- **Spring Data JPA** - Persistencia de datos
- **Spring WebSocket** - Notificaciones en tiempo real
- **JWT** - Tokens de autenticación
- **MySQL** - Base de datos
- **Maven** - Gestión de dependencias

### **Frontend Web**
- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS
- **Shadcn/UI** - Componentes de UI
- **Axios** - Cliente HTTP
- **SockJS + Stomp** - WebSocket
- **React Router** - Enrutamiento
- **React i18next** - Internacionalización

### **Aplicación Móvil**
- **React Native** - Framework móvil
- **Expo** - Plataforma de desarrollo
- **TypeScript** - Tipado estático
- **AsyncStorage** - Almacenamiento local
- **React Navigation** - Navegación
- **SockJS + Stomp** - WebSocket
- **React i18next** - Internacionalización

---

## 📊 **BASE DE DATOS**

### **Tablas Principales**

#### **usuarios**
```sql
CREATE TABLE usuarios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    user_type ENUM('FUNCIONARIO', 'TECNICO', 'ADMINISTRADOR', 'SUPERADMIN') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### **tickets**
```sql
CREATE TABLE tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject VARCHAR(500) NOT NULL,
    description TEXT,
    status ENUM('PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO', 'ESCALADO') DEFAULT 'PENDIENTE',
    priority ENUM('BAJA', 'MEDIA', 'ALTA', 'URGENTE') DEFAULT 'MEDIA',
    creator_id BIGINT NOT NULL,
    assigned_technician_id BIGINT,
    category_id BIGINT,
    location VARCHAR(255),
    attached_file VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (creator_id) REFERENCES usuarios(id),
    FOREIGN KEY (assigned_technician_id) REFERENCES usuarios(id),
    FOREIGN KEY (category_id) REFERENCES categorias(id)
);
```

#### **asignaciones_tickets**
```sql
CREATE TABLE asignaciones_tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT NOT NULL,
    tecnico_id BIGINT NOT NULL,
    tipo_operacion ENUM('ASIGNAR', 'REASIGNAR', 'ESCALAR') NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comentario TEXT,
    email_usuario VARCHAR(255),
    
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
);
```

#### **evidencias**
```sql
CREATE TABLE evidencias (
    id_evidencia BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT NOT NULL,
    subido_por_id BIGINT NOT NULL,
    tipo_evidencia ENUM('IMAGEN', 'DOCUMENTO', 'VIDEO', 'AUDIO') NOT NULL,
    descripcion TEXT,
    nombre_archivo VARCHAR(500) NOT NULL,
    extension_archivo VARCHAR(10),
    tamanio_archivo BIGINT,
    url_archivo VARCHAR(500),
    ruta_archivo VARCHAR(500),
    activa BOOLEAN DEFAULT TRUE,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (subido_por_id) REFERENCES usuarios(id)
);
```

#### **notificaciones**
```sql
CREATE TABLE notificaciones (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    ticket_id BIGINT,
    tipo VARCHAR(100) NOT NULL,
    titulo VARCHAR(500),
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP NULL,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);
```

---

## 🚀 **INSTALACIÓN Y CONFIGURACIÓN**

### **Backend**

1. **Requisitos:**
   - Java 17+
   - Maven 3.6+
   - MySQL 8.0+

2. **Configuración:**
   ```bash
   cd backend/demo
   ./mvnw.cmd clean install
   ```

3. **Base de datos:**
   - Crear base de datos MySQL
   - Configurar `application.properties`
   - Ejecutar scripts de migración

4. **Ejecución:**
   ```bash
   ./mvnw.cmd spring-boot:run
   ```

### **Frontend Web**

1. **Requisitos:**
   - Node.js 18+
   - npm/pnpm

2. **Instalación:**
   ```bash
   cd frontend/gestion-de-tickets
   npm install
   ```

3. **Configuración:**
   - Actualizar URL del backend en `api.ts`
   - Configurar variables de entorno

4. **Ejecución:**
   ```bash
   npm run dev
   ```

### **Aplicación Móvil**

1. **Requisitos:**
   - Node.js 18+
   - Expo CLI
   - Android Studio / Xcode

2. **Instalación:**
   ```bash
   cd movil
   npm install
   ```

3. **Configuración:**
   - Actualizar URL del backend en servicios
   - Configurar `app.json`

4. **Ejecución:**
   ```bash
   npx expo start
   ```

---

## 🔒 **SEGURIDAD**

### **Autenticación JWT**
- Tokens con expiración de 24 horas
- Refresh tokens para renovación automática
- Validación en cada request

### **Autorización por Roles**
- FUNCIONARIO: Solo crear y ver sus tickets
- TECNICO: Ver tickets asignados, cambiar estados
- ADMINISTRADOR: Gestión completa del sistema
- SUPERADMIN: Solo configuración (no genera notificaciones)

### **Validación de Datos**
- Validación en frontend y backend
- Sanitización de inputs
- Protección contra SQL injection (JPA)

---

## 📈 **MONITOREO Y LOGS**

### **Logging**
- Logs estructurados con SLF4J
- Diferentes niveles (DEBUG, INFO, WARN, ERROR)
- Trazabilidad completa de operaciones

### **Métricas**
- Contadores de tickets por estado
- Tiempo promedio de resolución
- Estadísticas por técnico

---

## 🎯 **FUNCIONALIDADES PRINCIPALES**

### **Para Funcionarios (Clientes)**
- ✅ Crear tickets con categorías
- ✅ Subir archivos adjuntos
- ✅ Ver estado de sus tickets
- ✅ Comunicación con técnicos
- ✅ Notificaciones en tiempo real

### **Para Técnicos**
- ✅ Ver tickets asignados
- ✅ Cambiar estados de tickets
- ✅ Subir evidencias
- ✅ Comunicación con clientes
- ✅ Notificaciones móviles en tiempo real

### **Para Administradores**
- ✅ Gestión completa de tickets
- ✅ Asignación y reasignación
- ✅ Escalamiento de tickets
- ✅ Gestión de usuarios
- ✅ Reportes y estadísticas
- ✅ Notificaciones en tiempo real

### **Para Super Administradores**
- ✅ Crear administradores
- ✅ Configurar colores del sistema
- ✅ Gestión de categorías
- ✅ Configuración general

---

## 🔄 **FLUJOS DE TRABAJO**

### **Flujo de Creación de Ticket**
1. Funcionario crea ticket en frontend
2. Sistema valida datos y guarda en BD
3. Notificación automática a administradores
4. Toast aparece en tiempo real
5. Administrador asigna a técnico
6. Técnico recibe notificación en móvil

### **Flujo de Resolución**
1. Técnico acepta ticket (PENDIENTE → EN_PROCESO)
2. Cliente recibe notificación de inicio
3. Técnico sube evidencias y resuelve (EN_PROCESO → RESUELTO)
4. Cliente recibe notificación de resolución
5. Cliente confirma resolución (RESUELTO → CERRADO)

### **Flujo de Escalamiento**
1. Técnico solicita escalamiento
2. Administrador asigna a técnico especializado
3. Ticket se marca como ESCALADO
4. Nuevo técnico recibe notificación
5. Técnico anterior pierde acceso

---

## 🎨 **INTERFAZ DE USUARIO**

### **Diseño Responsivo**
- Adaptable a móviles, tablets y desktop
- Componentes reutilizables
- Tema claro/oscuro configurable

### **Experiencia de Usuario**
- Navegación intuitiva
- Feedback visual inmediato
- Notificaciones no intrusivas
- Carga rápida y fluida

### **Accesibilidad**
- Soporte para lectores de pantalla
- Navegación por teclado
- Contraste adecuado
- Textos descriptivos

---

## 📱 **CARACTERÍSTICAS MÓVILES**

### **Funcionalidades Nativas**
- Notificaciones push (preparado para FCM)
- Almacenamiento local con AsyncStorage
- Navegación nativa
- Gestos táctiles

### **Offline Support**
- Cache de datos críticos
- Sincronización automática
- Manejo de conectividad

---

## 🔧 **MANTENIMIENTO**

### **Actualizaciones**
- Backend: Actualizaciones automáticas con Maven
- Frontend: Hot reload en desarrollo
- Móvil: Over-the-air updates con Expo

### **Backup**
- Base de datos: Backups automáticos diarios
- Archivos: Backup de evidencias y adjuntos
- Configuración: Versionado en Git

### **Escalabilidad**
- API REST stateless
- Base de datos optimizada
- Caching estratégico
- Load balancing preparado

---

## 📞 **SOPORTE**

### **Documentación**
- Este archivo de documentación completa
- Comentarios en código
- README por módulo

### **Debugging**
- Logs detallados en backend
- DevTools en frontend
- React Native Debugger en móvil

### **Testing**
- Tests unitarios en backend
- Tests de integración
- Tests E2E preparados

---

## 📖 **EXPLICACIÓN COMPLETA DE SINTAXIS Y FUNCIONAMIENTO**

### **🔧 BACKEND - Java/Spring Boot - SINTAXIS DETALLADA**

#### **🏗️ Estructura de Paquetes Java**
```java
package com.example.demo.tecnico.service;
// ↑ Define el paquete donde está la clase
// Sigue la convención: com.empresa.proyecto.modulo.submodulo
```

#### **📋 Anotaciones de Spring Boot - Explicación Completa**

##### **@Service y Anotaciones de Clase**
```java
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TecnicoService {
```
**Explicación línea por línea:**
- `@Service`: Marca la clase como un servicio de Spring (lógica de negocio)
- `@RequiredArgsConstructor`: Genera constructor automático con campos `final`
- `@Transactional`: Todas las operaciones son transaccionales (rollback automático si hay error)
- `@Slf4j`: Genera logger automático (log.info(), log.error(), etc.)

##### **@Entity y JPA - Mapeo de Base de Datos**
```java
@Entity
@Table(name = "tickets")
public class Ticket {
    @Id 
    @GeneratedValue
    private Long id;
    
    @Column(nullable = false)
    private String subject;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private Usuario creator;
}
```
**Explicación detallada:**
- `@Entity`: Marca la clase como entidad de base de datos
- `@Table(name = "tickets")`: Especifica el nombre de la tabla
- `@Id`: Marca el campo como clave primaria
- `@GeneratedValue`: El ID se genera automáticamente
- `@Column(nullable = false)`: El campo no puede ser nulo
- `@ManyToOne`: Relación muchos a uno (muchos tickets → un usuario)
- `@JoinColumn`: Especifica la columna de la clave foránea
- `FetchType.LAZY`: Carga perezosa (solo carga cuando se accede)

#### **🔐 Sistema de Seguridad - Sintaxis Completa**

##### **JWT Filter - Explicación Línea por Línea**
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        // 1. Extraer token del header Authorization
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Remover "Bearer "
            
            // 2. Validar token
            if (jwtUtil.validateToken(token)) {
                // 3. Extraer email del token
                String email = jwtUtil.extractEmail(token);
                
                // 4. Cargar usuario desde BD
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                
                // 5. Crear autenticación
                UsernamePasswordAuthenticationToken auth = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                
                // 6. Establecer en contexto de seguridad
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        
        // 7. Continuar con la cadena de filtros
        filterChain.doFilter(request, response);
    }
}
```

##### **CustomUserDetails - Implementación UserDetails**
```java
public class CustomUserDetails implements UserDetails {
    private final Usuario usuario;
    
    public CustomUserDetails(Usuario usuario) {
        this.usuario = usuario;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Convertir TipoUsuario a GrantedAuthority
        return Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + usuario.getUserType().name())
        );
    }
    
    @Override
    public String getPassword() {
        return usuario.getPassword();
    }
    
    @Override
    public String getUsername() {
        return usuario.getEmail();
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return usuario.getActivo();
    }
}
```

#### **📊 Repositorios JPA - Sintaxis Completa**

##### **TicketRepository - Query Methods**
```java
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    // Query Methods - Spring Data JPA genera automáticamente las consultas
    List<Ticket> findByAssignedTechnicianOrderByCreatedAtDesc(Usuario tecnico);
    // ↑ Equivale a: SELECT * FROM tickets WHERE assigned_technician_id = ? ORDER BY created_at DESC
    
    List<Ticket> findByCreatorOrderByCreatedAtDesc(Usuario creator);
    // ↑ Equivale a: SELECT * FROM tickets WHERE creator_id = ? ORDER BY created_at DESC
    
    List<Ticket> findByStatusIn(List<String> statuses);
    // ↑ Equivale a: SELECT * FROM tickets WHERE status IN (?, ?, ?)
    
    @Query("SELECT t FROM Ticket t WHERE t.status = :status AND t.priority = :priority")
    List<Ticket> findTicketsByStatusAndPriority(@Param("status") String status, 
                                               @Param("priority") String priority);
    // ↑ Query personalizada con JPQL (Java Persistence Query Language)
    
    @Query(value = "SELECT * FROM tickets WHERE created_at >= :fecha", nativeQuery = true)
    List<Ticket> findTicketsAfterDate(@Param("fecha") LocalDateTime fecha);
    // ↑ Query SQL nativa
}
```

#### **🎯 Servicios - Sintaxis Completa**

##### **TecnicoService - Método Completo Explicado**
```java
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TecnicoService {
    
    // Inyección de dependencias (Lombok @RequiredArgsConstructor genera esto automáticamente)
    private final TicketRepository ticketRepository;
    private final UsuarioRepository usuarioRepository;
    private final EvidenciaRepository evidenciaRepository;
    private final HistorialEstadoTicketRepository historialRepository;
    private final AsignacionTicketRepository asignacionTicketRepository;
    
    /**
     * Obtener tickets asignados a un técnico
     * @param emailTecnico Email del técnico
     * @return Lista de tickets asignados
     */
    @Transactional(readOnly = true) // Solo lectura, no modifica datos
    public List<TicketTecnicoResponseDTO> obtenerTicketsAsignados(String emailTecnico) {
        // 1. Logging para debugging
        log.info("🔍 [TECNICO] Obteniendo tickets asignados para técnico: {}", emailTecnico);
        
        // 2. Buscar usuario por email
        Usuario tecnico = usuarioRepository.findByEmail(emailTecnico)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        // ↑ orElseThrow: Si no encuentra, lanza RuntimeException
        
        log.info("🔍 [TECNICO] Técnico encontrado: {} (ID: {})", tecnico.getEmail(), tecnico.getId());
        
        // 3. Obtener tickets asignados directamente
        List<Ticket> ticketsDirectos = ticketRepository.findByAssignedTechnicianOrderByCreatedAtDesc(tecnico);
        log.info("🔍 [TECNICO] Tickets asignados directamente: {}", ticketsDirectos.size());
        
        // 4. Obtener tickets escalados (asignaciones activas)
        List<AsignacionTicket> asignacionesActivas = asignacionTicketRepository.findByTecnicoIdAndActivaTrue(tecnico.getId());
        log.info("🔍 [TECNICO] Asignaciones activas encontradas: {}", asignacionesActivas.size());
        
        // 5. Obtener tickets de las asignaciones activas
        List<Ticket> ticketsEscalados = new ArrayList<>();
        for (AsignacionTicket asignacion : asignacionesActivas) {
            Optional<Ticket> ticketOpt = ticketRepository.findById(asignacion.getTicketId());
            if (ticketOpt.isPresent()) { // Verificar si el Optional tiene valor
                Ticket ticket = ticketOpt.get(); // Obtener el valor del Optional
                
                // 6. Solo incluir si no está ya en la lista directa
                boolean yaIncluido = ticketsDirectos.stream()
                    .anyMatch(t -> t.getId().equals(ticket.getId()));
                // ↑ Stream API: anyMatch verifica si algún elemento cumple la condición
                
                if (!yaIncluido) {
                    ticketsEscalados.add(ticket);
                    log.info("🔍 [TECNICO] Ticket escalado agregado: {} - Estado: {}", 
                        ticket.getId(), ticket.getStatus());
                }
            }
        }
        
        // 7. Combinar ambas listas
        List<Ticket> todosLosTickets = new ArrayList<>();
        todosLosTickets.addAll(ticketsDirectos); // Agregar todos los elementos
        todosLosTickets.addAll(ticketsEscalados);
        
        // 8. Convertir a DTOs usando Stream API
        return todosLosTickets.stream()
            .map(this::convertirTicketAResponseDTO) // Convertir cada ticket a DTO
            .collect(Collectors.toList()); // Recolectar en una lista
    }
}
```

#### **🔄 Stream API - Sintaxis Completa**

##### **Operaciones con Stream API**
```java
// Ejemplo de uso de Stream API en el servicio
public List<TicketTecnicoResponseDTO> obtenerTicketsActivos(String emailTecnico) {
    return ticketRepository.findByAssignedTechnician(tecnico)
        .stream()                                    // Crear stream
        .filter(ticket -> !"CERRADO".equals(ticket.getStatus())) // Filtrar tickets no cerrados
        .filter(ticket -> ticket.getPriority().equals("ALTA"))   // Filtrar solo alta prioridad
        .sorted((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt())) // Ordenar por fecha descendente
        .map(this::convertirTicketAResponseDTO)      // Convertir a DTO
        .collect(Collectors.toList());               // Recolectar en lista
}

// Operaciones más complejas
public Map<String, Long> obtenerEstadisticasPorEstado(String emailTecnico) {
    return ticketRepository.findByAssignedTechnician(tecnico)
        .stream()
        .collect(Collectors.groupingBy(
            Ticket::getStatus,                        // Agrupar por estado
            Collectors.counting()                     // Contar elementos por grupo
        ));
}
```

#### **🎮 Controladores REST - Sintaxis Completa**

##### **TecnicoController - Explicación Detallada**
```java
@RestController
@RequestMapping("/api/tecnico")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TecnicoController {
    
    private final TecnicoService tecnicoService;
    
    /**
     * Obtener tickets asignados al técnico
     * GET /api/tecnico/tickets
     */
    @GetMapping("/tickets")
    public ResponseEntity<?> obtenerTicketsAsignados(Authentication authentication) {
        try {
            log.info("Obteniendo tickets asignados para técnico");
            
            // 1. Extraer información del usuario autenticado
            String emailTecnico;
            if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                emailTecnico = userDetails.getEmail();
            } else {
                // Usar email por defecto para testing
                emailTecnico = "admin@test.com";
                log.info("No hay autenticación, usando email por defecto: {}", emailTecnico);
            }
            
            // 2. Llamar al servicio
            List<TicketTecnicoResponseDTO> tickets = tecnicoService.obtenerTicketsAsignados(emailTecnico);
            
            // 3. Retornar respuesta exitosa
            return ResponseEntity.ok(ApiResponse.success("Tickets obtenidos exitosamente", tickets));
        } catch (Exception e) {
            log.error("Error obteniendo tickets asignados", e);
            // 4. Retornar respuesta de error
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener tickets: " + e.getMessage())
            );
        }
    }
    
    /**
     * Cambiar estado de un ticket
     * PUT /api/tecnico/tickets/cambiar-estado
     */
    @PutMapping("/tickets/cambiar-estado")
    public ResponseEntity<?> cambiarEstadoTicket(
            @Valid @RequestBody CambiarEstadoTicketRequestDTO request,
            Authentication authentication) {
        try {
            log.info("Cambiando estado del ticket {} a {}", request.getTicketId(), request.getNuevoEstado());
            
            // 1. Extraer email del usuario autenticado
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            // 2. Llamar al servicio
            TicketTecnicoResponseDTO ticket = tecnicoService.cambiarEstadoTicket(request, emailTecnico);
            
            // 3. Retornar respuesta exitosa
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            log.error("Error cambiando estado del ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al cambiar estado: " + e.getMessage())
            );
        }
    }
}
```

### **🌐 FRONTEND - React/TypeScript - SINTAXIS DETALLADA**

#### **⚛️ Componentes React - Sintaxis Completa**

##### **Componente Funcional con Hooks**
```typescript
// TecnicoDashboard.tsx - Explicación línea por línea
import React, { useState, useEffect, useCallback } from 'react';
// ↑ Importar React y hooks necesarios

interface TecnicoDashboardProps {
  // Definir props del componente
  initialData?: TicketTecnicoResponseDTO[];
  onTicketSelect?: (ticket: TicketTecnicoResponseDTO) => void;
}

export default function TecnicoDashboard({ initialData, onTicketSelect }: TecnicoDashboardProps) {
  // 1. Estados locales del componente
  const [tickets, setTickets] = useState<TicketTecnicoResponseDTO[]>(initialData || []);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketTecnicoResponseDTO | null>(null);
  
  // 2. Hook personalizado para notificaciones
  const { 
    showToast, 
    toastMessage, 
    unreadCount, 
    hideToast 
  } = useRealtimeNotifications();
  
  // 3. Función para cargar tickets
  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Llamar al servicio de API
      const response = await TecnicoService.getTickets();
      
      if (response.success) {
        setTickets(response.data);
      } else {
        setError(response.message || 'Error cargando tickets');
      }
    } catch (err) {
      console.error('Error cargando tickets:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 4. useEffect para cargar datos al montar el componente
  useEffect(() => {
    loadTickets();
  }, [loadTickets]);
  
  // 5. Función para manejar selección de ticket
  const handleTicketSelect = useCallback((ticket: TicketTecnicoResponseDTO) => {
    setSelectedTicket(ticket);
    onTicketSelect?.(ticket); // Llamar callback si existe
  }, [onTicketSelect]);
  
  // 6. Renderizado condicional
  if (loading) {
    return <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (error) {
    return <div className="text-center p-8 text-red-500">
      <p>Error: {error}</p>
      <button onClick={loadTickets} className="mt-2 px-4 py-2 bg-primary text-white rounded">
        Reintentar
      </button>
    </div>;
  }
  
  // 7. Renderizado principal
  return (
    <div className="container mx-auto p-4">
      {/* Header con notificaciones */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Tickets</h1>
        <button 
          onClick={() => setNotificacionesVisible(true)}
          className="relative p-2 hover:bg-gray-100 rounded-full"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
      
      {/* Lista de tickets */}
      <div className="grid gap-4">
        {tickets.map(ticket => (
          <TicketCard 
            key={ticket.id}
            ticket={ticket}
            onClick={() => handleTicketSelect(ticket)}
            isSelected={selectedTicket?.id === ticket.id}
          />
        ))}
      </div>
      
      {/* Toast de notificaciones */}
      <NotificationToast
        visible={showToast}
        message={toastMessage}
        onPress={() => {
          hideToast();
          setNotificacionesVisible(true);
        }}
        onClose={hideToast}
      />
    </div>
  );
}
```

#### **🎣 Custom Hooks - Sintaxis Completa**

##### **useRealtimeNotifications Hook**
```typescript
// useRealtimeNotifications.ts - Explicación detallada
import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import webSocketService, { NotificationMessage } from '../services/WebSocketService';

export const useRealtimeNotifications = () => {
  // 1. Estados del hook
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // 2. Referencias para timers
  const toastTimer = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef<boolean>(true);
  
  // 3. Función para cargar contador de no leídas
  const loadUnreadCount = useCallback(async () => {
    try {
      const userInfoString = await AsyncStorage.getItem('userInfo');
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (userInfoString && authToken) {
        const userInfo = JSON.parse(userInfoString);
        const count = await NotificacionService.getContadorNotificaciones(authToken, userInfo.email);
        
        if (isMounted.current) {
          setUnreadCount(count);
        }
      }
    } catch (error) {
      console.error('❌ [NOTIF HOOK] Error cargando contador:', error);
    }
  }, []);
  
  // 4. Función para manejar nueva notificación
  const handleNewNotification = useCallback((notificationData: NotificationMessage['data']) => {
    console.log('🔔 [NOTIF HOOK] Nueva notificación:', notificationData);
    
    if (isMounted.current) {
      setToastMessage(notificationData.mensaje);
      setShowToast(true);
      setUnreadCount(prev => prev + 1); // Incrementar contador
      
      // Limpiar timer anterior si existe
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
      
      // Ocultar toast automáticamente después de 5 segundos
      toastTimer.current = setTimeout(() => {
        if (isMounted.current) {
          setShowToast(false);
        }
      }, 5000);
    }
  }, []);
  
  // 5. Función para ocultar toast manualmente
  const hideToast = useCallback(() => {
    if (isMounted.current) {
      setShowToast(false);
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
        toastTimer.current = null;
      }
    }
  }, []);
  
  // 6. useEffect para configurar WebSocket
  useEffect(() => {
    isMounted.current = true;
    
    const connectWebSocket = async () => {
      const authToken = await AsyncStorage.getItem('authToken');
      const userInfoString = await AsyncStorage.getItem('userInfo');
      
      if (authToken && userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        try {
          await webSocketService.connect(authToken, userInfo.email);
          webSocketService.subscribeToNotifications();
          webSocketService.on('notification', handleNewNotification);
          console.log('✅ [NOTIF HOOK] WebSocket conectado');
        } catch (error) {
          console.error('❌ [NOTIF HOOK] Error conectando WebSocket:', error);
        }
      }
    };
    
    connectWebSocket();
    loadUnreadCount();
    
    // 7. Cleanup function
    return () => {
      isMounted.current = false;
      webSocketService.off('notification', handleNewNotification);
      webSocketService.unsubscribeFromNotifications();
      webSocketService.disconnect();
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
      console.log('🔌 [NOTIF HOOK] WebSocket desconectado');
    };
  }, [handleNewNotification, loadUnreadCount]);
  
  // 8. Retornar valores y funciones del hook
  return {
    showToast,
    toastMessage,
    unreadCount,
    hideToast,
    refreshNotifications: loadUnreadCount,
  };
};
```

#### **🔌 Servicios de API - Sintaxis Completa**

##### **TecnicoService - Clase de Servicio**
```typescript
// TecnicoService.ts - Explicación detallada
class TecnicoService {
  private static baseURL: string = 'http://localhost:8080/api/tecnico';
  
  /**
   * Obtener tickets del técnico
   * @returns Promise con respuesta de la API
   */
  static async getTickets(): Promise<ApiResponse<TicketTecnicoResponseDTO[]>> {
    try {
      // 1. Obtener token de autenticación
      const token = await AsyncStorage.getItem('authToken');
      
      // 2. Configurar headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // 3. Realizar petición HTTP
      const response = await fetch(`${this.baseURL}/tickets`, {
        method: 'GET',
        headers,
      });
      
      // 4. Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 5. Parsear respuesta JSON
      const data: ApiResponse<TicketTecnicoResponseDTO[]> = await response.json();
      
      console.log('✅ [TECNICO SERVICE] Tickets obtenidos:', data);
      return data;
      
    } catch (error) {
      console.error('❌ [TECNICO SERVICE] Error obteniendo tickets:', error);
      throw error;
    }
  }
  
  /**
   * Cambiar estado de un ticket
   * @param ticketId ID del ticket
   * @param nuevoEstado Nuevo estado
   * @param comentario Comentario opcional
   * @returns Promise con respuesta de la API
   */
  static async cambiarEstadoTicket(
    ticketId: number, 
    nuevoEstado: string, 
    comentario?: string
  ): Promise<ApiResponse<TicketTecnicoResponseDTO>> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // 1. Preparar datos del request
      const requestBody = {
        ticketId,
        nuevoEstado,
        comentario,
      };
      
      console.log('📤 [TECNICO SERVICE] Enviando cambio de estado:', requestBody);
      
      // 2. Realizar petición HTTP
      const response = await fetch(`${this.baseURL}/tickets/cambiar-estado`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(requestBody),
      });
      
      // 3. Verificar respuesta
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // 4. Parsear respuesta
      const data: ApiResponse<TicketTecnicoResponseDTO> = await response.json();
      
      console.log('✅ [TECNICO SERVICE] Estado cambiado exitosamente:', data);
      return data;
      
    } catch (error) {
      console.error('❌ [TECNICO SERVICE] Error cambiando estado:', error);
      throw error;
    }
  }
  
  /**
   * Subir evidencia a un ticket
   * @param ticketId ID del ticket
   * @param evidencia Datos de la evidencia
   * @returns Promise con respuesta de la API
   */
  static async subirEvidencia(
    ticketId: number,
    evidencia: SubirEvidenciaRequestDTO
  ): Promise<ApiResponse<EvidenciaResponseDTO>> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${this.baseURL}/tickets/subir-evidencia`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ticketId,
          ...evidencia,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<EvidenciaResponseDTO> = await response.json();
      
      console.log('✅ [TECNICO SERVICE] Evidencia subida exitosamente:', data);
      return data;
      
    } catch (error) {
      console.error('❌ [TECNICO SERVICE] Error subiendo evidencia:', error);
      throw error;
    }
  }
}

// Exportar como instancia única
export default TecnicoService;
```

### **📱 APLICACIÓN MÓVIL - React Native - SINTAXIS DETALLADA**

#### **🎨 Componentes Nativos - Sintaxis Completa**

##### **NotificationToast - Componente Nativo**
```typescript
// NotificationToast.tsx - Explicación detallada
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { Bell, X } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';

// 1. Definir interface para props del componente
interface NotificationToastProps {
  visible: boolean;
  message: string;
  onPress: () => void;
  onClose: () => void;
  autoHideDuration?: number;
}

// 2. Obtener dimensiones de la pantalla
const { height } = Dimensions.get('window');

// 3. Componente funcional
const NotificationToast: React.FC<NotificationToastProps> = ({
  visible,
  message,
  onPress,
  onClose,
  autoHideDuration = 5000,
}) => {
  // 4. Hooks personalizados
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  // 5. Referencias para animaciones
  const translateY = useRef(new Animated.Value(-100)).current; // Empieza arriba de la pantalla
  const opacity = useRef(new Animated.Value(0)).current; // Empieza transparente
  
  // 6. useEffect para manejar animaciones
  useEffect(() => {
    if (visible) {
      // Animación de entrada
      Animated.parallel([
        // Mover desde arriba hacia abajo
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true, // Usar driver nativo para mejor performance
        }),
        // Fade in
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Timer para auto-ocultar
      const timer = setTimeout(() => {
        hideToast();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    } else {
      // Si no es visible, ocultar inmediatamente
      hideToast();
    }
  }, [visible, autoHideDuration]);

  // 7. Función para ocultar toast con animación
  const hideToast = () => {
    Animated.parallel([
      // Mover hacia arriba
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onClose()); // Llamar onClose después de la animación
  };

  // 8. Estilos dinámicos basados en el tema
  const styles = StyleSheet.create({
    toastContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      paddingTop: 40, // Espacio para la barra de estado
      paddingHorizontal: 10,
    },
    toastContent: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: 8,
      padding: 12,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5, // Sombra en Android
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    iconContainer: {
      marginRight: 10,
    },
    messageContainer: {
      flex: 1,
    },
    messageText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    tapToViewText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    closeButton: {
      marginLeft: 10,
      padding: 5,
    },
  });

  // 9. No renderizar si no es visible y está fuera de pantalla
  if (!visible && translateY.__getValue() === -100) {
    return null;
  }

  // 10. Renderizado del componente
  return (
    <Animated.View 
      style={[
        styles.toastContainer, 
        { 
          transform: [{ translateY }], 
          opacity 
        }
      ]}
    >
      <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.8} 
        style={styles.toastContent}
      >
        {/* Icono de notificación */}
        <View style={styles.iconContainer}>
          <Bell size={20} color={theme.colors.primary} />
        </View>
        
        {/* Contenido del mensaje */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageText} numberOfLines={1}>
            {message}
          </Text>
          <Text style={styles.tapToViewText}>
            {t('notifications.tap_to_view')}
          </Text>
        </View>
        
        {/* Botón de cerrar */}
        <TouchableOpacity 
          onPress={(e) => { 
            e.stopPropagation(); // Evitar que se ejecute onPress del contenedor
            hideToast(); 
          }} 
          style={styles.closeButton}
        >
          <X size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default NotificationToast;
```

#### **🔌 Servicios de WebSocket - Sintaxis Completa**

##### **WebSocketService - Servicio de Comunicación**
```typescript
// WebSocketService.ts - Explicación detallada
import SockJS from 'sockjs-client';
import { Client } from 'stompjs';

// 1. Definir interfaces para tipado
interface NotificationMessage {
  tipo: string;
  destinatarios: string[];
  fechaCreacion: string;
  id: number;
  mensaje: string;
  leida: boolean;
  usuarioActorNombre: string;
  ticketId?: number;
  prioridad: string;
}

interface WebSocketService {
  connect(token: string, userEmail: string): Promise<void>;
  disconnect(): void;
  subscribeToNotifications(): void;
  unsubscribeFromNotifications(): void;
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback: (data: any) => void): void;
  emit(event: string, data: any): void;
}

// 2. Clase del servicio WebSocket
class WebSocketServiceImpl implements WebSocketService {
  private stompClient: Client | null = null;
  private isConnected: boolean = false;
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map();
  private baseURL: string = 'http://localhost:8080';
  
  /**
   * Conectar al WebSocket
   * @param token Token de autenticación
   * @param userEmail Email del usuario
   */
  async connect(token: string, userEmail: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 1. Crear conexión SockJS
        const socket = new SockJS(`${this.baseURL}/ws`);
        
        // 2. Crear cliente STOMP sobre SockJS
        this.stompClient = Client.over(socket);
        
        // 3. Configurar headers de autenticación
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        
        console.log('🔌 [WEBSOCKET] Conectando...');
        
        // 4. Intentar conectar
        this.stompClient.connect(
          headers,
          // Callback de éxito
          (frame) => {
            console.log('✅ [WEBSOCKET] Conectado exitosamente:', frame);
            this.isConnected = true;
            resolve();
          },
          // Callback de error
          (error) => {
            console.error('❌ [WEBSOCKET] Error conectando:', error);
            this.isConnected = false;
            reject(error);
          }
        );
        
      } catch (error) {
        console.error('❌ [WEBSOCKET] Error creando conexión:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Desconectar del WebSocket
   */
  disconnect(): void {
    if (this.stompClient && this.isConnected) {
      console.log('🔌 [WEBSOCKET] Desconectando...');
      this.stompClient.disconnect(() => {
        console.log('✅ [WEBSOCKET] Desconectado exitosamente');
        this.isConnected = false;
        this.stompClient = null;
      });
    }
  }
  
  /**
   * Suscribirse a notificaciones
   */
  subscribeToNotifications(): void {
    if (this.stompClient && this.isConnected) {
      console.log('📡 [WEBSOCKET] Suscribiéndose a notificaciones...');
      
      this.stompClient.subscribe('/topic/notifications', (message) => {
        try {
          // 1. Parsear mensaje JSON
          const notification: NotificationMessage = JSON.parse(message.body);
          
          console.log('🔔 [WEBSOCKET] Notificación recibida:', notification);
          
          // 2. Emitir evento personalizado
          this.emit('notification', notification);
          
        } catch (error) {
          console.error('❌ [WEBSOCKET] Error parseando notificación:', error);
        }
      });
      
      console.log('✅ [WEBSOCKET] Suscrito a notificaciones');
    }
  }
  
  /**
   * Desuscribirse de notificaciones
   */
  unsubscribeFromNotifications(): void {
    if (this.stompClient && this.isConnected) {
      console.log('📡 [WEBSOCKET] Desuscribiéndose de notificaciones...');
      // STOMP no tiene método específico para unsubscribe, se maneja automáticamente
    }
  }
  
  /**
   * Agregar listener para eventos
   * @param event Nombre del evento
   * @param callback Función callback
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }
  
  /**
   * Remover listener de eventos
   * @param event Nombre del evento
   * @param callback Función callback a remover
   */
  off(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  /**
   * Emitir evento a todos los listeners
   * @param event Nombre del evento
   * @param data Datos a enviar
   */
  emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ [WEBSOCKET] Error en callback del evento ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Verificar si está conectado
   */
  get connected(): boolean {
    return this.isConnected;
  }
}

// 3. Exportar instancia única (Singleton)
const webSocketService = new WebSocketServiceImpl();
export default webSocketService;
export { NotificationMessage };
```

### **🔄 FLUJO DE DATOS COMPLETO - Explicación Detallada**

#### **1. Creación de Ticket - Flujo Completo**

```
1. Cliente (Frontend Web)
   ↓
2. CreateTicket.tsx → handleSubmit()
   ↓
3. api.ts → POST /api/tickets/crear
   ↓
4. Backend → TicketController.crearTicket()
   ↓
5. TicketServiceImpl.crearTicket()
   ↓
6. TicketRepository.save()
   ↓
7. Base de Datos → INSERT INTO tickets
   ↓
8. NotificationRoleService.notificarCreacionTicket()
   ↓
9. WebSocketController.sendNotification()
   ↓
10. WebSocket → /topic/notifications
    ↓
11. Frontend → GlobalWebSocket → window.dispatchEvent('newNotification')
    ↓
12. AdminLayout → handleNewNotification → setShowToast(true)
    ↓
13. NotificationToast → Aparece toast en tiempo real
```

#### **2. Asignación de Ticket - Flujo Completo**

```
1. Admin (Frontend Web) → Asignar ticket
   ↓
2. AsignacionController.asignarTicket()
   ↓
3. AsignacionService.asignarTicket()
   ↓
4. TicketRepository.save() → Actualizar assigned_technician_id
   ↓
5. AsignacionTicketRepository.save() → Nueva asignación
   ↓
6. NotificationRoleService.notificarAsignacionTicket()
   ↓
7. WebSocket → Enviar a técnico asignado + cliente
   ↓
8. Móvil (Técnico) → WebSocketService → Toast aparece
   ↓
9. Frontend (Cliente) → GlobalWebSocket → Toast aparece
```

#### **3. Cambio de Estado - Flujo Completo**

```
1. Técnico (Móvil) → TecnicoDashboard → Cambiar estado
   ↓
2. TecnicoService.cambiarEstadoTicket()
   ↓
3. Validar permisos → AsignacionTicketRepository.findByTicketIdAndActivaTrue()
   ↓
4. Validar transición → esTransicionValida(estadoAnterior, estadoNuevo)
   ↓
5. TicketRepository.save() → Actualizar estado
   ↓
6. HistorialEstadoTicketRepository.save() → Nuevo historial
   ↓
7. NotificationRoleService.notificarCambioEstado()
   ↓
8. WebSocket → Enviar a cliente + admin
   ↓
9. Frontend (Cliente) → Toast aparece
   ↓
10. Frontend (Admin) → Toast aparece
```

### **🎯 CONCEPTOS CLAVE EXPLICADOS**

#### **Inyección de Dependencias en Spring**
```java
// Sin Spring (Malo)
public class TecnicoService {
    private TicketRepository ticketRepository = new TicketRepositoryImpl();
    private UsuarioRepository usuarioRepository = new UsuarioRepositoryImpl();
}

// Con Spring (Bueno)
@Service
@RequiredArgsConstructor // Lombok genera constructor automáticamente
public class TecnicoService {
    private final TicketRepository ticketRepository;
    private final UsuarioRepository usuarioRepository;
    // Spring inyecta automáticamente las dependencias
}
```

#### **Transacciones en Spring**
```java
@Transactional
public void cambiarEstadoTicket() {
    // Si cualquier operación falla, se hace rollback automático
    ticketRepository.save(ticket);
    historialRepository.save(historial);
    notificacionService.enviarNotificacion();
}
```

#### **Optional en Java**
```java
// Antes (puede causar NullPointerException)
Usuario usuario = usuarioRepository.findByEmail(email);
String nombre = usuario.getNombre(); // ¡Peligroso!

// Ahora (seguro)
Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
if (usuarioOpt.isPresent()) {
    Usuario usuario = usuarioOpt.get();
    String nombre = usuario.getNombre();
} else {
    throw new RuntimeException("Usuario no encontrado");
}

// O más elegante
Usuario usuario = usuarioRepository.findByEmail(email)
    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
```

#### **Stream API en Java**
```java
// Antes (verbose)
List<String> nombres = new ArrayList<>();
for (Ticket ticket : tickets) {
    if (ticket.getStatus().equals("ACTIVO")) {
        nombres.add(ticket.getSubject());
    }
}

// Ahora (elegante)
List<String> nombres = tickets.stream()
    .filter(ticket -> ticket.getStatus().equals("ACTIVO"))
    .map(Ticket::getSubject)
    .collect(Collectors.toList());
```

#### **Hooks en React**
```typescript
// useState - Estado local
const [tickets, setTickets] = useState<Ticket[]>([]);

// useEffect - Efectos secundarios
useEffect(() => {
  loadTickets(); // Ejecutar al montar componente
}, []); // Array vacío = solo al montar

// useCallback - Memoizar funciones
const handleClick = useCallback((id: number) => {
  // Función memoizada, no se recrea en cada render
}, [dependency]);

// useRef - Referencias persistentes
const timeoutRef = useRef<NodeJS.Timeout>();
```

#### **Async/Await vs Promises**
```typescript
// Promises (verbose)
function loadData() {
  return fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(error => {
      console.error(error);
    });
}

// Async/Await (elegante)
async function loadData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}
```

---

**© 2025 NEITickets - Sistema de Gestión de Tickets para la Alcaldía de Neiva**

*Esta documentación incluye explicaciones completas de sintaxis, funcionamiento y flujos de datos del sistema NEITickets, desde conceptos básicos hasta implementaciones avanzadas.*
