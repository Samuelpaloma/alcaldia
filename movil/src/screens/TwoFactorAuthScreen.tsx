import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TwoFactorAuthScreenProps {
  onVerificationSuccess: () => void;
  onCancel: () => void;
  userEmail: string;
}

const TwoFactorAuthScreen: React.FC<TwoFactorAuthScreenProps> = ({
  onVerificationSuccess,
  onCancel,
  userEmail,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Enviar código automáticamente al cargar
    sendVerificationCode();
    
    // Timer para reenvío
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const sendVerificationCode = async () => {
    try {
      setIsLoading(true);
      console.log('📧 Enviando código de verificación a:', userEmail);
      
      // Simular envío de código
      const response = await fetch('http://localhost:8080/api/auth/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (response.ok) {
        Alert.alert(
          'Código enviado',
          `Se ha enviado un código de verificación de 6 dígitos a ${userEmail}`
        );
      } else {
        console.log('⚠️ Usando código simulado para desarrollo');
        Alert.alert(
          'Código simulado',
          'Para desarrollo: usa el código 123456'
        );
      }
    } catch (error) {
      console.log('⚠️ Usando código simulado para desarrollo');
      Alert.alert(
        'Código simulado',
        'Para desarrollo: usa el código 123456'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Por favor ingresa un código de 6 dígitos');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔍 Verificando código:', verificationCode);

      const response = await fetch('http://localhost:8080/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userEmail, 
          code: verificationCode 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Guardar token de autenticación
          await AsyncStorage.setItem('authToken', data.token);
          await AsyncStorage.setItem('twoFactorVerified', 'true');
          
          Alert.alert('Éxito', 'Código verificado correctamente');
          onVerificationSuccess();
        } else {
          Alert.alert('Error', 'Código de verificación incorrecto');
        }
      } else {
        // Para desarrollo, aceptar código 123456
        if (verificationCode === '123456') {
          await AsyncStorage.setItem('twoFactorVerified', 'true');
          Alert.alert('Éxito', 'Código verificado correctamente');
          onVerificationSuccess();
        } else {
          Alert.alert('Error', 'Código de verificación incorrecto');
        }
      }
    } catch (error) {
      // Para desarrollo, aceptar código 123456
      if (verificationCode === '123456') {
        await AsyncStorage.setItem('twoFactorVerified', 'true');
        Alert.alert('Éxito', 'Código verificado correctamente');
        onVerificationSuccess();
      } else {
        Alert.alert('Error', 'Código de verificación incorrecto');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (!canResend) return;
    
    setTimeLeft(300);
    setCanResend(false);
    await sendVerificationCode();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Verificación de dos pasos</Text>
          <Text style={styles.subtitle}>
            Hemos enviado un código de verificación de 6 dígitos a:
          </Text>
          <Text style={styles.email}>{userEmail}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Código de verificación</Text>
          <TextInput
            style={styles.codeInput}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="123456"
            keyboardType="numeric"
            maxLength={6}
            autoFocus
          />
          
          <Text style={styles.timerText}>
            {canResend ? 'Puedes solicitar un nuevo código' : `Tiempo restante: ${formatTime(timeLeft)}`}
          </Text>

          <TouchableOpacity
            style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
            onPress={resendCode}
            disabled={!canResend}
          >
            <Text style={[styles.resendButtonText, !canResend && styles.resendButtonTextDisabled]}>
              Reenviar código
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
            onPress={verifyCode}
            disabled={isLoading || verificationCode.length !== 6}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? 'Verificando...' : 'Verificar'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.developmentNote}>
          <Text style={styles.developmentNoteText}>
            💡 Para desarrollo: usa el código 123456
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  form: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#fff',
    letterSpacing: 4,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
  resendButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#999',
  },
  buttons: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  verifyButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  developmentNote: {
    padding: 16,
    backgroundColor: '#fff3cd',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  developmentNoteText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
});

export default TwoFactorAuthScreen;
