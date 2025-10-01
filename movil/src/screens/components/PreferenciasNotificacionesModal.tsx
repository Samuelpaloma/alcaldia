import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import NotificacionService, { PreferenciasNotificacion } from '../../services/NotificacionService';

interface PreferenciasNotificacionesModalProps {
  visible: boolean;
  onClose: () => void;
}

const PreferenciasNotificacionesModal: React.FC<PreferenciasNotificacionesModalProps> = ({ visible, onClose }) => {
  const [preferencias, setPreferencias] = useState<PreferenciasNotificacion>({
    usuarioId: 0,
    pushActivo: true,
    emailActivo: false,
    notificacionesTicketAsignado: true,
    notificacionesTicketEnProceso: true,
    notificacionesTicketResuelto: true,
    notificacionesComentarios: true,
    notificacionesEvidencias: true,
    notificacionesSla: true,
    notificacionesSistema: true,
    frecuenciaEmail: 'inmediata',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      cargarPreferencias();
    }
  }, [visible]);

  const cargarPreferencias = async () => {
    try {
      setLoading(true);
      const data = await NotificacionService.getPreferencias();
      setPreferencias(data);
    } catch (error) {
      console.error('Error cargando preferencias:', error);
      Alert.alert('Error', 'No se pudieron cargar las preferencias');
    } finally {
      setLoading(false);
    }
  };

  const guardarPreferencias = async () => {
    try {
      setSaving(true);
      await NotificacionService.actualizarPreferencias(preferencias);
      Alert.alert('Éxito', 'Preferencias guardadas correctamente');
      onClose();
    } catch (error) {
      console.error('Error guardando preferencias:', error);
      Alert.alert('Error', 'No se pudieron guardar las preferencias');
    } finally {
      setSaving(false);
    }
  };

  const toggleSwitch = (key: keyof PreferenciasNotificacion) => {
    setPreferencias(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };


  const renderSwitch = (
    label: string,
    description: string,
    key: keyof PreferenciasNotificacion,
    disabled?: boolean
  ) => (
    <View style={styles.switchContainer}>
      <View style={styles.switchInfo}>
        <Text style={styles.switchLabel}>{label}</Text>
        <Text style={styles.switchDescription}>{description}</Text>
      </View>
      <Switch
        value={preferencias[key] as boolean}
        onValueChange={() => toggleSwitch(key)}
        disabled={disabled}
        trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
        thumbColor={preferencias[key] ? '#ffffff' : '#9ca3af'}
      />
    </View>
  );

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando preferencias...</Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Preferencias de Notificaciones</Text>
          <TouchableOpacity 
            onPress={guardarPreferencias} 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            disabled={saving}
          >
            <Text style={[styles.saveButtonText, saving && styles.saveButtonTextDisabled]}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Canales de Notificación</Text>
            
            {renderSwitch(
              'Notificaciones Push',
              'Recibe notificaciones en la aplicación',
              'pushActivo'
            )}
            
            {renderSwitch(
              'Notificaciones por Email',
              'Recibe notificaciones por correo electrónico',
              'emailActivo'
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notificaciones Obligatorias</Text>
            <Text style={styles.obligatoryText}>
              Estas notificaciones siempre se enviarán para mantenerte informado sobre tus tickets:
            </Text>
            
            <View style={styles.obligatoryItem}>
              <Text style={styles.obligatoryLabel}>📋 Tickets Asignados</Text>
              <Text style={styles.obligatoryDescription}>Cuando se te asigne un nuevo ticket</Text>
            </View>
            
            <View style={styles.obligatoryItem}>
              <Text style={styles.obligatoryLabel}>⚙️ Tickets en Proceso</Text>
              <Text style={styles.obligatoryDescription}>Cuando aceptes un ticket</Text>
            </View>
            
            <View style={styles.obligatoryItem}>
              <Text style={styles.obligatoryLabel}>✅ Tickets Finalizados</Text>
              <Text style={styles.obligatoryDescription}>Cuando finalices un ticket</Text>
            </View>
            
            <View style={styles.obligatoryItem}>
              <Text style={styles.obligatoryLabel}>⏰ SLA Vencido</Text>
              <Text style={styles.obligatoryDescription}>Cuando un ticket esté próximo a vencer</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notificaciones Opcionales</Text>
            <Text style={styles.optionalText}>
              Puedes desactivar estas notificaciones si no las necesitas:
            </Text>
            
            {renderSwitch(
              'Comentarios',
              'Cuando se agreguen comentarios a tus tickets',
              'notificacionesComentarios',
              !preferencias.pushActivo && !preferencias.emailActivo
            )}
            
            {renderSwitch(
              'Evidencias',
              'Cuando se suban evidencias a tus tickets',
              'notificacionesEvidencias',
              !preferencias.pushActivo && !preferencias.emailActivo
            )}
            
            {renderSwitch(
              'Alertas del Sistema',
              'Notificaciones importantes del sistema',
              'notificacionesSistema',
              !preferencias.pushActivo && !preferencias.emailActivo
            )}
          </View>


          <View style={styles.infoContainer}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Las notificaciones push están activadas por defecto. 
              Las notificaciones obligatorias siempre se enviarán para mantenerte informado sobre tus tickets.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#4b5563',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#6b7280',
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
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e3a5f',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#93c5fd',
    lineHeight: 20,
  },
  obligatoryText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
    lineHeight: 20,
  },
  optionalText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
    lineHeight: 20,
  },
  obligatoryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  obligatoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  obligatoryDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default PreferenciasNotificacionesModal;
