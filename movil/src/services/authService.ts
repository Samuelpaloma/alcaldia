import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, LoginRequest, LoginResponse, ApiResponse, VerifyEmailRequest } from '../config/api';

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  /**
   * Método auxiliar para hacer peticiones HTTP con mejor manejo de errores
   */
  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...API_CONFIG.HEADERS,
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Validar credenciales sin obtener token
   */
  async validateCredentials(email: string, password: string): Promise<ApiResponse> {
    try {
      console.log('🔍 [AUTH] Validando credenciales...');
      console.log('🔍 [AUTH] URL:', `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.VALIDATE_CREDENTIALS}`);
      console.log('🔍 [AUTH] Email:', email);
      console.log('🔍 [AUTH] Base URL:', this.baseUrl);
      console.log('🔍 [AUTH] Full URL:', `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.VALIDATE_CREDENTIALS}`);
      
      const response = await this.makeRequest(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.VALIDATE_CREDENTIALS}`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      console.log('🔍 [AUTH] Response status:', response.status);
      console.log('🔍 [AUTH] Response ok:', response.ok);

      const data = await response.json();
      console.log('🔍 [AUTH] Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error validando credenciales');
      }

      return data;
    } catch (error) {
      console.error('❌ [AUTH] Error validando credenciales:', error);
      
      // Verificar si es error de conexión (múltiples variantes)
      const errorMessage = (error as Error).message || (error as any).toString();
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('Network request failed') ||
          errorMessage.includes('Network Error') ||
          errorMessage.includes('TypeError: Network request failed') ||
          errorMessage.includes('fetch failed') ||
          (error as Error).name === 'TypeError' ||
          (error as any).code === 'NETWORK_ERROR') {
        throw new Error('No se puede conectar al servidor. Verifica que el backend esté corriendo en el puerto 8080.');
      }
      
      throw error;
    }
  }

  /**
   * Solicitar código de verificación para login
   */
  async requestLoginCode(email: string, password: string): Promise<ApiResponse> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.REQUEST_LOGIN_CODE}`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error solicitando código de verificación');
      }

      return data;
    } catch (error) {
      console.error('Error solicitando código de verificación:', error);
      
      // Verificar si es error de conexión
      const errorMessage = (error as Error).message || (error as any).toString();
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('Network request failed') ||
          errorMessage.includes('Network Error') ||
          errorMessage.includes('TypeError: Network request failed') ||
          errorMessage.includes('fetch failed') ||
          (error as Error).name === 'TypeError' ||
          (error as any).code === 'NETWORK_ERROR') {
        throw new Error('No se puede conectar al servidor. Verifica que el backend esté corriendo en el puerto 8080.');
      }
      
      throw error;
    }
  }

  /**
   * Verificar código de login y obtener token
   */
  async verifyLoginCode(email: string, code: string): Promise<LoginResponse> {
    try {
      console.log('🔍 [AUTH] Verificando código...');
      console.log('🔍 [AUTH] Email:', email);
      console.log('🔍 [AUTH] Code:', code);
      
      const response = await this.makeRequest(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.VERIFY_LOGIN_CODE}`, {
        method: 'POST',
        body: JSON.stringify({ email, code })
      });

      console.log('🔍 [AUTH] Response status:', response.status);
      console.log('🔍 [AUTH] Response ok:', response.ok);

      const data = await response.json();
      console.log('🔍 [AUTH] Response data:', data);

      if (!response.ok) {
        const errorMessage = typeof data === 'string' ? data : (data.message || data.error || 'Error verificando código');
        throw new Error(errorMessage);
      }

      console.log('✅ [AUTH] Código verificado correctamente');
      return data;
    } catch (error) {
      console.error('❌ [AUTH] Error verificando código:', error);
      
      // Verificar si es error de conexión
      const errorMessage = (error as Error).message || (error as any).toString();
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('Network request failed') ||
          errorMessage.includes('Network Error') ||
          errorMessage.includes('TypeError: Network request failed') ||
          errorMessage.includes('fetch failed') ||
          (error as Error).name === 'TypeError' ||
          (error as any).code === 'NETWORK_ERROR') {
        throw new Error('No se puede conectar al servidor. Verifica que el backend esté corriendo en el puerto 8080.');
      }
      
      throw error;
    }
  }

  /**
   * Guardar datos de autenticación en AsyncStorage
   */
  async saveAuthData(loginResponse: LoginResponse): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', loginResponse.accessToken);
      await AsyncStorage.setItem('userInfo', JSON.stringify({
        userId: loginResponse.userId,
        nombre: loginResponse.nombre,
        apellido: loginResponse.apellido,
        email: loginResponse.email,
        tipoUsuario: loginResponse.tipoUsuario,
        require2fa: loginResponse.require2fa,
        requiereCambioPassword: loginResponse.requiereCambioPassword
      }));
    } catch (error) {
      console.error('Error guardando datos de autenticación:', error);
      throw error;
    }
  }

  /**
   * Obtener token almacenado
   */
  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * Obtener información del usuario almacenada
   */
  async getStoredUserInfo(): Promise<any | null> {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      return userInfoStr ? JSON.parse(userInfoStr) : null;
    } catch (error) {
      console.error('Error obteniendo información del usuario:', error);
      return null;
    }
  }

  /**
   * Verificar si el token sigue válido
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (!token) return false;

      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.VERIFY}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...API_CONFIG.HEADERS
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      const token = await this.getStoredToken();
      
      if (token) {
        // Intentar cerrar sesión en el servidor
        try {
          await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              ...API_CONFIG.HEADERS
            }
          });
        } catch (error) {
          console.log('Error notificando logout al servidor:', error);
        }
      }

      // Limpiar almacenamiento local
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userInfo');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      // Limpiar almacenamiento incluso si hay error
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userInfo');
      throw error;
    }
  }

  /**
   * Verificar estado de autenticación
   */
  async checkAuthStatus(): Promise<{ isAuthenticated: boolean; userInfo: any | null }> {
    try {
      const token = await this.getStoredToken();
      const userInfo = await this.getStoredUserInfo();

      if (!token) {
        return { isAuthenticated: false, userInfo: null };
      }

      const isValid = await this.verifyToken();
      if (!isValid) {
        await this.logout();
        return { isAuthenticated: false, userInfo: null };
      }

      return { isAuthenticated: true, userInfo };
    } catch (error) {
      console.error('Error verificando estado de autenticación:', error);
      return { isAuthenticated: false, userInfo: null };
    }
  }
}

export default new AuthService();
