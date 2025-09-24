import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pantallas
import LoginScreen from './src/screens/LoginScreen';
import IndexScreen from './src/screens/TecnicoDashboard';
import ConfigScreen from './src/screens/config';
import VerifyScreen from './src/screens/VerifyScreen';
import VerifyEmailScreen from './src/screens/verifyEmailScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Config: undefined;
  Verify2FA: { userId: number; userEmail: string; userName: string };
  VerifyEmailScreen: { email: string };
  ForgotPasswordScreen: undefined;
  ResetPasswordScreen: { email: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userInfo = await AsyncStorage.getItem('userInfo');

        console.log('🔍 [APP] Verificando autenticación...');
        console.log('🔍 [APP] Token encontrado:', token ? 'Sí' : 'No');
        console.log('🔍 [APP] UserInfo encontrado:', userInfo ? 'Sí' : 'No');

        if (!token || !userInfo) {
          console.log('❌ [APP] Sin token o userInfo - Usuario no autenticado');
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        console.log('🔍 [APP] Verificando token con el servidor...');
        const response = await fetch('http://localhost:8080/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('🔍 [APP] Respuesta del servidor:', response.status);

        if (response.ok) {
          console.log('✅ [APP] Token válido - Usuario autenticado');
          console.log('🔄 [APP] Cambiando isAuthenticated a true');
          setIsAuthenticated(true);
        } else {
          console.log('❌ [APP] Token inválido - Limpiando almacenamiento');
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('userInfo');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ [APP] Error verificando sesión:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    // Listener para detectar cambios en AsyncStorage
    const interval = setInterval(() => {
      console.log('🔄 [APP] Verificando autenticación cada segundo...');
      checkAuthStatus();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  console.log('🔍 [APP] Renderizando con isAuthenticated:', isAuthenticated);
  
  return (
    <NavigationContainer>
      <StatusBar style="light" /> 
      {isAuthenticated ? (
        // 🔒 Stack privado
        <>
          {console.log('🔒 [APP] Mostrando stack autenticado')}
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={IndexScreen} options={{ title: 'Home' }} />
            <Stack.Screen name="Config" component={ConfigScreen} options={{ title: 'Configuración' }} />
          </Stack.Navigator>
        </>
      ) : (
        // 🔑 Stack público
        <>
          {console.log('🔑 [APP] Mostrando stack público')}
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión' }} />
            <Stack.Screen name="Verify2FA" component={VerifyScreen} options={{ title: 'Verificación 2FA' }} />
            <Stack.Screen name="VerifyEmailScreen" component={VerifyEmailScreen} options={{ title: 'Verificar Email' }} />
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{ title: 'Olvidé mi contraseña' }} />
            <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} options={{ title: 'Nueva contraseña' }} />
          </Stack.Navigator>
        </>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});