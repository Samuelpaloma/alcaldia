import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from './navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { webSocketService } from '../services/WebSocketService';

type TicketTrackingRouteProp = RouteProp<RootStackParamList, 'TicketTracking'>;

interface TicketInfo {
  id: number;
  asunto: string;
  descripcion: string;
  categoria: string;
  estado: string;
  prioridad: string;
  tecnicoAsignado?: string;
  tecnicoNombre?: string;
  tecnicoEmail?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadorEmail?: string;
  creadorNombre?: string;
  ubicacion?: string;
  historialAsignaciones?: HistorialItem[];
  comentarios?: ChatMessage[];
  evidencias?: EvidenciaItem[];
}

interface HistorialItem {
  id: number;
  estado: string;
  comentarios?: string;
  fechaCambio: string;
  cambiadoPor: string;
  tecnicoNombre?: string;
  tipoOperacion?: string;
}

interface ChatMessage {
  id: number;
  autor: string;
  mensaje: string;
  fechaCreacion: string;
  esTecnico?: boolean;
}

interface EvidenciaItem {
  idEvidencia: number;
  nombreArchivo: string;
  nombreCompletoArchivo: string;
  tipoArchivo: string;
  tamañoArchivo: number;
  fechaSubida: string;
  subidoPor: {
    nombre: string;
    email: string;
  };
}

export default function TicketTrackingScreen() {
  const route = useRoute<TicketTrackingRouteProp>();
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { ticketId } = route.params;

  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [evidencias, setEvidencias] = useState<EvidenciaItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'historial' | 'chat' | 'evidencias'>('info');
  const [userEmail, setUserEmail] = useState<string>('');

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadInitialData();
    // setupWebSocket(); // Temporalmente deshabilitado hasta que el backend tenga WebSocket
    
    return () => {
      // Limpiar WebSocket al desmontar
      // webSocketService.unsubscribeFromTicket(ticketId);
    };
  }, [ticketId]);

  // Polling automático para mensajes en tiempo real (versión simple)
  useEffect(() => {
    if (ticketId) {
      console.log('🔄 [TÉCNICO] Iniciando polling automático para ticket:', ticketId);
      
      const interval = setInterval(async () => {
        // Solo hacer polling si no se está enviando un mensaje
        if (!isSending) {
          console.log('🔄 [TÉCNICO] Polling mensajes automático...', new Date().toLocaleTimeString());
          try {
            // Usar la función normal de carga de mensajes para asegurar que funcione
            await loadMessages();
            await loadHistorial();
          } catch (error) {
            console.error('🔄 [TÉCNICO] Error en polling automático:', error);
          }
        } else {
          console.log('🔄 [TÉCNICO] Polling pausado - enviando mensaje...');
        }
      }, 5000); // Cada 5 segundos para ser más frecuente

      return () => {
        console.log('🔄 [TÉCNICO] Deteniendo polling automático');
        clearInterval(interval);
      };
    }
  }, [ticketId, isSending]);

  useEffect(() => {
    // Auto-scroll siempre al final cuando hay mensajes en el chat
    if (activeTab === 'chat' && messages.length > 0 && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [activeTab, messages]); // Cuando cambia el tab o los mensajes

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar información del usuario primero
      await loadUserInfo();
      
      // Intentar cargar datos del backend
      const loadPromises = [
        loadTicketInfo(),
        loadMessages(),
        loadHistorial(),
        loadEvidencias()
      ];
      
      // Ejecutar todas las cargas en paralelo, pero no fallar si alguna falla
      const results = await Promise.allSettled(loadPromises);
      
      // Verificar si alguna carga falló
      const failedLoads = results.filter(result => result.status === 'rejected');
      
      if (failedLoads.length > 0) {
        console.warn('⚠️ [BACKEND] Algunas cargas fallaron:', failedLoads);
        
        // Si no se pudo cargar la información del ticket, mostrar error
        const ticketLoadResult = results[0];
        if (ticketLoadResult.status === 'rejected') {
          console.error('❌ [TICKET] No se pudo cargar la información del ticket');
          return; // No mostrar datos de ejemplo si no se puede cargar el ticket real
        }
      }
      
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserInfo = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        const userData = JSON.parse(userInfo);
        setUserEmail(userData.email || '');
      }
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
    }
  };

  const setupWebSocket = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userInfo = await AsyncStorage.getItem('userInfo');
      
      if (token && userInfo) {
        const userData = JSON.parse(userInfo);
        const email = userData.email;
        
        // Intentar conectar WebSocket (opcional)
        try {
          if (!webSocketService.isConnected()) {
            await webSocketService.connect(token, email);
          }
          
          // Suscribirse a actualizaciones del ticket
          webSocketService.subscribeToTicket(ticketId);
          
          // Configurar listeners
          webSocketService.on('ticketUpdate', handleTicketUpdate);
          webSocketService.on('chatMessage', handleChatMessage);
          webSocketService.on('connected', handleWebSocketConnected);
          webSocketService.on('disconnected', handleWebSocketDisconnected);
          webSocketService.on('error', handleWebSocketError);
        } catch (wsError) {
          console.warn('⚠️ WebSocket no disponible, continuando sin tiempo real:', wsError);
          // Continuar sin WebSocket - la app funcionará sin tiempo real
        }
      }
    } catch (error) {
      console.error('Error configurando WebSocket:', error);
    }
  };

  const handleTicketUpdate = (data: any) => {
    console.log('🔄 [WebSocket] Actualización de ticket recibida:', data);
    
    // Actualizar información del ticket
    if (data.ticketId === ticketId) {
      setTicketInfo(prev => prev ? {
        ...prev,
        estado: data.estado || prev.estado,
        tecnicoAsignado: data.tecnicoAsignado || prev.tecnicoAsignado,
        fechaActualizacion: data.timestamp || prev.fechaActualizacion
      } : prev);
      
      // Recargar historial si hay cambios de estado
      if (data.estado) {
        loadHistorial();
      }
    }
  };

  const handleChatMessage = (data: any) => {
    console.log('💬 [WebSocket] Mensaje de chat recibido:', data);
    
    if (data.ticketId === ticketId) {
      const newMessage: ChatMessage = {
        id: Date.now(), // ID temporal
        autor: data.autor,
        mensaje: data.mensaje,
        fechaCreacion: data.fechaCreacion,
        esTecnico: data.esTecnico
      };
      
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const handleWebSocketConnected = () => {
    console.log('✅ [WebSocket] Conectado exitosamente');
  };

  const handleWebSocketDisconnected = () => {
    console.log('🔌 [WebSocket] Desconectado');
  };

  const handleWebSocketError = (error: any) => {
    console.error('❌ [WebSocket] Error:', error);
  };

  const loadTicketInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('🎫 [TICKET] Cargando información del ticket:', ticketId);
      
      // Usar el endpoint correcto para técnicos
      const response = await fetch(`http://localhost:8080/api/tecnico/tickets/${ticketId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [TICKET] Información del ticket cargada:', data);
        
        // Mapear la respuesta del backend al formato esperado
        const ticketInfo = {
          id: data.idTicket || data.id,
          asunto: data.consulta || data.asunto || `Ticket #${ticketId}`,
          descripcion: data.descripcion || data.consulta || 'Sin descripción',
          categoria: data.categoria || 'Sin categoría',
          estado: data.estado || 'PENDIENTE',
          prioridad: data.prioridad || 'MEDIA',
          tecnicoAsignado: data.tecnicoAsignado || 'Sin asignar',
          fechaCreacion: data.fechaCreacion || new Date().toISOString(),
          fechaActualizacion: data.fechaActualizacion || new Date().toISOString(),
          ubicacion: data.ubicacion || 'Sin ubicación',
          creador: data.creador || { nombre: 'Usuario' },
          evidencias: data.evidencias || [],
          historial: data.historial || []
        };
        
        setTicketInfo(ticketInfo);
      } else {
        const errorText = await response.text();
        console.error('❌ [TICKET] Error cargando información del ticket:', response.status, errorText);
        
        // Si es error de permisos, mostrar mensaje específico
        if (response.status === 400) {
          Alert.alert(
            'Sin Permisos', 
            'No tienes permisos para ver este ticket. Solo puedes ver tickets asignados a ti.',
            [
              {
                text: 'Volver al Dashboard',
                onPress: () => navigation.goBack()
              }
            ]
          );
        } else {
          Alert.alert('Error', `No se pudo cargar la información del ticket: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('❌ [TICKET] Error cargando información del ticket:', error);
      Alert.alert('Error', 'Error de conexión al cargar el ticket');
    }
  };

  const loadMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/tickets/${ticketId}/comentarios`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [CHAT] Mensajes cargados:', data);
        
        // Mapear los comentarios al formato esperado
        const mappedMessages = (data || []).map((comment: any) => ({
          id: comment.id,
          autor: comment.autor || comment.nombreUsuario || 'Usuario',
          mensaje: comment.mensaje || comment.contenido,
          fechaCreacion: comment.fechaCreacion || comment.fecha,
          esTecnico: comment.esTecnico || false
        }));
        
        // Ordenar mensajes por fecha (del más antiguo al más nuevo - orden ascendente)
        const mensajesOrdenados = mappedMessages.sort((a, b) => {
          const fechaA = new Date(a.fechaCreacion).getTime();
          const fechaB = new Date(b.fechaCreacion).getTime();
          return fechaA - fechaB; // Orden ascendente (más antiguo primero, más nuevo al final)
        });
        
        console.log('✅ [TÉCNICO] Mensajes ordenados (ascendente):', mensajesOrdenados.length);
        setMessages(mensajesOrdenados);
        
        // Scroll al final después de cargar mensajes
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      } else {
        console.warn('⚠️ [CHAT] No se pudieron cargar los mensajes:', response.status);
        setMessages([]); // Inicializar con array vacío
      }
    } catch (error) {
      console.error('❌ [CHAT] Error cargando mensajes:', error);
      setMessages([]); // Inicializar con array vacío
    }
  };

  // Función para cargar mensajes de forma suave (comparación por contenido)
  const loadMessagesSmoothly = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/tickets/${ticketId}/comentarios`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔄 [TÉCNICO] Polling - Datos recibidos:', data);
        
        const newMessages = (data || []).map((comment: any) => ({
          id: comment.id || `${comment.fechaCreacion}-${comment.mensaje}`,
          autor: comment.autor || comment.nombreUsuario || 'Usuario',
          mensaje: comment.mensaje || comment.contenido,
          fechaCreacion: comment.fechaCreacion || comment.fecha,
          esTecnico: comment.esTecnico || false
        }));

        // Ordenar mensajes por fecha (del más antiguo al más nuevo - orden ascendente)
        const mensajesOrdenados = newMessages.sort((a, b) => {
          const fechaA = new Date(a.fechaCreacion).getTime();
          const fechaB = new Date(b.fechaCreacion).getTime();
          return fechaA - fechaB; // Orden ascendente (más antiguo primero, más nuevo al final)
        });

        // Comparar por cantidad de mensajes primero (más simple y confiable)
        setMessages(prevMessages => {
          if (mensajesOrdenados.length !== prevMessages.length) {
            console.log('🔄 [TÉCNICO] Cambio en cantidad de mensajes detectado');
            console.log('🔄 [TÉCNICO] Mensajes anteriores:', prevMessages.length);
            console.log('🔄 [TÉCNICO] Mensajes nuevos:', mensajesOrdenados.length);
            
            // Scroll al final cuando hay cambios
            setTimeout(() => {
              if (scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd({ animated: true });
              }
            }, 100);
            
            return mensajesOrdenados;
          } else {
            // Si la cantidad es igual, comparar por contenido
            const prevContent = prevMessages.map(msg => `${msg.mensaje}-${msg.fechaCreacion}`).join('|');
            const newContent = mensajesOrdenados.map(msg => `${msg.mensaje}-${msg.fechaCreacion}`).join('|');
            
            if (prevContent !== newContent) {
              console.log('🔄 [TÉCNICO] Cambio en contenido de mensajes detectado');
              
              // Scroll al final cuando hay cambios
              setTimeout(() => {
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollToEnd({ animated: true });
                }
              }, 100);
              
              return mensajesOrdenados;
            } else {
              console.log('🔄 [TÉCNICO] No hay cambios en los mensajes');
              return prevMessages;
            }
          }
        });
      } else {
        console.warn('⚠️ [TÉCNICO] Error en polling:', response.status);
      }
    } catch (error) {
      console.error('❌ [TÉCNICO] Error cargando mensajes suavemente:', error);
    }
  };

  const loadHistorial = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      // Intentar primero con el endpoint específico del ticket
      let response = await fetch(`http://localhost:8080/api/tickets/${ticketId}/historial`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      // Si no existe, usar el endpoint de asignaciones
      if (!response.ok && response.status === 404) {
        console.log('🔄 [HISTORIAL] Endpoint específico no encontrado, intentando asignaciones...');
        response = await fetch(`http://localhost:8080/api/asignaciones/ticket/${ticketId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
      }

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [HISTORIAL] Historial cargado:', data);
        
        // Mapear el historial al formato esperado
        const mappedHistorial = (data || []).map((item: any) => ({
          id: item.id || item.idAsignacion,
          fecha: item.fechaAsignacion || item.fechaCreacion || item.fecha,
          accion: item.tipoOperacion || item.accion || 'Cambio de estado',
          descripcion: item.comentario || item.descripcion || `${item.estadoAnterior} → ${item.estadoNuevo}`,
          usuario: item.asignadoPor || item.usuario || 'Sistema',
          estadoAnterior: item.estadoAnterior,
          estadoNuevo: item.estadoNuevo,
          tecnico: item.tecnicoNombre || item.tecnicoAsignado
        }));
        
        setHistorial(mappedHistorial);
      } else {
        console.warn('⚠️ [HISTORIAL] No se pudo cargar el historial:', response.status);
        setHistorial([]); // Inicializar con array vacío
      }
    } catch (error) {
      console.error('❌ [HISTORIAL] Error cargando historial:', error);
      setHistorial([]); // Inicializar con array vacío
    }
  };

  const loadEvidencias = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/evidencias/ticket/${ticketId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvidencias(data || []);
      } else {
        console.warn('⚠️ [EVIDENCIAS] No se pudieron cargar las evidencias:', response.status);
        setEvidencias([]); // Inicializar con array vacío
      }
    } catch (error) {
      console.error('❌ [EVIDENCIAS] Error cargando evidencias:', error);
      setEvidencias([]); // Inicializar con array vacío
    }
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  // Función para verificar si el usuario está cerca del final del scroll
  const isNearBottom = () => {
    // Esta función se puede usar para determinar si hacer scroll automático
    return true; // Por ahora, siempre permitir scroll cuando se envía un mensaje
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const token = await AsyncStorage.getItem('authToken');
      const userInfo = await AsyncStorage.getItem('userInfo');
      
      if (!userInfo) {
        Alert.alert('Error', 'No se encontró información del usuario');
        return;
      }
      
      const userData = JSON.parse(userInfo);
      
      const response = await fetch(`http://localhost:8080/api/tickets/${ticketId}/comentarios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mensaje: newMessage.trim(),
          usuario_id: userData.id || userData.idUsuario
        })
      });

      if (response.ok) {
        const newComment = await response.json();
        console.log('✅ [CHAT] Mensaje enviado:', newComment);
        
        // Agregar el mensaje a la lista local inmediatamente
        const messageText = newMessage.trim();
        const localMessage = {
          id: newComment.id || Date.now(),
          autor: userData.nombre || 'Tú',
          mensaje: messageText,
          fechaCreacion: new Date().toISOString(),
          esTecnico: true
        };
        
        console.log('✅ [TÉCNICO] Agregando mensaje local:', localMessage);
        setMessages(prev => {
          const newMessages = [...prev, localMessage];
          console.log('✅ [TÉCNICO] Total mensajes después de agregar:', newMessages.length);
          return newMessages;
        });
        
        setNewMessage('');
        
        // Scroll al final solo cuando se envía un mensaje
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
        
        // Recargar mensajes después de un delay para sincronizar con el servidor
        setTimeout(async () => {
          try {
            console.log('🔄 [TÉCNICO] Sincronizando mensajes después del envío...');
            await loadMessages();
          } catch (error) {
            console.error('❌ [TÉCNICO] Error sincronizando mensajes:', error);
          }
        }, 2000); // 2 segundos para dar tiempo al servidor
      } else {
        const errorText = await response.text();
        console.error('❌ [CHAT] Error enviando mensaje:', response.status, errorText);
        Alert.alert('Error', 'No se pudo enviar el mensaje');
        // Restaurar el mensaje si falla
        setNewMessage(messageText);
      }
    } catch (error) {
      console.error('❌ [CHAT] Error enviando mensaje:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setIsSending(false);
    }
  };

  const cambiarEstadoTicket = async (nuevoEstado: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:8080/api/tecnico/tickets/cambiar-estado`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: ticketId,
          nuevoEstado: nuevoEstado,
          comentarios: `Estado cambiado a ${nuevoEstado}`
        })
      });

      if (response.ok) {
        Alert.alert('Éxito', `Estado cambiado a ${nuevoEstado}`);
        // Recargar datos
        await loadInitialData();
      } else {
        Alert.alert('Error', 'No se pudo cambiar el estado');
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return '#ff9800';
      case 'ASIGNADO': return '#2196f3';
      case 'EN_PROCESO': return '#ff5722';
      case 'TERMINADO': return '#4caf50';
      case 'CERRADO': return '#9e9e9e';
      default: return '#666';
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad?.toLowerCase()) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800';
      case 'baja': return '#4caf50';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTicketInfo = () => (
    <View style={styles.tabContent}>
      {ticketInfo && (
        <>
          {/* Información básica */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Información del ticket</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID:</Text>
              <Text style={styles.infoValue}>#{ticketInfo.id}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Asunto:</Text>
              <Text style={styles.infoValue}>{ticketInfo.asunto}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Descripción:</Text>
              <Text style={styles.infoValue}>{ticketInfo.descripcion}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Categoría:</Text>
              <Text style={styles.infoValue}>{ticketInfo.categoria}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ubicación:</Text>
              <Text style={styles.infoValue}>{ticketInfo.ubicacion || 'No especificada'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Prioridad:</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPrioridadColor(ticketInfo.prioridad) }]}>
                <Text style={styles.priorityText}>{ticketInfo.prioridad}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estado:</Text>
              <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(ticketInfo.estado) }]}>
                <Text style={styles.statusText}>{ticketInfo.estado}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Técnico:</Text>
              <Text style={styles.infoValue}>{ticketInfo.tecnicoAsignado || 'Sin asignar'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Creado:</Text>
              <Text style={styles.infoValue}>{formatDate(ticketInfo.fechaCreacion)}</Text>
            </View>
          </View>

          {/* Acciones del técnico */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Acciones</Text>
            
            {ticketInfo.estado === 'PENDIENTE' && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => cambiarEstadoTicket('EN_PROCESO')}
              >
                <Text style={styles.actionButtonText}>Aceptar Ticket</Text>
              </TouchableOpacity>
            )}
            
            {ticketInfo.estado === 'EN_PROCESO' && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => cambiarEstadoTicket('TERMINADO')}
              >
                <Text style={styles.actionButtonText}>Finalizar Ticket</Text>
              </TouchableOpacity>
            )}
            
            {ticketInfo.estado === 'TERMINADO' && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.closeButton]}
                onPress={() => cambiarEstadoTicket('CERRADO')}
              >
                <Text style={styles.actionButtonText}>Cerrar Ticket</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );

  const renderHistorial = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Historial del Ticket</Text>
      {historial.length > 0 ? (
        <ScrollView style={styles.historialList}>
          {historial.map((item, index) => (
            <View key={item.id || index} style={styles.historialItem}>
              <View style={styles.historialDot} />
              <View style={styles.historialContent}>
                <Text style={styles.historialTitle}>{item.accion || item.estado}</Text>
                {item.descripcion && (
                  <Text style={styles.historialComment}>{item.descripcion}</Text>
                )}
                {item.estadoAnterior && item.estadoNuevo && (
                  <View style={styles.estadoChange}>
                    <Text style={styles.estadoAnterior}>{item.estadoAnterior}</Text>
                    <Text style={styles.estadoArrow}>→</Text>
                    <Text style={styles.estadoNuevo}>{item.estadoNuevo}</Text>
                  </View>
                )}
                <Text style={styles.historialDate}>{formatDate(item.fecha || item.fechaCambio)}</Text>
                <Text style={styles.historialAuthor}>Por: {item.usuario || item.cambiadoPor}</Text>
                {item.tecnico && (
                  <Text style={styles.historialTecnico}>Técnico: {item.tecnico}</Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No hay historial disponible</Text>
        </View>
      )}
    </View>
  );

  const renderChat = () => (
    <View style={styles.tabContent}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => {
          const isMyMessage = message.autor === userEmail || message.esTecnico;
          return (
            <View key={message.id || index} style={[
              styles.messageContainer,
              isMyMessage ? styles.myMessage : styles.otherMessage
            ]}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageAuthor}>
                  {isMyMessage ? 'Tú' : message.autor}
                </Text>
                {message.esTecnico && (
                  <Text style={styles.technicianBadge}>Técnico</Text>
                )}
              </View>
              <Text style={styles.messageText}>{message.mensaje}</Text>
              <Text style={styles.messageTime}>{formatDate(message.fechaCreacion)}</Text>
            </View>
          );
        })}
      </ScrollView>
      
      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={isSending || !newMessage.trim()}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Enviar</Text>
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.pollingIndicator}>
        💬 Los mensajes se actualizan automáticamente cada 5 segundos
      </Text>
    </View>
  );

  const renderEvidencias = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Evidencias</Text>
      {evidencias.length > 0 ? (
        <ScrollView style={styles.evidenciasList}>
          {evidencias.map((evidencia, index) => (
            <View key={evidencia.idEvidencia || index} style={styles.evidenciaItem}>
              <View style={styles.evidenciaIcon}>
                <Text style={styles.evidenciaIconText}>
                  {evidencia.tipoArchivo?.startsWith('image/') ? '🖼️' : 
                   evidencia.tipoArchivo?.startsWith('video/') ? '🎥' : '📄'}
                </Text>
              </View>
              <View style={styles.evidenciaContent}>
                <Text style={styles.evidenciaTitle}>{evidencia.nombreCompletoArchivo}</Text>
                <Text style={styles.evidenciaSubtitle}>
                  Subido por: {evidencia.subidoPor.nombre}
                </Text>
                <Text style={styles.evidenciaDate}>
                  {formatDate(evidencia.fechaSubida)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No hay evidencias disponibles</Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando ticket...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Si no hay información del ticket, mostrar mensaje de error
  if (!ticketInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seguimiento del Ticket</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ No se pudo cargar el ticket</Text>
          <Text style={styles.errorMessage}>
            No tienes permisos para ver este ticket o el ticket no existe.
          </Text>
          <Text style={styles.errorSubMessage}>
            Solo puedes ver tickets que te han sido asignados.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Volver al Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket #{ticketId}</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
            📋 Info
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'historial' && styles.activeTab]}
          onPress={() => setActiveTab('historial')}
        >
          <Text style={[styles.tabText, activeTab === 'historial' && styles.activeTabText]}>
            📅 Historial
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
            💬 Chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'evidencias' && styles.activeTab]}
          onPress={() => setActiveTab('evidencias')}
        >
          <Text style={[styles.tabText, activeTab === 'evidencias' && styles.activeTabText]}>
            📎 Evidencias
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'info' && renderTicketInfo()}
        {activeTab === 'historial' && renderHistorial()}
        {activeTab === 'chat' && renderChat()}
        {activeTab === 'evidencias' && renderEvidencias()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 18,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  completeButton: {
    backgroundColor: '#FF9800',
  },
  closeButton: {
    backgroundColor: '#9E9E9E',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historialList: {
    flex: 1,
  },
  historialItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  historialDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    marginRight: 12,
    marginTop: 6,
  },
  historialContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  historialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  historialComment: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  historialDate: {
    fontSize: 12,
    color: '#999',
  },
  historialAuthor: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
    maxHeight: 400,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 12,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
    borderRadius: 16,
    padding: 12,
  },
  messageAuthor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pollingIndicator: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  evidenciasList: {
    flex: 1,
  },
  evidenciaItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  evidenciaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  evidenciaIconText: {
    fontSize: 20,
  },
  evidenciaContent: {
    flex: 1,
  },
  evidenciaTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  evidenciaSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  evidenciaDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  errorSubMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  estadoChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  estadoAnterior: {
    fontSize: 12,
    color: '#FF6B6B',
    backgroundColor: '#FFE0E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  estadoArrow: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 8,
  },
  estadoNuevo: {
    fontSize: 12,
    color: '#4ECDC4',
    backgroundColor: '#E0F7F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historialTecnico: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
    marginTop: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  technicianBadge: {
    fontSize: 10,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    fontWeight: '600',
  },
});
