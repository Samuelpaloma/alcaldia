import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { logout } from "../auth/auth";
import "./AppLayout.css";

export default function ClientLayout() {
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const onLogout = () => { logout(); navigate("/login", { replace: true }); };
  return (
    <div className="app-container grid md:grid-cols-[240px_1fr]">
      <aside className="hidden md:flex md:flex-col md:h-screen md:sticky md:top-0 border-r bg-background">
        <div className="h-16 flex items-center justify-between px-4 border-b gap-2">
          <Link to="/client" className="font-extrabold tracking-tight text-xl">NEITickets</Link>
          <div className="flex items-center gap-2">
            <select aria-label="language" value={locale} onChange={(e)=>setLocale(e.target.value as any)} className="h-8 rounded-md border px-2 text-xs bg-background">
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
        <nav className="p-3 space-y-6 overflow-y-auto">
          <div>
            <div className="nav-section">{t("nav.client_section")}</div>
            <div className="grid gap-1">
              <NavLink to="/client/create" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("client.create_ticket")}</NavLink>
              <NavLink to="/client/tracking" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("client.tracking")}</NavLink>
              <NavLink to="/client/history" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("client.history")}</NavLink>
              <NavLink to="/logout" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("auth.logout")}</NavLink>
            </div>
          </div>
        </nav>
      </aside>

      <header className="md:hidden app-header border-b bg-background/70">
        <div className="px-4 h-16 flex items-center gap-4 justify-between">
          <Link to="/client" className="font-extrabold tracking-tight text-xl">{t("brand.name")}</Link>
          <div className="flex items-center gap-2">
            <select aria-label="language" value={locale} onChange={(e)=>setLocale(e.target.value as any)} className="h-9 rounded-md border px-2 text-sm bg-background">
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
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
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <nav className="md:hidden bg-background border-b shadow-lg">
          <div className="p-4 space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">{t("nav.client_section")}</div>
              <div className="space-y-2">
                <NavLink 
                  to="/client/create" 
                  className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-gray-100 transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("client.create_ticket")}
                </NavLink>
                <NavLink 
                  to="/client/tracking" 
                  className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-gray-100 transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("client.tracking")}
                </NavLink>
                <NavLink 
                  to="/client/history" 
                  className={({isActive}) => `block py-2 px-3 rounded-md text-sm hover:bg-gray-100 transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("client.history")}
                </NavLink>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="block w-full text-left py-2 px-3 rounded-md text-sm hover:bg-gray-100 transition-colors text-red-600"
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
    </div>
  );
}
