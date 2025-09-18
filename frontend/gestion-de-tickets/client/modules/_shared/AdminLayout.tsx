import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { logout } from "../auth/auth";
import "./AppLayout.css";

export default function AdminLayout() {
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const onLogout = () => { logout(); navigate("/login", { replace: true }); };
  return (
    <div className="app-container grid md:grid-cols-[240px_1fr]">
      <aside className="hidden md:flex md:flex-col md:h-screen md:sticky md:top-0 border-r bg-background">
        <div className="h-16 flex items-center justify-between px-4 border-b gap-2">
          <Link to="/admin" className="font-extrabold tracking-tight text-xl">{t("brand.name")}</Link>
          <div className="flex items-center gap-2">
            <select aria-label="language" value={locale} onChange={(e)=>setLocale(e.target.value as any)} className="h-8 rounded-md border px-2 text-xs bg-background">
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
        <nav className="p-3 space-y-6 overflow-y-auto">
          <div>
            <div className="nav-section">{t("nav.admin_section")}</div>
            <div className="grid gap-1">
              <NavLink to="/admin" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.admin_dashboard")}</NavLink>
              <NavLink to="/tickets" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.tickets")}</NavLink>
              <NavLink to="/users-roles" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.users_roles")}</NavLink>
              <NavLink to="/evidences" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.evidences")}</NavLink>
              <NavLink to="/assignment-rules" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.assignment_rules")}</NavLink>
              <NavLink to="/tickets-history" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.tickets_history")}</NavLink>
              <NavLink to="/metrics" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.metrics")}</NavLink>
              <NavLink to="/ai-classification" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.ai_classification")}</NavLink>
              <NavLink to="/logout" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("auth.logout")}</NavLink>
            </div>
          </div>
        </nav>
      </aside>

      <header className="md:hidden app-header border-b bg-background/70">
        <div className="px-4 h-16 flex items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className="block h-0.5 w-full bg-gray-600"></span>
                <span className="block h-0.5 w-full bg-gray-600"></span>
                <span className="block h-0.5 w-full bg-gray-600"></span>
              </div>
            </button>
            <Link to="/admin" className="font-extrabold tracking-tight text-xl">{t("brand.name")}</Link>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate("/notifications")}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Notifications"
              title="Notificaciones"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </button>
            <button 
              onClick={() => navigate("/system-configuration")}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Configuration"
              title="Configuración"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <nav className="md:hidden bg-background border-b shadow-lg">
          <div className="p-4 space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">{t("nav.admin_section")}</div>
              <div className="space-y-2">
                <NavLink 
                  to="/admin" 
                  className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-muted transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("nav.admin_dashboard")}
                </NavLink>
                <NavLink 
                  to="/tickets" 
                  className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-muted transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("nav.tickets")}
                </NavLink>
                <NavLink 
                  to="/users-roles" 
                  className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-muted transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("nav.users_roles")}
                </NavLink>
                <NavLink 
                  to="/evidences" 
                  className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-muted transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("nav.evidences")}
                </NavLink>
                <NavLink 
                  to="/assignment-rules" 
                  className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-muted transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("nav.assignment_rules")}
                </NavLink>
                <NavLink 
                  to="/tickets-history" 
                  className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-muted transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("nav.tickets_history")}
                </NavLink>
                <NavLink 
                  to="/metrics" 
                  className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-muted transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("nav.metrics")}
                </NavLink>
                <NavLink 
                  to="/ai-classification" 
                  className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-muted transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("nav.ai_classification")}
                </NavLink>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="block w-full text-left py-2 px-3 rounded-md text-sm hover:bg-muted transition-colors text-red-500"
                >
                  {t("auth.logout")}
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="main-content">
        <Outlet />
      </main>
      <footer className="border-t text-center text-xs text-muted-foreground py-6 md:col-span-2">© {new Date().getFullYear()} {t("brand.name")}</footer>
      
      {/* Botones flotantes solo en desktop */}
      <div className="hidden md:flex fixed bottom-6 right-6 flex-col gap-3 z-50">
        <button 
          onClick={() => navigate("/notifications")}
          className="w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          aria-label="Notifications"
          title="Notificaciones"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
        </button>
        <button 
          onClick={() => navigate("/system-configuration")}
          className="w-14 h-14 bg-muted hover:bg-muted/80 text-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          aria-label="Configuration"
          title="Configuración"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>
    </div>
  );
}