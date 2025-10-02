import "./ClientTracking.css";
import { useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { api } from "@shared/api";
import { useTickets } from "../../hooks/use-tickets";
import { addComment } from "../client_tickets/apiStore";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Clock, 
  User, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Calendar,
  Wrench,
  FileText,
  Send,
  ChevronDown,
  X,
  Upload,
  Paperclip
} from "lucide-react";
import ChatSystem from "./ChatSystem";
import ArchivosConversacion from "./ArchivosConversacion";

interface TicketTracking {
  id: number;
  asunto: string;
  descripcion: string;
  categoria: string;
  estado: string;
  prioridad: string;
  tecnicoAsignado?: string;
  tecnicoEmail?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  historialAsignaciones?: Array<{
    idAsignacion: number;
    ticketId: number;
    ticketTitulo: string;
    tecnicoId: number;
    tecnicoNombre: string;
    tecnicoEmail: string;
    estadoAnterior: string;
    estadoNuevo: string;
    prioridad: string;
    comentario: string;
    fechaAsignacion: string;
    asignadoPor: string;
    tipoOperacion: string;
  }>;
  comentarios?: Array<{
    id: number;
    autor: string;
    mensaje: string;
    fechaCreacion: string;
  }>;
}

export default function ClientTracking() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tickets, isLoading: ticketsLoading, error: ticketsError } = useTickets();
  const [selected, setSelected] = useState<string | undefined>(tickets[0]?.id?.toString());
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam) : 1;
  });
  const ticketsPerPage = 20;
  const [trackingData, setTrackingData] = useState<TicketTracking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  const ticket = useMemo(() => tickets.find(t => t.id.toString() === selected), [tickets, selected]);
  
  // Calcular tickets paginados
  const totalPages = Math.ceil(tickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const endIndex = startIndex + ticketsPerPage;
  const paginatedTickets = tickets.slice(startIndex, endIndex);
  
  // Función para actualizar la URL con el ticket seleccionado
  const updateUrlWithTicket = (ticketId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('ticket', ticketId);
    setSearchParams(newSearchParams);
  };
  
  // Función para manejar la selección de ticket
  const handleTicketSelection = (ticketId: string) => {
    setSelected(ticketId);
    updateUrlWithTicket(ticketId);
  };
  
  // Función para cambiar de página
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    
    // Al cambiar de página, siempre seleccionar el primer ticket de la nueva página
    const newStartIndex = (newPage - 1) * ticketsPerPage;
    const newEndIndex = newStartIndex + ticketsPerPage;
    const newPageTickets = tickets.slice(newStartIndex, newEndIndex);
    
    if (newPageTickets.length > 0) {
      // Limpiar el parámetro de ticket de la URL al navegar por páginas
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('ticket');
      newSearchParams.set('page', newPage.toString());
      setSearchParams(newSearchParams);
      
      // Seleccionar el primer ticket de la página
      setSelected(newPageTickets[0].id.toString());
    }
  };

  // Cargar datos de seguimiento cuando se selecciona un ticket
  useEffect(() => {
    if (selected) {
      // Cargar automáticamente los datos del ticket seleccionado
      loadTrackingData(parseInt(selected));
    }
  }, [selected]);

  // Cargar automáticamente el primer ticket si hay tickets disponibles
  useEffect(() => {
    if (tickets.length > 0 && !selected) {
      setSelected(tickets[0].id.toString());
    }
  }, [tickets, selected]);

  // Detectar parámetro de ticket en la URL y seleccionarlo
  useEffect(() => {
    const ticketParam = searchParams.get('ticket');
    if (ticketParam && tickets.length > 0) {
      // Verificar si el ticket existe en la lista
      const ticketExists = tickets.some(ticket => ticket.id.toString() === ticketParam);
      if (ticketExists) {
        setSelected(ticketParam);
        // Encontrar en qué página está el ticket y actualizar currentPage
        const ticketIndex = tickets.findIndex(ticket => ticket.id.toString() === ticketParam);
        const page = Math.ceil((ticketIndex + 1) / ticketsPerPage);
        if (page !== currentPage) {
          setCurrentPage(page);
        }
      }
    }
  }, [searchParams, tickets, currentPage]);

  // Actualizar URL cuando cambie la página (solo si no viene de la URL)
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const currentPageFromUrl = pageParam ? parseInt(pageParam) : 1;
    
    // Solo actualizar la URL si la página actual es diferente a la de la URL
    if (currentPage !== currentPageFromUrl) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('page', currentPage.toString());
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [currentPage, searchParams, setSearchParams]);

  // Manejar parámetro de página desde la URL (solo al cargar inicialmente)
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const ticketParam = searchParams.get('ticket');
    
    if (pageParam && !ticketParam) {
      // Solo cambiar página si NO hay un ticket específico en la URL
      const pageFromUrl = parseInt(pageParam);
      if (pageFromUrl !== currentPage && pageFromUrl >= 1 && pageFromUrl <= totalPages) {
        setCurrentPage(pageFromUrl);
      }
    }
  }, [searchParams, currentPage, totalPages]);

  // WebSocket para actualizaciones en tiempo real del ticket
  useEffect(() => {
    if (selected) {
      // Conectar WebSocket para el ticket específico
      const ws = new WebSocket(`ws://localhost:8080/ws/ticket/${selected}`);
      
      ws.onopen = () => {
        console.log('🔔 WebSocket conectado para ticket:', selected);
        setWsConnection(ws);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('🔔 Actualización en tiempo real recibida:', data);
          
          // Recargar datos del ticket cuando hay cambios
          if (data.type === 'ticket_updated' || data.type === 'assignment_updated' || data.type === 'comment_added') {
            loadTrackingData(parseInt(selected));
          }
        } catch (error) {
          console.error('Error procesando mensaje WebSocket:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('🔔 WebSocket desconectado para ticket:', selected);
        setWsConnection(null);
      };
      
      ws.onerror = (error) => {
        console.error('🔔 Error en WebSocket:', error);
      };
      
      // Cleanup al desmontar o cambiar ticket
      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    }
  }, [selected]);

  const loadTrackingData = async (ticketId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      api.reloadToken();
      const data = await api.getTicketTracking(ticketId);
      
      // Debug logs
      console.log('🔍 [TRACKING DEBUG] Datos recibidos del backend:', data);
      console.log('🔍 [TRACKING DEBUG] Estado del ticket:', data?.estado);
      console.log('🔍 [TRACKING DEBUG] Técnico asignado:', data?.tecnicoAsignado);
      console.log('🔍 [TRACKING DEBUG] Técnico email:', data?.tecnicoEmail);
      console.log('🔍 [TRACKING DEBUG] Historial asignaciones:', data?.historialAsignaciones);
      
      setTrackingData(data);
    } catch (err) {
      console.error('Error cargando seguimiento:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar seguimiento');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmar resolución del ticket (cliente acepta la solución)
  const handleConfirmarResolucion = async (ticketId: number) => {
    setShowConfirmModal(true);
  };

  const confirmarCierreTicket = async () => {
    if (!selected) return;
    
    try {
      await api.responderResolucionTicket(
        parseInt(selected),
        'CONFIRMAR',
        'Cliente confirmó resolución satisfactoria'
      );
      setShowConfirmModal(false);
      // Recargar datos del ticket
      await loadTrackingData(parseInt(selected));
      alert('✅ Ticket cerrado exitosamente. Gracias por confirmar.');
    } catch (error) {
      console.error('Error cerrando ticket:', error);
      alert('❌ Error al cerrar el ticket');
    }
  };

  // Escalar ticket (cliente no está satisfecho)
  const handleEscalarTicket = async (ticketId: number) => {
    setShowEscalateModal(true);
  };

  const confirmarEscalacion = async () => {
    if (!selected) return;
    
    try {
      await api.responderResolucionTicket(
        parseInt(selected),
        'RECHAZAR',
        'Cliente solicitó escalamiento - la solución no fue satisfactoria'
      );
      setShowEscalateModal(false);
      // Recargar datos del ticket
      await loadTrackingData(parseInt(selected));
      alert('✅ Ticket reabierto y marcado como PENDIENTE. Un administrador asignará un técnico de mayor nivel pronto.');
    } catch (error) {
      console.error('Error escalando ticket:', error);
      alert('❌ Error al escalar el ticket');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pendiente':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
      case 'en_ejecucion':
        return <Wrench className="w-4 h-4" />;
      case 'resolved':
      case 'terminado':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
      case 'cerrado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
      case 'en_ejecucion':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
      case 'terminado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
      case 'cerrado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      case 'baja':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending || !selected || !ticket) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      // Usar el método con query que envía usuario_id como parámetro
      console.log('🔥 ENVIANDO MENSAJE CON MÉTODO CON QUERY...');
      await api.enviarComentarioConQuery(parseInt(selected), messageText);
      
      // Agregar comentario localmente usando el apiStore
      addComment(selected, 'client', messageText);
      
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      
      // Intentar método funcional como fallback
      try {
        console.log('🚨 Intentando método funcional...');
        await api.enviarComentarioFuncional(parseInt(selected), messageText);
        
        // Agregar comentario localmente usando el apiStore
        addComment(selected, 'client', messageText);
      } catch (funcionalError) {
        console.error('❌ ERROR EN MÉTODO FUNCIONAL:', funcionalError);
        
        // Intentar método de emergencia como último recurso
        try {
          console.log('🚨 Intentando método de emergencia...');
          await api.enviarComentarioEmergencia(parseInt(selected), messageText);
          console.log('✅ MENSAJE ENVIADO CON MÉTODO DE EMERGENCIA');
          
          // Agregar comentario localmente usando el apiStore
          addComment(selected, 'client', messageText);
        } catch (emergencyError) {
          console.error('❌ ERROR EN MÉTODO DE EMERGENCIA:', emergencyError);
          setNewMessage(messageText);
        }
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.events]);

  return (
    <div className="section grid gap-6" data-section="tracking">
      <div>
        <h1 className="page-title">{t("client.tracking_title")}</h1>
        <p className="page-subtitle">{t("client.tracking_desc")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">{t("client.select_ticket")}</CardTitle>
        </CardHeader>
        <CardContent>
          <select className="generic-select" value={selected || ''} onChange={(e) => handleTicketSelection(e.target.value)}>
            {paginatedTickets.length > 0 ? (
              paginatedTickets.map(t => (
                <option key={t.id} value={t.id}>
                  #{t.id} • {t.message.slice(0,40)}... • {t.status}
                </option>
              ))
            ) : (
              <option value="">No hay tickets disponibles</option>
            )}
          </select>
          
          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} ({tickets.length} tickets total)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm font-medium">
                  {startIndex + 1}-{Math.min(endIndex, tickets.length)} de {tickets.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selected && ticket ? (
        trackingData?.estado === 'CERRADO' ? (
          /* Vista para ticket cerrado - solo mensaje */
          <div className="flex items-center justify-center min-h-[500px]">
            <Card className="max-w-lg w-full border-gray-200 bg-gray-50 dark:bg-gray-950 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3 text-gray-900 dark:text-gray-100 justify-center">
                  <XCircle className="w-8 h-8" />
                  Ticket Cerrado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Información básica del ticket */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Ticket:</span>
                    <span className="text-sm font-mono">#{ticket.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Asunto:</span>
                    <span className="text-sm font-semibold">{ticket.message}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Técnico:</span>
                    <span className="text-sm">{trackingData?.tecnicoNombre || 'Sin asignar'}</span>
                  </div>
                </div>

                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-gray-600 dark:text-gray-400" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Ticket Cerrado Exitosamente
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Este ticket fue resuelto y confirmado. No se requieren más acciones.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : trackingData?.estado === 'RESUELTO' ? (
          /* Vista especial para ticket resuelto - centrado */
          <div className="flex items-center justify-center min-h-[500px]">
            <Card className="max-w-lg w-full border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3 text-green-900 dark:text-green-100 justify-center">
                  <CheckCircle className="w-8 h-8" />
                  Ticket Resuelto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Información básica del ticket */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Ticket:</span>
                    <span className="text-sm font-mono">#{ticket.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Asunto:</span>
                    <span className="text-sm font-semibold">{ticket.message}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Técnico:</span>
                    <span className="text-sm">{trackingData?.tecnicoNombre || 'Sin asignar'}</span>
                  </div>
                </div>

                <div className="text-center py-4">
                  <p className="text-base text-green-800 dark:text-green-200 mb-3">
                    El técnico ha marcado este ticket como resuelto.
                  </p>
                  <p className="text-xl font-bold text-green-900 dark:text-green-100">
                    ¿La solución fue satisfactoria?
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-base"
                    onClick={() => handleConfirmarResolucion(parseInt(selected))}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Sí, Confirmar y Cerrar Ticket
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 h-12 text-base"
                    onClick={() => handleEscalarTicket(parseInt(selected))}
                  >
                    <AlertCircle className="w-5 h-5 mr-2" />
                    No, Necesito Más Ayuda
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Si rechazas, el ticket volverá a PENDIENTE y un administrador lo reasignará.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Información del Ticket Seleccionado */}
            <div className="lg:col-span-1 space-y-4">
            <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Información del ticket
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEvidenceModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Paperclip className="w-4 h-4" />
                    Evidencia
                  </Button>
                </div>
            </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">ID:</span>
                    <span className="text-sm font-mono">#{ticket.id}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Asunto:</span>
                    <span className="text-sm max-w-[200px] truncate" title={ticket.message}>
                      {ticket.message}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Prioridad:</span>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Estado:</span>
                    <Badge className={`${getStatusColor(trackingData?.estado || ticket.status)} flex items-center gap-1`}>
                      {getStatusIcon(trackingData?.estado || ticket.status)}
                      {(trackingData?.estado || ticket.status).toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Técnico:</span>
                    <span className="text-sm">{trackingData?.tecnicoNombre || trackingData?.tecnicoEmail || 'Sin asignar'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Ubicación:</span>
                    <span className="text-sm">{ticket.location}</span>
                </div>
                </div>
              </CardContent>
            </Card>

            {/* Historial del Ticket */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Historial del Ticket
                </CardTitle>
              </CardHeader>
            <CardContent>
              <div className="space-y-3">
                  {/* 1. Evento de creación - SIEMPRE PRIMERO */}
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-blue-900">Ticket creado</div>
                      <div className="text-xs text-blue-600">{formatTimestamp(ticket.createdAt)}</div>
                    </div>
                  </div>

                {/* 2. SIEMPRE mostrar asignación como segundo paso */}
                {trackingData?.tecnicoEmail && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-green-900">
                        Asignado a {trackingData.tecnicoNombre || trackingData.tecnicoAsignado || trackingData.tecnicoEmail}
                      </div>
                      <div className="text-xs text-green-600">
                        {formatTimestamp(trackingData.fechaCreacion)}
                      </div>
                    </div>
                  </div>
                )}

                  {/* 3. Mostrar SOLO la ÚLTIMA escalación fuera del modal */}
                  {(() => {
                    const escalaciones = trackingData?.historialAsignaciones?.filter(asignacion => asignacion.tipoOperacion === 'ESCALAMIENTO') || [];
                    const ultimaEscalacion = escalaciones[escalaciones.length - 1];
                    
                    return ultimaEscalacion ? (
                      <div key={`escalacion-resumen-ultima`} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-orange-900">
                            Escalado a {ultimaEscalacion.tecnicoNombre}
                          </div>
                          <div className="text-xs text-orange-600">
                            {formatTimestamp(ultimaEscalacion.fechaAsignacion)}
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Botón Ver más historial */}
                  <div className="flex justify-center pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowHistoryModal(true)}
                      className="flex items-center gap-2"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Ver más historial
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat y Comunicación */}
          <div className="lg:col-span-2">
            <ChatSystem 
              ticketId={parseInt(selected)} 
              onMessageSent={(message) => {
                // Recargar datos del ticket
                if (selected) {
                  loadTrackingData(parseInt(selected));
                }
              }}
            />
          </div>
        </div>
        )
      ) : selected ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-sm text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p>Ticket no encontrado</p>
              <p className="text-xs mt-1">Selecciona un ticket válido del dropdown</p>
            </div>
          </CardContent>
        </Card>
      ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-sm text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p>Selecciona un ticket para ver su seguimiento</p>
              <p className="text-xs mt-1">Usa el dropdown de arriba para elegir un ticket</p>
                  </div>
                </CardContent>
              </Card>
      )}

      {/* Modal de Historial Completo */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Historial Completo del Ticket
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ticket #{ticket?.id} • {ticket?.message}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* 1. Evento de creación */}
                <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Ticket creado</div>
                    <div className="text-xs text-blue-600 dark:text-blue-300">{formatTimestamp(ticket?.createdAt || '')}</div>
                  </div>
                </div>

                {/* 2. Asignación */}
                {trackingData?.tecnicoEmail && (
                  <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-green-900 dark:text-green-100">
                        Asignado a {trackingData.tecnicoNombre || trackingData.tecnicoAsignado || trackingData.tecnicoEmail}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-300">
                        {formatTimestamp(trackingData.fechaCreacion)}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Escalaciones - MOSTRAR TODAS en orden cronológico */}
                {trackingData?.historialAsignaciones
                  ?.filter(asignacion => asignacion.tipoOperacion === 'ESCALAMIENTO')
                  ?.sort((a, b) => new Date(a.fechaAsignacion).getTime() - new Date(b.fechaAsignacion).getTime())
                  ?.map((escalacion, index) => (
                    <div key={`escalacion-${index}`} className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-orange-900 dark:text-orange-100">
                          Escalado a {escalacion.tecnicoNombre}
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-300">
                          {formatTimestamp(escalacion.fechaAsignacion)}
                        </div>
                      </div>
                    </div>
                  ))}

                {/* 4. Reasignaciones */}
                {trackingData?.historialAsignaciones?.filter(asignacion => asignacion.tipoOperacion === 'REASIGNAR').map((asignacion, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        Reasignado a {asignacion.tecnicoNombre}
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-300">{formatTimestamp(asignacion.fechaAsignacion)}</div>
                    </div>
                  </div>
                ))}

                {/* 5. Estado actual - Solo si NO hay escalaciones */}
                {(() => {
                  const tieneEscalaciones = trackingData?.historialAsignaciones?.some(asignacion => 
                    asignacion.tipoOperacion === 'ESCALAMIENTO'
                  );
                  
                  return trackingData?.fechaActualizacion && 
                    trackingData.fechaActualizacion !== trackingData.fechaCreacion &&
                    !tieneEscalaciones;
                })() && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="w-3 h-3 bg-gray-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Estado actual: {trackingData.estado}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">{formatTimestamp(trackingData.fechaActualizacion)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando {1 + (trackingData?.tecnicoEmail ? 1 : 0) + (trackingData?.historialAsignaciones?.filter(a => a.tipoOperacion === 'ESCALAMIENTO').length || 0) + (trackingData?.historialAsignaciones?.filter(a => a.tipoOperacion === 'REASIGNAR').length || 0) + (trackingData?.fechaActualizacion && trackingData.fechaActualizacion !== trackingData.fechaCreacion ? 1 : 0)} eventos del historial
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowHistoryModal(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Subida de Evidencia */}
      {showEvidenceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Paperclip className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Archivos y Evidencias
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ticket #{ticket?.id} • {ticket?.message}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowEvidenceModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Contenido del Modal */}
            <div className="flex-1 p-6">
              <ArchivosConversacion 
                ticketId={parseInt(selected)}
                onArchivoSubido={() => {
                  // Recargar datos del ticket si es necesario
                  if (selected) {
                    loadTrackingData(parseInt(selected));
                  }
                }}
              />
            </div>

            {/* Footer del Modal */}
            <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowEvidenceModal(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Cierre */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Confirmar Resolución
              </h3>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              ¿Confirmas que el problema ha sido resuelto satisfactoriamente? Al confirmar, el ticket se cerrará definitivamente.
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={confirmarCierreTicket}
              >
                Sí, Cerrar Ticket
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Escalamiento */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Escalar Ticket
              </h3>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              ¿El problema no fue resuelto satisfactoriamente? El ticket volverá a estado PENDIENTE y un administrador asignará un técnico de mayor nivel para revisar tu caso.
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEscalateModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                onClick={confirmarEscalacion}
              >
                Sí, Escalar Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}