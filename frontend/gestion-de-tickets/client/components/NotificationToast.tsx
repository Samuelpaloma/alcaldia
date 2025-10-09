import React, { useState, useEffect } from 'react';
import { Bell, X, Eye } from 'lucide-react';

interface NotificationToastProps {
  show: boolean;
  onClose: () => void;
  onViewNotifications: () => void;
  message?: string;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  show,
  onClose,
  onViewNotifications,
  message = "Tienes una notificación nueva"
}) => {
  useEffect(() => {
    if (show) {
      console.log('🔔 [TOAST] Mostrando toast de notificación');
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        console.log('🔔 [TOAST] Auto-cerrando toast después de 5 segundos');
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const handleClose = () => {
    onClose();
  };

  if (!show) return null;
  

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm transition-all duration-300 ease-in-out translate-x-0 opacity-100"
      style={{ 
        zIndex: 999999, 
        position: 'fixed', 
        bottom: '16px', 
        left: '16px',
        right: '16px',
        pointerEvents: 'auto',
        display: 'block',
        visibility: 'visible'
      }}
    >
      <div 
        className="notification-toast bg-white border border-gray-200 rounded-lg shadow-lg p-3 cursor-pointer hover:shadow-xl transition-all duration-200" 
        style={{ 
          backgroundColor: '#ffffff !important', 
          border: '1px solid #e5e7eb !important', 
          borderRadius: '8px !important', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1) !important', 
          padding: '12px !important', 
          position: 'relative !important',
          zIndex: '999999 !important',
          display: 'block !important',
          visibility: 'visible !important',
          opacity: '1 !important',
          pointerEvents: 'auto !important'
        }}
        onClick={onViewNotifications}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Bell className="w-4 h-4 text-blue-500 animate-pulse" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {message}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Toca para ver detalles
            </p>
          </div>
          
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;