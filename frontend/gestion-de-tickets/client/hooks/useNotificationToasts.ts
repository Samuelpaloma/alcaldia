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
    
    
    return toastId;
  }, []);

  const removeToast = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts
  };
};

