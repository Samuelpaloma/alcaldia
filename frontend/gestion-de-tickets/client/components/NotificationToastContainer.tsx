import React from 'react';
import NotificationToast from './NotificationToast';
import { useNotificationToasts, ToastNotification } from '../hooks/useNotificationToasts';
import { useRoleNotifications } from '../hooks/use-role-notifications';

interface NotificationToastContainerProps {
  userEmail: string;
  userRole?: string;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({
  userEmail,
  userRole
}) => {
  const { toasts, removeToast } = useNotificationToasts();
  const { markAsRead } = useRoleNotifications(userEmail, userRole);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
      console.log('🔔 Toast: Notificación marcada como leída:', notificationId);
    } catch (error) {
      console.error('🔔 Toast: Error marcando como leída:', error);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <NotificationToast
          key={toast.id}
          notification={toast.notification}
          onClose={() => removeToast(toast.id)}
          onMarkAsRead={() => handleMarkAsRead(toast.notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationToastContainer;

