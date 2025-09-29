import { useState, useEffect, useCallback } from 'react';
import { api } from '@shared/api';
import { useNotifications } from '../modules/_shared/GlobalWebSocket';

export interface RoleNotification {
  id: number;
  tipo: string;
  mensaje: string;
  destinatarios: string[];
  ticketId?: number;
  usuarioActorNombre?: string;
  prioridad: 'normal' | 'alta' | 'critica';
  leida: boolean;
  fechaCreacion: string;
  fechaLectura?: string;
}

export const useRoleNotifications = (userEmail: string, userRole?: string) => {
  const [notifications, setNotifications] = useState<RoleNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'ticket_creado' | 'ticket_asignado' | 'ticket_resuelto' | 'ticket_cerrado'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');
  
  // Conectar al contexto de notificaciones global para tiempo real
  const { notifications: globalNotifications } = useNotifications();

  // Cargar notificaciones desde la API por roles
  const loadNotifications = useCallback(async () => {
    try {
      // Validar que userEmail no esté vacío
      if (!userEmail || userEmail.trim() === '') {
        console.log('🔔 Hook: userEmail vacío, saltando carga de notificaciones');
        setNotifications([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      console.log('🔔 Hook: Cargando notificaciones por roles desde API...');
      const response = await api.getRoleNotifications(userEmail);
      console.log('🔔 Hook: Respuesta de notificaciones por roles:', response);
      
      if (response && response.content) {
        const notificacionesData = response.content
          .map((notif: any) => ({
            id: notif.id,
            tipo: notif.tipo,
            mensaje: notif.mensaje,
            destinatarios: notif.destinatarios || [],
            ticketId: notif.ticketId,
            usuarioActorNombre: notif.usuarioActorNombre,
            prioridad: notif.prioridad || 'normal',
            leida: notif.leida,
            fechaCreacion: notif.fechaCreacion,
            fechaLectura: notif.fechaLectura
          }))
          .filter((notif: RoleNotification) => {
            // FILTRO CORREGIDO: Solo mostrar notificaciones destinadas específicamente a este usuario
            return notif.destinatarios.some(dest => {
              // Verificar por email específico (formato: "rol:email@domain.com")
              if (dest.endsWith(":" + userEmail)) {
                return true;
              }
              
              // Verificar por rol específico (formato: "rol:administrador")
              if (userRole && dest === "rol:" + userRole) {
                return true;
              }
              
              return false;
            });
          });
        setNotifications(notificacionesData);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('🔔 Hook: Error cargando notificaciones por roles:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Cargar notificaciones no leídas
  const loadUnreadNotifications = useCallback(async () => {
    try {
      // Validar que userEmail no esté vacío
      if (!userEmail || userEmail.trim() === '') {
        console.log('🔔 Hook: userEmail vacío, saltando carga de notificaciones no leídas');
        return [];
      }

      const response = await api.getUnreadRoleNotifications(userEmail);
      if (response && response.notifications) {
        const notificacionesData = response.notifications.map((notif: any) => ({
          id: notif.id,
          tipo: notif.tipo,
          mensaje: notif.mensaje,
          destinatarios: notif.destinatarios || [],
          ticketId: notif.ticketId,
          usuarioActorNombre: notif.usuarioActorNombre,
          prioridad: notif.prioridad || 'normal',
          leida: notif.leida,
          fechaCreacion: notif.fechaCreacion,
          fechaLectura: notif.fechaLectura
        }));
        return notificacionesData;
      }
      return [];
    } catch (err) {
      console.error('🔔 Hook: Error cargando notificaciones no leídas:', err);
      return [];
    }
  }, [userEmail]);

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    // Solo cargar si tenemos tanto userEmail como userRole válidos
    if (userEmail && userEmail.trim() !== '' && userRole && userRole.trim() !== '') {
      console.log('🔔 Hook: Cargando notificaciones para:', { userEmail, userRole });
      loadNotifications();
    } else {
      console.log('🔔 Hook: Esperando datos del usuario:', { userEmail, userRole });
    }
  }, [loadNotifications, userEmail, userRole]);

  // Sincronizar con notificaciones en tiempo real
  useEffect(() => {
    if (globalNotifications && globalNotifications.length > 0) {
      console.log('🔔 Hook: Sincronizando notificaciones en tiempo real:', globalNotifications.length);
      
      // Filtrar las notificaciones globales por usuario/rol
      const notificacionesFiltradas = globalNotifications.filter(notif => {
        if (!notif.destinatarios) return false;
        
        return notif.destinatarios.some(dest => {
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
      });

      // Combinar con las notificaciones existentes (evitar duplicados)
      setNotifications(prev => {
        const nuevasNotificaciones = notificacionesFiltradas.filter(nueva => 
          !prev.some(existente => existente.id === nueva.id)
        );
        
        if (nuevasNotificaciones.length > 0) {
          console.log('🔔 Hook: Agregando', nuevasNotificaciones.length, 'notificaciones nuevas');
          return [...nuevasNotificaciones, ...prev];
        }
        
        return prev;
      });
    }
  }, [globalNotifications, userEmail, userRole]);

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.leida;
    if (filter === 'all') return true;
    return notification.tipo === filter;
  });

  // Ordenar notificaciones
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
      case 'oldest':
        return new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime();
      case 'priority':
        const priorityOrder = { critica: 3, alta: 2, normal: 1 };
        return priorityOrder[b.prioridad] - priorityOrder[a.prioridad];
      default:
        return 0;
    }
  });

  // Marcar como leída
  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.markRoleNotificationAsRead(id, userEmail);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, leida: true, fechaLectura: new Date().toISOString() }
            : notification
        )
      );
    } catch (err) {
      console.error('🔔 Hook: Error marcando como leída:', err);
      // Actualizar localmente aunque falle la API
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, leida: true, fechaLectura: new Date().toISOString() }
            : notification
        )
      );
    }
  }, [userEmail]);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.leida);
      for (const notification of unreadNotifications) {
        await api.markRoleNotificationAsRead(notification.id, userEmail);
      }
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, leida: true, fechaLectura: new Date().toISOString() }))
      );
    } catch (err) {
      console.error('🔔 Hook: Error marcando todas como leídas:', err);
      // Actualizar localmente aunque falle la API
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, leida: true, fechaLectura: new Date().toISOString() }))
      );
    }
  }, [notifications, userEmail]);

  // Eliminar notificación
  const removeNotification = useCallback(async (id: number) => {
    try {
      await api.deleteRoleNotification(id);
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (err) {
      console.error('🔔 Hook: Error eliminando notificación:', err);
      // Eliminar localmente aunque falle la API
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }
  }, []);

  // Eliminar todas las leídas
  const removeAllRead = useCallback(() => {
    setNotifications(prev => prev.filter(notification => !notification.leida));
  }, []);

  // Contar notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.leida).length;

  // Obtener notificaciones por tipo
  const getNotificationsByType = useCallback((tipo: string) => {
    return notifications.filter(n => n.tipo === tipo);
  }, [notifications]);

  // Obtener notificaciones por prioridad
  const getNotificationsByPriority = useCallback((prioridad: RoleNotification['prioridad']) => {
    return notifications.filter(n => n.prioridad === prioridad);
  }, [notifications]);

  // Obtener notificaciones relacionadas con un ticket
  const getNotificationsByTicket = useCallback((ticketId: number) => {
    return notifications.filter(n => n.ticketId === ticketId);
  }, [notifications]);

  // Obtener icono según el tipo de notificación
  const getNotificationIcon = useCallback((tipo: string) => {
    switch (tipo) {
      case 'ticket_creado':
        return '📝';
      case 'ticket_asignado':
        return '👤';
      case 'ticket_en_proceso':
        return '⚙️';
      case 'ticket_resuelto':
        return '✅';
      case 'ticket_cerrado':
        return '🔒';
      default:
        return '🔔';
    }
  }, []);

  // Obtener color según el tipo de notificación
  const getNotificationColor = useCallback((tipo: string) => {
    switch (tipo) {
      case 'ticket_creado':
        return 'text-blue-600';
      case 'ticket_asignado':
        return 'text-yellow-600';
      case 'ticket_en_proceso':
        return 'text-orange-600';
      case 'ticket_resuelto':
        return 'text-green-600';
      case 'ticket_cerrado':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }, []);

  return {
    notifications: sortedNotifications,
    unreadCount,
    loading,
    error,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    markAsRead,
    markAllAsRead,
    removeNotification,
    removeAllRead,
    getNotificationsByType,
    getNotificationsByPriority,
    getNotificationsByTicket,
    getNotificationIcon,
    getNotificationColor,
    loadNotifications,
    loadUnreadNotifications
  };
};
