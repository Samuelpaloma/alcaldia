import React, { useState, useEffect } from 'react';
import { api, TicketResponseDTO, UsuarioDTO } from '../../../shared/api';
import './TicketsManagement.css';

const TicketsManagement: React.FC = () => {
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([]);
  const [tecnicos, setTecnicos] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    estado: '',
    tecnico: '',
    busqueda: ''
  });
  const [ticketSeleccionado, setTicketSeleccionado] = useState<TicketResponseDTO | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [asignacion, setAsignacion] = useState({
    tecnicoId: '',
    comentario: ''
  });

  // Cargar datos iniciales
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ticketsData, tecnicosData] = await Promise.all([
        api.getTodosLosTickets(),
        api.getTechnicians(0, 100)
      ]);
      
      setTickets(ticketsData);
      setTecnicos(tecnicosData.content || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrar tickets
  const ticketsFiltrados = tickets.filter(ticket => {
    const cumpleEstado = !filtros.estado || ticket.estado === filtros.estado;
    const cumpleTecnico = !filtros.tecnico || ticket.tecnicoAsignado === filtros.tecnico;
    const cumpleBusqueda = !filtros.busqueda || 
      ticket.asunto.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      ticket.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    return cumpleEstado && cumpleTecnico && cumpleBusqueda;
  });

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

  // Asignar ticket
  const handleAsignarTicket = async () => {
    if (!ticketSeleccionado || !asignacion.tecnicoId) return;

    try {
      await api.asignarTicket({
        ticketId: ticketSeleccionado.id,
        tecnicoId: parseInt(asignacion.tecnicoId),
        comentario: asignacion.comentario
      });
      
      setMostrarModal(false);
      setTicketSeleccionado(null);
      setAsignacion({ tecnicoId: '', comentario: '' });
      loadData(); // Recargar datos
    } catch (err) {
      console.error('Error asignando ticket:', err);
    }
  };

  // Cambiar estado del ticket
  const handleCambiarEstado = async (ticketId: number, nuevoEstado: string) => {
    try {
      await api.cambiarEstadoTicket({
        ticketId,
        nuevoEstado,
        comentario: `Estado cambiado a ${nuevoEstado}`
      });
      loadData(); // Recargar datos
    } catch (err) {
      console.error('Error cambiando estado:', err);
    }
  };

  if (loading) {
    return (
      <div className="tickets-management">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">Cargando tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tickets-management">
      <div className="tickets-header">
        <h1 className="tickets-title">Gestión de Tickets</h1>
        <p className="tickets-subtitle">Administra todos los tickets del sistema</p>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="filters-container">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="ABIERTO">Abierto</option>
              <option value="EN_PROGRESO">En Progreso</option>
              <option value="RESUELTO">Resuelto</option>
              <option value="CERRADO">Cerrado</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Técnico</label>
            <select
              value={filtros.tecnico}
              onChange={(e) => setFiltros({ ...filtros, tecnico: e.target.value })}
              className="filter-select"
            >
              <option value="">Todos los técnicos</option>
              {tecnicos.map(tecnico => (
                <option key={tecnico.id} value={tecnico.nombreCompleto}>
                  {tecnico.nombreCompleto}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Búsqueda</label>
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              placeholder="Buscar por asunto o descripción..."
              className="filter-input"
            />
          </div>
        </div>
      </div>

      {/* Lista de tickets */}
      <div className="tickets-list">
        {ticketsFiltrados.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-ticket-alt text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay tickets</h3>
            <p className="text-gray-600">No se encontraron tickets con los filtros aplicados</p>
          </div>
        ) : (
          <div className="tickets-grid">
            {ticketsFiltrados.map(ticket => {
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
                      <div className="ticket-info">
                        <span className="ticket-label">Categoría:</span>
                        <span className="ticket-value">{ticket.categoria}</span>
                      </div>
                      <div className="ticket-info">
                        <span className="ticket-label">Prioridad:</span>
                        <span className="ticket-value">{ticket.prioridad}</span>
                      </div>
                      <div className="ticket-info">
                        <span className="ticket-label">Técnico:</span>
                        <span className="ticket-value">
                          {ticket.tecnicoAsignado || 'Sin asignar'}
                        </span>
                      </div>
                      <div className="ticket-info">
                        <span className="ticket-label">Fecha:</span>
                        <span className="ticket-value">
                          {new Date(ticket.fechaCreacion).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ticket-actions">
                    <button
                      onClick={() => {
                        setTicketSeleccionado(ticket);
                        setMostrarModal(true);
                      }}
                      className="btn-assign"
                      disabled={!!ticket.tecnicoAsignado}
                    >
                      <i className="fas fa-user-plus mr-2"></i>
                      {ticket.tecnicoAsignado ? 'Reasignar' : 'Asignar'}
                    </button>
                    
                    <button
                      onClick={() => handleCambiarEstado(ticket.id, 'EN_PROGRESO')}
                      className="btn-progress"
                      disabled={ticket.estado === 'EN_PROGRESO'}
                    >
                      <i className="fas fa-play mr-2"></i>
                      En Progreso
                    </button>
                    
                    <button
                      onClick={() => handleCambiarEstado(ticket.id, 'RESUELTO')}
                      className="btn-resolve"
                      disabled={ticket.estado === 'RESUELTO'}
                    >
                      <i className="fas fa-check mr-2"></i>
                      Resolver
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de asignación */}
      {mostrarModal && ticketSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Asignar Ticket</h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="modal-close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Ticket</label>
                <p className="form-value">{ticketSeleccionado.asunto}</p>
              </div>
              
              <div className="form-group">
                <label className="form-label">Técnico</label>
                <select
                  value={asignacion.tecnicoId}
                  onChange={(e) => setAsignacion({ ...asignacion, tecnicoId: e.target.value })}
                  className="form-select"
                >
                  <option value="">Seleccionar técnico</option>
                  {tecnicos.map(tecnico => (
                    <option key={tecnico.id} value={tecnico.id}>
                      {tecnico.nombreCompleto}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Comentario (opcional)</label>
                <textarea
                  value={asignacion.comentario}
                  onChange={(e) => setAsignacion({ ...asignacion, comentario: e.target.value })}
                  className="form-textarea"
                  rows={3}
                  placeholder="Comentario sobre la asignación..."
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setMostrarModal(false)}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleAsignarTicket}
                className="btn-confirm"
                disabled={!asignacion.tecnicoId}
              >
                Asignar Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsManagement;
