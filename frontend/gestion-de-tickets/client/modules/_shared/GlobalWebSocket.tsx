import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { toast } from 'sonner';
import { getAuth } from '../auth/auth';

// Context para compartir notificaciones globalmente
interface NotificationContextType {
  notificaciones: any[];
  addNotificacion: (notificacion: any) => void;
  updateNotificacion: (id: number, updates: any) => void;
  removeNotificacion: (id: number) => void;
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

  return (
    <NotificationContext.Provider value={{
      notificaciones,
      addNotificacion,
      updateNotificacion,
      removeNotificacion
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

const GlobalWebSocket: React.FC = () => {
  const clientRef = useRef<Client | null>(null);
  const { addNotificacion } = useNotifications();

  // Configurar WebSocket global para notificaciones
  const setupGlobalWebSocket = () => {
    try {
      console.log('🔔 [DEBUG] ===== CONFIGURANDO WEBSOCKET GLOBAL =====');
      console.log('🔔 [DEBUG] URL WebSocket: http://localhost:8080/ws');
      const socket = new SockJS('http://localhost:8080/ws');
      const client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log('🔔 [DEBUG] WebSocket Debug:', str);
        },
        connectHeaders: {},
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        reconnectDelay: 5000,
        onConnect: (frame) => {
          console.log('🔔 [DEBUG] ===== WEBSOCKET CONECTADO GLOBALMENTE =====');
          console.log('🔔 [DEBUG] Frame:', frame);
          console.log('🔔 [DEBUG] ✅ WebSocket conectado exitosamente');
          
          // Suscribirse a notificaciones globales
          console.log('🔔 [DEBUG] Suscribiéndose a /topic/notifications...');
          client.subscribe('/topic/notifications', (message) => {
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
              
              // Mostrar información de debug
              const auth = getAuth();
              const userRole = auth?.user?.role || 'CLIENTE';
              const userEmail = auth?.user?.email || '';
              
              console.log('🔔 [DEBUG] Usuario actual:', { userRole, userEmail });
              console.log('🔔 [DEBUG] Notificación recibida:', { 
                usuarioEmail: nuevaNotificacion.usuarioEmail, 
                tipo: nuevaNotificacion.tipo,
                ticketId: nuevaNotificacion.ticketId,
                titulo: nuevaNotificacion.titulo
              });
              
              // Filtrado correcto según requerimientos específicos
              let shouldShow = false;
              
              // 1. Si la notificación es específica para este usuario (por email)
              if (nuevaNotificacion.usuarioEmail === userEmail) {
                shouldShow = true;
                console.log('🔔 [DEBUG] ✅ Notificación específica para este usuario');
              }
              // 2. Si es global (Super Admin)
              else if (nuevaNotificacion.tipo === 'global') {
                shouldShow = true;
                console.log('🔔 [DEBUG] ✅ Notificación global');
              }
              // 3. Filtrado por rol según requerimientos específicos
              else {
                const titulo = nuevaNotificacion.titulo?.toLowerCase() || '';
                const mensaje = nuevaNotificacion.mensaje?.toLowerCase() || '';
                
                if (userRole === 'CLIENTE' || userRole === 'FUNCIONARIO') {
                  // FUNCIONARIO/CLIENTE:
                  // ❌ NO recibe: "ticket creado" (solo confirmación local en UI)
                  // ✅ SÍ recibe: cuando admin valida/asigna
                  // ✅ SÍ recibe: cuando técnico actualiza estado o resuelve
                  if (titulo.includes('asignado') || titulo.includes('validado') ||
                      titulo.includes('en proceso') || titulo.includes('resuelto') ||
                      titulo.includes('cerrado') || titulo.includes('actualizado') ||
                      titulo.includes('respuesta') || titulo.includes('comentario')) {
                    shouldShow = true;
                    console.log('🔔 [DEBUG] ✅ Funcionario ve: asignación o actualización de su ticket');
                  } else if (titulo.includes('creado') || titulo.includes('nuevo ticket')) {
                    // NO mostrar notificación de "ticket creado" al funcionario
                    shouldShow = false;
                    console.log('🔔 [DEBUG] ❌ Funcionario NO ve: confirmación de ticket creado (solo UI local)');
                  } else {
                    shouldShow = false;
                    console.log('🔔 [DEBUG] ❌ Funcionario no debe ver:', titulo);
                  }
                } else if (userRole === 'TECNICO') {
                  // TÉCNICO:
                  // ❌ NO recibe: "nuevo ticket creado"
                  // ✅ SÍ recibe: "ticket asignado" (cuando admin lo asigna)
                  // ✅ SÍ recibe: cambios importantes en ticket asignado
                  if (titulo.includes('asignado') || titulo.includes('asignación') ||
                      titulo.includes('evidencia') || titulo.includes('cambio') ||
                      titulo.includes('actualización') || titulo.includes('comentario')) {
                    shouldShow = true;
                    console.log('🔔 [DEBUG] ✅ Técnico ve: asignación o cambios en ticket asignado');
                  } else if (titulo.includes('creado') || titulo.includes('nuevo ticket')) {
                    // NO mostrar notificación de "nuevo ticket creado" al técnico
                    shouldShow = false;
                    console.log('🔔 [DEBUG] ❌ Técnico NO ve: nuevo ticket creado');
                  } else {
                    shouldShow = false;
                    console.log('🔔 [DEBUG] ❌ Técnico no debe ver:', titulo);
                  }
                } else if (userRole === 'ADMINISTRADOR') {
                  // ADMINISTRADOR:
                  // ✅ SÍ recibe: "nuevo ticket creado" (para revisar/asignar)
                  // ✅ SÍ recibe: alertas del sistema
                  if (titulo.includes('nuevo ticket') || titulo.includes('creado') ||
                      titulo.includes('sin clasificar') || titulo.includes('sla') ||
                      titulo.includes('incumplido') || titulo.includes('incidente') ||
                      titulo.includes('seguridad') || titulo.includes('escalado') ||
                      titulo.includes('alertas')) {
                    shouldShow = true;
                    console.log('🔔 [DEBUG] ✅ Administrador ve: nuevo ticket o alertas del sistema');
                  } else {
                    shouldShow = false;
                    console.log('🔔 [DEBUG] ❌ Administrador no debe ver:', titulo);
                  }
                } else if (userRole === 'SUPER_ADMIN') {
                  // SUPER ADMIN:
                  // ✅ SÍ recibe: solo alertas críticas y auditoría
                  // ❌ NO recibe: cada ticket individual
                  if (titulo.includes('crítico') || titulo.includes('sistema') ||
                      titulo.includes('reporte') || titulo.includes('escalamiento') ||
                      titulo.includes('actividad') || titulo.includes('anomalía') ||
                      titulo.includes('auditoría') || titulo.includes('bloqueado')) {
                    shouldShow = true;
                    console.log('🔔 [DEBUG] ✅ Super Admin ve: alertas críticas y auditoría');
                  } else {
                    shouldShow = false;
                    console.log('🔔 [DEBUG] ❌ Super Admin no debe ver tickets individuales:', titulo);
                  }
                }
              }
              
              console.log('🔔 [DEBUG] ¿Mostrar notificación?', shouldShow);
              
              if (!shouldShow) {
                console.log('🔔 [DEBUG] ❌ No mostrar notificación');
                return;
              }
              
              // Agregar notificación al estado global
              console.log('🔔 [DEBUG] Agregando notificación al estado global...');
              console.log('🔔 [DEBUG] ✅ Pasó el filtrado, agregando notificación');
              addNotificacion(nuevaNotificacion);
              console.log('🔔 [DEBUG] ✅ Notificación agregada al estado global');
              
              // Mostrar notificación toast visualmente
              console.log('🔔 [DEBUG] Mostrando notificación toast...');
              console.log('🔔 [DEBUG] Tipo de notificación:', nuevaNotificacion.tipo);
              console.log('🔔 [DEBUG] Título:', nuevaNotificacion.titulo);
              console.log('🔔 [DEBUG] Mensaje:', nuevaNotificacion.mensaje);
              
              // Mostrar toast según el tipo de notificación
              if (nuevaNotificacion.tipo === 'success') {
                console.log('🔔 [DEBUG] Mostrando toast de éxito');
                toast.success(nuevaNotificacion.titulo, {
                  description: nuevaNotificacion.mensaje,
                  duration: 5000,
                });
              } else if (nuevaNotificacion.tipo === 'warning') {
                console.log('🔔 [DEBUG] Mostrando toast de advertencia');
                toast.warning(nuevaNotificacion.titulo, {
                  description: nuevaNotificacion.mensaje,
                  duration: 5000,
                });
              } else if (nuevaNotificacion.tipo === 'error') {
                console.log('🔔 [DEBUG] Mostrando toast de error');
                toast.error(nuevaNotificacion.titulo, {
                  description: nuevaNotificacion.mensaje,
                  duration: 5000,
                });
              } else {
                console.log('🔔 [DEBUG] Mostrando toast de información');
                toast.info(nuevaNotificacion.titulo, {
                  description: nuevaNotificacion.mensaje,
                  duration: 5000,
                });
              }
              
              console.log('🔔 [DEBUG] ✅ Notificación agregada al estado global y mostrada visualmente');
              
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
  }, []);

  // Este componente no renderiza nada, solo maneja el WebSocket
  return null;
};

export default GlobalWebSocket;