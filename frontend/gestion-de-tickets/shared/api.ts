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

// Tipos para estadísticas del sistema
export interface SystemStatsResponse {
  totalUsuarios: number;
  totalSuperAdmins: number;
  totalAdmins: number;
  totalTecnicos: number;
  totalFuncionarios: number;
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
  asunto: string;
  descripcion?: string;
  ubicacion: string;
  consulta?: string;
  categoria: string;
  prioridad: 'low' | 'medium' | 'high';
  estado: 'open' | 'in_progress' | 'resolved' | 'closed' | 'PENDIENTE' | 'ASIGNADO' | 'ESCALADO' | 'EN_EJECUCION' | 'TERMINADO' | 'CERRADO';
  archivoAdjunto?: string;
  nombreArchivo?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadorEmail: string;
  creadorNombre?: string;
  tecnicoEmail?: string;
  tecnicoAsignado?: string;
  tecnicoNombre?: string;
  creador?: {
    nombre: string;
  };
  evidencias?: any[];
  historialEstados?: AsignacionResponseDTO[];
  archivosConversacion?: any[];
}

export interface ArchivoTicketInfo {
  nombreArchivo: string;
  rutaArchivo: string;
  extension: string;
  tipoMime: string;
  tamañoArchivo: number;
  esImagen: boolean;
  esPDF: boolean;
  esVideo: boolean;
}

export interface SubirArchivoRequestDTO {
  ticketId: number;
  nombreArchivo: string;
  tipoMime: string;
  tamañoArchivo: number;
  extension: string;
  contenidoArchivo: string; // Base64
  comentario?: string;
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

// ========== TIPOS PARA USUARIOS ==========

export interface UsuarioDTO {
  id: number;  // El backend devuelve 'id' no 'idUsuario'
  idUsuario?: number;  // Mantener por compatibilidad
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  ubicacion?: string;
  departamento?: string;
  cargo?: string;
  tipoUsuario: 'SUPERADMIN' | 'ADMINISTRADOR' | 'TECNICO' | 'FUNCIONARIO' | 'Superadmin' | 'Administrador' | 'Técnico' | 'Funcionario';
  activo: boolean;
  emailVerificado: boolean;
  require2fa: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  nombreCompleto?: string;  // El backend también devuelve este campo
  creadoPor?: {
    idUsuario: number;
    nombre: string;
    email: string;
  };
}

export interface UsuarioSummaryDTO {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  tipoUsuario: string;
  activo: boolean;
}

export interface CreateTecnicoRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  require2fa?: boolean;
  area?: string;
  nivel?: string;
  observaciones?: string;
}

export interface CreateAdminRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  ubicacion?: string;
  departamento?: string;
  cargo?: string;
}

export interface UpdateUsuarioRequest {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  ubicacion?: string;
  departamento?: string;
  cargo?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ========== TIPOS PARA PAGINACIÓN ==========

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// ========== TIPOS PARA CATEGORÍAS ==========

export interface CategoriaResponseDTO {
  id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  orden: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  colorHex?: string;
  icono?: string;
  displayName?: string;
}

// ========== TIPOS PARA REGLAS DE AUTOMATIZACIÓN ==========

export interface ReglaAutomatizacionRequestDTO {
  nombre: string;
  descripcion?: string;
  condicion: string;
  accion: string;
  prioridad?: number;
  activa?: boolean;
}

export interface ReglaAutomatizacionResponseDTO {
  id: number;
  nombre: string;
  descripcion?: string;
  condicion: string;
  accion: string;
  prioridad: number;
  activa: boolean;
  ejecuciones: number;
  ultimaEjecucion?: string;
  creadoPor?: string;
  fechaCreacion: string;
}

export interface CategoriaSimpleDTO {
  id: number;
  nombre: string;
  activa: boolean;
  colorHex?: string;
  icono?: string;
  displayName?: string;
}

export interface CategoriaRequestDTO {
  nombre: string;
  descripcion?: string;
  orden?: number;
}

// ========== TIPOS PARA EVIDENCIAS ==========

export interface EvidenciaResponseDTO {
  idEvidencia: number;
  ticketId: number;
  nombreArchivo: string;
  nombreCompletoArchivo: string;
  tipoArchivo: string;
  tamañoArchivo: number;
  rutaArchivo: string;
  fechaSubida: string;
  subidoPor: {
    idUsuario: number;
    nombre: string;
    email: string;
  };
}

// ========== TIPOS PARA ASIGNACIONES ==========

export interface AsignacionResponseDTO {
  idAsignacion?: number;
  ticketId: number;
  ticketTitulo: string;
  tecnicoId: number;
  tecnicoNombre: string;
  tecnicoEmail: string;
  estadoAnterior: string;
  estadoNuevo: string;
  prioridad: string;
  comentario?: string;
  fechaAsignacion: string;
  asignadoPor: string;
  tipoOperacion: string;
}

export interface AsignarTicketRequestDTO {
  ticketId: number;
  tecnicoId: number;
  comentario?: string;
}

// ========== TIPOS PARA TÉCNICOS ==========

export interface TicketTecnicoResponseDTO {
  idTicket: number;
  ubicacion: string;
  consulta?: string;
  categoria: string;
  prioridad: string;
  estado: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creador: {
    idUsuario: number;
    nombre: string;
    email: string;
  };
  evidencias: EvidenciaResponseDTO[];
  historial: Array<{
    id: number;
    estado: string;
    comentarios?: string;
    fechaCambio: string;
    cambiadoPor: string;
  }>;
}

export interface CambiarEstadoTicketRequestDTO {
  ticketId: number;
  nuevoEstado: string;
  comentarios?: string;
}

export interface SubirEvidenciaRequestDTO {
  ticketId: number;
  nombreArchivo: string;
  tipoArchivo: string;
  contenidoArchivo: string; // Base64
}

export interface EstadisticasTecnicoResponseDTO {
  totalTickets: number;
  ticketsAbiertos: number;
  ticketsEnProgreso: number;
  ticketsResueltos: number;
  ticketsCerrados: number;
  ticketsAsignadosHoy: number;
  ticketsResueltosHoy: number;
  tiempoPromedioResolucion: number; // en horas
}

// ========== TIPOS PARA ADMINISTRADORES ==========

export interface EstadisticasAdminResponseDTO {
  totalTickets: number;
  ticketsAbiertos: number;
  ticketsEnProgreso: number;
  ticketsResueltos: number;
  ticketsCerrados: number;
  totalTecnicos: number;
  tecnicosActivos: number;
  ticketsSinAsignar: number;
  ticketsAsignadosHoy: number;
  ticketsResueltosHoy: number;
}

export interface EstadisticasTecnicosResponseDTO {
  totalTecnicos: number;
  tecnicosActivos: number;
  tecnicosInactivos: number;
  tecnicosCreadosHoy: number;
  tecnicosCreadosEsteMes: number;
}

// ========== TIPOS PARA SUPERADMIN ==========

export interface EstadisticasSistemaDTO {
  totalUsuarios: number;
  totalTickets: number;
  totalCategorias: number;
  totalEvidencias: number;
  usuariosActivos: number;
  ticketsAbiertos: number;
  ticketsResueltos: number;
  categoriasActivas: number;
  ticketsPorEstado: Record<string, number>;
  usuariosPorTipo: Record<string, number>;
  ticketsPorCategoria: Record<string, number>;
  ticketsPorMes: Array<{
    mes: string;
    cantidad: number;
  }>;
}

export interface EstadisticasAdministradoresResponseDTO {
  totalAdministradores: number;
  administradoresActivos: number;
  administradoresInactivos: number;
  administradoresCreadosHoy: number;
  administradoresCreadosEsteMes: number;
}

export interface ConfiguracionResponseDTO {
  idConfiguracion: number;
  clave: string;
  valor: string;
  categoria: string;
  descripcion?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface ConfiguracionRequestDTO {
  clave: string;
  valor: string;
  categoria: string;
  descripcion?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  colorFondo?: string;
  logoUrl?: string;
  nombreApp?: string;
}

// ========== TIPOS LEGACY (para compatibilidad) ==========

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

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
      console.log(`🌐 Realizando petición a: ${url}`);
      console.log(`📤 Datos enviados:`, options.body);
      console.log(`🔧 Método:`, options.method || 'GET');
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
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
        console.error(`❌ Respuesta completa:`, responseData);
        console.error(`❌ URL de la petición:`, url);
        console.error(`❌ Datos enviados:`, options.body);
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

  async getMensajesTicket(ticketId: number): Promise<any[]> {
    console.log('💬 [API] Obteniendo mensajes del ticket:', ticketId);
    
    try {
      const response = await this.request(`/tickets/${ticketId}/comentarios`);
      console.log('✅ [API] Mensajes obtenidos:', response);
      return response;
    } catch (error) {
      console.error('❌ [API] Error obteniendo mensajes:', error);
      return [];
    }
  }

  async getTicketsHistory(page: number = 0, size: number = 10): Promise<{
    content: TicketResponseDTO[];
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
    return this.request('/usuarios/profile');
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

  // ========== GESTIÓN DE USUARIOS ==========

  // Técnicos (Solo Admin)
  async createTechnician(data: CreateTecnicoRequest): Promise<UsuarioDTO> {
    return this.request('/usuarios/tecnico', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTechnicians(page: number = 0, size: number = 20, search?: string): Promise<PageResponse<UsuarioDTO>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (search) params.append('search', search);
    
    return this.request(`/usuarios/tecnicos?${params.toString()}`);
  }

  async getTechniciansForSelect(): Promise<UsuarioSummaryDTO[]> {
    return this.request('/usuarios/tecnicos/select');
  }

  // Administradores (Solo SuperAdmin)
  async createAdmin(data: CreateAdminRequest): Promise<UsuarioDTO> {
    return this.request('/usuarios/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdmins(page: number = 0, size: number = 20, search?: string): Promise<PageResponse<UsuarioDTO>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (search) params.append('search', search);
    
    return this.request(`/usuarios/admins?${params.toString()}`);
  }

  // Gestión General
  async getUserById(id: number): Promise<UsuarioDTO> {
    return this.request(`/usuarios/${id}`);
  }

  async updateUser(id: number, data: UpdateUsuarioRequest): Promise<UsuarioDTO> {
    return this.request(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleUserStatus(id: number): Promise<ApiResponse> {
    return this.request(`/usuarios/${id}/toggle-status`, {
      method: 'PUT',
    });
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    return this.request('/usuarios/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Auditoría
  async getUsersCreatedBy(creatorId: number): Promise<UsuarioDTO[]> {
    return this.request(`/usuarios/created-by/${creatorId}`);
  }

  async getMyCreatedUsers(): Promise<UsuarioDTO[]> {
    return this.request('/usuarios/my-created-users');
  }

  // Métricas
  async getTotalUsersByType(tipo: string): Promise<number> {
    return this.request(`/usuarios/metrics/total/${tipo}`);
  }

  async getActiveUsersByType(tipo: string): Promise<number> {
    return this.request(`/usuarios/metrics/active/${tipo}`);
  }

  // ========== GESTIÓN DE CATEGORÍAS ==========

  async getCategoriasActivas(): Promise<CategoriaSimpleDTO[]> {
    return this.request('/categorias/activas');
  }

  async buscarCategoriasPorNombre(nombre: string): Promise<CategoriaSimpleDTO[]> {
    return this.request(`/categorias/buscar?nombre=${encodeURIComponent(nombre)}`);
  }

  async crearCategoria(data: CategoriaRequestDTO): Promise<CategoriaResponseDTO> {
    return this.request('/categorias', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCategoriaPorId(id: number): Promise<CategoriaResponseDTO> {
    return this.request(`/categorias/${id}`);
  }

  async actualizarCategoria(id: number, data: CategoriaRequestDTO): Promise<CategoriaResponseDTO> {
    return this.request(`/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async eliminarCategoria(id: number): Promise<ApiResponse> {
    return this.request(`/categorias/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleEstadoCategoria(id: number): Promise<CategoriaResponseDTO> {
    return this.request(`/categorias/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  async getTodasLasCategorias(
    page: number = 0, 
    size: number = 10, 
    activa?: boolean, 
    nombre?: string
  ): Promise<PageResponse<CategoriaResponseDTO>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (activa !== undefined) params.append('activa', activa.toString());
    if (nombre) params.append('nombre', nombre);
    
    return this.request(`/categorias?${params.toString()}`);
  }

  async getEstadisticasCategorias(): Promise<{
    totalCategorias: number;
    categoriasActivas: number;
    categoriasInactivas: number;
  }> {
    return this.request('/categorias/estadisticas');
  }

  // ========== GESTIÓN DE EVIDENCIAS ==========

  async getEvidenciasPorTicket(ticketId: number): Promise<any[]> {
    return this.request(`/evidencias/ticket/${ticketId}`);
  }


  async descargarEvidencia(ticketId: number, nombreArchivo: string): Promise<any> {
    return this.request(`/evidencias/descargar/${ticketId}/${encodeURIComponent(nombreArchivo)}`);
  }

  // ========== GESTIÓN DE NOTIFICACIONES ==========

  async getNotificaciones(page: number = 0, size: number = 10, leida?: boolean): Promise<PageResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    if (leida !== undefined) {
      params.append('leida', leida.toString());
    }
    return this.request(`/notificaciones?${params.toString()}`);
  }

  async getNotificacionesNoLeidas(): Promise<any[]> {
    return this.request('/notificaciones/no-leidas');
  }

  async marcarNotificacionComoLeida(id: number): Promise<any> {
    return this.request(`/notificaciones/${id}/marcar-leida`, {
      method: 'PUT'
    });
  }

  async marcarTodasComoLeidas(): Promise<ApiResponse> {
    return this.request('/notificaciones/marcar-todas-leidas', {
      method: 'PUT'
    });
  }

  async crearNotificacion(data: any): Promise<any> {
    return this.request('/notificaciones', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async eliminarNotificacion(id: number): Promise<ApiResponse> {
    return this.request(`/notificaciones/${id}`, {
      method: 'DELETE'
    });
  }

  async getEstadisticasNotificaciones(): Promise<any> {
    return this.request('/notificaciones/estadisticas');
  }

  // ========== NOTIFICACIONES POR ROLES ==========
  
  async getRoleNotifications(userEmail: string, page: number = 0, size: number = 20): Promise<any> {
    return this.request(`/notifications/role-based/user/${userEmail}?page=${page}&size=${size}`);
  }

  async getUnreadRoleNotifications(userEmail: string): Promise<any> {
    return this.request(`/notifications/role-based/user/${userEmail}/unread`);
  }

  async markRoleNotificationAsRead(id: number, userEmail: string): Promise<any> {
    return this.request(`/notifications/role-based/${id}/mark-read?email=${userEmail}`, {
      method: 'PUT'
    });
  }

  async deleteRoleNotification(id: number): Promise<any> {
    return this.request(`/notifications/role-based/${id}`, {
      method: 'DELETE'
    });
  }

  async getNotificationExamples(): Promise<any> {
    return this.request('/notifications/role-based/examples');
  }

  async createTestNotifications(): Promise<any> {
    return this.request('/notifications/role-based/create-test-notifications', {
      method: 'POST'
    });
  }

  async createTicketNotification(ticketId: number, creatorId: number): Promise<any> {
    return this.request('/notifications/role-based/trigger-ticket-created', {
      method: 'POST',
      body: JSON.stringify({ ticketId, creatorId })
    });
  }

  async createTicketAssignmentNotification(ticketId: number, technicianId: number, assignerId: number): Promise<any> {
    return this.request('/notifications/role-based/trigger-ticket-assigned', {
      method: 'POST',
      body: JSON.stringify({ ticketId, technicianId, assignerId })
    });
  }

  // ========== GESTIÓN DE ASIGNACIONES ==========

  async asignarTicket(data: AsignarTicketRequestDTO): Promise<AsignacionResponseDTO> {
    return this.request('/asignaciones/asignar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async reasignarTicket(data: AsignarTicketRequestDTO): Promise<AsignacionResponseDTO> {
    return this.request('/asignaciones/reasignar', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async desasignarTicket(ticketId: number): Promise<AsignacionResponseDTO> {
    return this.request(`/asignaciones/desasignar/${ticketId}`, {
      method: 'DELETE',
    });
  }

  async getTicketsAsignados(tecnicoId: number): Promise<AsignacionResponseDTO[]> {
    return this.request(`/asignaciones/tecnico/${tecnicoId}`);
  }

  async getTicketsSinAsignar(): Promise<AsignacionResponseDTO[]> {
    return this.request('/asignaciones/sin-asignar');
  }

  async reabrirTicket(ticketId: number): Promise<AsignacionResponseDTO> {
    return this.request(`/asignaciones/reabrir/${ticketId}`, {
      method: 'POST',
    });
  }

  async enviarComentario(ticketId: number, mensaje: string): Promise<ApiResponse> {
    console.log('💬 [API] Enviando comentario:', { ticketId, mensaje });
    
    try {
      const response = await this.request(`/tickets/${ticketId}/comentarios`, {
        method: 'POST',
        body: JSON.stringify({ mensaje })
      });
      
      console.log('✅ [API] Comentario enviado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [API] Error enviando comentario:', error);
      throw error;
    }
  }

  // Funciones de comentarios adicionales para compatibilidad
  async enviarComentarioDebug(ticketId: number, mensaje: string): Promise<ApiResponse> {
    console.log('🔥 [DEBUG] Enviando comentario con método de depuración');
    return this.enviarComentario(ticketId, mensaje);
  }

  async enviarComentarioConQuery(ticketId: number, mensaje: string): Promise<ApiResponse> {
    console.log('🔥 [QUERY] Enviando comentario con query');
    return this.enviarComentario(ticketId, mensaje);
  }

  async enviarComentarioFuncional(ticketId: number, mensaje: string): Promise<ApiResponse> {
    console.log('🔥 [FUNCIONAL] Enviando comentario funcional');
    return this.enviarComentario(ticketId, mensaje);
  }

  async enviarComentarioEmergencia(ticketId: number, mensaje: string): Promise<ApiResponse> {
    console.log('🔥 [EMERGENCIA] Enviando comentario de emergencia');
    return this.enviarComentario(ticketId, mensaje);
  }

  // ========== ENCUESTA DE SATISFACCIÓN ==========
  
  /**
   * Enviar encuesta de satisfacción
   */
  async enviarEncuestaSatisfaccion(data: {
    ticketId: number;
    calificacion: number;
    comentario: string;
    aspectosPositivos: string[];
    aspectosNegativos: string[];
  }): Promise<ApiResponse> {
    return this.request('/encuestas/satisfaccion', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ========== INTELIGENCIA ARTIFICIAL ==========
  
  /**
   * Clasificar ticket con IA
   */
  async clasificarTicketConIA(ticketId: number): Promise<any> {
    return this.request(`/ai/clasificar/${ticketId}`, {
      method: 'POST'
    });
  }

  /**
   * Obtener sugerencias de IA
   */
  async obtenerSugerenciasIA(ticketId: number): Promise<any> {
    return this.request(`/ai/sugerencias/${ticketId}`);
  }

  // ========== AUTOMATIZACIÓN Y REGLAS ==========
  
  /**
   * Obtener reglas de automatización
   */
  async obtenerReglasAutomatizacion(): Promise<any[]> {
    return this.request('/automation/rules');
  }

  /**
   * Crear regla de automatización
   */
  async crearReglaAutomatizacion(rule: any): Promise<ApiResponse> {
    return this.request('/automation/rules', {
      method: 'POST',
      body: JSON.stringify(rule)
    });
  }

  /**
   * Actualizar regla de automatización
   */
  async actualizarReglaAutomatizacion(ruleId: number, updates: any): Promise<ApiResponse> {
    return this.request(`/automation/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Eliminar regla de automatización
   */
  async eliminarReglaAutomatizacion(ruleId: number): Promise<ApiResponse> {
    return this.request(`/automation/rules/${ruleId}`, {
      method: 'DELETE'
    });
  }

  // ========== DASHBOARD AVANZADO ==========
  
  /**
   * Obtener métricas del dashboard
   */
  async obtenerMetricasDashboard(timeRange: string = '7d'): Promise<any> {
    return this.request(`/dashboard/metrics?range=${timeRange}`);
  }

  /**
   * Exportar reporte del dashboard
   */
  async exportarReporteDashboard(timeRange: string, format: 'pdf' | 'excel'): Promise<ApiResponse> {
    return this.request(`/dashboard/export?range=${timeRange}&format=${format}`, {
      method: 'POST'
    });
  }

  // ========== SOPORTE MULTI-IDIOMA ==========
  
  /**
   * Cambiar idioma del sistema
   */
  async cambiarIdioma(language: string): Promise<ApiResponse> {
    return this.request('/settings/language', {
      method: 'POST',
      body: JSON.stringify({ language })
    });
  }

  /**
   * Obtener idioma actual
   */
  async obtenerIdiomaActual(): Promise<{ language: string }> {
    return this.request('/settings/language');
  }

  // ========== GESTIÓN DE TÉCNICOS ==========

  async getTicketsAsignadosTecnico(): Promise<TicketTecnicoResponseDTO[]> {
    return this.request('/tecnico/tickets');
  }

  async getTicketDetalladoTecnico(ticketId: number): Promise<TicketTecnicoResponseDTO> {
    return this.request(`/tecnico/tickets/${ticketId}`);
  }

  async cambiarEstadoTicket(data: CambiarEstadoTicketRequestDTO): Promise<TicketTecnicoResponseDTO> {
    return this.request('/tecnico/tickets/cambiar-estado', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async subirEvidencia(data: SubirEvidenciaRequestDTO): Promise<EvidenciaResponseDTO> {
    return this.request('/tecnico/tickets/subir-evidencia', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getHistorialTicketsTecnico(): Promise<TicketTecnicoResponseDTO[]> {
    return this.request('/tecnico/historial');
  }

  async getEstadisticasTecnico(): Promise<EstadisticasTecnicoResponseDTO> {
    return this.request('/tecnico/estadisticas');
  }

  // ========== GESTIÓN DE ADMINISTRADORES ==========

  async getTodosLosTickets(): Promise<TicketResponseDTO[]> {
    return this.request('/admin/tickets');
  }

  async getTicketDetalladoAdmin(ticketId: number): Promise<TicketResponseDTO> {
    return this.request(`/admin/tickets/${ticketId}`);
  }

  async getTicketsPorEstado(estado: string): Promise<TicketResponseDTO[]> {
    return this.request(`/admin/tickets/estado/${estado}`);
  }

  async getTicketsSinAsignarAdmin(): Promise<TicketResponseDTO[]> {
    return this.request('/admin/tickets/sin-asignar');
  }

  async getTicketsPorTecnico(tecnicoId: number): Promise<TicketResponseDTO[]> {
    return this.request(`/admin/tickets/tecnico/${tecnicoId}`);
  }

  async getEstadisticasGenerales(): Promise<EstadisticasAdminResponseDTO> {
    return this.request('/admin/estadisticas');
  }

  // ========== GESTIÓN DE TÉCNICOS (ADMIN) ==========

  async crearTecnicoAdmin(data: CreateTecnicoRequest): Promise<UsuarioDTO> {
    return this.request('/admin/tecnicos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTodosLosTecnicosAdmin(): Promise<UsuarioDTO[]> {
    return this.request('/admin/tecnicos');
  }

  async getTecnicoPorIdAdmin(id: number): Promise<UsuarioDTO> {
    return this.request(`/admin/tecnicos/${id}`);
  }

  async toggleEstadoTecnicoAdmin(id: number): Promise<UsuarioDTO> {
    return this.request(`/admin/tecnicos/${id}/toggle-estado`, {
      method: 'PUT',
    });
  }

  async getEstadisticasTecnicosAdmin(): Promise<EstadisticasTecnicosResponseDTO> {
    return this.request('/admin/tecnicos/estadisticas');
  }

  async cambiarPasswordTecnicoAdmin(id: number, data: { newPassword: string; confirmPassword: string }): Promise<UsuarioDTO> {
    return this.request(`/admin/tecnicos/${id}/cambiar-password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ========== GESTIÓN DE SUPERADMIN ==========

  async getEstadisticasSistema(): Promise<EstadisticasSistemaDTO> {
    return this.request('/superadmin/estadisticas');
  }

  async verificarSuperAdminActivo(): Promise<ApiResponse> {
    return this.request('/superadmin/existe-superadmin');
  }

  async getSuperAdminPorDefecto(): Promise<ApiResponse> {
    return this.request('/superadmin/superadmin-por-defecto');
  }

  // Configuraciones
  async getConfiguraciones(): Promise<Record<string, Record<string, string>>> {
    return this.request('/superadmin/configuraciones');
  }

  async getConfiguracionesPorCategoria(categoria: string): Promise<ConfiguracionResponseDTO[]> {
    return this.request(`/superadmin/configuraciones/${categoria}`);
  }

  async actualizarColores(data: ConfiguracionRequestDTO): Promise<ApiResponse> {
    return this.request('/superadmin/configuraciones/colores', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async actualizarLogo(data: ConfiguracionRequestDTO): Promise<ApiResponse> {
    return this.request('/superadmin/configuraciones/logo', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async crearOActualizarConfiguracion(data: ConfiguracionRequestDTO): Promise<ConfiguracionResponseDTO> {
    return this.request('/superadmin/configuraciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async eliminarConfiguracion(clave: string): Promise<ApiResponse> {
    return this.request(`/superadmin/configuraciones/${clave}`, {
      method: 'DELETE',
    });
  }

  // Gestión de Administradores
  async crearAdministrador(data: CreateAdminRequest): Promise<UsuarioDTO> {
    return this.request('/superadmin/administradores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTodosLosAdministradores(): Promise<UsuarioDTO[]> {
    return this.request('/superadmin/administradores');
  }

  async getAdministradorPorId(id: number): Promise<UsuarioDTO> {
    return this.request(`/superadmin/administradores/${id}`);
  }

  async toggleEstadoAdministrador(id: number): Promise<UsuarioDTO> {
    return this.request(`/superadmin/administradores/${id}/toggle-estado`, {
      method: 'PUT',
    });
  }

  async getEstadisticasAdministradores(): Promise<EstadisticasAdministradoresResponseDTO> {
    return this.request('/superadmin/administradores/estadisticas');
  }

  async cambiarPasswordAdministrador(id: number, data: { newPassword: string; confirmPassword: string }): Promise<UsuarioDTO> {
    return this.request(`/superadmin/administradores/${id}/cambiar-password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ========== MÉTODOS LEGACY (para compatibilidad) ==========

  async getUsers(): Promise<User[]> {
    return this.request('/users');
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserLegacy(data: UpdateUserRequest): Promise<User> {
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

  // ========== MÓDULOS ADMINISTRATIVOS ==========

  // ========== ADMIN - GESTIÓN DE TICKETS ==========

  /**
   * Obtener todos los tickets para administradores
   */
  async getAdminTickets(): Promise<TicketResponseDTO[]> {
    return this.request('/admin/tickets');
  }

  /**
   * Obtener ticket detallado para administradores
   */
  async getAdminTicketDetail(ticketId: number): Promise<TicketResponseDTO> {
    return this.request(`/admin/tickets/${ticketId}`);
  }

  /**
   * Obtener tickets por estado
   */
  async getAdminTicketsByStatus(estado: string): Promise<TicketResponseDTO[]> {
    return this.request(`/admin/tickets/estado/${estado}`);
  }

  /**
   * Obtener tickets sin asignar
   */
  async getAdminTicketsUnassigned(): Promise<TicketResponseDTO[]> {
    return this.request('/admin/tickets/sin-asignar');
  }

  /**
   * Obtener tickets por técnico
   */
  async getAdminTicketsByTechnician(tecnicoId: number): Promise<TicketResponseDTO[]> {
    return this.request(`/admin/tickets/tecnico/${tecnicoId}`);
  }

  /**
   * Obtener estadísticas generales para administradores
   */
  async getAdminStatistics(): Promise<EstadisticasAdminResponseDTO> {
    return this.request('/admin/estadisticas');
  }

  // ========== ADMIN - GESTIÓN DE TÉCNICOS ==========


  /**
   * Obtener todos los técnicos
   */
  async getAdminTechnicians(): Promise<UsuarioDTO[]> {
    return this.request('/admin/tecnicos');
  }

  /**
   * Obtener técnico por ID
   */
  async getAdminTechnicianById(id: number): Promise<UsuarioDTO> {
    return this.request(`/admin/tecnicos/${id}`);
  }

  /**
   * Activar/desactivar técnico
   */
  async toggleTechnicianStatus(id: number): Promise<UsuarioDTO> {
    return this.request(`/admin/tecnicos/${id}/toggle-estado`, {
      method: 'PUT'
    });
  }

  /**
   * Obtener estadísticas de técnicos
   */
  async getTechnicianStatistics(): Promise<EstadisticasTecnicosResponseDTO> {
    return this.request('/admin/tecnicos/estadisticas');
  }

  /**
   * Cambiar contraseña de técnico
   */
  async changeTechnicianPassword(id: number, request: { newPassword: string; confirmPassword: string }): Promise<UsuarioDTO> {
    return this.request(`/admin/tecnicos/${id}/cambiar-password`, {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }

  // ========== CATEGORÍAS ==========

  /**
   * Obtener categorías activas
   */
  async getActiveCategories(): Promise<CategoriaSimpleDTO[]> {
    return this.request('/categorias/activas');
  }

  /**
   * Buscar categorías por nombre
   */
  async searchCategories(nombre: string): Promise<CategoriaSimpleDTO[]> {
    return this.request(`/categorias/buscar?nombre=${encodeURIComponent(nombre)}`);
  }

  /**
   * Crear categoría
   */
  async createCategory(request: CategoriaRequestDTO): Promise<CategoriaResponseDTO> {
    return this.request('/categorias', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Obtener categoría por ID
   */
  async getCategoryById(id: number): Promise<CategoriaResponseDTO> {
    return this.request(`/categorias/${id}`);
  }

  /**
   * Actualizar categoría
   */
  async updateCategory(id: number, request: CategoriaRequestDTO): Promise<CategoriaResponseDTO> {
    return this.request(`/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }

  /**
   * Eliminar categoría
   */
  async deleteCategory(id: number): Promise<ApiResponse> {
    return this.request(`/categorias/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Activar/desactivar categoría
   */
  async toggleCategoryStatus(id: number): Promise<CategoriaResponseDTO> {
    return this.request(`/categorias/${id}/toggle`, {
      method: 'PATCH'
    });
  }

  /**
   * Obtener todas las categorías con paginación
   */
  async getAllCategories(params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
    activa?: boolean;
    nombre?: string;
  } = {}): Promise<PageResponse<CategoriaResponseDTO>> {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.size !== undefined) searchParams.append('size', params.size.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortDir) searchParams.append('sortDir', params.sortDir);
    if (params.activa !== undefined) searchParams.append('activa', params.activa.toString());
    if (params.nombre) searchParams.append('nombre', params.nombre);

    const queryString = searchParams.toString();
    return this.request(`/categorias${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Obtener estadísticas de categorías
   */
  async getCategoryStatistics(): Promise<{
    totalCategorias: number;
    categoriasActivas: number;
    categoriasInactivas: number;
  }> {
    return this.request('/categorias/estadisticas');
  }

  // ========== EVIDENCIAS ==========

  /**
   * Obtener evidencias de un ticket
   */
  async getTicketEvidences(ticketId: number): Promise<any[]> {
    return this.request(`/evidencias/ticket/${ticketId}`);
  }

  /**
   * Descargar evidencia
   */
  async downloadEvidence(ticketId: number, nombreArchivo: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/evidencias/descargar/${ticketId}/${encodeURIComponent(nombreArchivo)}`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error descargando evidencia: ${response.statusText}`);
    }
    
    return response.blob();
  }

  // ========== ASIGNACIONES ==========

  /**
   * Asignar ticket a técnico
   */
  async assignTicket(request: AsignarTicketRequestDTO): Promise<AsignacionResponseDTO> {
    return this.request('/asignaciones/asignar', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Reasignar ticket a otro técnico
   */
  async reassignTicket(request: AsignarTicketRequestDTO): Promise<AsignacionResponseDTO> {
    return this.request('/asignaciones/reasignar', {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }

  /**
   * Desasignar ticket
   */
  async unassignTicket(ticketId: number): Promise<AsignacionResponseDTO> {
    return this.request(`/asignaciones/desasignar/${ticketId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Obtener tickets asignados a un técnico
   */
  async getAssignedTickets(tecnicoId: number): Promise<AsignacionResponseDTO[]> {
    return this.request(`/asignaciones/tecnico/${tecnicoId}`);
  }

  /**
   * Obtener tickets sin asignar
   */
  async getUnassignedTickets(): Promise<AsignacionResponseDTO[]> {
    return this.request('/asignaciones/sin-asignar');
  }

  // ========== TÉCNICO ==========

  /**
   * Obtener tickets asignados al técnico actual
   */
  async getTechnicianTickets(): Promise<TicketTecnicoResponseDTO[]> {
    return this.request('/tecnico/tickets');
  }

  /**
   * Obtener ticket detallado para técnico
   */
  async getTechnicianTicketDetail(ticketId: number): Promise<TicketTecnicoResponseDTO> {
    return this.request(`/tecnico/tickets/${ticketId}`);
  }

  /**
   * Cambiar estado de ticket
   */
  async changeTicketStatus(request: CambiarEstadoTicketRequestDTO): Promise<TicketTecnicoResponseDTO> {
    return this.request('/tecnico/tickets/cambiar-estado', {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }

  /**
   * Subir evidencia a ticket
   */
  async uploadEvidence(request: SubirEvidenciaRequestDTO): Promise<EvidenciaResponseDTO> {
    return this.request('/tecnico/tickets/subir-evidencia', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Obtener historial de tickets del técnico
   */
  async getTechnicianHistory(): Promise<TicketTecnicoResponseDTO[]> {
    return this.request('/tecnico/historial');
  }


  // ========== MÉTODOS FALTANTES ==========


  /**
   * Obtener estadísticas para administradores
   */
  async getAdminStats(): Promise<EstadisticasAdminResponseDTO> {
    return this.request('/admin/estadisticas');
  }





  // ========== GESTIÓN DE ARCHIVOS DE TICKETS ==========
  
  /**
   * Subir archivo a un ticket
   */
  async subirArchivoTicket(archivo: File, ticketId: number, comentario?: string): Promise<any> {
    // Convertir archivo a Base64
    const contenidoBase64 = await this.fileToBase64(archivo);
    
    const request: SubirArchivoRequestDTO = {
      ticketId,
      nombreArchivo: archivo.name.split('.')[0], // Nombre sin extensión
      tipoMime: archivo.type,
      tamañoArchivo: archivo.size,
      extension: archivo.name.split('.').pop() || '',
      contenidoArchivo: contenidoBase64,
      comentario
    };

    return this.request('/archivos-conversacion/subir', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Obtener información del archivo del ticket
   */
  async getArchivoTicketInfo(ticketId: number): Promise<ArchivoTicketInfo> {
    return this.request(`/archivos-conversacion/info/${ticketId}`);
  }

  /**
   * Descargar archivo
   */
  async descargarArchivoTicket(ticketId: number): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/archivos-conversacion/descargar/${ticketId}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error descargando archivo');
    }
    
    return response.blob();
  }

  /**
   * Previsualizar archivo (para imágenes y PDFs)
   */
  async previsualizarArchivoTicket(ticketId: number): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/archivos-conversacion/preview/${ticketId}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error previsualizando archivo');
    }
    
    return response.blob();
  }

  /**
   * Obtener tipos de archivo permitidos
   */
  async getTiposArchivoPermitidos(): Promise<any> {
    return this.request('/archivos-conversacion/tipos-permitidos');
  }

  // ========== GESTIÓN DE MÚLTIPLES ARCHIVOS POR TICKET ==========
  
  /**
   * Subir archivo a un ticket (nuevo sistema de múltiples archivos)
   */
  async subirArchivoTicketNuevo(archivo: File, ticketId: number, comentario?: string): Promise<any> {
    // Convertir archivo a Base64
    const contenidoBase64 = await this.fileToBase64(archivo);
    
    const request: SubirArchivoRequestDTO = {
      ticketId,
      nombreArchivo: archivo.name.split('.')[0], // Nombre sin extensión
      tipoMime: archivo.type,
      tamañoArchivo: archivo.size,
      extension: archivo.name.split('.').pop() || '',
      contenidoArchivo: contenidoBase64,
      comentario
    };

    return this.request('/archivos-ticket/subir', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Obtener múltiples archivos de un ticket
   */
  async getArchivosTicket(ticketId: number): Promise<any> {
    const response = await this.request(`/archivos-ticket/ticket/${ticketId}`);
    console.log('🔍 [DEBUG] getArchivosTicket response:', response);
    
    // El backend devuelve directamente un array, no una estructura {success, data}
    if (Array.isArray(response)) {
      return response;
    }
    
    // Si viene envuelto en una estructura de respuesta estándar
    if (response && (response as any).data && Array.isArray((response as any).data)) {
      return (response as any).data;
    }
    
    // Si viene con success: true
    if (response && (response as any).success && Array.isArray((response as any).data)) {
      return (response as any).data;
    }
    
    console.warn('⚠️ [DEBUG] Formato de respuesta inesperado:', response);
    return [];
  }

  /**
   * Descargar archivo específico
   */
  async descargarArchivoTicketEspecifico(ticketId: number, archivoId: number): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/archivos-ticket/descargar/${ticketId}/${archivoId}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error descargando archivo');
    }
    
    return response.blob();
  }

  /**
   * Previsualizar archivo específico
   */
  async previsualizarArchivoTicketEspecifico(ticketId: number, archivoId: number): Promise<Blob> {
    console.log('🔍 [DEBUG] previsualizarArchivoTicketEspecifico:', { ticketId, archivoId });
    console.log('🔍 [DEBUG] baseURL:', this.baseUrl);
    const url = `${this.baseUrl}/archivos-ticket/preview/${ticketId}/${archivoId}`;
    console.log('🔍 [DEBUG] URL de previsualización:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    console.log('🔍 [DEBUG] Respuesta de previsualización:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DEBUG] Error en previsualización:', errorText);
      throw new Error(`Error previsualizando archivo: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('✅ [DEBUG] Blob de previsualización creado:', blob.size, 'bytes');
    return blob;
  }

  /**
   * Eliminar archivo específico
   */
  async eliminarArchivoTicketEspecifico(ticketId: number, archivoId: number): Promise<ApiResponse> {
    return this.request(`/archivos-ticket/${ticketId}/${archivoId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Convertir archivo a Base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el prefijo "data:image/jpeg;base64," etc.
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  // ========== REGLAS DE AUTOMATIZACIÓN ==========

  /**
   * Obtener todas las reglas de automatización
   */
  async getReglasAutomatizacion(page: number = 0, size: number = 20): Promise<ReglaAutomatizacionResponseDTO[]> {
    return this.request(`/automation-rules?page=${page}&size=${size}`);
  }

  /**
   * Obtener reglas activas
   */
  async getReglasActivas(): Promise<ReglaAutomatizacionResponseDTO[]> {
    return this.request('/automation-rules/activas');
  }

  /**
   * Crear regla de automatización
   */
  async createReglaAutomatizacion(reglaData: ReglaAutomatizacionRequestDTO): Promise<ReglaAutomatizacionResponseDTO> {
    return this.request('/automation-rules', {
      method: 'POST',
      body: JSON.stringify(reglaData)
    });
  }

  /**
   * Obtener regla por ID
   */
  async getReglaAutomatizacion(id: number): Promise<ReglaAutomatizacionResponseDTO> {
    return this.request(`/automation-rules/${id}`);
  }

  /**
   * Actualizar regla de automatización
   */
  async updateReglaAutomatizacion(id: number, reglaData: ReglaAutomatizacionRequestDTO): Promise<ReglaAutomatizacionResponseDTO> {
    return this.request(`/automation-rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(reglaData)
    });
  }

  /**
   * Eliminar regla de automatización
   */
  async deleteReglaAutomatizacion(id: number): Promise<ApiResponse> {
    return this.request(`/automation-rules/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Activar/Desactivar regla
   */
  async toggleReglaAutomatizacion(id: number): Promise<ReglaAutomatizacionResponseDTO> {
    return this.request(`/automation-rules/${id}/toggle`, {
      method: 'PATCH'
    });
  }

  /**
   * Buscar reglas con filtros
   */
  async buscarReglasAutomatizacion(filtros: {
    nombre?: string;
    activa?: boolean;
    prioridad?: number;
    page?: number;
    size?: number;
  }): Promise<PageResponse<ReglaAutomatizacionResponseDTO>> {
    const params = new URLSearchParams();
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.activa !== undefined) params.append('activa', filtros.activa.toString());
    if (filtros.prioridad) params.append('prioridad', filtros.prioridad.toString());
    if (filtros.page !== undefined) params.append('page', filtros.page.toString());
    if (filtros.size !== undefined) params.append('size', filtros.size.toString());
    
    return this.request(`/automation-rules/buscar?${params.toString()}`);
  }

  /**
   * Obtener estadísticas de reglas
   */
  async getEstadisticasReglas(): Promise<any> {
    return this.request('/automation-rules/estadisticas');
  }

  /**
   * Ejecutar todas las reglas
   */
  async ejecutarReglas(): Promise<ApiResponse> {
    return this.request('/automation-rules/ejecutar', {
      method: 'POST'
    });
  }

  /**
   * Ejecutar regla específica
   */
  async ejecutarRegla(id: number): Promise<ApiResponse> {
    return this.request(`/automation-rules/${id}/ejecutar`, {
      method: 'POST'
    });
  }

  // ========== MONITOREO DE SLA ==========

  /**
   * Obtener estadísticas de monitoreo de SLA
   */
  async getSLAMonitoringStats(): Promise<{
    data: {
      totalTicketsActivos: number;
      ticketsVencidos: number;
      ticketsProximosVencer: number;
      ticketsEnTiempo: number;
      ticketsSinSLA: number;
      porcentajeCumplimiento: number;
      ultimaVerificacion: string;
    }
  }> {
    return this.request('/sla/monitoring/stats');
  }

  /**
   * Ejecutar verificación manual de SLA
   */
  async executeSLAMonitoringCheck(): Promise<{
    data: {
      exito: boolean;
      mensaje: string;
      estadisticas: any;
      timestamp: string;
    }
  }> {
    return this.request('/sla/monitoring/execute', {
      method: 'POST'
    });
  }

  /**
   * Obtener tickets con SLA vencido
   */
  async getSLATicketsExpired(): Promise<{
    data: Array<{
      id: number;
      titulo: string;
      creadorNombre: string;
      estado: string;
      fechaCreacion: string;
      slaStatus: any;
    }>
  }> {
    return this.request('/sla/monitoring/expired');
  }

  /**
   * Obtener tickets próximos a vencer
   */
  async getSLATicketsExpiring(): Promise<{
    data: Array<{
      id: number;
      titulo: string;
      creadorNombre: string;
      estado: string;
      fechaCreacion: string;
      slaStatus: any;
    }>
  }> {
    return this.request('/sla/monitoring/expiring');
  }

}

// Exportar instancia única del cliente API
export const api = new ApiClient();