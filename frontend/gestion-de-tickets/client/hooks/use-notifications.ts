import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'ticket' | 'system' | 'security' | 'general';
  actionUrl?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Ticket Creado',
    message: 'Tu ticket #12345 ha sido creado exitosamente',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
    read: false,
    priority: 'high',
    category: 'ticket',
    actionUrl: '/client/tickets/12345'
  },
  {
    id: '2',
    type: 'info',
    title: 'Actualización del Sistema',
    message: 'Se ha actualizado el sistema de tickets con nuevas funcionalidades',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
    read: false,
    priority: 'medium',
    category: 'system'
  },
  {
    id: '3',
    type: 'warning',
    title: 'Sesión Próxima a Expirar',
    message: 'Tu sesión expirará en 5 minutos. Guarda tu trabajo.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
    read: true,
    priority: 'high',
    category: 'security'
  },
  {
    id: '4',
    type: 'error',
    title: 'Error en el Sistema',
    message: 'Se ha detectado un problema temporal. Estamos trabajando en la solución.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
    read: true,
    priority: 'high',
    category: 'system'
  },
  {
    id: '5',
    type: 'info',
    title: 'Nuevo Comentario',
    message: 'Se ha añadido un comentario a tu ticket #12345',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 horas atrás
    read: true,
    priority: 'medium',
    category: 'ticket',
    actionUrl: '/client/tickets/12345'
  }
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread' | 'ticket' | 'system' | 'security'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'all') return true;
    return notification.category === filter;
  });

  // Ordenar notificaciones
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.timestamp.getTime() - a.timestamp.getTime();
      case 'oldest':
        return a.timestamp.getTime() - b.timestamp.getTime();
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      default:
        return 0;
    }
  });

  // Marcar como leída
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Eliminar notificación
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Eliminar todas las leídas
  const removeAllRead = useCallback(() => {
    setNotifications(prev => prev.filter(notification => !notification.read));
  }, []);

  // Contar notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

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
    filter,
    setFilter,
    sortBy,
    setSortBy,
    markAsRead,
    markAllAsRead,
    removeNotification,
    removeAllRead,
    getNotificationsByCategory,
    getNotificationsByPriority
  };
};

