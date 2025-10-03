import { Platform } from 'react-native';

// Configuración de la API
// Detectar si estamos en emulador Android o dispositivo físico
const isAndroidEmulator = __DEV__ && Platform.OS === 'android';
const BASE_URL = isAndroidEmulator 
  ? 'http://10.0.2.2:8080'  // Para emulador Android
  : 'http://r:8080'; // Para dispositivo físico

console.log('🔍 [API CONFIG] Platform:', Platform.OS);
console.log('🔍 [API CONFIG] Is Android Emulator:', isAndroidEmulator);
console.log('🔍 [API CONFIG] Base URL:', BASE_URL);

export const API_CONFIG = {
  BASE_URL: BASE_URL,
  ENDPOINTS: {
    AUTH: {
      VALIDATE_CREDENTIALS: '/api/auth/validate-credentials',
      REQUEST_LOGIN_CODE: '/api/auth/request-login-code',
      VERIFY_LOGIN_CODE: '/api/auth/verify-login-code',
      LOGOUT: '/api/auth/logout',
      VERIFY: '/api/auth/verify'
    }
  },
  TIMEOUT: 10000, // 10 segundos
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Tipos para las respuestas de la API
export interface ApiResponse {
  message: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  nombre: string;
  apellido: string;
  email: string;
  tipoUsuario: string;
  require2fa: boolean;
  requiereCambioPassword: boolean;
  redirectUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

