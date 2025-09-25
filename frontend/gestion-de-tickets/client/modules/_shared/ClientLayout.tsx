import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { Bell, Settings, LogOut, X } from "lucide-react";
import { logout, getAuth } from "../auth/auth";
import SettingsModal from "../system_configuration/SettingsModal";
import LogoutModal from "../auth/LogoutModal";
import { useSettings } from "@/hooks/use-settings";
import { useUserProfile } from "@/hooks/use-user-profile";
import NotificacionInteligenteModal from "../notifications/NotificacionInteligenteModal";
import "./AppLayout.css";

export default function ClientLayout() {
  const { t, locale, setLocale } = useI18n();
  const { settings, updateSetting } = useSettings();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  
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
                Dashboard
              </NavLink>
              <NavLink 
                to="/client/crear" 
                className={({isActive}) => `nav-link text-xs py-2 px-3 rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                Crear Ticket
              </NavLink>
              <NavLink 
                to="/client/seguimiento" 
                className={({isActive}) => `nav-link text-xs py-2 px-3 rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                Seguimiento de Ticket
              </NavLink>
              <NavLink 
                to="/client/historial" 
                className={({isActive}) => `nav-link text-xs py-2 px-3 rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                Historial de Tickets
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
                      Dashboard
                    </NavLink>
                    <NavLink
                      to="/client/crear"
                      className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-muted transition-colors ${isActive ? 'bg-primary text-primary-foreground font-medium' : 'text-foreground'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Crear Ticket
                    </NavLink>
                    <NavLink
                      to="/client/seguimiento"
                      className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-muted transition-colors ${isActive ? 'bg-primary text-primary-foreground font-medium' : 'text-foreground'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Seguimiento de Ticket
                    </NavLink>
                    <NavLink
                      to="/client/historial"
                      className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-muted transition-colors ${isActive ? 'bg-primary text-primary-foreground font-medium' : 'text-foreground'}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Historial de Tickets
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
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold">Notificaciones</h2>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
        <NotificacionInteligenteModal 
          isOpen={showNotifications} 
          onClose={() => setShowNotifications(false)} 
        />
              </div>
            </div>
          </div>
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
    </div>
  );
}