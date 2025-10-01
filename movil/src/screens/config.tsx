import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import authService from '../services/authService';

export default function ConfigScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await authService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error cerrando sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión correctamente');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleTwoFactorAuth = () => {
    navigation.navigate('TwoFactorAuth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="light-content"
        backgroundColor="#0a0a0a" 
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          
          <TouchableOpacity style={styles.option} onPress={handleChangePassword}>
            <Text style={styles.optionIcon}>🔒</Text>
            <Text style={styles.optionText}>Cambiar contraseña</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleTwoFactorAuth}>
            <Text style={styles.optionIcon}>🔐</Text>
            <Text style={styles.optionText}>Autenticación de dos factores</Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sesión</Text>
          
          <TouchableOpacity 
            style={[styles.option, styles.logoutOption]} 
            onPress={handleLogout}
            disabled={isLoading}
          >
            <Text style={styles.optionIcon}>🚪</Text>
            <Text style={[styles.optionText, styles.logoutText]}>
              {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </Text>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
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
    backgroundColor: '#0a0a0a',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  logoutOption: {
    backgroundColor: '#1f1414',
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#e5e7eb',
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '500',
  },
  optionArrow: {
    fontSize: 18,
    color: '#9ca3af',
  },
});