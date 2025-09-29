import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pantallas
import LoginScreen from './src/screens/LoginScreen';
import IndexScreen from './src/screens/TecnicoDashboard';
import ConfigScreen from './src/screens/config';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import VerifyEmailScreen from './src/screens/verifyEmailScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import ChatScreen from './src/screens/ChatScreen';
import ConfiguracionesScreen from './src/screens/ConfiguracionesScreen';
import HistorialPorAreaScreen from './src/screens/HistorialPorAreaScreen';
import { ThemeProvider } from './src/components/ThemeProvider';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Config: undefined;
  Configuraciones: undefined;
  ChangePassword: undefined;
  HistorialPorArea: undefined;
  Verify2FA: { userId: number; userEmail: string; userName: string };
  VerifyEmailScreen: { email: string };
  ForgotPasswordScreen: undefined;
  ResetPasswordScreen: { email: string };
  Chat: { ticketId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  const handleLogout = async () => {
    try {
      console.log('🚪 [APP] Iniciando proceso de logout...');
      
      // Llamar al endpoint de logout del backend
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch('http://localhost:8080/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            console.log('✅ [APP] Logout exitoso en el backend');
          } else {
            console.log('⚠️ [APP] Error en logout del backend, pero continuando...');
          }
        } catch (error) {
          console.log('⚠️ [APP] Error en logout del backend, pero continuando...');
        }
      }
      
      // Limpiar almacenamiento local
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userInfo');
      
      // Actualizar estado de autenticación
      setIsAuthenticated(false);
      
      // Navegar a la pantalla de login
      if (navigationRef.current?.isReady()) {
        navigationRef.current.navigate('Login');
      }
      
      console.log('✅ [APP] Logout completado exitosamente');
    } catch (error) {
      console.error('❌ [APP] Error en logout:', error);
      // Limpiar almacenamiento incluso si hay error
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userInfo');
      setIsAuthenticated(false);
      if (navigationRef.current?.isReady()) {
        navigationRef.current.navigate('Login');
      }
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        // Verificar si el token sigue válido
        const response = await fetch('http://localhost:8080/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          // Token válido, ir directo a Home
          setIsAuthenticated(true);
          if (navigationRef.current?.isReady()) {
            navigationRef.current.navigate('Home');
          }
        } else {
          // Token expirado, ir a Login
          await AsyncStorage.removeItem('authToken');
          setIsAuthenticated(false);
          if (navigationRef.current?.isReady()) {
            navigationRef.current.navigate('Login');
          }
        }
      } else {
        // Sin token, ir a Login
        setIsAuthenticated(false);
        if (navigationRef.current?.isReady()) {
          navigationRef.current.navigate('Login');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      if (navigationRef.current?.isReady()) {
        navigationRef.current.navigate('Login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer ref={navigationRef} onReady={checkAuthStatus}>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Iniciar Sesión' }}
        />
        <Stack.Screen 
          name="Home" 
          options={{ title: 'Home' }}
        >
          {() => <IndexScreen onLogout={handleLogout} />}
        </Stack.Screen>
        <Stack.Screen 
          name="Config" 
          component={ConfigScreen} 
          options={{ title: 'Configuración' }}
        />
        <Stack.Screen 
          name="Configuraciones" 
          component={ConfiguracionesScreen} 
          options={{ title: 'Configuraciones' }}
        />
        <Stack.Screen 
          name="Verify2FA" 
          component={VerifyScreen}
          options={{ title: 'Verificación 2FA' }}
        />
        <Stack.Screen 
          name="VerifyEmailScreen" 
          component={VerifyEmailScreen}
          options={{ title: 'Verificar Email' }}
        />
        <Stack.Screen 
          name="ForgotPasswordScreen" 
          component={ForgotPasswordScreen}
          options={{ title: 'Olvide mi contraseña' }}
        />
        <Stack.Screen 
          name="ResetPasswordScreen"
          component={ResetPasswordScreen}
          options={{ title: 'Nueva contraseña' }}
        />
        <Stack.Screen 
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{ title: 'Cambiar Contraseña' }}
        />
        <Stack.Screen 
          name="HistorialPorArea"
          component={HistorialPorAreaScreen}
          options={{ title: 'Historial por Área' }}
        />
        <Stack.Screen 
          name="Chat"
          component={ChatScreen}
          options={{ title: 'Chat del Ticket' }}
        />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
    );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});