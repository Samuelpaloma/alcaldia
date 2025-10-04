import { Platform } from 'react-native';

/**
 * Utilidades para manejo de red y conectividad
 */

export interface NetworkConfig {
  baseUrl: string;
  wsUrl: string;
  timeout: number;
  isEmulator: boolean;
}

/**
 * Obtiene la configuración de red apropiada según la plataforma
 */
export const getNetworkConfig = (): NetworkConfig => {
  const isAndroidEmulator = __DEV__ && Platform.OS === 'android';
  
  let baseUrl: string;
  let wsUrl: string;
  
  if (isAndroidEmulator) {
    // Para emulador Android
    baseUrl = 'http://10.0.2.2:8080';
    wsUrl = 'ws://10.0.2.2:8080';
  } else if (Platform.OS === 'ios' && __DEV__) {
    // Para simulador iOS
    baseUrl = 'http://localhost:8080';
    wsUrl = 'ws://localhost:8080';
  } else {
    // Para dispositivo físico
    baseUrl = 'http://10.3.234.28:8080';
    wsUrl = 'ws://10.3.234.28:8080';
  }

  return {
    baseUrl,
    wsUrl,
    timeout: 30000, // 30 segundos
    isEmulator: isAndroidEmulator
  };
};

/**
 * Verifica si un error es de tipo AbortError
 */
export const isAbortError = (error: any): boolean => {
  return error instanceof Error && error.name === 'AbortError';
};

/**
 * Verifica si un error es de tipo Network Error
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  return errorMessage.includes('Failed to fetch') || 
         errorMessage.includes('Network request failed') ||
         errorMessage.includes('Network Error') ||
         errorMessage.includes('fetch failed') ||
         errorMessage.includes('TypeError: Network request failed');
};

/**
 * Obtiene un mensaje de error amigable para el usuario
 */
export const getFriendlyErrorMessage = (error: any): string => {
  if (isAbortError(error)) {
    return 'Tiempo de espera agotado. Verifica tu conexión a internet y que el servidor esté funcionando.';
  }
  
  if (isNetworkError(error)) {
    return 'Error de conexión. Verifica que el servidor esté funcionando y tu conexión a internet.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Ha ocurrido un error inesperado. Intenta nuevamente.';
};

/**
 * Verifica la conectividad del servidor
 */
export const checkServerConnectivity = async (): Promise<boolean> => {
  try {
    const config = getNetworkConfig();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos para ping
    
    const response = await fetch(`${config.baseUrl}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('🔍 [NETWORK] Server connectivity check failed:', error);
    return false;
  }
};

/**
 * Log de información de red para debugging
 */
export const logNetworkInfo = (): void => {
  const config = getNetworkConfig();
  console.log('🔍 [NETWORK] Platform:', Platform.OS);
  console.log('🔍 [NETWORK] Is Emulator:', config.isEmulator);
  console.log('🔍 [NETWORK] Base URL:', config.baseUrl);
  console.log('🔍 [NETWORK] WebSocket URL:', config.wsUrl);
  console.log('🔍 [NETWORK] Timeout:', config.timeout);
};
