import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import authService from '../services/authService';

interface LoginScreenProps {
  navigation: any;
  onAuthSuccess?: () => void;
}

export default function LoginScreen({ navigation, onAuthSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'credentials' | 'verification'>('credentials');
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogin = async () => {
    console.log('🔐 [LOGIN] Iniciando proceso de login...');
    console.log('🔐 [LOGIN] Email:', email);
    console.log('🔐 [LOGIN] Password:', password ? '***' : 'vacío');
    
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 [LOGIN] Paso 1: Validando credenciales...');
      // Paso 1: Validar credenciales
      await authService.validateCredentials(email.trim(), password);
      console.log('✅ [LOGIN] Credenciales válidas');
      
      console.log('🔐 [LOGIN] Paso 2: Solicitando código...');
      // Paso 2: Solicitar código de verificación
      setIsRequestingCode(true);
      await authService.requestLoginCode(email.trim(), password);
      console.log('✅ [LOGIN] Código solicitado');
      
      // Cambiar a paso de verificación
      setStep('verification');
      Alert.alert('Código enviado', 'Se ha enviado un código de verificación a tu correo electrónico');
      
    } catch (error: any) {
      console.error('❌ [LOGIN] Error:', error);
      console.error('❌ [LOGIN] Error message:', error.message);
      console.error('❌ [LOGIN] Error stack:', error.stack);
      Alert.alert('Error', error.message || 'Error en el proceso de login');
    } finally {
      setIsLoading(false);
      setIsRequestingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código de verificación');
      return;
    }

    // Prevenir múltiples verificaciones
    if (isVerifying) {
      console.log('⚠️ [LOGIN] Verificación ya en progreso, ignorando...');
      return;
    }

    setIsLoading(true);
    setIsVerifying(true);
    
    try {
      console.log('🔐 [LOGIN] Iniciando verificación de código...');
      // Verificar código y obtener token
      const loginResponse = await authService.verifyLoginCode(email.trim(), verificationCode.trim());
      
      console.log('✅ [LOGIN] Código verificado, guardando datos...');
      // Guardar datos de autenticación
      await authService.saveAuthData(loginResponse);
      
      console.log('✅ [LOGIN] Login exitoso, datos guardados. Notificando al App.tsx...');
      // Notificar al App.tsx para que actualice el estado de autenticación
      if (onAuthSuccess) {
        await onAuthSuccess();
      }
      
    } catch (error: any) {
      console.error('❌ [LOGIN] Error en verificación:', error);
      // Mostrar mensaje específico para usuarios no técnicos
      if (error.message.includes('Solo los técnicos pueden acceder')) {
        Alert.alert(
          'Acceso Denegado', 
          'Esta aplicación móvil está destinada únicamente para técnicos.\n\nLos administradores y funcionarios deben usar la aplicación web.',
          [
            {
              text: 'Entendido',
              onPress: () => {
                // Volver al paso de credenciales
                setStep('credentials');
                setVerificationCode('');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', error.message || 'Código de verificación inválido');
      }
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsRequestingCode(true);
    try {
      await authService.requestLoginCode(email.trim(), password);
      Alert.alert('Código reenviado', 'Se ha enviado un nuevo código de verificación');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error reenviando código');
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setVerificationCode('');
    setIsVerifying(false);
  };

  const renderCredentialsStep = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>TicketFlow</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Correo</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@empresa.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Ingresar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        <Text style={styles.linkText}>Olvidé mi contraseña</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVerificationStep = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Verificación</Text>
      <Text style={styles.subtitle}>
        Ingresa el código de verificación enviado a{'\n'}
        <Text style={styles.emailText}>{email}</Text>
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Código de Verificación</Text>
        <TextInput
          style={styles.input}
          placeholder="123456"
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="numeric"
          maxLength={6}
        />
      </View>

              <TouchableOpacity
        style={[styles.button, (isLoading || isVerifying) && styles.buttonDisabled]}
        onPress={handleVerifyCode}
        disabled={isLoading || isVerifying}
      >
        {(isLoading || isVerifying) ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Verificar</Text>
        )}
      </TouchableOpacity>

      <View style={styles.verificationActions}>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleResendCode}
          disabled={isRequestingCode}
        >
          <Text style={styles.linkText}>
            {isRequestingCode ? 'Reenviando...' : 'Reenviar código'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
          style={styles.linkButton}
          onPress={handleBackToCredentials}
              >
          <Text style={styles.linkText}>Cambiar credenciales</Text>
              </TouchableOpacity>
            </View>
          </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 'credentials' ? renderCredentialsStep() : renderVerificationStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  emailText: {
    fontWeight: 'bold',
    color: '#000000',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 15,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  verificationActions: {
    marginTop: 20,
    gap: 10,
  },
});