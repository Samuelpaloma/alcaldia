import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useState } from "react";
import "./AppLayout.css";

export default function AppLayout() {
  const { t, locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="app-container grid md:grid-cols-[240px_1fr]">
      <aside className="hidden md:flex md:flex-col md:h-screen md:sticky md:top-0 border-r bg-background">
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link to="/" className="font-extrabold tracking-tight text-xl">{t("brand.name")}</Link>
          <select aria-label="language" value={locale} onChange={(e)=>setLocale(e.target.value as any)} className="h-8 rounded-md border px-2 text-xs bg-background">
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </div>
        <nav className="p-3 space-y-6 overflow-y-auto">
          <div>
            <div className="nav-section">{t("nav.client_section")}</div>
            <div className="grid gap-1">
              <NavLink to="/client" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.client_dashboard")}</NavLink>
            </div>
          </div>
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
            </div>
          </div>
          <div>
            <div className="nav-section">{t("nav.auth_section")}</div>
            <div className="grid gap-1">
              <NavLink to="/login" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.login")}</NavLink>
              <NavLink to="/register" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.register")}</NavLink>
            </div>
          </div>
        </nav>
      </aside>

      <header className="md:hidden app-header border-b bg-background/70">
        <div className="px-4 h-16 flex items-center gap-4 justify-between">
          <Link to="/" className="font-extrabold tracking-tight text-xl" onClick={close}>{t("brand.name")}</Link>
          <div className="flex items-center gap-2">
            <select aria-label="language" value={locale} onChange={(e)=>setLocale(e.target.value as any)} className="h-9 rounded-md border px-2 text-sm bg-background">
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
            <Button variant="outline" onClick={()=>setOpen(v=>!v)}>Menu</Button>
          </div>
        </div>
        {open && (
          <div className="border-t bg-background">
            <div className="px-4 py-3 grid gap-1">
              <div className="nav-section">{t("nav.client_section")}</div>
              <NavLink to="/client" onClick={close} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.client_dashboard")}</NavLink>
              <div className="nav-section">{t("nav.admin_section")}</div>
              <NavLink to="/admin" onClick={close} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.admin_dashboard")}</NavLink>
              <NavLink to="/tickets" onClick={close} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.tickets")}</NavLink>
              <NavLink to="/users-roles" onClick={close} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.users_roles")}</NavLink>
              <NavLink to="/notifications" onClick={close} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.notifications")}</NavLink>
              <NavLink to="/evidences" onClick={close} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.evidences")}</NavLink>
              <NavLink to="/system-configuration" onClick={close} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.system_configuration")}</NavLink>
              <NavLink to="/assignment-rules" onClick={close} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.assignment_rules")}</NavLink>
              <NavLink to="/tickets-history" onClick={close} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.tickets_history")}</NavLink>
              <NavLink to="/metrics" onClick={close} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.metrics")}</NavLink>
              <NavLink to="/ai-classification" onClick={close} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.ai_classification")}</NavLink>
              <div className="nav-section">{t("nav.auth_section")}</div>
              <NavLink to="/login" onClick={close} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.login")}</NavLink>
              <NavLink to="/register" onClick={close} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{t("nav.register")}</NavLink>
            </div>
          </div>
        )}
      </header>

      <main className="main-content">
        <Outlet />
      </main>
      <footer className="border-t text-center text-xs text-muted-foreground py-6 md:col-span-2">© {new Date().getFullYear()} {t("brand.name")}</footer>
    </div>
  );
}
