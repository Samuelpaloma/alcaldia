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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      console.log('🔔 [TOAST] Mostrando toast de notificación');
      setIsVisible(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        console.log('🔔 [TOAST] Auto-cerrando toast después de 5 segundos');
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!show) return null;
  
  // Toast temporal para debug
  if (show) {
    console.log('🔔 [TOAST DEBUG] Toast debería estar visible ahora');
    
    // Toast temporal para debug - IMPOSIBLE DE OCULTAR
    setTimeout(() => {
      const debugToast = document.createElement('div');
      debugToast.innerHTML = `
        <div style="
          position: fixed !important;
          top: 20px !important;
          left: 20px !important;
          background: red !important;
          color: white !important;
          padding: 20px !important;
          border-radius: 8px !important;
          z-index: 9999999 !important;
          font-size: 16px !important;
          font-weight: bold !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        ">
          🔔 TOAST DEBUG - VISIBLE
        </div>
      `;
      document.body.appendChild(debugToast);
      
      // Remover después de 3 segundos
      setTimeout(() => {
        if (debugToast.parentNode) {
          debugToast.parentNode.removeChild(debugToast);
        }
      }, 3000);
    }, 100);
  }

  return (
    <div 
      className={`fixed bottom-4 right-4 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`} 
      style={{ 
        zIndex: 999999, 
        position: 'fixed', 
        bottom: '16px', 
        right: '16px',
        pointerEvents: 'auto',
        display: 'block',
        visibility: 'visible'
      }}
    >
      <div 
        className="notification-toast bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm" 
        style={{ 
          backgroundColor: '#ffffff !important', 
          border: '1px solid #e5e7eb !important', 
          borderRadius: '8px !important', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1) !important', 
          padding: '16px !important', 
          maxWidth: '384px !important',
          position: 'relative !important',
          zIndex: '999999 !important',
          display: 'block !important',
          visibility: 'visible !important',
          opacity: '1 !important',
          pointerEvents: 'auto !important'
        }}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Bell className="w-5 h-5 text-blue-500" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 mb-2">
              {message}
            </p>
            
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={onViewNotifications}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <Eye className="w-3 h-3" />
                Ver
              </button>
              
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <X className="w-3 h-3" />
                Cerrar
              </button>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;