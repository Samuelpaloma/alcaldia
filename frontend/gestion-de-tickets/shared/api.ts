/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Tipos para autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

// Tipos para tickets (basados en el backend)
export interface Ticket {
  id: number;
  ubicacion: string;
  consulta?: string;
  categoria: string;
  prioridad: 'low' | 'medium' | 'high';
  estado: 'open' | 'in_progress' | 'resolved' | 'closed';
  archivoAdjunto?: string;
  nombreArchivo?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creador?: {
    id: number;
    nombre: string;
    email: string;
  };
  tecnicoAsignado?: {
    id: number;
    nombre: string;
    email: string;
  };
}

export interface TicketRequestDTO {
  ubicacion: string;
  consulta?: string;
  categoria: string;
  prioridad: 'low' | 'medium' | 'high';
  archivoAdjunto?: string;
  nombreArchivo?: string;
}

export interface TicketResponseDTO {
  id: number;
  ubicacion: string;
  consulta?: string;
  categoria: string;
  prioridad: 'low' | 'medium' | 'high';
  estado: 'open' | 'in_progress' | 'resolved' | 'closed';
  archivoAdjunto?: string;
  nombreArchivo?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creador?: {
    id: number;
    nombre: string;
    email: string;
  };
  tecnicoAsignado?: {
    id: number;
    nombre: string;
    email: string;
  };
}

export interface HistorialTicketResponseDTO {
  id: number;
  ubicacion: string;
  consulta?: string;
  categoria: string;
  prioridad: 'low' | 'medium' | 'high';
  estado: 'open' | 'in_progress' | 'resolved' | 'closed';
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface SeguimientoTicketRequestDTO {
  ticketId: string;
  emailUsuario: string;
}

// Tipos para la API de tickets
export interface CreateTicketRequest {
  ubicacion: string;
  consulta?: string;
  categoria: string;
  prioridad: 'low' | 'medium' | 'high';
  archivoAdjunto?: string;
  nombreArchivo?: string;
}

export interface CreateTicketResponse {
  success: boolean;
  ticketId: number;
  message: string;
}

// Tipos para usuarios
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client';
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: 'admin' | 'client';
  password: string;
}

export interface UpdateUserRequest {
  id: string;
  email?: string;
  name?: string;
  role?: 'admin' | 'client';
  isActive?: boolean;
}

// API Client
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = 'http://localhost:8080/api';
    // Cargar token desde localStorage si existe
    this.loadToken();
  }

  private loadToken() {
    try {
      // Buscar token en las claves de autenticación
      const token = localStorage.getItem('jwt_token');
      if (token) {
        this.token = token;
        console.log(`🔑 Token cargado desde localStorage: ${token.substring(0, 20)}...`);
        return;
      }

      // Fallback: buscar en la clave antigua
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        this.token = parsed.token || null;
        if (this.token) {
          console.log(`🔑 Token cargado desde auth: ${this.token.substring(0, 20)}...`);
        }
      }
      
      if (!this.token) {
        console.log(`⚠️ No se encontró token en localStorage`);
      }
    } catch (error) {
      console.warn('Error cargando token de autenticación:', error);
      this.token = null;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    console.log(`🔑 Token actualizado en ApiClient: ${token ? token.substring(0, 20) + '...' : 'null'}`);
  }

  reloadToken() {
    this.loadToken();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`🌐 Realizando petición a: ${url}`);
    console.log(`📤 Datos enviados:`, options.body);
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Agregar token de autenticación si existe
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
        console.log(`🔑 Token enviado: ${this.token.substring(0, 20)}...`);
      } else {
        console.log(`⚠️ No hay token disponible para la petición`);
      }

      const response = await fetch(url, {
        headers,
        ...options,
      });

      console.log(`📊 Estado de respuesta: ${response.status} ${response.statusText}`);
      console.log(`📋 Headers de respuesta:`, Object.fromEntries(response.headers.entries()));

      // Obtener el texto de la respuesta primero
      const responseText = await response.text();
      console.log(`📝 Respuesta del servidor (texto):`, responseText);

      // Intentar parsear la respuesta como JSON
      let responseData;
      try {
        if (responseText.trim()) {
          responseData = JSON.parse(responseText);
          console.log(`✅ JSON parseado correctamente:`, responseData);
        } else {
          console.log(`⚠️ Respuesta vacía del servidor`);
          responseData = { message: 'El servidor devolvió una respuesta vacía' };
        }
      } catch (parseError) {
        console.error(`❌ Error al parsear JSON:`, parseError);
        console.error(`❌ Texto que causó el error:`, responseText);
        responseData = { 
          message: `Error al parsear respuesta del servidor. Respuesta recibida: "${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}"` 
        };
      }

      // Si la respuesta no es exitosa, lanzar error con el mensaje del backend
      if (!response.ok) {
        const errorMessage = responseData.message || `Error ${response.status}: ${response.statusText}`;
        console.error(`❌ Error del servidor:`, errorMessage);
        throw new Error(errorMessage);
      }

      return responseData;
    } catch (error) {
      console.error(`❌ Error en la petición:`, error);
      
      // Si es un error de red o conexión
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
      }
      // Re-lanzar otros errores
      throw error;
    }
  }

  // Autenticación
  async validateCredentials(data: LoginRequest): Promise<{ success: boolean }> {
    return this.request('/auth/validate-credentials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async requestLoginCode(data: LoginRequest): Promise<{ success: boolean }> {
    return this.request('/auth/request-login-code', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyLoginCode(data: VerifyEmailRequest): Promise<LoginResponse> {
    return this.request('/auth/verify-login-code', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<LoginResponse> {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resendVerification(data: { email: string }): Promise<{ success: boolean; message: string }> {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Tickets - API real del backend
  async createTicket(data: TicketRequestDTO): Promise<TicketResponseDTO> {
    return this.request('/tickets/crear', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTicket(id: number): Promise<TicketResponseDTO> {
    return this.request(`/tickets/${id}`);
  }

  async getTicketSeguimiento(ticketId: number): Promise<TicketResponseDTO> {
    return this.request(`/tickets/seguimiento/${ticketId}`);
  }

  async getHistorialTickets(page: number = 0, size: number = 10): Promise<{
    content: HistorialTicketResponseDTO[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    return this.request(`/tickets/historial?page=${page}&size=${size}`);
  }

  async buscarTickets(filtros: {
    categoria?: string;
    estado?: string;
    prioridad?: string;
  }): Promise<TicketResponseDTO[]> {
    const params = new URLSearchParams();
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
    
    return this.request(`/tickets/buscar?${params.toString()}`);
  }

  async getCategorias(): Promise<string[]> {
    return this.request('/tickets/categorias');
  }

  async getUsuarioInfo(): Promise<{
    email: string;
    nombre: string;
    ubicacion: string;
    departamento: string;
    cargo: string;
  }> {
    return this.request('/tickets/usuario-info');
  }

  async getMyProfile(): Promise<{
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    telefono: string;
    ubicacion: string;
    departamento: string;
    cargo: string;
    tipoUsuario: string;
    activo: boolean;
    require2fa: boolean;
  }> {
    return this.request('/usuarios/profile');
  }

  async updateMyProfile(data: {
    nombre: string;
    apellido: string;
    telefono?: string;
    ubicacion?: string;
    departamento?: string;
    cargo?: string;
  }): Promise<{
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    telefono: string;
    ubicacion: string;
    departamento: string;
    cargo: string;
    tipoUsuario: string;
    activo: boolean;
    require2fa: boolean;
  }> {
    return this.request('/usuarios/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async testAuth(): Promise<{
    message: string;
    user: string;
    authorities: string[];
  }> {
    return this.request('/tickets/test-auth');
  }

  // Usuarios
  async getUsers(): Promise<User[]> {
    return this.request('/users');
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(data: UpdateUserRequest): Promise<User> {
    return this.request(`/users/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<{ success: boolean }> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Demo endpoint
  async getDemo(): Promise<DemoResponse> {
    return this.request('/demo');
  }

  // ========== SEGUIMIENTO DE TICKETS ==========

  /**
   * Obtener seguimiento de un ticket específico
   */
  async getTicketTracking(ticketId: number): Promise<{
    id: number;
    asunto: string;
    descripcion: string;
    categoria: string;
    estado: string;
    prioridad: string;
    tecnicoAsignado?: string;
    fechaCreacion: string;
    fechaActualizacion: string;
    comentarios?: Array<{
      id: number;
      autor: string;
      mensaje: string;
      fechaCreacion: string;
    }>;
  }> {
    return this.request(`/tickets/seguimiento/${ticketId}`);
  }

  /**
   * Obtener un ticket específico por ID
   */
  async getTicketById(ticketId: number): Promise<{
    id: number;
    asunto: string;
    descripcion: string;
    categoria: string;
    estado: string;
    prioridad: string;
    tecnicoAsignado?: string;
    fechaCreacion: string;
    fechaActualizacion: string;
  }> {
    return this.request(`/tickets/${ticketId}`);
  }

  /**
   * Buscar tickets por criterios
   */
  async searchTickets(filters: {
    categoria?: string;
    estado?: string;
    prioridad?: string;
  }): Promise<Array<{
    id: number;
    asunto: string;
    categoria: string;
    estado: string;
    prioridad: string;
    fechaCreacion: string;
  }>> {
    const params = new URLSearchParams();
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.prioridad) params.append('prioridad', filters.prioridad);
    
    const queryString = params.toString();
    return this.request(`/tickets/buscar${queryString ? `?${queryString}` : ''}`);
  }
}

// Exportar instancia única del cliente API
export const api = new ApiClient();