import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { api } from '../../../shared/api';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  User,
  FileText
} from 'lucide-react';

interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fechaCreacion: string;
  fechaLeida?: string;
  usuarioEmail: string;
  ticketId?: number;
  creadorEmail?: string;
}

interface NotificationsCenterProps {
  userRole: string;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({ userRole }) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [filterNotificationType, setFilterNotificationType] = useState<'all' | 'TICKET_CREADO' | 'TICKET_ASIGNADO' | 'TICKET_ACTUALIZADO' | 'TICKET_RESUELTO' | 'SISTEMA_ALERTA'>('all');
  const [stats, setStats] = useState({
    totalNotificaciones: 0,
    notificacionesNoLeidas: 0,
    notificacionesLeidas: 0,
    notificacionesHoy: 0
  });

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const leida = filterType === 'all' ? undefined : filterType === 'read';
      const response = await api.getNotificaciones(0, 50, leida);
      setNotifications(response.content || []);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las notificaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await api.getEstadisticasNotificaciones();
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.marcarNotificacionComoLeida(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id 
            ? { ...notif, leida: true, fechaLeida: new Date().toISOString() }
            : notif
        )
      );
      loadStats(); // Recargar estadísticas
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar la notificación como leída",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.marcarTodasComoLeidas();
      setNotifications(prev => 
        prev.map(notif => 
          !notif.leida 
            ? { ...notif, leida: true, fechaLeida: new Date().toISOString() }
            : notif
        )
      );
      loadStats(); // Recargar estadísticas
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
      toast({
        title: "Error",
        description: "No se pudieron marcar todas las notificaciones como leídas",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.eliminarNotificacion(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      loadStats(); // Recargar estadísticas
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la notificación",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'TICKET_RESUELTO':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'TICKET_ASIGNADO':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'SISTEMA_ALERTA':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (tipo: string) => {
    switch (tipo) {
      case 'TICKET_RESUELTO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'TICKET_ASIGNADO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SISTEMA_ALERTA':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.mensaje.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' ||
                         (filterType === 'unread' && !notification.leida) ||
                         (filterType === 'read' && notification.leida);
    
    const matchesType = filterNotificationType === 'all' || notification.tipo === filterNotificationType;
    
    return matchesSearch && matchesFilter && matchesType;
  });

  const unreadCount = stats.notificacionesNoLeidas;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Centro de Notificaciones</h1>
          <p className="text-muted-foreground">Gestiona tus notificaciones y alertas</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              Marcar todas como leídas
            </Button>
          )}
          <Button onClick={loadNotifications} variant="outline" size="sm">
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{stats.totalNotificaciones}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">No Leídas</p>
                <p className="text-2xl font-bold">{stats.notificacionesNoLeidas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Leídas</p>
                <p className="text-2xl font-bold">{stats.notificacionesLeidas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Hoy</p>
                <p className="text-2xl font-bold">{stats.notificacionesHoy}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar notificaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
                size="sm"
              >
                Todas
              </Button>
              <Button
                variant={filterType === 'unread' ? 'default' : 'outline'}
                onClick={() => setFilterType('unread')}
                size="sm"
              >
                No Leídas
              </Button>
              <Button
                variant={filterType === 'read' ? 'default' : 'outline'}
                onClick={() => setFilterType('read')}
                size="sm"
              >
                Leídas
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterNotificationType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterNotificationType('all')}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={filterNotificationType === 'TICKET_CREADO' ? 'default' : 'outline'}
                onClick={() => setFilterNotificationType('TICKET_CREADO')}
                size="sm"
              >
                Ticket Creado
              </Button>
              <Button
                variant={filterNotificationType === 'TICKET_ASIGNADO' ? 'default' : 'outline'}
                onClick={() => setFilterNotificationType('TICKET_ASIGNADO')}
                size="sm"
              >
                Ticket Asignado
              </Button>
              <Button
                variant={filterNotificationType === 'TICKET_RESUELTO' ? 'default' : 'outline'}
                onClick={() => setFilterNotificationType('TICKET_RESUELTO')}
                size="sm"
              >
                Ticket Resuelto
              </Button>
              <Button
                variant={filterNotificationType === 'SISTEMA_ALERTA' ? 'default' : 'outline'}
                onClick={() => setFilterNotificationType('SISTEMA_ALERTA')}
                size="sm"
              >
                Sistema
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificaciones */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay notificaciones que coincidan con los filtros</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card key={notification.id} className={`${!notification.leida ? 'border-l-4 border-l-blue-500' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{notification.titulo}</h3>
                        {!notification.leida && (
                          <Badge variant="default" className="text-xs">
                            Nueva
                          </Badge>
                        )}
                        <Badge className={getNotificationColor(notification.tipo)}>
                          {notification.tipo.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.leida && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{notification.mensaje}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(notification.fechaCreacion).toLocaleString()}
                      </span>
                      {notification.ticketId && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Ticket #{notification.ticketId}
                        </span>
                      )}
                      {notification.leida && notification.fechaLeida && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Leída: {new Date(notification.fechaLeida).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
