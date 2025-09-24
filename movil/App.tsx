import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet } from 'react-native';

// Importar tus pantallas
import LoginScreen from './src/screens/LoginScreen';
import IndexScreen from './src/screens/TecnicoDashboard';
import ConfigScreen from './src/screens/config';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import VerifyEmailScreen from './src/screens/verifyEmailScreen'; // NUEVO
import ForgotPasswordScreen  from './src/screens/ForgotPasswordScreen'; // NUEVO
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Config: undefined;
  ChangePassword: undefined;
  Verify2FA: { userId: number; userEmail: string; userName: string };
  VerifyEmailScreen: { email: string };
  ForgotPasswordScreen: undefined;
  ResetPasswordScreen: { email: string }; // 👈 aquí estaba faltando
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Navigation ref to navigate outside components
const navigationRef = createNavigationContainerRef<RootStackParamList>();

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
        if (navigationRef.isReady()) {
          navigationRef.navigate('Home');
        }
      } else {
        // Token expirado, ir a Login
        await AsyncStorage.removeItem('authToken');
        if (navigationRef.isReady()) {
          navigationRef.navigate('Login');
        }
      }
    } else {
      // Sin token, ir a Login
      if (navigationRef.isReady()) {
        navigationRef.navigate('Login');
      }
    }
  } catch (error) {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Login');
    }
  }
};

export default function App() {
  return (
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
          component={IndexScreen}
          options={{ title: 'Home' }}
        />
        <Stack.Screen 
          name="Config" 
          component={ConfigScreen}
          options={{ title: 'Configuración' }}
        />
        <Stack.Screen 
          name="ChangePassword" 
          component={ChangePasswordScreen}
          options={{ title: 'Cambiar contraseña' }}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingStart: 0,
    paddingEnd: 0,
    justifyContent: 'center',
  },
});