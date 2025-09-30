import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: number;
  ticketId: number;
  mensaje: string;
  autor: string;
  autorEmail: string;
  tipoAutor: string;
  fechaCreacion: string;
}

export interface ComentarioRequest {
  ticketId: number;
  mensaje: string;
  usuarioId?: number;
}

class ChatService {
  private baseUrl = 'http://localhost:8080/api';

  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    console.log('🔑 Token obtenido:', token ? 'Sí' : 'No');
    console.log('🔑 Token completo:', token);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Obtener comentarios de un ticket
   */
  async getComentarios(ticketId: number): Promise<ChatMessage[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/tickets/${ticketId}/comentarios`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error obteniendo comentarios:', error);
      throw error;
    }
  }

  /**
   * Enviar comentario a un ticket
   */
  async enviarComentario(ticketId: number, mensaje: string): Promise<ChatMessage> {
    try {
      const headers = await this.getAuthHeaders();
      
      // Obtener información del usuario actual
      const userInfo = await AsyncStorage.getItem('userInfo');
      const userData = userInfo ? JSON.parse(userInfo) : null;
      
      const payload: ComentarioRequest = {
        ticketId,
        mensaje,
        usuarioId: userData?.id || 1
      };

      const response = await fetch(`${this.baseUrl}/tickets/${ticketId}/comentarios`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error enviando comentario:', error);
      throw error;
    }
  }

  /**
   * Obtener información detallada de un ticket para técnicos
   */
  async getTicketInfo(ticketId: number): Promise<any> {
    try {
      console.log('🚀 Iniciando getTicketInfo para ticket:', ticketId);
      const headers = await this.getAuthHeaders();
      console.log('📡 Headers enviados:', headers);
      
      const url = `${this.baseUrl}/tecnico/tickets/${ticketId}`;
      console.log('🌐 URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Data recibida:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo información del ticket:', error);
      throw error;
    }
  }
}

export default new ChatService();
