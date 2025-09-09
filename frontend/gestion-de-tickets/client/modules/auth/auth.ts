export type Role = "admin" | "client";
export type AuthState = { email: string; role: Role } | null;

const KEY = "auth_state";

export function getAuth(): AuthState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
}

export function setAuth(state: AuthState) {
  if (state) localStorage.setItem(KEY, JSON.stringify(state));
  else localStorage.removeItem(KEY);
}

export function logout() {
  setAuth(null);
}

export function detectRoleByEmail(email: string): Role {
  const lower = email.toLowerCase();
  const [, domain = ""] = lower.split("@");
  if (lower.includes("@admin")) return "admin";
  if (domain === "adminempresa.com") return "admin";
  if (domain === "empresa.com") return "client";
  // default: treat as client unless explicit admin pattern
  return "client";
}
