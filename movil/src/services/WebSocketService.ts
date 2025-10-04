/**
 * Servicio de WebSocket para la aplicación móvil
 * Maneja la conexión y comunicación en tiempo real con el backend
 */

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface TicketUpdateMessage {
  type: 'TICKET_UPDATE';
  data: {
    ticketId: number;
    estado?: string;
    tecnicoAsignado?: string;
    comentario?: string;
    timestamp: string;
  };
}

export interface ChatMessage {
  type: 'CHAT_MESSAGE';
  data: {
    ticketId: number;
    autor: string;
    mensaje: string;
    fechaCreacion: string;
    esTecnico?: boolean;
  };
}

export interface NotificationMessage {
  type: 'NOTIFICATION';
  data: {
    id: number;
    titulo: string;
    mensaje: string;
    tipo: string;
    leida: boolean;
    fechaCreacion: string;
  };
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 segundos
  private isConnecting = false;
  private listeners: Map<string, ((message: any) => void)[]> = new Map();
  private token: string | null = null;
  private userEmail: string | null = null;

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.send = this.send.bind(this);
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
  }

  /**
   * Conectar al WebSocket
   */
  async connect(token: string, userEmail: string): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      console.log('🔌 [WebSocket] Ya conectado o conectando...');
      return;
    }

    this.token = token;
    this.userEmail = userEmail;
    this.isConnecting = true;

    try {
      console.log('🔌 [WebSocket] Conectando al servidor...');
      
      // URL del WebSocket usando las utilidades de red
      const { getNetworkConfig } = await import('../utils/networkUtils');
      const networkConfig = getNetworkConfig();
      const wsUrl = `${networkConfig.wsUrl}/ws?token=${encodeURIComponent(token)}&email=${encodeURIComponent(userEmail)}`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ [WebSocket] Conectado exitosamente');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected', {});
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 [WebSocket] Mensaje recibido:', message);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ [WebSocket] Error parseando mensaje:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 [WebSocket] Conexión cerrada:', event.code, event.reason);
        this.isConnecting = false;
        this.emit('disconnected', { code: event.code, reason: event.reason });
        
        // Intentar reconectar si no fue una desconexión intencional
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ [WebSocket] Error:', error);
        this.isConnecting = false;
        this.emit('error', error);
      };

    } catch (error) {
      console.error('❌ [WebSocket] Error conectando:', error);
      this.isConnecting = false;
      throw error;
    }
  }

  /**
   * Desconectar del WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      console.log('🔌 [WebSocket] Desconectando...');
      this.ws.close(1000, 'Desconexión intencional');
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Evitar reconexión automática
  }

  /**
   * Enviar mensaje por WebSocket
   */
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const messageStr = JSON.stringify(message);
        this.ws.send(messageStr);
        console.log('📤 [WebSocket] Mensaje enviado:', message);
      } catch (error) {
        console.error('❌ [WebSocket] Error enviando mensaje:', error);
      }
    } else {
      console.warn('⚠️ [WebSocket] No conectado, no se puede enviar mensaje');
    }
  }

  /**
   * Suscribirse a un tipo de mensaje
   */
  on(eventType: string, callback: (message: any) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  /**
   * Desuscribirse de un tipo de mensaje
   */
  off(eventType: string, callback: (message: any) => void): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Obtener estado de la conexión
   */
  getConnectionState(): string {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'CONNECTED';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }

  /**
   * Manejar mensajes recibidos
   */
  private handleMessage(message: WebSocketMessage): void {
    // Emitir el mensaje completo
    this.emit('message', message);
    
    // Emitir por tipo específico
    this.emit(message.type, message.data);
    
    // Manejar tipos específicos
    switch (message.type) {
      case 'TICKET_UPDATE':
        this.emit('ticketUpdate', message.data);
        break;
      case 'CHAT_MESSAGE':
        this.emit('chatMessage', message.data);
        break;
      case 'NOTIFICATION':
        this.emit('notification', message.data);
        break;
      default:
        console.log('📨 [WebSocket] Tipo de mensaje no manejado:', message.type);
    }
  }

  /**
   * Emitir evento a los listeners
   */
  private emit(eventType: string, data: any): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ [WebSocket] Error en callback:', error);
        }
      });
    }
  }

  /**
   * Programar reconexión
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1); // Backoff exponencial
    
    console.log(`🔄 [WebSocket] Reconectando en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.token && this.userEmail) {
        this.connect(this.token, this.userEmail).catch(error => {
          console.error('❌ [WebSocket] Error en reconexión:', error);
        });
      }
    }, delay);
  }

  /**
   * Suscribirse a actualizaciones de un ticket específico
   */
  subscribeToTicket(ticketId: number): void {
    this.send({
      type: 'SUBSCRIBE_TICKET',
      data: { ticketId }
    });
  }

  /**
   * Desuscribirse de actualizaciones de un ticket específico
   */
  unsubscribeFromTicket(ticketId: number): void {
    this.send({
      type: 'UNSUBSCRIBE_TICKET',
      data: { ticketId }
    });
  }

  /**
   * Suscribirse a notificaciones del usuario
   */
  subscribeToNotifications(): void {
    this.send({
      type: 'SUBSCRIBE_NOTIFICATIONS',
      data: { userEmail: this.userEmail }
    });
  }

  /**
   * Desuscribirse de notificaciones del usuario
   */
  unsubscribeFromNotifications(): void {
    this.send({
      type: 'UNSUBSCRIBE_NOTIFICATIONS',
      data: { userEmail: this.userEmail }
    });
  }
}

// Exportar instancia única
export const webSocketService = new WebSocketService();
export default webSocketService;

