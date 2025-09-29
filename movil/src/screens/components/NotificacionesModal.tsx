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
    if (notificacion.leida) return;

    try {
      await NotificacionService.marcarComoLeida(notificacion.id);
      
      // Actualizar el estado local
      setNotificaciones(prev => 
        prev.map(n => 
          n.id === notificacion.id 
            ? { ...n, leida: true, fechaLectura: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      console.error('Error marcando como leída:', error);
      Alert.alert('Error', 'No se pudo marcar la notificación como leída');
    }
  };

  const renderNotificacion = (notificacion: Notificacion) => {
    const icono = NotificacionService.getIconoNotificacion(notificacion.tipo);
    const colorPrioridad = NotificacionService.getColorPrioridad(notificacion.prioridad);
    const fechaFormateada = NotificacionService.formatearFecha(notificacion.fechaCreacion);

    return (
      <TouchableOpacity
        key={notificacion.id}
        style={[
          styles.notificacionItem,
          !notificacion.leida && styles.notificacionNoLeida
        ]}
        onPress={() => marcarComoLeida(notificacion)}
      >
        <View style={styles.notificacionHeader}>
          <Text style={styles.notificacionIcono}>{icono}</Text>
          <View style={styles.notificacionInfo}>
            <Text style={[
              styles.notificacionMensaje,
              !notificacion.leida && styles.notificacionMensajeNoLeida
            ]}>
              {notificacion.mensaje}
            </Text>
            <View style={styles.notificacionMeta}>
              <Text style={styles.notificacionFecha}>{fechaFormateada}</Text>
              {notificacion.prioridad !== 'normal' && (
                <View style={[styles.prioridadBadge, { backgroundColor: colorPrioridad }]}>
                  <Text style={styles.prioridadText}>
                    {notificacion.prioridad.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
          {!notificacion.leida && <View style={styles.puntoNoLeida} />}
        </View>
        
        {notificacion.usuarioActorNombre && (
          <Text style={styles.notificacionActor}>
            Por: {notificacion.usuarioActorNombre}
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
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
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
    color: '#1f2937',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  notificacionItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificacionNoLeida: {
    borderLeftColor: '#3b82f6',
    backgroundColor: '#f8fafc',
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
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  notificacionMensajeNoLeida: {
    fontWeight: '600',
    color: '#1f2937',
  },
  notificacionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificacionFecha: {
    fontSize: 12,
    color: '#6b7280',
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
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificacionesModal;
