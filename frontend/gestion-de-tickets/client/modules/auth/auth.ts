export type Role = "admin" | "client" | "superadmin";

export interface UserInfo {
  userId: number;
  nombre: string;
  apellido: string;
  tipoUsuario: string;
  require2fa: boolean;
}

// Estado de autenticación simplificado - solo token JWT
export interface AuthState {
  token: string;
  user?: {
    id: string;
    email: string;
    role: Role;
    name: string;
  };
}

export type AuthStateOrNull = AuthState | null;

const TOKEN_KEY = "jwt_token";
const USER_KEY = "user_info";
const OLD_AUTH_KEY = "auth_state"; // Clave antigua para limpiar

/**
 * Obtiene el estado de autenticación (solo token JWT)
 */
export function getAuth(): AuthStateOrNull {
  try {
    // Limpiar datos antiguos si existen
    if (localStorage.getItem(OLD_AUTH_KEY)) {
      localStorage.removeItem(OLD_AUTH_KEY);
    }
    
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    const user = userStr ? JSON.parse(userStr) : undefined;
    
    return token ? { token, user } : null;
  } catch {
    return null;
  }
}

/**
 * Establece el estado de autenticación (solo token JWT)
 */
export function setAuth(state: AuthStateOrNull) {
  // Limpiar datos antiguos
  localStorage.removeItem(OLD_AUTH_KEY);
  
  if (state && state.token) {
    localStorage.setItem(TOKEN_KEY, state.token);
    if (state.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(state.user));
    }
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Actualizar token en ApiClient
  updateApiClientToken(state?.token || null);
}

/**
 * Actualiza el token en el ApiClient
 */
function updateApiClientToken(token: string | null) {
  // Importar dinámicamente para evitar dependencias circulares
  import('@shared/api').then(({ api }) => {
    api.setToken(token);
  }).catch(error => {
    console.warn('Error actualizando token en ApiClient:', error);
  });
}

export function logout() {
  setAuth(null);
}

/**
 * Limpia completamente el localStorage de datos de autenticación
 */
export function clearAllAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(OLD_AUTH_KEY);
  // Limpiar cualquier otra clave relacionada con auth
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

export function getToken(): string | null {
  const auth = getAuth();
  return auth?.token || null;
}

// Función eliminada - no necesaria para verificación básica

/**
 * Obtiene información del usuario desde el token JWT (decodificación básica)
 * Nota: Para mayor seguridad, esta información debería obtenerse del servidor
 */
export function getUserInfo(): UserInfo | null {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Decodificación básica del JWT (sin verificación de firma)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.userId || payload.sub,
      nombre: payload.nombre || '',
      apellido: payload.apellido || '',
      tipoUsuario: payload.tipoUsuario || 'FUNCIONARIO',
      require2fa: payload.require2fa || false
    };
  } catch {
    return null;
  }
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Si es un token mock (empieza con "mock-token"), siempre es válido
    if (token.startsWith("mock-token")) {
      return true;
    }
    
    // Para tokens JWT reales, verificar expiración
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false;
  }
}

/**
 * Función para hacer peticiones autenticadas
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Detecta el rol basado en el tipo de usuario del token o información almacenada
 */
export function detectRoleByToken(): Role {
  const auth = getAuth();
  
  // Si hay información de usuario almacenada, usarla
  if (auth?.user?.role) {
    return auth.user.role;
  }
  
  // Intentar extraer el rol del token JWT
  const token = getToken();
  if (token && !token.startsWith("mock-token")) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const tipoUsuario = payload.tipoUsuario?.toUpperCase();
      
      if (tipoUsuario === "SUPERADMIN") {
        return "superadmin";
      }
      if (tipoUsuario === "ADMINISTRADOR") {
        return "admin";
      }
      if (tipoUsuario === "TECNICO") {
        return "admin"; // Los técnicos también pueden acceder al panel de admin
      }
      if (tipoUsuario === "FUNCIONARIO" || tipoUsuario === "CLIENTE") {
        return "client";
      }
    } catch (error) {
      console.error('Error decodificando token JWT:', error);
    }
  }
  
  // Fallback al método anterior
  const userInfo = getUserInfo();
  if (!userInfo) return "client";
  
  const tipoUsuario = userInfo.tipoUsuario?.toUpperCase();
  if (tipoUsuario === "SUPERADMIN") {
    return "superadmin";
  }
  if (tipoUsuario === "ADMINISTRADOR") {
    return "admin";
  }
  return "client";
}

// Función para detectar rol por email (para compatibilidad)
export function detectRoleByEmail(email: string): Role {
  const lower = email.toLowerCase();
  const [, domain = ""] = lower.split("@");
  if (lower.includes("@admin")) return "admin";
  if (domain === "adminempresa.com") return "admin";
  if (domain === "empresa.com") return "client";
  // default: treat as client unless explicit admin pattern
  return "client";
}