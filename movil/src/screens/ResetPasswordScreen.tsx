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
  Alert,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "./navigationTypes"; // ajusta la ruta según tu estructura
import { API_CONFIG } from '../config/api';

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ResetPassword"
>;
type ResetPasswordScreenRouteProp = RouteProp<
  RootStackParamList,
  "ResetPassword"
>;

export default function ResetPasswordScreen() {
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados de error
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<ResetPasswordScreenRouteProp>();

  const { email } = route.params;

  const handleResetPassword = async () => {
    // Limpiar errores previos
    setCodeError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');

    // Validaciones
    let hasErrors = false;

    if (!resetCode || !resetCode.trim()) {
      setCodeError('El código de recuperación es obligatorio');
      hasErrors = true;
    }

    if (!newPassword || !newPassword.trim()) {
      setPasswordError('La nueva contraseña es obligatoria');
      hasErrors = true;
    } else if (!newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)) {
      setPasswordError('Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
      hasErrors = true;
    }

    if (!confirmPassword || !confirmPassword.trim()) {
      setConfirmPasswordError('Confirma tu nueva contraseña');
      hasErrors = true;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Enviando solicitud de reset de contraseña...');
      console.log('📧 Email:', email);
      console.log('🔑 Código:', resetCode.trim());
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          token: resetCode.trim(),
          newPassword: newPassword.trim(),
          confirmPassword: confirmPassword.trim()
        })
      });

      console.log('📡 Respuesta del servidor - Status:', response.status);
      const data = await response.json();
      console.log('📦 Datos de respuesta:', data);

      if (response.ok) {
        console.log('✅ Respuesta exitosa del servidor:', data);
        
        // Verificar si la respuesta contiene un token JWT (auto-login)
        if (data.accessToken) {
          console.log('🔑 Token JWT recibido, iniciando auto-login...');
          
          // Guardar el token en AsyncStorage para mantener la sesión
          try {
            await AsyncStorage.setItem('authToken', data.accessToken);
            await AsyncStorage.setItem('userData', JSON.stringify({
              userId: data.userId,
              nombre: data.nombre,
              apellido: data.apellido,
              email: data.email,
              tipoUsuario: data.tipoUsuario
            }));
            
            console.log('💾 Datos de sesión guardados correctamente');
            
            // Verificar que el token se guardó correctamente
            const savedToken = await AsyncStorage.getItem('authToken');
            const savedUserData = await AsyncStorage.getItem('userData');
            console.log('🔍 Token guardado:', savedToken ? 'Sí' : 'No');
            console.log('🔍 Datos de usuario guardados:', savedUserData ? 'Sí' : 'No');
            
            // Forzar verificación de autenticación en la app
            console.log('🔄 Forzando verificación de autenticación...');
            
            // Usar setTimeout para asegurar que la navegación se ejecute después de guardar los datos
            setTimeout(() => {
              // Forzar verificación de autenticación
              if (global.forceAppReload) {
                global.forceAppReload();
              }
              
              // Navegar al login para que la app detecte la autenticación
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }, 100);
            
          } catch (storageError) {
            console.error('❌ Error guardando datos de sesión:', storageError);
            // Si falla el almacenamiento, redirigir al login
            Alert.alert(
              'Contraseña actualizada',
              'Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión.',
              [
                {
                  text: 'Continuar',
                  onPress: () => navigation.navigate('Login')
                }
              ]
            );
          }
        } else {
          console.log('⚠️ No se recibió token JWT, redirigiendo al login');
          // Si no hay token, mostrar mensaje y redirigir al login
          Alert.alert(
            'Contraseña actualizada',
            'Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión.',
            [
              {
                text: 'Continuar',
                onPress: () => navigation.navigate('Login')
              }
            ]
          );
        }
      } else {
        const errorMessage = data.message || 'Error al actualizar la contraseña';
        if (errorMessage.toLowerCase().includes('código') || errorMessage.toLowerCase().includes('token')) {
          setCodeError(errorMessage);
        } else {
          setGeneralError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error al resetear contraseña:', error);
      setGeneralError('No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForgot = () => {
    navigation.goBack();
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
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
              <Text style={styles.logoText}>NEITickets</Text>
              <Text style={styles.titleText}>Nueva Contraseña</Text>
              <Text style={styles.subtitleText}>
                Ingresa el código que recibiste por email y tu nueva contraseña
              </Text>
            </View>

            <View style={styles.inputSection}>
              {/* Error general */}
              {generalError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{generalError}</Text>
                </View>
              ) : null}

              <Text style={styles.inputLabel}>Código de recuperación</Text>
              <TextInput
                style={[styles.input, codeError ? styles.inputError : null]}
                placeholder="123456"
                placeholderTextColor="#888"
                value={resetCode}
                onChangeText={(text) => {
                  setResetCode(text);
                  if (codeError) setCodeError('');
                }}
                keyboardType="numeric"
                maxLength={10}
              />
              {codeError ? <Text style={styles.errorTextInput}>{codeError}</Text> : null}

              <Text style={styles.inputLabel}>Nueva contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, passwordError ? styles.inputError : null]}
                  placeholder="••••••••••••"
                  placeholderTextColor="#888"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (passwordError) setPasswordError('');
                    if (confirmPasswordError && confirmPassword) {
                      if (text === confirmPassword) setConfirmPasswordError('');
                    }
                  }}
                  secureTextEntry={!showNewPassword}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Image
                    source={
                      showNewPassword
                        ? require("../../assets/eye-open.png")
                        : require("../../assets/eye-closed.png")
                    }
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorTextInput}>{passwordError}</Text> : null}

              <Text style={styles.inputLabel}>Confirmar nueva contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, confirmPasswordError ? styles.inputError : null]}
                  placeholder="••••••••••••"
                  placeholderTextColor="#888"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) setConfirmPasswordError('');
                    if (newPassword && text !== newPassword) {
                      setConfirmPasswordError('Las contraseñas no coinciden');
                    }
                  }}
                  secureTextEntry={!showConfirmPassword}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Image
                    source={
                      showConfirmPassword
                        ? require("../../assets/eye-open.png")
                        : require("../../assets/eye-closed.png")
                    }
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? <Text style={styles.errorTextInput}>{confirmPasswordError}</Text> : null}

              <TouchableOpacity
                style={[styles.resetButton, loading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text style={styles.resetButtonText}>
                  {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                </Text>
              </TouchableOpacity>

              <View style={styles.linksContainer}>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={handleBackToForgot}
                >
                  <Text style={styles.linkText}>Solicitar nuevo código</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={handleBackToLogin}
                >
                  <Text style={styles.linkText}>Volver al inicio de sesión</Text>
                </TouchableOpacity>
              </View>
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
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 2,
  },
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
  },
  errorTextInput: {
    color: '#cc0000',
    fontSize: 14,
    marginTop: -10,
    marginBottom: 15,
  },
  resetButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#888888',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});