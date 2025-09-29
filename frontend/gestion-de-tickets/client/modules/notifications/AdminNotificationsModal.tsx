import React, { useState, useEffect } from 'react';
import { Bell, X, Filter, Check, Trash2, Clock, AlertCircle, Info, CheckCircle, AlertTriangle, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRoleNotifications } from '@/hooks/use-role-notifications';
import { useUserInfo } from '@/hooks/use-user-info';

interface AdminNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminNotificationsModal({ isOpen, onClose }: AdminNotificationsModalProps) {
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

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, userEmail, userRole]);

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

  const getPriorityIcon = (prioridad: string) => {
    switch (prioridad?.toLowerCase()) {
      case 'critica': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'alta': return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'normal': return <Info className="w-4 h-4 text-blue-400" />;
      case 'baja': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'ticket_creado': return <Tag className="w-4 h-4 text-blue-400" />;
      case 'ticket_asignado': return <User className="w-4 h-4 text-green-400" />;
      case 'ticket_en_proceso': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'ticket_resuelto': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'ticket_cerrado': return <Check className="w-4 h-4 text-slate-400" />;
      case 'comentario_agregado': return <Bell className="w-4 h-4 text-purple-400" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800 rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Panel de Notificaciones</h2>
              <p className="text-sm text-slate-400">Centro de notificaciones para administradores</p>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-red-600 hover:bg-red-700 text-white border-0 px-3 py-1">
                {unreadCount} no leídas
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-700 h-10 w-10 rounded-lg"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-white">Cargando notificaciones...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <p className="text-red-400 mb-4 text-lg">{error}</p>
              <Button 
                onClick={loadNotifications} 
                className="bg-red-600 hover:bg-red-700 text-white border-0"
              >
                Reintentar
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-white text-lg mb-2">No hay notificaciones</p>
              <p className="text-slate-400 mb-6">No se encontraron notificaciones para tu rol: <span className="text-blue-400 font-semibold">{userRole}</span></p>
              <Button 
                onClick={loadNotifications} 
                className="bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                <Bell className="w-4 h-4 mr-2" />
                Recargar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`p-5 border rounded-xl hover:bg-slate-800 transition-all duration-200 cursor-pointer group ${
                    !notification.leida 
                      ? 'bg-blue-950/30 border-blue-600/50 shadow-lg shadow-blue-900/20' 
                      : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => !notification.leida && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`p-2 rounded-lg ${!notification.leida ? 'bg-blue-600/20' : 'bg-slate-700'}`}>
                        {getTypeIcon(notification.tipo)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-white font-medium leading-relaxed">
                          {notification.mensaje}
                        </p>
                        {!notification.leida && (
                          <div className="flex items-center gap-2 ml-4">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-blue-400 font-semibold">NUEVA</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="flex items-center gap-2 text-slate-400">
                          <Clock className="w-4 h-4" />
                          {formatTimeAgo(notification.fechaCreacion)}
                        </span>
                        <span className="flex items-center gap-2 text-slate-400">
                          {getPriorityIcon(notification.prioridad)}
                          <span className="capitalize">{notification.prioridad || 'Normal'}</span>
                        </span>
                        {notification.ticketId && (
                          <span className="flex items-center gap-2 text-slate-400">
                            <Tag className="w-4 h-4" />
                            Ticket #{notification.ticketId}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {!notification.leida && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white border-0 text-xs px-3 py-1"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Marcar leída
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800 rounded-b-xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-400">
              Mostrando <span className="text-white font-semibold">{notifications.length}</span> notificaciones para 
              <span className="text-blue-400 font-semibold ml-1 capitalize">{userRole}</span>
            </span>
          </div>
          <Button 
            onClick={loadNotifications} 
            className="bg-blue-600 hover:bg-blue-700 text-white border-0"
            size="sm"
          >
            <Bell className="w-4 h-4 mr-2" />
            Recargar
          </Button>
        </div>
      </div>
    </div>
  );
}

