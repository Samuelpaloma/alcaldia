import React, { useState, useEffect } from 'react';
import { 
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  RefreshControl,
  Modal,
  TextInput
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigationTypes'; // ajusta la ruta según dónde esté App.tsx
import { checkAuthStatus } from './utils/authHelpers';
import { useFocusEffect } from '@react-navigation/native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function TecnicoDashboard() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    ticketsPendientes: 4,
    ticketsCompletados: 2,
    ticketsEnProceso: 1,
    ticketsAsignados: 1
  });

  // Estados para modales
  const [misTicketsVisible, setMisTicketsVisible] = useState(false);
  const [notificacionesVisible, setNotificacionesVisible] = useState(false);
  const [evidenciasVisible, setEvidenciasVisible] = useState(false);

  // Estados para notificaciones
  const [preferenciasPush, setPreferenciasPush] = useState(true);
  const [preferenciasSMS, setPreferenciasSMS] = useState(false);
  const [preferenciasEmail, setPreferenciasEmail] = useState(true);

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  const loadUserData = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        setUserData(JSON.parse(userInfo));
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/tecnico/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Estadísticas recibidas:', data);
        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          console.error('Error en respuesta del servidor:', data.message);
        }
      } else if (response.status === 401) {
        console.log('Token inválido o expirado, redirigiendo a Login');
        // Opcional: limpiar token y redirigir
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userInfo');
      } else {
        console.error('Error del servidor:', response.status);
        // Intentar obtener el mensaje de error del servidor
        try {
          const errorData = await response.json();
          console.error('Detalles del error:', errorData);
        } catch (parseError) {
          console.error('No se pudo parsear el error del servidor');
        }
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  useEffect(() => {
    const loadUserInfo = async () => {
      const { isAuthenticated, userInfo } = await checkAuthStatus();
      
      if (!isAuthenticated) {
        // El App.tsx se encargará de mostrar el Login
        return;
      }
      
      setUserData(userInfo);
    };

    loadUserInfo();
  }, []);

  // Componente Modal Mis Tickets
  const MisTicketsModal = () => (
    <Modal visible={misTicketsVisible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Mis Tickets</Text>
          <TouchableOpacity onPress={() => setMisTicketsVisible(false)}>
            <Text style={styles.closeButton}>×</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.modalSubtitle}>Visualiza y actualiza tus tickets asignados.</Text>
        
        <ScrollView style={styles.modalContent}>
          {/* Ticket 1 */}
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketId}>Ticket TK001</Text>
              <View style={styles.priorityHigh}>
                <Text style={styles.priorityText}>Alta</Text>
              </View>
            </View>
            <Text style={styles.ticketTitle}>TK-001: Error en sistema de pagos</Text>
            <Text style={styles.ticketDescription}>
              No puede realizar el proceso de pago presencial. Error message: Transaction failed at...
            </Text>
            <View style={styles.ticketFooter}>
              <Text style={styles.ticketClient}>Ana Jiménez</Text>
              <Text style={styles.ticketLocation}>Electrónica 1</Text>
            </View>
            <View style={styles.ticketStatus}>
              <Text style={styles.statusText}>Sin procesar</Text>
            </View>
            <TouchableOpacity style={styles.processButton}>
              <Text style={styles.processButtonText}>En proceso</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.evidenceButton}>
              <Text style={styles.evidenceButtonText}>Agregar evidencia</Text>
            </TouchableOpacity>
          </View>

          {/* Ticket 2 */}
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketId}>TK-002: Instalación de impresora</Text>
            </View>
            <Text style={styles.ticketDescription}>
              Se requiere hacer instalación de código de impresora en punto de venta.
            </Text>
            <View style={styles.ticketFooter}>
              <Text style={styles.ticketClient}>Ana Jiménez</Text>
              <Text style={styles.ticketLocation}>Electrónica</Text>
            </View>
            <View style={styles.ticketStatus}>
              <Text style={styles.statusText}>Sin procesar</Text>
            </View>
            <TouchableOpacity style={styles.processButton}>
              <Text style={styles.processButtonText}>En proceso</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.evidenceButton}>
              <Text style={styles.evidenceButtonText}>Agregar evidencia</Text>
            </TouchableOpacity>
          </View>

          {/* Ticket 3 */}
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketId}>TK-003: Caída de red</Text>
            </View>
            <Text style={styles.ticketDescription}>
              Se detectó un corte de red. 2 horas sin servicio activo.
            </Text>
            <View style={styles.ticketFooter}>
              <Text style={styles.ticketClient}>Ana Jiménez</Text>
              <Text style={styles.ticketLocation}>Hogarland</Text>
            </View>
            <View style={styles.ticketStatus}>
              <Text style={styles.statusText}>Sin procesar</Text>
            </View>
            <TouchableOpacity style={styles.processButton}>
              <Text style={styles.processButtonText}>En proceso</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.evidenceButton}>
              <Text style={styles.evidenceButtonText}>Agregar evidencia</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // Componente Modal Notificaciones
  const NotificacionesModal = () => (
    <Modal visible={notificacionesVisible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Notificaciones</Text>
          <TouchableOpacity onPress={() => setNotificacionesVisible(false)}>
            <Text style={styles.closeButton}>×</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.modalSubtitle}>Gestiona cómo quieres recibir y visualizar tus notificaciones.</Text>
        
        <ScrollView style={styles.modalContent}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Push</Text>
            <TouchableOpacity 
              style={[styles.toggle, preferenciasPush && styles.toggleActive]}
              onPress={() => setPreferenciasPush(!preferenciasPush)}
            >
              <View style={[styles.toggleCircle, preferenciasPush && styles.toggleCircleActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Email</Text>
            <TouchableOpacity 
              style={[styles.toggle, preferenciasEmail && styles.toggleActive]}
              onPress={() => setPreferenciasEmail(!preferenciasEmail)}
            >
              <View style={[styles.toggleCircle, preferenciasEmail && styles.toggleCircleActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>SMS</Text>
            <TouchableOpacity 
              style={[styles.toggle, preferenciasSMS && styles.toggleActive]}
              onPress={() => setPreferenciasSMS(!preferenciasSMS)}
            >
              <View style={[styles.toggleCircle, preferenciasSMS && styles.toggleCircleActive]} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Guardar notificaciones</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Notificaciones recientes</Text>
          
          {/* Notificaciones */}
          <View style={styles.notificationItem}>
            <View style={styles.notificationIcon}>
              <Text style={styles.notificationIconText}>!</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Nuevo ticket TK-001 asignado</Text>
              <Text style={styles.notificationTime}>Marcas lenis</Text>
            </View>
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationIcon}>
              <Text style={styles.notificationIconText}>⚠</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>El ticket TK-148 cambio a En prioridad</Text>
              <Text style={styles.notificationTime}>Marcas lenis</Text>
            </View>
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationIcon}>
              <Text style={styles.notificationIconText}>📧</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Recordatorio sobre evidencias antes de finalizar</Text>
              <Text style={styles.notificationTime}>Marcas lenis</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // Componente Modal Mis Evidencias
  const EvidenciasModal = () => (
    <Modal visible={evidenciasVisible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Mis Evidencias</Text>
          <TouchableOpacity onPress={() => setEvidenciasVisible(false)}>
            <Text style={styles.closeButton}>×</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.modalSubtitle}>Registra y consulta las evidencias de tus tickets.</Text>
        
        <View style={styles.searchContainer}>
          <TextInput 
            style={styles.searchInput}
            placeholder="Buscar evidencias..."
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Todos los tipos</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Mis Archivos</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {/* Evidencia 1 */}
          <View style={styles.evidenceItem}>
            <View style={styles.evidenceIcon}>
              <Text style={styles.evidenceIconText}>📄</Text>
            </View>
            <View style={styles.evidenceContent}>
              <Text style={styles.evidenceTitle}>screenshot_error.png</Text>
              <Text style={styles.evidenceSubtitle}>Captura de pantalla del error presentado en el sistema</Text>
              <Text style={styles.evidenceDate}>Fecha: 09/05/2024 - 2:18 AM</Text>
              <Text style={styles.evidenceSize}>Tamaño: 1.2 MB</Text>
            </View>
            <View style={styles.evidenceActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>👁</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>⬇</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Evidencia 2 */}
          <View style={styles.evidenceItem}>
            <View style={styles.evidenceIcon}>
              <Text style={styles.evidenceIconText}>📄</Text>
            </View>
            <View style={styles.evidenceContent}>
              <Text style={styles.evidenceTitle}>logs_sistema.txt</Text>
              <Text style={styles.evidenceSubtitle}>Logs del sistema presentar el incidente</Text>
              <Text style={styles.evidenceDate}>Fecha: 08/05/2024 - 10:44 PM</Text>
              <Text style={styles.evidenceSize}>Descargado - 16/46 MB - 100.8%</Text>
            </View>
            <View style={styles.evidenceActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>👁</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>⬇</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Evidencia 3 */}
          <View style={styles.evidenceItem}>
            <View style={styles.evidenceIcon}>
              <Text style={styles.evidenceIconText}>🎥</Text>
            </View>
            <View style={styles.evidenceContent}>
              <Text style={styles.evidenceTitle}>video_problema.mp4</Text>
              <Text style={styles.evidenceSubtitle}>Video explicativo del problema reportado</Text>
              <Text style={styles.evidenceDate}>Fecha: 08/05/2024 - 8:34 PM</Text>
              <Text style={styles.evidenceSize}>Subido al 100% 100.0 MB</Text>
            </View>
            <View style={styles.evidenceActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>👁</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>⬇</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appTitle}>TicketFlow - Técnico</Text>
          </View>

          {/* Título principal */}
          <Text style={styles.mainTitle}>Inicio del Técnico</Text>
          <Text style={styles.subtitle}>
            Resumen rápido de tus tickets asignados
          </Text>

          {/* Estadísticas */}
          <View style={styles.statsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando estadísticas...</Text>
              </View>
            ) : (
              <>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.ticketsPendientes}</Text>
                    <Text style={styles.statLabel}>Pendientes</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.ticketsCompletados}</Text>
                    <Text style={styles.statLabel}>Completados</Text>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.ticketsEnProceso}</Text>
                    <Text style={styles.statLabel}>En proceso</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.ticketsAsignados}</Text>
                    <Text style={styles.statLabel}>Asignados</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Botones de navegación */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.navigationButton}
              onPress={() => setMisTicketsVisible(true)}
            >
              <Text style={styles.buttonText}>Mis Tickets</Text>
              <Text style={styles.buttonSubtext}>Aleix</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navigationButton}
              onPress={() => setEvidenciasVisible(true)}
            >
              <Text style={styles.buttonText}>Estadísticas</Text>
              <Text style={styles.buttonSubtext}>Aleix</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navigationButton}
              onPress={() => setNotificacionesVisible(true)}
            >
              <Text style={styles.buttonText}>Notificaciones</Text>
              <Text style={styles.buttonSubtext}>Aleix</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modales */}
        <MisTicketsModal />
        <NotificacionesModal />
        <EvidenciasModal />
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  statsContainer: {
    marginBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonsContainer: {
    gap: 15,
  },
  navigationButton: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  buttonSubtext: {
    color: '#ccc',
    fontSize: 12,
  },

  // Estilos para los modales
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    padding: 20,
    paddingTop: 10,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Estilos para tickets
  ticketCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ticketId: {
    fontSize: 14,
    color: '#666',
  },
  priorityHigh: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ticketDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ticketClient: {
    fontSize: 14,
    color: '#007AFF',
  },
  ticketLocation: {
    fontSize: 14,
    color: '#666',
  },
  ticketStatus: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  processButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  processButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  evidenceButton: {
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  evidenceButtonText: {
    color: '#666',
    fontSize: 14,
  },

  // Estilos para notificaciones
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#333',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  saveButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  notificationIconText: {
    color: 'white',
    fontSize: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },

  // Estilos para evidencias
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonText: {
    color: 'white',
    fontSize: 14,
  },
  evidenceItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  evidenceIcon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  evidenceIconText: {
    fontSize: 24,
  },
  evidenceContent: {
    flex: 1,
    marginRight: 15,
  },
  evidenceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  evidenceSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  evidenceDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  evidenceSize: {
    fontSize: 12,
    color: '#007AFF',
  },
  evidenceActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  actionButtonText: {
    fontSize: 16,
  },
});