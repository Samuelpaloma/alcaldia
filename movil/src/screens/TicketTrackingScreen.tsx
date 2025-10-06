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
  Modal,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from './navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { webSocketService } from '../services/WebSocketService';
import EvidenceModal from './components/EvidenceModal';
import { tecnicoAPI, ticketsAPI, evidenciasAPI, Ticket, Comment, Evidence, API_CONFIG } from '../config/api';

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
  tecnicoEscalado?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadorEmail?: string;
  creadorNombre?: string;
  ubicacion?: string;
  historialAsignaciones?: HistorialItem[];
  comentarios?: ChatMessage[];
  evidencias?: EvidenciaItem[];
  // Permisos del técnico actual
  puedeCambiarEstado?: boolean;
  esTecnicoEscalado?: boolean;
  rolTecnico?: string; // "ASIGNADO", "ESCALADO", "ORIGINAL"
}

interface HistorialItem {
  id: number | string;
  estado?: string;
  comentarios?: string;
  fechaCambio?: string;
  cambiadoPor?: string;
  tecnicoNombre?: string;
  tipoOperacion?: string;
  // Campos adicionales para el historial completo
  fecha?: string;
  accion?: string;
  descripcion?: string;
  usuario?: string;
  esCreacion?: boolean;
  esAsignacion?: boolean;
  esEstadoActual?: boolean;
  estadoActual?: string;
  activa?: boolean;
  tecnico?: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  observaciones?: string;
}

interface ChatMessage {
  id: number;
  autor: string;
  mensaje: string;
  fechaCreacion: string;
  esTecnico?: boolean;
  tipoAutor?: string;
  autorEmail?: string;
}

interface EvidenciaItem {
  // Campos de evidencias (tabla evidencias)
  idEvidencia?: number;
  ticketId?: number;
  tipoEvidencia?: string;
  tipoArchivo?: string;
  descripcion?: string;
  nombreArchivo?: string;
  nombreCompletoArchivo?: string;
  extensionArchivo?: string;
  tamanioArchivo?: number;
  tamañoArchivo?: number;
  tamanioFormateado?: string;
  urlArchivo?: string;
  fechaSubida?: string;
  subidoPorNombre?: string;
  subidoPorEmail?: string;
  subidoPor?: string; // Para archivos de chat (tabla archivos_ticket)
  subidoPorObject?: {
    nombre: string;
    email: string;
  };
  // Campos de archivos (tabla archivos_ticket)
  id?: number;
  idArchivo?: number;
  nombreCompleto?: string;
  rutaArchivo?: string;
  extension?: string;
  tipoMime?: string;
  tamano?: number;
  esImagen?: boolean;
  esPDF?: boolean;
  esVideo?: boolean;
  comentario?: string;
}

export default function TicketTrackingScreen() {
  const route = useRoute<TicketTrackingRouteProp>();
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { ticketId } = route.params;

  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [evidencias, setEvidencias] = useState<EvidenciaItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLocalMessages, setHasLocalMessages] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'historial' | 'chat' | 'evidencias'>('info');
  const [userEmail, setUserEmail] = useState<string>('');
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'chat' | 'finales'>('chat');
  const [evidenciasChat, setEvidenciasChat] = useState<EvidenciaItem[]>([]);
  const [evidenciasFinales, setEvidenciasFinales] = useState<EvidenciaItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showUploadEvidenceModal, setShowUploadEvidenceModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [archivoEnPreview, setArchivoEnPreview] = useState<EvidenciaItem | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);

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
      console.log('🎫 [TICKET] Cargando información del ticket:', ticketId);
      
      const data = await tecnicoAPI.getTicketDetail(ticketId);
      console.log('✅ [TICKET] Información del ticket cargada:', data);
      
      // Mapear la respuesta del backend al formato esperado
      const ticketInfo = {
        id: data.id,
        asunto: data.titulo || `Ticket #${ticketId}`,
        descripcion: data.descripcion || 'Sin descripción',
        categoria: data.categoria || 'Sin categoría',
        estado: data.estado || 'PENDIENTE',
        prioridad: data.prioridad || 'MEDIA',
        tecnicoAsignado: data.tecnicoNombre || 'Sin asignar',
        tecnicoNombre: data.tecnicoNombre,
        tecnicoEscalado: data.tecnicoEscalado?.nombre || null,
        creadorNombre: data.creadorNombre,
        fechaCreacion: data.fechaCreacion || new Date().toISOString(),
        fechaActualizacion: data.fechaActualizacion || new Date().toISOString(),
        ubicacion: data.ubicacion || 'Sin ubicación',
        creador: data.usuario || { nombre: 'Usuario' },
        evidencias: [],
        historial: [],
        historialEstados: [],
        // Usar los campos del backend directamente
        puedeCambiarEstado: data.puedeCambiarEstado ?? true,
        esTecnicoEscalado: data.esTecnicoEscalado ?? false,
        rolTecnico: data.rolTecnico || 'ASIGNADO'
      };
      
      setTicketInfo(ticketInfo);
      
    } catch (error: any) {
      console.error('❌ [TICKET] Error cargando información del ticket:', error);
      const errorMessage = error?.message || 'Error de conexión al cargar el ticket';
      setErrorMessage(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  const loadMessages = async () => {
    try {
      console.log('💬 [CHAT] Cargando mensajes para ticket:', ticketId);
      
      const data = await ticketsAPI.getComments(ticketId);
      console.log('✅ [CHAT] Mensajes cargados:', data);
      console.log('✅ [CHAT] Primer comentario completo:', data?.[0]);
      console.log('✅ [CHAT] Campos del primer comentario:', data?.[0] ? Object.keys(data[0]) : 'No hay comentarios');
      
      // Mapear los comentarios al formato esperado
      const mappedMessages = (data || []).map((comment: Comment, index) => {
        console.log(`🔍 [CHAT] Mapeando comentario ${index}:`, {
          id: comment.id,
          contenido: comment.contenido,
          contenidoLength: comment.contenido?.length,
          mensaje: comment.mensaje,
          mensajeLength: comment.mensaje?.length,
          usuario: comment.usuario,
          fechaCreacion: comment.fechaCreacion
        });
        
        // Determinar si es técnico basado en el tipo de usuario o autor
        const esTecnico = comment.usuario?.tipoUsuario === 'TECNICO' || 
                         comment.tipoAutor === 'TECNICO' || 
                         comment.esTecnico === true;
        
        // Intentar obtener el contenido del mensaje de diferentes campos posibles
        const contenido = comment.contenido || comment.mensaje || '';
        
        const mappedMessage = {
          id: comment.id,
          autor: comment.usuario?.nombre || comment.autor || 'Usuario',
          mensaje: contenido,
          fechaCreacion: comment.fechaCreacion,
          esTecnico: esTecnico,
          tipoAutor: comment.tipoAutor || 'USUARIO',
          autorEmail: comment.usuario?.email || comment.autorEmail || ''
        };
        
        console.log(`🔍 [CHAT] Mensaje mapeado ${index}:`, {
          id: mappedMessage.id,
          autor: mappedMessage.autor,
          mensaje: mappedMessage.mensaje,
          mensajeLength: mappedMessage.mensaje?.length,
          esTecnico: mappedMessage.esTecnico
        });
        
        return mappedMessage;
      });
      
      // Ordenar mensajes por fecha (del más antiguo al más nuevo - orden ascendente)
      const mensajesOrdenados = mappedMessages.sort((a: ChatMessage, b: ChatMessage) => {
        const fechaA = new Date(a.fechaCreacion).getTime();
        const fechaB = new Date(b.fechaCreacion).getTime();
        return fechaA - fechaB; // Orden ascendente (más antiguo primero, más nuevo al final)
      });
      
      console.log('✅ [TÉCNICO] Mensajes ordenados (ascendente):', mensajesOrdenados.length);
      
      // Solo actualizar si hay una diferencia significativa en la cantidad de mensajes
      // o si no estamos enviando un mensaje actualmente
      setMessages(prevMessages => {
        if (isSending || hasLocalMessages) {
          console.log('🔄 [TÉCNICO] No actualizando mensajes - enviando mensaje o hay mensajes locales pendientes');
          return prevMessages; // Mantener mensajes actuales si estamos enviando o hay mensajes locales
        }
        
        // Si hay una diferencia significativa, actualizar
        if (Math.abs(mensajesOrdenados.length - prevMessages.length) > 0) {
          console.log('🔄 [TÉCNICO] Actualizando mensajes - diferencia detectada');
          return mensajesOrdenados;
        }
        
        console.log('🔄 [TÉCNICO] No hay cambios significativos en los mensajes');
        return prevMessages; // Mantener mensajes actuales
      });
      
      // Scroll al final después de cargar mensajes
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    } catch (error: any) {
      console.error('❌ [CHAT] Error cargando mensajes:', error);
      // Solo limpiar mensajes si no estamos enviando uno
      if (!isSending) {
        setMessages([]); // Inicializar con array vacío
      }
    }
  };

  // Función para cargar mensajes de forma suave (comparación por contenido)
  const loadMessagesSmoothly = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const data = await ticketsAPI.getComments(ticketId);
      console.log('🔄 [TÉCNICO] Polling - Datos recibidos:', data);
        
        const newMessages = (data || []).map((comment: any) => ({
          id: comment.id || `${comment.fechaCreacion}-${comment.mensaje}`,
          autor: comment.autor || comment.nombreUsuario || 'Usuario',
          mensaje: comment.mensaje || comment.contenido,
          fechaCreacion: comment.fechaCreacion || comment.fecha,
          esTecnico: comment.esTecnico || false
        }));

        // Ordenar mensajes por fecha (del más antiguo al más nuevo - orden ascendente)
        const mensajesOrdenados = newMessages.sort((a: ChatMessage, b: ChatMessage) => {
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
            const prevContent = prevMessages.map((msg: ChatMessage) => `${msg.mensaje}-${msg.fechaCreacion}`).join('|');
            const newContent = mensajesOrdenados.map((msg: ChatMessage) => `${msg.mensaje}-${msg.fechaCreacion}`).join('|');
            
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
    } catch (error) {
      console.error('❌ [TÉCNICO] Error cargando mensajes suavemente:', error);
    }
  };

  const loadHistorial = async () => {
    try {
      console.log('📜 [HISTORIAL] ===== INICIANDO loadHistorial =====');
      console.log('📜 [HISTORIAL] Ticket ID:', ticketId);
      const token = await AsyncStorage.getItem('authToken');
      console.log('📜 [HISTORIAL] Token presente:', !!token);
      
      // Intentar primero con el endpoint específico del ticket
      console.log('📜 [HISTORIAL] Intentando endpoint: /api/tecnico/tickets/${ticketId}/historial');
      const data = await tecnicoAPI.getTicketHistory(ticketId);
      console.log('✅ [HISTORIAL] Historial cargado, estructura:', data);
        console.log('📜 [HISTORIAL] Datos de historial de estados:', JSON.stringify(data, null, 2));
        
        // Procesar historial de estados del backend
        const historialCompleto: any[] = [];
        
        // El backend devuelve un objeto con historialEstados e historialAsignaciones
        const historialEstados = data.historialEstados || [];
        const historialAsignaciones = data.historialAsignaciones || [];
        
        console.log('📜 [HISTORIAL] Estados encontrados:', historialEstados.length);
        console.log('📜 [HISTORIAL] Asignaciones encontradas:', historialAsignaciones.length);
        
        if (historialEstados && Array.isArray(historialEstados)) {
          historialEstados.forEach((item: any, index: number) => {
            console.log('🔄 [HISTORIAL-MAP] Procesando evento de estado:', item);
            
            // Crear descripción más detallada con el usuario
            let descripcion = `${item.estadoAnterior || 'N/A'} → ${item.estadoNuevo || 'N/A'}`;
            if (item.comentario) {
              descripcion += `\nComentario: ${item.comentario}`;
            }
            if (item.observaciones) {
              descripcion += `\nObservaciones: ${item.observaciones}`;
            }
            
            historialCompleto.push({
              id: item.idHistorial || `estado-${index}`,
              fecha: item.fechaCambio,
              fechaCambio: item.fechaCambio,
              accion: 'Cambio de estado',
              descripcion: `${item.estadoAnterior || 'N/A'} → ${item.estadoNuevo || 'N/A'} por ${item.cambiadoPor || 'Usuario'}`,
              usuario: item.cambiadoPor || 'Usuario',
              cambiadoPor: item.cambiadoPor || 'Usuario',
              cambiadoPorEmail: item.cambiadoPorEmail || '',
              comentario: item.comentario,
              observaciones: item.observaciones,
              tipoOperacion: 'CAMBIO_ESTADO',
              estadoAnterior: item.estadoAnterior,
              estadoNuevo: item.estadoNuevo
            });
          });
        }
        
        // Procesar historial de asignaciones
        if (historialAsignaciones && Array.isArray(historialAsignaciones)) {
          historialAsignaciones.forEach((item: any, index: number) => {
            console.log('🔄 [HISTORIAL-ASIGNACION] Procesando asignación:', item);
            
            historialCompleto.push({
              id: `asignacion-${item.id || index}`,
              fecha: item.fechaAsignacion,
              fechaCambio: item.fechaAsignacion,
              accion: 'Asignación',
              descripcion: `Ticket asignado - ${item.tipoOperacion || 'Operación'}`,
              usuario: item.emailUsuario || 'Sistema',
              cambiadoPor: item.emailUsuario || 'Sistema',
              cambiadoPorEmail: item.emailUsuario || '',
              comentario: item.comentario || '',
              observaciones: '',
              tipoOperacion: item.tipoOperacion || 'ASIGNACION',
              estadoAnterior: item.estadoAnterior,
              estadoNuevo: item.estadoNuevo
            });
          });
        }
        
        // Ordenar por fecha (más reciente primero)
        historialCompleto.sort((a, b) => new Date(b.fechaCambio).getTime() - new Date(a.fechaCambio).getTime());
        
        console.log('📜 [HISTORIAL] Historial completo generado:', historialCompleto.length);
        setHistorial(historialCompleto);
    } catch (error) {
      console.error('❌ [HISTORIAL] Error cargando historial:', error);
      setHistorial([]); // Inicializar con array vacío
    }
  };

  const loadEvidencias = async () => {
    try {
      console.log('📎 [EVIDENCIAS] ===== INICIANDO loadEvidencias =====');
      console.log('📎 [EVIDENCIAS] Ticket ID:', ticketId);
      
      // Cargar evidencias de chat (archivos_ticket)
      let evidenciasDelChat: any[] = [];
      try {
        console.log('💬 [EVIDENCIAS CHAT] Cargando archivos del chat...');
        const chatResponse = await evidenciasAPI.getChatFiles(ticketId);
        evidenciasDelChat = Array.isArray(chatResponse) ? chatResponse : [];
        console.log('✅ [EVIDENCIAS CHAT] Archivos de chat encontrados:', evidenciasDelChat.length);
        console.log('💬 [EVIDENCIAS CHAT] Datos:', evidenciasDelChat);
      } catch (err) {
        console.error('⚠️ [EVIDENCIAS CHAT] Error cargando archivos del chat:', err);
        evidenciasDelChat = [];
      }
      
      // Cargar evidencias finales (tabla evidencias)
      let evidenciasFinalesData: any[] = [];
      try {
        console.log('📋 [EVIDENCIAS FINALES] Cargando evidencias finales...');
        const finalesResponse = await evidenciasAPI.getEvidences(ticketId);
        evidenciasFinalesData = Array.isArray(finalesResponse) ? finalesResponse : [];
        console.log('✅ [EVIDENCIAS FINALES] Evidencias finales encontradas:', evidenciasFinalesData.length);
        console.log('📋 [EVIDENCIAS FINALES] Datos:', evidenciasFinalesData);
      } catch (err) {
        console.error('⚠️ [EVIDENCIAS FINALES] Error cargando evidencias finales:', err);
        evidenciasFinalesData = [];
      }
      
      // Actualizar estados
      setEvidenciasChat(evidenciasDelChat);
      setEvidenciasFinales(evidenciasFinalesData);
      
      // Por compatibilidad, mantener el array combinado
      const todasLasEvidencias = [...evidenciasDelChat, ...evidenciasFinalesData];
      setEvidencias(todasLasEvidencias);
      
      console.log('📎 [EVIDENCIAS] Total evidencias de chat:', evidenciasDelChat.length);
      console.log('📎 [EVIDENCIAS] Total evidencias finales:', evidenciasFinalesData.length);
      console.log('📎 [EVIDENCIAS] Total combinadas:', todasLasEvidencias.length);
      console.log('📎 [EVIDENCIAS] Estado actualizado correctamente');
      
    } catch (error) {
      console.error('❌ [EVIDENCIAS] Error general cargando evidencias:', error);
      setEvidencias([]);
      setEvidenciasChat([]);
      setEvidenciasFinales([]);
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

    // Guardar el mensaje antes de limpiar el campo
    const messageText = newMessage.trim();

    try {
      setIsSending(true);
      const userInfo = await AsyncStorage.getItem('userInfo');
      
      if (!userInfo) {
        Alert.alert('Error', 'No se encontró información del usuario');
        return;
      }
      
      const userData = JSON.parse(userInfo);
      
      console.log('💬 [SEND] Enviando mensaje para ticket:', ticketId);
      console.log('💬 [SEND] Mensaje:', messageText);
      console.log('💬 [SEND] Longitud del mensaje:', messageText.length);
      console.log('💬 [SEND] Mensaje trimmeado:', messageText.trim());
      console.log('💬 [SEND] Longitud después de trim:', messageText.trim().length);
      
      await ticketsAPI.sendComment(ticketId, messageText);
      
      console.log('✅ [CHAT] Mensaje enviado exitosamente');
      
      // Agregar el mensaje a la lista local inmediatamente
      const localMessage = {
        id: Date.now(),
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
      
      // Marcar que hay mensajes locales pendientes
      setHasLocalMessages(true);
      
      setNewMessage('');
      
      // Scroll al final solo cuando se envía un mensaje
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
      
      // Recargar mensajes después de un delay para sincronizar con el servidor
      // PERO solo si no hay mensajes locales pendientes
      setTimeout(async () => {
        try {
          console.log('🔄 [TÉCNICO] Sincronizando mensajes después del envío...');
          // Limpiar el estado de mensajes locales y recargar
          setHasLocalMessages(false);
          await loadMessages();
        } catch (error) {
          console.error('❌ [TÉCNICO] Error sincronizando mensajes:', error);
        }
      }, 3000); // 3 segundos para dar más tiempo al servidor
    } catch (error: any) {
      console.error('❌ [CHAT] Error enviando mensaje:', error);
      const errorMessage = error?.message || 'Error de conexión';
      Alert.alert('Error', errorMessage);
      // Restaurar el mensaje si falla
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const mostrarConfirmacion = (title: string, message: string, confirmText: string, onConfirm: () => void) => {
    setConfirmModalConfig({ title, message, confirmText, onConfirm });
    setShowConfirmModal(true);
  };

  const cerrarConfirmacion = () => {
    setShowConfirmModal(false);
    setConfirmModalConfig(null);
  };

  const confirmarAccion = () => {
    if (confirmModalConfig?.onConfirm) {
      confirmModalConfig.onConfirm();
    }
    cerrarConfirmacion();
  };

  const cambiarEstadoTicket = async (nuevoEstado: string) => {
    try {
      console.log('🔄 [CAMBIO ESTADO] ===== INICIANDO CAMBIO DE ESTADO =====');
      console.log('🔄 [CAMBIO ESTADO] Ticket ID:', ticketId);
      console.log('🔄 [CAMBIO ESTADO] Estado anterior:', ticketInfo?.estado);
      console.log('🔄 [CAMBIO ESTADO] Estado nuevo:', nuevoEstado);
      
      // Validar que no se pueda resolver sin evidencias
      if (nuevoEstado === 'RESUELTO') {
        // Recargar evidencias antes de validar
        console.log('🔄 [VALIDACIÓN] Recargando evidencias antes de validar...');
        await loadEvidencias();
        
        // Contar todas las evidencias (finales + chat)
        const evidenciasFinalesCount = evidenciasFinales?.length || 0;
        const evidenciasChatCount = evidenciasChat?.length || 0;
        const totalEvidencias = evidenciasFinalesCount + evidenciasChatCount;
        
        console.log('🔍 [VALIDACIÓN] Evidencias finales encontradas:', evidenciasFinalesCount);
        console.log('🔍 [VALIDACIÓN] Evidencias de chat encontradas:', evidenciasChatCount);
        console.log('🔍 [VALIDACIÓN] Total evidencias:', totalEvidencias);
        console.log('🔍 [VALIDACIÓN] Estado evidenciasFinales:', evidenciasFinales);
        console.log('🔍 [VALIDACIÓN] Estado evidenciasChat:', evidenciasChat);
        
        if (totalEvidencias === 0) {
          Alert.alert(
            '⚠️ Evidencias Requeridas',
            'No puedes resolver este ticket sin subir al menos una evidencia.\n\nPor favor, sube las evidencias necesarias antes de marcar como resuelto.',
            [{ text: 'Entendido', style: 'default' }]
          );
          return;
        }
        
        console.log('✅ [VALIDACIÓN] Evidencias suficientes para resolver');
      }
      
      await tecnicoAPI.changeTicketState(ticketId, nuevoEstado, `Estado cambiado a ${nuevoEstado}`);
      
      console.log('✅ [CAMBIO ESTADO] Estado cambiado exitosamente');
      Alert.alert('✅ Éxito', `El ticket ha sido marcado como ${nuevoEstado}`);
      
      // Recargar datos
      console.log('🔄 [CAMBIO ESTADO] Recargando datos del ticket...');
      await loadInitialData();
      console.log('✅ [CAMBIO ESTADO] Datos recargados exitosamente');
    } catch (error: any) {
      console.error('❌ [CAMBIO ESTADO] Error exception:', error);
      const errorMessage = error?.message || 'Error de conexión al cambiar el estado';
      Alert.alert('❌ Error', errorMessage);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return '#ff9800';
      case 'ASIGNADO': return '#2196f3';
      case 'EN_PROCESO': return '#ff5722';
      case 'RESUELTO': return '#4caf50';
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

  const renderTicketInfo = () => {
    console.log('🖼️ [RENDER INFO] ===== RENDERIZANDO INFORMACIÓN DEL TICKET =====');
    console.log('🖼️ [RENDER INFO] ticketInfo:', ticketInfo);
    console.log('🖼️ [RENDER INFO] Estado del ticket:', ticketInfo?.estado);
    console.log('🖼️ [RENDER INFO] ID del ticket:', ticketInfo?.id);
    
    return (
    <View style={styles.tabContent}>
      {ticketInfo && (
        <>

          {/* Información básica en cards */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>📋 {t('ticket_detail.info_section_title')}</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{t('ticket_detail.id')}:</Text>
              <Text style={styles.infoValueBold}>#{ticketInfo.id}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{t('ticket_detail.priority')}:</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPrioridadColor(ticketInfo.prioridad) }]}>
                <Text style={styles.priorityText}>{ticketInfo.prioridad?.toUpperCase()}</Text>
              </View>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{t('ticket_detail.status')}:</Text>
              <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(ticketInfo.estado) }]}>
                <Text style={styles.statusText}>{ticketInfo.estado}</Text>
              </View>
            </View>
            
            {/* Información del técnico */}
            <View style={[
              styles.infoCard, 
              ticketInfo.rolTecnico === 'ESCALADO' ? styles.escaladoCard : 
              ticketInfo.rolTecnico === 'ORIGINAL' ? styles.originalCard : 
              styles.asignadoCard
            ]}>
              <Text style={styles.infoLabel}>
                {ticketInfo.rolTecnico === 'ESCALADO' ? 'Técnico Escalado:' :
                 ticketInfo.rolTecnico === 'ORIGINAL' ? 'Técnico Original:' :
                 'Técnico Asignado:'}
              </Text>
              <Text style={[
                styles.infoValue,
                ticketInfo.rolTecnico === 'ESCALADO' ? styles.escaladoText :
                ticketInfo.rolTecnico === 'ORIGINAL' ? styles.originalText :
                styles.asignadoText
              ]}>
                {ticketInfo.tecnicoNombre || 'Sin asignar'}
              </Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{t('ticket_detail.location')}:</Text>
              <Text style={styles.infoValue}>{ticketInfo.ubicacion || 'No especificada'}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{t('ticket_detail.creation_date')}:</Text>
              <Text style={styles.infoValue}>{formatDate(ticketInfo.fechaCreacion)}</Text>
            </View>
          </View>

          {/* Acciones del técnico */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>⚡ {t('ticket_detail.quick_actions')}</Text>
            
            {/* Debug: Mostrar estado actual */}
            {(() => {
              console.log('🎯 [RENDER ACCIONES] Estado actual para botones:', ticketInfo.estado);
              console.log('🎯 [RENDER ACCIONES] ¿Es PENDIENTE?:', ticketInfo.estado === 'PENDIENTE');
              console.log('🎯 [RENDER ACCIONES] ¿Es ASIGNADO?:', ticketInfo.estado === 'ASIGNADO');
              console.log('🎯 [RENDER ACCIONES] ¿Es EN_PROCESO?:', ticketInfo.estado === 'EN_PROCESO');
              console.log('🎯 [RENDER ACCIONES] ¿Es RESUELTO?:', ticketInfo.estado === 'RESUELTO');
              console.log('🎯 [RENDER ACCIONES] ¿Es CERRADO?:', ticketInfo.estado === 'CERRADO');
              return null;
            })()}
            
            {/* Estado PENDIENTE - No debería llegar aquí normalmente */}
            {ticketInfo.estado === 'PENDIENTE' && (
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>⏳ Ticket Pendiente</Text>
                <Text style={styles.infoMessage}>
                  Este ticket está pendiente de asignación.
                </Text>
              </View>
            )}
            
            {/* Estado ASIGNADO - Primer paso: Iniciar trabajo */}
            {ticketInfo.estado === 'ASIGNADO' && ticketInfo.puedeCambiarEstado && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.startButton]}
                onPress={() => {
                  console.log('🔘 [BOTÓN] Botón "Iniciar Trabajo" presionado');
                  console.log('🔘 [BOTÓN] Estado actual del ticket:', ticketInfo.estado);
                  console.log('🔘 [BOTÓN] Mostrando modal de confirmación...');
                  
                  mostrarConfirmacion(
                    `🚀 ${t('ticket_detail.start_work')}`,
                    t('ticket_detail.start_work_confirmation'),
                    t('ticket_detail.start'),
                    () => {
                      console.log('🔘 [BOTÓN] Usuario confirmó - Llamando a cambiarEstadoTicket("EN_PROCESO")');
                      cambiarEstadoTicket('EN_PROCESO');
                    }
                  );
                }}
              >
                <Text style={styles.actionButtonText}>🚀 {t('ticket_detail.start_work')}</Text>
              </TouchableOpacity>
            )}
            
            {/* Mensaje si no puede cambiar estados */}
            {ticketInfo.estado === 'ASIGNADO' && !ticketInfo.puedeCambiarEstado && (
              <View style={styles.infoCard}>
                <Text style={styles.infoValue}>
                  {ticketInfo.rolTecnico === 'ORIGINAL' 
                    ? '🔒 Este ticket fue escalado. Solo el técnico escalado puede cambiar su estado.'
                    : '🔒 No tienes permisos para cambiar el estado de este ticket.'
                  }
                </Text>
              </View>
            )}
            
            {/* Estado EN_PROCESO - Segundo paso: Resolver ticket */}
            {(() => {
              console.log('🔍 [DEBUG] Verificando botón EN_PROCESO:', {
                estado: ticketInfo.estado,
                puedeCambiarEstado: ticketInfo.puedeCambiarEstado,
                rolTecnico: ticketInfo.rolTecnico,
                esTecnicoEscalado: ticketInfo.esTecnicoEscalado
              });
              const condicion1 = ticketInfo.estado === 'EN_PROCESO';
              const condicion2 = ticketInfo.puedeCambiarEstado;
              const resultado = condicion1 && condicion2;
              console.log('🔍 [DEBUG] Condiciones EN_PROCESO:', {
                condicion1,
                condicion2,
                resultado
              });
              return resultado;
            })() && (
              (() => {
                console.log('🎯 [RENDER] ¡RENDERIZANDO BOTÓN EN_PROCESO!');
                return true;
              })() &&
              <TouchableOpacity 
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => {
                  console.log('🔘 [BOTÓN] Botón "Resolver Ticket" presionado');
                  console.log('🔘 [BOTÓN] Estado actual del ticket:', ticketInfo.estado);
                  console.log('🔘 [BOTÓN] Mostrando modal de confirmación...');
                  
                  mostrarConfirmacion(
                    '✅ Resolver Ticket',
                    '¿Estás seguro de que quieres marcar este ticket como resuelto?\n\nAsegúrate de haber subido todas las evidencias finales necesarias.',
                    'Resolver',
                    () => {
                      console.log('🔘 [BOTÓN] Usuario confirmó - Llamando a cambiarEstadoTicket("RESUELTO")');
                      cambiarEstadoTicket('RESUELTO');
                    }
                  );
                }}
              >
                <Text style={styles.actionButtonText}>✅ Resolver Ticket</Text>
              </TouchableOpacity>
            )}
            
            {/* Mensaje si no puede cambiar estados en EN_PROCESO */}
            {ticketInfo.estado === 'EN_PROCESO' && !ticketInfo.puedeCambiarEstado && (
              <View style={styles.infoCard}>
                <Text style={styles.infoValue}>
                  {ticketInfo.rolTecnico === 'ORIGINAL' 
                    ? '🔒 Este ticket fue escalado. Solo el técnico escalado puede cambiar su estado.'
                    : '🔒 No tienes permisos para cambiar el estado de este ticket.'
                  }
                </Text>
              </View>
            )}
            
            {/* Estado ESCALADO - Técnico escalado puede iniciar trabajo */}
            {(() => {
              console.log('🔍 [DEBUG] Verificando botón ESCALADO:', {
                estado: ticketInfo.estado,
                puedeCambiarEstado: ticketInfo.puedeCambiarEstado,
                rolTecnico: ticketInfo.rolTecnico,
                esTecnicoEscalado: ticketInfo.esTecnicoEscalado
              });
              const condicion1 = ticketInfo.estado === 'ESCALADO';
              const condicion2 = ticketInfo.puedeCambiarEstado;
              const resultado = condicion1 && condicion2;
              console.log('🔍 [DEBUG] Condiciones:', {
                condicion1,
                condicion2,
                resultado
              });
              return resultado;
            })() && (
              (() => {
                console.log('🎯 [RENDER] ¡RENDERIZANDO BOTÓN ESCALADO!');
                return true;
              })() &&
              <TouchableOpacity 
                style={[styles.actionButton, styles.startButton]}
                onPress={() => {
                  console.log('🔘 [BOTÓN] Botón "Iniciar Trabajo" presionado (ESCALADO)');
                  console.log('🔘 [BOTÓN] Estado actual del ticket:', ticketInfo.estado);
                  console.log('🔘 [BOTÓN] Mostrando modal de confirmación...');
                  
                  mostrarConfirmacion(
                    `🚀 ${t('ticket_detail.start_work_escalated')}`,
                    t('ticket_detail.start_work_escalated_confirmation'),
                    t('ticket_detail.start'),
                    () => {
                      console.log('🔘 [BOTÓN] Usuario confirmó - Llamando a cambiarEstadoTicket("EN_PROCESO")');
                      cambiarEstadoTicket('EN_PROCESO');
                    }
                  );
                }}
              >
                <Text style={styles.actionButtonText}>🚀 {t('ticket_detail.start_work_escalated')}</Text>
              </TouchableOpacity>
            )}
            
            {/* Mensaje si no puede cambiar estados en ESCALADO */}
            {ticketInfo.estado === 'ESCALADO' && !ticketInfo.puedeCambiarEstado && (
              <View style={styles.infoCard}>
                <Text style={styles.infoValue}>
                  {ticketInfo.rolTecnico === 'ORIGINAL' 
                    ? '🔒 Este ticket fue escalado. Solo el técnico escalado puede cambiar su estado.'
                    : '🔒 No tienes permisos para cambiar el estado de este ticket.'
                  }
                </Text>
              </View>
            )}
            
            {/* Estado RESUELTO - Mostrar badge de éxito */}
            {ticketInfo.estado === 'RESUELTO' && (
              <View>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>✓ Ticket Resuelto</Text>
                </View>
                <Text style={styles.completedMessage}>
                  Este ticket ha sido marcado como resuelto y está esperando aprobación del administrador.
                </Text>
              </View>
            )}
            
            {/* Estado CERRADO - Badge final */}
            {ticketInfo.estado === 'CERRADO' && (
              <View>
                <View style={styles.closedBadge}>
                  <Text style={styles.closedBadgeText}>✓ Ticket Cerrado</Text>
                </View>
                <Text style={styles.completedMessage}>
                  Este ticket ha sido cerrado y completado.
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
  };

  const renderHistorial = () => {
    console.log('🖼️ [RENDER] Renderizando historial, cantidad:', historial.length);
    return (
    <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>📜 Historial Completo del Ticket</Text>
      {historial.length > 0 ? (
          <>
            <Text style={styles.historialCount}>
              Mostrando {historial.length} eventos del historial
            </Text>
        <ScrollView style={styles.historialList}>
              {historial.map((item, index) => {
                console.log('🖼️ [RENDER] Item historial:', item);
                
                // Determinar el tipo de evento
                const esCreacion = item.esCreacion;
                const esAsignacion = item.esAsignacion;
                const esEstadoActual = item.esEstadoActual;
                
                // Determinar color del punto
                let dotStyle = styles.historialDot;
                if (esCreacion) {
                  dotStyle = styles.historialDotCreacion;
                } else if (esAsignacion && item.tipoOperacion === 'ESCALAMIENTO') {
                  dotStyle = styles.historialDotEscalamiento;
                } else if (esAsignacion) {
                  dotStyle = styles.historialDotAsignacion;
                } else if (esEstadoActual) {
                  dotStyle = styles.historialDotEstadoActual;
                }
                
                return (
            <View key={item.id || index} style={styles.historialItem}>
                    <View style={dotStyle} />
              <View style={styles.historialContent}>
                      <Text style={styles.historialTitle}>
                        {item.accion}
                      </Text>
                      
                {item.descripcion && (
                        <Text style={styles.historialDescription}>
                          {item.descripcion}
                        </Text>
                      )}
                      
                      <Text style={styles.historialDate}>
                        {formatDate(item.fecha || item.fechaCambio || new Date().toISOString())}
                      </Text>
                  </View>
              </View>
                );
              })}
        </ScrollView>
          </>
      ) : (
        <View style={styles.emptyState}>
            <Text style={styles.emptyText}>📋 No hay historial disponible</Text>
            <Text style={styles.emptySubtext}>Los eventos del ticket aparecerán aquí</Text>
        </View>
      )}
    </View>
  );
  };

  const renderChat = () => (
    <View style={styles.chatContainer}>
      {/* Área de mensajes - Contenedor fijo */}
      <View style={styles.messagesContainer}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length > 0 ? (
            messages.map((message, index) => {
              const isTechnician = message.esTecnico || message.tipoAutor === 'TECNICO';
              console.log('🔍 Mensaje:', { 
                id: message.id, 
                autor: message.autor, 
                esTecnico: message.esTecnico,
                tipoAutor: message.tipoAutor,
                isTechnician 
              });
              
              return (
                <View key={message.id || index} style={[
                  styles.messageContainer,
                  isTechnician ? styles.technicianMessage : styles.userMessage
                ]}>
                  <View style={styles.messageHeader}>
                    <Text style={[
                      styles.messageAuthor,
                      isTechnician ? styles.technicianAuthor : styles.userAuthor
                    ]}>
                      {isTechnician ? '👨‍🔧 Técnico' : '👤 Cliente'}
                    </Text>
                    <Text style={[
                      styles.messageSenderName,
                      isTechnician ? styles.technicianSenderName : styles.userSenderName
                    ]}>
                      {getNombreRemitente(message)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.messageText,
                    isTechnician ? styles.technicianText : styles.userText
                  ]}>{message.mensaje}</Text>
                  <Text style={[
                    styles.messageTime,
                    isTechnician ? styles.technicianTime : styles.userTime
                  ]}>{formatDate(message.fechaCreacion)}</Text>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyChatContainer}>
              <Text style={styles.emptyChatIcon}>💬</Text>
              <Text style={styles.emptyChatText}>No hay mensajes aún</Text>
              <Text style={styles.emptyChatSubtext}>Inicia la conversación escribiendo un mensaje</Text>
            </View>
          )}
        </ScrollView>
      </View>

              {/* Input de mensaje - Abajo */}
              <View style={styles.chatInputContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.messageInput}
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline={false}
                    maxLength={500}
                    editable={!isSending}
                    placeholderTextColor="#999"
                    textAlignVertical="center"
                    onSubmitEditing={sendMessage}
                    returnKeyType="send"
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={isSending || !newMessage.trim()}
                  >
                    {isSending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.sendButtonText}>📤</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
    </View>
  );

  const handlePreviewArchivo = async (evidencia: EvidenciaItem) => {
    try {
      console.log('👁️ [PREVIEW] Previsualizando archivo:', evidencia);
      
      const token = await AsyncStorage.getItem('authToken');
      let url = '';
      
      // Determinar la URL de previsualización
      if (evidencia.id || evidencia.idArchivo) {
        // Es un archivo de la tabla archivos_ticket
        const archivoId = evidencia.id || evidencia.idArchivo;
        url = await evidenciasAPI.getPreviewUrl(ticketId, archivoId);
      } else if (evidencia.idEvidencia) {
        // Es una evidencia de la tabla evidencias
        url = await evidenciasAPI.getPreviewUrl(ticketId, evidencia.nombreCompletoArchivo);
      }
      
      console.log('👁️ [PREVIEW] URL de previsualización:', url);
      
      if (url) {
        const esImagen = evidencia.esImagen || evidencia.tipoMime?.startsWith('image/');
        const esPDF = evidencia.esPDF || evidencia.tipoMime?.includes('pdf');
        
        if (esImagen) {
          // Para imágenes, cargar como blob y mostrar en modal
          const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          // Usar directamente la URL en React Native
          console.log('✅ [PREVIEW] Usando URL directa para imagen:', url);
          
          setPreviewUrl(url);
          setArchivoEnPreview(evidencia);
          setShowPreviewModal(true);
        } else if (esPDF) {
          // Para PDFs, cargar como blob y abrir en nueva pestaña
          console.log('📄 [PREVIEW] Cargando PDF como blob...');
          const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          // En React Native, usar Linking para abrir PDF
          const { Linking } = require('react-native');
          console.log('📄 [PREVIEW] Abriendo PDF con Linking:', url);
          
          Linking.openURL(url).catch(err => {
            console.error('Error abriendo PDF:', err);
            Alert.alert('Error', 'No se pudo abrir el PDF');
          });
        } else {
          // Otros tipos: descargar
          handleDownloadEvidencia(evidencia);
        }
      } else {
        Alert.alert('Error', 'No se pudo determinar la URL del archivo');
      }
      
    } catch (error) {
      console.error('❌ [PREVIEW] Error:', error);
      Alert.alert('Error', 'No se pudo previsualizar el archivo');
    }
  };

  const handleDownloadEvidencia = async (evidencia: EvidenciaItem) => {
    try {
      console.log('📥 [DOWNLOAD] Descargando archivo:', evidencia);
      const token = await AsyncStorage.getItem('authToken');
      
      let url = '';
      
      // Determinar la URL correcta según el tipo de archivo
      if (evidencia.id || evidencia.idArchivo) {
        // Es un archivo de la tabla archivos_ticket
        const archivoId = evidencia.id || evidencia.idArchivo;
        url = await evidenciasAPI.getDownloadUrl(ticketId, archivoId);
      } else if (evidencia.idEvidencia) {
        // Es una evidencia de la tabla evidencias
        url = await evidenciasAPI.getDownloadUrl(ticketId, evidencia.nombreCompletoArchivo);
      }
      
      console.log('📥 [DOWNLOAD] URL:', url);
      
      // En React Native, usar Linking para abrir/descargar
      if (url) {
        const { Linking } = require('react-native');
        Linking.openURL(url).catch(err => {
          console.error('Error abriendo URL:', err);
          Alert.alert('Error', 'No se pudo abrir el archivo');
        });
      } else {
        Alert.alert('Error', 'No se pudo determinar la URL del archivo');
      }
      
    } catch (error) {
      console.error('❌ [DOWNLOAD] Error:', error);
      Alert.alert('Error', 'No se pudo abrir el archivo');
    }
  };

  const closePreview = () => {
    // Liberar la URL del blob
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
      console.log('🗑️ [PREVIEW] Blob URL liberado');
    }
    
    setShowPreviewModal(false);
    setPreviewUrl(null);
    setArchivoEnPreview(null);
  };

  const getFileIcon = (evidencia: EvidenciaItem) => {
    // Verificar primero los flags booleanos (sistema archivos_ticket)
    if (evidencia.esImagen) return '🖼️';
    if (evidencia.esPDF) return '📄';
    if (evidencia.esVideo) return '🎥';
    
    // Si no, verificar por tipoMime
    const tipo = evidencia.tipoEvidencia || evidencia.tipoArchivo || evidencia.tipoMime || '';
    const extension = evidencia.extension || evidencia.extensionArchivo || evidencia.nombreArchivo?.split('.').pop() || '';
    
    // Verificar por tipo de evidencia
    if (tipo.toUpperCase() === 'IMAGEN' || tipo.startsWith('image/')) {
      return '🖼️';
    } else if (tipo.toUpperCase() === 'VIDEO' || tipo.startsWith('video/')) {
      return '🎥';
    } else if (tipo.toUpperCase() === 'DOCUMENTO' || tipo.includes('pdf') || extension.toLowerCase() === 'pdf') {
      return '📄';
    } else if (tipo.includes('word') || tipo.includes('doc') || extension.toLowerCase().includes('doc')) {
      return '📝';
    } else if (tipo.includes('excel') || tipo.includes('sheet') || extension.toLowerCase().includes('xls')) {
      return '📊';
    }
    return '📁';
  };
  
  const getNombreArchivo = (evidencia: EvidenciaItem) => {
    return evidencia.nombreCompleto || evidencia.nombreArchivo || evidencia.nombreCompletoArchivo || 'Archivo';
  };
  
  const getTamanoArchivo = (evidencia: EvidenciaItem) => {
    const bytes = evidencia.tamano || evidencia.tamanioArchivo || evidencia.tamañoArchivo || 0;
    return (bytes / 1024).toFixed(2) + ' KB';
  };
  
  const getSubidoPor = (evidencia: EvidenciaItem) => {
    // Para evidencias finales: subidoPorNombre
    // Para archivos de chat: subidoPor
    return evidencia.subidoPorNombre || evidencia.subidoPor || evidencia.subidoPorObject?.nombre || 'Usuario';
  };

  const sePuedePrevisualizar = (evidencia: EvidenciaItem) => {
    const esImagen = evidencia.esImagen || evidencia.tipoMime?.startsWith('image/');
    const esPDF = evidencia.esPDF || evidencia.tipoMime?.includes('pdf');
    return esImagen || esPDF;
  };

  const getNombreRemitente = (message: ChatMessage) => {
    console.log('🔍 [NOMBRE] Determinando nombre para mensaje:', {
      autor: message.autor,
      tipoAutor: message.tipoAutor,
      esTecnico: message.esTecnico,
      autorEmail: message.autorEmail
    });
    
    // Si hay un nombre específico del autor y no es genérico, usarlo
    if (message.autor && message.autor !== 'Usuario' && message.autor.trim() !== '') {
      console.log('✅ [NOMBRE] Usando nombre específico:', message.autor);
      return message.autor;
    }
    
    // Si es técnico, mostrar "Técnico" + nombre si está disponible
    if (message.esTecnico || message.tipoAutor === 'TECNICO') {
      const nombre = message.autor && message.autor !== 'Usuario' ? message.autor : 'Técnico';
      console.log('🔧 [NOMBRE] Es técnico:', nombre);
      return nombre;
    }
    
    // Si es cliente, mostrar "Cliente" + nombre si está disponible
    if (message.tipoAutor === 'CLIENTE') {
      const nombre = message.autor && message.autor !== 'Usuario' ? message.autor : 'Cliente';
      console.log('👤 [NOMBRE] Es cliente:', nombre);
      return nombre;
    }
    
    // Si es administrador
    if (message.tipoAutor === 'ADMINISTRADOR') {
      const nombre = message.autor && message.autor !== 'Usuario' ? message.autor : 'Administrador';
      console.log('👨‍💼 [NOMBRE] Es administrador:', nombre);
      return nombre;
    }
    
    // Fallback
    console.log('⚠️ [NOMBRE] Usando fallback:', message.autor || 'Usuario');
    return message.autor || 'Usuario';
  };

  const renderEvidencias = () => {
    const evidenciasActuales = activeEvidenceTab === 'chat' ? evidenciasChat : evidenciasFinales;
    console.log('🖼️ [RENDER] Renderizando evidencias, tab activo:', activeEvidenceTab, 'cantidad:', evidenciasActuales.length);
    
    return (
    <View style={styles.tabContent}>
        {/* Header */}
        <Text style={styles.sectionTitle}>📎 Evidencias del Ticket</Text>
        
        {/* Tabs de categorías de evidencias */}
        <View style={styles.evidenceTabsContainer}>
          <TouchableOpacity 
            style={[styles.evidenceTab, activeEvidenceTab === 'chat' && styles.activeEvidenceTab]}
            onPress={() => setActiveEvidenceTab('chat')}
          >
            <Text style={[styles.evidenceTabText, activeEvidenceTab === 'chat' && styles.activeEvidenceTabText]}>
              💬 Evidencias de Chat ({evidenciasChat.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.evidenceTab, activeEvidenceTab === 'finales' && styles.activeEvidenceTab]}
            onPress={() => setActiveEvidenceTab('finales')}
          >
            <Text style={[styles.evidenceTabText, activeEvidenceTab === 'finales' && styles.activeEvidenceTabText]}>
              📋 Evidencias Finales ({evidenciasFinales.length})
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Botón de subir solo para evidencias finales */}
        {activeEvidenceTab === 'finales' && (
          <TouchableOpacity 
            style={styles.uploadEvidenceButton}
            onPress={() => setShowUploadEvidenceModal(true)}
          >
            <Text style={styles.uploadEvidenceButtonText}>+ Subir Evidencia Final</Text>
          </TouchableOpacity>
        )}

      {evidenciasActuales.length > 0 ? (
        <ScrollView style={styles.evidenciasList}>
            {evidenciasActuales.map((evidencia, index) => {
              console.log('🖼️ [RENDER] Evidencia/Archivo:', evidencia);
              return (
                <View 
                  key={evidencia.id || evidencia.idEvidencia || evidencia.idArchivo || index} 
                  style={styles.evidenciaCard}
                >
                  {/* Icono y tipo */}
                  <View style={styles.evidenciaIconLarge}>
                    <Text style={styles.evidenciaIconLargeText}>
                      {getFileIcon(evidencia)}
                </Text>
              </View>
                  
                  {/* Información */}
                  <View style={styles.evidenciaInfo}>
                    <Text style={styles.evidenciaTitleLarge}>
                      {getNombreArchivo(evidencia)}
                    </Text>
                    {(evidencia.descripcion || evidencia.comentario) && (
                      <Text style={styles.evidenciaDescription}>
                        {evidencia.descripcion || evidencia.comentario}
                      </Text>
                    )}
                <Text style={styles.evidenciaSubtitle}>
                      👤 {getSubidoPor(evidencia)}
                </Text>
                <Text style={styles.evidenciaDate}>
                      📅 {formatDate(evidencia.fechaSubida || new Date().toISOString())}
                    </Text>
                    <Text style={styles.evidenciaSize}>
                      💾 {getTamanoArchivo(evidencia)}
                </Text>
              </View>
                  
                  {/* Acciones */}
                  <View style={styles.evidenciaActions}>
                    {sePuedePrevisualizar(evidencia) && (
                      <TouchableOpacity 
                        style={styles.evidenciaActionButton}
                        onPress={() => handlePreviewArchivo(evidencia)}
                      >
                        <Text style={styles.evidenciaActionIcon}>👁️</Text>
                        <Text style={styles.evidenciaActionLabel}>Ver</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={styles.evidenciaActionButton}
                      onPress={() => handleDownloadEvidencia(evidencia)}
                    >
                      <Text style={styles.evidenciaActionIcon}>📥</Text>
                      <Text style={styles.evidenciaActionLabel}>Descargar</Text>
                    </TouchableOpacity>
            </View>
                </View>
              );
            })}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>
              {activeEvidenceTab === 'chat' ? '💬' : '📋'}
            </Text>
            <Text style={styles.emptyText}>
              {activeEvidenceTab === 'chat' 
                ? 'No hay archivos del chat'
                : 'No hay evidencias finales'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeEvidenceTab === 'chat'
                ? 'Los archivos compartidos en el chat aparecerán aquí'
                : 'Sube evidencias finales para documentar la resolución del ticket'}
            </Text>
            {activeEvidenceTab === 'finales' && (
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => setShowUploadEvidenceModal(true)}
              >
                <Text style={styles.emptyStateButtonText}>+ Subir Evidencia Final</Text>
              </TouchableOpacity>
            )}
        </View>
      )}
    </View>
  );
  };

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
            {errorMessage || 'No tienes permisos para ver este ticket o el ticket no existe.'}
          </Text>
          {!errorMessage && (
          <Text style={styles.errorSubMessage}>
            Solo puedes ver tickets que te han sido asignados.
          </Text>
          )}
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

  // Si el ticket está RESUELTO o CERRADO, mostrar solo pantalla informativa simple
  if (ticketInfo.estado === 'RESUELTO' || ticketInfo.estado === 'CERRADO') {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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

        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.resolvedTicketContainer}>
            {/* Badge de estado */}
            <View style={ticketInfo.estado === 'RESUELTO' ? styles.resolvedBadgeLarge : styles.closedBadgeLarge}>
              <Text style={styles.resolvedIconLarge}>
                {ticketInfo.estado === 'RESUELTO' ? '✅' : '🔒'}
              </Text>
              <Text style={styles.resolvedTitleLarge}>
                {ticketInfo.estado === 'RESUELTO' ? 'Ticket Resuelto' : 'Ticket Cerrado'}
              </Text>
              <Text style={styles.resolvedSubtitleLarge}>
                {ticketInfo.estado === 'RESUELTO' 
                  ? 'Este ticket ha sido marcado como resuelto y está esperando aprobación del administrador.'
                  : 'Este ticket ha sido completado y cerrado.'}
              </Text>
            </View>

            {/* Información básica del ticket */}
            <View style={styles.resolvedInfoCard}>
              <Text style={styles.resolvedInfoTitle}>📋 Información del Ticket</Text>
              
              <View style={styles.resolvedInfoRow}>
                <Text style={styles.resolvedInfoLabel}>ID:</Text>
                <Text style={styles.resolvedInfoValue}>#{ticketInfo.id}</Text>
              </View>
              
              <View style={styles.resolvedInfoRow}>
                <Text style={styles.resolvedInfoLabel}>Asunto:</Text>
                <Text style={styles.resolvedInfoValue}>{ticketInfo.asunto}</Text>
              </View>
              
              <View style={styles.resolvedInfoRow}>
                <Text style={styles.resolvedInfoLabel}>Estado:</Text>
                <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(ticketInfo.estado) }]}>
                  <Text style={styles.statusText}>{ticketInfo.estado}</Text>
                </View>
              </View>
              
              <View style={styles.resolvedInfoRow}>
                <Text style={styles.resolvedInfoLabel}>
                  {ticketInfo.rolTecnico === 'ESCALADO' ? 'Técnico Escalado:' : 'Técnico:'}
                </Text>
                <Text style={styles.resolvedInfoValue}>{ticketInfo.tecnicoNombre || 'Sin asignar'}</Text>
              </View>
              
              <View style={styles.resolvedInfoRow}>
                <Text style={styles.resolvedInfoLabel}>Fecha Creación:</Text>
                <Text style={styles.resolvedInfoValue}>{formatDate(ticketInfo.fechaCreacion)}</Text>
              </View>
              
              <View style={styles.resolvedInfoRow}>
                <Text style={styles.resolvedInfoLabel}>Última Actualización:</Text>
                <Text style={styles.resolvedInfoValue}>{formatDate(ticketInfo.fechaActualizacion)}</Text>
              </View>
            </View>

            {/* Mensaje informativo */}
            <View style={styles.resolvedMessageCard}>
              <Text style={styles.resolvedMessageIcon}>ℹ️</Text>
              <Text style={styles.resolvedMessageText}>
                {ticketInfo.estado === 'RESUELTO'
                  ? 'El ticket está completado y en espera de revisión. No se pueden realizar más cambios.'
                  : 'El ticket ha sido cerrado. No se pueden realizar más cambios.'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header del Ticket General - Arriba */}
      <View style={styles.ticketGeneralHeader}>
        <Text style={styles.ticketGeneralTitle}>{t('ticket_detail.title')}</Text>
        <View style={styles.ticketHeaderActions}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => {
              console.log('🔄 [REFRESH] Actualizando ticket...');
              loadInitialData();
            }}
          >
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => {
              console.log('❌ [CLOSE] Cerrando ticket...');
              // Verificar si hay pantalla anterior, si no, ir al dashboard
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                // @ts-ignore - Navegación a pantalla principal
                navigation.navigate('Home');
              }
            }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Tabs de navegación - Pegado al header */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
            📋 {t('ticket_detail.tab_info')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
            💬 {t('ticket_detail.tab_chat')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'historial' && styles.activeTab]}
          onPress={() => setActiveTab('historial')}
        >
          <Text style={[styles.tabText, activeTab === 'historial' && styles.activeTabText]}>
            📜 {t('ticket_detail.tab_history')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'evidencias' && styles.activeTab]}
          onPress={() => setActiveTab('evidencias')}
        >
          <Text style={[styles.tabText, activeTab === 'evidencias' && styles.activeTabText]}>
            📎 {t('ticket_detail.tab_evidence')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'chat' ? (
        renderChat()
      ) : (
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === 'info' && renderTicketInfo()}
          {activeTab === 'historial' && renderHistorial()}
          {activeTab === 'evidencias' && renderEvidencias()}
        </ScrollView>
      )}

      {/* Modal de subir evidencia */}
      <EvidenceModal
        visible={showUploadEvidenceModal}
        onClose={() => setShowUploadEvidenceModal(false)}
        ticketId={ticketId}
        isFinalEvidence={activeEvidenceTab === 'finales'}
        onEvidenceUploaded={() => {
          setShowUploadEvidenceModal(false);
          loadEvidencias();
        }}
      />

      {/* Modal de confirmación personalizado */}
      <Modal
        visible={showConfirmModal}
        animationType="fade"
        transparent={true}
        onRequestClose={cerrarConfirmacion}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContainer}>
            {/* Título */}
            <Text style={styles.confirmModalTitle}>{confirmModalConfig?.title}</Text>
            
            {/* Mensaje */}
            <Text style={styles.confirmModalMessage}>{confirmModalConfig?.message}</Text>
            
            {/* Botones */}
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity 
                style={[styles.confirmModalButton, styles.confirmModalButtonCancel]}
                onPress={cerrarConfirmacion}
              >
                <Text style={styles.confirmModalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmModalButton, styles.confirmModalButtonConfirm]}
                onPress={confirmarAccion}
              >
                <Text style={styles.confirmModalButtonConfirmText}>
                  {confirmModalConfig?.confirmText || 'Confirmar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de previsualización */}
      <Modal
        visible={showPreviewModal}
        animationType="fade"
        transparent={true}
        onRequestClose={closePreview}
      >
        <View style={styles.previewModalOverlay}>
          <View style={styles.previewModalContainer}>
            {/* Header del modal */}
            <View style={styles.previewHeader}>
              <View style={styles.previewHeaderInfo}>
                <Text style={styles.previewHeaderIcon}>
                  {archivoEnPreview ? getFileIcon(archivoEnPreview) : '📄'}
                </Text>
                <View style={styles.previewHeaderText}>
                  <Text style={styles.previewTitle}>
                    {archivoEnPreview ? getNombreArchivo(archivoEnPreview) : 'Archivo'}
                  </Text>
                  <Text style={styles.previewSubtitle}>
                    {archivoEnPreview ? `${getTamanoArchivo(archivoEnPreview)} • ${(archivoEnPreview.extension || archivoEnPreview.extensionArchivo || 'FILE').toUpperCase()}` : 'Cargando...'}
                  </Text>
                </View>
              </View>
              <View style={styles.previewHeaderActions}>
                <TouchableOpacity 
                  style={styles.previewActionButton}
                  onPress={() => {
                    if (archivoEnPreview) handleDownloadEvidencia(archivoEnPreview);
                  }}
                >
                  <Text style={styles.previewActionText}>📥</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.previewCloseButton}
                  onPress={closePreview}
                >
                  <Text style={styles.previewCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contenido de previsualización - Solo para imágenes */}
            <View style={styles.previewContent}>
              {archivoEnPreview && previewUrl && typeof previewUrl === 'string' ? (
                <ScrollView contentContainerStyle={styles.previewScrollContent}>
                  <Image 
                    source={{ uri: previewUrl }} 
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                </ScrollView>
              ) : (
                <View style={styles.previewNotAvailable}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.loadingPreviewText}>Cargando...</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a', // Fondo oscuro
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a', // Fondo oscuro
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#60a5fa', // Azul claro
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff', // Blanco
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#2d2d2d',
    borderBottomWidth: 1,
    borderBottomColor: '#3c3c3c',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#ffffff',
    backgroundColor: '#3c3c3c',
  },
  tabText: {
    fontSize: 14,
    color: '#cccccc',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  ticketGeneralHeader: {
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketGeneralTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  ticketHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 16,
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  ticketHeader: {
    backgroundColor: '#1e40af', // Azul oscuro
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },
  ticketId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  ticketAsunto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#111111',
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#60a5fa',
  },
  // Estilos para indicadores de rol
  escaladoCard: {
    backgroundColor: '#1a1a2e',
    borderLeftColor: '#ff6b35',
  },
  originalCard: {
    backgroundColor: '#2d1b69',
    borderLeftColor: '#8b5cf6',
  },
  asignadoCard: {
    backgroundColor: '#0f3460',
    borderLeftColor: '#3b82f6',
  },
  escaladoText: {
    color: '#ff6b35',
    fontWeight: 'bold',
  },
  originalText: {
    color: '#8b5cf6',
    fontWeight: 'bold',
  },
  asignadoText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  infoLabel: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#e5e7eb',
    flex: 2,
    textAlign: 'right',
  },
  infoValueBold: {
    fontSize: 14,
    color: '#60a5fa',
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'right',
  },
  infoValueMultiline: {
    fontSize: 14,
    color: '#e5e7eb',
    flex: 2,
    textAlign: 'right',
    lineHeight: 20,
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
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: '#2196F3',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
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
  historialCount: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  historialDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    marginRight: 12,
    marginTop: 6,
  },
  historialDotCreacion: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    marginRight: 12,
    marginTop: 6,
  },
  historialDotAsignacion: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 12,
    marginTop: 6,
  },
  historialDotEscalamiento: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF9800',
    marginRight: 12,
    marginTop: 6,
  },
  historialDotEstadoActual: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9C27B0',
    marginRight: 12,
    marginTop: 6,
  },
  historialContent: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  historialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  historialTitleAsignacion: {
    color: '#4CAF50',
  },
  historialComment: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  historialDescription: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 6,
    lineHeight: 20,
  },
  historialInactive: {
    fontSize: 12,
    color: '#ff9800',
    fontStyle: 'italic',
    marginBottom: 4,
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
    backgroundColor: '#1a1a1a',
    flexDirection: 'column',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  messagesScrollView: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyChatIcon: {
    fontSize: 64,
    marginBottom: 24,
    opacity: 0.8,
  },
  emptyChatText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyChatSubtext: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
    marginHorizontal: 4,
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
  // Estilos para mensajes del TÉCNICO (azul, derecha)
  technicianMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2196F3',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  // Estilos para mensajes del USUARIO (verde, izquierda)
  userMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
  },
  messageAuthor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  technicianAuthor: {
    color: '#fff',
    fontWeight: '600',
  },
  userAuthor: {
    color: '#fff',
    fontWeight: '600',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  technicianText: {
    color: '#fff',
  },
  userText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
  },
  technicianTime: {
    color: '#E3F2FD',
  },
  userTime: {
    color: '#E8F5E9',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  messageInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    backgroundColor: 'transparent',
    color: '#ffffff',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#3c3c3c',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
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
    color: '#9ca3af',
    marginBottom: 2,
  },
  evidenciaDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  evidenciaSize: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  evidenciaAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  evidenciaActionText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  evidenciasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  evidenciaCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  evidenciaIconLarge: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  evidenciaIconLargeText: {
    fontSize: 32,
  },
  evidenciaInfo: {
    marginBottom: 12,
  },
  evidenciaTitleLarge: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  evidenciaDescription: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  evidenciaActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  evidenciaActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  evidenciaActionIcon: {
    fontSize: 16,
  },
  evidenciaActionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#0a0a0a',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyStateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0a0a0a',
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
    color: '#e5e7eb',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  errorSubMessage: {
    fontSize: 14,
    color: '#9ca3af',
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
    gap: 8,
  },
  messageSenderName: {
    fontSize: 12,
    fontWeight: '500',
  },
  technicianSenderName: {
    color: '#60a5fa',
  },
  userSenderName: {
    color: '#34d399',
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
  // Estilos del modal de previsualización
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewModalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    maxWidth: 900,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    backgroundColor: '#111111',
  },
  previewHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  previewHeaderIcon: {
    fontSize: 32,
  },
  previewHeaderText: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  previewHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  previewActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewActionText: {
    fontSize: 20,
  },
  previewCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  previewContent: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  previewScrollContent: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  previewContentContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewNotAvailable: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  previewNotAvailableIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  previewNotAvailableText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 500,
    borderRadius: 8,
  },
  downloadButtonInPreview: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingPreviewText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9ca3af',
  },
  // Estilos para tabs de evidencias
  evidenceTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  evidenceTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeEvidenceTab: {
    backgroundColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  evidenceTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
  },
  activeEvidenceTabText: {
    color: '#60a5fa',
    fontWeight: '600',
  },
  uploadEvidenceButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadEvidenceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Estilos para badges de estado
  completedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  completedBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedMessage: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 20,
  },
  escaladoBadge: {
    backgroundColor: '#FF9800',
    padding: 16,
    borderRadius: 8,
  },
  escaladoBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  escaladoMessage: {
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoBadge: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
  },
  infoBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoMessage: {
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
  },
  closedBadge: {
    backgroundColor: '#757575',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  closedBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos para modal de confirmación personalizado
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmModalMessage: {
    fontSize: 15,
    color: '#d1d5db',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmModalButtonCancel: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  confirmModalButtonCancelText: {
    color: '#d1d5db',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmModalButtonConfirm: {
    backgroundColor: '#3b82f6',
  },
  confirmModalButtonConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos para pantalla de ticket resuelto/cerrado
  resolvedTicketContainer: {
    padding: 20,
    backgroundColor: '#0a0a0a',
  },
  resolvedBadgeLarge: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  closedBadgeLarge: {
    backgroundColor: '#757575',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resolvedIconLarge: {
    fontSize: 64,
    marginBottom: 16,
  },
  resolvedTitleLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  resolvedSubtitleLarge: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.95,
  },
  resolvedInfoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  resolvedInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  resolvedInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  resolvedInfoLabel: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  resolvedInfoValue: {
    fontSize: 14,
    color: '#e5e7eb',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  resolvedMessageCard: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#60a5fa',
  },
  resolvedMessageIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  resolvedMessageText: {
    flex: 1,
    fontSize: 14,
    color: '#dbeafe',
    lineHeight: 20,
  },
  // Botones flotantes para navegación
  backButtonFloat: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#374151',
    zIndex: 1000,
  },
  backButtonFloatText: {
    fontSize: 24,
    color: '#60a5fa',
    fontWeight: 'bold',
  },
  refreshButtonFloat: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#374151',
    zIndex: 1000,
  },
  refreshButtonFloatText: {
    fontSize: 18,
    color: '#ffffff',
  },
});
