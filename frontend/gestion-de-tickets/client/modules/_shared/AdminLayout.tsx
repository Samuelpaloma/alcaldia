import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Bell, Settings, LogOut } from "lucide-react";
import { logout, getAuth } from "../auth/auth";
import { UnifiedNotificationsModal } from "../notifications/UnifiedNotificationsModal";
import SettingsModal from "../system_configuration/SettingsModal";
import LogoutModal from "../auth/LogoutModal";
import { useRoleNotifications } from "@/hooks/use-role-notifications";
import { useUserInfo } from "@/hooks/use-user-info";
import NotificationSystem from "../../components/NotificationSystem";
import SystemColorLoader from "../../components/SystemColorLoader";
import "./AppLayout.css";

export default function AdminLayout() {
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const { userInfo } = useUserInfo();
  const userEmail = userInfo?.email || '';
  const userRole = userInfo?.tipoUsuario?.toLowerCase() || '';
  const { unreadCount } = useRoleNotifications(userEmail, userRole);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Escuchar evento para abrir modal desde toast
  useEffect(() => {
    const handleOpenModal = () => {
      console.log('🔔 AdminLayout: Recibido evento para abrir modal de notificaciones');
      setShowNotifications(true);
    };

    window.addEventListener('openNotificationsModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openNotificationsModal', handleOpenModal);
    };
  }, []);
  
  const auth = getAuth();
  const userName = auth?.user?.name || t("auth.user");
  
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
              <NavLink to="/admin" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("admin.dashboard")}</NavLink>
              <NavLink to="/tickets" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("admin.tickets_management")}</NavLink>
              <NavLink to="/users-roles" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("admin.users_management")}</NavLink>
              <NavLink to="/categories" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("admin.categories")}</NavLink>
              {/* Módulos especializados */}
              <NavLink to="/automation-rules" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("admin.automation_rules")}</NavLink>
              <NavLink to="/sla-configuration" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("admin.sla_configuration")}</NavLink>
              <NavLink to="/analytics" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("admin.analytics")}</NavLink>
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/admin" className="font-extrabold tracking-tight text-xl">{t("brand.name")}</Link>
          </div>
          <div className="flex items-center gap-2">
            <select aria-label="language" value={locale} onChange={(e)=>setLocale(e.target.value as any)} className="h-8 rounded-md border px-2 text-xs bg-background">
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              {t("auth.logout")}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b bg-background">
          <nav className="p-4 space-y-2">
            <div className="nav-section">{t("nav.admin_section")}</div>
            <div className="grid gap-1">
              <NavLink to="/admin" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>{t("admin.dashboard")}</NavLink>
              <NavLink to="/tickets" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>{t("admin.tickets_management")}</NavLink>
              <NavLink to="/users-roles" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>{t("admin.users_management")}</NavLink>
              <NavLink to="/categories" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>{t("admin.categories")}</NavLink>
              <NavLink to="/automation-rules" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>{t("admin.automation_rules")}</NavLink>
              <NavLink to="/sla-configuration" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>{t("admin.sla_configuration")}</NavLink>
              <NavLink to="/analytics" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>{t("admin.analytics")}</NavLink>
              <NavLink to="/evidences" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>{t("admin.evidences")}</NavLink>
              <NavLink to="/logout" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>{t("auth.logout")}</NavLink>
            </div>
          </nav>
        </div>
      )}

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      
      {/* Botones flotantes en la esquina superior derecha - solo en desktop */}
      <div className="hidden md:flex fixed top-6 right-6 flex items-center gap-2 z-50">
        <button 
          aria-label="Notifications" 
          onClick={() => setShowNotifications(true)}
          className="p-2 hover:bg-muted rounded-md transition-colors bg-card shadow-lg border border-border relative"
        >
          <Bell className="w-5 h-5 text-foreground" />
          {/* Indicador de notificaciones no leídas */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button 
          aria-label="Settings" 
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-muted rounded-md transition-colors bg-card shadow-lg border border-border"
        >
          <Settings className="w-5 h-5 text-foreground" />
        </button>
        <button 
          aria-label="Logout" 
          onClick={() => setShowLogout(true)}
          className="p-2 hover:bg-muted rounded-md transition-colors text-red-500 bg-card shadow-lg border border-border"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Modales */}
        {showNotifications && (
          <UnifiedNotificationsModal 
            key={`admin-notifications-${userEmail}-${Date.now()}`}
            isOpen={showNotifications} 
            onClose={() => setShowNotifications(false)}
            userEmail={userEmail}
            userRole={userRole}
          />
        )}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      <LogoutModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={onLogout}
        userName={userName}
      />
      
      {/* Sistema de notificaciones toast en tiempo real - Integrado en GlobalWebSocket */}
      <SystemColorLoader />
    </div>
  );
}