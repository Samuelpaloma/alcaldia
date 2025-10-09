import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { webSocketService, NotificationMessage } from '../services/WebSocketService';
import NotificacionService, { Notificacion } from '../services/NotificacionService';

interface UseRealtimeNotificationsReturn {
  showToast: boolean;
  toastMessage: string;
  unreadCount: number;
  hideToast: () => void;
  refreshNotifications: () => Promise<void>;
}

export const useRealtimeNotifications = (): UseRealtimeNotificationsReturn => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const isConnected = useRef(false);

  // Función para ocultar el toast
  const hideToast = () => {
    setShowToast(false);
    setToastMessage('');
  };

  // Función para refrescar notificaciones
  const refreshNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userEmail = await AsyncStorage.getItem('userEmail');
      
      if (token && userEmail) {
        const count = await NotificacionService.getContadorNotificaciones(token, userEmail);
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  // Función para mostrar toast
  const showNotificationToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  // Conectar WebSocket cuando el componente se monta
  useEffect(() => {
    let mounted = true;

    const initializeWebSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userEmail = await AsyncStorage.getItem('userEmail');

        if (!token || !userEmail) {
          console.log('🔔 [HOOK] No hay token o email, saltando conexión WebSocket');
          return;
        }

        console.log('🔔 [HOOK] Iniciando conexión WebSocket para notificaciones...');

        // Conectar WebSocket
        await webSocketService.connect(token, userEmail);
        isConnected.current = true;

        // Suscribirse a notificaciones
        webSocketService.subscribeToNotifications();

        // Listener para notificaciones
        const handleNotification = (data: NotificationMessage['data']) => {
          if (!mounted) return;

          console.log('🔔 [HOOK] Notificación recibida:', data);
          
          // Mostrar toast
          showNotificationToast(data.mensaje);
          
          // Actualizar contador
          refreshNotifications();
        };

        // Listener para mensajes de notificación
        webSocketService.on('notification', handleNotification);

        // Listener para mensajes generales (por si vienen con formato diferente)
        const handleMessage = (message: any) => {
          if (!mounted) return;

          console.log('🔔 [HOOK] Mensaje WebSocket recibido:', message);
          
          // Verificar si es una notificación
          if (message.tipo === 'ticket_creado' || 
              message.tipo === 'ticket_asignado' || 
              message.tipo === 'ticket_en_proceso' ||
              message.tipo === 'ticket_resuelto' ||
              message.tipo === 'comentario_agregado') {
            
            console.log('🔔 [HOOK] Procesando notificación de tipo:', message.tipo);
            showNotificationToast(message.mensaje);
            refreshNotifications();
          }
        };

        webSocketService.on('message', handleMessage);

        // Cargar contador inicial
        await refreshNotifications();

      } catch (error) {
        console.error('❌ [HOOK] Error inicializando WebSocket:', error);
      }
    };

    initializeWebSocket();

    // Cleanup al desmontar
    return () => {
      mounted = false;
      if (isConnected.current) {
        webSocketService.unsubscribeFromNotifications();
        webSocketService.disconnect();
        isConnected.current = false;
      }
    };
  }, []);

  // Refrescar notificaciones cuando la app vuelve al foreground
  useEffect(() => {
    const handleAppStateChange = () => {
      refreshNotifications();
    };

    // En React Native, puedes usar AppState para detectar cuando la app vuelve al foreground
    // Por ahora, refrescamos cada vez que el hook se monta
    refreshNotifications();

    return () => {
      // Cleanup si es necesario
    };
  }, []);

  return {
    showToast,
    toastMessage,
    unreadCount,
    hideToast,
    refreshNotifications,
  };
};
