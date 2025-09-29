import { useState, useCallback } from 'react';

export interface ToastNotification {
  id: string;
  notification: {
    id: number;
    tipo: string;
    mensaje: string;
    usuarioActorNombre?: string;
    ticketId?: number;
    prioridad: string;
    fechaCreacion: string;
  };
}

export const useNotificationToasts = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback((notification: ToastNotification['notification']) => {
    const toastId = `toast-${notification.id}-${Date.now()}`;
    const newToast: ToastNotification = {
      id: toastId,
      notification
    };

    setToasts(prev => [...prev, newToast]);
    
    console.log('🔔 Toast: Agregando notificación toast:', notification);
    
    return toastId;
  }, []);

  const removeToast = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
    console.log('🔔 Toast: Removiendo toast:', toastId);
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
    console.log('🔔 Toast: Limpiando todos los toasts');
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts
  };
};

