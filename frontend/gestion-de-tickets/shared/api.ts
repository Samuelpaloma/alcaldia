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

// Tipos para tickets
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  attachments?: File[];
}

export interface CreateTicketResponse {
  success: boolean;
  ticketId: string;
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

  constructor() {
    this.baseUrl = 'http://localhost:8080/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      // Intentar parsear la respuesta como JSON
      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = { message: 'Error al parsear respuesta del servidor' };
      }

      // Si la respuesta no es exitosa, lanzar error con el mensaje del backend
      if (!response.ok) {
        throw new Error(responseData.message || `Error ${response.status}`);
      }

      return responseData;
    } catch (error) {
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

  // Tickets
  async getTickets(): Promise<Ticket[]> {
    return this.request('/tickets');
  }

  async getTicket(id: string): Promise<Ticket> {
    return this.request(`/tickets/${id}`);
  }

  async createTicket(data: CreateTicketRequest): Promise<CreateTicketResponse> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('priority', data.priority);
    formData.append('category', data.category);
    
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    return this.request('/tickets', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  async updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket> {
    return this.request(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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
}

// Exportar instancia única del cliente API
export const api = new ApiClient();