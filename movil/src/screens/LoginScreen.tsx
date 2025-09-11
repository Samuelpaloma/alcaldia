import React, { useState } from 'react';
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
  Image,
  Modal
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/mobile/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Login exitoso
        Alert.alert('Éxito', data.message, [
        {
          text: 'OK',
          onPress: () => {
            window.location.href = 'http://localhost:8081/Home';
          }
        }
      ]);
      } else {
        // Error de autenticación
        Alert.alert('Error de acceso', data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor. Verifique su conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={styles.formContainer}>
            
            {/* Ícono de información en la esquina superior derecha */}
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => setShowInfoModal(true)}
            >
              <Text style={styles.infoIcon}>!</Text>
            </TouchableOpacity>
            
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/Logo-del-sena-Verde-300x300-1-removebg-preview 2.png')}
                  style={styles.logoImage}
                />
              </View>
            </View>
            <Text style={styles.welcomeText}>¡Bienvenido a la app!</Text>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Usuario</Text>
              <TextInput
                style={styles.input}
                placeholder="tecnico@alcaldianevila.gov.co"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••••••"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Image
                    source={
                      showPassword
                        ? require("../../assets/eye-open.png")   // 👁️ ojo abierto
                        : require("../../assets/eye-closed.png") // 👁️ ojo cerrado
                    }
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Modal de información */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showInfoModal}
          onRequestClose={() => setShowInfoModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Información</Text>
              <Text style={styles.modalText}>
                Sus credenciales de acceso están en posesión del administrador
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowInfoModal(false)}
              >
                <Text style={styles.modalButtonText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(48, 105, 46, 0.4)',
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  formContainer: {
    width: 350,
    height: 580,
    backgroundColor: '#FFFFFf',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000000cc',
    shadowOffset: {
      width: 10,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 5,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#000'
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
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoImage: {
    width: 150,
    height: 150
  },
  logoText: {
    fontSize: 24,
    color: 'white',
  },
  alcaldiaText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
  },
  welcomeText: {
    height: 30,
    alignContent: 'center',
    justifyContent: 'flex-start',
    color: "#30692E",
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left'
  },
  subtitleText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.9,
  },
  inputSection: {
    width: '100%',
  },
  inputLabel: {
    color: 'black',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#30692E',
  },
  loginButton: {
    backgroundColor: '#5a7c5a',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#888',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  passwordContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  passwordInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    paddingRight: 45,
    fontSize: 14,
    borderWidth: 2,
    borderColor: '#30692E',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 9,
    padding: 4,
  },
  eyeIcon: {
    width: 20,
    height: 20,
  }
});