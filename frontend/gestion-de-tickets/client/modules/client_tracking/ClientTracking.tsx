import "./ClientTracking.css";
import { useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { api } from "@shared/api";
import { getTickets, subscribe, Ticket } from "../client_tickets/apiStore";
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
  Send
} from "lucide-react";

interface TicketTracking {
  id: number;
  asunto: string;
  descripcion: string;
  categoria: string;
  estado: string;
  prioridad: string;
  tecnicoAsignado?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  comentarios?: Array<{
    id: number;
    autor: string;
    mensaje: string;
    fechaCreacion: string;
  }>;
}

export default function ClientTracking() {
  const { t } = useI18n();
  const [tickets, setTickets] = useState<Ticket[]>(getTickets());
  const [selected, setSelected] = useState<string | undefined>(tickets[0]?.id?.toString());
  const [trackingData, setTrackingData] = useState<TicketTracking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = subscribe(() => setTickets(getTickets()));
    return () => unsub();
  }, []);

  const ticket = useMemo(() => tickets.find(t => t.id.toString() === selected), [tickets, selected]);

  // Cargar datos de seguimiento cuando se selecciona un ticket
  useEffect(() => {
    if (selected) {
      // Por ahora, no cargamos datos del backend, usamos los datos locales
      // loadTrackingData(parseInt(selected));
    }
  }, [selected]);

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
      // TODO: Implementar envío de mensaje al backend
      // await api.sendTicketMessage(parseInt(selected), messageText);
      
      // Por ahora, agregamos el mensaje localmente a los eventos del ticket
      const newEvent = {
        at: new Date().toISOString(),
        author: 'client' as const,
        message: messageText,
        type: 'comment' as const
      };

      // Actualizar el ticket en el store local
      const updatedTickets = tickets.map(t => 
        t.id.toString() === selected 
          ? { ...t, events: [...(t.events || []), newEvent] }
          : t
      );
      
      // Actualizar el estado local
      setTickets(updatedTickets);
      
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setNewMessage(messageText);
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
    <div className="section grid gap-6">
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

            {/* Fechas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Fechas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Creado:</span>
                  <span className="text-sm">{formatTimestamp(ticket.createdAt)}</span>
                </div>
                {ticket.closedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Cerrado:</span>
                    <span className="text-sm">{formatTimestamp(ticket.closedAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat y Comunicación */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Actividad
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Área de mensajes/actividad */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Mostrar eventos del ticket */}
                  {ticket?.events && ticket.events.length > 0 ? (
                    ticket.events.map((event, index) => (
                      <div
                        key={index}
                        className={`flex ${event.author === 'client' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          event.author === 'client' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="text-xs opacity-75 mb-1 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {event.author === 'client' ? 'Tú' : event.author === 'technician' ? 'Técnico' : 'Sistema'} • {formatTimestamp(event.at)}
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{event.message}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      <div className="mb-4">
                        <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p>No hay actividad aún</p>
                        <p className="text-xs mt-1">¡Sé el primero en escribir un comentario!</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Área de entrada */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe un comentario..."
                      disabled={isSending}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!newMessage.trim() || isSending}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {isSending ? 'Enviando...' : 'Enviar'}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Presiona Enter para enviar, Shift+Enter para nueva línea
                  </div>
                </div>
              </CardContent>
            </Card>
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
    </div>
  );
}
