import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { api } from "@shared/api";

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
      
      // Convertir comentarios del backend a mensajes de chat
      const chatMessages: ChatMessage[] = trackingData.comentarios?.map(comentario => ({
        id: comentario.id.toString(),
        author: comentario.autor as 'client' | 'technician' | 'system',
        message: comentario.mensaje,
        timestamp: comentario.fechaCreacion,
        type: 'text' as const
      })) || [];

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
    setNewMessage("");
    setIsSending(true);

    // Crear mensaje temporal para mostrar inmediatamente
    const newChatMessage: ChatMessage = {
      id: Date.now().toString(),
      author: 'client',
      message: messageText,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    try {
      setMessages(prev => [...prev, newChatMessage]);
      onMessageSent?.(newChatMessage);

      // Enviar mensaje al backend
      await api.enviarComentario(ticketId, messageText);
      
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      // Restaurar el mensaje si falla
      setNewMessage(messageText);
      // Remover el mensaje temporal si falla
      setMessages(prev => prev.filter(msg => msg.id !== newChatMessage.id));
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
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Chat del Ticket #{ticketId}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground">
              Cargando mensajes...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              No hay mensajes aún. ¡Sé el primero en escribir!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.author === 'client' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  message.author === 'client' 
                    ? 'bg-blue-500 text-white' 
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

        {/* Área de entrada */}
        <div className="border-t p-4">
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







