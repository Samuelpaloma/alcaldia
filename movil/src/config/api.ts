import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de la API
// Detectar si estamos en emulador Android o dispositivo físico
const isAndroidEmulator = __DEV__ && Platform.OS === 'android';
const isWeb = Platform.OS === 'web';

// Configuración simple y confiable
let BASE_URL;
if (isWeb) {
  BASE_URL = 'http://localhost:8080';
} else if (isAndroidEmulator) {
  BASE_URL = 'http://10.0.2.2:8080';
} else {
  // Para dispositivos físicos (tanto Android como iOS)
  BASE_URL = 'http://10.3.234.28:8080';
}

// Debug temporal para identificar el problema
console.log('🔍 [DEBUG] Platform.OS:', Platform.OS);
console.log('🔍 [DEBUG] isAndroidEmulator:', isAndroidEmulator);
console.log('🔍 [DEBUG] isWeb:', isWeb);
console.log('🔍 [DEBUG] BASE_URL:', BASE_URL);

export const API_CONFIG = {
  BASE_URL: BASE_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      VALIDATE_CREDENTIALS: '/api/auth/validate-credentials',
      REQUEST_LOGIN_CODE: '/api/auth/request-login-code',
      VERIFY_LOGIN_CODE: '/api/auth/verify-login-code',
      LOGOUT: '/api/auth/logout',
      VERIFY: '/api/auth/verify',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      CHANGE_PASSWORD: '/api/auth/change-password',
      SEND_EMAIL_VERIFICATION: '/api/auth/send-email-verification',
      VERIFY_EMAIL: '/api/auth/verify-email',
      RESEND_VERIFICATION: '/api/auth/resend-verification',
      SEND_VERIFICATION_CODE: '/api/auth/send-verification-code',
      VERIFY_CODE: '/api/auth/verify-code',
      VERIFY_2FA: '/api/auth/verify-2fa',
      RESEND_2FA_CODE: '/api/auth/resend-2fa-code'
    },
    TECNICO: {
      DASHBOARD: '/api/tecnico/dashboard',
      TICKETS: '/api/tecnico/tickets',
      TICKETS_HISTORIAL: '/api/tecnico/historial',
      TICKET_DETAIL: '/api/tecnico/tickets',
      ACCEPT_TICKET: '/api/tecnico/tickets',
      FINALIZE_TICKET: '/api/tecnico/tickets',
      CHANGE_TICKET_STATE: '/api/tecnico/tickets/cambiar-estado',
      TICKET_HISTORY: '/api/tecnico/tickets'
    },
    TICKETS: {
      COMMENTS: '/api/tickets',
      SEND_COMMENT: '/api/tickets'
    },
    EVIDENCIAS: {
      GET_EVIDENCES: '/api/evidencias/movil/ticket',
      DOWNLOAD_EVIDENCE: '/api/evidencias/descargar',
      GET_CHAT_FILES: '/api/archivos-ticket/ticket',
      PREVIEW_FILE: '/api/archivos-ticket/preview',
      DOWNLOAD_FILE: '/api/archivos-ticket/descargar'
    },
    USUARIO: {
      THEME_PREFERENCES: '/api/usuario/preferencias-tema'
    },
    WEBSOCKET: {
      BASE_URL: 'ws://10.0.2.2:8080/ws', // Para emulador Android
      PHYSICAL_DEVICE_URL: 'ws://10.3.234.28:8080/ws' // Para dispositivo físico
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
  requireEmailVerification?: boolean;
  telefono?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFARequest {
  userId: number;
  userEmail: string;
  userName: string;
  code: string;
}

export interface ResendCodeRequest {
  userId: number;
  userEmail: string;
}

export interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  consulta?: string; // Para compatibilidad con el código existente
  categoria?: string;
  ubicacion?: string;
  creadorNombre?: string;
  creadorEmail?: string;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
  };
  tecnico?: {
    nombre: string;
    apellido: string;
  };
  // Campos del backend para información del técnico
  tecnicoId?: number;
  tecnicoNombre?: string;
  tecnicoEmail?: string;
  puedeCambiarEstado?: boolean;
  esTecnicoEscalado?: boolean;
  rolTecnico?: string; // "ASIGNADO", "ESCALADO", "ORIGINAL"
}

export interface Comment {
  id: number;
  contenido: string;
  fechaCreacion: string;
  usuario?: {
    nombre: string;
    apellido: string;
    email?: string;
    tipoUsuario?: string;
  };
  // Campos adicionales que el backend puede devolver
  autor?: string;
  mensaje?: string;
  tipoAutor?: string;
  esTecnico?: boolean;
  autorEmail?: string;
}

export interface Evidence {
  id: number;
  nombreArchivo: string;
  nombreCompletoArchivo: string;
  tipoArchivo: string;
  fechaSubida: string;
  idArchivo?: number;
  idEvidencia?: number;
}

export interface DashboardData {
  ticketsPendientes: number;
  ticketsEnProceso: number;
  ticketsCompletados: number;
  ticketsTotal: number;
}

// Función auxiliar para hacer peticiones HTTP
const makeRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
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
};

// Función auxiliar para obtener headers de autenticación
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('authToken');
  
  return {
    ...API_CONFIG.HEADERS,
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Función auxiliar para obtener URL del WebSocket
export const getWebSocketUrl = (): string => {
  const isAndroidEmulator = __DEV__ && Platform.OS === 'android';
  return isAndroidEmulator 
    ? API_CONFIG.ENDPOINTS.WEBSOCKET.BASE_URL
    : API_CONFIG.ENDPOINTS.WEBSOCKET.PHYSICAL_DEVICE_URL;
};

// ===== FUNCIONES DE AUTENTICACIÓN =====

export const authAPI = {
  // Login directo
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error en el login');
    }

    return data;
  },

  // Validar credenciales
  async validateCredentials(email: string, password: string): Promise<ApiResponse> {
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.VALIDATE_CREDENTIALS}`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error validando credenciales');
    }

    return data;
  },

  // Solicitar código de login
  async requestLoginCode(email: string, password: string): Promise<ApiResponse> {
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REQUEST_LOGIN_CODE}`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error solicitando código de verificación');
    }

    return data;
  },

  // Verificar código de login
  async verifyLoginCode(email: string, code: string): Promise<LoginResponse> {
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY_LOGIN_CODE}`, {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error verificando código');
    }

    return data;
  },

  // Verificar token
  async verifyToken(): Promise<boolean> {
    const headers = await getAuthHeaders();
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY}`, {
      method: 'GET',
      headers
    });

    return response.ok;
  },

  // Cerrar sesión
  async logout(): Promise<void> {
    const headers = await getAuthHeaders();
    
    try {
      await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`, {
        method: 'POST',
        headers
      });
    } catch (error) {
      // Error notificando logout al servidor (log removido)
    }
  },

  // Olvidar contraseña
  async forgotPassword(request: ForgotPasswordRequest): Promise<ApiResponse> {
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD}`, {
      method: 'POST',
      body: JSON.stringify(request)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error enviando correo de recuperación');
    }

    return data;
  },

  // Resetear contraseña
  async resetPassword(request: ResetPasswordRequest): Promise<LoginResponse> {
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD}`, {
      method: 'POST',
      body: JSON.stringify(request)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error actualizando contraseña');
    }

    return data;
  },

  // Cambiar contraseña
  async changePassword(request: ChangePasswordRequest): Promise<ApiResponse> {
    const headers = await getAuthHeaders();
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error cambiando contraseña');
    }

    return data;
  },

  // Enviar verificación de email
  async sendEmailVerification(email: string): Promise<ApiResponse> {
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.SEND_EMAIL_VERIFICATION}`, {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error enviando verificación de email');
    }

    return data;
  },

  // Verificar email
  async verifyEmail(request: VerifyEmailRequest): Promise<ApiResponse> {
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL}`, {
      method: 'POST',
      body: JSON.stringify(request)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error verificando email');
    }

    return data;
  },

  // Reenviar verificación
  async resendVerification(email: string): Promise<ApiResponse> {
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION}`, {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error reenviando verificación');
    }

    return data;
  },

  // Enviar código de verificación
  async sendVerificationCode(request: ResendCodeRequest): Promise<ApiResponse> {
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.SEND_VERIFICATION_CODE}`, {
      method: 'POST',
      body: JSON.stringify(request)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error enviando código de verificación');
    }

    return data;
  },

  // Verificar código
  async verifyCode(request: TwoFARequest): Promise<ApiResponse> {
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY_CODE}`, {
      method: 'POST',
      body: JSON.stringify(request)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error verificando código');
    }

    return data;
  },

  // Verificar 2FA
  async verify2FA(request: TwoFARequest): Promise<ApiResponse> {
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY_2FA}`, {
      method: 'POST',
      body: JSON.stringify(request)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error verificando 2FA');
    }

    return data;
  },

  // Reenviar código 2FA
  async resend2FACode(request: ResendCodeRequest): Promise<ApiResponse> {
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.RESEND_2FA_CODE}`, {
      method: 'POST',
      body: JSON.stringify(request)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error reenviando código 2FA');
    }

    return data;
  }
};

// ===== FUNCIONES DE TÉCNICO =====

export const tecnicoAPI = {
  // Obtener dashboard
  async getDashboard(): Promise<{message: string, success: boolean, data: DashboardData}> {
    const headers = await getAuthHeaders();
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TECNICO.DASHBOARD}`, {
      method: 'GET',
      headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error obteniendo dashboard');
    }

    return data;
  },

  // Obtener tickets (asignados activos)
  async getTickets(): Promise<{message: string, success: boolean, data: Ticket[]}> {
    const headers = await getAuthHeaders();
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TECNICO.TICKETS}`, {
      method: 'GET',
      headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error obteniendo tickets');
    }

    return data;
  },

  // Obtener historial completo de tickets (activos + inactivos)
  async getTicketsHistorial(): Promise<Ticket[]> {
    const headers = await getAuthHeaders();
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TECNICO.TICKETS_HISTORIAL}`, {
      method: 'GET',
      headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error obteniendo historial de tickets');
    }

    return data;
  },

  // Obtener detalle de ticket
  async getTicketDetail(ticketId: number): Promise<Ticket> {
    const headers = await getAuthHeaders();
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TECNICO.TICKET_DETAIL}/${ticketId}`, {
      method: 'GET',
      headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error obteniendo detalle del ticket');
    }

    return data;
  },

  // Aceptar ticket
  async acceptTicket(ticketId: number): Promise<ApiResponse> {
    const headers = await getAuthHeaders();
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TECNICO.ACCEPT_TICKET}/${ticketId}/aceptar`, {
      method: 'PUT',
      headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error aceptando ticket');
    }

    return data;
  },

  // Finalizar ticket
  async finalizeTicket(ticketId: number, descripcion: string, archivos: any[]): Promise<ApiResponse> {
    const headers = await getAuthHeaders();
    
    // Para web, enviar como JSON en lugar de FormData
    const requestBody = {
      descripcion,
      archivos: archivos || []
    };

    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TECNICO.FINALIZE_TICKET}/${ticketId}/finalizar`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error finalizando ticket');
    }

    return data;
  },

  // Cambiar estado de ticket
  async changeTicketState(ticketId: number, nuevoEstado: string, comentario?: string): Promise<ApiResponse> {
    const headers = await getAuthHeaders();
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TECNICO.CHANGE_TICKET_STATE}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        ticketId,
        nuevoEstado,
        comentario
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error cambiando estado del ticket');
    }

    return data;
  },

  // Obtener historial de ticket
  async getTicketHistory(ticketId: number): Promise<any[]> {
    const headers = await getAuthHeaders();
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TECNICO.TICKET_HISTORY}/${ticketId}/historial`, {
      method: 'GET',
      headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error obteniendo historial del ticket');
    }

    return data;
  }
};

// ===== FUNCIONES DE TICKETS =====

export const ticketsAPI = {
  // Obtener comentarios de ticket
  async getComments(ticketId: number): Promise<Comment[]> {
    const headers = await getAuthHeaders();
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TICKETS.COMMENTS}/${ticketId}/comentarios`, {
      method: 'GET',
      headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error obteniendo comentarios');
    }

    return data;
  },

  // Enviar comentario
  async sendComment(ticketId: number, contenido: string, archivos?: any[]): Promise<ApiResponse> {
    const headers = await getAuthHeaders();
    
    // Validar que el contenido no esté vacío
    if (!contenido || contenido.trim().length === 0) {
      throw new Error('El mensaje no puede estar vacío');
    }
    
    // Para web, enviar como JSON en lugar de FormData
    // Probar con diferentes nombres de campo que el backend podría esperar
    const requestBody = {
      mensaje: contenido.trim(),  // Intentar con 'mensaje' en lugar de 'contenido'
      contenido: contenido.trim(), // Mantener 'contenido' como fallback
      archivos: archivos || []
    };

    // Logs removidos para evitar problemas en Android

    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TICKETS.SEND_COMMENT}/${ticketId}/comentarios`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    // Logs removidos para evitar problemas en Android
    
    if (!response.ok) {
      throw new Error(data.message || 'Error enviando comentario');
    }

    return data;
  }
};

// ===== FUNCIONES DE EVIDENCIAS =====

export const evidenciasAPI = {
  // Obtener evidencias de ticket
  async getEvidences(ticketId: number): Promise<Evidence[]> {
    const headers = await getAuthHeaders();
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVIDENCIAS.GET_EVIDENCES}/${ticketId}`, {
      method: 'GET',
      headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error obteniendo evidencias');
    }

    // El endpoint devuelve {data: [...]}, extraer el array
    return data.data || data;
  },

  // Descargar evidencia
  async downloadEvidence(ticketId: number, nombreArchivo: string): Promise<Blob> {
    const headers = await getAuthHeaders();
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVIDENCIAS.DOWNLOAD_EVIDENCE}/${ticketId}/${encodeURIComponent(nombreArchivo)}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error('Error descargando evidencia');
    }

    return response.blob();
  },

  // Obtener archivos del chat
  async getChatFiles(ticketId: number): Promise<Evidence[]> {
    const headers = await getAuthHeaders();
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVIDENCIAS.GET_CHAT_FILES}/${ticketId}`, {
      method: 'GET',
      headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error obteniendo archivos del chat');
    }

    return data;
  },

  // Obtener URL de preview de archivo
  getFilePreviewUrl(ticketId: number, evidence: Evidence): string {
    if (evidence.idArchivo) {
      return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVIDENCIAS.PREVIEW_FILE}/${ticketId}/${evidence.idArchivo}`;
    } else if (evidence.idEvidencia) {
      return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVIDENCIAS.PREVIEW_FILE}/${ticketId}/${evidence.nombreCompletoArchivo}/preview`;
    }
    return '';
  },

  // Obtener URL de descarga de archivo
  getFileDownloadUrl(ticketId: number, evidence: Evidence): string {
    if (evidence.idArchivo) {
      return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVIDENCIAS.DOWNLOAD_FILE}/${ticketId}/${evidence.idArchivo}`;
    } else if (evidence.idEvidencia) {
      return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVIDENCIAS.DOWNLOAD_FILE}/${ticketId}/${evidence.nombreCompletoArchivo}/descargar`;
    }
    return '';
  }
};

// ===== FUNCIONES DE USUARIO =====

export const usuarioAPI = {
  // Obtener preferencias de tema
  async getThemePreferences(): Promise<any> {
    const headers = await getAuthHeaders();
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USUARIO.THEME_PREFERENCES}`, {
      method: 'GET',
      headers
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error obteniendo preferencias de tema');
    }

    return data;
  },

  // Actualizar preferencias de tema
  async updateThemePreferences(preferences: any): Promise<ApiResponse> {
    const headers = await getAuthHeaders();
    const response = await makeRequest(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USUARIO.THEME_PREFERENCES}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(preferences)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error actualizando preferencias de tema');
    }

    return data;
  }
};

