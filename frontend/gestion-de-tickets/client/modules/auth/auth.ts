export type Role = "admin" | "client";

export interface UserInfo {
  userId: number;
  nombre: string;
  apellido: string;
  tipoUsuario: string;
  require2fa: boolean;
}

export interface AuthState {
  email: string;
  role: Role;
  token: string;
  userInfo: UserInfo;
}

export type AuthStateOrNull = AuthState | null;

const KEY = "auth_state";

export function getAuth(): AuthStateOrNull {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
}

export function setAuth(state: AuthStateOrNull) {
  if (state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  } else {
    localStorage.removeItem(KEY);
  }
}

export function logout() {
  setAuth(null);
}

export function getToken(): string | null {
  const auth = getAuth();
  return auth?.token || null;
}

// Función eliminada - no necesaria para verificación básica

export function getUserInfo(): UserInfo | null {
  const auth = getAuth();
  return auth?.userInfo || null;
}

// Función para hacer peticiones autenticadas (sin uso automático)
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

// Función para detectar rol basado en email (mantenida para compatibilidad)
export function detectRoleByEmail(email: string): Role {
  const lower = email.toLowerCase();
  const [, domain = ""] = lower.split("@");
  if (lower.includes("@admin")) return "admin";
  if (domain === "adminempresa.com") return "admin";
  if (domain === "empresa.com") return "client";
  // default: treat as client unless explicit admin pattern
  return "client";
}
