import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./navigationTypes"; // importa el tipo que definiste

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ForgotPasswordScreen"
>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendResetEmail = async () => {
    // Limpiar errores y mensajes previos
    setEmailError('');
    setSuccessMessage('');

    // Validación del email
    if (!email || !email.trim()) {
      setEmailError('El campo correo es obligatorio');
      return;
    }

    if (!email.includes('@') || !email.match(/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/)) {
      setEmailError('Por favor ingrese un correo electrónico válido');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Navegar a la pantalla de reset con el email
        navigation.navigate('ResetPasswordScreen', { email: email.trim() });
      } else {
        setEmailError(data.message || 'No se pudo enviar el correo de recuperación');
      }
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      setEmailError('No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={styles.formContainer}>
            <View style={styles.headerSection}>
              <Text style={styles.logoText}>TicketFlow</Text>
              <Text style={styles.titleText}>Recuperar Contraseña</Text>
              <Text style={styles.subtitleText}>
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
              </Text>
            </View>

            <View style={styles.inputSection}>
              {/* Mensaje de éxito */}
              {successMessage ? (
                <View style={styles.successContainer}>
                  <Text style={styles.successText}>{successMessage}</Text>
                </View>
              ) : null}

              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="tu@empresa.com"
                placeholderTextColor="#888"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                  if (successMessage) setSuccessMessage('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              <TouchableOpacity
                style={[styles.sendButton, loading && styles.buttonDisabled]}
                onPress={handleSendResetEmail}
                disabled={loading}
              >
                <Text style={styles.sendButtonText}>
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackToLogin}
              >
                <Text style={styles.backButtonText}>Volver al inicio de sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 40,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
  },
  subtitleText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputSection: {
    width: '100%',
  },
  inputLabel: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#cc0000',
    fontSize: 14,
    marginTop: -10,
    marginBottom: 15,
  },
  successContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  successText: {
    color: '#2e7d32',
    fontSize: 14,
    lineHeight: 20,
  },
  sendButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#888888',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});