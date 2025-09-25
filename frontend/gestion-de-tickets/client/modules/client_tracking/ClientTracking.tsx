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
import { useSearchParams } from "react-router-dom";
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
  X
} from "lucide-react";
import ChatSystem from "./ChatSystem";

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
  const [searchParams] = useSearchParams();
  const { tickets, isLoading: ticketsLoading, error: ticketsError } = useTickets();
  const [selected, setSelected] = useState<string | undefined>(tickets[0]?.id?.toString());
  const [trackingData, setTrackingData] = useState<TicketTracking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ticket = useMemo(() => tickets.find(t => t.id.toString() === selected), [tickets, selected]);

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
      }
    }
  }, [searchParams, tickets]);

  const loadTrackingData = async (ticketId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      api.reloadToken();
      const data = await api.getTicketTracking(ticketId);
      setTrackingData(data);
    } catch (err) {
      console.error('Error cargando seguimiento:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar seguimiento');
    } finally {
      setIsLoading(false);
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
          <select className="generic-select" value={selected} onChange={(e)=>setSelected(e.target.value)}>
            {tickets.length > 0 ? (
              tickets.map(t => (
                <option key={t.id} value={t.id}>
                  #{t.id} • {t.message.slice(0,40)}... • {t.status}
                </option>
              ))
            ) : (
              <option value="">No hay tickets disponibles</option>
            )}
          </select>
        </CardContent>
      </Card>

      {selected && ticket ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Información del Ticket Seleccionado */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Información del ticket
                </CardTitle>
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
                    <Badge className={`${getStatusColor(ticket.status)} flex items-center gap-1`}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Técnico:</span>
                    <span className="text-sm">{ticket.technician || 'Sin asignar'}</span>
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
                          Asignado a {trackingData.tecnicoEmail}
                        </div>
                        <div className="text-xs text-green-600">
                          {formatTimestamp(trackingData.fechaCreacion)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Mostrar escalación si existe */}
                  {trackingData?.historialAsignaciones?.find(asignacion => asignacion.tipoOperacion === 'ESCALAR') && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-orange-900">
                          Escalado a {trackingData.historialAsignaciones.find(a => a.tipoOperacion === 'ESCALAR')?.tecnicoNombre}
                        </div>
                        <div className="text-xs text-orange-600">
                          {formatTimestamp(trackingData.historialAsignaciones.find(a => a.tipoOperacion === 'ESCALAR')?.fechaAsignacion || '')}
                        </div>
                      </div>
                    </div>
                  )}

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
                        Asignado a {trackingData.tecnicoEmail}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-300">
                        {formatTimestamp(trackingData.fechaCreacion)}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Escalación */}
                {trackingData?.historialAsignaciones?.find(asignacion => asignacion.tipoOperacion === 'ESCALAR') && (
                  <div className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-orange-900 dark:text-orange-100">
                        Escalado a {trackingData.historialAsignaciones.find(a => a.tipoOperacion === 'ESCALAR')?.tecnicoNombre}
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-300">
                        {formatTimestamp(trackingData.historialAsignaciones.find(a => a.tipoOperacion === 'ESCALAR')?.fechaAsignacion || '')}
                      </div>
                    </div>
                  </div>
                )}

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

                {/* 5. Estado actual */}
                {trackingData?.fechaActualizacion && trackingData.fechaActualizacion !== trackingData.fechaCreacion && (
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
                Mostrando {trackingData?.historialAsignaciones?.length || 0 + 2} eventos del historial
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
    </div>
  );
}