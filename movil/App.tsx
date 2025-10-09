import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import './src/i18n';

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
import TicketTrackingScreen from './src/screens/TicketTrackingScreen';
import ConfiguracionesScreen from './src/screens/ConfiguracionesScreen';
import HistorialPorAreaScreen from './src/screens/HistorialPorAreaScreen';
import MisTicketsScreen from './src/screens/MisTicketsScreen';
import MisEvidenciasScreen from './src/screens/MisEvidenciasScreen';
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
  TicketTracking: { ticketId: number };
  MisTickets: undefined;
  MisEvidencias: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  const handleLogout = async () => {
    try {
      console.log('🚪 [APP] Iniciando proceso de logout...');
      
      // Llamar al endpoint de logout del backend
      const token = await AsyncStorage.getItem('authToken');
      console.log('🔑 [APP] Token encontrado:', token ? 'Sí' : 'No');
      
      if (token) {
        try {
          console.log('🌐 [APP] Enviando request a logout endpoint...');
          const response = await fetch('http://localhost:8080/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('📡 [APP] Response status:', response.status);
          console.log('📡 [APP] Response ok:', response.ok);
          
          if (response.ok) {
            console.log('✅ [APP] Logout exitoso en el backend');
          } else {
            console.log('⚠️ [APP] Error en logout del backend, pero continuando...');
          }
        } catch (error) {
          console.log('⚠️ [APP] Error en logout del backend:', error);
        }
      } else {
        console.log('⚠️ [APP] No hay token, saltando logout del backend');
      }
      
      // Limpiar TODO el almacenamiento local para asegurar la autenticación
      console.log('🗑️ [APP] Limpiando todo el almacenamiento local...');
      await AsyncStorage.clear();
      console.log('✅ [APP] Almacenamiento local completamente limpio');
      
      // Actualizar estado de autenticación
      console.log('🔄 [APP] Actualizando estado de autenticación a false...');
      setIsAuthenticated(false);
      console.log('✅ [APP] Estado de autenticación actualizado');
      
      // Navegar a la pantalla de login sin poder volver atrás
      console.log('🧭 [APP] Navegando a pantalla de login...');
      if (navigationRef.current?.isReady()) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        console.log('✅ [APP] Navegación completada');
      } else {
        console.log('⚠️ [APP] NavigationRef no está listo');
      }
      
      console.log('✅ [APP] Logout completado exitosamente');
    } catch (error) {
      console.error('❌ [APP] Error en logout:', error);
      // Limpiar TODO el almacenamiento incluso si hay error
      console.log('🗑️ [APP] Limpiando almacenamiento por error...');
      await AsyncStorage.clear();
      console.log('✅ [APP] Almacenamiento limpio después de error');
      setIsAuthenticated(false);
      if (navigationRef.current?.isReady()) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }
  };

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 [APP] Verificando estado de autenticación...');
      const token = await AsyncStorage.getItem('authToken');
      console.log('🔑 [APP] Token encontrado en checkAuthStatus:', token ? 'Sí' : 'No');
      if (token) {
        // Verificar si el token sigue válido
        const response = await fetch('http://localhost:8080/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          // Token válido
          console.log('✅ [APP] Token válido, estableciendo autenticación...');
          setIsAuthenticated(true);
          console.log('✅ [APP] Token válido, usuario autenticado');
        } else {
          // Token expirado, ir a Login
          console.log('⚠️ [APP] Token expirado, limpiando y estableciendo no autenticado...');
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.clear();
          setIsAuthenticated(false);
          console.log('⚠️ [APP] Token expirado, requiere nuevo login');
        }
      } else {
        // Sin token, ir a Login
        console.log('ℹ️ [APP] Sin token, estableciendo no autenticado...');
        setIsAuthenticated(false);
        console.log('ℹ️ [APP] Sin token, mostrando login');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      console.log('❌ [APP] Error en checkAuthStatus, estableciendo no autenticado...');
      setIsAuthenticated(false);
    } finally {
      console.log('🏁 [APP] checkAuthStatus completado, estableciendo isReady=true y loading=false');
      setIsReady(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 [APP] useEffect ejecutándose...');
    checkAuthStatus();
  }, []);

  if (loading || !isReady) {
    console.log('⏳ [APP] Mostrando loader - loading:', loading, 'isReady:', isReady);
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  console.log('🎭 [APP] Render - isAuthenticated:', isAuthenticated, 'isReady:', isReady);
  
  return (
    <ThemeProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName={isAuthenticated ? "Home" : "Login"}>
        {console.log('🧭 [APP] Navegador - initialRouteName:', isAuthenticated ? "Home" : "Login")}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          options={{ headerShown: false }}
        >
          {() => {
            console.log('🏠 [APP] Renderizando Home con onLogout');
            return <IndexScreen onLogout={handleLogout} />;
          }}
        </Stack.Screen>
        <Stack.Screen 
          name="Config" 
          component={ConfigScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Configuraciones" 
          component={ConfiguracionesScreen} 
          options={{ headerShown: false }}
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
        <Stack.Screen 
          name="TicketTracking"
          component={TicketTrackingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MisTickets"
          component={MisTicketsScreen}
          options={{ title: 'Mis Tickets' }}
        />
        <Stack.Screen 
          name="MisEvidencias"
          component={MisEvidenciasScreen}
          options={{ title: 'Mis Evidencias' }}
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