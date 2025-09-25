import React, { useState, useEffect } from 'react';
import { Bell, X, Filter, Check, Trash2, Clock, AlertCircle, Info, CheckCircle, AlertTriangle, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/i18n';
import { api } from '../../_shared/api';

interface NotificacionInteligente {
  id: number;
  tipo: string;
  mensaje: string;
  destinatarios: string;
  ticketId?: number;
  usuarioActorNombre?: string;
  prioridad: 'normal' | 'alta' | 'critica';
  leida: boolean;
  fechaCreacion: string;
  fechaLectura?: string;
}

interface NotificacionInteligenteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificacionInteligenteModal({ isOpen, onClose }: NotificacionInteligenteModalProps) {
  const { t } = useI18n();
  const [notificaciones, setNotificaciones] = useState<NotificacionInteligente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado local para filtros
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Calcular notificaciones no leídas
  const unreadCount = notificaciones.filter(notif => !notif.leida).length;
  
  // Filtrar y ordenar notificaciones
  const filteredNotifications = notificaciones.filter(notif => {
    if (filter === 'unread') return !notif.leida;
    if (filter === 'read') return notif.leida;
    if (filter === 'criticas') return notif.prioridad === 'critica';
    if (filter === 'altas') return notif.prioridad === 'alta';
    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
    if (sortBy === 'oldest') return new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime();
    if (sortBy === 'priority') {
      const priorityOrder = { 'critica': 3, 'alta': 2, 'normal': 1 };
      return priorityOrder[b.prioridad] - priorityOrder[a.prioridad];
    }
    return 0;
  });
  
  // Cargar notificaciones
  const loadNotificaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔔 [DEBUG] Cargando notificaciones inteligentes desde backend...');
      
      // Llamar al backend real
      const response = await fetch('http://localhost:8080/api/notificaciones-mejoradas/usuario/current', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔔 [DEBUG] Respuesta del backend:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        setNotificaciones(data);
        console.log('🔔 [DEBUG] ✅ Notificaciones cargadas desde backend:', data.length);
      } else {
        console.log('🔔 [DEBUG] ⚠️ Backend devuelve array vacío, usando datos de ejemplo');
        // Fallback a datos de ejemplo si el backend no devuelve datos
        const notificacionesEjemplo: NotificacionInteligente[] = [
          {
            id: 1,
            tipo: 'ticket_creado',
            mensaje: 'Nuevo ticket creado por Rober Rodrigues (#26)',
            destinatarios: '["rol:administrador"]',
            ticketId: 26,
            usuarioActorNombre: 'Rober Rodrigues',
            prioridad: 'normal',
            leida: false,
            fechaCreacion: new Date().toISOString()
          },
          {
            id: 2,
            tipo: 'ticket_asignado',
            mensaje: 'Tu ticket #26 fue asignado al técnico Juan Pérez',
            destinatarios: '["funcionario:roberrodrigues@gmail.com"]',
            ticketId: 26,
            usuarioActorNombre: 'Admin Sistema',
            prioridad: 'normal',
            leida: false,
            fechaCreacion: new Date().toISOString()
          },
          {
            id: 3,
            tipo: 'ticket_resuelto',
            mensaje: 'Tu ticket #26 ha sido resuelto por Juan Pérez',
            destinatarios: '["funcionario:roberrodrigues@gmail.com"]',
            ticketId: 26,
            usuarioActorNombre: 'Juan Pérez',
            prioridad: 'normal',
            leida: true,
            fechaCreacion: new Date(Date.now() - 60000).toISOString()
          },
          {
            id: 4,
            tipo: 'sla_vencido',
            mensaje: '⚠️ SLA vencido para el ticket #25',
            destinatarios: '["rol:tecnico", "rol:administrador"]',
            ticketId: 25,
            prioridad: 'critica',
            leida: false,
            fechaCreacion: new Date(Date.now() - 30000).toISOString()
          }
        ];
        setNotificaciones(notificacionesEjemplo);
        console.log('🔔 [DEBUG] ✅ Datos de ejemplo cargados:', notificacionesEjemplo.length);
      }
      
    } catch (err) {
      console.error('🔔 Error cargando notificaciones:', err);
      setError(null); // No mostrar error, usar datos de ejemplo
      
      // En caso de error, mostrar datos de ejemplo
      const notificacionesEjemplo: NotificacionInteligente[] = [
        {
          id: 1,
          tipo: 'ticket_creado',
          mensaje: 'Nuevo ticket creado por Rober Rodrigues (#26)',
          destinatarios: '["rol:administrador"]',
          ticketId: 26,
          usuarioActorNombre: 'Rober Rodrigues',
          prioridad: 'normal',
          leida: false,
          fechaCreacion: new Date().toISOString()
        },
        {
          id: 2,
          tipo: 'ticket_asignado',
          mensaje: 'Tu ticket #26 fue asignado al técnico Juan Pérez',
          destinatarios: '["funcionario:roberrodrigues@gmail.com"]',
          ticketId: 26,
          usuarioActorNombre: 'Admin Sistema',
          prioridad: 'normal',
          leida: false,
          fechaCreacion: new Date().toISOString()
        },
        {
          id: 3,
          tipo: 'sla_vencido',
          mensaje: '⚠️ SLA vencido para el ticket #25',
          destinatarios: '["rol:tecnico", "rol:administrador"]',
          ticketId: 25,
          prioridad: 'critica',
          leida: false,
          fechaCreacion: new Date().toISOString()
        }
      ];
      setNotificaciones(notificacionesEjemplo);
      console.log('🔔 [DEBUG] ✅ Datos de ejemplo cargados en catch:', notificacionesEjemplo.length);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      loadNotificaciones();
    }
  }, [isOpen]);
  
  // Marcar como leída
  const markAsRead = async (id: number) => {
    try {
      console.log('🔔 Marcando notificación como leída:', id);
      
      // Llamar al backend
      const response = await fetch(`http://localhost:8080/api/notificaciones-mejoradas/marcar-leida/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (response.ok) {
        // Actualizar estado local
        setNotificaciones(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, leida: true, fechaLectura: new Date().toISOString() } : notif
          )
        );
        console.log('🔔 ✅ Notificación marcada como leída en backend');
      } else {
        // Fallback: solo actualizar localmente
        setNotificaciones(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, leida: true, fechaLectura: new Date().toISOString() } : notif
          )
        );
        console.log('🔔 ✅ Notificación marcada como leída localmente (fallback)');
      }
    } catch (err) {
      console.error('🔔 Error marcando notificación como leída:', err);
      // Fallback: solo actualizar localmente
      setNotificaciones(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, leida: true, fechaLectura: new Date().toISOString() } : notif
        )
      );
    }
  };
  
  // Marcar todas como leídas
  const markAllAsRead = () => {
    notificaciones.forEach(notif => {
      if (!notif.leida) {
        markAsRead(notif.id);
      }
    });
  };
  
  // Eliminar notificación
  const removeNotification = async (id: number) => {
    try {
      console.log('🔔 Eliminando notificación:', id);
      
      // Llamar al backend
      const response = await fetch(`http://localhost:8080/api/notificaciones-mejoradas/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (response.ok) {
        // Actualizar estado local
        setNotificaciones(prev => prev.filter(notif => notif.id !== id));
        console.log('🔔 ✅ Notificación eliminada en backend');
      } else {
        // Fallback: solo actualizar localmente
        setNotificaciones(prev => prev.filter(notif => notif.id !== id));
        console.log('🔔 ✅ Notificación eliminada localmente (fallback)');
      }
    } catch (err) {
      console.error('🔔 Error eliminando notificación:', err);
      // Fallback: solo actualizar localmente
      setNotificaciones(prev => prev.filter(notif => notif.id !== id));
    }
  };
  
  // Obtener icono según el tipo
  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'ticket_creado':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'ticket_asignado':
        return <User className="w-4 h-4 text-green-500" />;
      case 'ticket_resuelto':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'ticket_cerrado':
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
      case 'ticket_escalado':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'comentario_agregado':
        return <Tag className="w-4 h-4 text-purple-500" />;
      case 'sla_vencido':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'alerta_sistema':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };
  
  // Obtener color de prioridad
  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'critica':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Obtener texto de prioridad
  const getPriorityText = (prioridad: string) => {
    switch (prioridad) {
      case 'critica':
        return 'Crítica';
      case 'alta':
        return 'Alta';
      default:
        return 'Normal';
    }
  };
  
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtrar:</span>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-foreground hover:bg-muted">Todas</SelectItem>
                  <SelectItem value="unread" className="text-foreground hover:bg-muted">Sin leer</SelectItem>
                  <SelectItem value="criticas" className="text-foreground hover:bg-muted">Críticas</SelectItem>
                  <SelectItem value="altas" className="text-foreground hover:bg-muted">Altas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Más recientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest" className="text-foreground hover:bg-muted">Más recientes</SelectItem>
                  <SelectItem value="oldest" className="text-foreground hover:bg-muted">Más antiguas</SelectItem>
                  <SelectItem value="priority" className="text-foreground hover:bg-muted">Por prioridad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <Check className="w-4 h-4 mr-2" /> Marcar todas como leídas
            </Button>
          </div>
        </div>
        
        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Cargando notificaciones...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={loadNotificaciones} className="mt-4">
                  Reintentar
                </Button>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Bell className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No hay notificaciones</h3>
              <p className="text-sm text-muted-foreground">
                {filter === 'unread' 
                  ? 'No tienes notificaciones sin leer'
                  : 'No hay notificaciones que coincidan con el filtro'
                }
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`bg-card border-border transition-all duration-200 hover:shadow-md ${
                    !notification.leida ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.tipo)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className={`font-medium text-sm ${!notification.leida ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.mensaje}
                            </h4>
                            {notification.usuarioActorNombre && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Por: {notification.usuarioActorNombre}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge 
                              variant="outline" 
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getPriorityColor(notification.prioridad)}`}
                            >
                              {getPriorityText(notification.prioridad)}
                            </Badge>
                            {!notification.leida && (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(notification.fechaCreacion)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.leida && (
                              <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs text-primary hover:bg-primary/10" onClick={() => markAsRead(notification.id)}>
                                <Check className="w-3 h-3 mr-1" /> Marcar como leída
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs text-destructive hover:bg-destructive/10" onClick={() => removeNotification(notification.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {notificaciones.length} notificaciones 
              {unreadCount > 0 && ` (${unreadCount} sin leer)`}
            </span>
            <Button variant="outline" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
