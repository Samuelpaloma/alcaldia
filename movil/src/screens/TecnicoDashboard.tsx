import React, { useState, useEffect, useRef } from 'react';
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
  TextInput,
  Image
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigationTypes';
import { checkAuthStatus } from './utils/authHelpers';
import NotificacionService from '../services/NotificacionService';
import SecurityService from '../services/SecurityService';
import NotificacionesModal from './components/NotificacionesModal';
import PreferenciasNotificacionesModal from './components/PreferenciasNotificacionesModal';
import { useFocusEffect } from '@react-navigation/native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TecnicoDashboardProps {
  onLogout?: () => Promise<void>;
}

interface Ticket {
  id: number;
  estado: string;
  prioridad?: string;
  categoria?: string;
  consulta?: string;
  descripcion?: string;
  ubicacion?: string;
  creador?: {
    nombre: string;
  };
}

export default function TecnicoDashboard({ onLogout }: TecnicoDashboardProps) {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    finalizados: 0,
    evidencias: 0,
    notificaciones: 0,
    totalEvidencias: 0,
    totalNotificaciones: 0
  });

  // Estados para modales
  const [misTicketsVisible, setMisTicketsVisible] = useState(false);
  const [notificacionesVisible, setNotificacionesVisible] = useState(false);
  const [preferenciasModalVisible, setPreferenciasModalVisible] = useState(false);
  const [evidenciasVisible, setEvidenciasVisible] = useState(false);
  const [finalizarModalVisible, setFinalizarModalVisible] = useState(false);
  const [verEvidenciasModalVisible, setVerEvidenciasModalVisible] = useState(false);

  // Estados para el sidebar
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Estados para seguridad
  const [seguridadVisible, setSeguridadVisible] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true); // Por defecto activado
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);

  // Estados para notificaciones
  const [preferenciasPush, setPreferenciasPush] = useState(true);
  const [preferenciasEmail, setPreferenciasEmail] = useState(true);
  const [contadorNotificaciones, setContadorNotificaciones] = useState(0);

  // Estados para tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [evidencias, setEvidencias] = useState<any[]>([]);
  const [evidenciasLoading, setEvidenciasLoading] = useState(false);
  
  // Estados para evidencias globales
  const [todasLasEvidencias, setTodasLasEvidencias] = useState<any[]>([]);
  const [evidenciasGlobalesLoading, setEvidenciasGlobalesLoading] = useState(false);

  // Estados para búsqueda
  const [searchText, setSearchText] = useState('');
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    loadUserData();
    loadStats();
    loadContadorNotificaciones();
    loadTickets();
  }, []);

  // Efecto para filtrar tickets cuando cambia la búsqueda
  useEffect(() => {
    filterTickets();
  }, [searchText, tickets]);

  // Cargar contador de notificaciones cuando el componente se enfoca
  useFocusEffect(
    React.useCallback(() => {
      loadContadorNotificaciones();
    }, [])
  );

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

  const handleLogout = async () => {
    try {
      console.log('🚪 [LOGOUT] Iniciando proceso de logout...');
      
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const response = await fetch('http://localhost:8080/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          console.log('✅ [LOGOUT] Logout exitoso en el backend');
        } else {
          console.log('⚠️ [LOGOUT] Error en logout del backend, pero continuando...');
        }
      }

      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userInfo');
      console.log('✅ [LOGOUT] Almacenamiento local limpiado');

      Alert.alert(
        'Sesión cerrada',
        'Has cerrado sesión exitosamente',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('🔄 [LOGOUT] Redirigiendo a login...');
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ [LOGOUT] Error en logout:', error);
      
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userInfo');
      
      Alert.alert(
        'Sesión cerrada',
        'Has cerrado sesión (con errores menores)',
        [{ text: 'OK' }]
      );
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
        try {
          const data = await response.json();
          console.log('📊 Estadísticas recibidas:', data);
          console.log('📊 Data success:', data?.success);
          console.log('📊 Data stats:', data?.stats);
          
          if (data?.success && data?.data) {
            setStats({
              total: data.data.totalTickets || 0,
              pendientes: data.data.ticketsPendientes || 0,
              enProceso: data.data.ticketsEnEjecucion || 0,
              finalizados: data.data.ticketsTerminados || 0,
              evidencias: data.data.totalEvidencias || 0,
              notificaciones: data.data.totalNotificaciones || 0,
              totalEvidencias: data.data.totalEvidencias || 0,
              totalNotificaciones: data.data.totalNotificaciones || 0
            });
          } else {
            console.error('Error en respuesta del servidor:', data?.message || 'Respuesta inválida del servidor');
            // Usar datos por defecto si la respuesta no es válida
            setStats({
              total: 0,
              pendientes: 0,
              enProceso: 0,
              finalizados: 0,
              evidencias: 0,
              notificaciones: 0,
              totalEvidencias: 0,
              totalNotificaciones: 0
            });
          }
        } catch (parseError) {
          console.error('Error parseando respuesta JSON:', parseError);
          // Usar datos por defecto si hay error parseando
          setStats({
            total: 0,
            pendientes: 0,
            enProceso: 0,
            finalizados: 0,
            evidencias: 0,
            notificaciones: 0,
            totalEvidencias: 0,
            totalNotificaciones: 0
          });
        }
      } else if (response.status === 401) {
        console.log('Token inválido o expirado, redirigiendo a Login');
        // Opcional: limpiar token y redirigir
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userInfo');
      } else {
        // Manejar errores 404 de forma silenciosa (endpoints no implementados)
        if (response.status === 404) {
          console.log('📊 Endpoint de estadísticas no implementado aún, usando datos por defecto');
        } else {
          console.error('Error del servidor:', response.status);
        }
        // Si hay error, mantener las estadísticas en 0
        setStats({
          total: 0,
          pendientes: 0,
          enProceso: 0,
          finalizados: 0,
          evidencias: 0,
          notificaciones: 0,
          totalEvidencias: 0,
          totalNotificaciones: 0
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      // Si hay error de conexión, mantener las estadísticas en 0
      setStats({
        total: 0,
        pendientes: 0,
        enProceso: 0,
        finalizados: 0,
        evidencias: 0,
        notificaciones: 0,
        totalEvidencias: 0,
        totalNotificaciones: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadContadorNotificaciones = async () => {
    console.log('🔔 [FRONTEND] ===== INICIANDO loadContadorNotificaciones =====');
    console.log('🔔 [FRONTEND] Timestamp:', new Date().toISOString());
    try {
      console.log('🔔 [FRONTEND] Llamando a NotificacionService.getContadorNotificaciones()');
      const count = await NotificacionService.getContadorNotificaciones();
      console.log('🔔 [FRONTEND] Contador recibido:', count);
      setContadorNotificaciones(count);
      console.log('✅ [FRONTEND] Contador de notificaciones actualizado exitosamente');
    } catch (error) {
      console.error('❌ [FRONTEND] Error cargando contador de notificaciones:', error);
      console.error('❌ [FRONTEND] Error details:', error);
    }
    console.log('🔔 [FRONTEND] ===== FIN loadContadorNotificaciones =====');
  };

  const loadTickets = async () => {
    console.log('🎫 [FRONTEND] ===== INICIANDO loadTickets =====');
    console.log('🎫 [FRONTEND] Timestamp:', new Date().toISOString());
    setTicketsLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('🎫 [FRONTEND] Token obtenido:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('🎫 [FRONTEND] Llamando a: http://localhost:8080/api/tecnico/tickets');
      
      const response = await fetch('http://localhost:8080/api/tecnico/tickets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('🎫 [FRONTEND] Respuesta recibida:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('🎫 Tickets recibidos:', data);
        if (data.success && data.data) {
          setTickets(data.data);
        } else {
          console.error('Error en respuesta del servidor:', data.message);
        }
      } else if (response.status === 401) {
        console.log('Token inválido o expirado, redirigiendo a Login');
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userInfo');
      } else {
        console.error('Error del servidor:', response.status);
        try {
          const errorData = await response.json();
          console.error('Detalles del error:', errorData);
        } catch (parseError) {
          console.error('No se pudo parsear el error del servidor');
        }
      }
    } catch (error) {
      console.error('Error cargando tickets:', error);
    } finally {
      setTicketsLoading(false);
    }
  };

  // Función para filtrar tickets
  const filterTickets = () => {
    let filtered = tickets;

    // Filtrar por texto de búsqueda
    if (searchText.trim()) {
      filtered = filtered.filter(ticket => 
        (ticket.consulta || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (ticket.descripcion || '').toLowerCase().includes(searchText.toLowerCase()) ||
        ticket.id.toString().includes(searchText.toLowerCase())
      );
    }

    setFilteredTickets(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    await loadTickets();
    await loadContadorNotificaciones();
    setRefreshing(false);
  };

  // Función para aceptar un ticket (PENDIENTE -> EN_PROCESO)
  const aceptarTicket = async (ticketId: number) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/tecnico/tickets/${ticketId}/aceptar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          Alert.alert('Éxito', 'Ticket aceptado exitosamente');
          // Recargar tickets para actualizar la vista
          await loadTickets();
        } else {
          Alert.alert('Error', data.message || 'Error al aceptar el ticket');
        }
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Error del servidor');
      }
    } catch (error) {
      console.error('Error aceptando ticket:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  // Función para abrir modal de finalización
  const abrirModalFinalizar = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setFinalizarModalVisible(true);
  };

  // Función para finalizar un ticket (EN_PROCESO -> FINALIZADA)
  const finalizarTicket = async (ticketId: number, archivoAdjunto: any, descripcion: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const formData = new FormData();
      
      // Agregar archivo adjunto si existe
      if (archivoAdjunto) {
        // Para web, usar el archivo directamente
        if (archivoAdjunto.file) {
          formData.append('archivoAdjunto', archivoAdjunto.file);
        } else {
          // Fallback para otros formatos
          formData.append('archivoAdjunto', {
            uri: archivoAdjunto.uri,
            type: archivoAdjunto.type,
            name: archivoAdjunto.name,
          } as any);
        }
      }
      
      formData.append('descripcion', descripcion);

      const response = await fetch(`http://localhost:8080/api/tecnico/tickets/${ticketId}/finalizar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          Alert.alert('Éxito', 'Ticket finalizado exitosamente');
          setFinalizarModalVisible(false);
          setSelectedTicket(null);
          // Recargar tickets para actualizar la vista
          await loadTickets();
        } else {
          Alert.alert('Error', data.message || 'Error al finalizar el ticket');
        }
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Error del servidor');
      }
    } catch (error) {
      console.error('Error finalizando ticket:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  // Función para obtener evidencias de un ticket
  const obtenerEvidencias = async (ticketId: number) => {
    try {
      setEvidenciasLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      console.log('📱 [EVIDENCIA] Obteniendo evidencias del ticket:', ticketId);
      
      const response = await fetch(`http://localhost:8080/api/evidencias/movil/ticket/${ticketId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📱 [EVIDENCIA] Respuesta recibida:', data);

      if (response.ok && data.success) {
        console.log('📱 [EVIDENCIA] Evidencias obtenidas:', data.data);
        setEvidencias(data.data || []);
        setVerEvidenciasModalVisible(true);
      } else {
        console.error('📱 [EVIDENCIA] Error en respuesta:', data.message);
        Alert.alert('Error', data.message || 'Error al obtener evidencias');
      }
    } catch (error) {
      console.error('📱 [EVIDENCIA] Error obteniendo evidencias:', error);
      Alert.alert('Error', 'Error de conexión al obtener evidencias');
    } finally {
      setEvidenciasLoading(false);
    }
  };

  // Función para descargar evidencia
  const descargarEvidencia = async (ticketId: number, nombreArchivo: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      console.log('📱 [EVIDENCIA] Descargando evidencia:', nombreArchivo, 'del ticket:', ticketId);
      
      const response = await fetch(`http://localhost:8080/api/evidencias/descargar/${ticketId}/${encodeURIComponent(nombreArchivo)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Obtener el archivo como blob
        const blob = await response.blob();
        
        // Crear URL temporal para el archivo
        const url = window.URL.createObjectURL(blob);
        
        // Crear elemento de descarga
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo; // Nombre del archivo
        link.style.display = 'none';
        
        // Agregar al DOM, hacer click y remover
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpiar la URL temporal
        window.URL.revokeObjectURL(url);
        
        console.log('✅ [EVIDENCIA] Descarga exitosa');
        Alert.alert('Éxito', `Archivo ${nombreArchivo} descargado exitosamente`);
      } else {
        console.error('❌ [EVIDENCIA] Error en descarga:', response.status);
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Error al descargar el archivo');
      }
    } catch (error) {
      console.error('❌ [EVIDENCIA] Error descargando archivo:', error);
      Alert.alert('Error', 'Error de conexión al descargar');
    }
  };

  // Función para cargar todas las evidencias del técnico
  const cargarTodasLasEvidencias = async () => {
    try {
      setEvidenciasGlobalesLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      console.log('📱 [EVIDENCIA] Cargando todas las evidencias del técnico...');
      
      // Obtener todos los tickets del técnico
      const ticketsResponse = await fetch('http://localhost:8080/api/tecnico/tickets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        const tickets = ticketsData.data || [];
        
        console.log('📱 [EVIDENCIA] Tickets encontrados:', tickets.length);
        
        // Obtener evidencias de cada ticket
        const todasEvidencias: any[] = [];
        
        for (const ticket of tickets) {
          try {
            const evidenciasResponse = await fetch(`http://localhost:8080/api/evidencias/movil/ticket/${ticket.id}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (evidenciasResponse.ok) {
              const evidenciasData = await evidenciasResponse.json();
              if (evidenciasData.success && evidenciasData.data) {
                // Agregar información del ticket a cada evidencia
                const evidenciasConTicket = evidenciasData.data.map((evidencia: any) => ({
                  ...evidencia,
                  ticketNumero: ticket.id,
                  ticketConsulta: ticket.consulta,
                  ticketEstado: ticket.estado
                }));
                todasEvidencias.push(...evidenciasConTicket);
              }
            }
          } catch (error) {
            console.error(`Error obteniendo evidencias del ticket ${ticket.id}:`, error);
          }
        }
        
        console.log('📱 [EVIDENCIA] Total evidencias encontradas:', todasEvidencias.length);
        setTodasLasEvidencias(todasEvidencias);
      } else {
        console.error('❌ [EVIDENCIA] Error obteniendo tickets');
      }
    } catch (error) {
      console.error('❌ [EVIDENCIA] Error cargando evidencias:', error);
    } finally {
      setEvidenciasGlobalesLoading(false);
    }
  };

  useEffect(() => {
    const loadUserInfo = async () => {
      const { isAuthenticated, userInfo } = await checkAuthStatus();
      
      if (!isAuthenticated) {
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
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>TicketFlow - Técnico</Text>
          <TouchableOpacity onPress={() => setMisTicketsVisible(false)}>
            <Text style={styles.closeButton}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Título principal */}
        <View style={styles.modalTitleSection}>
          <Text style={styles.modalMainTitle}>Mis Tickets</Text>
          <Text style={styles.modalSubtitle}>Visualiza y actualiza tus tickets asignados</Text>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput 
              style={styles.searchInput}
              placeholder="Buscar tickets..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Lista de tickets */}
        <ScrollView style={styles.modalContent}>
          {ticketsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando tickets...</Text>
            </View>
          ) : filteredTickets.length > 0 ? (
            filteredTickets.map((ticket, index) => (
              <View key={ticket.id || index} style={styles.ticketCardNew}>
                {/* Header del ticket */}
                <View style={styles.ticketHeaderNew}>
                  <Text style={styles.ticketTitleNew}>{ticket.id}: {ticket.consulta || ticket.descripcion}</Text>
                </View>

                {/* Descripción */}
                <Text style={styles.ticketDescriptionNew}>{ticket.descripcion}</Text>

                {/* Tags de estado y prioridad */}
                <View style={styles.tagsContainer}>
                  <View style={[
                    styles.statusTag, 
                    ticket.estado === 'PENDIENTE' ? { backgroundColor: '#ffebee' } :
                    ticket.estado === 'EN_PROCESO' ? { backgroundColor: '#fff3e0' } :
                    { backgroundColor: '#e8f5e8' }
                  ]}>
                    <Text style={styles.tagText}>{ticket.estado}</Text>
                  </View>
                  
                  <View style={[
                    styles.priorityTag,
                    ticket.prioridad === 'ALTA' ? styles.priorityHigh :
                    ticket.prioridad === 'MEDIA' ? styles.priorityMedium :
                    styles.priorityLow
                  ]}>
                    <Text style={styles.tagText}>{ticket.prioridad?.toLowerCase()}</Text>
                  </View>

                  <View style={styles.areaTag}>
                    <Text style={styles.tagText}>Área: {ticket.categoria || 'Sistemas'}</Text>
                  </View>
                </View>

                {/* Estado actual */}
                <View style={styles.currentStatusContainer}>
                  <Text style={styles.currentStatusLabel}>Estado actual:</Text>
                  <View style={[
                    styles.currentStatusBadge,
                    ticket.estado === 'PENDIENTE' ? { backgroundColor: '#ffebee' } :
                    ticket.estado === 'EN_PROCESO' ? { backgroundColor: '#fff3e0' } :
                    { backgroundColor: '#e8f5e8' }
                  ]}>
                    <Text style={styles.currentStatusText}>{ticket.estado}</Text>
                  </View>
                </View>

                {/* Botones de acción */}
                <View style={styles.actionButtonsContainer}>
                  {ticket.estado === 'PENDIENTE' && (
                    <TouchableOpacity 
                      style={styles.actionButtonBlack}
                      onPress={() => aceptarTicket(ticket.id)}
                    >
                      <Text style={styles.actionButtonIcon}>▶</Text>
                      <Text style={styles.actionButtonTextBlack}>Aceptar</Text>
                    </TouchableOpacity>
                  )}
                  
                  {ticket.estado === 'EN_PROCESO' && (
                    <TouchableOpacity 
                      style={styles.actionButtonGreen}
                      onPress={() => abrirModalFinalizar(ticket)}
                    >
                      <Text style={styles.actionButtonIcon}>✓</Text>
                      <Text style={styles.actionButtonTextGreen}>Finalizar</Text>
                    </TouchableOpacity>
                  )}

                  {ticket.estado === 'FINALIZADA' && (
                    <TouchableOpacity 
                      style={styles.viewEvidenceButton}
                      onPress={() => obtenerEvidencias(ticket.id)}
                    >
                      <Text style={styles.viewEvidenceButtonText}>Ver Evidencias</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>📋 Sin tickets asignados</Text>
              <Text style={styles.emptyText}>
                No tienes tickets asignados en este momento. El administrador te asignará tickets cuando estén disponibles.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // Función para abrir preferencias de notificaciones
  const abrirPreferenciasNotificaciones = () => {
    setNotificacionesVisible(false);
    setPreferenciasModalVisible(true);
  };

  // Cargar estado de 2FA
  const load2FAStatus = async () => {
    try {
      console.log('🔒 [SECURITY] Cargando estado de 2FA...');
      const status = await SecurityService.get2FAStatus();
      setTwoFactorEnabled(status.enabled);
      console.log('🔒 [SECURITY] Estado de 2FA cargado:', status.enabled);
    } catch (error) {
      console.error('🔒 [SECURITY] Error cargando estado de 2FA:', error);
      // Mantener el estado por defecto si hay error
    }
  };

  // Actualizar estado de 2FA
  const update2FAStatus = async (enabled: boolean) => {
    try {
      setLoading2FA(true);
      console.log('🔒 [SECURITY] Actualizando 2FA a:', enabled);
      
      const result = await SecurityService.toggle2FA(enabled);
      setTwoFactorEnabled(result.enabled);
      
      console.log('🔒 [SECURITY] 2FA actualizado exitosamente:', result.message);
      return result;
    } catch (error) {
      console.error('🔒 [SECURITY] Error actualizando 2FA:', error);
      throw error;
    } finally {
      setLoading2FA(false);
    }
  };

  // Componente Modal de Seguridad
  const SeguridadModal = () => (
    <Modal visible={seguridadVisible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Seguridad</Text>
          <TouchableOpacity onPress={() => setSeguridadVisible(false)}>
            <Text style={styles.modalClose}>×</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <Text style={styles.sectionTitle}>Autenticación de dos pasos</Text>
          <Text style={styles.sectionDescription}>
            Añade una capa extra de seguridad a tu cuenta. Cuando esté habilitada, 
            recibirás un código de verificación por correo electrónico cada vez que inicies sesión.
          </Text>
          
          <View style={styles.securityOption}>
            <View style={styles.securityOptionContent}>
              <Text style={styles.securityOptionTitle}>Autenticación de dos pasos</Text>
              <Text style={styles.securityOptionDescription}>
                Recibe un código de 6 dígitos por correo electrónico
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.toggle, twoFactorEnabled && styles.toggleActive]}
              onPress={() => setTwoFactorEnabled(!twoFactorEnabled)}
            >
              <View style={[styles.toggleCircle, twoFactorEnabled && styles.toggleCircleActive]} />
            </TouchableOpacity>
          </View>
          
          {twoFactorEnabled && (
            <View style={styles.securityInfo}>
              <Text style={styles.securityInfoTitle}>✅ Autenticación de dos pasos habilitada</Text>
              <Text style={styles.securityInfoText}>
                A partir de ahora, cada vez que inicies sesión recibirás un código de verificación 
                de 6 dígitos en tu correo electrónico.
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.saveButton, loading2FA && styles.saveButtonDisabled]}
            onPress={async () => {
              try {
                const result = await update2FAStatus(twoFactorEnabled);
                Alert.alert(
                  'Configuración guardada',
                  result.message,
                  [{ text: 'OK', onPress: () => setSeguridadVisible(false) }]
                );
              } catch (error) {
                Alert.alert(
                  'Error',
                  'No se pudo actualizar la configuración de seguridad. Inténtalo de nuevo.',
                  [{ text: 'OK' }]
                );
              }
            }}
            disabled={loading2FA}
          >
            <Text style={styles.saveButtonText}>
              {loading2FA ? 'Guardando...' : 'Guardar configuración'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // Componente Modal Finalizar Ticket
  const FinalizarModal = () => {
    const [archivoAdjunto, setArchivoAdjunto] = useState<any>(null);
    const [descripcion, setDescripcion] = useState('');

    const seleccionarArchivo = () => {
      // Crear un input de archivo oculto
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/*'; // Solo imágenes y videos
      input.style.display = 'none';
      
      input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
          // Validar que sea imagen o video
          const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
          
          if (!isValidType) {
            Alert.alert('Error', 'Solo se permiten archivos de imagen y video');
            return;
          }
          
          // Validar tamaño (máximo 50MB)
          const maxSize = 50 * 1024 * 1024; // 50MB en bytes
          if (file.size > maxSize) {
            Alert.alert('Error', 'El archivo es demasiado grande. Máximo 50MB');
            return;
          }
          
          // Convertir el archivo a un formato compatible con FormData
          const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            uri: URL.createObjectURL(file), // Para web
            file: file // Mantener la referencia al archivo original
          };
          setArchivoAdjunto(fileData);
        }
      };
      
      // Simular click en el input
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    };

    const removerArchivo = () => {
      setArchivoAdjunto(null);
    };

    const handleFinalizar = () => {
      if (selectedTicket) {
        // Validar que se haya subido una evidencia
        if (!archivoAdjunto) {
          Alert.alert('Evidencia Requerida', 'Debes subir al menos una evidencia (imagen o video) para finalizar el ticket.');
          return;
        }
        
        // Validar que se haya escrito una descripción
        if (!descripcion || descripcion.trim().length === 0) {
          Alert.alert('Descripción Requerida', 'Debes escribir una descripción de la solución implementada.');
          return;
        }
        
        finalizarTicket(selectedTicket.id, archivoAdjunto, descripcion);
      }
    };

    return (
      <Modal visible={finalizarModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Finalizar Ticket</Text>
            <TouchableOpacity onPress={() => setFinalizarModalVisible(false)}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>
            Sube las evidencias y describe la solución implementada.
          </Text>
          
          <ScrollView style={styles.modalContent}>
            {selectedTicket && (
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketInfoTitle}>Ticket #{selectedTicket.id}</Text>
                <Text style={styles.ticketInfoDescription}>
                  {selectedTicket.consulta || selectedTicket.descripcion}
                </Text>
              </View>
            )}

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Evidencia (Imagen o Video) *</Text>
              <Text style={styles.archivoInfoText}>
                Solo se permiten archivos de imagen y video. Máximo 50MB. <Text style={styles.requiredText}>*Requerido</Text>
              </Text>
              <TouchableOpacity style={styles.uploadButton} onPress={seleccionarArchivo}>
                <Text style={styles.uploadButtonText}>
                  {archivoAdjunto ? 'Cambiar Archivo' : '+ Seleccionar Imagen/Video'}
                </Text>
              </TouchableOpacity>
              {archivoAdjunto && (
                <View style={styles.archivoSeleccionado}>
                  <View style={styles.archivoInfo}>
                    <Text style={styles.archivoNombre}>{archivoAdjunto.name}</Text>
                    <Text style={styles.archivoTamaño}>
                      {(archivoAdjunto.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                    <Text style={styles.archivoTipo}>
                      {archivoAdjunto.type.startsWith('image/') ? '🖼️ Imagen' : '🎥 Video'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.removeButton} onPress={removerArchivo}>
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Descripción de la Solución *</Text>
              <Text style={styles.archivoInfoText}>
                <Text style={styles.requiredText}>*Requerido</Text>
              </Text>
              <TextInput
                style={styles.descripcionInput}
                placeholder="Describe la solución implementada..."
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.finalizarButton, 
                (!archivoAdjunto || !descripcion || descripcion.trim().length === 0) && styles.finalizarButtonDisabled
              ]} 
              onPress={handleFinalizar}
              disabled={!archivoAdjunto || !descripcion || descripcion.trim().length === 0}
            >
              <Text style={[
                styles.finalizarButtonText,
                (!archivoAdjunto || !descripcion || descripcion.trim().length === 0) && styles.finalizarButtonTextDisabled
              ]}>
                Finalizar Ticket
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // Componente Modal Ver Evidencias
  const VerEvidenciasModal = () => (
    <Modal visible={verEvidenciasModalVisible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Evidencias del Ticket</Text>
          <TouchableOpacity onPress={() => setVerEvidenciasModalVisible(false)}>
            <Text style={styles.closeButton}>×</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.modalSubtitle}>
          Evidencias subidas para este ticket.
        </Text>
        
        <ScrollView style={styles.modalContent}>
          {evidenciasLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando evidencias...</Text>
            </View>
          ) : evidencias.length > 0 ? (
            evidencias.map((evidencia, index) => {
              const isImage = evidencia.tipoEvidencia === 'IMAGEN' || evidencia.nombreArchivo?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
              const isVideo = evidencia.tipoEvidencia === 'VIDEO' || evidencia.nombreArchivo?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i);
              const isDocumento = evidencia.tipoEvidencia === 'DOCUMENTO';
              const isAudio = evidencia.tipoEvidencia === 'AUDIO';
              
              return (
                <View key={evidencia.idEvidencia || index} style={styles.evidenceItem}>
                  <View style={styles.evidenceIcon}>
                    <Text style={styles.evidenceIconText}>
                      {isImage ? '🖼️' : isVideo ? '🎥' : isAudio ? '🎵' : '📄'}
                    </Text>
                  </View>
                  <View style={styles.evidenceContent}>
                    <Text style={styles.evidenceTitle}>{evidencia.nombreCompletoArchivo || evidencia.nombreArchivo}</Text>
                    <Text style={styles.evidenceSubtitle}>{evidencia.descripcion || 'Evidencia del ticket'}</Text>
                    <Text style={styles.evidenceDate}>
                      Fecha: {new Date(evidencia.fechaSubida).toLocaleDateString()}
                    </Text>
                    <Text style={styles.evidenceSize}>
                      Tamaño: {evidencia.tamanioFormateado || 'N/A'}
                    </Text>
                    <Text style={styles.evidenceType}>
                      {isImage ? 'Imagen' : isVideo ? 'Video' : isAudio ? 'Audio' : 'Documento'}
                    </Text>
                    {evidencia.subidoPorNombre && (
                      <Text style={styles.evidenceUploader}>
                        Subido por: {evidencia.subidoPorNombre}
                      </Text>
                    )}
                  </View>
                  <View style={styles.evidenceActions}>
                    <TouchableOpacity 
                      style={styles.downloadButton}
                      onPress={() => descargarEvidencia(evidencia.ticketId, evidencia.nombreArchivo)}
                    >
                      <Text style={styles.downloadButtonText}>⬇ Descargar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay evidencias para este ticket</Text>
            </View>
          )}
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
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Total: {todasLasEvidencias.length} evidencias</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={cargarTodasLasEvidencias}
          >
            <Text style={styles.filterButtonText}>🔄 Actualizar</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {evidenciasGlobalesLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando evidencias...</Text>
            </View>
          ) : todasLasEvidencias.length > 0 ? (
            todasLasEvidencias
              .filter(evidencia => 
                !searchText || 
                evidencia.nombreArchivo?.toLowerCase().includes(searchText.toLowerCase()) ||
                evidencia.descripcion?.toLowerCase().includes(searchText.toLowerCase()) ||
                evidencia.ticketConsulta?.toLowerCase().includes(searchText.toLowerCase())
              )
              .map((evidencia, index) => {
                const isImage = evidencia.tipoEvidencia === 'IMAGEN' || evidencia.nombreArchivo?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
                const isVideo = evidencia.tipoEvidencia === 'VIDEO' || evidencia.nombreArchivo?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i);
                const isDocumento = evidencia.tipoEvidencia === 'DOCUMENTO';
                const isAudio = evidencia.tipoEvidencia === 'AUDIO';
                
                return (
                  <View key={evidencia.idEvidencia || index} style={styles.evidenceItem}>
                    <View style={styles.evidenceIcon}>
                      <Text style={styles.evidenceIconText}>
                        {isImage ? '🖼️' : isVideo ? '🎥' : isAudio ? '🎵' : '📄'}
                      </Text>
                    </View>
                    <View style={styles.evidenceContent}>
                      <Text style={styles.evidenceTitle}>{evidencia.nombreCompletoArchivo || evidencia.nombreArchivo}</Text>
                      <Text style={styles.evidenceSubtitle}>{evidencia.descripcion || 'Evidencia del ticket'}</Text>
                      <Text style={styles.evidenceDate}>
                        Fecha: {new Date(evidencia.fechaSubida).toLocaleDateString()}
                      </Text>
                      <Text style={styles.evidenceSize}>
                        Tamaño: {evidencia.tamanioFormateado || 'N/A'}
                      </Text>
                      <Text style={styles.evidenceType}>
                        {isImage ? 'Imagen' : isVideo ? 'Video' : isAudio ? 'Audio' : 'Documento'}
                      </Text>
                      {evidencia.ticketNumero && (
                        <Text style={styles.evidenceTicket}>
                          Ticket #{evidencia.ticketNumero}: {evidencia.ticketConsulta?.substring(0, 50)}...
                        </Text>
                      )}
                      {evidencia.subidoPorNombre && (
                        <Text style={styles.evidenceUploader}>
                          Subido por: {evidencia.subidoPorNombre}
                        </Text>
                      )}
                    </View>
                    <View style={styles.evidenceActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => descargarEvidencia(evidencia.ticketId, evidencia.nombreArchivo)}
                      >
                        <Text style={styles.actionButtonText}>⬇</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay evidencias disponibles</Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={cargarTodasLasEvidencias}
              >
                <Text style={styles.refreshButtonText}>🔄 Cargar Evidencias</Text>
              </TouchableOpacity>
            </View>
          )}
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
          {/* Header con menú hamburguesa */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>TicketFlow - Técnico</Text>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setSidebarVisible(true)}
            >
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
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
            ) : stats.total === 0 && stats.pendientes === 0 && stats.enProceso === 0 && stats.finalizados === 0 ? (
              <View style={styles.noTicketsContainer}>
                <Text style={styles.noTicketsIcon}>📋</Text>
                <Text style={styles.noTicketsTitle}>Sin tickets asignados</Text>
                <Text style={styles.noTicketsMessage}>
                  Aún no tienes tickets asignados. El administrador te asignará tickets cuando estén disponibles.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.total}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={[styles.statNumber, styles.statNumberRed]}>{stats.pendientes}</Text>
                    <Text style={styles.statLabel}>Pendientes</Text>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={[styles.statNumber, styles.statNumberOrange]}>{stats.enProceso}</Text>
                    <Text style={styles.statLabel}>En proceso</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={[styles.statNumber, styles.statNumberGreen]}>{stats.finalizados}</Text>
                    <Text style={styles.statLabel}>Finalizados</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Secciones de acción */}
          <View style={styles.actionSectionsContainer}>
            {/* Siempre mostrar Mis Tickets */}
            <View style={styles.actionSection}>
              <View style={styles.actionSectionContent}>
                <Text style={styles.actionSectionTitle}>Mis Tickets</Text>
                <Text style={styles.actionSectionCount}>({stats.total})</Text>
              </View>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  console.log('🎫 [FRONTEND] Botón "Mis Tickets" presionado');
                  console.log('🎫 [FRONTEND] Llamando a loadTickets()');
                  loadTickets();
                  console.log('🎫 [FRONTEND] Abriendo modal Mis Tickets');
                  setMisTicketsVisible(true);
                }}
              >
                <Text style={styles.actionButtonText}>Abrir</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionSection}>
              <View style={styles.actionSectionContent}>
                <Text style={styles.actionSectionTitle}>Evidencias</Text>
                <Text style={styles.actionSectionCount}>({stats.totalEvidencias || 0})</Text>
              </View>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  cargarTodasLasEvidencias();
                  setEvidenciasVisible(true);
                }}
              >
                <Text style={styles.actionButtonText}>Abrir</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionSection}>
              <View style={styles.actionSectionContent}>
                <Text style={styles.actionSectionTitle}>Notificaciones</Text>
                <Text style={styles.actionSectionCount}>({stats.totalNotificaciones || 0})</Text>
              </View>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setNotificacionesVisible(true)}
              >
                <View style={styles.notificationButtonContent}>
                  <Text style={styles.actionButtonText}>Abrir</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Modales */}
        <MisTicketsModal />
        <NotificacionesModal 
          visible={notificacionesVisible} 
          onClose={() => setNotificacionesVisible(false)}
          onOpenPreferences={abrirPreferenciasNotificaciones}
        />
        <PreferenciasNotificacionesModal 
          visible={preferenciasModalVisible} 
          onClose={() => setPreferenciasModalVisible(false)} 
        />
        <EvidenciasModal />
        <FinalizarModal />
        <VerEvidenciasModal />
        <SeguridadModal />
        
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
                    setMisTicketsVisible(true);
                  }}
                >
                  <Text style={styles.sidebarMenuIcon}>🎫</Text>
                  <Text style={styles.sidebarMenuText}>Mis Tickets</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.sidebarMenuItem}
                  onPress={() => {
                    setSidebarVisible(false);
                    setNotificacionesVisible(true);
                  }}
                >
                  <Text style={styles.sidebarMenuIcon}>🔔</Text>
                  <Text style={styles.sidebarMenuText}>Notificaciones</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.sidebarMenuItem}
                  onPress={() => {
                    setSidebarVisible(false);
                    cargarTodasLasEvidencias();
                    setEvidenciasVisible(true);
                  }}
                >
                  <Text style={styles.sidebarMenuIcon}>📄</Text>
                  <Text style={styles.sidebarMenuText}>Evidencias</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.sidebarMenuItem}
                  onPress={async () => {
                    setSidebarVisible(false);
                    await load2FAStatus(); // Cargar estado actual de 2FA
                    setSeguridadVisible(true);
                  }}
                >
                  <Text style={styles.sidebarMenuIcon}>🔒</Text>
                  <Text style={styles.sidebarMenuText}>Seguridad</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.sidebarMenuItem}
                  onPress={() => {
                    setSidebarVisible(false);
                    navigation.navigate('ChangePassword');
                  }}
                >
                  <Text style={styles.sidebarMenuIcon}>⚙️</Text>
                  <Text style={styles.sidebarMenuText}>Cambiar contraseña</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.sidebarLogout}
                onPress={async () => {
                  console.log('🚪 [LOGOUT] Iniciando proceso de logout...');
                  try {
                    // Cerrar sidebar
                    setSidebarVisible(false);
                    
                    // Usar la función de logout del App.tsx
                    if (onLogout) {
                      console.log('🔄 [LOGOUT] Usando función de logout del App.tsx...');
                      await onLogout();
                      console.log('✅ [LOGOUT] Sesión cerrada correctamente');
                    } else {
                      // Fallback: limpiar almacenamiento manualmente
                      console.log('⚠️ [LOGOUT] Función onLogout no disponible, usando fallback...');
                      await AsyncStorage.removeItem('authToken');
                      await AsyncStorage.removeItem('userInfo');
                      console.log('✅ [LOGOUT] Almacenamiento limpiado manualmente');
                    }
                  } catch (error) {
                    console.error('❌ [LOGOUT] Error:', error);
                    // Limpiar almacenamiento incluso si hay error
                    await AsyncStorage.removeItem('authToken');
                    await AsyncStorage.removeItem('userInfo');
                  }
                }}
              >
                <Text style={styles.sidebarLogoutIcon}>→</Text>
                <Text style={styles.sidebarLogoutText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    backgroundColor: '#f5f5f5',
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
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  statNumberPendiente: {
    fontSize: 36,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
  },
  statNumberEnproceso: {
    fontSize: 36,
    fontWeight: '700',
    color: '#CA8A04',
    marginBottom: 8,
  },
  statNumberFinalizado: {
    fontSize: 36,
    fontWeight: '700',
    color: '#16A34A',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '400',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    fontStyle: 'italic',
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  navigationButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '400',
  },

  // Estilos para los modales (mantener los existentes)
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
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
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
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Estilos para el modal de tickets
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Estilos para estados de tickets
  statusPending: {
    color: '#ff9800',
    fontWeight: 'bold',
  },
  statusInProgress: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
  statusCompleted: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  // Estilos para prioridades
  priorityMedium: {
    backgroundColor: '#ff9800',
  },
  priorityLow: {
    backgroundColor: '#4caf50',
  },

  // Estilos para botones de tickets
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  finalizeButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  finalizeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  viewEvidenceButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  viewEvidenceButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Estilos para modales de finalización
  ticketInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  ticketInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ticketInfoDescription: {
    fontSize: 14,
    color: '#666',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '500',
  },
  evidenciasList: {
    marginTop: 10,
  },
  evidenciaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 5,
  },
  evidenciaName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  descripcionInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  finalizarButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  finalizarButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  finalizarButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  finalizarButtonTextDisabled: {
    color: '#999',
  },

  // Estilos para archivo seleccionado
  archivoSeleccionado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  archivoInfo: {
    flex: 1,
  },
  archivoNombre: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  archivoTamaño: {
    fontSize: 12,
    color: '#666',
  },
  archivoTipo: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 2,
  },
  archivoInfoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  evidenceType: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 2,
  },
  evidenceUploader: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  evidenceTicket: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 2,
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  requiredText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  
  // Estilos para notificaciones
  notificationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Estilos nuevos para la UI mejorada
  statNumberRed: {
    color: '#ff4444',
  },
  statNumberOrange: {
    color: '#ff8800',
  },
  statNumberGreen: {
    color: '#00aa00',
  },
  noTicketsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
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
  noTicketsIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  noTicketsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  noTicketsMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionSectionsContainer: {
    gap: 15,
  },
  actionSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  actionSectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  actionSectionCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },

  // Estilos para tickets mejorados
  ticketCardNew: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  ticketHeaderNew: {
    marginBottom: 8,
  },
  ticketTitleNew: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ticketDescriptionNew: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
    justifyContent: 'flex-start',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  areaTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  currentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentStatusLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  currentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  currentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  actionButtonBlack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonIcon: {
    fontSize: 14,
    marginRight: 4,
    color: '#333',
  },
  actionButtonTextBlack: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  actionButtonGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonTextGreen: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },

  // Estilos para modales mejorados
  modalTitleSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalMainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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

  // Estilos para seguridad
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  securityOptionContent: {
    flex: 1,
    marginRight: 16,
  },
  securityOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  securityOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  securityInfo: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  securityInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 4,
  },
  securityInfoText: {
    fontSize: 12,
    color: '#2e7d32',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
});