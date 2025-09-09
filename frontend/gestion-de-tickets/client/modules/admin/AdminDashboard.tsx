import "./AdminDashboard.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";

export default function AdminDashboard() {
  const { t } = useI18n();
  const links = [
    { to: "/tickets", label: t("nav.tickets") },
    { to: "/users-roles", label: t("nav.users_roles") },
    { to: "/notifications", label: t("nav.notifications") },
    { to: "/metrics", label: t("nav.metrics") },
    { to: "/ai-classification", label: t("nav.ai_classification") },
  ];
  return (
    <div className="section grid gap-6">
      <div>
        <h1 className="page-title">{t("admin.title")}</h1>
        <p className="page-subtitle">{t("admin.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((l) => (
          <Card key={l.to} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">{l.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link to={l.to} className="inline-block nav-link active">{t("admin.open")}</Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
