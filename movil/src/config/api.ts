// Configuración de la API
export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://192.168.56.1:8080' : 'http://localhost:8080',
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

