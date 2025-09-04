import "./global.css";
import "./App.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import ClientLayout from "./modules/_shared/ClientLayout";
import AdminLayout from "./modules/_shared/AdminLayout";
import TicketsManagement from "./modules/tickets_management/TicketsManagement";
import UsersRoles from "./modules/users_roles/UsersRoles";
import Notifications from "./modules/notifications/Notifications";
import Evidences from "./modules/evidences/Evidences";
import SystemConfiguration from "./modules/system_configuration/SystemConfiguration";
import AssignmentRules from "./modules/assignment_rules/AssignmentRules";
import TicketsHistory from "./modules/tickets_history/TicketsHistory";
import Metrics from "./modules/metrics/Metrics";
import AiClassification from "./modules/ai_classification/AiClassification";
import Login from "./modules/auth/Login";
import Register from "./modules/auth/Register";
import ClientDashboard from "./modules/client_dashboard/ClientDashboard";
import AdminDashboard from "./modules/admin/AdminDashboard";
import { I18nProvider } from "./i18n";
import RoleRoute from "./modules/auth/RoleRoute";
import ClientHistory from "./modules/client_history/ClientHistory";
import ClientTracking from "./modules/client_tracking/ClientTracking";
import CreateTicket from "./modules/client_create/CreateTicket";
import ClientProfile from "./modules/client_profile/ClientProfile";

const queryClient = new QueryClient();

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "./modules/auth/auth";

const LogoutNavigate = () => {
  const navigate = useNavigate();
  useEffect(() => {
    logout();
    navigate("/login", { replace: true });
  }, [navigate]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Login />} />
            <Route path="/logout" element={<LogoutNavigate />} />

            {/* Client section (role-restricted) */}
            <Route path="/client" element={<RoleRoute role="client" />}>
              <Route element={<ClientLayout />}>
                <Route index element={<ClientDashboard />} />
                <Route path="create" element={<CreateTicket />} />
                <Route path="tracking" element={<ClientTracking />} />
                <Route path="history" element={<ClientHistory />} />
                <Route path="profile" element={<ClientProfile />} />
              </Route>
            </Route>

            {/* Admin section (role-restricted) */}
            <Route element={<RoleRoute role="admin" />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/tickets" element={<TicketsManagement />} />
                <Route path="/users-roles" element={<UsersRoles />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/evidences" element={<Evidences />} />
                <Route path="/system-configuration" element={<SystemConfiguration />} />
                <Route path="/assignment-rules" element={<AssignmentRules />} />
                <Route path="/tickets-history" element={<TicketsHistory />} />
                <Route path="/metrics" element={<Metrics />} />
                <Route path="/ai-classification" element={<AiClassification />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
