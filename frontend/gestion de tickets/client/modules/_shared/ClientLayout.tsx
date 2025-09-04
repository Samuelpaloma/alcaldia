import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { logout } from "../auth/auth";
import "./AppLayout.css";

export default function ClientLayout() {
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const onLogout = () => { logout(); navigate("/login", { replace: true }); };
  return (
    <div className="app-container grid md:grid-cols-[240px_1fr]">
      <aside className="hidden md:flex md:flex-col md:h-screen md:sticky md:top-0 border-r bg-background">
        <div className="h-16 flex items-center justify-between px-4 border-b gap-2">
          <Link to="/client" className="font-extrabold tracking-tight text-xl">{t("brand.name")}</Link>
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
