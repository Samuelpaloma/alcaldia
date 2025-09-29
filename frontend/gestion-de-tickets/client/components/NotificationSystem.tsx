import React from 'react';
import NotificationToastContainer from './NotificationToastContainer';
import useRealtimeNotificationToasts from './RealtimeNotificationManager';

interface NotificationSystemProps {
  userEmail: string;
  userRole?: string;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  userEmail,
  userRole
}) => {
  // Inicializar el sistema de toasts en tiempo real
  useRealtimeNotificationToasts();

  return (
    <>
      {/* Contenedor de toasts de notificaciones */}
      <NotificationToastContainer 
        userEmail={userEmail} 
        userRole={userRole} 
      />
    </>
  );
};

export default NotificationSystem;

