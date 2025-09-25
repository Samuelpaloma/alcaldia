import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api, TicketResponseDTO } from '../../../shared/api';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  AlertCircle,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Star,
  Activity
} from 'lucide-react';

interface TechnicianDashboardProps {
  userRole: string;
}

export const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({ userRole }) => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, statsData] = await Promise.all([
        api.getTicketsAsignadosTecnico(),
        api.getEstadisticasTecnico()
      ]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ABIERTO':
      case 'PENDIENTE':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'EN_PROGRESO':
      case 'EN_EJECUCION':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'RESUELTO':
      case 'TERMINADO':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'CERRADO':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABIERTO':
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EN_PROGRESO':
      case 'EN_EJECUCION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESUELTO':
      case 'TERMINADO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CERRADO':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'ALTA':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
      case 'MEDIA':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      case 'BAJA':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard de Técnico</h1>
          <p className="text-muted-foreground">Resumen de tus actividades y tickets asignados</p>
        </div>
        <Button onClick={loadData} variant="outline">
          Actualizar
        </Button>
      </div>

      {/* Estadísticas Principales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total Tickets</p>
                  <p className="text-2xl font-bold">{stats.totalTickets || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">En Progreso</p>
                  <p className="text-2xl font-bold">{stats.ticketsEnProgreso || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Resueltos</p>
                  <p className="text-2xl font-bold">{stats.ticketsResueltos || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Promedio Resolución</p>
                  <p className="text-2xl font-bold">{stats.promedioResolucion || '0'}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets Recientes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tickets Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentTickets.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tienes tickets asignados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-shrink-0">
                        {getStatusIcon(ticket.estado)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">#{ticket.id} - {ticket.asunto}</p>
                          <Badge className={getStatusColor(ticket.estado)}>
                            {ticket.estado}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge className={getPriorityColor(ticket.prioridad)}>
                            {ticket.prioridad}
                          </Badge>
                          <span>{new Date(ticket.fechaCreacion).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Rendimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tickets Resueltos Hoy</span>
                <span className="font-semibold">{stats?.ticketsResueltosHoy || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tiempo Promedio</span>
                <span className="font-semibold">{stats?.tiempoPromedio || '0h'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Satisfacción</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-semibold">{stats?.satisfaccion || '0.0'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actividad Reciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Ticket #123 resuelto</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Nueva evidencia subida</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Ticket #124 en progreso</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Ver Todos los Tickets
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Subir Evidencia
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Estadísticas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};