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
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import VerifyEmailScreen from './src/screens/verifyEmailScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Config: undefined;
  ChangePassword: undefined;
  Verify2FA: { userId: number; userEmail: string; userName: string };
  VerifyEmailScreen: { email: string };
  ForgotPasswordScreen: undefined;
  ResetPasswordScreen: { email: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});