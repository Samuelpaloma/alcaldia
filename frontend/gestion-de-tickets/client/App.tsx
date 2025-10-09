import "./global.css";
import "./App.css";

import { Toaster } from "@/components/ui/toaster";
import { GlobalSystemProvider, GlobalSystemStyles } from "./components/GlobalSystemProvider";
import SimpleColorApplier from "./components/SimpleColorApplier";
import "./global-colors.css";
import "./admin-all-modules-transparent.css";
import "./modal-styles.css";
import "./fix-shadcn-inputs.css";
import "./dark-theme-aggressive.css";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import ClientLayout from "./modules/_shared/ClientLayout";
import AdminLayout from "./modules/_shared/AdminLayout";
import TicketsManagement from "./modules/admin/TicketsManagement";
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
import ForgotPassword from "./modules/auth/ForgotPassword";
import ResetPassword from "./modules/auth/ResetPassword";
import RootRedirect from "./modules/auth/RootRedirect";
import AdminDashboard from "./modules/admin/AdminDashboard";
import UnifiedDashboard from "./modules/admin/UnifiedDashboard";
import SuperAdminDashboard from "./modules/superadmin/SuperAdminDashboard";
import SuperAdminLayout from "./modules/_shared/SuperAdminLayout";
import { I18nProvider } from "./i18n";
import RoleRoute from "./modules/auth/RoleRoute";
import ClientHistory from "./modules/client_history/ClientHistory";
import ClientTracking from "./modules/client_tracking/ClientTracking";
import CreateTicket from "./modules/client_create/CreateTicket";
import ClientProfile from "./modules/client_profile/ClientProfile";
import ClientTickets from "./modules/client_tickets/ClientTickets";
import CreateTicketPage from "./modules/client_pages/CreateTicketPage";
import TrackingPage from "./modules/client_pages/TrackingPage";
import HistoryPage from "./modules/client_pages/HistoryPage";
import DashboardPage from "./modules/client_pages/DashboardPage";
import { UserProfile } from "./modules/profile/UserProfile";
import { CategoriesManagement } from "./modules/categories/CategoriesManagement";
import { TechnicianOperations } from "./modules/technician/TechnicianOperations";
import { TechnicianDashboard } from "./modules/technician/TechnicianDashboard";
import { EvidencesManagement } from "./modules/evidences/EvidencesManagement";
import NotificationsCenter from "./modules/notifications/NotificationsCenter";
import GlobalWebSocket, { NotificationProvider } from "./modules/_shared/GlobalWebSocket";
import TechnicianLayout from "./modules/_shared/TechnicianLayout";
// Nuevos módulos implementados
import AutomationRules from "./modules/automation_rules/AutomationRules";
import SLAConfiguration from "./modules/sla_configuration/SLAConfigurationFinal";
import AdvancedDashboard from "./modules/advanced_dashboard/AdvancedDashboard";
import SatisfactionSurvey from "./modules/satisfaction_survey/SatisfactionSurvey";
import Reports from "./modules/reports/Reports";
import TrendsAnalysis from "./modules/analytics/TrendsAnalysis";
import UnifiedAnalytics from "./modules/analytics/UnifiedAnalytics";

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
      <GlobalSystemProvider>
        <GlobalSystemStyles />
        <SimpleColorApplier />
        <Toaster />
        <Sonner />
        <I18nProvider>
          <NotificationProvider>
            <BrowserRouter>
              <GlobalWebSocket />
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<RootRedirect />} />
            <Route path="/logout" element={<LogoutNavigate />} />

            {/* Client section (role-restricted) */}
            <Route path="/client" element={<RoleRoute role="client" />}>
              <Route element={<ClientLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="crear" element={<CreateTicketPage />} />
                <Route path="seguimiento" element={<TrackingPage />} />
                <Route path="historial" element={<HistoryPage />} />
              </Route>
            </Route>

            {/* Admin section (role-restricted) */}
        <Route element={<RoleRoute role="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<UnifiedDashboard />} />
            <Route path="/tickets" element={<TicketsManagement />} />
            <Route path="/users-roles" element={<AdminDashboard userRole="admin" />} />
            <Route path="/notifications" element={<NotificationsCenter />} />
            <Route path="/system-configuration" element={<SystemConfiguration />} />
            <Route path="/assignment-rules" element={<AssignmentRules />} />
            <Route path="/tickets-history" element={<TicketsHistory />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/ai-classification" element={<AiClassification ticketId={0} onClassificationComplete={() => {}} />} />
            <Route path="/categories" element={<CategoriesManagement userRole="admin" />} />
            {/* Módulos especializados */}
            <Route path="/automation-rules" element={<AutomationRules />} />
            <Route path="/sla-configuration" element={<SLAConfiguration />} />
            <Route path="/analytics" element={<Reports />} />
          </Route>
        </Route>

            {/* Technician section (role-restricted) */}
            <Route element={<RoleRoute role="admin" />}>
              <Route element={<TechnicianLayout />}>
                <Route path="/technician" element={<TechnicianDashboard userRole="tecnico" />} />
                <Route path="/technician/tickets" element={<TechnicianOperations userRole="tecnico" />} />
                <Route path="/technician/evidences" element={<EvidencesManagement userRole="tecnico" />} />
              </Route>
            </Route>

            {/* SuperAdmin section (role-restricted) */}
            <Route element={<SuperAdminLayout />}>
              <Route path="/superadmin" element={<SuperAdminDashboard userRole="SUPERADMIN" />} />
              <Route path="/superadmin/administradores" element={<SuperAdminDashboard userRole="SUPERADMIN" />} />
              <Route path="/superadmin/configuraciones" element={<SuperAdminDashboard userRole="SUPERADMIN" />} />
              <Route path="/superadmin/categories" element={<CategoriesManagement userRole="SUPERADMIN" />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </I18nProvider>
      </GlobalSystemProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);