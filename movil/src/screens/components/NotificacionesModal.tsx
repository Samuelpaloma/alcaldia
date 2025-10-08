import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import NotificacionService, { Notificacion } from '../../services/NotificacionService';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import i18n from '../../i18n';

interface NotificacionesModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenPreferences?: () => void;
}

const NotificacionesModal: React.FC<NotificacionesModalProps> = ({ visible, onClose, onOpenPreferences }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (visible) {
      cargarNotificaciones();
    }
  }, [visible]);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const data = await NotificacionService.getNotificaciones();
      setNotificaciones(data);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      Alert.alert(t('common.error'), t('notifications.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarNotificaciones();
    setRefreshing(false);
  };

  const marcarComoLeida = async (notificacion: Notificacion) => {
    if (notificacion.read) return;

    try {
      await NotificacionService.marcarComoLeida(notificacion.id);
      
      // Actualizar el estado local
      setNotificaciones(prev => 
        prev.map(n => 
          n.id === notificacion.id 
            ? { ...n, read: true, readAt: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      console.error('Error marcando como leída:', error);
      Alert.alert(t('common.error'), t('notifications.mark_read_error'));
    }
  };

  // Función para procesar mensajes de notificaciones
  const procesarMensajeNotificacion = (mensaje: string): string => {
    if (!mensaje) return mensaje;
    
    let mensajeProcesado = mensaje;
    const currentLanguage = i18n.language;
    
    // Solo traducir si el idioma actual es inglés y el mensaje está en español
    if (currentLanguage === 'en') {
      // Reemplazos específicos para mensajes completos (de español a inglés)
      mensajeProcesado = mensajeProcesado.replace(/Se te asignó el ticket #(\d+) del funcionario (.+)/g, 
        t('notifications.ticket_assigned_message', { ticketNumber: '$1', employeeName: '$2' }));
      
      mensajeProcesado = mensajeProcesado.replace(/Se te escaló el ticket #(\d+) del funcionario (.+)/g, 
        t('notifications.ticket_escalated_message', { ticketNumber: '$1', employeeName: '$2' }));
      
      mensajeProcesado = mensajeProcesado.replace(/El funcionario (.+) agregó un comentario al ticket #(\d+) que tienes asignado/g, 
        t('notifications.comment_added_message', { employeeName: '$1', ticketNumber: '$2' }));
      
      mensajeProcesado = mensajeProcesado.replace(/El funcionario (.+) subió una evidencia al ticket #(\d+) que tienes asignado/g, 
        t('notifications.evidence_uploaded_message', { employeeName: '$1', ticketNumber: '$2' }));
      
      mensajeProcesado = mensajeProcesado.replace(/El ticket #(\d+) ha sido actualizado/g, 
        t('notifications.ticket_updated_message', { ticketNumber: '$1' }));
      
      mensajeProcesado = mensajeProcesado.replace(/El ticket #(\d+) ha sido cerrado/g, 
        t('notifications.ticket_closed_message', { ticketNumber: '$1' }));
      
      // Mensaje de ticket rechazado
      mensajeProcesado = mensajeProcesado.replace(/El ticket #(\d+) que resolviste fue rechazado por el cliente\. Se requiere nueva intervención\./g, 
        t('notifications.ticket_rejected_message', { ticketNumber: '$1' }));
      
      // Reemplazos para prioridades (de español a inglés)
      mensajeProcesado = mensajeProcesado.replace(/ALTA/g, t('common.high'));
      mensajeProcesado = mensajeProcesado.replace(/MEDIA/g, t('common.medium'));
      mensajeProcesado = mensajeProcesado.replace(/BAJA/g, t('common.low'));
      mensajeProcesado = mensajeProcesado.replace(/CRITICA/g, t('common.critical'));
    }
    // Si el idioma es español, mantener los mensajes como están (ya vienen en español del backend)
    
    return mensajeProcesado;
  };

  // Función para formatear fechas traducidas
  const formatearFechaTraducida = (fecha: string): string => {
    const date = new Date(fecha);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return t('notifications.minutes_ago', { count: diffInMinutes });
    } else if (diffInHours < 24) {
      return t('notifications.hours_ago', { count: Math.floor(diffInHours) });
    } else if (diffInHours < 48) {
      return t('notifications.yesterday');
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNotificacion = (notificacion: Notificacion) => {
    const icono = NotificacionService.getIconoNotificacion(notificacion.type);
    const colorPrioridad = NotificacionService.getColorPrioridad(notificacion.priority);
    const fechaFormateada = formatearFechaTraducida(notificacion.createdAt);
    const mensajeTraducido = procesarMensajeNotificacion(notificacion.message);

    return (
      <TouchableOpacity
        key={notificacion.id}
        style={[
          styles.notificacionItem,
          !notificacion.read && styles.notificacionNoLeida
        ]}
        onPress={() => marcarComoLeida(notificacion)}
      >
        <View style={styles.notificacionHeader}>
          <Text style={styles.notificacionIcono}>{icono}</Text>
          <View style={styles.notificacionInfo}>
            <Text style={[
              styles.notificacionMensaje,
              !notificacion.read && styles.notificacionMensajeNoLeida
            ]}>
              {mensajeTraducido}
            </Text>
            <View style={styles.notificacionMeta}>
              <Text style={styles.notificacionFecha}>{fechaFormateada}</Text>
              {notificacion.priority !== 'normal' && (
                <View style={[styles.prioridadBadge, { backgroundColor: colorPrioridad }]}>
                  <Text style={styles.prioridadText}>
                    {notificacion.priority.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
          {!notificacion.read && <View style={styles.puntoNoLeida} />}
        </View>
        
        {notificacion.actorUserName && (
          <Text style={styles.notificacionActor}>
{t('notifications.by')}: {notificacion.actorUserName}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const styles = createStyles(theme);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('notifications.title')}</Text>
          <View style={styles.headerButtons}>
            {onOpenPreferences && (
              <TouchableOpacity onPress={onOpenPreferences} style={styles.settingsButton}>
                <Text style={styles.settingsButtonText}>⚙️</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t('notifications.loading')}</Text>
            </View>
          ) : notificaciones.length > 0 ? (
            notificaciones.map(renderNotificacion)
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>{t('notifications.no_notifications')}</Text>
              <Text style={styles.emptySubtitle}>
                {t('notifications.empty_subtitle')}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  settingsButtonText: {
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  notificacionItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#333333',
    borderWidth: 1,
    borderColor: '#333333',
  },
  notificacionNoLeida: {
    borderLeftColor: '#3b82f6',
    backgroundColor: '#1f2937',
  },
  notificacionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificacionIcono: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  notificacionInfo: {
    flex: 1,
  },
  notificacionMensaje: {
    fontSize: 16,
    color: '#e5e7eb',
    lineHeight: 22,
    marginBottom: 8,
  },
  notificacionMensajeNoLeida: {
    fontWeight: '600',
    color: '#ffffff',
  },
  notificacionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificacionFecha: {
    fontSize: 12,
    color: '#9ca3af',
  },
  prioridadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  prioridadText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  puntoNoLeida: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginLeft: 8,
    marginTop: 6,
  },
  notificacionActor: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificacionesModal;
