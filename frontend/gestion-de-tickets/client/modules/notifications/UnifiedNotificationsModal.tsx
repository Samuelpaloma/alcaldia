import React, { useState, useEffect } from 'react';
import { X, Search, Bell, CheckCircle2, Trash2, Filter, MoreHorizontal, Eye, EyeOff } from 'lucide-react';
import { useRoleNotifications } from '@/hooks/use-role-notifications';
import { useI18n } from '@/i18n';

interface UnifiedNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userRole?: string;
}

export const UnifiedNotificationsModal: React.FC<UnifiedNotificationsModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  userRole
}) => {
  const { t } = useI18n();
  const {
    notifications,
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
    loadNotifications
  } = useRoleNotifications(userEmail, userRole);
  
  console.log('🔔 UnifiedNotificationsModal renderizado para:', { userEmail, userRole });
  console.log('🔔 Total de notificaciones recibidas:', notifications.length);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Función para interpolar variables en strings de traducción
  const interpolateString = (template: string, variables: Record<string, string | number>) => {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key]?.toString() || match;
    });
  };

  // Función para limpiar nombres duplicados
  const cleanName = (name: string) => {
    if (!name) return name;
    
    // Limpiar espacios extra
    let cleaned = name.trim();
    
    // Detectar y corregir patrones de duplicación comunes
    const patterns = [
      // Patrón: "paloma paloma" -> "paloma"
      /(\w+)\s+\1\b/gi,
      // Patrón: "prueba prueba" -> "prueba"  
      /(\w+)\s+\1\b/gi,
      // Patrón: "administrador administrador" -> "administrador"
      /(\w+)\s+\1\b/gi
    ];
    
    patterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '$1');
    });
    
    return cleaned;
  };

  // Función para procesar mensajes de notificación y traducirlos
  const processNotificationMessage = (mensaje: string) => {
    if (!mensaje) return mensaje;
    
    // Patrón para "Has asignado el ticket #X del funcionario Y al técnico Z"
    const assignedPattern = /Has asignado el ticket #(\d+) del funcionario (.+?) al técnico (.+)/;
    const assignedMatch = mensaje.match(assignedPattern);
    if (assignedMatch) {
      const [, ticketId, officialName, technicianName] = assignedMatch;
      const template = t('notifications.ticket_assigned');
      return interpolateString(template, { 
        ticketId, 
        officialName: cleanName(officialName), 
        technicianName: cleanName(technicianName) 
      });
    }
    
    // Patrón para "Nuevo ticket creado por X (#Y)"
    const createdPattern = /Nuevo ticket creado por (.+?) \(#(\d+)\)/;
    const createdMatch = mensaje.match(createdPattern);
    if (createdMatch) {
      const [, userName, ticketId] = createdMatch;
      const template = t('notifications.ticket_created');
      return interpolateString(template, { 
        userName: cleanName(userName), 
        ticketId 
      });
    }
    
    return mensaje;
  };

  // Filtrar notificaciones por búsqueda
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.mensaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (notification.usuarioActorNombre && notification.usuarioActorNombre.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === 'unread') return matchesSearch && !notification.leida;
    if (filter === 'all') return matchesSearch;
    return matchesSearch && notification.tipo === filter;
  });
  
  console.log('🔔 Notificaciones filtradas:', filteredNotifications.length);

  const getIcon = (tipo: string) => {
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
      case 'comentario_agregado':
        return '💬';
      default:
        return '🔔';
    }
  };

  const getColor = (tipo: string) => {
    switch (tipo) {
      case 'ticket_creado':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'ticket_asignado':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'ticket_en_proceso':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
      case 'ticket_resuelto':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'ticket_cerrado':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
      case 'comentario_agregado':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatTime = (fechaCreacion: string) => {
    const date = new Date(fechaCreacion);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return t('notifications.just_now');
    if (diffInSeconds < 3600) {
      const template = t('notifications.minutes_ago');
      return interpolateString(template, { minutes: Math.floor(diffInSeconds / 60) });
    }
    if (diffInSeconds < 86400) {
      const template = t('notifications.hours_ago');
      return interpolateString(template, { hours: Math.floor(diffInSeconds / 3600) });
    }
    return date.toLocaleDateString();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleRemoveAllRead = () => {
    removeAllRead();
  };

  // Tema unificado para ambos roles (admin y cliente)
  const getThemeColors = () => {
    return {
      primary: 'bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-[hsl(var(--primary-foreground))]',
      primaryLight: 'bg-[hsl(var(--muted)/0.3)]',
      primaryText: 'text-[hsl(var(--primary))]',
      border: 'border-[hsl(var(--border))]',
      header: 'bg-[hsl(var(--primary))]'
    };
  };

  const theme = getThemeColors();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[hsl(var(--card))] rounded-xl shadow-2xl border border-[hsl(var(--border))] overflow-hidden">
        
        {/* Header */}
        <div className={`${theme.header} px-6 py-4 text-[hsl(var(--primary-foreground))]`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-semibold">
                  {t('notifications.title')}
                </h2>
                <p className="text-[hsl(var(--primary-foreground)/0.8)] text-sm">
                  {t('notifications.subtitle')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
              <button
                onClick={onClose}
                className="text-[hsl(var(--primary-foreground)/0.8)] hover:text-[hsl(var(--primary-foreground))] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))] w-4 h-4" />
              <input
                type="text"
                placeholder={t('notifications.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-lg border transition-colors ${showFilters ? theme.primary : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className={`px-3 py-2 rounded-lg border ${theme.primaryLight} ${theme.primaryText} border-current transition-colors hover:bg-[hsl(var(--muted)/0.5)]`}
                  title="Marcar todas como leídas"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={handleRemoveAllRead}
                className="px-3 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors"
                title="Eliminar todas las leídas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              >
                <option value="all">Todas</option>
                <option value="unread">No leídas</option>
                <option value="ticket_creado">Tickets creados</option>
                <option value="ticket_asignado">Tickets asignados</option>
                <option value="ticket_resuelto">Tickets resueltos</option>
                <option value="ticket_cerrado">Tickets cerrados</option>
                <option value="comentario_agregado">Comentarios</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="priority">Por prioridad</option>
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-red-500">
              <p>Error al cargar notificaciones: {error}</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[hsl(var(--muted-foreground))]">
              <Bell className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay notificaciones</p>
              <p className="text-sm">
                {searchTerm ? 'No se encontraron notificaciones que coincidan con tu búsqueda' : 'No se encontraron notificaciones para tu rol'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[hsl(var(--border))]">
              {console.log('🔔 Renderizando notificaciones:', filteredNotifications.length, 'notificaciones')}
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-[hsl(var(--muted)/0.3)] transition-colors ${!notification.leida ? 'bg-[hsl(var(--primary)/0.05)]' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getColor(notification.tipo)}`}>
                        {getIcon(notification.tipo)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${!notification.leida ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
                            {processNotificationMessage(notification.mensaje)}
                          </p>
                          
                          <div className="mt-2 flex items-center space-x-4 text-xs text-[hsl(var(--muted-foreground))]">
                            <span>{formatTime(notification.fechaCreacion)}</span>
                            {notification.ticketId && (
                              <span>Ticket #{notification.ticketId}</span>
                            )}
                            {notification.usuarioActorNombre && (
                              <span>{t('notifications.by')}: {cleanName(notification.usuarioActorNombre)}</span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs ${getColor(notification.tipo)}`}>
                              {notification.prioridad ? t(`notifications.priority.${notification.prioridad.toLowerCase()}`) : t('notifications.priority.normal')}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.leida && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className={`p-1 rounded ${theme.primaryLight} ${theme.primaryText} hover:bg-[hsl(var(--muted)/0.5)] transition-colors`}
                              title="Marcar como leída"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
          <div className="flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]">
            <span>
              {interpolateString(t('notifications.showing'), { current: filteredNotifications.length, total: notifications.length })}
              {unreadCount > 0 && ` • ${unreadCount} ${t('notifications.unread')}`}
            </span>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={loadNotifications}
                className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary)/0.8)] transition-colors"
              >
                {t('notifications.reload')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedNotificationsModal;
