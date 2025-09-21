import React, { useState, useEffect } from 'react';
import { api, AsignacionResponseDTO, AsignarTicketRequestDTO, UsuarioSummaryDTO, TicketResponseDTO } from '../../../shared/api';
import './TicketAssignments.css';

interface TicketAssignmentsProps {
  userRole: string;
}

const TicketAssignments: React.FC<TicketAssignmentsProps> = ({ userRole }) => {
  const [asignaciones, setAsignaciones] = useState<AsignacionResponseDTO[]>([]);
  const [ticketsSinAsignar, setTicketsSinAsignar] = useState<TicketResponseDTO[]>([]);
  const [tecnicos, setTecnicos] = useState<UsuarioSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketResponseDTO | null>(null);
  const [selectedTecnico, setSelectedTecnico] = useState<number | null>(null);
  const [comentarios, setComentarios] = useState('');
  const [activeTab, setActiveTab] = useState<'asignados' | 'sin-asignar'>('asignados');

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [asignacionesData, ticketsSinAsignarData, tecnicosData] = await Promise.all([
        api.getTicketsSinAsignar(),
        api.getTicketsSinAsignarAdmin(),
        api.getTechniciansForSelect()
      ]);
      
      setAsignaciones(asignacionesData);
      setTicketsSinAsignar(ticketsSinAsignarData);
      setTecnicos(tecnicosData);
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

  // Abrir modal de asignación
  const openAssignModal = (ticket: TicketResponseDTO) => {
    setSelectedTicket(ticket);
    setSelectedTecnico(null);
    setComentarios('');
    setShowAssignModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowAssignModal(false);
    setSelectedTicket(null);
    setSelectedTecnico(null);
    setComentarios('');
  };

  // Asignar ticket
  const handleAssign = async () => {
    if (!selectedTicket || !selectedTecnico) return;

    try {
      const request: AsignarTicketRequestDTO = {
        ticketId: selectedTicket.id,
        tecnicoId: selectedTecnico,
        comentarios: comentarios.trim() || undefined
      };

      await api.asignarTicket(request);
      closeModal();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar ticket');
      console.error('Error asignando ticket:', err);
    }
  };

  // Reasignar ticket
  const handleReassign = async (asignacion: AsignacionResponseDTO) => {
    if (!selectedTecnico) return;

    try {
      const request: AsignarTicketRequestDTO = {
        ticketId: asignacion.ticketId,
        tecnicoId: selectedTecnico,
        comentarios: comentarios.trim() || undefined
      };

      await api.reasignarTicket(request);
      closeModal();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reasignar ticket');
      console.error('Error reasignando ticket:', err);
    }
  };

  // Desasignar ticket
  const handleUnassign = async (ticketId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres desasignar este ticket?')) {
      return;
    }

    try {
      await api.desasignarTicket(ticketId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desasignar ticket');
      console.error('Error desasignando ticket:', err);
    }
  };

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

  // Obtener prioridad del ticket
  const getTicketPriority = (prioridad: string) => {
    const priorityMap: Record<string, { label: string; class: string }> = {
      'BAJA': { label: 'Baja', class: 'priority-low' },
      'MEDIA': { label: 'Media', class: 'priority-medium' },
      'ALTA': { label: 'Alta', class: 'priority-high' }
    };
    return priorityMap[prioridad] || { label: prioridad, class: 'priority-default' };
  };

  // Verificar permisos
  const canManage = userRole === 'ADMINISTRADOR' || userRole === 'SUPERADMIN';

  if (!canManage) {
    return (
      <div className="ticket-assignments">
        <div className="access-denied">
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para gestionar asignaciones de tickets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-assignments">
      <div className="assignments-header">
        <h2>Gestión de Asignaciones</h2>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={loadData}
            disabled={loading}
          >
            <i className="fas fa-sync-alt"></i> Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="assignments-tabs">
        <button
          className={`tab-button ${activeTab === 'asignados' ? 'active' : ''}`}
          onClick={() => setActiveTab('asignados')}
        >
          <i className="fas fa-user-check"></i>
          Tickets Asignados ({asignaciones.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'sin-asignar' ? 'active' : ''}`}
          onClick={() => setActiveTab('sin-asignar')}
        >
          <i className="fas fa-user-times"></i>
          Sin Asignar ({ticketsSinAsignar.length})
        </button>
      </div>

      {/* Contenido de las tabs */}
      <div className="assignments-content">
        {loading ? (
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i>
            Cargando asignaciones...
          </div>
        ) : activeTab === 'asignados' ? (
          <div className="assigned-tickets">
            {asignaciones.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-user-check"></i>
                <h3>No hay tickets asignados</h3>
                <p>No se encontraron tickets asignados a técnicos.</p>
              </div>
            ) : (
              <div className="tickets-grid">
                {asignaciones.map((asignacion) => (
                  <div key={asignacion.idAsignacion} className="ticket-card assigned">
                    <div className="ticket-header">
                      <h4>Ticket #{asignacion.ticketId}</h4>
                      <div className="ticket-actions">
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => {
                            setSelectedTicket({ id: asignacion.ticketId } as TicketResponseDTO);
                            setShowAssignModal(true);
                          }}
                          title="Reasignar"
                        >
                          <i className="fas fa-exchange-alt"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleUnassign(asignacion.ticketId)}
                          title="Desasignar"
                        >
                          <i className="fas fa-user-times"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="ticket-info">
                      <div className="info-row">
                        <span className="label">Técnico:</span>
                        <span className="value">{asignacion.tecnico.nombre} {asignacion.tecnico.apellido}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Asignado por:</span>
                        <span className="value">{asignacion.asignadoPor.nombre} {asignacion.asignadoPor.apellido}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Fecha asignación:</span>
                        <span className="value">{new Date(asignacion.fechaAsignacion).toLocaleDateString()}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Estado:</span>
                        <span className={`status-badge ${getTicketStatus(asignacion.estado).class}`}>
                          {getTicketStatus(asignacion.estado).label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="unassigned-tickets">
            {ticketsSinAsignar.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-user-times"></i>
                <h3>No hay tickets sin asignar</h3>
                <p>Todos los tickets están asignados a técnicos.</p>
              </div>
            ) : (
              <div className="tickets-grid">
                {ticketsSinAsignar.map((ticket) => (
                  <div key={ticket.id} className="ticket-card unassigned">
                    <div className="ticket-header">
                      <h4>Ticket #{ticket.id}</h4>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => openAssignModal(ticket)}
                        title="Asignar"
                      >
                        <i className="fas fa-user-plus"></i>
                      </button>
                    </div>
                    
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
                        <span className="label">Prioridad:</span>
                        <span className={`priority-badge ${getTicketPriority(ticket.prioridad).class}`}>
                          {getTicketPriority(ticket.prioridad).label}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="label">Estado:</span>
                        <span className={`status-badge ${getTicketStatus(ticket.estado).class}`}>
                          {getTicketStatus(ticket.estado).label}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="label">Fecha creación:</span>
                        <span className="value">{new Date(ticket.fechaCreacion).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de asignación */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {selectedTicket ? 'Asignar Ticket' : 'Reasignar Ticket'} 
                {selectedTicket && ` #${selectedTicket.id}`}
              </h3>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="tecnico">Técnico *</label>
                <select
                  id="tecnico"
                  value={selectedTecnico || ''}
                  onChange={(e) => setSelectedTecnico(parseInt(e.target.value))}
                  required
                >
                  <option value="">Seleccionar técnico</option>
                  {tecnicos.map((tecnico) => (
                    <option key={tecnico.idUsuario} value={tecnico.idUsuario}>
                      {tecnico.nombre} {tecnico.apellido} - {tecnico.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="comentarios">Comentarios</label>
                <textarea
                  id="comentarios"
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder="Comentarios sobre la asignación (opcional)"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleAssign}
                disabled={!selectedTecnico}
              >
                <i className="fas fa-user-plus"></i> Asignar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketAssignments;
