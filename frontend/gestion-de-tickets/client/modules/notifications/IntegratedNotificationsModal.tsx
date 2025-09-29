import React from 'react';
import { Bell, X, Filter, Check, Trash2, Clock, AlertCircle, Info, CheckCircle, AlertTriangle, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/i18n';
import { useRoleNotifications } from '@/hooks/use-role-notifications';
import { useUserInfo } from '@/hooks/use-user-info';

interface IntegratedNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IntegratedNotificationsModal({ isOpen, onClose }: IntegratedNotificationsModalProps) {
  const { t } = useI18n();
  const { userInfo } = useUserInfo();
  const userEmail = userInfo?.email || '';
  const userRole = userInfo?.tipoUsuario?.toLowerCase() || '';
  
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
    getNotificationIcon,
    getNotificationColor,
    loadNotifications
  } = useRoleNotifications(userEmail, userRole);

  // Formatear tiempo
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  };

  // Obtener color de prioridad
  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'critica':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtener icono de prioridad
  const getPriorityIcon = (prioridad: string) => {
    switch (prioridad) {
      case 'critica':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'alta':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'normal':
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Notificaciones Inteligentes</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} sin leer
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-muted text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Filters */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrar notificaciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="unread">No leídas</SelectItem>
                  <SelectItem value="ticket_creado">Ticket Creado</SelectItem>
                  <SelectItem value="ticket_asignado">Ticket Asignado</SelectItem>
                  <SelectItem value="ticket_en_proceso">En Proceso</SelectItem>
                  <SelectItem value="ticket_resuelto">Ticket Resuelto</SelectItem>
                  <SelectItem value="ticket_cerrado">Ticket Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="oldest">Más antiguas</SelectItem>
                  <SelectItem value="priority">Prioridad</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadNotifications} variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    await api.createTestNotifications();
                    loadNotifications();
                  } catch (error) {
                    console.error('Error creando notificaciones de prueba:', error);
                  }
                }} 
                variant="outline" 
                size="sm"
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Crear Pruebas
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Cargando notificaciones...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadNotifications} variant="outline">
                  Reintentar
                </Button>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay notificaciones</h3>
                <p className="text-muted-foreground">
                  No tienes notificaciones en este momento.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all duration-200 hover:shadow-md ${
                    !notification.leida ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`text-2xl ${getNotificationColor(notification.tipo)}`}>
                          {getNotificationIcon(notification.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline" className={getPriorityColor(notification.prioridad)}>
                              {getPriorityIcon(notification.prioridad)}
                              <span className="ml-1">{notification.prioridad.toUpperCase()}</span>
                            </Badge>
                            <Badge variant="secondary">
                              {notification.tipo.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {!notification.leida && (
                              <Badge variant="default" className="bg-blue-600">
                                NUEVA
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {notification.mensaje}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(notification.fechaCreacion)}
                            </span>
                            {notification.usuarioActorNombre && (
                              <span className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                Por: {notification.usuarioActorNombre}
                              </span>
                            )}
                            {notification.ticketId && (
                              <span className="flex items-center">
                                <Tag className="w-3 h-3 mr-1" />
                                Ticket: #{notification.ticketId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-4">
                        {!notification.leida && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                            className="text-green-600 hover:text-green-700"
                            title="Marcar como leída"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeNotification(notification.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar notificación"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {notifications.length} notificaciones mostradas
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Marcar todas como leídas
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeAllRead}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar leídas
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
