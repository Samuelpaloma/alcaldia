import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  RefreshCw
} from 'lucide-react';
import { api } from '@shared/api';
import { useNotifications } from '../_shared/GlobalWebSocket';

interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
  leida: boolean;
  fechaCreacion: string;
  fechaLectura?: string;
  ticketId?: number | null;
  usuarioId?: number;
}

const NotificationsCenter: React.FC = () => {
  const { notificaciones, updateNotificacion, removeNotificacion } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Debug: Log cuando cambia el estado de notificaciones
  useEffect(() => {
    console.log('🔔 [DEBUG] Estado de notificaciones actualizado:', notificaciones);
    console.log('🔔 [DEBUG] Cantidad de notificaciones:', notificaciones.length);
  }, [notificaciones]);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo: '',
    estado: ''
  });

  // Cargar notificaciones
  const loadNotificaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔔 [DEBUG] Cargando notificaciones desde API...');
      const response = await api.getNotificaciones();
      console.log('🔔 [DEBUG] Respuesta de notificaciones:', response);
      console.log('🔔 [DEBUG] Contenido de notificaciones:', response?.content);
      console.log('🔔 [DEBUG] Total de notificaciones:', response?.totalElements);
      
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
          usuarioId: notif.usuarioId
        }));
        console.log('🔔 [DEBUG] Notificaciones mapeadas:', notificacionesData);
        // Las notificaciones se manejan globalmente ahora
        console.log('🔔 [DEBUG] Estado de notificaciones actualizado');
      } else {
        // Fallback con datos de ejemplo si no hay respuesta
        const notificacionesData = [
          {
            id: 1,
            titulo: 'Sistema Iniciado',
            mensaje: 'El sistema de tickets ha sido iniciado correctamente',
            tipo: 'info' as const,
            leida: false,
            fechaCreacion: new Date().toISOString(),
            ticketId: null
          }
        ];
        // Las notificaciones se manejan globalmente ahora
      }
    } catch (err) {
      console.error('🔔 Error cargando notificaciones:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones');
      
      // Fallback con datos de ejemplo en caso de error
      const notificacionesData = [
        {
          id: 1,
          titulo: 'Sistema Iniciado',
          mensaje: 'El sistema de tickets ha sido iniciado correctamente',
          tipo: 'info' as const,
          leida: false,
          fechaCreacion: new Date().toISOString(),
          ticketId: null
        }
      ];
        // Las notificaciones se manejan globalmente ahora
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔔 NotificationsCenter montado - iniciando carga...');
    loadNotificaciones();
  }, []);

  // Filtrar notificaciones
  const notificacionesFiltradas = notificaciones.filter(notif => {
    const cumpleBusqueda = !filtros.busqueda || 
      notif.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      notif.mensaje.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const cumpleTipo = !filtros.tipo || notif.tipo === filtros.tipo;
    const cumpleEstado = !filtros.estado || 
      (filtros.estado === 'leida' && notif.leida) ||
      (filtros.estado === 'no_leida' && !notif.leida);
    
    return cumpleBusqueda && cumpleTipo && cumpleEstado;
  });

  // Marcar como leída
  const marcarComoLeida = async (id: number) => {
    try {
      console.log('🔔 Marcando notificación como leída:', id);
      await api.marcarNotificacionComoLeida(id);
      
      updateNotificacion(id, { 
        leida: true, 
        fechaLectura: new Date().toISOString() 
      });
    } catch (err) {
      console.error('🔔 Error marcando notificación como leída:', err);
      // Actualizar localmente aunque falle la API
      updateNotificacion(id, { 
        leida: true, 
        fechaLectura: new Date().toISOString() 
      });
    }
  };

  // Marcar todas como leídas
  const marcarTodasComoLeidas = async () => {
    try {
      console.log('🔔 Marcando todas las notificaciones como leídas...');
      await api.marcarTodasComoLeidas();
      
      notificaciones.forEach(notif => {
        updateNotificacion(notif.id, { 
          leida: true, 
          fechaLectura: new Date().toISOString() 
        });
      });
    } catch (err) {
      console.error('🔔 Error marcando todas como leídas:', err);
      // Actualizar localmente aunque falle la API
      notificaciones.forEach(notif => {
        updateNotificacion(notif.id, { 
          leida: true, 
          fechaLectura: new Date().toISOString() 
        });
      });
    }
  };

  // Eliminar notificación
  const eliminarNotificacion = async (id: number) => {
    try {
      console.log('🔔 Eliminando notificación:', id);
      await api.eliminarNotificacion(id);
      
      removeNotificacion(id);
    } catch (err) {
      console.error('🔔 Error eliminando notificación:', err);
      // Eliminar localmente aunque falle la API
      removeNotificacion(id);
    }
  };

  // Obtener icono por tipo
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <X className="w-5 h-5 text-red-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Obtener color por tipo
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="notifications-center">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  console.log('🔔 [DEBUG] Renderizando NotificationsCenter con', notificaciones.length, 'notificaciones');
  
  return (
    <div className="notifications-center">
      {/* Header */}
      <div className="notifications-header">
        <div className="header-content">
          <h1 className="notifications-title">Centro de Notificaciones</h1>
          <p className="notifications-subtitle">Gestiona todas las notificaciones del sistema</p>
          <div className="connection-status">
            <div className="status-indicator connected">
              <div className="status-dot"></div>
              <span>Conectado en tiempo real</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <Button onClick={loadNotificaciones} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </Button>
          <Button onClick={marcarTodasComoLeidas} variant="outline">
            <Check className="w-4 h-4 mr-2" />
            Marcar todas como leídas
          </Button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {/* Filtros */}
      <Card className="filters-card">
        <CardContent className="p-6">
          <div className="filters-grid">
            <div className="filter-group">
              <Label htmlFor="busqueda">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="busqueda"
                  placeholder="Buscar notificaciones..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={filtros.tipo}
                onValueChange={(value) => setFiltros({ ...filtros, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="info">Información</SelectItem>
                  <SelectItem value="warning">Advertencia</SelectItem>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={filtros.estado}
                onValueChange={(value) => setFiltros({ ...filtros, estado: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="no_leida">No leídas</SelectItem>
                  <SelectItem value="leida">Leídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de notificaciones */}
      <div className="notifications-list">
        {notificacionesFiltradas.length === 0 ? (
          <Card className="empty-state">
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
              <p className="text-gray-500">No se encontraron notificaciones con los filtros aplicados.</p>
            </CardContent>
          </Card>
        ) : (
          notificacionesFiltradas.map(notif => (
            <Card key={notif.id} className={`notification-card ${!notif.leida ? 'unread' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getTipoIcon(notif.tipo)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notif.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notif.mensaje}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(notif.fechaCreacion).toLocaleString()}</span>
                          </div>
                          <Badge className={getTipoColor(notif.tipo)}>
                            {notif.tipo}
                          </Badge>
                          {notif.ticketId && (
                            <Badge variant="outline">
                              Ticket #{notif.ticketId}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notif.leida && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        {!notif.leida ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => marcarComoLeida(notif.id)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Marcar como leída
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => eliminarNotificacion(notif.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
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

export default NotificationsCenter;