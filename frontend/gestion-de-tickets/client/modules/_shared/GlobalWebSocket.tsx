import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { toast } from 'sonner';
import { getAuth } from '../auth/auth';
import { useUserInfo } from '@/hooks/use-user-info';

// Context para compartir notificaciones globalmente
interface NotificationContextType {
  notificaciones: any[];
  addNotificacion: (notificacion: any) => void;
  updateNotificacion: (id: number, updates: any) => void;
  removeNotificacion: (id: number) => void;
  // Para toasts
  addToastNotification: (notificacion: any) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Provider de notificaciones
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificaciones, setNotificaciones] = useState<any[]>([]);

  const addNotificacion = (notificacion: any) => {
    setNotificaciones(prev => [notificacion, ...prev]);
  };

  const updateNotificacion = (id: number, updates: any) => {
    setNotificaciones(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, ...updates } : notif
      )
    );
  };

  const removeNotificacion = (id: number) => {
    setNotificaciones(prev => prev.filter(notif => notif.id !== id));
  };

  // Función para mostrar toasts de notificaciones
  const addToastNotification = (notificacion: any) => {
    console.log('🔔 Toast: Mostrando toast desde GlobalWebSocket:', notificacion);
    
    // Disparar evento personalizado para mostrar nuestro toast personalizado
    window.dispatchEvent(new CustomEvent('newNotification', {
      detail: notificacion
    }));
  };

  return (
    <NotificationContext.Provider value={{
      notificaciones,
      addNotificacion,
      updateNotificacion,
      removeNotificacion,
      addToastNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

const GlobalWebSocket: React.FC = () => {
  const clientRef = useRef<Client | null>(null);
  const { addNotificacion, addToastNotification } = useNotifications();
  const { userInfo } = useUserInfo();

  // Configurar WebSocket global para notificaciones
  const setupGlobalWebSocket = () => {
    try {
      console.log('🔔 [DEBUG] ===== CONFIGURANDO WEBSOCKET GLOBAL =====');
      console.log('🔔 [DEBUG] URL WebSocket: http://localhost:8080/ws');
      console.log('🔔 [DEBUG] 🔥🔥🔥 INICIANDO CREACIÓN DE SOCKET 🔥🔥🔥');
      const socket = new SockJS('http://localhost:8080/ws', null, {
        debug: false,
        devel: false
      });
      console.log('🔔 [DEBUG] 🔥🔥🔥 SOCKET CREADO EXITOSAMENTE 🔥🔥🔥');
      const client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          // Solo mostrar errores críticos
          if (str.includes('ERROR') || str.includes('error')) {
            console.log('🔔 [DEBUG] WebSocket Debug:', str);
          }
        },
        connectHeaders: {},
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        reconnectDelay: 5000,
        onConnect: (frame) => {
          console.log('🔔 [DEBUG] 🔥🔥🔥 ===== WEBSOCKET CONECTADO GLOBALMENTE ===== 🔥🔥🔥');
          console.log('🔔 [DEBUG] Frame:', frame);
          console.log('🔔 [DEBUG] ✅ WebSocket conectado exitosamente');
          
          // Suscribirse a notificaciones globales
          console.log('🔔 [DEBUG] 🔥🔥🔥 SUSCRIBIÉNDOSE A /topic/notifications... 🔥🔥🔥');
          client.subscribe('/topic/notifications', (message) => {
            console.log('🔔 [DEBUG] 🔥🔥🔥 MENSAJE RECIBIDO EN WEBSOCKET 🔥🔥🔥');
            console.log('🔔 [DEBUG] Mensaje completo:', message);
            try {
              console.log('🔔 [DEBUG] ===== NOTIFICACIÓN RECIBIDA VIA WEBSOCKET =====');
              console.log('🔔 [DEBUG] Mensaje completo:', message);
              console.log('🔔 [DEBUG] Body:', message.body);
              console.log('🔔 [DEBUG] ✅ WebSocket recibió mensaje');
              
              const nuevaNotificacion = JSON.parse(message.body);
              console.log('🔔 [DEBUG] Notificación parseada:', nuevaNotificacion);
              console.log('🔔 [DEBUG] ✅ JSON parseado correctamente');
              
              // Filtrado correcto y simple
              console.log('🔔 [DEBUG] Aplicando filtrado correcto...');
              
              // Verificar si userInfo está disponible
              if (!userInfo) {
                console.log('🔔 [DEBUG] ⏳ UserInfo no disponible aún, ignorando notificación');
                return;
              }
              
              // Obtener información del usuario actual
              const userRole = userInfo.tipoUsuario?.toLowerCase() || 'funcionario';
              const userEmail = userInfo.email || '';
              
              console.log('🔔 [DEBUG] ===== INFORMACIÓN DE DEBUG =====');
              console.log('🔔 [DEBUG] UserInfo completo:', userInfo);
              console.log('🔔 [DEBUG] UserInfo.tipoUsuario:', userInfo.tipoUsuario);
              console.log('🔔 [DEBUG] Usuario actual:', { userRole, userEmail });
              console.log('🔔 [DEBUG] Tipo de userRole:', typeof userRole);
              console.log('🔔 [DEBUG] Tipo de userEmail:', typeof userEmail);
              
              // Normalizar el rol para coincidir con el backend
              let normalizedRole = userRole;
              if (userRole === 'super administrador' || userRole === 'superadmin') {
                normalizedRole = 'administrador';
              } else if (userRole === 'administrador') {
                normalizedRole = 'administrador';
              } else if (userRole === 'tecnico' || userRole === 'técnico') {
                normalizedRole = 'tecnico';
              } else if (userRole === 'funcionario' || userRole === 'cliente') {
                normalizedRole = 'funcionario';
              } else {
                // Por defecto, asumir funcionario
                normalizedRole = 'funcionario';
              }
              
              console.log('🔔 [DEBUG] Rol normalizado:', normalizedRole);
              console.log('🔔 [DEBUG] Notificación recibida:', { 
                usuarioEmail: nuevaNotificacion.usuarioEmail, 
                tipo: nuevaNotificacion.tipo,
                ticketId: nuevaNotificacion.ticketId,
                titulo: nuevaNotificacion.titulo,
                destinatarios: nuevaNotificacion.destinatarios
              });
              
              // Filtrado correcto: verificar destinatarios
              let shouldShow = false;
              
              console.log('🔔 [DEBUG] ===== ANÁLISIS DE FILTRADO =====');
              console.log('🔔 [DEBUG] Destinatarios recibidos:', nuevaNotificacion.destinatarios);
              console.log('🔔 [DEBUG] Tipo de destinatarios:', typeof nuevaNotificacion.destinatarios);
              console.log('🔔 [DEBUG] ¿Es array?', Array.isArray(nuevaNotificacion.destinatarios));
              console.log('🔔 [DEBUG] Usuario actual email:', userEmail);
              console.log('🔔 [DEBUG] Usuario actual rol:', normalizedRole);
              
              // Verificar si la notificación es para este usuario
              if (nuevaNotificacion.destinatarios && Array.isArray(nuevaNotificacion.destinatarios)) {
                console.log('🔔 [DEBUG] Procesando destinatarios array...');
                shouldShow = nuevaNotificacion.destinatarios.some(dest => {
                  console.log('🔔 [DEBUG] Analizando destinatario:', dest);
                  
                  // Verificar por email específico (formato: "rol:email@domain.com")
                  if (userEmail && dest.includes(":" + userEmail)) {
                    console.log('🔔 [DEBUG] ✅ Coincide por email:', dest, 'para', userEmail);
                    return true;
                  }
                  
                  // Verificar por email específico con formato "funcionario:email@domain.com"
                  if (userEmail && dest === "funcionario:" + userEmail) {
                    console.log('🔔 [DEBUG] ✅ Coincide por email funcionario:', dest, 'para', userEmail);
                    return true;
                  }
                  
                  // Verificar por rol específico (formato: "rol:administrador", "rol:tecnico", "rol:funcionario")
                  if (normalizedRole && dest === "rol:" + normalizedRole) {
                    console.log('🔔 [DEBUG] ✅ Coincide por rol:', dest, 'vs', 'rol:' + normalizedRole);
                    return true;
                  }
                  
                  // Verificar por rol sin prefijo (para compatibilidad)
                  if (normalizedRole && dest === normalizedRole) {
                    console.log('🔔 [DEBUG] ✅ Coincide por rol directo:', dest, 'vs', normalizedRole);
                    return true;
                  }
                  
                  console.log('🔔 [DEBUG] ❌ No coincide:', dest, 'para usuario:', { normalizedRole, userEmail });
                  return false;
                });
              } else {
                console.log('🔔 [DEBUG] ❌ Destinatarios no es array o está vacío');
              }
              
              console.log('🔔 [DEBUG] ¿Mostrar notificación?', shouldShow);
              
              // ✅ FILTRADO CORRECTO - Solo mostrar notificaciones relevantes
              if (!shouldShow) {
                console.log('🔔 [DEBUG] ❌ No mostrar notificación - no es para este usuario');
                return; // No procesar esta notificación
              }
              
              // Agregar notificación al estado global
              console.log('🔔 [DEBUG] ✅ Agregando notificación al estado global...');
              addNotificacion(nuevaNotificacion);
              
              // Mostrar toast de notificación
              console.log('🔔 [DEBUG] ✅ Mostrando toast de notificación...');
              addToastNotification(nuevaNotificacion);
              
              
            } catch (error) {
              console.error('🔔 Error procesando notificación WebSocket:', error);
            }
          });
        },
        onStompError: (frame) => {
          console.error('🔔 Error STOMP global:', frame);
        },
        onDisconnect: () => {
          console.log('🔔 WebSocket global desconectado.');
        },
        onWebSocketError: (error) => {
          console.error('🔔 Error WebSocket global:', error);
        }
      });

      clientRef.current = client;
      client.activate();
    } catch (error) {
      console.error('🔔 Error configurando WebSocket global:', error);
    }
  };

  useEffect(() => {
    console.log('🔔 [DEBUG] GlobalWebSocket montado - configurando WebSocket...');
    setupGlobalWebSocket();

    return () => {
      console.log('🔔 [DEBUG] GlobalWebSocket desmontado - limpiando WebSocket...');
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [userInfo]); // Reconectar cuando userInfo cambie

  // Este componente no renderiza nada, solo maneja el WebSocket
  return null;
};

export default GlobalWebSocket;