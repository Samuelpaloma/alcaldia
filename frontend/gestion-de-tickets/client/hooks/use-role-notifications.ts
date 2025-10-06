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
  const [filter, setFilter] = useState<'all' | 'unread' | 'ticket_creado' | 'ticket_asignado' | 'ticket_resuelto' | 'ticket_cerrado' | 'sla_vencido' | 'sla_proximo_vencer' | 'alerta_sla'>('all');
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
      
      console.log('🔔 Hook: ===== INICIANDO CARGA DE NOTIFICACIONES =====');
      console.log('🔔 Hook: userEmail:', userEmail);
      console.log('🔔 Hook: userRole:', userRole);
      console.log('🔔 Hook: URL que se va a llamar:', `/notifications/role-based/user/samupalo3@gmail.com?page=0&size=100`);
      
      const response = await api.getRoleNotifications(userEmail);
      console.log('🔔 Hook: ===== RESPUESTA COMPLETA DE LA API =====');
      console.log('🔔 Hook: Tipo de respuesta:', typeof response);
      console.log('🔔 Hook: Respuesta completa:', JSON.stringify(response, null, 2));
      
      if (response && response.content) {
        console.log('🔔 Hook: ===== PROCESANDO NOTIFICACIONES =====');
        console.log('🔔 Hook: Total notificaciones recibidas:', response.content.length);
        console.log('🔔 Hook: Notificaciones antes del filtrado:', response.content);
        
        const notificacionesData = response.content
          .map((notif: any) => {
            console.log('🔔 Hook: Procesando notificación ID', notif.id, ':', notif.mensaje);
            console.log('🔔 Hook: Destinatarios:', notif.destinatarios);
            return {
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
            };
          })
          .filter((notif: RoleNotification) => {
            console.log('🔔 Hook: ===== APLICANDO FILTRO =====');
            console.log('🔔 Hook: userEmail para filtrar:', userEmail);
            console.log('🔔 Hook: userRole para filtrar:', userRole);
            console.log('🔔 Hook: Destinatarios de la notificación:', notif.destinatarios);
            
            const pasaFiltro = notif.destinatarios.some(dest => {
              console.log('🔔 Hook: Verificando destinatario:', dest);
              
              // Verificar por email específico (formato: "rol:email@domain.com")
              if (dest.endsWith(":" + userEmail)) {
                console.log('🔔 Hook: ✅ Coincide por email específico');
                return true;
              }
              
              // Verificar por rol específico (formato: "rol:administrador")
              if (userRole && dest === "rol:" + userRole) {
                console.log('🔔 Hook: ✅ Coincide por rol específico');
                return true;
              }
              
              console.log('🔔 Hook: ❌ No coincide');
              return false;
            });
            
            console.log('🔔 Hook: Notificación ID', notif.id, 'pasa filtro:', pasaFiltro);
            return pasaFiltro;
          });
          
        console.log('🔔 Hook: ===== RESULTADO FINAL =====');
        console.log('🔔 Hook: Total notificaciones después del filtrado:', notificacionesData.length);
        console.log('🔔 Hook: Notificaciones finales:', notificacionesData);
        
        setNotifications(notificacionesData);
      } else {
        console.log('🔔 Hook: ❌ No hay respuesta o content vacío');
        console.log('🔔 Hook: response:', response);
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
      case 'sla_vencido':
        return '🚨';
      case 'sla_proximo_vencer':
        return '⚠️';
      case 'alerta_sla':
        return '⏰';
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
      case 'sla_vencido':
        return 'text-red-600';
      case 'sla_proximo_vencer':
        return 'text-orange-600';
      case 'alerta_sla':
        return 'text-yellow-600';
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
