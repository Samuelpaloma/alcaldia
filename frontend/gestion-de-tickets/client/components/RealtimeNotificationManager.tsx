import React, { useEffect, useState, useRef } from 'react';
import { useNotificationToasts } from '../hooks/useNotificationToasts';
import { getAuth } from '../modules/auth/auth';
import { toast } from 'sonner';

// Hook para manejar notificaciones en tiempo real con toasts
export const useRealtimeNotificationToasts = () => {
  const { addToast } = useNotificationToasts();
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<any>(null);

  useEffect(() => {
    const setupWebSocket = () => {
      try {
        console.log('🔔 Toast: Configurando WebSocket para toasts...');
        
        // Importar dinámicamente para evitar problemas de SSR
        import('sockjs-client').then(({ default: SockJS }) => {
          import('@stomp/stompjs').then(({ Client }) => {
            const socket = new SockJS('http://10.3.234.28:8080/ws');
            const client = new Client({
              webSocketFactory: () => socket,
              debug: (str) => {
                console.log('🔔 Toast WebSocket Debug:', str);
              },
              heartbeatIncoming: 4000,
              heartbeatOutgoing: 4000,
              reconnectDelay: 5000,
              onConnect: (frame) => {
                console.log('🔔 Toast: WebSocket conectado para toasts');
                setIsConnected(true);

                // Suscribirse a notificaciones globales
                client.subscribe('/topic/notifications', (message) => {
                  try {
                    console.log('🔔 Toast: Notificación recibida para toast');
                    const notification = JSON.parse(message.body);
                    
                    // Verificar si la notificación es para el usuario actual
                    const auth = getAuth();
                    const userRole = auth?.user?.role?.toLowerCase() || '';
                    const userEmail = auth?.user?.email || '';
                    
                    console.log('🔔 Toast: Verificando destinatarios:', {
                      userEmail,
                      userRole,
                      destinatarios: notification.destinatarios
                    });
                    
                    // Verificar si la notificación es para este usuario
                    let isForCurrentUser = false;
                    
                    if (notification.destinatarios && Array.isArray(notification.destinatarios)) {
                      isForCurrentUser = notification.destinatarios.some((dest: string) => {
                        // Verificar por email específico
                        if (dest.endsWith(":" + userEmail)) {
                          return true;
                        }
                        // Verificar por rol específico
                        if (userRole && dest === "rol:" + userRole) {
                          return true;
                        }
                        return false;
                      });
                    }
                    
                    if (isForCurrentUser) {
                      console.log('🔔 Toast: Mostrando toast para usuario actual');
                      
                      // Mostrar toast de notificación
                      addToast({
                        id: notification.id,
                        tipo: notification.tipo,
                        mensaje: notification.mensaje,
                        usuarioActorNombre: notification.usuarioActorNombre,
                        ticketId: notification.ticketId,
                        prioridad: notification.prioridad || 'normal',
                        fechaCreacion: notification.fechaCreacion
                      });
                      
                      // También mostrar toast de sonner como backup
                      toast.success('Nueva notificación', {
                        description: notification.mensaje,
                        duration: 4000,
                      });
                    } else {
                      console.log('🔔 Toast: Notificación no es para usuario actual, ignorando');
                    }
                    
                  } catch (error) {
                    console.error('🔔 Toast: Error procesando notificación:', error);
                  }
                });
              },
              onStompError: (frame) => {
                console.error('🔔 Toast: Error WebSocket STOMP:', frame);
                setIsConnected(false);
              },
              onWebSocketClose: () => {
                console.log('🔔 Toast: WebSocket cerrado');
                setIsConnected(false);
              }
            });

            client.activate();
            clientRef.current = client;
          });
        });
      } catch (error) {
        console.error('🔔 Toast: Error configurando WebSocket:', error);
      }
    };

    setupWebSocket();

    return () => {
      if (clientRef.current) {
        console.log('🔔 Toast: Desconectando WebSocket');
        clientRef.current.deactivate();
      }
    };
  }, [addToast]);

  return { isConnected };
};

export default useRealtimeNotificationToasts;

