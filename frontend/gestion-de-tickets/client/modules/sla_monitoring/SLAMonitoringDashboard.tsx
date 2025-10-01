import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Progress } from '../../components/ui/progress';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Bell, 
  TrendingUp,
  Calendar,
  Users,
  Activity
} from 'lucide-react';
import './SLAMonitoringDashboard.css';

interface SLAStats {
  totalTicketsActivos: number;
  ticketsConSLA: number;
  ticketsVencidos: number;
  ticketsProximos: number;
  ticketsEnTiempo: number;
  porcentajeCumplimiento: number;
  ultimaVerificacion: string;
}

interface TicketSLA {
  id: number;
  categoria: string;
  prioridad: string;
  estado: string;
  fechaCreacion: string;
  fechaLimiteRespuesta?: string;
  fechaLimiteResolucion?: string;
  tipoVencimiento?: string;
  tipoProximidad?: string;
}

interface SLAMonitoringDashboardProps {
  userRole: string;
}

const SLAMonitoringDashboard: React.FC<SLAMonitoringDashboardProps> = ({ userRole }) => {
  const [stats, setStats] = useState<SLAStats | null>(null);
  const [ticketsVencidos, setTicketsVencidos] = useState<TicketSLA[]>([]);
  const [ticketsProximos, setTicketsProximos] = useState<TicketSLA[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchSLAStats = async () => {
    try {
      const response = await fetch('/api/sla/monitoring/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching SLA stats:', error);
    }
  };

  const fetchTicketsVencidos = async () => {
    try {
      const response = await fetch('/api/sla/monitoring/expired');
      if (response.ok) {
        const data = await response.json();
        setTicketsVencidos(data.ticketsVencidos || []);
      }
    } catch (error) {
      console.error('Error fetching expired tickets:', error);
    }
  };

  const fetchTicketsProximos = async () => {
    try {
      const response = await fetch('/api/sla/monitoring/expiring');
      if (response.ok) {
        const data = await response.json();
        setTicketsProximos(data.ticketsProximos || []);
      }
    } catch (error) {
      console.error('Error fetching expiring tickets:', error);
    }
  };

  const executeManualCheck = async () => {
    setLoading(true);
    try {
      await fetch('/api/sla/monitoring/execute', { method: 'POST' });
      await Promise.all([fetchSLAStats(), fetchTicketsVencidos(), fetchTicketsProximos()]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error executing manual check:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchSLAStats(), fetchTicketsVencidos(), fetchTicketsProximos()]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(refreshData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad?.toUpperCase()) {
      case 'ALTA': return 'destructive';
      case 'MEDIA': return 'default';
      case 'BAJA': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE': return 'destructive';
      case 'ASIGNADO': return 'default';
      case 'EN_PROGRESO': return 'secondary';
      case 'TERMINADO': return 'outline';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getTimeRemaining = (fechaLimite: string) => {
    const now = new Date();
    const limit = new Date(fechaLimite);
    const diff = limit.getTime() - now.getTime();
    
    if (diff < 0) {
      const hours = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
      const minutes = Math.abs(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
      return `Vencido hace ${hours}h ${minutes}m`;
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m restantes`;
    }
  };

  if (loading && !stats) {
    return (
      <div className="sla-monitoring-dashboard">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando monitoreo SLA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sla-monitoring-dashboard">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Monitoreo SLA</h1>
          <p className="text-muted-foreground">
            Última actualización: {lastUpdate.toLocaleString('es-ES')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={executeManualCheck} variant="default" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Verificar Ahora
          </Button>
        </div>
      </div>

      {/* Estadísticas Generales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTicketsActivos}</div>
              <p className="text-xs text-muted-foreground">
                {stats.ticketsConSLA} con SLA configurado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cumplimiento SLA</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.porcentajeCumplimiento.toFixed(1)}%</div>
              <Progress value={stats.porcentajeCumplimiento} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Vencidos</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.ticketsVencidos}</div>
              <p className="text-xs text-muted-foreground">
                Requieren atención inmediata
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximos a Vencer</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.ticketsProximos}</div>
              <p className="text-xs text-muted-foreground">
                Requieren seguimiento
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas Críticas */}
      {ticketsVencidos.length > 0 && (
        <Alert className="mb-6 border-destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Alertas Críticas</AlertTitle>
          <AlertDescription>
            {ticketsVencidos.length} ticket(s) han vencido su SLA y requieren atención inmediata.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs de Detalles */}
      <Tabs defaultValue="expired" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expired" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Vencidos ({ticketsVencidos.length})
          </TabsTrigger>
          <TabsTrigger value="expiring" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Próximos ({ticketsProximos.length})
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expired" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Tickets con SLA Vencido
              </CardTitle>
              <CardDescription>
                Tickets que han excedido su tiempo límite de respuesta o resolución
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ticketsVencidos.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay tickets con SLA vencido</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Creación</TableHead>
                      <TableHead>Tipo Vencimiento</TableHead>
                      <TableHead>Tiempo Transcurrido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ticketsVencidos.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">#{ticket.id}</TableCell>
                        <TableCell>{ticket.categoria}</TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(ticket.prioridad)}>
                            {ticket.prioridad}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(ticket.estado)}>
                            {ticket.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(ticket.fechaCreacion)}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            {ticket.tipoVencimiento}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ticket.fechaLimiteRespuesta && getTimeRemaining(ticket.fechaLimiteRespuesta)}
                          {ticket.fechaLimiteResolucion && getTimeRemaining(ticket.fechaLimiteResolucion)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Tickets Próximos a Vencer
              </CardTitle>
              <CardDescription>
                Tickets que están próximos a vencer su SLA (menos de 1 hora)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ticketsProximos.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay tickets próximos a vencer</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Creación</TableHead>
                      <TableHead>Tipo Proximidad</TableHead>
                      <TableHead>Tiempo Restante</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ticketsProximos.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">#{ticket.id}</TableCell>
                        <TableCell>{ticket.categoria}</TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(ticket.prioridad)}>
                            {ticket.prioridad}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(ticket.estado)}>
                            {ticket.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(ticket.fechaCreacion)}</TableCell>
                        <TableCell>
                          <Badge variant="default">
                            {ticket.tipoProximidad}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ticket.fechaLimiteRespuesta && getTimeRemaining(ticket.fechaLimiteRespuesta)}
                          {ticket.fechaLimiteResolucion && getTimeRemaining(ticket.fechaLimiteResolucion)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Estadísticas Detalladas
              </CardTitle>
              <CardDescription>
                Información detallada sobre el cumplimiento de SLA
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Tickets en Tiempo</span>
                      <span className="text-2xl font-bold text-green-600">{stats.ticketsEnTiempo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Tickets Vencidos</span>
                      <span className="text-2xl font-bold text-red-600">{stats.ticketsVencidos}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Tickets Próximos</span>
                      <span className="text-2xl font-bold text-yellow-600">{stats.ticketsProximos}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Activos</span>
                      <span className="text-2xl font-bold">{stats.totalTicketsActivos}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Con SLA</span>
                      <span className="text-2xl font-bold">{stats.ticketsConSLA}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Cumplimiento</span>
                      <span className="text-2xl font-bold text-green-600">
                        {stats.porcentajeCumplimiento.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SLAMonitoringDashboard;
