import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, TicketResponseDTO, UsuarioDTO, PageResponse } from '../../../shared/api';
import { detectRoleByToken, getAuth } from '../auth/auth';
import TicketsManagement from './TicketsManagement';
import TechniciansManagement from './TechniciansManagement';
import AdministratorsManagement from './AdministratorsManagement';
import UsersManagement from './UsersManagement';
import NotificationsManagement from './NotificationsManagement';
import ConfigurationsManagement from './ConfigurationsManagement';
import './AdminDashboard.css';

interface AdminDashboardProps {
  userRole: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([]);
  const [tecnicos, setTecnicos] = useState<UsuarioDTO[]>([]);
  const [administradores, setAdministradores] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tickets' | 'tecnicos' | 'administradores' | 'usuarios' | 'notificaciones' | 'configuraciones'>('dashboard');

  // Detectar pestaña activa basada en la URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin') {
      setActiveTab('dashboard');
    } else if (path === '/tickets') {
      setActiveTab('tickets');
    } else if (path === '/users-roles') {
      setActiveTab('usuarios');
    } else if (path === '/notifications') {
      setActiveTab('notificaciones');
    } else if (path === '/system-configuration') {
      setActiveTab('configuraciones');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  // Función para cambiar de pestaña
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any);
    switch (tab) {
      case 'dashboard':
        navigate('/admin');
        break;
      case 'tickets':
        navigate('/tickets');
        break;
      case 'usuarios':
        navigate('/users-roles');
        break;
      case 'notificaciones':
        navigate('/notifications');
        break;
      case 'configuraciones':
        navigate('/system-configuration');
        break;
      default:
        navigate('/admin');
    }
  };

  // Debug: Mostrar información del rol
  useEffect(() => {
    const auth = getAuth();
    const detectedRole = detectRoleByToken();
    console.log('🔍 Debug AdminDashboard:');
    console.log('  - userRole prop:', userRole);
    console.log('  - detectedRole:', detectedRole);
    console.log('  - auth:', auth);
    console.log('  - token:', auth?.token);
  }, [userRole]);

  // Verificar permisos
  const detectedRole = detectRoleByToken();
  const hasAccess = userRole === 'admin' || userRole === 'superadmin' || 
                   detectedRole === 'admin' || detectedRole === 'superadmin';
  
  if (!hasAccess) {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <div className="access-denied-content">
            <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 mb-4">
              No tienes permisos para acceder al dashboard de administradores.
            </p>
            <div className="debug-info text-sm text-gray-500 mb-6">
              <p>Rol recibido: {userRole}</p>
              <p>Rol detectado: {detectedRole}</p>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="btn btn-primary"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ticketsData, tecnicosData, administradoresData] = await Promise.all([
        api.getHistorialTickets(0, 20),
        api.getTechnicians(0, 20),
        api.getAdmins(0, 20)
      ]);
      
      setTickets(ticketsData.content || []);
      setTecnicos(tecnicosData.content || []);
      setAdministradores(administradoresData.content || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Obtener estado del ticket
  const getTicketStatus = (estado: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      'ABIERTO': { label: 'Abierto', class: 'status-open' },
      'EN_PROGRESO': { label: 'En Progreso', class: 'status-progress' },
      'RESUELTO': { label: 'Resuelto', class: 'status-resolved' },
      'CERRADO': { label: 'Cerrado', class: 'status-closed' }
    };
    return statusMap[estado] || { label: estado, class: 'status-default' };
  };

  // Verificar permisos
  const canManage = userRole === 'admin' || userRole === 'superadmin';

  if (!canManage) {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder al dashboard de administradores.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard de Administrador</h1>
          <p>Gestión integral del sistema de tickets</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Contenido del dashboard */}
      <div className="dashboard-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            {/* Estadísticas principales */}
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">
                  <i className="fas fa-ticket-alt"></i>
                </div>
                <div className="stat-content">
                  <h3>{tickets.length}</h3>
                  <p>Total Tickets</p>
                  <div className="stat-details">
                    <span className="detail-item">
                      <i className="fas fa-folder-open"></i>
                      {tickets.filter(t => t.estado === 'ABIERTO').length} Abiertos
                    </span>
                    <span className="detail-item">
                      <i className="fas fa-cog fa-spin"></i>
                      {tickets.filter(t => t.estado === 'EN_PROGRESO').length} En Progreso
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card success">
                <div className="stat-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-content">
                  <h3>{tickets.filter(t => t.estado === 'RESUELTO').length}</h3>
                  <p>Tickets Resueltos</p>
                  <div className="stat-details">
                    <span className="detail-item">
                      <i className="fas fa-lock"></i>
                      {tickets.filter(t => t.estado === 'CERRADO').length} Cerrados
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card warning">
                <div className="stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-content">
                  <h3>{tecnicos.length}</h3>
                  <p>Técnicos</p>
                  <div className="stat-details">
                    <span className="detail-item">
                      <i className="fas fa-user-check"></i>
                      {tecnicos.filter(t => t.activo).length} Activos
                    </span>
                  </div>
                </div>
              </div>

              <div className="stat-card info">
                <div className="stat-icon">
                  <i className="fas fa-user-shield"></i>
                </div>
                <div className="stat-content">
                  <h3>{administradores.length}</h3>
                  <p>Administradores</p>
                  <div className="stat-details">
                    <span className="detail-item">
                      <i className="fas fa-user-check"></i>
                      {administradores.filter(a => a.activo).length} Activos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tickets recientes */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Tickets Recientes</h2>
                <button 
                  className="btn btn-outline"
                  onClick={() => setActiveTab('tickets')}
                >
                  Ver todos <i className="fas fa-arrow-right"></i>
                </button>
              </div>
              
              <div className="tickets-list">
                {tickets.slice(0, 5).length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-ticket-alt text-4xl text-gray-300 mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay tickets</h3>
                    <p className="text-gray-600">No se han creado tickets recientemente</p>
                  </div>
                ) : (
                  <div className="tickets-grid">
                    {tickets.slice(0, 5).map(ticket => {
                      const status = getTicketStatus(ticket.estado);
                      return (
                        <div key={ticket.id} className="ticket-card">
                          <div className="ticket-header">
                            <h3 className="ticket-title">{ticket.asunto}</h3>
                            <span className={`ticket-status ${status.class}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="ticket-content">
                            <p className="ticket-description">{ticket.descripcion}</p>
                            <div className="ticket-meta">
                              <span className="ticket-category">{ticket.categoria}</span>
                              <span className="ticket-priority">{ticket.prioridad}</span>
                              <span className="ticket-date">
                                {new Date(ticket.fechaCreacion).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && <TicketsManagement />}
        
        {activeTab === 'tecnicos' && <TechniciansManagement />}
        
        {activeTab === 'administradores' && <AdministratorsManagement />}
        
        {activeTab === 'usuarios' && <UsersManagement />}
        
        {activeTab === 'notificaciones' && <NotificationsManagement />}
        
        {activeTab === 'configuraciones' && <ConfigurationsManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;