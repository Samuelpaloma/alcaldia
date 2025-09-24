import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type VerifyScreenParams = {
  userId: number;
  userEmail: string;
  userName: string;
};

export default function VerifyScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { userId, userEmail, userName } = route.params as VerifyScreenParams;
  
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

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Código inválido', 'Por favor ingresa un código de 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Verificando código 2FA...');
      console.log('User ID:', userId);
      console.log('Code:', code);

      const response = await fetch('http://localhost:8080/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          code: code.trim()
        })
      });

      const data = await response.json();
      console.log('🔍 Verify 2FA Response:', response.status);
      console.log('🔍 Verify 2FA Data:', data);

      if (response.ok && data.accessToken) {
        // 2FA verificado exitosamente
        console.log('✅ 2FA verificado exitosamente, guardando token...');
        
        await AsyncStorage.setItem('authToken', data.accessToken);
        await AsyncStorage.setItem('userInfo', JSON.stringify({
          userId: data.userId,
          email: data.email,
          nombre: data.nombre
        }));
        
        // No navegar manualmente - App.tsx detectará automáticamente el cambio
        console.log('✅ 2FA verificado, App.tsx detectará automáticamente la autenticación');
        
      } else {
        // Error en verificación
        const errorMessage = data.message || 'Código de verificación inválido';
        console.log('❌ Error en 2FA:', errorMessage);
        Alert.alert('Error de verificación', errorMessage);
        setCode(''); // Limpiar código incorrecto
      }
    } catch (error) {
      console.error('Error verificando código 2FA:', error);
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
      console.log('🔄 Reenviando código 2FA para usuario:', userId);

      const response = await fetch('http://localhost:8080/api/auth/resend-2fa-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId })
      });

      if (response.ok) {
        Alert.alert(
          'Código reenviado',
          'Te hemos enviado un nuevo código de verificación a tu correo.'
        );
        setTimer(60); // Reiniciar contador
        setCode(''); // Limpiar código anterior
      } else {
        Alert.alert('Error', 'No se pudo reenviar el código. Intenta nuevamente.');
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
          <Text style={styles.title}>🔐 Verificación de Seguridad</Text>
          <Text style={styles.subtitle}>
            Por tu seguridad, ingresa el código que enviamos a tu correo
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>Hola, {userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
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
          onPress={handleVerifyCode}
          disabled={loading || code.length !== 6}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.verifyButtonText}>Verificar Código</Text>
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
              <ActivityIndicator size="small" color="#5a7c5a" />
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
            💡 Este código expira en 10 minutos por motivos de seguridad. 
            Si no lo recibes, revisa tu carpeta de spam.
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
  userInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
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
    borderColor: '#5a7c5a',
    backgroundColor: '#f0f8f0',
  },
  hintText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 14,
    marginTop: 10,
  },
  verifyButton: {
    backgroundColor: '#5a7c5a',
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
    color: '#5a7c5a',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  resendButtonTextDisabled: {
    color: '#888888',
    textDecorationLine: 'none',
  },
  infoBox: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  infoText: {
    color: '#856404',
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