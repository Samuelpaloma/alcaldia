import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { logout } from "../auth/auth";
import "./AppLayout.css";

export default function AdminLayout() {
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
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
            <Button size="sm" variant="outline" onClick={onLogout}>{t("auth.logout")}</Button>
          </div>
        </div>
        <nav className="p-3 space-y-6 overflow-y-auto">
          <div>
            <div className="nav-section">{t("nav.admin_section")}</div>
            <div className="grid gap-1">
              <NavLink to="/admin" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.admin_dashboard")}</NavLink>
              <NavLink to="/tickets" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.tickets")}</NavLink>
              <NavLink to="/users-roles" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.users_roles")}</NavLink>
              <NavLink to="/notifications" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.notifications")}</NavLink>
              <NavLink to="/evidences" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.evidences")}</NavLink>
              <NavLink to="/system-configuration" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.system_configuration")}</NavLink>
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
          <Link to="/admin" className="font-extrabold tracking-tight text-xl">{t("brand.name")}</Link>
          <div className="flex items-center gap-2">
            <select aria-label="language" value={locale} onChange={(e)=>setLocale(e.target.value as any)} className="h-9 rounded-md border px-2 text-sm bg-background">
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
            <Button variant="outline" onClick={onLogout}>{t("auth.logout")}</Button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
      <footer className="border-t text-center text-xs text-muted-foreground py-6 md:col-span-2">© {new Date().getFullYear()} {t("brand.name")}</footer>
    </div>
  );
}
