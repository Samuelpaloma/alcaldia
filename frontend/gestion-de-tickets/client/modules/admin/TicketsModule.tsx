import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, TicketResponseDTO, UsuarioDTO, CategoriaSimpleDTO } from '../../../shared/api';
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  FileText,
  Eye,
  UserPlus,
  UserCheck,
  X,
  MessageSquare,
  Send
} from 'lucide-react';
import './TicketsModule.css';

interface TicketsModuleProps {
  userRole: string;
}

const TicketsModule: React.FC<TicketsModuleProps> = ({ userRole }) => {
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([]);
  const [tecnicos, setTecnicos] = useState<UsuarioDTO[]>([]);
  const [categorias, setCategorias] = useState<CategoriaSimpleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [priorityFilter, setPriorityFilter] = useState('TODAS');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketResponseDTO | null>(null);
  const [selectedTecnico, setSelectedTecnico] = useState('');
  const [ticketHistory, setTicketHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 TicketsModule: Cargando datos...');
      
      const [ticketsData, tecnicosData, categoriasData] = await Promise.all([
        api.getTodosLosTickets(),
        api.getTechniciansForSelect(),
        api.getActiveCategories()
      ]);
      
      console.log('📊 TicketsModule: Datos recibidos:', {
        tickets: ticketsData,
        tecnicos: tecnicosData,
        categorias: categoriasData
      });
      
      setTickets(ticketsData || []);
      setTecnicos(tecnicosData);
      setCategorias(categoriasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
      console.error('❌ TicketsModule: Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTickets = (tickets || []).filter(ticket => {
    // Buscar solo en asunto y descripción manual (si existe)
    const descripcion = ticket.descripcion || '';
    const matchesSearch = ticket.asunto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'TODOS' || ticket.estado === statusFilter;
    const matchesPriority = priorityFilter === 'TODAS' || ticket.prioridad === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAssignTicket = async () => {
    if (!selectedTicket || !selectedTecnico) return;
    
    try {
      // Si ya tiene técnico asignado, es una escalación
      if (selectedTicket.tecnicoEmail) {
        await api.escalarTicket(selectedTicket.id, parseInt(selectedTecnico));
      } else {
        await api.asignarTicket(selectedTicket.id, parseInt(selectedTecnico));
      }
      
      await loadData(); // Recargar datos
      setShowAssignModal(false);
      setSelectedTicket(null);
      setSelectedTecnico('');
    } catch (err) {
      console.error('Error asignando/escalando ticket:', err);
    }
  };

  const handleViewTicket = async (ticket: TicketResponseDTO) => {
    setSelectedTicket(ticket);
    setShowTrackingModal(true);
    await loadTicketHistory(ticket.id);
  };

  const loadTicketHistory = async (ticketId: number) => {
    try {
      setLoadingHistory(true);
      // Aquí cargaríamos el historial real desde el backend
      // Por ahora lo dejamos vacío hasta que implementemos el endpoint
      setTicketHistory([]);
    } catch (err) {
      console.error('Error cargando historial del ticket:', err);
      setTicketHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ABIERTO':
        return <AlertCircle className="w-4 h-4" />;
      case 'EN_PROGRESO':
        return <Clock className="w-4 h-4" />;
      case 'RESUELTO':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABIERTO':
        return 'status-open';
      case 'EN_PROGRESO':
        return 'status-progress';
      case 'RESUELTO':
        return 'status-resolved';
      case 'CERRADO':
        return 'status-closed';
      default:
        return 'status-default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ALTA':
        return 'priority-high';
      case 'MEDIA':
        return 'priority-medium';
      case 'BAJA':
        return 'priority-low';
      default:
        return 'priority-default';
    }
  };

  if (loading) {
    return (
      <div className="tickets-module">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tickets-module">
      <div className="module-header">
        <div className="header-content">
          <h1 className="page-title">Gestión de Tickets</h1>
          <p className="page-subtitle">Administra y asigna tickets del sistema</p>
        </div>
      </div>

      {error && (
        <Card className="error-card">
          <CardContent className="p-4">
            <div className="flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros y búsqueda */}
      <Card className="filters-card">
        <CardContent className="p-6">
          <div className="filters-grid">
            <div className="search-container">
              <Search className="search-icon" />
              <Input
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <Filter className="w-4 h-4 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="ABIERTO">Abierto</option>
                <option value="EN_PROGRESO">En Progreso</option>
                <option value="RESUELTO">Resuelto</option>
                <option value="CERRADO">Cerrado</option>
              </select>
            </div>
            
            <div className="filter-group">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="filter-select"
              >
                <option value="TODAS">Todas las prioridades</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Tickets ({filteredTickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="empty-state">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron tickets</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredTickets.map(ticket => (
                <div key={ticket.id} className="bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 min-h-[200px] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-semibold text-primary text-sm">#{ticket.id}</div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(ticket.estado)}`}>
                      {getStatusIcon(ticket.estado)}
                      <span>{ticket.estado}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4 flex-1">
                    <h3 className="font-semibold text-foreground mb-2 text-base leading-tight">{ticket.asunto}</h3>
                    {ticket.descripcion && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {ticket.descripcion.length > 100 
                          ? `${ticket.descripcion.substring(0, 100)}...` 
                          : ticket.descripcion}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">Creador:</span>
                      <span className="text-foreground font-medium">{ticket.creadorNombre || ticket.nombre || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">Prioridad:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getPriorityColor(ticket.prioridad)}`}>
                        {ticket.prioridad}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">Categoría:</span>
                      <span className="text-foreground font-medium">{ticket.categoria}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">Creado:</span>
                      <span className="text-foreground font-medium">
                        {new Date(ticket.fechaCreacion).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">Técnico:</span>
                      <span className="text-foreground font-medium">
                        {ticket.tecnicoEmail || 'Sin asignar'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-auto pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowAssignModal(true);
                      }}
                      className="flex-1 h-8 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {ticket.tecnicoEmail ? (
                        <>
                          <UserCheck className="w-3 h-3 mr-1.5" />
                          Escalar
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3 mr-1.5" />
                          Asignar
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTicket(ticket)}
                      className="flex-1 h-8 text-xs font-medium hover:bg-secondary hover:text-secondary-foreground transition-colors"
                    >
                      <Eye className="w-3 h-3 mr-1.5" />
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de asignación */}
      {showAssignModal && selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {selectedTicket.tecnicoEmail ? 'Escalar Ticket' : 'Asignar Ticket'} #{selectedTicket.id}
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Seleccionar Técnico</label>
                <select
                  value={selectedTecnico}
                  onChange={(e) => setSelectedTecnico(e.target.value)}
                  className="form-select"
                >
                  <option value="">Seleccionar técnico...</option>
                  {tecnicos.map(tecnico => (
                    <option key={tecnico.id} value={tecnico.id}>
                      {tecnico.nombreCompleto} - {tecnico.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="ticket-preview">
                <h4 className="preview-title">Vista previa del ticket</h4>
                <div className="preview-content">
                  <p><strong>Asunto:</strong> {selectedTicket.asunto}</p>
                  <p><strong>Prioridad:</strong> {selectedTicket.prioridad}</p>
                  <p><strong>Estado:</strong> {selectedTicket.estado}</p>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <Button
                variant="outline"
                onClick={() => setShowAssignModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAssignTicket}
                disabled={!selectedTecnico}
                className="btn-primary"
              >
                {selectedTicket.tecnicoEmail ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Escalar Ticket
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Asignar Ticket
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seguimiento del Ticket */}
      {showTrackingModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Seguimiento del Ticket #{selectedTicket.id}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedTicket.asunto}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTrackingModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Contenido del Modal */}
            <div className="flex h-[70vh]">
              {/* Panel de Información del Ticket */}
              <div className="w-1/3 p-6 border-r border-border bg-muted/20">
                <h3 className="font-semibold text-foreground mb-4">Información del Ticket</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</label>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium uppercase mt-1 ${getStatusColor(selectedTicket.estado)}`}>
                      {getStatusIcon(selectedTicket.estado)}
                      <span>{selectedTicket.estado}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prioridad</label>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase mt-1 ${getPriorityColor(selectedTicket.prioridad)}`}>
                      {selectedTicket.prioridad}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categoría</label>
                    <p className="text-sm text-foreground mt-1">{selectedTicket.categoria}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Creado</label>
                    <p className="text-sm text-foreground mt-1">
                      {new Date(selectedTicket.fechaCreacion).toLocaleString()}
                    </p>
                  </div>

                  {selectedTicket.descripcion && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Descripción</label>
                      <p className="text-sm text-foreground mt-1">
                        {selectedTicket.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Panel de Historial de Mensajes */}
              <div className="flex-1 flex flex-col">
                {/* Header del Historial */}
                <div className="p-4 border-b border-border bg-muted/10">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Historial de Comunicación
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mensajes y actualizaciones del ticket
                  </p>
                </div>

                {/* Área de Historial de Mensajes */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Cargando historial...</span>
                      </div>
                    </div>
                  ) : ticketHistory.length > 0 ? (
                    ticketHistory.map((message, index) => (
                      <div key={index} className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.tipo === 'sistema' ? 'bg-primary/10' :
                          message.tipo === 'admin' ? 'bg-blue-500/10' :
                          message.tipo === 'tecnico' ? 'bg-green-500/10' : 'bg-muted/10'
                        }`}>
                          {message.tipo === 'sistema' ? <FileText className="w-4 h-4 text-primary" /> :
                           message.tipo === 'admin' ? <UserPlus className="w-4 h-4 text-blue-500" /> :
                           message.tipo === 'tecnico' ? <User className="w-4 h-4 text-green-500" /> :
                           <MessageSquare className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-foreground">{message.autor}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.fecha).toLocaleString()}
                            </span>
                          </div>
                          <div className={`rounded-lg p-3 ${
                            message.tipo === 'sistema' ? 'bg-muted/50' :
                            message.tipo === 'admin' ? 'bg-blue-50 dark:bg-blue-950/20' :
                            message.tipo === 'tecnico' ? 'bg-green-50 dark:bg-green-950/20' :
                            'bg-muted/30'
                          }`}>
                            <p className="text-sm text-foreground">{message.contenido}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No hay historial de mensajes</p>
                      <p className="text-xs mt-1">Los mensajes y actualizaciones aparecerán aquí cuando estén disponibles</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsModule;
