import React, { useState, useEffect } from 'react';
import './UnifiedDashboard.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, TicketResponseDTO, SystemStatsResponse } from '../../../shared/api';
import { useI18n } from '../../i18n';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Ticket, 
  Clock, 
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Settings,
  Zap
} from 'lucide-react';
import SLAMonitoringWidget from '../sla_monitoring/SLAMonitoringWidget';

interface DashboardMetrics {
  totalTickets: number;
  ticketsResueltos: number;
  ticketsPendientes: number;
  tiempoPromedioResolucion: number;
  satisfaccionPromedio: number;
  ticketsPorCategoria: { categoria: string; cantidad: number }[];
  ticketsPorEstado: { estado: string; cantidad: number }[];
  ticketsPorMes: { mes: string; cantidad: number }[];
  tecnicosMasActivos: { tecnico: string; tickets: number }[];
}

interface RecentTicket {
  id: number;
  asunto: string;
  prioridad: string;
  estado: string;
  creadoPor: string;
  fechaCreacion: string;
}

interface ActiveTechnician {
  id: number;
  nombre: string;
  email: string;
  ticketsActivos: number;
  estado: string;
}

const UnifiedDashboard: React.FC = () => {
  const { t } = useI18n();
  const [metricas, setMetricas] = useState<DashboardMetrics | null>(null);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [activeTechnicians, setActiveTechnicians] = useState<ActiveTechnician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadMetricas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [DEBUG] Cargando métricas del dashboard administrativo...');
      
      // Cargar estadísticas del sistema (si está disponible)
      let stats = null;
      try {
        stats = await api.obtenerMetricasDashboard();
        console.log('📊 [DEBUG] Estadísticas recibidas:', stats);
      } catch (error) {
        console.log('⚠️ [DEBUG] Métricas del dashboard no disponibles, usando datos calculados');
      }
      
      // Cargar tickets recientes
      let tickets = [];
      try {
        tickets = await api.getAdminTickets();
        console.log('🎫 [DEBUG] Tickets recibidos:', tickets.length);
      } catch (error) {
        console.log('⚠️ [DEBUG] Error cargando tickets:', error);
        tickets = [];
      }
      
      // Cargar técnicos
      let technicians = [];
      try {
        const techniciansResponse = await api.getTechnicians(0, 100);
        technicians = techniciansResponse.content || techniciansResponse;
        console.log('👥 [DEBUG] Técnicos recibidos:', technicians.length);
      } catch (error) {
        console.log('⚠️ [DEBUG] Error cargando técnicos:', error);
        technicians = [];
      }
      
      // Procesar datos reales
      const totalTickets = tickets.length;
      const ticketsResueltos = tickets.filter(t => t.estado === 'RESUELTO' || t.estado === 'CERRADO').length;
      const ticketsPendientes = tickets.filter(t => t.estado === 'PENDIENTE' || t.estado === 'ASIGNADO' || t.estado === 'EN_PROGRESO').length;
      
      console.log('📊 [DEBUG] Estadísticas calculadas:');
      console.log('  - Total tickets:', totalTickets);
      console.log('  - Tickets resueltos:', ticketsResueltos);
      console.log('  - Tickets pendientes:', ticketsPendientes);
      console.log('  - Técnicos:', technicians.length);
      
      // Calcular estadísticas por categoría
      const categoriaStats = new Map<string, number>();
      tickets.forEach(ticket => {
        const categoria = ticket.asunto || 'Sin categoría';
        categoriaStats.set(categoria, (categoriaStats.get(categoria) || 0) + 1);
      });
      const ticketsPorCategoria = Array.from(categoriaStats.entries())
        .map(([categoria, cantidad]) => ({ categoria, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);
      
      // Calcular estadísticas por estado
      const estadoStats = new Map<string, number>();
      tickets.forEach(ticket => {
        const estado = ticket.estado;
        estadoStats.set(estado, (estadoStats.get(estado) || 0) + 1);
      });
      const ticketsPorEstado = Array.from(estadoStats.entries())
        .map(([estado, cantidad]) => ({ estado, cantidad }));
      
      // Calcular técnicos más activos
      const tecnicoStats = new Map<string, number>();
      tickets.forEach(ticket => {
        if (ticket.tecnicoAsignado && ticket.tecnicoAsignado !== 'Sin asignar') {
          const tecnico = ticket.tecnicoAsignado;
          tecnicoStats.set(tecnico, (tecnicoStats.get(tecnico) || 0) + 1);
        }
      });
      const tecnicosMasActivos = Array.from(tecnicoStats.entries())
        .map(([tecnico, tickets]) => ({ tecnico, tickets }))
        .sort((a, b) => b.tickets - a.tickets)
        .slice(0, 4);
      
      // Preparar tickets recientes (últimos 5)
      const recentTicketsData = tickets
        .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
        .slice(0, 5)
        .map(ticket => ({
          id: ticket.id,
          asunto: ticket.asunto || 'Sin asunto',
          prioridad: ticket.prioridad,
          estado: ticket.estado,
          creadoPor: ticket.creadorNombre || 'Usuario',
          fechaCreacion: ticket.fechaCreacion
        }));
      
      // Preparar técnicos activos
      console.log('🔧 [DEBUG] Procesando técnicos:', technicians);
      const activeTechniciansData = technicians
        .map(tech => {
          console.log('🔧 [DEBUG] Técnico individual:', tech);
          const ticketsActivos = tickets.filter(t => t.tecnicoNombre === tech.nombreCompleto).length;
          const techData = {
            id: tech.id, // Corregido: usar 'id' en lugar de 'idUsuario'
            nombre: tech.nombreCompleto,
            email: tech.email,
            ticketsActivos,
            estado: ticketsActivos > 0 ? t('dashboard.technician.online') : t('dashboard.technician.available'),
            activo: tech.activo // Agregar campo activo
          };
          console.log('🔧 [DEBUG] Técnico procesado:', techData);
          return techData;
        })
        .filter(tech => {
          console.log('🔧 [DEBUG] Filtrando técnico:', tech.nombre, 'activo:', tech.activo);
          return tech.activo; // Mostrar todos los técnicos activos, no solo los que tienen tickets
        })
        .sort((a, b) => b.ticketsActivos - a.ticketsActivos)
        .slice(0, 3);
      
      console.log('🔧 [DEBUG] Técnicos activos finales:', activeTechniciansData);
      
      const metricasData: DashboardMetrics = {
        totalTickets,
        ticketsResueltos,
        ticketsPendientes,
        tiempoPromedioResolucion: 4.2, // TODO: Calcular tiempo real
        satisfaccionPromedio: 4.6, // TODO: Implementar encuestas de satisfacción
        ticketsPorCategoria,
        ticketsPorEstado,
        ticketsPorMes: [], // TODO: Implementar análisis temporal
        tecnicosMasActivos
      };
      
      setMetricas(metricasData);
      setRecentTickets(recentTicketsData);
      setActiveTechnicians(activeTechniciansData);
      
      console.log('✅ [DEBUG] Dashboard cargado exitosamente');
    } catch (err) {
      console.error('❌ [DEBUG] Error cargando dashboard:', err);
      setError('Error al cargar métricas: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetricas();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return t('dashboard.time_ago.minutes');
    } else if (diffInHours < 24) {
      return `${t('dashboard.time_ago.hour')} ${diffInHours} ${diffInHours === 1 ? t('dashboard.time_ago.hour') : t('dashboard.time_ago.hours')}`;
    } else if (diffInDays === 1) {
      return t('dashboard.time_ago.yesterday');
    } else if (diffInDays < 7) {
      return `${t('dashboard.time_ago.day')} ${diffInDays}`;
    } else {
      return date.toLocaleDateString('es-ES');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad?.toUpperCase()) {
      case 'ALTA':
        return 'bg-red-100 text-red-800';
      case 'MEDIA':
        return 'bg-yellow-100 text-yellow-800';
      case 'BAJA':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ASIGNADO':
        return 'bg-blue-100 text-blue-800';
      case 'EN_PROGRESO':
        return 'bg-orange-100 text-orange-800';
      case 'ESCALADO':
        return 'bg-red-100 text-red-800';
      case 'RESUELTO':
        return 'bg-green-100 text-green-800';
      case 'CERRADO':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return t('dashboard.status.pending');
      case 'ASIGNADO':
        return t('dashboard.status.assigned');
      case 'EN_PROGRESO':
        return t('dashboard.status.in_progress');
      case 'ESCALADO':
        return t('dashboard.status.escalated');
      case 'RESUELTO':
        return t('dashboard.status.resolved');
      case 'CERRADO':
        return t('dashboard.status.closed');
      default:
        return estado;
    }
  };

  const getPriorityText = (prioridad: string) => {
    switch (prioridad?.toLowerCase()) {
      case 'high':
        return t('dashboard.priority.high');
      case 'medium':
        return t('dashboard.priority.medium');
      case 'low':
        return t('dashboard.priority.low');
      default:
        return prioridad;
    }
  };

  const getTendenciaColor = (valor: number, esPositivo: boolean) => {
    if (esPositivo) {
      return valor > 0 ? 'text-green-600' : 'text-red-600';
    } else {
      return valor > 0 ? 'text-red-600' : 'text-green-600';
    }
  };

  const getTendenciaIcon = (valor: number, esPositivo: boolean) => {
    if (esPositivo) {
      return valor > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
    } else {
      return valor > 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="unified-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="unified-dashboard">
        <div className="error-message">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="unified-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">{t('dashboard.title')}</h1>
          <p className="dashboard-subtitle">{t('dashboard.subtitle')}</p>
        </div>
        <div className="header-actions">
          <Button onClick={loadMetricas} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('dashboard.refresh')}
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            {t('dashboard.export')}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t('dashboard.tabs.summary')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('dashboard.tabs.analysis')}</TabsTrigger>
          <TabsTrigger value="performance">{t('dashboard.tabs.performance')}</TabsTrigger>
          <TabsTrigger value="trends">{t('dashboard.tabs.trends')}</TabsTrigger>
          <TabsTrigger value="sla">{t('dashboard.tabs.sla_monitoring')}</TabsTrigger>
        </TabsList>

        {/* Pestaña Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="metrics-grid">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Ticket className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.metrics.total_tickets')}</p>
                    <p className="text-2xl font-bold text-gray-900">{metricas?.totalTickets}</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-sm ${getTendenciaColor(12, true)}`}>
                        +12%
                      </span>
                      {getTendenciaIcon(12, true)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.metrics.resolved_tickets')}</p>
                    <p className="text-2xl font-bold text-gray-900">{metricas?.ticketsResueltos}</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-sm ${getTendenciaColor(8, true)}`}>
                        +8%
                      </span>
                      {getTendenciaIcon(8, true)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.metrics.pending_tickets')}</p>
                    <p className="text-2xl font-bold text-gray-900">{metricas?.ticketsPendientes}</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-sm ${getTendenciaColor(5, false)}`}>
                        -5%
                      </span>
                      {getTendenciaIcon(5, false)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('dashboard.metrics.average_time')}</p>
                    <p className="text-2xl font-bold text-gray-900">{metricas?.tiempoPromedioResolucion}h</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-sm ${getTendenciaColor(15, false)}`}>
                        -15%
                      </span>
                      {getTendenciaIcon(15, false)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Widget de Monitoreo SLA */}
          <SLAMonitoringWidget className="mb-6" />

          {/* Contenido adicional para el resumen */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  {t('dashboard.recent_tickets')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTickets.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Ticket className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No hay tickets recientes</p>
                    </div>
                  ) : (
                    recentTickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{ticket.asunto}</p>
                            <p className="text-xs text-gray-500">{formatTimeAgo(ticket.fechaCreacion)}</p>
                            <p className="text-xs text-gray-400">{t('dashboard.by')}: {ticket.creadoPor}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={`text-xs ${getPriorityColor(ticket.prioridad)}`}>
                            {getPriorityText(ticket.prioridad)}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(ticket.estado)}`}>
                            {getStatusText(ticket.estado)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  {t('dashboard.active_technicians')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeTechnicians.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No hay técnicos activos</p>
                    </div>
                  ) : (
                    activeTechnicians.map((technician) => (
                      <div key={technician.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {getInitials(technician.nombre)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{technician.nombre}</p>
                            <p className="text-xs text-gray-500">
                              {technician.ticketsActivos} {t('dashboard.technician.active_tickets')}
                            </p>
                          </div>
                        </div>
                        <Badge className={
                          technician.estado === t('dashboard.technician.online')
                            ? 'bg-green-100 text-green-800' 
                            : technician.estado === t('dashboard.technician.busy')
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }>
                          {technician.estado}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña Análisis */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Tickets por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metricas?.ticketsPorCategoria.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">{item.categoria}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{item.cantidad}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(item.cantidad / 234) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Tickets por Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metricas?.ticketsPorEstado.map((item, index) => {
                    const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-gray-500'];
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 ${colors[index]} rounded-full`}></div>
                          <span className="text-sm font-medium">{item.estado}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{item.cantidad}</span>
                          <Badge variant="outline">{item.cantidad}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña Rendimiento */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Rendimiento de Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metricas?.tecnicosMasActivos.map((tecnico, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {tecnico.tecnico.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{tecnico.tecnico}</p>
                        <p className="text-sm text-gray-600">{tecnico.tickets} tickets resueltos</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{tecnico.tickets}</Badge>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(tecnico.tickets / 45) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Tendencias */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Satisfacción del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {metricas?.satisfaccionPromedio}/5.0
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Promedio de satisfacción</p>
                  <div className="flex justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`w-6 h-6 ${
                          star <= (metricas?.satisfaccionPromedio || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Tendencia Mensual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metricas?.ticketsPorMes.map((mes, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{mes.mes}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{mes.cantidad}</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(mes.cantidad / 203) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña Monitoreo SLA */}
        <TabsContent value="sla" className="space-y-6">
          <div className="grid gap-6">
            <SLAMonitoringWidget />
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                    Tickets con SLA Vencido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                    <p className="text-gray-600 mb-4">Verificando tickets con SLA vencido...</p>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {t('dashboard.sla.verify_now')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-orange-500" />
                    Tickets Próximos a Vencer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                    <p className="text-gray-600 mb-4">Verificando tickets próximos a vencer...</p>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {t('dashboard.sla.verify_now')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedDashboard;