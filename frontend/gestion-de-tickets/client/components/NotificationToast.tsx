import React, { useState, useEffect } from 'react';

interface NotificationToastProps {
  notification: {
    id: number;
    tipo: string;
    mensaje: string;
    usuarioActorNombre?: string;
    ticketId?: number;
    prioridad: string;
    fechaCreacion: string;
  };
  onClose: () => void;
  onMarkAsRead?: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onMarkAsRead
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar con animación
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-ocultar después de 5 segundos
    const autoHideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Esperar animación de salida
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoHideTimer);
    };
  }, [onClose]);

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
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'ticket_asignado':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'ticket_en_proceso':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'ticket_resuelto':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'ticket_cerrado':
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
      case 'comentario_agregado':
        return 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatTime = (fechaCreacion: string) => {
    const date = new Date(fechaCreacion);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        bg-white dark:bg-slate-800 
        border border-slate-200 dark:border-slate-700
        border-l-4 shadow-lg rounded-lg
        transform transition-all duration-300 ease-in-out
        ${getColor(notification.tipo)}
        ${isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {getIcon(notification.tipo)}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Nueva Notificación
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatTime(notification.fechaCreacion)}
              </p>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mt-3">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {notification.mensaje}
          </p>
          
          {notification.ticketId && (
            <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="mr-1">🎫</span>
              Ticket #{notification.ticketId}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {notification.prioridad || 'Normal'}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              NUEVA
            </span>
          </div>
          
          {onMarkAsRead && (
            <button
              onClick={() => {
                onMarkAsRead();
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
            >
              Marcar leída
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;

