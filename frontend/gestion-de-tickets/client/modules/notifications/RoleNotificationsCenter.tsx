import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  CheckCircle,
  Clock,
  Search,
  RefreshCw,
  Filter,
  Trash2
} from 'lucide-react';
import { useRoleNotifications } from '@/hooks/use-role-notifications';
import { useUserInfo } from '@/hooks/use-user-info';

const RoleNotificationsCenter: React.FC = () => {
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

  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar notificaciones por búsqueda
  const filteredNotifications = notifications.filter(notification => 
    notification.mensaje.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.tipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (notification.usuarioActorNombre && notification.usuarioActorNombre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Cargando notificaciones...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadNotifications} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Centro de Notificaciones</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} notificaciones no leídas` : 'Todas las notificaciones están leídas'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadNotifications} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <Check className="w-4 h-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar notificaciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="unread">No leídas</SelectItem>
                  <SelectItem value="ticket_creado">Ticket Creado</SelectItem>
                  <SelectItem value="ticket_asignado">Ticket Asignado</SelectItem>
                  <SelectItem value="ticket_resuelto">Ticket Resuelto</SelectItem>
                  <SelectItem value="ticket_cerrado">Ticket Cerrado</SelectItem>
                </SelectContent>
              </Select>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de notificaciones */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay notificaciones</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'No se encontraron notificaciones con ese criterio de búsqueda.' : 'No tienes notificaciones en este momento.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
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
                          {notification.prioridad.toUpperCase()}
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
                          {formatDate(notification.fechaCreacion)}
                        </span>
                        {notification.usuarioActorNombre && (
                          <span>Por: {notification.usuarioActorNombre}</span>
                        )}
                        {notification.ticketId && (
                          <span>Ticket: #{notification.ticketId}</span>
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
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeNotification(notification.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Acciones adicionales */}
      {notifications.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {filteredNotifications.length} de {notifications.length} notificaciones mostradas
              </div>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoleNotificationsCenter;

