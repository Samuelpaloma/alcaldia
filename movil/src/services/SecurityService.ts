import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8080/api/auth';

export interface TwoFAStatus {
  enabled: boolean;
  email: string;
}

export interface TwoFAToggleRequest {
  enabled: boolean;
}

class SecurityService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Obtener el estado actual de 2FA
   */
  async get2FAStatus(): Promise<TwoFAStatus> {
    try {
      console.log('🔒 [SECURITY] Obteniendo estado de 2FA...');
      
      const response = await fetch(`${API_BASE_URL}/2fa/status`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      const data = await response.json();
      console.log('🔒 [SECURITY] Respuesta 2FA status:', data);

      if (response.ok && data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error obteniendo estado de 2FA');
      }
    } catch (error) {
      console.error('🔒 [SECURITY] Error obteniendo estado de 2FA:', error);
      throw error;
    }
  }

  /**
   * Activar/Desactivar 2FA
   */
  async toggle2FA(enabled: boolean): Promise<{ enabled: boolean; message: string }> {
    try {
      console.log('🔒 [SECURITY] Cambiando estado de 2FA a:', enabled);
      
      const response = await fetch(`${API_BASE_URL}/2fa/toggle`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ enabled }),
      });

      const data = await response.json();
      console.log('🔒 [SECURITY] Respuesta toggle 2FA:', data);

      if (response.ok && data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error actualizando configuración de 2FA');
      }
    } catch (error) {
      console.error('🔒 [SECURITY] Error actualizando 2FA:', error);
      throw error;
    }
  }
}

export default new SecurityService();
