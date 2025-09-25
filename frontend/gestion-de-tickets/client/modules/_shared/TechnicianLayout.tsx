import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Bell, Settings, LogOut, Wrench, FileText, Upload, User } from "lucide-react";
import { logout, getAuth } from "../auth/auth";
import NotificationsModal from "../notifications/NotificationsModal";
import SettingsModal from "../system_configuration/SettingsModal";
import LogoutModal from "../auth/LogoutModal";
import "./AppLayout.css";

export default function TechnicianLayout() {
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  
  const auth = getAuth();
  const userName = auth?.user?.name || t("auth.user");
  
  const onLogout = () => { logout(); navigate("/login", { replace: true }); };
  
  return (
    <div className="app-container grid md:grid-cols-[240px_1fr]">
      <aside className="hidden md:flex md:flex-col md:h-screen md:sticky md:top-0 border-r bg-background">
        <div className="h-16 flex items-center justify-between px-4 border-b gap-2">
          <Link to="/technician" className="font-extrabold tracking-tight text-xl">{t("brand.name")}</Link>
          <div className="flex items-center gap-2">
            <select aria-label="language" value={locale} onChange={(e)=>setLocale(e.target.value as any)} className="h-8 rounded-md border px-2 text-xs bg-background">
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
        <nav className="p-3 space-y-6 overflow-y-auto">
          <div>
            <div className="nav-section">Panel de Técnico</div>
            <div className="grid gap-1">
              <NavLink to="/technician" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <Wrench className="h-4 w-4" />
                Mis Tickets
              </NavLink>
              <NavLink to="/technician/evidences" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <Upload className="h-4 w-4" />
                Evidencias
              </NavLink>
              <NavLink to="/logout" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <LogOut className="h-4 w-4" />
                {t("auth.logout")}
              </NavLink>
            </div>
          </div>
        </nav>
      </aside>

      <header className="md:hidden app-header border-b bg-background/70">
        <div className="flex items-center justify-between px-4 h-16">
          <Link to="/technician" className="font-extrabold tracking-tight text-xl">{t("brand.name")}</Link>
          <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
        {isMobileMenuOpen && (
          <nav className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="p-3 space-y-1">
              <NavLink to="/technician" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                <Wrench className="h-4 w-4" />
                Mis Tickets
              </NavLink>
              <NavLink to="/technician/evidences" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                <Upload className="h-4 w-4" />
                Evidencias
              </NavLink>
              <NavLink to="/logout" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                <LogOut className="h-4 w-4" />
                {t("auth.logout")}
              </NavLink>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 overflow-auto">
        <div className="h-16 flex items-center justify-between px-4 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Panel de Técnico</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowNotifications(true)}>
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-muted">
              <span className="text-sm font-medium">{userName}</span>
              <Button variant="ghost" size="sm" onClick={() => setShowLogout(true)}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showLogout && <LogoutModal onClose={() => setShowLogout(false)} onConfirm={onLogout} />}
    </div>
  );
}
