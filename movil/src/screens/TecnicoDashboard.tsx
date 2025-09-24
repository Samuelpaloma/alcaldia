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
import * as DocumentPicker from 'expo-document-picker';
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
    total: 0,
    pendientes: 0,
    enProceso: 0,
    finalizados: 0,
    evidencias: 0,
    notificaciones: 0
  });
  
  // Estado para tickets detallados
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  
  // Estado para evidencias
  const [evidencias, setEvidencias] = useState([]);
  
  // Estados para búsqueda
  const [searchText, setSearchText] = useState('');
  
  // Estados para dropdowns de tickets individuales
  const [ticketDropdowns, setTicketDropdowns] = useState({});

  // Estados para modales
  const [misTicketsVisible, setMisTicketsVisible] = useState(false);
  const [notificacionesVisible, setNotificacionesVisible] = useState(false);
  const [evidenciasVisible, setEvidenciasVisible] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  
  // Estados para evidencias
  const [selectedFile, setSelectedFile] = useState(null);
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [currentTicketId, setCurrentTicketId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const textInputRef = useRef(null);
  const [modalKey, setModalKey] = useState(0);
  const [localDescription, setLocalDescription] = useState('');
  
  // Estado para el sidebar
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Estados para notificaciones
  const [preferenciasPush, setPreferenciasPush] = useState(true);
  const [preferenciasEmail, setPreferenciasEmail] = useState(true);
  const [notificaciones, setNotificaciones] = useState([]);
  
  // Estados para autenticación de dos pasos
  const [seguridadVisible, setSeguridadVisible] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    loadUserData();
    loadStats();
    loadTickets();
    loadEvidencias();
    loadNotificaciones();
  }, []);

  // Efecto para filtrar tickets cuando cambia la búsqueda
  useEffect(() => {
    filterTickets();
  }, [searchText, tickets]);

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
          setStats({
            total: data.stats.ticketsAsignados || 0,
            pendientes: data.stats.ticketsPendientes || 0,
            enProceso: data.stats.ticketsEnProceso || 0,
            finalizados: data.stats.ticketsCompletados || 0,
            evidencias: data.stats.evidencias || 0,
            notificaciones: data.stats.notificaciones || 0
          });
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
        // Si hay error, mantener las estadísticas en 0
        setStats({
          total: 0,
          pendientes: 0,
          enProceso: 0,
          finalizados: 0,
          evidencias: 0,
          notificaciones: 0
        });
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
      // Si hay error de conexión, mantener las estadísticas en 0
      setStats({
        total: 0,
        pendientes: 0,
        enProceso: 0,
        finalizados: 0,
        evidencias: 0,
        notificaciones: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/tecnico/tickets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🎫 Tickets recibidos:', data);
        if (data.success && data.tickets) {
          setTickets(data.tickets);
          console.log('✅ Tickets cargados correctamente:', data.tickets.length);
        } else {
          console.log('⚠️ No hay tickets disponibles');
          setTickets([]);
        }
      } else {
        console.error('Error cargando tickets:', response.status);
        // En caso de error, mantener tickets vacíos
        setTickets([]);
      }
    } catch (error) {
      console.error('Error cargando tickets:', error);
      // En caso de error, mantener tickets vacíos
      setTickets([]);
    }
  };

  const loadEvidencias = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/tecnico/evidencias', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📎 Evidencias recibidas:', data);
        if (data.success && data.evidencias) {
          setEvidencias(data.evidencias);
          console.log('✅ Evidencias cargadas correctamente:', data.evidencias.length);
        } else {
          console.log('⚠️ No hay evidencias disponibles');
          setEvidencias([]);
        }
      } else {
        console.error('Error cargando evidencias:', response.status);
        // En caso de error, mantener evidencias vacías
        setEvidencias([]);
      }
    } catch (error) {
      console.error('Error cargando evidencias:', error);
      // En caso de error, mantener evidencias vacías
      setEvidencias([]);
    }
  };

  const loadNotificaciones = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/tecnico/notificaciones', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔔 Notificaciones recibidas:', data);
        if (data.success && data.notificaciones) {
          setNotificaciones(data.notificaciones);
          console.log('✅ Notificaciones cargadas correctamente:', data.notificaciones.length);
        } else {
          console.log('⚠️ No hay notificaciones disponibles');
          setNotificaciones([]);
        }
      } else {
        console.error('Error cargando notificaciones:', response.status);
        // En caso de error, mantener notificaciones vacías
        setNotificaciones([]);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      // En caso de error, mantener notificaciones vacías
      setNotificaciones([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    await loadTickets();
    await loadEvidencias();
    await loadNotificaciones();
    setRefreshing(false);
  };

  // Función para filtrar tickets
  const filterTickets = () => {
    let filtered = tickets;

    // Filtrar por texto de búsqueda
    if (searchText.trim()) {
      filtered = filtered.filter(ticket => 
        ticket.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
        ticket.descripcion.toLowerCase().includes(searchText.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredTickets(filtered);
  };

  // Función para cambiar estado de ticket
  const changeTicketStatus = async (ticketId, newStatus) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/tecnico/tickets/${ticketId}/estado?estado=${newStatus}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Estado actualizado:', data);
        
        // Recargar todos los datos
        await loadTickets();
        await loadStats();
        await loadNotificaciones();
        
        Alert.alert('Éxito', `Ticket ${ticketId} actualizado a ${newStatus}`);
      } else {
        console.error('Error actualizando ticket:', response.status);
        Alert.alert('Error', 'No se pudo actualizar el ticket');
      }
    } catch (error) {
      console.error('Error actualizando ticket:', error);
      Alert.alert('Error', 'No se pudo actualizar el ticket');
    }
  };

  // Función para seleccionar archivo
  const selectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'video/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
          size: file.size,
        });
        console.log('📎 Archivo seleccionado:', file.name);
      }
    } catch (error) {
      console.error('Error seleccionando archivo:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  // Función para limpiar estados del modal
  const clearEvidenceModal = () => {
    setSelectedFile(null);
    setEvidenceDescription('');
    setLocalDescription('');
    setCurrentTicketId(null);
    setIsTyping(false);
    setModalKey(prev => prev + 1); // Forzar re-render del modal
    if (textInputRef.current) {
      textInputRef.current.blur();
    }
  };

  // Efecto para manejar el estado del modal
  useEffect(() => {
    if (showEvidenceModal) {
      console.log('🔍 Modal de evidencia abierto');
      // Resetear estados cuando se abre el modal
      setEvidenceDescription('');
      setLocalDescription('');
      setSelectedFile(null);
    }
  }, [showEvidenceModal]);

  // Función para guardar evidencia
  const saveEvidence = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Por favor selecciona un archivo');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      const formData = new FormData();
      
        formData.append('ticketId', currentTicketId);
        formData.append('descripcion', localDescription);
      formData.append('archivo', {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name,
      } as any);

      const response = await fetch('http://localhost:8080/api/tecnico/evidencias', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Evidencia guardada:', data);
        
        // Cerrar modal y limpiar estados
        setShowEvidenceModal(false);
        clearEvidenceModal();
        
        // Recargar datos
        await loadTickets();
        await loadEvidencias();
        await loadStats();
        await loadNotificaciones();
        
        Alert.alert('Éxito', 'Evidencia guardada correctamente. El ticket cambió a EN_PROCESO');
      } else {
        console.error('Error guardando evidencia:', response.status);
        Alert.alert('Error', 'No se pudo guardar la evidencia');
      }
    } catch (error) {
      console.error('Error guardando evidencia:', error);
      Alert.alert('Error', 'No se pudo guardar la evidencia');
    }
  };

  // Función para toggle dropdown de ticket
  const toggleTicketDropdown = (ticketId) => {
    setTicketDropdowns(prev => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
  };

  // Función para cambiar estado desde dropdown
  const changeStatusFromDropdown = async (ticketId, newStatus) => {
    await changeTicketStatus(ticketId, newStatus);
    setTicketDropdowns(prev => ({
      ...prev,
      [ticketId]: false
    }));
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

        {/* Barra de búsqueda sin lupa */}
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
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket, index) => (
              <View key={index} style={styles.ticketCardNew}>
                {/* Header del ticket */}
                <View style={styles.ticketHeaderNew}>
                  <Text style={styles.ticketTitleNew}>{ticket.id}: {ticket.consulta || ticket.titulo}</Text>
                </View>

                {/* Descripción */}
                <Text style={styles.ticketDescriptionNew}>{ticket.descripcion}</Text>

                {/* Tags de estado y prioridad */}
                <View style={styles.tagsContainer}>
                  <View style={[
                    styles.statusTag, 
                    ticket.estado === 'PENDIENTE' ? styles.statusPending :
                    ticket.estado === 'EN_PROCESO' ? styles.statusInProcess :
                    styles.statusCompleted
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
                    <Text style={styles.tagText}>Área: {ticket.area || 'Sistemas'}</Text>
                  </View>

                  <View style={styles.evidenceTag}>
                    <Text style={styles.tagText}>Evidencias: {ticket.evidencias || 0}</Text>
                  </View>
                </View>

                {/* Estado actual */}
                <View style={styles.currentStatusContainer}>
                  <Text style={styles.currentStatusLabel}>Estado actual:</Text>
                  <View style={[
                    styles.currentStatusBadge,
                    ticket.estado === 'PENDIENTE' ? styles.statusPending :
                    ticket.estado === 'EN_PROCESO' ? styles.statusInProcess :
                    styles.statusCompleted
                  ]}>
                    <Text style={styles.currentStatusText}>{ticket.estado}</Text>
                  </View>
                </View>

                {/* Botones de acción simplificados */}
                <View style={styles.actionButtonsContainer}>
                  {ticket.estado === 'PENDIENTE' && (
                    <TouchableOpacity 
                      style={styles.actionButtonBlack}
                      onPress={() => changeTicketStatus(ticket.id, 'EN_PROCESO')}
                    >
                      <Text style={styles.actionButtonIcon}>▶</Text>
                      <Text style={styles.actionButtonTextBlack}>En proceso</Text>
                    </TouchableOpacity>
                  )}
                  
                  {ticket.estado === 'EN_PROCESO' && (
                    <TouchableOpacity 
                      style={styles.actionButtonGreen}
                      onPress={() => changeTicketStatus(ticket.id, 'COMPLETADO')}
                    >
                      <Text style={styles.actionButtonIcon}>✓</Text>
                      <Text style={styles.actionButtonTextGreen}>Finalizar</Text>
                    </TouchableOpacity>
                  )}

                  {ticket.estado === 'PENDIENTE' && (
                    <TouchableOpacity 
                      style={styles.evidenceButtonNew}
                      onPress={() => {
                        setCurrentTicketId(ticket.id);
                        setShowEvidenceModal(true);
                      }}
                    >
                      <Text style={styles.evidenceButtonIcon}>📎</Text>
                      <Text style={styles.evidenceButtonText}>Agregar evidencia</Text>
                    </TouchableOpacity>
                  )}
                  
                  {ticket.estado === 'EN_PROCESO' && (
                    <View style={styles.evidenceDisabledContainer}>
                      <Text style={styles.evidenceDisabledIcon}>⏳</Text>
                      <Text style={styles.evidenceDisabledText}>Esperando confirmación</Text>
                    </View>
                  )}
                  
                  {ticket.estado === 'COMPLETADO' && (
                    <View style={styles.evidenceDisabledContainer}>
                      <Text style={styles.evidenceDisabledIcon}>✅</Text>
                      <Text style={styles.evidenceDisabledText}>Ticket finalizado</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>Sin tickets asignados</Text>
              <Text style={styles.emptyText}>
                No tienes tickets asignados en este momento. El administrador te asignará tickets cuando estén disponibles.
              </Text>
            </View>
          )}
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

          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Guardar notificaciones</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Notificaciones recientes</Text>
          
          {notificaciones.length > 0 ? (
            notificaciones.map((notificacion, index) => (
              <View key={index} style={styles.notificationItem}>
                 <View style={styles.notificationIcon}>
                   <Text style={styles.notificationIconText}>
                     {notificacion.tipo === 'asignacion' ? '🎫' : 
                      notificacion.tipo === 'evidencia' ? '📎' :
                      notificacion.tipo === 'finalizado' ? '✅' :
                      notificacion.tipo === 'cambio_estado' ? '⚠' : 
                      notificacion.tipo === 'recordatorio' ? '📧' : '🔔'}
                   </Text>
                 </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notificacion.titulo}</Text>
                  <Text style={styles.notificationTime}>{notificacion.fecha}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>Sin notificaciones</Text>
              <Text style={styles.emptyText}>
                No tienes notificaciones en este momento. Recibirás notificaciones cuando te asignen tickets.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // Componente Modal para Agregar Evidencia - SOLUCIÓN DEFINITIVA
  const EvidenceModal = React.memo(() => {
    const [tempDescription, setTempDescription] = useState('');
    const [tempFile, setTempFile] = useState(null);
    const tempTextInputRef = useRef(null);

    // Resetear cuando se abre el modal
    useEffect(() => {
      if (showEvidenceModal) {
        setTempDescription('');
        setTempFile(null);
      }
    }, [showEvidenceModal]);

    const handleSelectFile = async () => {
      try {
        console.log('🔍 [DEBUG] Iniciando selección de archivo...');
        const result = await DocumentPicker.getDocumentAsync({
          type: ['image/*', 'video/*'],
          copyToCacheDirectory: true,
        });

        console.log('🔍 [DEBUG] Resultado del picker:', result);

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const file = result.assets[0];
          const fileData = {
            uri: file.uri,
            name: file.name,
            type: file.mimeType,
            size: file.size,
          };
          console.log('📎 [DEBUG] Archivo seleccionado:', fileData);
          console.log('📎 [DEBUG] Tipo de archivo:', fileData.type);
          console.log('📎 [DEBUG] Es imagen?', fileData.type.startsWith('image/'));
          console.log('📎 [DEBUG] Es video?', fileData.type.startsWith('video/'));
          
          setTempFile(fileData);
          setSelectedFile(fileData);
          console.log('📎 [DEBUG] Estados actualizados');
        } else {
          console.log('📎 [DEBUG] Selección cancelada o sin archivos');
        }
      } catch (error) {
        console.error('Error seleccionando archivo:', error);
        Alert.alert('Error', 'No se pudo seleccionar el archivo: ' + error.message);
      }
    };

    const handleSave = async () => {
      console.log('🔍 [DEBUG] Intentando guardar evidencia...');
      console.log('🔍 [DEBUG] tempFile:', tempFile);
      console.log('🔍 [DEBUG] tempDescription:', tempDescription);
      console.log('🔍 [DEBUG] currentTicketId:', currentTicketId);
      
      if (!tempFile) {
        Alert.alert('Error', 'Por favor selecciona un archivo');
        return;
      }

      try {
        const token = await AsyncStorage.getItem('authToken');
        console.log('🔍 [DEBUG] Token obtenido:', token ? 'Sí' : 'No');
        
        const formData = new FormData();
        formData.append('ticketId', currentTicketId);
        formData.append('descripcion', tempDescription);
        formData.append('archivo', {
          uri: tempFile.uri,
          type: tempFile.type,
          name: tempFile.name,
        } as any);

        console.log('🔍 [DEBUG] FormData creado:', {
          ticketId: currentTicketId,
          descripcion: tempDescription,
          archivo: tempFile.name
        });

        const response = await fetch('http://localhost:8080/api/tecnico/evidencias', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        console.log('🔍 [DEBUG] Respuesta del servidor:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Evidencia guardada:', data);
          
          // Cerrar modal y limpiar estados
          setShowEvidenceModal(false);
          setSelectedFile(null);
          setEvidenceDescription('');
          setCurrentTicketId(null);
          
          // Recargar datos para mostrar la evidencia
          await loadTickets();
          await loadEvidencias();
          await loadStats();
          await loadNotificaciones();
          
          Alert.alert('Éxito', 'Evidencia guardada correctamente. El ticket cambió a EN_PROCESO');
        } else {
          const errorData = await response.text();
          console.error('Error guardando evidencia:', response.status, errorData);
          Alert.alert('Error', 'No se pudo guardar la evidencia. Código: ' + response.status);
        }
      } catch (error) {
        console.error('Error guardando evidencia:', error);
        Alert.alert('Error', 'No se pudo guardar la evidencia');
      }
    };

    const handleCancel = () => {
      setShowEvidenceModal(false);
      setSelectedFile(null);
      setEvidenceDescription('');
      setCurrentTicketId(null);
    };

    return (
      <Modal visible={showEvidenceModal} animationType="slide" transparent={true}>
        <View style={styles.evidenceModalOverlay}>
          <View style={styles.evidenceModalContainer}>
            <View style={styles.evidenceModalHeader}>
              <Text style={styles.evidenceModalTitle}>Agregar Evidencia</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.evidenceModalClose}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.evidenceModalContent}>
              <Text style={styles.evidenceModalLabel}>Seleccionar archivo</Text>
              <TouchableOpacity 
                style={[styles.evidenceFileButton, tempFile && styles.evidenceFileButtonSelected]}
                onPress={handleSelectFile}
              >
                <Text style={styles.evidenceFileButtonText}>
                  {tempFile ? `✅ ${tempFile.name}` : '📎 Seleccionar archivo'}
                </Text>
              </TouchableOpacity>
              
              {/* Vista previa del archivo seleccionado */}
              {tempFile && (
                <View style={styles.filePreviewContainer}>
                  <Text style={styles.filePreviewLabel}>Vista previa:</Text>
                  <Text style={styles.filePreviewText}>📎 {tempFile.name}</Text>
                  <Text style={styles.filePreviewText}>Tamaño: {(tempFile.size / 1024 / 1024).toFixed(2)} MB</Text>
                  <Text style={styles.filePreviewText}>Tipo: {tempFile.type}</Text>
                  
                  {/* Vista previa de imagen */}
                  {tempFile.type && tempFile.type.startsWith('image/') && (
                    <View style={styles.imagePreviewContainer}>
                      <Text style={styles.filePreviewText}>📷 Imagen seleccionada:</Text>
                      <Image 
                        source={{ uri: tempFile.uri }} 
                        style={styles.filePreviewImage}
                        resizeMode="cover"
                        onError={(error) => console.log('Error cargando imagen:', error)}
                        onLoad={() => console.log('Imagen cargada correctamente')}
                      />
                    </View>
                  )}
                  
                  {/* Vista previa de video */}
                  {tempFile.type && tempFile.type.startsWith('video/') && (
                    <View style={styles.videoPreviewContainer}>
                      <Text style={styles.filePreviewText}>🎥 Video seleccionado:</Text>
                      <View style={styles.videoPreviewIcon}>
                        <Text style={styles.videoPreviewIconText}>🎥</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
              
              <Text style={styles.evidenceModalLabel}>Descripción (opcional)</Text>
              <TextInput 
                ref={tempTextInputRef}
                style={styles.evidenceTextInput}
                placeholder="Describe la evidencia..."
                multiline={true}
                numberOfLines={4}
                value={tempDescription}
                onChangeText={setTempDescription}
                autoFocus={false}
                blurOnSubmit={false}
                returnKeyType="default"
                editable={true}
                keyboardType="default"
                textContentType="none"
                autoCorrect={false}
                autoCapitalize="none"
                selectTextOnFocus={false}
              />
              
              <View style={styles.evidenceModalButtons}>
                <TouchableOpacity 
                  style={styles.evidenceCancelButton}
                  onPress={handleCancel}
                >
                  <Text style={styles.evidenceCancelText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.evidenceSaveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.evidenceSaveText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  });

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
            style={styles.saveButton}
            onPress={() => {
              Alert.alert(
                'Configuración guardada',
                twoFactorEnabled 
                  ? 'Autenticación de dos pasos habilitada. Recibirás códigos de verificación por correo.'
                  : 'Autenticación de dos pasos deshabilitada.',
                [{ text: 'OK', onPress: () => setSeguridadVisible(false) }]
              );
            }}
          >
            <Text style={styles.saveButtonText}>Guardar configuración</Text>
          </TouchableOpacity>
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
          {evidencias.length > 0 ? (
            evidencias.map((evidencia, index) => (
              <View key={index} style={styles.evidenceItem}>
                <View style={styles.evidenceIcon}>
                  <Text style={styles.evidenceIconText}>
                    {evidencia.tipo === 'video' ? '🎥' : '📷'}
                  </Text>
                </View>
                <View style={styles.evidenceContent}>
                  <Text style={styles.evidenceTitle}>{evidencia.nombre}</Text>
                  <Text style={styles.evidenceSubtitle}>{evidencia.descripcion}</Text>
                  <Text style={styles.evidenceDate}>Fecha: {evidencia.fechaCreacion}</Text>
                  <Text style={styles.evidenceSize}>Tamaño: {evidencia.tamaño}</Text>
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
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📎</Text>
              <Text style={styles.emptyTitle}>Sin evidencias</Text>
              <Text style={styles.emptyText}>
                No tienes evidencias registradas. Agrega evidencias a tus tickets para verlas aquí.
              </Text>
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

          {/* Vista previa de tickets recientes */}
          {tickets.length > 0 && (
            <View style={styles.recentTicketsContainer}>
              <Text style={styles.recentTicketsTitle}>Tickets Recientes</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.recentTicketsScroll}
              >
                {tickets.slice(0, 3).map((ticket, index) => (
                  <View key={index} style={styles.recentTicketCard}>
                    <View style={styles.recentTicketHeader}>
                      <Text style={styles.recentTicketId}>{ticket.id}</Text>
                      <View style={[
                        styles.recentTicketStatus,
                        ticket.estado === 'PENDIENTE' ? styles.recentStatusPending :
                        ticket.estado === 'EN_PROCESO' ? styles.recentStatusInProcess :
                        styles.recentStatusCompleted
                      ]}>
                        <Text style={styles.recentStatusText}>{ticket.estado}</Text>
                      </View>
                    </View>
                    <Text style={styles.recentTicketTitle} numberOfLines={2}>
                      {ticket.titulo}
                    </Text>
                    <Text style={styles.recentTicketDescription} numberOfLines={2}>
                      {ticket.descripcion}
                    </Text>
                    <View style={styles.recentTicketFooter}>
                      <Text style={styles.recentTicketArea}>Área: {ticket.area || 'Sistemas'}</Text>
                      <Text style={styles.recentTicketPriority}>
                        {ticket.prioridad === 'ALTA' ? '🔴' : ticket.prioridad === 'MEDIA' ? '🟡' : '🟢'} {ticket.prioridad}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

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
                onPress={() => setMisTicketsVisible(true)}
              >
                <Text style={styles.actionButtonText}>Abrir</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionSection}>
              <View style={styles.actionSectionContent}>
                <Text style={styles.actionSectionTitle}>Evidencias</Text>
                <Text style={styles.actionSectionCount}>({stats.evidencias})</Text>
              </View>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setEvidenciasVisible(true)}
              >
                <Text style={styles.actionButtonText}>Abrir</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionSection}>
              <View style={styles.actionSectionContent}>
                <Text style={styles.actionSectionTitle}>Notificaciones</Text>
                <Text style={styles.actionSectionCount}>({stats.notificaciones})</Text>
              </View>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setNotificacionesVisible(true)}
              >
                <Text style={styles.actionButtonText}>Abrir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Modales */}
        <MisTicketsModal />
        <NotificacionesModal />
        <EvidenciasModal />
        <SeguridadModal />
        <EvidenceModal />
        
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
                    setEvidenciasVisible(true);
                  }}
                >
                  <Text style={styles.sidebarMenuIcon}>📄</Text>
                  <Text style={styles.sidebarMenuText}>Evidencias</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.sidebarMenuItem}
                  onPress={() => {
                    setSidebarVisible(false);
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
  statNumberRed: {
    color: '#ff4444',
  },
  statNumberOrange: {
    color: '#ff8800',
  },
  statNumberGreen: {
    color: '#00aa00',
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
  actionButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
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
  priorityCompleted: {
    backgroundColor: '#00aa00',
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
  completedInfo: {
    backgroundColor: '#f0f8f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#00aa00',
  },
  completedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00aa00',
    marginBottom: 4,
  },
  completedDate: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
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
  statusPending: {
    backgroundColor: '#ffebee',
  },
  statusInProcess: {
    backgroundColor: '#fff3e0',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e8',
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityHigh: {
    backgroundColor: '#ffebee',
  },
  priorityMedium: {
    backgroundColor: '#fff3e0',
  },
  priorityLow: {
    backgroundColor: '#e8f5e8',
  },
  areaTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  evidenceTag: {
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
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  actionButtonWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  actionButtonTextWhite: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actionButtonTextBlack: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  evidenceButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  evidenceButtonIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  evidenceButtonText: {
    fontSize: 14,
    color: '#666',
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

  // Estilos para tickets recientes
  recentTicketsContainer: {
    marginBottom: 30,
  },
  recentTicketsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingLeft: 5,
  },
  recentTicketsScroll: {
    paddingLeft: 5,
  },
  recentTicketCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  recentTicketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentTicketId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  recentTicketStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recentStatusPending: {
    backgroundColor: '#ffebee',
  },
  recentStatusInProcess: {
    backgroundColor: '#fff3e0',
  },
  recentStatusCompleted: {
    backgroundColor: '#e8f5e8',
  },
  recentStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  recentTicketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    lineHeight: 20,
  },
  recentTicketDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  recentTicketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentTicketArea: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  recentTicketPriority: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },

  // Estilos para el estado actual
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

  // Estilos para botones de acción
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

  // Estilos para el modal de evidencias
  evidenceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  evidenceModalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  evidenceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  evidenceModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  evidenceModalClose: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  evidenceModalContent: {
    padding: 20,
  },
  evidenceModalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  evidenceFileOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  evidenceFileButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  evidenceFileButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  evidenceFileButtonSelected: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  evidenceTextInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    minHeight: 100,
    maxHeight: 120,
    marginBottom: 20,
    flex: 1,
  },
  evidenceModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  evidenceCancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  evidenceCancelText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  evidenceSaveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  evidenceSaveText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  evidenceSaveButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },

  // Estilos para vista previa de archivos
  filePreviewContainer: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filePreviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filePreviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  filePreviewVideo: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  filePreviewVideoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  filePreviewVideoSize: {
    fontSize: 12,
    color: '#666',
  },
  filePreviewText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  videoPreviewContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  videoPreviewIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#333',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  videoPreviewIconText: {
    fontSize: 24,
    color: '#fff',
  },

  // Estilos para evidencia deshabilitada
  evidenceDisabledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    opacity: 0.6,
  },
  evidenceDisabledIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  evidenceDisabledText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },

  // Estilos para modal de seguridad
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
});