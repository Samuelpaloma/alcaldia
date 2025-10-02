import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from '../components/LanguageSelector';

interface ConfiguracionesScreenProps {
  onLogout: () => void;
}

interface UserInfo {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  tipoUsuario: string;
}

export default function ConfiguracionesScreen({ onLogout }: ConfiguracionesScreenProps) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      setIsLoading(true);
      const userInfoString = await AsyncStorage.getItem('userInfo');
      if (userInfoString) {
        const userData = JSON.parse(userInfoString);
        setUserInfo(userData);
      }
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
      Alert.alert('Error', 'No se pudo cargar la información del usuario');
    } finally {
      setIsLoading(false);
    }
  };


  const styles = createStyles();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Cargando configuraciones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="light-content"
        backgroundColor="#0a0a0a" 
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 {t('settings.personal_info')}</Text>
          
          {userInfo && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('profile.full_name')}</Text>
                <Text style={styles.infoValue}>
                  {userInfo.nombre && userInfo.apellido 
                    ? `${userInfo.nombre} ${userInfo.apellido}`
                    : userInfo.apellido || userInfo.nombre || 'No especificado'}
                </Text>
              </View>
              
              <View style={styles.infoDivider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('common.email')}</Text>
                <Text style={styles.infoValue}>{userInfo.email}</Text>
              </View>

              {userInfo.telefono && (
                <>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('common.phone')}</Text>
                    <Text style={styles.infoValue}>{userInfo.telefono}</Text>
                  </View>
                </>
              )}
            </View>
          )}
        </View>

        {/* Sección de Idioma */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 {t('settings.language')}</Text>
          
          <View style={styles.languageSection}>
            <View style={styles.languageContent}>
              <Text style={styles.languageLabel}>{t('settings.change_language')}</Text>
              <LanguageSelector />
            </View>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const createStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: '#0a0a0a',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 16,
  },
  infoRow: {
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#e5e7eb',
    fontWeight: '500',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#333333',
  },
  languageSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 16,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageLabel: {
    fontSize: 16,
    color: '#e5e7eb',
    fontWeight: '500',
    flex: 1,
  },
});
