import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

type VerifyEmailScreenParams = {
  email: string;
};

export default function VerifyEmailScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { email } = route.params as VerifyEmailScreenParams;
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60); // Contador para reenvío

  // Contador regresivo para reenvío
  useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    }
  }, [timer]);

  // En VerifyEmailScreen.tsx, agregar useEffect
  useEffect(() => {
    // Enviar código automáticamente al cargar la pantalla
    sendInitialVerificationCode();
    console.log('📧 VerifyEmailScreen cargado para email:', email);
  }, []);

  const sendInitialVerificationCode = async () => {
    console.log('📧 Intentando enviar código a:', email);
    try {
      console.log('📧 Enviando código de verificación inicial a:', email);
      
      const response = await fetch('http://10.3.234.61:8080/api/auth/send-email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
      });

      if (response.ok) {
        console.log('✅ Código de verificación enviado automáticamente');
      } else {
        console.log('❌ Error enviando código inicial');
      }
    } catch (error) {
      console.error('Error enviando código inicial:', error);
    }
  };

  const handleVerifyEmail = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Código inválido', 'Por favor ingresa un código de 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      console.log('📧 Verificando email con código...');
      console.log('Email:', email);
      console.log('Code:', code);
      console.log('Email type:', typeof email);
      console.log('Email length:', email ? email.length : 'null/undefined');

      const requestBody = {
        email: email,
        code: code.trim()
      };
      console.log('Request body:', JSON.stringify(requestBody));

      const response = await fetch('http://10.3.234.61:8080/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('🔍 Verify Email Response:', response.status);
      console.log('🔍 Verify Email Data:', data);

      if (response.ok) {
        console.log('✅ Email verificado correctamente');
        navigation.navigate('Login');
      } else {
        // Error en verificación
        const errorMessage = data.message || 'Código de verificación inválido';
        console.log('❌ Error verificando email:', errorMessage);
        Alert.alert('Error de verificación', errorMessage);
        setCode(''); // Limpiar código incorrecto
      }
    } catch (error) {
      console.error('Error verificando email:', error);
      Alert.alert(
        'Error de conexión',
        'No se pudo verificar el código. Verifica tu conexión e intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timer > 0) return; // Prevenir spam

    setResending(true);
    try {
      console.log('🔄 Reenviando código de verificación de email a:', email);

      const response = await fetch('http://10.3.234.61:8080/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email 
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Código reenviado',
          'Te hemos enviado un nuevo código de verificación a tu correo.'
        );
        setTimer(60); // Reiniciar contador
        setCode(''); // Limpiar código anterior
      } else {
        Alert.alert('Error', data.message || 'No se pudo reenviar el código. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error reenviando código:', error);
      Alert.alert('Error', 'Error de conexión al reenviar el código.');
    } finally {
      setResending(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>📧 Verificar Email</Text>
          <Text style={styles.subtitle}>
            Para completar tu registro, verifica tu dirección de correo electrónico
          </Text>
        </View>

        <View style={styles.emailInfo}>
          <Text style={styles.emailLabel}>Código enviado a:</Text>
          <Text style={styles.emailAddress}>{email}</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Código de verificación</Text>
          <TextInput
            style={[styles.codeInput, code.length === 6 && styles.codeInputComplete]}
            placeholder="123456"
            placeholderTextColor="#888"
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="numeric"
            maxLength={6}
            textAlign="center"
            autoFocus={true}
            editable={!loading}
          />
          
          {code.length > 0 && code.length < 6 && (
            <Text style={styles.hintText}>
              Ingresa {6 - code.length} dígito{6 - code.length > 1 ? 's' : ''} más
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            (loading || code.length !== 6) && styles.buttonDisabled
          ]}
          onPress={handleVerifyEmail}
          disabled={loading || code.length !== 6}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.verifyButtonText}>Verificar Email</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendSection}>
          <Text style={styles.resendText}>¿No recibiste el código?</Text>
          
          <TouchableOpacity
            style={[
              styles.resendButton,
              (timer > 0 || resending) && styles.resendButtonDisabled
            ]}
            onPress={handleResendCode}
            disabled={timer > 0 || resending}
          >
            {resending ? (
              <ActivityIndicator size="small" color="#2196F3" />
            ) : (
              <Text style={[
                styles.resendButtonText,
                (timer > 0) && styles.resendButtonTextDisabled
              ]}>
                {timer > 0 ? `Reenviar en ${formatTimer(timer)}` : 'Reenviar código'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Este código expira en 15 minutos. Una vez verificado tu email, 
            podrás iniciar sesión normalmente en el sistema.
          </Text>
        </View>

        {/* Botón para volver al login */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>← Volver al login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailInfo: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  emailLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  emailAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
  },
  inputSection: {
    marginBottom: 30,
  },
  inputLabel: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
    textAlign: 'center',
  },
  codeInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    fontSize: 32,
    fontWeight: 'bold',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    letterSpacing: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  codeInputComplete: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  hintText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 14,
    marginTop: 10,
  },
  verifyButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#888888',
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 10,
  },
  resendButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  resendButtonTextDisabled: {
    color: '#888888',
    textDecorationLine: 'none',
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    color: '#1565C0',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  backButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
});