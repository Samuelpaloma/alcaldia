import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useI18n } from "@/i18n";
import { Bell, Settings, LogOut, X } from "lucide-react";
import { logout, getAuth } from "../auth/auth";
import SettingsModal from "../system_configuration/SettingsModal";
import LogoutModal from "../auth/LogoutModal";
import { useSettings } from "@/hooks/use-settings";
import { useUserProfile } from "@/hooks/use-user-profile";
import { UnifiedNotificationsModal } from "../notifications/UnifiedNotificationsModal";
import { useRoleNotifications } from "@/hooks/use-role-notifications";
import { useUserInfo } from "@/hooks/use-user-info";
import NotificationSystem from "../../components/NotificationSystem";
import SystemColorLoader from "../../components/SystemColorLoader";
import "./AppLayout.css";

export default function ClientLayout() {
  const { t, locale, setLocale } = useI18n();
  const { settings, updateSetting } = useSettings();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const { userInfo } = useUserInfo();
  const userEmail = userInfo?.email || '';
  const userRole = userInfo?.tipoUsuario?.toLowerCase() || '';
  const { unreadCount } = useRoleNotifications(userEmail, userRole);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Escuchar evento para abrir modal desde toast
  useEffect(() => {
    const handleOpenModal = () => {
      console.log('🔔 ClientLayout: Recibido evento para abrir modal de notificaciones');
      setShowNotifications(true);
    };

    window.addEventListener('openNotificationsModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openNotificationsModal', handleOpenModal);
    };
  }, []);
  
  const auth = getAuth();
  const userName = auth?.user?.name || t("auth.user");
  
  // Obtener nombre completo del usuario desde el perfil
  const getUserDisplayName = () => {
    if (profile?.nombre && profile?.apellido) {
      return `${profile.nombre} ${profile.apellido}`;
    } else if (profile?.nombre) {
      return profile.nombre;
    } else if (auth?.user?.name) {
      return auth.user.name;
    }
    return "Usuario";
  };
  
  const userDisplayName = getUserDisplayName();
  
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-container grid md:grid-cols-[200px_1fr] bg-background min-h-screen">
      <aside className="hidden md:flex md:flex-col md:h-screen md:sticky md:top-0 border-r border-border bg-card">
            <div className="h-12 flex items-center justify-between px-3 border-b border-border gap-2">
              <Link to="/client" className="font-extrabold tracking-tight text-lg text-foreground">NEITickets</Link>
            </div>
        <nav className="p-2 space-y-4 overflow-y-auto">
          <div>
            <div className="nav-section text-xs text-muted-foreground mb-2">
              {profileLoading ? "Cargando..." : userDisplayName}
            </div>
            <div className="grid gap-1">
              <NavLink 
                to="/client" 
                end
                className={({isActive}) => `nav-link text-xs py-2 px-3 rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                {t("client.nav.dashboard")}
              </NavLink>
              <NavLink 
                to="/client/crear" 
                className={({isActive}) => `nav-link text-xs py-2 px-3 rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                {t("client.nav.create_ticket")}
              </NavLink>
              <NavLink 
                to="/client/seguimiento" 
                className={({isActive}) => `nav-link text-xs py-2 px-3 rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                {t("client.nav.tracking")}
              </NavLink>
              <NavLink 
                to="/client/historial" 
                className={({isActive}) => `nav-link text-xs py-2 px-3 rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                {t("client.nav.history")}
              </NavLink>
            </div>
          </div>
        </nav>
      </aside>

      <header className="md:hidden app-header border-b border-border bg-card relative">
        <div className="px-3 h-12 flex items-center gap-2 justify-between">
          <Link to="/client" className="font-extrabold tracking-tight text-lg text-foreground">{t("brand.name")}</Link>
          
              {/* Botones de acción en el header móvil */}
              <div className="flex items-center gap-1">
                <button 
                  aria-label="Notifications" 
                  onClick={() => setShowNotifications(true)}
                  className="p-2 hover:bg-muted rounded-md transition-colors relative"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button 
                  aria-label="Settings" 
                  onClick={() => setShowSettings(true)}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button 
                  aria-label="Logout" 
                  onClick={() => setShowLogout(true)} 
                  className="p-2 hover:bg-muted rounded-md transition-colors text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 hover:bg-muted rounded-md transition-colors ml-1"
                  aria-label="Toggle menu"
                >
                  <div className="w-5 h-4 flex flex-col justify-between">
                    <span className="block h-0.5 w-full bg-foreground"></span>
                    <span className="block h-0.5 w-full bg-foreground"></span>
                    <span className="block h-0.5 w-full bg-foreground"></span>
                  </div>
                </button>
              </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <nav className="md:hidden bg-card border-b border-border shadow-lg">
          <div className="p-3 space-y-3">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    {profileLoading ? "Cargando..." : userDisplayName}
                  </div>
                  <div className="space-y-1">
                    <NavLink
                      to="/client"
                      end
                      className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-muted transition-colors ${isActive ? 'bg-primary text-primary-foreground font-medium' : 'text-foreground'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("client.nav.dashboard")}
                    </NavLink>
                    <NavLink
                      to="/client/crear"
                      className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-muted transition-colors ${isActive ? 'bg-primary text-primary-foreground font-medium' : 'text-foreground'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("client.nav.create_ticket")}
                    </NavLink>
                    <NavLink
                      to="/client/seguimiento"
                      className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-muted transition-colors ${isActive ? 'bg-primary text-primary-foreground font-medium' : 'text-foreground'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("client.nav.tracking")}
                    </NavLink>
                    <NavLink
                      to="/client/historial"
                      className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-muted transition-colors ${isActive ? 'bg-primary text-primary-foreground font-medium' : 'text-foreground'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("client.nav.history")}
                    </NavLink>
                  </div>
                </div>
          </div>
        </nav>
      )}

          <main className="main-content bg-background text-foreground">
            <Outlet />
          </main>
          <footer className="border-t border-border text-center text-xs text-muted-foreground py-4 md:col-span-2 bg-card">© {new Date().getFullYear()} {t("brand.name")}</footer>
      
        {/* Botones flotantes en la esquina superior derecha - solo en desktop */}
        <div className="hidden md:flex fixed top-4 right-4 flex items-center gap-2 z-50">
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
            key={`client-notifications-${userEmail}-${Date.now()}`}
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
          onConfirm={handleLogout}
          userName={userName}
        />
        
        {/* Sistema de notificaciones toast en tiempo real */}
        <NotificationSystem 
          userEmail={userEmail} 
          userRole={userRole} 
        />
        <SystemColorLoader />
    </div>
  );
}