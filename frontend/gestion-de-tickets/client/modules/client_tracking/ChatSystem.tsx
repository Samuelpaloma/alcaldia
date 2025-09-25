import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { api } from "@shared/api";
import { useWebSocket } from "../../hooks/useWebSocket";

interface ChatMessage {
  id: string;
  author: 'client' | 'technician' | 'system';
  message: string;
  timestamp: string;
  type: 'text' | 'status' | 'attachment';
}

interface ChatSystemProps {
  ticketId: number;
  onMessageSent?: (message: ChatMessage) => void;
}

export default function ChatSystem({ ticketId, onMessageSent }: ChatSystemProps) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // TEMPORAL: Deshabilitar WebSocket hasta que funcione
  const isConnected = false;
  const isConnecting = false;

  // Cargar mensajes del ticket
  useEffect(() => {
    loadMessages();
  }, [ticketId]);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      api.reloadToken();
      const trackingData = await api.getTicketTracking(ticketId);
      
      // SOLO cargar comentarios del chat, NO eventos del sistema
      const chatMessages: ChatMessage[] = [];
      
      if (trackingData.comentarios) {
        const comentarios = trackingData.comentarios.map(comentario => {
          // Determinar autor basado en el email del usuario actual
          const isCurrentUser = comentario.autorEmail === trackingData.creadorEmail;
          const author = isCurrentUser ? 'client' : 
                        comentario.tipoAutor === 'TECNICO' ? 'technician' : 'system';
          
          return {
            id: comentario.id.toString(),
            author: author,
            message: comentario.mensaje,
            timestamp: comentario.fechaCreacion,
            type: 'text' as const
          };
        });
        chatMessages.push(...comentarios);
      }
      
      // Ordenar por timestamp
      chatMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    console.log('🔥 ENVIANDO MENSAJE:', messageText);
    setNewMessage("");
    setIsSending(true);

    try {
      // Usar el método de depuración que prueba diferentes formatos
      console.log('🔥 ENVIANDO MENSAJE CON MÉTODO DE DEPURACIÓN...');
      await api.enviarComentarioDebug(ticketId, messageText);
      console.log('🔥 MENSAJE ENVIADO VIA API REST');
      
      // Recargar mensajes después del envío
      await loadMessages();
      
    } catch (error) {
      console.error('🔥 ERROR ENVIANDO MENSAJE:', error);
      
      // Intentar método con query como fallback
      try {
        console.log('🚨 Intentando método con query...');
        await api.enviarComentarioConQuery(ticketId, messageText);
        console.log('✅ MENSAJE ENVIADO CON MÉTODO CON QUERY');
        
        // Recargar mensajes después del envío
        await loadMessages();
      } catch (queryError) {
        console.error('❌ ERROR EN MÉTODO CON QUERY:', queryError);
        
        // Intentar método funcional como fallback
        try {
          console.log('🚨 Intentando método funcional...');
          await api.enviarComentarioFuncional(ticketId, messageText);
          console.log('✅ MENSAJE ENVIADO CON MÉTODO FUNCIONAL');
          
          // Recargar mensajes después del envío
          await loadMessages();
        } catch (funcionalError) {
          console.error('❌ ERROR EN MÉTODO FUNCIONAL:', funcionalError);
          
          // Intentar método de emergencia como último recurso
          try {
            console.log('🚨 Intentando método de emergencia...');
            await api.enviarComentarioEmergencia(ticketId, messageText);
            console.log('✅ MENSAJE ENVIADO CON MÉTODO DE EMERGENCIA');
            
            // Recargar mensajes después del envío
            await loadMessages();
          } catch (emergencyError) {
            console.error('❌ ERROR EN MÉTODO DE EMERGENCIA:', emergencyError);
            // Restaurar el mensaje si falla
            setNewMessage(messageText);
          }
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

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getAuthorName = (author: string) => {
    switch (author) {
      case 'client': return 'Tú';
      case 'technician': return 'Técnico';
      case 'system': return 'Sistema';
      default: return author;
    }
  };

  const getAuthorColor = (author: string) => {
    switch (author) {
      case 'client': return 'bg-blue-500';
      case 'technician': return 'bg-green-500';
      case 'system': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-base">
              Chat del Ticket #{ticketId}
            </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Área de mensajes - FIXED HEIGHT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              Cargando mensajes...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No hay mensajes aún. ¡Sé el primero en escribir!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.author === 'client' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.author === 'client' 
                    ? 'bg-blue-500 text-white' 
                    : message.author === 'technician'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="text-xs opacity-75 mb-1">
                    {getAuthorName(message.author)} • {formatTimestamp(message.timestamp)}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{message.message}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Área de entrada - FIXED POSITION */}
        <div className="border-t p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              disabled={isSending}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim() || isSending}
              size="sm"
            >
              {isSending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </div>
        </div>
      </CardContent>
    </Card>
  );
}