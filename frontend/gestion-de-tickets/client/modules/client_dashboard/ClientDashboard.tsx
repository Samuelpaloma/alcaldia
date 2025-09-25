import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useTickets } from "../../hooks/use-tickets";
import { useNavigate } from "react-router-dom";
import { 
  Ticket as TicketIcon, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare,
  TrendingUp,
  Calendar,
  User
} from "lucide-react";

interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  averageResolutionTime: string;
  recentActivity: number;
}

export default function ClientDashboard() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { tickets, isLoading, error } = useTickets();
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    averageResolutionTime: "0h",
    recentActivity: 0
  });

  useEffect(() => {
    calculateStats();
  }, [tickets]);

  const calculateStats = () => {
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'pending').length;
    const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    const closedTickets = tickets.filter(t => t.status === 'closed').length;

    // Calcular tiempo promedio de resolución (simulado)
    const resolvedTicketsWithTime = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    const averageTime = resolvedTicketsWithTime.length > 0 ? "2.5h" : "0h";

    // Actividad reciente (tickets creados en los últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = tickets.filter(t => 
      new Date(t.createdAt) > sevenDaysAgo
    ).length;

    setStats({
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      averageResolutionTime: averageTime,
      recentActivity
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const recentTickets = tickets
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="section grid gap-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Resumen de tus tickets y actividad</p>
      </div>

      {/* Acciones rápidas */}
      <div className="flex justify-end">
        <Button onClick={() => navigate('/client/crear')} className="flex items-center gap-2">
          <TicketIcon className="w-4 h-4" />
          Nuevo Ticket
        </Button>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <TicketIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.recentActivity} creados esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgressTickets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.openTickets} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedTickets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.closedTickets} cerrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageResolutionTime}</div>
            <p className="text-xs text-muted-foreground">
              de resolución
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Tickets Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTickets.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <TicketIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No tienes tickets aún</p>
                  <Button 
                    onClick={() => navigate('/client/crear')} 
                    className="mt-2"
                    size="sm"
                  >
                    Crear tu primer ticket
                  </Button>
                </div>
              ) : (
                recentTickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/client/seguimiento?ticket=${ticket.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">#{ticket.id}</span>
                        <Badge className={`${getStatusColor(ticket.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {ticket.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(ticket.createdAt)}
                        </span>
                        {ticket.technician && ticket.technician !== 'Sin asignar' && (
                          <>
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {ticket.technician}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actividad reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Sistema actualizado</p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Ticket #123 resuelto</p>
                  <p className="text-xs text-muted-foreground">Ayer</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Nuevo técnico asignado</p>
                  <p className="text-xs text-muted-foreground">Hace 3 días</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}