import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importar pantallas
import LoginScreen from './src/screens/LoginScreen';
import TecnicoDashboard from './src/screens/TecnicoDashboard';
import ConfigScreen from './src/screens/config';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import TwoFactorAuthScreen from './src/screens/TwoFactorAuthScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import verifyEmailScreen from './src/screens/verifyEmailScreen';
import ChatScreen from './src/screens/ChatScreen';
import HistorialPorAreaScreen from './src/screens/HistorialPorAreaScreen';

// Importar servicio de autenticación
import authService from './src/services/authService';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    checkAuthStatus();
    
    // Exponer función global para forzar verificación de autenticación
    global.forceAppReload = () => {
      console.log('🔄 [APP] Forzando verificación de autenticación...');
      checkAuthStatus();
    };
    
    // Listener para detectar cuando la app se vuelve activa
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        console.log('🔄 [APP] App se volvió activa, verificando autenticación...');
        checkAuthStatus();
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
      // Limpiar función global al desmontar
      delete global.forceAppReload;
    };
  }, []);

  // Función para actualizar el estado de autenticación desde otros componentes
  const updateAuthStatus = async () => {
    await checkAuthStatus();
  };

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 [APP] Verificando estado de autenticación...');
      const { isAuthenticated: authStatus, userInfo: user } = await authService.checkAuthStatus();
      
      console.log('🔍 [APP] Estado de autenticación:', authStatus);
      console.log('🔍 [APP] Información del usuario:', user);
      
      setIsAuthenticated(authStatus);
      setUserInfo(user);
    } catch (error) {
      console.error('❌ [APP] Error verificando autenticación:', error);
      setIsAuthenticated(false);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUserInfo(null);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#30692E' }}>
        <ActivityIndicator size="large" color="white" />
        <Text style={{ color: 'white', marginTop: 10, fontSize: 16 }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#30692E' }
        }}
      >
        {!isAuthenticated ? (
          // Pantallas de autenticación
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onAuthSuccess={updateAuthStatus} />}
            </Stack.Screen>
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="Verify" component={VerifyScreen} />
            <Stack.Screen name="verifyEmail" component={verifyEmailScreen} />
          </>
        ) : (
          // Pantallas autenticadas
          <>
            <Stack.Screen name="Home">
              {(props) => <TecnicoDashboard {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="Config" component={ConfigScreen} />
            <Stack.Screen name="TecnicoDashboard" component={TecnicoDashboard} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="TwoFactorAuth" component={TwoFactorAuthScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="HistorialPorArea" component={HistorialPorAreaScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
