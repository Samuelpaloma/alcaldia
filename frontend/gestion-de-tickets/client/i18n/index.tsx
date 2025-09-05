import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "es";

type Dict = Record<string, string>;

type I18nContextType = {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (l: Locale) => void;
};

const I18nContext = createContext<I18nContextType | null>(null);

const DICTS: Record<Locale, Dict> = {
  en: {
    "brand.name": "TicketFlow",
    "nav.tickets": "Tickets",
    "nav.users_roles": "Users & Roles",
    "nav.notifications": "Notifications",
    "nav.evidences": "Evidences",
    "nav.system_configuration": "System Config",
    "nav.assignment_rules": "Assignment Rules",
    "nav.tickets_history": "Tickets History",
    "nav.metrics": "Metrics",
    "nav.ai_classification": "AI Classification",
    "nav.client_section": "Client",
    "nav.admin_section": "Admin",
    "nav.auth_section": "Access",
    "nav.client_dashboard": "Client Dashboard",
    "nav.admin_dashboard": "Admin Dashboard",
    "nav.login": "Login",
    "nav.register": "Register",
    "tickets.title": "Tickets Management",
    "tickets.subtitle": "Create, assign and track support tickets.",
    "tickets.search_placeholder": "Search tickets...",
    "tickets.status": "Status",
    "tickets.priority": "Priority",
    "tickets.new": "New Ticket",
    "tickets.table.id": "ID",
    "tickets.table.subject": "Subject",
    "tickets.table.requester": "Requester",
    "tickets.table.status": "Status",
    "tickets.table.priority": "Priority",
    "tickets.table.updated": "Updated",
    "tickets.status.open": "Open",
    "tickets.status.in_progress": "In Progress",
    "tickets.status.resolved": "Resolved",
    "tickets.priority.low": "Low",
    "tickets.priority.medium": "Medium",
    "tickets.priority.high": "High",
    "filters": "Filters",

    "auth.login_title": "Login",
    "auth.register_title": "Register",
    "auth.email": "Corporate email",
    "auth.email_placeholder": "name@company.com",
    "auth.password": "Password",
    "auth.password_placeholder": "••••••••",
    "auth.continue": "Continue",
    "auth.send_code": "Send verification code",
    "auth.code": "Verification code",
    "auth.code_placeholder": "Enter the code",
    "auth.verify_and_login": "Verify and login",
    "auth.verify_and_register": "Verify and register",
    "auth.no_account": "Don't have an account?",
    "auth.register_here": "Register here",
    "auth.have_account": "Already have an account?",
    "auth.login_here": "Login here",
    "auth.code_hint": "Demo: enter 123456",
    "auth.error_code_incorrect": "Incorrect code. Use 123456.",
    "auth.code_sent": "A verification code has been sent to your email.",
    "auth.error_corporate_email": "Please use a valid corporate email.",
    "auth.error_password_required": "Password is required.",
    "auth.error_code_invalid": "Enter a valid code.",
    "auth.login_success": "Login successful.",
    "auth.register_success": "Registration successful.",
    "auth.logout": "Logout",
    "auth.signed_out": "Signed out.",

    "client.title": "Client Dashboard",
    "client.subtitle": "Create new tickets and track your requests.",
    "client.create_ticket": "Create Ticket",
    "client.create_ticket_panel": "Create Ticket",
    "client.create_ticket_desc": "Fill the form to open a support request.",
    "client.subject_placeholder": "Subject",
    "client.description_placeholder": "Short description",
    "client.submit_ticket": "Submit ticket",
    "client.ticket_created": "Ticket created",
    "client.ticket_id": "Ticket",
    "client.my_tickets": "My tickets",
    "client.table.subject": "Subject",
    "client.table.status": "Status",
    "client.table.created": "Created",
    "client.history": "Tickets history",
    "client.profile": "My profile",
    "client.tracking": "Ticket tracking",
    "client.tracking_title": "Ticket tracking",
    "client.tracking_desc": "See live updates and communicate with support.",
    "client.select_ticket": "Select a ticket",
    "client.ticket_info": "Ticket info",
    "client.activity": "Activity",
    "client.comment_placeholder": "Write a comment...",
    "client.send": "Send",
    "client.reopen": "Reopen",

    "admin.title": "Admin Dashboard",
    "admin.subtitle": "Manage tickets, users, rules and more.",
    "admin.open": "Open",

    "placeholder.title": "Coming soon",
    "placeholder.desc": "This section will be implemented next. Use the chat to request details.",
    "lang": "EN",
  },
  es: {
    "brand.name": "TicketFlow",
    "nav.tickets": "Tickets",
    "nav.users_roles": "Usuarios y Roles",
    "nav.notifications": "Notificaciones",
    "nav.evidences": "Evidencias",
    "nav.system_configuration": "Configuración",
    "nav.assignment_rules": "Reglas de Asignación",
    "nav.tickets_history": "Historial",
    "nav.metrics": "Métricas",
    "nav.ai_classification": "Clasificación IA",
    "nav.client_section": "Cliente",
    "nav.admin_section": "Administración",
    "nav.auth_section": "Acceso",
    "nav.client_dashboard": "Panel de Cliente",
    "nav.admin_dashboard": "Panel de Administración",
    "nav.login": "Iniciar sesión",
    "nav.register": "Registrarse",
    "tickets.title": "Gestión de Tickets",
    "tickets.subtitle": "Crea, asigna y da seguimiento a los tickets de soporte.",
    "tickets.search_placeholder": "Buscar tickets...",
    "tickets.status": "Estado",
    "tickets.priority": "Prioridad",
    "tickets.new": "Nuevo Ticket",
    "tickets.table.id": "ID",
    "tickets.table.subject": "Asunto",
    "tickets.table.requester": "Solicitante",
    "tickets.table.status": "Estado",
    "tickets.table.priority": "Prioridad",
    "tickets.table.updated": "Actualizado",
    "tickets.status.open": "Abierto",
    "tickets.status.in_progress": "En Progreso",
    "tickets.status.resolved": "Resuelto",
    "tickets.priority.low": "Baja",
    "tickets.priority.medium": "Media",
    "tickets.priority.high": "Alta",
    "filters": "Filtros",

    "auth.login_title": "Iniciar sesión",
    "auth.register_title": "Registro",
    "auth.email": "Correo empresarial",
    "auth.email_placeholder": "nombre@empresa.com",
    "auth.password": "Contraseña",
    "auth.password_placeholder": "••••••••",
    "auth.continue": "Continuar",
    "auth.send_code": "Enviar código de verificación",
    "auth.code": "Código de verificación",
    "auth.code_placeholder": "Ingresa el código",
    "auth.verify_and_login": "Verificar e ingresar",
    "auth.verify_and_register": "Verificar y registrar",
    "auth.no_account": "¿No tienes cuenta?",
    "auth.register_here": "Regístrate aquí",
    "auth.have_account": "¿Ya tienes cuenta?",
    "auth.login_here": "Inicia sesión aquí",
    "auth.code_hint": "Demo: ingresa 123456",
    "auth.error_code_incorrect": "Código incorrecto. Usa 123456.",
    "auth.code_sent": "Se ha enviado un código de verificación a tu correo.",
    "auth.error_corporate_email": "Usa un correo empresarial válido.",
    "auth.error_password_required": "La contraseña es obligatoria.",
    "auth.error_code_invalid": "Ingresa un código válido.",
    "auth.login_success": "Inicio de sesión exitoso.",
    "auth.register_success": "Registro exitoso.",
    "auth.logout": "Cerrar sesión",
    "auth.signed_out": "Sesión cerrada.",

    "client.title": "Panel de Cliente",
    "client.subtitle": "Crea nuevos tickets y consulta su estado.",
    "client.create_ticket": "Crear Ticket",
    "client.create_ticket_panel": "Crear Ticket",
    "client.create_ticket_desc": "Completa el formulario para abrir un ticket.",
    "client.subject_placeholder": "Asunto",
    "client.description_placeholder": "Descripción breve",
    "client.submit_ticket": "Enviar ticket",
    "client.ticket_created": "Ticket creado",
    "client.ticket_id": "Ticket",
    "client.my_tickets": "Mis tickets",
    "client.table.subject": "Asunto",
    "client.table.status": "Estado",
    "client.table.created": "Creado",
    "client.history": "Historial de tickets",
    "client.profile": "Mi perfil",
    "client.tracking": "Seguimiento de ticket",
    "client.tracking_title": "Seguimiento de ticket",
    "client.tracking_desc": "Visualiza actualizaciones en tiempo real y comunica al soporte.",
    "client.select_ticket": "Selecciona un ticket",
    "client.ticket_info": "Información del ticket",
    "client.activity": "Actividad",
    "client.comment_placeholder": "Escribe un comentario...",
    "client.send": "Enviar",
    "client.reopen": "Reabrir",

    "admin.title": "Panel de Administración",
    "admin.subtitle": "Gestiona tickets, usuarios, reglas y más.",
    "admin.open": "Abrir",

    "placeholder.title": "Próximamente",
    "placeholder.desc": "Esta sección se implementará a continuación. Usa el chat para solicitar detalles.",
    "lang": "ES",
  }
};

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(() => (localStorage.getItem("locale") as Locale) || "es");

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem("locale", l);
    setLocaleState(l);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("locale") as Locale | null;
    if (stored && stored !== locale) setLocaleState(stored);
  }, []);

  const dict = useMemo(() => DICTS[locale], [locale]);
  const t = useCallback((key: string) => dict[key] ?? key, [dict]);

  const value = useMemo(() => ({ locale, t, setLocale }), [locale, t, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
