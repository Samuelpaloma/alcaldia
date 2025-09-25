import { useState, useEffect, useCallback } from 'react';
import { api } from '@shared/api';

export interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  leida: boolean;
  fechaCreacion: string;
  fechaLectura?: string;
  ticketId?: number | null;
  usuarioId?: number;
  priority?: 'low' | 'medium' | 'high';
  category?: 'ticket' | 'system' | 'security' | 'general';
  actionUrl?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'ticket' | 'system' | 'security'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');

  // Cargar notificaciones desde la API
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔔 Hook: Cargando notificaciones desde API...');
      const response = await api.getNotificaciones();
      console.log('🔔 Hook: Respuesta de notificaciones:', response);
      
      if (response && response.content) {
        const notificacionesData = response.content.map((notif: any) => ({
          id: notif.id,
          titulo: notif.titulo,
          mensaje: notif.mensaje,
          tipo: notif.tipo,
          leida: notif.leida,
          fechaCreacion: notif.fechaCreacion,
          fechaLectura: notif.fechaLectura,
          ticketId: notif.ticketId || null,
          usuarioId: notif.usuarioId,
          priority: notif.priority || 'medium',
          category: notif.category || 'general'
        }));
        setNotifications(notificacionesData);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('🔔 Hook: Error cargando notificaciones:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.leida;
    if (filter === 'all') return true;
    return notification.category === filter;
  });

  // Ordenar notificaciones
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
      case 'oldest':
        return new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime();
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium'];
      default:
        return 0;
    }
  });

  // Marcar como leída
  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.marcarNotificacionComoLeida(id);
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
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      await api.marcarTodasComoLeidas();
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
  }, []);

  // Eliminar notificación
  const removeNotification = useCallback(async (id: number) => {
    try {
      await api.eliminarNotificacion(id);
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

  // Obtener notificaciones por categoría
  const getNotificationsByCategory = useCallback((category: Notification['category']) => {
    return notifications.filter(n => n.category === category);
  }, [notifications]);

  // Obtener notificaciones por prioridad
  const getNotificationsByPriority = useCallback((priority: Notification['priority']) => {
    return notifications.filter(n => n.priority === priority);
  }, [notifications]);

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
    getNotificationsByCategory,
    getNotificationsByPriority,
    loadNotifications
  };
};


  // Obtener notificaciones por prioridad
  const getNotificationsByPriority = useCallback((priority: Notification['priority']) => {
    return notifications.filter(n => n.priority === priority);
  }, [notifications]);

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
    getNotificationsByCategory,
    getNotificationsByPriority,
    loadNotifications
  };
};

