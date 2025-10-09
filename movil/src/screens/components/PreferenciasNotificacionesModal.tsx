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
import { useTranslation } from '../../hooks/useTranslation';

interface PreferenciasNotificacionesModalProps {
  visible: boolean;
  onClose: () => void;
}

const PreferenciasNotificacionesModal: React.FC<PreferenciasNotificacionesModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
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
      Alert.alert(t('common.error'), t('notification_preferences.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const guardarPreferencias = async () => {
    try {
      setSaving(true);
      await NotificacionService.actualizarPreferencias(preferencias);
      Alert.alert(t('common.success'), t('notification_preferences.save_success'));
      onClose();
    } catch (error) {
      console.error('Error guardando preferencias:', error);
      Alert.alert(t('common.error'), t('notification_preferences.save_error'));
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
            <Text style={styles.loadingText}>{t('notification_preferences.loading')}</Text>
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
            <Text style={styles.cancelButtonText}>{t('notification_preferences.cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('notification_preferences.title')}</Text>
          <TouchableOpacity 
            onPress={guardarPreferencias} 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            disabled={saving}
          >
            <Text style={[styles.saveButtonText, saving && styles.saveButtonTextDisabled]}>
              {saving ? t('notification_preferences.saving') : t('notification_preferences.save')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('notification_preferences.notification_channels')}</Text>
            
            {/* Push notifications - siempre activo, sin toggle */}
            <View style={styles.obligatoryItem}>
              <Text style={styles.obligatoryLabel}>{t('notification_preferences.push_notifications')}</Text>
              <Text style={styles.obligatoryDescription}>{t('notification_preferences.push_description')}</Text>
              <View style={styles.alwaysActiveBadge}>
                <Text style={styles.alwaysActiveText}>Siempre activo</Text>
              </View>
            </View>
            
            {renderSwitch(
              t('notification_preferences.email_notifications'),
              t('notification_preferences.email_description'),
              'emailActivo'
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('notification_preferences.mandatory_notifications')}</Text>
            <Text style={styles.obligatoryText}>
              {t('notification_preferences.mandatory_description')}
            </Text>
            
            <View style={styles.obligatoryItem}>
              <Text style={styles.obligatoryLabel}>{t('notification_preferences.assigned_tickets')}</Text>
              <Text style={styles.obligatoryDescription}>{t('notification_preferences.assigned_description')}</Text>
            </View>
            
            <View style={styles.obligatoryItem}>
              <Text style={styles.obligatoryLabel}>{t('notification_preferences.in_progress_tickets')}</Text>
              <Text style={styles.obligatoryDescription}>{t('notification_preferences.in_progress_description')}</Text>
            </View>
            
            <View style={styles.obligatoryItem}>
              <Text style={styles.obligatoryLabel}>{t('notification_preferences.completed_tickets')}</Text>
              <Text style={styles.obligatoryDescription}>{t('notification_preferences.completed_description')}</Text>
            </View>
            
            <View style={styles.obligatoryItem}>
              <Text style={styles.obligatoryLabel}>{t('notification_preferences.sla_expired')}</Text>
              <Text style={styles.obligatoryDescription}>{t('notification_preferences.sla_description')}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('notification_preferences.optional_notifications')}</Text>
            <Text style={styles.optionalText}>
              {t('notification_preferences.optional_description')}
            </Text>
            
            {renderSwitch(
              t('notification_preferences.comments'),
              t('notification_preferences.comments_description'),
              'notificacionesComentarios',
              !preferencias.pushActivo && !preferencias.emailActivo
            )}
            
            {renderSwitch(
              t('notification_preferences.evidence'),
              t('notification_preferences.evidence_description'),
              'notificacionesEvidencias',
              !preferencias.pushActivo && !preferencias.emailActivo
            )}
            
            {renderSwitch(
              t('notification_preferences.system_alerts'),
              t('notification_preferences.system_alerts_description'),
              'notificacionesSistema',
              !preferencias.pushActivo && !preferencias.emailActivo
            )}
          </View>


          <View style={styles.infoContainer}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              {t('notification_preferences.info_message')}
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
  alwaysActiveBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  alwaysActiveText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PreferenciasNotificacionesModal;
