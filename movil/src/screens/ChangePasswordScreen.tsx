import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChangePasswordScreen = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Estados para el modal de resultado
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultType, setResultType] = useState<'success' | 'error'>('success');
  const [resultMessage, setResultMessage] = useState('');
  const [resultDetails, setResultDetails] = useState('');
  
  // Estado para el sidebar
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const navigation = useNavigation<any>();

  // Funciones para el cambio de contraseña
  const validatePassword = (password: string) => {
    // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleChangePassword = async () => {
    // Validaciones
    if (!currentPassword.trim()) {
      Alert.alert("Error", "Por favor ingresa tu contraseña actual");
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert("Error", "Por favor ingresa una nueva contraseña");
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(
        "Error", 
        "La nueva contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas nuevas no coinciden");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert("Error", "La nueva contraseña debe ser diferente a la actual");
      return;
    }

    setIsChangingPassword(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      
      console.log('🔑 Enviando datos de cambio de contraseña:', {
        currentPassword: currentPassword ? '[PROVIDED]' : '[EMPTY]',
        newPassword: newPassword ? '[PROVIDED]' : '[EMPTY]',
        confirmPassword: confirmPassword ? '[PROVIDED]' : '[EMPTY]',
        token: token ? '[PROVIDED]' : '[EMPTY]'
      });
      
      const response = await fetch('http://localhost:8080/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      console.log('🔍 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        showModal('success', '¡Contraseña cambiada exitosamente!', 'Tu contraseña ha sido actualizada correctamente. Ya puedes usar tu nueva contraseña para iniciar sesión.');
      } else {
        let errorMessage = "Error al cambiar la contraseña";
        let errorDetails = "";
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          
          // Detalles específicos según el tipo de error
          if (response.status === 400) {
            errorDetails = "Verifica que la contraseña actual sea correcta y que la nueva contraseña cumpla con los requisitos.";
          } else if (response.status === 401) {
            errorDetails = "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
          } else if (response.status === 500) {
            errorDetails = "Error interno del servidor. Intenta nuevamente en unos minutos.";
          }
        } catch (e) {
          errorDetails = `Error de conexión con el servidor (Código: ${response.status}). Verifica tu conexión a internet.`;
        }
        
        showModal('error', errorMessage, errorDetails);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showModal('error', 'Error de conexión', 'No se pudo conectar con el servidor. Verifica tu conexión a internet y que el servidor esté funcionando.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const showModal = (type: 'success' | 'error', message: string, details: string = '') => {
    setResultType(type);
    setResultMessage(message);
    setResultDetails(details);
    setShowResultModal(true);
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    if (resultType === 'success') {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header con TicketFlow */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TicketFlow - Técnico</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setSidebarVisible(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Tarjeta principal */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cambiar contraseña</Text>
        
        {/* Contraseña actual */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Contraseña actual</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder=""
              secureTextEntry={!showCurrentPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Text style={styles.eyeIcon}>{showCurrentPassword ? "👁️" : "👁️"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nueva contraseña */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Nueva contraseña</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder=""
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Text style={styles.eyeIcon}>{showNewPassword ? "👁️" : "👁️"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirmar nueva contraseña */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Confirmar nueva contraseña</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder=""
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.eyeIcon}>{showConfirmPassword ? "👁️" : "👁️"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleChangePassword}
          disabled={isChangingPassword}
        >
          <Text style={styles.saveButtonText}>
            {isChangingPassword ? "GUARDANDO..." : "Guardar"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Resultado */}
      <Modal
        visible={showResultModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseResultModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultModalContent}>
            {/* Icono */}
            <View style={[
              styles.resultIconContainer,
              resultType === 'success' ? styles.successIcon : styles.errorIcon
            ]}>
              <Text style={styles.resultIcon}>
                {resultType === 'success' ? '✅' : '❌'}
              </Text>
            </View>

            {/* Título */}
            <Text style={[
              styles.resultTitle,
              resultType === 'success' ? styles.successTitle : styles.errorTitle
            ]}>
              {resultType === 'success' ? '¡Éxito!' : 'Error'}
            </Text>

            {/* Mensaje principal */}
            <Text style={styles.resultMessage}>
              {resultMessage}
            </Text>

            {/* Detalles del error */}
            {resultDetails && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsLabel}>Detalles:</Text>
                <Text style={styles.detailsText}>{resultDetails}</Text>
              </View>
            )}

            {/* Botón de acción */}
            <TouchableOpacity
              style={[
                styles.resultButton,
                resultType === 'success' ? styles.successButton : styles.errorButton
              ]}
              onPress={handleCloseResultModal}
            >
              <Text style={styles.resultButtonText}>
                {resultType === 'success' ? 'Continuar' : 'Entendido'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Sidebar */}
      {sidebarVisible && (
        <View style={styles.sidebarOverlay}>
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>TicketFlow</Text>
              <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                <Text style={styles.sidebarCloseButton}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>TÉCNICO</Text>
              
              <TouchableOpacity 
                style={styles.sidebarMenuItem}
                onPress={() => {
                  setSidebarVisible(false);
                  navigation.navigate('Home');
                }}
              >
                <Text style={styles.sidebarMenuIcon}>🎫</Text>
                <Text style={styles.sidebarMenuText}>Mis Tickets</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sidebarMenuItem}
                onPress={() => {
                  setSidebarVisible(false);
                  // Aquí puedes agregar navegación a notificaciones
                }}
              >
                <Text style={styles.sidebarMenuIcon}>🔔</Text>
                <Text style={styles.sidebarMenuText}>Notificaciones</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sidebarMenuItem}
                onPress={() => {
                  setSidebarVisible(false);
                  // Aquí puedes agregar navegación a evidencias
                }}
              >
                <Text style={styles.sidebarMenuIcon}>📄</Text>
                <Text style={styles.sidebarMenuText}>Evidencias</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sidebarMenuItem}
                onPress={() => {
                  setSidebarVisible(false);
                  // Aquí puedes agregar navegación al historial
                }}
              >
                <Text style={styles.sidebarMenuIcon}>🔄</Text>
                <Text style={styles.sidebarMenuText}>Historial por área</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sidebarMenuItem}
                onPress={() => {
                  setSidebarVisible(false);
                  // Ya estamos en cambiar contraseña, no hacer nada
                }}
              >
                <Text style={styles.sidebarMenuIcon}>⚙️</Text>
                <Text style={styles.sidebarMenuText}>Cambiar contraseña</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.sidebarLogout}
              onPress={async () => {
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('userInfo');
                navigation.navigate('Login');
              }}
            >
              <Text style={styles.sidebarLogoutIcon}>→</Text>
              <Text style={styles.sidebarLogoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  menuButton: {
    padding: 5,
  },
  menuIcon: {
    fontSize: 20,
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    margin: 20,
    padding: 25,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    fontSize: 20,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos para el modal de resultado
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultModalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    maxWidth: 350,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  resultIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  successIcon: {
    backgroundColor: '#d4edda',
  },
  errorIcon: {
    backgroundColor: '#f8d7da',
  },
  resultIcon: {
    fontSize: 30,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  successTitle: {
    color: '#28a745',
  },
  errorTitle: {
    color: '#dc3545',
  },
  resultMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  detailsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: '100%',
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 5,
  },
  detailsText: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
  resultButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  successButton: {
    backgroundColor: '#28a745',
  },
  errorButton: {
    backgroundColor: '#dc3545',
  },
  resultButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Estilos para el sidebar
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '70%',
    height: '100%',
    backgroundColor: 'white',
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sidebarCloseButton: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  sidebarSection: {
    paddingTop: 20,
  },
  sidebarSectionTitle: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  sidebarMenuIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 25,
    textAlign: 'center',
  },
  sidebarMenuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sidebarLogout: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  sidebarLogoutIcon: {
    fontSize: 20,
    marginRight: 15,
    color: '#ff4444',
    width: 25,
    textAlign: 'center',
  },
  sidebarLogoutText: {
    fontSize: 16,
    color: '#ff4444',
    fontWeight: '500',
  },
});

export default ChangePasswordScreen;
