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

interface NotificacionesModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenPreferences?: () => void;
}

const NotificacionesModal: React.FC<NotificacionesModalProps> = ({ visible, onClose, onOpenPreferences }) => {
  const { theme } = useTheme();
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
      Alert.alert('Error', 'No se pudieron cargar las notificaciones');
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
      Alert.alert('Error', 'No se pudo marcar la notificación como leída');
    }
  };

  const renderNotificacion = (notificacion: Notificacion) => {
    const icono = NotificacionService.getIconoNotificacion(notificacion.type);
    const colorPrioridad = NotificacionService.getColorPrioridad(notificacion.priority);
    const fechaFormateada = NotificacionService.formatearFecha(notificacion.createdAt);

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
              {notificacion.message}
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
            Por: {notificacion.actorUserName}
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
          <Text style={styles.title}>Notificaciones</Text>
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
              <Text style={styles.loadingText}>Cargando notificaciones...</Text>
            </View>
          ) : notificaciones.length > 0 ? (
            notificaciones.map(renderNotificacion)
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>No hay notificaciones</Text>
              <Text style={styles.emptySubtitle}>
                Te notificaremos cuando tengas nuevas actividades
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
