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

  // ========== AUTENTICACIÓN ==========

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

  // ========== TICKETS ==========

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
    return this.request(`/tickets/${ticketId}/comentarios`);
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

  // ========== USUARIOS ==========

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

  // ========== CATEGORÍAS ==========

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

  // ========== EVIDENCIAS ==========

  async getEvidenciasPorTicket(ticketId: number): Promise<any[]> {
    return this.request(`/evidencias/ticket/${ticketId}`);
  }

  async subirEvidencia(ticketId: number, archivo: File, descripcion: string): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('ticketId', ticketId.toString());
    formData.append('archivo', archivo);
    formData.append('descripcion', descripcion);
    
    return this.request('/evidencias/subir', {
      method: 'POST',
      body: formData
    });
  }

  async descargarEvidencia(ticketId: number, nombreArchivo: string): Promise<any> {
    return this.request(`/evidencias/descargar/${ticketId}/${encodeURIComponent(nombreArchivo)}`);
  }

  // ========== NOTIFICACIONES ==========

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

  // ========== ASIGNACIONES ==========

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
    return this.request(`/tickets/${ticketId}/comentarios`, {
      method: 'POST',
      body: JSON.stringify({ mensaje })
    });
  }

  // ========== TÉCNICOS ==========

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

  // ========== ADMINISTRADORES ==========

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

  // ========== SUPERADMIN ==========

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

  // ========== REGLAS DE AUTOMATIZACIÓN ==========

  async getReglasAutomatizacion(page: number = 0, size: number = 20): Promise<ReglaAutomatizacionResponseDTO[]> {
    return this.request(`/automation-rules?page=${page}&size=${size}`);
  }

  async getReglasActivas(): Promise<ReglaAutomatizacionResponseDTO[]> {
    return this.request('/automation-rules/activas');
  }

  async createReglaAutomatizacion(reglaData: ReglaAutomatizacionRequestDTO): Promise<ReglaAutomatizacionResponseDTO> {
    return this.request('/automation-rules', {
      method: 'POST',
      body: JSON.stringify(reglaData)
    });
  }

  async getReglaAutomatizacion(id: number): Promise<ReglaAutomatizacionResponseDTO> {
    return this.request(`/automation-rules/${id}`);
  }

  async updateReglaAutomatizacion(id: number, reglaData: ReglaAutomatizacionRequestDTO): Promise<ReglaAutomatizacionResponseDTO> {
    return this.request(`/automation-rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(reglaData)
    });
  }

  async deleteReglaAutomatizacion(id: number): Promise<ApiResponse> {
    return this.request(`/automation-rules/${id}`, {
      method: 'DELETE'
    });
  }

  async toggleReglaAutomatizacion(id: number): Promise<ReglaAutomatizacionResponseDTO> {
    return this.request(`/automation-rules/${id}/toggle`, {
      method: 'PATCH'
    });
  }

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

  async getEstadisticasReglas(): Promise<any> {
    return this.request('/automation-rules/estadisticas');
  }

  async ejecutarReglas(): Promise<ApiResponse> {
    return this.request('/automation-rules/ejecutar', {
      method: 'POST'
    });
  }

  async ejecutarRegla(id: number): Promise<ApiResponse> {
    return this.request(`/automation-rules/${id}/ejecutar`, {
      method: 'POST'
    });
  }

}

// Exportar instancia única del cliente API
export const api = new ApiClient();

