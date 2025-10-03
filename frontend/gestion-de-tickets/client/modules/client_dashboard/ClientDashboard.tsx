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
  const { t, locale } = useI18n();
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
    const openTickets = tickets.filter(t => t.status === 'PENDIENTE').length;
    const inProgressTickets = tickets.filter(t => 
      t.status === 'ASIGNADO' || t.status === 'EN_PROGRESO' || t.status === 'ESCALADO'
    ).length;
    const resolvedTickets = tickets.filter(t => t.status === 'RESUELTO').length;
    const closedTickets = tickets.filter(t => t.status === 'CERRADO').length;

    // Calcular tiempo promedio de resolución (simulado)
    const resolvedTicketsWithTime = tickets.filter(t => t.status === 'RESUELTO' || t.status === 'CERRADO');
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
    switch (status.toUpperCase()) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700';
      case 'ASIGNADO':
      case 'EN_PROGRESO':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700';
      case 'ESCALADO':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700';
      case 'RESUELTO':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700';
      case 'CERRADO':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDIENTE':
        return <Clock className="w-4 h-4" />;
      case 'ASIGNADO':
      case 'EN_PROGRESO':
        return <AlertCircle className="w-4 h-4" />;
      case 'ESCALADO':
        return <AlertCircle className="w-4 h-4" />;
      case 'RESUELTO':
        return <CheckCircle className="w-4 h-4" />;
      case 'CERRADO':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const userLocale = localStorage.getItem('locale') === 'en' ? 'en-US' : 'es-ES';
    return new Date(dateString).toLocaleDateString(userLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return t('dashboard.time_ago.minutes') || 'A few minutes ago';
    } else if (diffInHours < 24) {
      const unit = diffInHours === 1 ? (t('dashboard.time_ago.hour') || 'hour') : (t('dashboard.time_ago.hours') || 'hours');
      return `${diffInHours} ${unit} ${localStorage.getItem('locale') === 'en' ? 'ago' : ''}`.trim() || `Hace ${diffInHours} horas`;
    } else if (diffInDays === 1) {
      return t('dashboard.time_ago.yesterday') || 'Yesterday';
    } else if (diffInDays < 7) {
      const unit = diffInDays === 1 ? (t('dashboard.time_ago.day') || 'day') : (t('dashboard.time_ago.days') || 'days');
      return `${diffInDays} ${unit} ${localStorage.getItem('locale') === 'en' ? 'ago' : ''}`.trim() || `Hace ${diffInDays} días`;
    } else {
      return formatDate(dateString);
    }
  };

  const generateRecentActivity = () => {
    const activities: Array<{
      title: string;
      time: string;
      color: string;
      ticketId?: number;
    }> = [];

    // Generar actividades basadas en los tickets
    tickets.forEach(ticket => {
      const createdAt = new Date(ticket.createdAt);
      const updatedAt = new Date(ticket.updatedAt || ticket.createdAt);
      const isRecent = (Date.now() - updatedAt.getTime()) < (7 * 24 * 60 * 60 * 1000); // Últimos 7 días

      if (isRecent) {
        // Actividad de creación de ticket
        activities.push({
          title: `Ticket creado: ${ticket.message?.substring(0, 30)}${ticket.message && ticket.message.length > 30 ? '...' : ''}`,
          time: formatTimeAgo(ticket.createdAt),
          color: '#3B82F6', // Azul
          ticketId: ticket.id
        });

        // Actividad de cambio de estado
        if (ticket.status !== 'PENDIENTE' && updatedAt.getTime() !== createdAt.getTime()) {
          let statusText = '';
          let color = '#6B7280'; // Gris por defecto

          switch (ticket.status) {
            case 'ASIGNADO':
              statusText = 'Ticket asignado';
              color = '#3B82F6'; // Azul
              break;
            case 'EN_PROGRESO':
              statusText = 'Ticket en progreso';
              color = '#F59E0B'; // Amarillo
              break;
            case 'ESCALADO':
              statusText = 'Ticket escalado';
              color = '#EF4444'; // Rojo
              break;
            case 'RESUELTO':
              statusText = 'Ticket resuelto';
              color = '#10B981'; // Verde
              break;
            case 'CERRADO':
              statusText = 'Ticket cerrado';
              color = '#6B7280'; // Gris
              break;
          }

          if (statusText) {
            activities.push({
              title: statusText,
              time: formatTimeAgo(ticket.updatedAt || ticket.createdAt),
              color: color,
              ticketId: ticket.id
            });
          }
        }

        // Actividad de asignación de técnico
        if (ticket.technician && ticket.technician !== 'Sin asignar') {
          activities.push({
            title: `Técnico asignado: ${ticket.technician}`,
            time: formatTimeAgo(ticket.updatedAt || ticket.createdAt),
            color: '#8B5CF6', // Púrpura
            ticketId: ticket.id
          });
        }
      }
    });

    // Ordenar por fecha (más reciente primero) y tomar solo los primeros 7
    return activities
      .sort((a, b) => {
        // Extraer timestamp del texto de tiempo para ordenar
        const getTimestamp = (timeStr: string) => {
          if (timeStr.includes('minutos')) return Date.now() - (5 * 60 * 1000);
          if (timeStr.includes('hora')) {
            const hours = parseInt(timeStr.match(/\d+/)?.[0] || '0');
            return Date.now() - (hours * 60 * 60 * 1000);
          }
          if (timeStr.includes('días')) {
            const days = parseInt(timeStr.match(/\d+/)?.[0] || '0');
            return Date.now() - (days * 24 * 60 * 60 * 1000);
          }
          if (timeStr === 'Ayer') return Date.now() - (24 * 60 * 60 * 1000);
          return Date.now();
        };
        return getTimestamp(b.time) - getTimestamp(a.time);
      })
      .slice(0, 7);
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
            <CardTitle className="text-sm font-medium">{t("dashboard.metrics.total_tickets")}</CardTitle>
            <TicketIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.recentActivity} {locale === 'en' ? 'created this week' : 'creados esta semana'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.metrics.pending_tickets")}</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgressTickets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.openTickets} {locale === 'en' ? 'pending' : 'pendientes'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.metrics.resolved_tickets")}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedTickets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.closedTickets} {locale === 'en' ? 'closed' : 'cerrados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.metrics.average_time")}</CardTitle>
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
              {t("dashboard.recent_tickets")}
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
              {t("dashboard.tabs.summary")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generateRecentActivity().length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No hay actividad reciente</p>
                </div>
              ) : (
                generateRecentActivity().map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50"
                    style={{
                      backgroundColor: activity.color + '10',
                      borderColor: activity.color + '30'
                    }}
                    onClick={() => activity.ticketId && navigate(`/client/seguimiento?ticket=${activity.ticketId}`)}
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: activity.color }}
                    ></div>
                    <div className="flex-1">
                      <p 
                        className="text-sm font-medium"
                        style={{ color: activity.color }}
                      >
                        {activity.title}
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: activity.color + 'CC' }}
                      >
                        {activity.time}
                      </p>
                    </div>
                    {activity.ticketId && (
                      <span className="text-xs text-muted-foreground">
                        #{activity.ticketId}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}