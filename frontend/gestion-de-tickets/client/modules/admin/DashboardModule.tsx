import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, TicketResponseDTO, UsuarioDTO, SystemStatsResponse } from '../../../shared/api';
import { 
  BarChart3, 
  Users, 
  Ticket, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Activity,
  FileText,
  UserCheck
} from 'lucide-react';
import './DashboardModule.css';

interface DashboardModuleProps {
  userRole: string;
}

const DashboardModule: React.FC<DashboardModuleProps> = ({ userRole }) => {
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([]);
  const [tecnicos, setTecnicos] = useState<UsuarioDTO[]>([]);
  const [administradores, setAdministradores] = useState<UsuarioDTO[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 DashboardModule: Cargando datos del dashboard...');
      
      const [ticketsData, tecnicosData, administradoresData, statsData] = await Promise.all([
        api.getTodosLosTickets(), // Usar endpoint correcto para admin
        api.getTechnicians(0, 20),
        api.getAdmins(0, 20),
        api.getAdminStats()
      ]);
      
      console.log('📊 DashboardModule: Datos recibidos:', {
        tickets: ticketsData,
        tecnicos: tecnicosData,
        administradores: administradoresData,
        stats: statsData
      });
      
      setTickets(ticketsData || []); // getTodosLosTickets retorna array directo
      setTecnicos(tecnicosData.content || []);
      setAdministradores(administradoresData.content || []);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
      console.error('❌ DashboardModule: Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTicketsByStatus = (status: string) => {
    return (tickets || []).filter(t => t.estado === status).length;
  };

  const getTicketsByPriority = (priority: string) => {
    return (tickets || []).filter(t => t.prioridad === priority).length;
  };

  const getActiveUsers = (users: UsuarioDTO[]) => {
    return users.filter(u => u.activo).length;
  };

  if (loading) {
    return (
      <div className="dashboard-module">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-module">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="page-title">Dashboard de Administración</h1>
          <p className="page-subtitle">Vista general del sistema de gestión de tickets</p>
        </div>
        <Button onClick={loadData} variant="outline" className="refresh-btn">
          <Activity className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {error && (
        <Card className="error-card">
          <CardContent className="p-4">
            <div className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas principales */}
      <div className="metrics-grid">
        <Card className="metric-card primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Total Tickets</p>
                <p className="metric-value">{tickets.length}</p>
                <div className="metric-details">
                  <span className="detail-item">
                    <Clock className="w-4 h-4" />
                    {getTicketsByStatus('PENDIENTE')} Abiertos
                  </span>
                  <span className="detail-item">
                    <CheckCircle className="w-4 h-4" />
                    {getTicketsByStatus('TERMINADO')} Resueltos
                  </span>
                </div>
              </div>
              <div className="metric-icon">
                <Ticket className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card success">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Técnicos Activos</p>
                <p className="metric-value">{stats?.totalTecnicos || 0}</p>
                <div className="metric-details">
                  <span className="detail-item">
                    <Users className="w-4 h-4" />
                    {stats?.totalTecnicos || 0} Total
                  </span>
                </div>
              </div>
              <div className="metric-icon">
                <UserCheck className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card warning">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Tickets Sin Asignar</p>
                <p className="metric-value">{getTicketsByStatus('PENDIENTE')}</p>
                <div className="metric-details">
                  <span className="detail-item">
                    <AlertTriangle className="w-4 h-4" />
                    Requieren atención
                  </span>
                </div>
              </div>
              <div className="metric-icon">
                <AlertTriangle className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card info">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Tickets en Progreso</p>
                <p className="metric-value">{getTicketsByStatus('EN_EJECUCION')}</p>
                <div className="metric-details">
                  <span className="detail-item">
                    <TrendingUp className="w-4 h-4" />
                    {getTicketsByStatus('PENDIENTE')} Pendientes
                  </span>
                </div>
              </div>
              <div className="metric-icon">
                <BarChart3 className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas por prioridad */}
      <div className="stats-section">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Distribución por Prioridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="priority-stats">
              <div className="priority-item high">
                <div className="priority-info">
                  <span className="priority-label">Alta</span>
                  <span className="priority-count">{getTicketsByPriority('high')}</span>
                </div>
                <div className="priority-bar">
                  <div 
                    className="priority-fill high" 
                    style={{ width: `${(getTicketsByPriority('high') / Math.max(tickets.length, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="priority-item medium">
                <div className="priority-info">
                  <span className="priority-label">Media</span>
                  <span className="priority-count">{getTicketsByPriority('medium')}</span>
                </div>
                <div className="priority-bar">
                  <div 
                    className="priority-fill medium" 
                    style={{ width: `${(getTicketsByPriority('medium') / Math.max(tickets.length, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="priority-item low">
                <div className="priority-info">
                  <span className="priority-label">Baja</span>
                  <span className="priority-count">{getTicketsByPriority('low')}</span>
                </div>
                <div className="priority-bar">
                  <div 
                    className="priority-fill low" 
                    style={{ width: `${(getTicketsByPriority('low') / Math.max(tickets.length, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets recientes */}
      <div className="recent-section">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Tickets Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(tickets || []).length === 0 ? (
              <div className="empty-state">
                <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay tickets recientes</p>
              </div>
            ) : (
              <div className="tickets-list">
                {(tickets || []).slice(0, 5).map(ticket => (
                  <div key={ticket.id} className="ticket-item">
                    <div className="ticket-info">
                      <div className="ticket-header">
                        <span className="ticket-id">#{ticket.id}</span>
                        <span className={`status-badge status-${ticket.estado.toLowerCase().replace('_', '-')}`}>
                          {ticket.estado}
                        </span>
                      </div>
                      <p className="ticket-subject">{ticket.asunto || 'Sin asunto'}</p>
                      <div className="ticket-meta">
                        <span className={`ticket-priority priority-${ticket.prioridad}`}>
                          {ticket.prioridad}
                        </span>
                        <span className="ticket-date">
                          {new Date(ticket.fechaCreacion).toLocaleDateString()}
                        </span>
                      </div>
                      {ticket.tecnicoEmail && (
                        <div className="ticket-technician">
                          <span className="text-xs text-muted-foreground">
                            Técnico: {ticket.tecnicoEmail}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardModule;
