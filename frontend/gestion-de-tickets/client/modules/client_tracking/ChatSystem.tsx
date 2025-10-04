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
  authorName?: string; // Nombre real del autor
  authorEmail?: string; // Email del autor
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

  // WebSocket para tiempo real
  const { isConnected, isConnecting, sendMessage: sendWebSocketMessage } = useWebSocket({
    ticketId,
    onMessage: (data) => {
      console.log('🔥 [CHAT] Mensaje WebSocket recibido:', data);
      
      // Convertir mensaje del WebSocket al formato esperado
      const newMessage: ChatMessage = {
        id: data.id || Date.now().toString(),
        author: data.tipoAutor === 'TECNICO' ? 'technician' : 
                data.tipoAutor === 'ADMINISTRADOR' ? 'technician' : 'client',
        message: data.mensaje,
        timestamp: data.fechaCreacion,
        type: 'text',
        authorName: data.autor || 'Usuario', // Nombre real del autor con fallback
        authorEmail: data.autorEmail || '' // Email del autor con fallback
      };
      
      console.log('🔥 [CHAT] Agregando mensaje a la lista:', newMessage);
      setMessages(prev => [...prev, newMessage]);
      
      // Scroll al final
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    },
    onConnect: () => {
      console.log('🔥 [CHAT] WebSocket conectado');
    },
    onDisconnect: () => {
      console.log('🔥 [CHAT] WebSocket desconectado');
    }
  });

  // Cargar mensajes del ticket
  useEffect(() => {
    loadMessages();
  }, [ticketId]);

  // Polling automático para mensajes en tiempo real (sin pestañeo)
  useEffect(() => {
    if (ticketId && !isSending) {
      console.log('🔄 Iniciando polling automático para ticket:', ticketId);
      
      const interval = setInterval(async () => {
        // Solo hacer polling si no se está enviando un mensaje
        if (!isSending) {
          console.log('🔄 Polling mensajes automático...');
          try {
            await loadMessages(); // Usar loadMessages directo para que aparezca inmediatamente
          } catch (error) {
            console.error('🔄 Error en polling automático:', error);
          }
        }
      }, 15000); // Cada 15 segundos para ser menos frecuente

      return () => {
        console.log('🔄 Deteniendo polling automático');
        clearInterval(interval);
      };
    }
  }, [ticketId, isSending]);

  // Auto-scroll - ir al final cuando hay mensajes (donde están los más recientes)
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    const messagesContainer = messagesEndRef.current?.parentElement;
    if (messagesContainer) {
      messagesContainer.scrollTop = 0;
    }
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
            type: 'text' as const,
            authorName: comentario.autor || 'Usuario', // NOMBRE REAL DEL AUTOR
            authorEmail: comentario.autorEmail || '' // EMAIL DEL AUTOR
          };
        });
        chatMessages.push(...comentarios);
      }
      
      // Ordenar por timestamp (del más antiguo al más nuevo - orden ascendente)
      chatMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar mensajes de forma suave (solo agregar nuevos sin parpadeo)
  const loadMessagesSmoothly = async () => {
    try {
      api.reloadToken();
      const trackingData = await api.getTicketTracking(ticketId);
      
      if (trackingData.comentarios) {
        console.log('🔍 [CHAT DEBUG] Comentarios recibidos del backend:', trackingData.comentarios);
        console.log('🔍 [CHAT DEBUG] Primer comentario:', trackingData.comentarios[0]);
        
        const newMessages: ChatMessage[] = trackingData.comentarios.map((comentario, index) => {
          console.log(`🔍 [CHAT DEBUG] Procesando comentario ${index}:`, {
            id: comentario.id,
            autor: comentario.autor,
            autorEmail: comentario.autorEmail,
            tipoAutor: comentario.tipoAutor,
            mensaje: comentario.mensaje
          });
          console.log(`🔍 [CHAT DEBUG] Comentario completo ${index}:`, comentario);
          console.log(`🔍 [CHAT DEBUG] Tipo de autor ${index}:`, typeof comentario.autor);
          console.log(`🔍 [CHAT DEBUG] Autor es null/undefined ${index}:`, comentario.autor === null || comentario.autor === undefined);
          console.log(`🔍 [CHAT DEBUG] Autor es string vacío ${index}:`, comentario.autor === '');
          
          const isCurrentUser = comentario.autorEmail === trackingData.creadorEmail;
          const author = isCurrentUser ? 'client' : 
                        comentario.tipoAutor === 'TECNICO' ? 'technician' : 'system';
          
          const mappedMessage = {
            id: comentario.id.toString(),
            author: author,
            message: comentario.mensaje,
            timestamp: comentario.fechaCreacion,
            type: 'text' as const,
            authorName: comentario.autor || 'Usuario', // Nombre real del autor con fallback
            authorEmail: comentario.autorEmail || '' // Email del autor con fallback
          };
          
          console.log(`🔍 [CHAT DEBUG] Mapeo detallado ${index}:`, {
            'comentario.autor': comentario.autor,
            'mappedMessage.authorName': mappedMessage.authorName,
            'comentario.autorEmail': comentario.autorEmail,
            'mappedMessage.authorEmail': mappedMessage.authorEmail
          });
          
          console.log(`🔍 [CHAT DEBUG] Mensaje mapeado ${index}:`, mappedMessage);
          return mappedMessage;
        });

        // Ordenar mensajes por timestamp (ascendente)
        const mensajesOrdenados = newMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        // FORZAR ACTUALIZACIÓN COMPLETA - Los mensajes viejos no tienen authorName
        console.log('🔄 [CLIENTE] FORZANDO ACTUALIZACIÓN COMPLETA DE MENSAJES');
        console.log('🔄 [CLIENTE] Mensajes ordenados que se van a guardar:', mensajesOrdenados);
        console.log('🔄 [CLIENTE] Primer mensaje ordenado:', mensajesOrdenados[0]);
        
        setMessages(mensajesOrdenados);
      }
    } catch (error) {
      console.error('Error cargando mensajes suavemente:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    console.log('🔥 [CHAT] Enviando mensaje:', messageText);
    setNewMessage("");
    setIsSending(true);

    try {
      // Usar API REST directamente (más confiable que WebSocket)
      console.log('🔥 [CHAT] Enviando via API REST...');
      await api.enviarComentario(ticketId, messageText);
      console.log('✅ [CHAT] Mensaje enviado via API REST');
      
      // Agregar mensaje localmente inmediatamente para mejor UX
      const localMessage: ChatMessage = {
        id: Date.now().toString(),
        author: 'client',
        message: messageText,
        timestamp: new Date().toISOString(),
        type: 'text',
        authorName: 'Tú', // El usuario actual
        authorEmail: '' // Se llenará cuando llegue la respuesta del servidor
      };
      setMessages(prev => [...prev, localMessage]);
      
      // Hacer scroll al final cuando se envía un mensaje (donde aparecen los nuevos)
      setTimeout(() => scrollToBottom(), 100);
      
      // Recargar mensajes después de un breve delay para confirmar
      setTimeout(async () => {
        try {
          await loadMessages();
        } catch (error) {
          console.error('Error recargando mensajes después del envío:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ [CHAT] Error enviando mensaje:', error);
      
      // Restaurar el mensaje si falla
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

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getAuthorName = (message: ChatMessage) => {
    console.log('🔍 [AUTHOR DEBUG] Determinando nombre para mensaje:', {
      id: message.id,
      author: message.author,
      authorName: message.authorName,
      authorEmail: message.authorEmail
    });
    
    // Si hay un nombre real del autor, usarlo
    if (message.authorName && message.authorName.trim() !== '') {
      console.log('✅ [AUTHOR DEBUG] Usando nombre real:', message.authorName);
      return message.authorName;
    }
    
    // Fallback a nombres genéricos
    const fallbackName = (() => {
      switch (message.author) {
        case 'client': return 'Tú';
        case 'technician': return 'Técnico';
        case 'system': return 'Sistema';
        default: return message.author;
      }
    })();
    
    console.log('⚠️ [AUTHOR DEBUG] Usando fallback:', fallbackName);
    return fallbackName;
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
              {t("client.ticket_chat")} #{ticketId}
            </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Área de mensajes - FIXED HEIGHT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {/* Indicador de orden */}
          <div className="text-xs text-center text-muted-foreground mb-2 pb-2 border-b border-gray-200">
            📝 {t("client.tracking.recent_messages_below")}
          </div>
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              {t("client.tracking.loading_messages")}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              {t("client.tracking.no_messages_yet")}
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
                    {getAuthorName(message)} • {formatTimestamp(message.timestamp)}
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
              placeholder={t("client.tracking.write_message_placeholder")}
              disabled={isSending}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim() || isSending}
              size="sm"
            >
              {isSending ? t("client.tracking.sending") : t("client.tracking.send")}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {t("client.tracking.send_instructions")}
            <br />
            💬 {t("client.tracking.auto_update")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}