import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, RefreshCw, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useRoleNotifications } from '@/hooks/use-role-notifications';
import { useUserInfo } from '@/hooks/use-user-info';

interface TestNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TestNotificationsModal({ isOpen, onClose }: TestNotificationsModalProps) {
  const { userInfo } = useUserInfo();
  const userEmail = userInfo?.email || '';
  const userRole = userInfo?.tipoUsuario?.toLowerCase() || '';
  
  const {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead
  } = useRoleNotifications(userEmail, userRole);

  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadDebugInfo();
    }
  }, [isOpen, userEmail, userRole]);

  const loadDebugInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/role-based/debug/${userEmail}`);
      if (response.ok) {
        const debugData = await response.json();
        setDebugInfo(debugData);
      }
    } catch (error) {
      console.error('Error cargando debug info:', error);
    }
  };

  if (!isOpen) return null;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'ticket_creado':
        return <Info className="w-4 h-4 text-blue-600" />;
      case 'ticket_asignado':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'ticket_resuelto':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'ticket_cerrado':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">🔧 Test - Notificaciones por Roles</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} no leídas
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Debug Info */}
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-semibold mb-2">🐛 Debug Info:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Email:</strong> {userEmail}</p>
            <p><strong>Rol:</strong> {userRole}</p>
            <p><strong>Total notificaciones:</strong> {notifications.length}</p>
            <p><strong>No leídas:</strong> {unreadCount}</p>
            {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
            
            {debugInfo && (
              <div className="mt-3 p-2 bg-white rounded border">
                <h4 className="font-semibold mb-1">Backend Debug:</h4>
                <p><strong>Usuario existe:</strong> {debugInfo.usuarioExiste ? '✅' : '❌'}</p>
                {debugInfo.usuarioInfo && (
                  <p><strong>Tipo usuario:</strong> {debugInfo.usuarioInfo.tipoUsuario}</p>
                )}
                <p><strong>Total en BD:</strong> {debugInfo.totalNotificacionesEnBD}</p>
                <p><strong>Contiene email:</strong> {debugInfo.totalNotificacionesConteniendoEmail}</p>
                <p><strong>Específicas:</strong> {debugInfo.notificacionesEspecificas}</p>
                <p><strong>Por rol:</strong> {debugInfo.notificacionesPorRol}</p>
                {debugInfo.ejemplosNotificaciones && debugInfo.ejemplosNotificaciones.length > 0 && (
                  <div className="mt-2">
                    <p><strong>Ejemplos de destinatarios:</strong></p>
                    {debugInfo.ejemplosNotificaciones.map((ej: any, index: number) => (
                      <p key={index} className="text-xs ml-2">
                        {ej.destinatarios}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Cargando notificaciones...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No hay notificaciones
              </h3>
              <p className="text-gray-500">
                No se encontraron notificaciones para tu rol: <strong>{userRole}</strong>
              </p>
              <Button 
                onClick={loadNotifications} 
                className="mt-4"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recargar
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors ${
                    !notification.leida 
                      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => !notification.leida && markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notification.tipo)}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">
                            {notification.mensaje}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{formatTimeAgo(notification.fechaCreacion)}</span>
                            <span className="capitalize">{notification.tipo.replace('_', ' ')}</span>
                            <span className="capitalize">{notification.prioridad}</span>
                            {notification.ticketId && (
                              <span>Ticket #{notification.ticketId}</span>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            <strong>Destinatarios:</strong> {JSON.stringify(notification.destinatarios)}
                          </div>
                        </div>
                      </div>
                      {!notification.leida && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Mostrando {notifications.length} notificaciones para {userRole}
            </div>
            <Button onClick={loadNotifications} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Recargar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
