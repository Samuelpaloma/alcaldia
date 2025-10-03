import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

export interface Notificacion {
  id: number;
  tipo: string;
  mensaje: string;
  ticketId?: number;
  usuarioActorId?: number;
  usuarioActorEmail?: string;
  usuarioActorNombre?: string;
  prioridad: string;
  leida: boolean;
  fechaCreacion: string;
  fechaLectura?: string;
}

export interface PreferenciasNotificacion {
  id?: number;
  usuarioId: number;
  pushActivo: boolean;
  emailActivo: boolean;
  notificacionesTicketAsignado: boolean;
  notificacionesTicketEnProceso: boolean;
  notificacionesTicketResuelto: boolean;
  notificacionesComentarios: boolean;
  notificacionesEvidencias: boolean;
  notificacionesSla: boolean;
  notificacionesSistema: boolean;
}

class NotificacionService {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body: any = null, token?: string): Promise<any> {
    const authToken = token || await this.getAuthToken();
    
    console.log('🔔 [MAKE REQUEST] Endpoint:', endpoint);
    console.log('🔔 [MAKE REQUEST] Method:', method);
    console.log('🔔 [MAKE REQUEST] Auth token present:', !!authToken);
    console.log('🔔 [MAKE REQUEST] Full URL:', `${API_CONFIG.BASE_URL}${endpoint}`);
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    };

    const options: RequestInit = {
      method,
      headers: defaultHeaders
    };

    if (body && method !== 'GET') {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    console.log('🔔 [MAKE REQUEST] Sending request...');
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, options);
    console.log('🔔 [MAKE REQUEST] Response status:', response.status);
    console.log('🔔 [MAKE REQUEST] Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [MAKE REQUEST] Error response:', errorData);
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('🔔 [MAKE REQUEST] Response data:', data);
    return data;
  }

  // Obtener todas las notificaciones del usuario
  async getNotificaciones(): Promise<Notificacion[]> {
    try {
      const response = await this.makeRequest('/notificaciones/movil');
      return response.notificaciones || [];
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      throw error;
    }
  }

  // Obtener notificaciones no leídas
  async getNotificacionesNoLeidas(): Promise<{ notificaciones: Notificacion[]; count: number }> {
    try {
      const response = await this.makeRequest('/notificaciones/movil/no-leidas');
      return {
        notificaciones: response.notificaciones || [],
        count: response.count || 0
      };
    } catch (error) {
      console.error('Error obteniendo notificaciones no leídas:', error);
      throw error;
    }
  }

  // Marcar notificación como leída
  async marcarComoLeida(notificacionId: number): Promise<void> {
    try {
      await this.makeRequest(`/notificaciones/movil/${notificacionId}/leer`, 'PUT');
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      throw error;
    }
  }

  // Obtener preferencias de notificación
  async getPreferencias(): Promise<PreferenciasNotificacion> {
    try {
      const response = await this.makeRequest('/notificaciones/movil/preferencias');
      return response.preferencias;
    } catch (error) {
      console.error('Error obteniendo preferencias:', error);
      throw error;
    }
  }

  // Actualizar preferencias de notificación
  async actualizarPreferencias(preferencias: Partial<PreferenciasNotificacion>): Promise<PreferenciasNotificacion> {
    try {
      const response = await this.makeRequest('/notificaciones/movil/preferencias', 'PUT', preferencias);
      return response.preferencias;
    } catch (error) {
      console.error('Error actualizando preferencias:', error);
      throw error;
    }
  }

  // Obtener contador de notificaciones no leídas
  async getContadorNotificaciones(token: string, email: string): Promise<number> {
    console.log('🔔 [SERVICE] Obteniendo contador de notificaciones para:', email);
    try {
      const response = await this.makeRequest(`/notificaciones/movil/contador?email=${encodeURIComponent(email)}`, 'GET', null, token);
      console.log('🔔 [SERVICE] Contador de notificaciones recibido:', response);
      return response.count || 0;
    } catch (error) {
      console.error('❌ [SERVICE] Error obteniendo contador:', error);
      throw error;
    }
  }

  // Obtener icono según el tipo de notificación
  getIconoNotificacion(tipo: string): string {
    switch (tipo) {
      case 'ticket_creado':
        return '🎫';
      case 'ticket_asignado':
        return '📋';
      case 'ticket_en_proceso':
        return '⚙️';
      case 'ticket_resuelto':
        return '✅';
      case 'ticket_cerrado':
        return '🔒';
      case 'ticket_escalado':
        return '⚠️';
      case 'comentario_agregado':
        return '💬';
      case 'evidencia_agregada':
        return '📎';
      case 'sla_vencido':
        return '⏰';
      case 'alerta_sistema':
        return '🚨';
      default:
        return '🔔';
    }
  }

  // Obtener color según la prioridad
  getColorPrioridad(prioridad: string): string {
    switch (prioridad) {
      case 'critica':
        return '#DC2626'; // Rojo
      case 'alta':
        return '#F59E0B'; // Amarillo
      case 'normal':
      default:
        return '#6B7280'; // Gris
    }
  }

  // Formatear fecha para mostrar
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES');
    }
  }
}

export default new NotificacionService();
