import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { getAuth } from '../modules/auth/auth';

interface WebSocketMessage {
  id: number;
  ticketId: number;
  mensaje: string;
  autor: string;
  autorEmail: string;
  tipoAutor: string;
  fechaCreacion: string;
}

interface UseWebSocketProps {
  ticketId: number;
  onMessage: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useWebSocket = ({ ticketId, onMessage, onConnect, onDisconnect }: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!ticketId) return;

    console.log('🔥 INICIANDO WEBSOCKET para ticket:', ticketId);
    
    // Limpiar conexión anterior si existe
    if (clientRef.current) {
      console.log('🔥 LIMPIANDO CONEXIÓN ANTERIOR');
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    
    setIsConnecting(true);
    setIsConnected(false);
    
    // Obtener token de autenticación
    const auth = getAuth();
    const token = auth?.accessToken;
    
    console.log('🔥 [WEBSOCKET] Token de autenticación:', token ? 'Presente' : 'No presente');
    
    // Crear conexión WebSocket con configuración más robusta
    const socket = new SockJS('http://localhost:8080/ws', null, {
      debug: false, // Reducir logs
      devel: false
    });
    
    // Agregar listeners adicionales al socket para debugging
    socket.onopen = (event) => {
      console.log('🔥 [SOCKET] Socket abierto:', event);
    };
    
    socket.onclose = (event) => {
      console.log('🔥 [SOCKET] Socket cerrado:', event.code, event.reason, event.wasClean);
      setIsConnected(false);
      setIsConnecting(false);
    };
    
    socket.onerror = (event) => {
      console.error('🔥 [SOCKET] Error en socket:', event);
      setIsConnected(false);
      setIsConnecting(false);
    };
    
    const client = new Client({
      webSocketFactory: () => {
        console.log('🔥 [WEBSOCKET] Creando WebSocket factory...');
        return socket;
      },
      debug: (str) => {
        // Solo mostrar errores críticos
        if (str.includes('ERROR') || str.includes('error')) {
          console.log('🔥 WebSocket Debug:', str);
        }
      },
      connectHeaders: {
        // Incluir token JWT en los headers de conexión
        ...(token && { Authorization: `Bearer ${token}` })
      },
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      reconnectDelay: 10000, // Aumentar delay para evitar reconexiones rápidas
      onConnect: (frame) => {
        console.log('🔥 WEBSOCKET CONECTADO:', frame);
        setIsConnected(true);
        setIsConnecting(false);
        onConnect?.();

        // Suscribirse a mensajes del ticket específico
        const subscription = `/topic/ticket/${ticketId}/messages`;
        console.log('🔥 SUSCRIBIÉNDOSE A:', subscription);
        client.subscribe(subscription, (message) => {
          try {
            console.log('🔥 MENSAJE RAW RECIBIDO:', message.body);
            const data: WebSocketMessage = JSON.parse(message.body);
            console.log('🔥 MENSAJE PARSEADO:', data);
            onMessage(data);
          } catch (error) {
            console.error('🔥 ERROR PARSEANDO MENSAJE:', error);
          }
        });
      },
      onStompError: (frame) => {
        console.error('🔥 ERROR WEBSOCKET STOMP:', frame);
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();
      },
      onWebSocketClose: () => {
        console.log('🔥 WEBSOCKET CERRADO');
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();
      },
      onWebSocketError: (error) => {
        console.error('🔥 ERROR WEBSOCKET:', error);
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();
      }
    });

    clientRef.current = client;
    console.log('🔥 ACTIVANDO CLIENTE WEBSOCKET');
    
    // Conectar sin retry automático para evitar loops infinitos
    try {
      client.activate();
    } catch (error) {
      console.error('🔥 ERROR ACTIVANDO CLIENTE:', error);
      setIsConnected(false);
      setIsConnecting(false);
    }

    return () => {
      console.log('🔥 LIMPIANDO WEBSOCKET');
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, [ticketId]); // Remover dependencias que causan re-renders

  const sendMessage = (mensaje: string) => {
    console.log('🔥 WEBSOCKET SENDMESSAGE LLAMADO:', { mensaje, ticketId, isConnected });
    if (clientRef.current && isConnected) {
      const message = {
        ticketId,
        mensaje
      };
      
      console.log('🔥 PUBLICANDO MENSAJE WEBSOCKET:', message);
      clientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(message)
      });
      console.log('🔥 MENSAJE WEBSOCKET PUBLICADO');
    } else {
      console.log('🔥 NO SE PUEDE ENVIAR WEBSOCKET:', { 
        clientExists: !!clientRef.current, 
        isConnected 
      });
    }
  };

  return {
    isConnected,
    isConnecting,
    sendMessage
  };
};



