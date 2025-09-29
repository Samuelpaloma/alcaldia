import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform, Image, Modal } from 'react-native';
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const handleLogin = async () => {
    // Limpiar errores previos
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    // Validación básica en el frontend
    let hasErrors = false;

    if (!email || !email.trim()) {
      setEmailError('El campo correo es obligatorio');
      hasErrors = true;
    } else if (!email.includes('@') || !email.match(/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/)) {
      setEmailError('Por favor ingrese un correo electrónico válido');
      hasErrors = true;
    }

    if (!password || !password.trim()) {
      setPasswordError('El campo contraseña es obligatorio');
      hasErrors = true;
    } else if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)) {
      setPasswordError(
        'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números'
      );
      hasErrors = true;
    }


    if (hasErrors) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        })
      });

      const data = await response.json();
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response data:', data);

      // PRIMERO: Verificar si requiere verificación de email
      if (data.requireEmailVerification) {
        console.log('📧 Email no verificado, navegando a VerifyEmailScreen');
        console.log('📧 Data recibida:', data);
        console.log('📧 Email en data:', data.email);
        console.log('📧 Tipo de email:', typeof data.email);
        navigation.navigate('VerifyEmailScreen', {
          email: data.email
        });
        return;
      }

      // SEGUNDO: Si response es OK, manejar casos exitosos
      if (response.ok) {
        if (data.accessToken) {
          // Login directo exitoso - GUARDAR TOKEN AQUÍ
          console.log('✅ Login directo exitoso, guardando token y navegando a Home');
          await AsyncStorage.setItem('authToken', data.accessToken);
          await AsyncStorage.setItem('userInfo', JSON.stringify({
            userId: data.userId,
            email: data.email,
            nombre: data.nombre
          }));
          // Navegar manualmente a Home después del login exitoso
          console.log('✅ Login exitoso, navegando a Home');
          navigation.navigate('Home');
        } else if (data.require2fa) {
          // Login requiere 2FA - NO guardar token todavía
          console.log('🔐 Login requiere 2FA, navegando a Verify2FA');
          navigation.navigate('Verify2FA', { 
            userId: data.userId,
            userEmail: data.email,
            userName: data.nombre 
          });
        }
      } else {
        // Errores normales
        const errorMessage = data.message || 'Credenciales incorrectas';
        if (errorMessage.includes('correo') || errorMessage.includes('email')) {
          setEmailError(errorMessage);
        } else if (errorMessage.includes('contraseña') || errorMessage.includes('password')) {
          setPasswordError(errorMessage);
        } else {
          setGeneralError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setGeneralError('No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Navegar a la pantalla de recuperación de contraseña
    navigation.navigate('ForgotPasswordScreen');
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
              <View style={styles.logoContainer}>
                {/* Reemplazamos la imagen por texto TicketFlow */}
                <Text style={styles.logoText}>TicketFlow</Text>
              </View>
              {/* Agregamos el texto descriptivo */}
              <Text style={styles.subtitleText}>Inicia sesión para continuar</Text>
            </View>

            <View style={styles.inputSection}>
              {/* Error general */}
              {generalError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{generalError}</Text>
                </View>
              ) : null}

              <Text style={styles.inputLabel}>Correo</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="tu@empresa.com"
                placeholderTextColor="#888"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError(''); // Limpiar error al escribir
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              <Text style={styles.inputLabel}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, passwordError ? styles.inputError : null]}
                  placeholder="••••••••••••"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError(''); // Limpiar error al escribir
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Image
                    source={
                      showPassword
                        ? require("../../assets/eye-open.png")
                        : require("../../assets/eye-closed.png")
                    }
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </Text>
              </TouchableOpacity>

              {/* Enlace "Olvidé mi contraseña" */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Olvidé mi contraseña</Text>
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
    position: 'relative',
  },
  // Estilos para el ícono de información
  infoButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#5a7c5a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  infoIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  subtitleText: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  inputSection: {
    width: '100%',
  },
  inputLabel: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 15,
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
  passwordContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  passwordInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    paddingRight: 50,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 4,
  },
  eyeIcon: {
    width: 20,
    height: 20,
  },
  // Estilos para mensajes de error
  errorContainer: {
    backgroundColor: '#ffe6e6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  errorText: {
    color: '#cc0000',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 2,
  },
  loginButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#888888',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos para "Olvidé mi contraseña"
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 10,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  // Estilos para el modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#5a7c5a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});