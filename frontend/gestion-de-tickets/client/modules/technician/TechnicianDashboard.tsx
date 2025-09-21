import React, { useState, useEffect } from 'react';
import { api, TicketTecnicoResponseDTO, EstadisticasTecnicoResponseDTO, CambiarEstadoTicketRequestDTO } from '../../../shared/api';
import './TechnicianDashboard.css';

interface TechnicianDashboardProps {
  userRole: string;
}

const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({ userRole }) => {
  const [tickets, setTickets] = useState<TicketTecnicoResponseDTO[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTecnicoResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketTecnicoResponseDTO | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ticketsData, estadisticasData] = await Promise.all([
        api.getTicketsAsignadosTecnico(),
        api.getEstadisticasTecnico()
      ]);
      
      setTickets(ticketsData);
      setEstadisticas(estadisticasData);
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

  // Filtrar tickets por estado
  const filteredTickets = tickets.filter(ticket => 
    filterEstado === 'TODOS' || ticket.estado === filterEstado
  );

  // Abrir modal de cambio de estado
  const openStatusModal = (ticket: TicketTecnicoResponseDTO) => {
    setSelectedTicket(ticket);
    setNuevoEstado(ticket.estado);
    setComentarios('');
    setShowStatusModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowStatusModal(false);
    setSelectedTicket(null);
    setNuevoEstado('');
    setComentarios('');
  };

  // Cambiar estado del ticket
  const handleStatusChange = async () => {
    if (!selectedTicket || !nuevoEstado) return;

    try {
      const request: CambiarEstadoTicketRequestDTO = {
        ticketId: selectedTicket.idTicket,
        nuevoEstado,
        comentarios: comentarios.trim() || undefined
      };

      await api.cambiarEstadoTicket(request);
      closeModal();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
      console.error('Error cambiando estado:', err);
    }
  };

  // Obtener estado del ticket
  const getTicketStatus = (estado: string) => {
    const statusMap: Record<string, { label: string; class: string; icon: string }> = {
      'ABIERTO': { label: 'Abierto', class: 'status-open', icon: 'fas fa-folder-open' },
      'EN_PROGRESO': { label: 'En Progreso', class: 'status-progress', icon: 'fas fa-cog fa-spin' },
      'RESUELTO': { label: 'Resuelto', class: 'status-resolved', icon: 'fas fa-check-circle' },
      'CERRADO': { label: 'Cerrado', class: 'status-closed', icon: 'fas fa-lock' }
    };
    return statusMap[estado] || { label: estado, class: 'status-default', icon: 'fas fa-question' };
  };

  // Obtener prioridad del ticket
  const getTicketPriority = (prioridad: string) => {
    const priorityMap: Record<string, { label: string; class: string }> = {
      'BAJA': { label: 'Baja', class: 'priority-low' },
      'MEDIA': { label: 'Media', class: 'priority-medium' },
      'ALTA': { label: 'Alta', class: 'priority-high' }
    };
    return priorityMap[prioridad] || { label: prioridad, class: 'priority-default' };
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Verificar permisos
  const canManage = userRole === 'TECNICO';

  if (!canManage) {
    return (
      <div className="technician-dashboard">
        <div className="access-denied">
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder al dashboard de técnicos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="technician-dashboard">
      <div className="dashboard-header">
        <h2>Dashboard de Técnico</h2>
        <button 
          className="btn btn-secondary"
          onClick={loadData}
          disabled={loading}
        >
          <i className="fas fa-sync-alt"></i> Actualizar
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Estadísticas */}
      {estadisticas && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-ticket-alt"></i>
            </div>
            <div className="stat-content">
              <h3>{estadisticas.totalTickets}</h3>
              <p>Total Tickets</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-folder-open"></i>
            </div>
            <div className="stat-content">
              <h3>{estadisticas.ticketsAbiertos}</h3>
              <p>Abiertos</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-cog fa-spin"></i>
            </div>
            <div className="stat-content">
              <h3>{estadisticas.ticketsEnProgreso}</h3>
              <p>En Progreso</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{estadisticas.ticketsResueltos}</h3>
              <p>Resueltos</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-lock"></i>
            </div>
            <div className="stat-content">
              <h3>{estadisticas.ticketsCerrados}</h3>
              <p>Cerrados</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <h3>{estadisticas.tiempoPromedioResolucion}h</h3>
              <p>Tiempo Promedio</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="filters-section">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterEstado === 'TODOS' ? 'active' : ''}`}
            onClick={() => setFilterEstado('TODOS')}
          >
            Todos ({tickets.length})
          </button>
          <button
            className={`filter-btn ${filterEstado === 'ABIERTO' ? 'active' : ''}`}
            onClick={() => setFilterEstado('ABIERTO')}
          >
            Abiertos ({tickets.filter(t => t.estado === 'ABIERTO').length})
          </button>
          <button
            className={`filter-btn ${filterEstado === 'EN_PROGRESO' ? 'active' : ''}`}
            onClick={() => setFilterEstado('EN_PROGRESO')}
          >
            En Progreso ({tickets.filter(t => t.estado === 'EN_PROGRESO').length})
          </button>
          <button
            className={`filter-btn ${filterEstado === 'RESUELTO' ? 'active' : ''}`}
            onClick={() => setFilterEstado('RESUELTO')}
          >
            Resueltos ({tickets.filter(t => t.estado === 'RESUELTO').length})
          </button>
          <button
            className={`filter-btn ${filterEstado === 'CERRADO' ? 'active' : ''}`}
            onClick={() => setFilterEstado('CERRADO')}
          >
            Cerrados ({tickets.filter(t => t.estado === 'CERRADO').length})
          </button>
        </div>
      </div>

      {/* Lista de tickets */}
      <div className="tickets-section">
        <h3>Mis Tickets Asignados</h3>
        
        {loading ? (
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i>
            Cargando tickets...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-folder-open"></i>
            <h4>No hay tickets</h4>
            <p>No se encontraron tickets con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="tickets-grid">
            {filteredTickets.map((ticket) => {
              const status = getTicketStatus(ticket.estado);
              const priority = getTicketPriority(ticket.prioridad);
              
              return (
                <div key={ticket.idTicket} className="ticket-card">
                  <div className="ticket-header">
                    <div className="ticket-title">
                      <h4>Ticket #{ticket.idTicket}</h4>
                      <span className={`priority-badge ${priority.class}`}>
                        {priority.label}
                      </span>
                    </div>
                    <div className="ticket-status">
                      <span className={`status-badge ${status.class}`}>
                        <i className={status.icon}></i>
                        {status.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ticket-content">
                    <div className="ticket-info">
                      <div className="info-row">
                        <span className="label">Ubicación:</span>
                        <span className="value">{ticket.ubicacion}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Categoría:</span>
                        <span className="value">{ticket.categoria}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Creado por:</span>
                        <span className="value">{ticket.creador.nombre} {ticket.creador.apellido}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Fecha creación:</span>
                        <span className="value">{formatDate(ticket.fechaCreacion)}</span>
                      </div>
                    </div>
                    
                    {ticket.consulta && (
                      <div className="ticket-description">
                        <strong>Descripción:</strong>
                        <p>{ticket.consulta}</p>
                      </div>
                    )}
                    
                    {ticket.evidencias && ticket.evidencias.length > 0 && (
                      <div className="ticket-evidences">
                        <strong>Evidencias ({ticket.evidencias.length}):</strong>
                        <div className="evidences-list">
                          {ticket.evidencias.map((evidencia, index) => (
                            <span key={index} className="evidence-item">
                              <i className="fas fa-paperclip"></i>
                              {evidencia.nombreArchivo}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ticket-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => openStatusModal(ticket)}
                    >
                      <i className="fas fa-edit"></i> Cambiar Estado
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de cambio de estado */}
      {showStatusModal && selectedTicket && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cambiar Estado - Ticket #{selectedTicket.idTicket}</h3>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="estado">Nuevo Estado *</label>
                <select
                  id="estado"
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  required
                >
                  <option value="ABIERTO">Abierto</option>
                  <option value="EN_PROGRESO">En Progreso</option>
                  <option value="RESUELTO">Resuelto</option>
                  <option value="CERRADO">Cerrado</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="comentarios">Comentarios</label>
                <textarea
                  id="comentarios"
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder="Comentarios sobre el cambio de estado (opcional)"
                  rows={4}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleStatusChange}
                disabled={!nuevoEstado}
              >
                <i className="fas fa-save"></i> Actualizar Estado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
