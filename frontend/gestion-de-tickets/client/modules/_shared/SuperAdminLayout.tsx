import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { logout } from "../auth/auth";
import "./AppLayout.css";

export default function SuperAdminLayout() {
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Configurar título de la página
  useEffect(() => {
    document.title = 'NEITickets - Super Administrador';
  }, []);
  
  const onLogout = () => { logout(); navigate("/login", { replace: true }); };
  
  return (
    <div className="app-container grid md:grid-cols-[240px_1fr]">
      <aside className="hidden md:flex md:flex-col md:h-screen md:sticky md:top-0 border-r bg-background">
        <div className="h-16 flex items-center justify-between px-4 border-b gap-2">
          <Link to="/superadmin" className="font-extrabold tracking-tight text-xl">{t("brand.name")}</Link>
          <div className="flex items-center gap-2">
            <select aria-label="language" value={locale} onChange={(e)=>setLocale(e.target.value as any)} className="h-8 rounded-md border px-2 text-xs bg-background">
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
        <nav className="p-3 space-y-6 overflow-y-auto">
          <div>
            <div className="nav-section">SUPERADMIN</div>
            <div className="grid gap-1">
              <NavLink to="/superadmin" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="fas fa-tachometer-alt mr-2"></i>
                Dashboard
              </NavLink>
              <NavLink to="/superadmin/administradores" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="fas fa-users-cog mr-2"></i>
                Administradores
              </NavLink>
              <NavLink to="/superadmin/configuraciones" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="fas fa-palette mr-2"></i>
                Colores del Sistema
              </NavLink>
              <NavLink to="/logout" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <i className="fas fa-sign-out-alt mr-2"></i>
                {t("auth.logout")}
              </NavLink>
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
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/superadmin" className="font-extrabold tracking-tight text-xl">{t("brand.name")}</Link>
          </div>
          <div className="flex items-center gap-2">
            <select aria-label="language" value={locale} onChange={(e)=>setLocale(e.target.value as any)} className="h-8 rounded-md border px-2 text-xs bg-background">
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <i className="fas fa-sign-out-alt mr-2"></i>
              {t("auth.logout")}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-extrabold tracking-tight text-xl">{t("brand.name")}</h2>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="space-y-4">
              <div>
                <div className="nav-section">SUPERADMIN</div>
                <div className="grid gap-1 mt-2">
                  <NavLink to="/superadmin" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                    <i className="fas fa-tachometer-alt mr-2"></i>
                    Dashboard
                  </NavLink>
                  <NavLink to="/superadmin/administradores" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                    <i className="fas fa-users-cog mr-2"></i>
                    Administradores
                  </NavLink>
                  <NavLink to="/superadmin/configuraciones" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                    <i className="fas fa-palette mr-2"></i>
                    Colores del Sistema
                  </NavLink>
                  <NavLink to="/logout" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    {t("auth.logout")}
                  </NavLink>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
