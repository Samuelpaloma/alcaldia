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
import { webSocketService } from '../services/WebSocketService';
import EvidenceModal from './components/EvidenceModal';

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
  subidoPor?: {
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
        console.log('📜 [TICKET] HistorialEstados del backend:', data.historialEstados);
        console.log('📎 [TICKET] Evidencias del backend:', data.evidencias);
        console.log('💬 [TICKET] Comentarios del backend:', data.comentarios);
        
        // Mapear la respuesta del backend al formato esperado
        const ticketInfo = {
          id: data.idTicket || data.id,
          asunto: data.consulta || data.asunto || `Ticket #${ticketId}`,
          descripcion: data.descripcion || data.consulta || 'Sin descripción',
          categoria: data.categoria || 'Sin categoría',
          estado: data.estado || 'PENDIENTE',
          prioridad: data.prioridad || 'MEDIA',
          tecnicoAsignado: data.tecnicoNombre || data.tecnicoAsignado || 'Sin asignar',
          tecnicoNombre: data.tecnicoNombre,
          creadorNombre: data.creadorNombre,
          fechaCreacion: data.fechaCreacion || new Date().toISOString(),
          fechaActualizacion: data.fechaActualizacion || new Date().toISOString(),
          ubicacion: data.ubicacion || 'Sin ubicación',
          creador: data.creador || { nombre: 'Usuario' },
          evidencias: data.evidencias || [],
          historial: data.historialEstados || data.historial || [],
          historialEstados: data.historialEstados || []
        };
        
        console.log('📜 [TICKET] Historial mapeado:', ticketInfo.historial);
        
        setTicketInfo(ticketInfo);
        
        // Si viene historialEstados en el ticket, usarlo directamente
        if (data.historialEstados && data.historialEstados.length > 0) {
          console.log('📜 [TICKET] Usando historialEstados del ticket:', data.historialEstados);
          const historialMapeado = data.historialEstados.map((item: any) => ({
            id: item.idHistorial || item.id,
            fecha: item.fechaCambio,
            fechaCambio: item.fechaCambio,
            accion: 'Cambio de estado',
            descripcion: item.comentario || `${item.estadoAnterior} → ${item.estadoNuevo}`,
            usuario: item.cambiadoPor || item.nombreCambiadoPor || 'Sistema',
            cambiadoPor: item.cambiadoPor || item.nombreCambiadoPor || 'Sistema',
            estadoAnterior: item.estadoAnterior,
            estadoNuevo: item.estadoNuevo,
            observaciones: item.observaciones
          }));
          console.log('📜 [TICKET] Historial procesado desde ticket:', historialMapeado);
          setHistorial(historialMapeado);
        }
        
        // Siempre cargar evidencias con la llamada separada para asegurar que se obtengan
        console.log('📎 [TICKET] Evidencias en respuesta inicial:', data.evidencias);
        // No usamos las evidencias del ticket inicial, siempre hacemos la llamada específica
        // para asegurar que se carguen todas las evidencias
        
        // Si vienen comentarios en el ticket, usarlos directamente
        if (data.comentarios && data.comentarios.length > 0) {
          console.log('💬 [TICKET] Usando comentarios del ticket:', data.comentarios);
          const comentariosMapeados = data.comentarios.map((comment: any) => ({
            id: comment.id,
            autor: comment.autor || comment.nombreUsuario || 'Usuario',
            mensaje: comment.mensaje || comment.contenido,
            fechaCreacion: comment.fechaCreacion || comment.fecha,
            esTecnico: comment.esTecnico || false,
            tipoAutor: comment.tipoAutor
          }));
          setMessages(comentariosMapeados.sort((a: ChatMessage, b: ChatMessage) => {
            return new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime();
          }));
        }
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
        console.log('📋 [CHAT] Primer mensaje de ejemplo:', data[0]);
        
        // Mapear los comentarios al formato esperado
        const mappedMessages = (data || []).map((comment: any) => {
          console.log('🔄 [MAPEO] Mensaje original:', {
            id: comment.id,
            tipoAutor: comment.tipoAutor,
            esTecnico: comment.esTecnico,
            autor: comment.autor
          });
          
          return {
            id: comment.id,
            autor: comment.autor || comment.nombreUsuario || 'Usuario',
            mensaje: comment.mensaje || comment.contenido,
            fechaCreacion: comment.fechaCreacion || comment.fecha,
            esTecnico: comment.esTecnico || false,
            tipoAutor: comment.tipoAutor
          };
        });
        
        // Ordenar mensajes por fecha (del más antiguo al más nuevo - orden ascendente)
        const mensajesOrdenados = mappedMessages.sort((a: ChatMessage, b: ChatMessage) => {
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
      } else {
        console.warn('⚠️ [TÉCNICO] Error en polling:', response.status);
      }
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
      console.log('📜 [HISTORIAL] Intentando endpoint: /api/tickets/${ticketId}/historial');
      let response = await fetch(`http://localhost:8080/api/tickets/${ticketId}/historial`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('📜 [HISTORIAL] Respuesta status:', response.status);

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
        console.log('✅ [HISTORIAL] Historial cargado, cantidad:', data?.length || 0);
        console.log('📜 [HISTORIAL] Datos de asignaciones:', JSON.stringify(data, null, 2));
        
        // Generar historial completo como en la web
        const historialCompleto: any[] = [];
        
        // 1. Evento de creación del ticket (siempre primero)
        if (ticketInfo) {
          historialCompleto.push({
            id: 'creacion',
            fecha: ticketInfo.fechaCreacion,
            fechaCambio: ticketInfo.fechaCreacion,
            accion: 'Ticket creado',
            descripcion: `Ticket creado`,
            usuario: ticketInfo.creadorNombre || 'Usuario',
            cambiadoPor: ticketInfo.creadorNombre || 'Usuario',
            esCreacion: true
          });
        }
        
        // 2. Procesar asignaciones del ticket
        (data || []).forEach((item: any, index: number) => {
          console.log('🔄 [HISTORIAL-MAP] Procesando asignación:', item);
          
          let accion = '';
          let descripcion = '';
          let nombreTecnico = item.tecnicoNombre;
          
          // Si no hay nombre, intentar obtenerlo del tecnicoAsignado del ticket
          if (!nombreTecnico && ticketInfo && ticketInfo.tecnicoAsignado) {
            nombreTecnico = ticketInfo.tecnicoAsignado;
          }
          
          // Determinar el tipo de operación basado en tipoOperacion
          // Si tipoOperacion es null, inferir del contexto
          let tipoOp = item.tipoOperacion;
          
          // Inferir tipo de operación si es null
          if (!tipoOp) {
            if (index === 0 && item.activa) {
              tipoOp = 'ASIGNACION'; // Primera asignación
            } else if (!item.activa) {
              tipoOp = 'REASIGNAR'; // Si no está activa, fue reasignada
            } else {
              // Si es activa y no es la primera, probablemente es escalamiento
              tipoOp = 'ESCALAMIENTO';
            }
          }
          
          if (tipoOp === 'ESCALAMIENTO') {
            accion = 'Escalado';
            descripcion = `Escalado a ${nombreTecnico || item.tecnicoEmail || 'SAAS'}`;
          } else if (tipoOp === 'REASIGNAR') {
            accion = 'Reasignado';
            descripcion = `Reasignado a ${nombreTecnico || item.tecnicoEmail || 'Técnico'}`;
          } else {
            accion = 'Asignado';
            descripcion = `Asignado a ${nombreTecnico || item.tecnicoEmail || 'Técnico'}`;
          }
          
          historialCompleto.push({
            id: item.id,
            fecha: item.fechaAsignacion,
            fechaCambio: item.fechaAsignacion,
            accion: accion,
            descripcion: descripcion,
            usuario: item.asignadoPor || 'Sistema',
            cambiadoPor: item.asignadoPor || 'Sistema',
            tecnico: nombreTecnico,
            tipoOperacion: item.tipoOperacion,
            esAsignacion: true,
            activa: item.activa
          });
        });
        
        // 3. Agregar estado actual al final
        if (ticketInfo) {
          historialCompleto.push({
            id: 'estado-actual',
            fecha: ticketInfo.fechaActualizacion,
            fechaCambio: ticketInfo.fechaActualizacion,
            accion: 'Estado actual',
            descripcion: `Estado: ${ticketInfo.estado}`,
            usuario: 'Sistema',
            cambiadoPor: 'Sistema',
            estadoActual: ticketInfo.estado,
            esEstadoActual: true
          });
        }
        
        console.log('📜 [HISTORIAL] Historial completo generado:', historialCompleto);
        setHistorial(historialCompleto);
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
      console.log('📎 [EVIDENCIAS] ===== INICIANDO loadEvidencias =====');
      console.log('📎 [EVIDENCIAS] Ticket ID:', ticketId);
      const token = await AsyncStorage.getItem('authToken');
      console.log('📎 [EVIDENCIAS] Token presente:', !!token);
      
      // Intentar múltiples endpoints para archivos/evidencias
      const endpoints = [
        `/api/archivos-ticket/ticket/${ticketId}`,  // Sistema de archivos del cliente (principal)
        `/api/tecnico/tickets/${ticketId}/evidencias`, // Sistema de evidencias del técnico
        `/api/evidencias/ticket/${ticketId}`,
        `/api/evidencias/movil/ticket/${ticketId}`
      ];
      
      let evidenciasEncontradas: any[] = [];
      
      for (const endpoint of endpoints) {
        try {
          console.log('📎 [EVIDENCIAS] Probando endpoint:', endpoint);
          const response = await fetch(`http://localhost:8080${endpoint}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });

          console.log('📎 [EVIDENCIAS] Respuesta status:', response.status);

          if (response.ok) {
            const responseData = await response.json();
            console.log('✅ [EVIDENCIAS] Respuesta completa:', responseData);
            
            // Manejar diferentes formatos de respuesta
            let data = responseData;
            
            // Si la respuesta tiene el formato {success, data, message}
            if (responseData.success !== undefined && responseData.data !== undefined) {
              console.log('📎 [EVIDENCIAS] Formato wrapper detectado, extrayendo data...');
              data = responseData.data;
            }
            
            console.log('✅ [EVIDENCIAS] Evidencias extraídas:', data);
            console.log('✅ [EVIDENCIAS] Cantidad:', data?.length || 0);
            console.log('✅ [EVIDENCIAS] Primer elemento completo:', JSON.stringify(data?.[0], null, 2));
            
            if (data && Array.isArray(data) && data.length > 0) {
              evidenciasEncontradas = data;
              console.log('🎉 [EVIDENCIAS] ¡Evidencias encontradas en', endpoint, '!');
              break; // Salir del loop si encontramos evidencias
            } else {
              console.log('⚠️ [EVIDENCIAS] Endpoint respondió OK pero sin evidencias');
            }
          }
        } catch (err) {
          console.log('📎 [EVIDENCIAS] Error con endpoint', endpoint, ':', err);
          continue;
        }
      }
      
      console.log('📎 [EVIDENCIAS] Total evidencias encontradas:', evidenciasEncontradas.length);
      setEvidencias(evidenciasEncontradas);
      
    } catch (error) {
      console.error('❌ [EVIDENCIAS] Error general cargando evidencias:', error);
      setEvidencias([]);
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
          mensaje: messageText,
          usuario_id: userData.id || userData.idUsuario
        })
      });

      if (response.ok) {
        const newComment = await response.json();
        console.log('✅ [CHAT] Mensaje enviado:', newComment);
        
        // Agregar el mensaje a la lista local inmediatamente
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
          {/* Título e ID */}
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketId}>#{ticketInfo.id}</Text>
            <Text style={styles.ticketAsunto}>{ticketInfo.asunto}</Text>
          </View>

          {/* Información básica en cards */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>📋 Información del Ticket</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>ID:</Text>
              <Text style={styles.infoValueBold}>#{ticketInfo.id}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Asunto:</Text>
              <Text style={styles.infoValue}>{ticketInfo.asunto}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Prioridad:</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPrioridadColor(ticketInfo.prioridad) }]}>
                <Text style={styles.priorityText}>{ticketInfo.prioridad?.toUpperCase()}</Text>
              </View>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Estado:</Text>
              <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(ticketInfo.estado) }]}>
                <Text style={styles.statusText}>{ticketInfo.estado}</Text>
              </View>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Técnico:</Text>
              <Text style={styles.infoValue}>{ticketInfo.tecnicoAsignado || 'Sin asignar'}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Ubicación:</Text>
              <Text style={styles.infoValue}>{ticketInfo.ubicacion || 'No especificada'}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Categoría:</Text>
              <Text style={styles.infoValue}>{ticketInfo.categoria}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Descripción:</Text>
              <Text style={styles.infoValueMultiline}>{ticketInfo.descripcion}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Fecha de Creación:</Text>
              <Text style={styles.infoValue}>{formatDate(ticketInfo.fechaCreacion)}</Text>
            </View>
          </View>

          {/* Acciones del técnico */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
            
            {ticketInfo.estado === 'PENDIENTE' && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => cambiarEstadoTicket('EN_PROCESO')}
              >
                <Text style={styles.actionButtonText}>✓ Aceptar Ticket</Text>
              </TouchableOpacity>
            )}
            
            {ticketInfo.estado === 'EN_PROCESO' && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => cambiarEstadoTicket('TERMINADO')}
              >
                <Text style={styles.actionButtonText}>✓ Finalizar Ticket</Text>
              </TouchableOpacity>
            )}
            
            {ticketInfo.estado === 'TERMINADO' && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.closeButton]}
                onPress={() => cambiarEstadoTicket('CERRADO')}
              >
                <Text style={styles.actionButtonText}>✓ Cerrar Ticket</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );

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
    <View style={styles.tabContent}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => {
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
                  {isTechnician ? '👨‍🔧 Técnico' : '👤 Usuario'}
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

  const [showUploadEvidenceModal, setShowUploadEvidenceModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [archivoEnPreview, setArchivoEnPreview] = useState<EvidenciaItem | null>(null);

  const handlePreviewArchivo = async (evidencia: EvidenciaItem) => {
    try {
      console.log('👁️ [PREVIEW] Previsualizando archivo:', evidencia);
      
      const token = await AsyncStorage.getItem('authToken');
      let url = '';
      
      // Determinar la URL de previsualización
      if (evidencia.id || evidencia.idArchivo) {
        // Es un archivo de la tabla archivos_ticket
        const archivoId = evidencia.id || evidencia.idArchivo;
        url = `http://localhost:8080/api/archivos-ticket/preview/${ticketId}/${archivoId}`;
      } else if (evidencia.idEvidencia) {
        // Es una evidencia de la tabla evidencias
        url = `http://localhost:8080/api/evidencias/${ticketId}/${evidencia.nombreCompletoArchivo}/preview`;
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
          
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            console.log('✅ [PREVIEW] Blob URL creado para imagen:', blobUrl);
            
            setPreviewUrl(blobUrl);
            setArchivoEnPreview(evidencia);
            setShowPreviewModal(true);
          }
        } else if (esPDF) {
          // Para PDFs, cargar como blob y abrir en nueva pestaña
          console.log('📄 [PREVIEW] Cargando PDF como blob...');
          const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            // Crear blob con tipo MIME explícito para que el navegador lo muestre inline
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);
            console.log('✅ [PREVIEW] PDF Blob creado con tipo application/pdf');
            console.log('✅ [PREVIEW] Abriendo PDF en nueva pestaña:', blobUrl);
            
            // Abrir el blob URL en nueva pestaña - esto muestra el PDF inline
            const newWindow = window.open(blobUrl, '_blank');
            
            if (!newWindow) {
              Alert.alert('Error', 'Por favor permite ventanas emergentes para ver el PDF');
            }
          } else {
            console.error('❌ [PREVIEW] Error cargando PDF:', response.status);
            Alert.alert('Error', 'No se pudo cargar el PDF');
          }
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
        url = `http://localhost:8080/api/archivos-ticket/descargar/${ticketId}/${archivoId}`;
      } else if (evidencia.idEvidencia) {
        // Es una evidencia de la tabla evidencias
        url = `http://localhost:8080/api/evidencias/${ticketId}/${evidencia.nombreCompletoArchivo}/descargar`;
      }
      
      console.log('📥 [DOWNLOAD] URL:', url);
      
      // Abrir en nueva pestaña para ver/descargar
      if (url) {
        window.open(url, '_blank');
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
    return evidencia.subidoPorNombre || evidencia.subidoPor?.nombre || 'Usuario';
  };

  const renderEvidencias = () => {
    console.log('🖼️ [RENDER] Renderizando evidencias, cantidad:', evidencias.length);
    return (
      <View style={styles.tabContent}>
        {/* Header con botón de subir */}
        <View style={styles.evidenciasHeader}>
          <Text style={styles.sectionTitle}>📎 Evidencias ({evidencias.length})</Text>
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => setShowUploadEvidenceModal(true)}
          >
            <Text style={styles.uploadButtonText}>+ Subir</Text>
          </TouchableOpacity>
        </View>

        {evidencias.length > 0 ? (
          <ScrollView style={styles.evidenciasList}>
            {evidencias.map((evidencia, index) => {
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
                    <TouchableOpacity 
                      style={styles.evidenciaActionButton}
                      onPress={() => handlePreviewArchivo(evidencia)}
                    >
                      <Text style={styles.evidenciaActionIcon}>👁️</Text>
                      <Text style={styles.evidenciaActionLabel}>Ver</Text>
                    </TouchableOpacity>
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
            <Text style={styles.emptyStateIcon}>📎</Text>
            <Text style={styles.emptyText}>No hay evidencias</Text>
            <Text style={styles.emptySubtext}>Sube archivos para documentar el ticket</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => setShowUploadEvidenceModal(true)}
            >
              <Text style={styles.emptyStateButtonText}>+ Subir Primera Evidencia</Text>
            </TouchableOpacity>
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

      {/* Modal de subir evidencia */}
      <EvidenceModal
        visible={showUploadEvidenceModal}
        onClose={() => setShowUploadEvidenceModal(false)}
        ticketId={ticketId}
        onEvidenceUploaded={() => {
          setShowUploadEvidenceModal(false);
          loadEvidencias();
        }}
      />

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
                <Text style={styles.previewHeaderIcon}>{archivoEnPreview && getFileIcon(archivoEnPreview)}</Text>
                <View style={styles.previewHeaderText}>
                  <Text style={styles.previewTitle}>{archivoEnPreview && getNombreArchivo(archivoEnPreview)}</Text>
                  <Text style={styles.previewSubtitle}>
                    {archivoEnPreview && `${getTamanoArchivo(archivoEnPreview)} • ${(archivoEnPreview.extension || archivoEnPreview.extensionArchivo || 'FILE').toUpperCase()}`}
                  </Text>
                </View>
              </View>
              <View style={styles.previewHeaderActions}>
                <TouchableOpacity 
                  style={styles.previewActionButton}
                  onPress={() => archivoEnPreview && handleDownloadEvidencia(archivoEnPreview)}
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
              {archivoEnPreview && previewUrl ? (
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
  ticketHeader: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
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
  infoValueBold: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'right',
  },
  infoValueMultiline: {
    fontSize: 14,
    color: '#333',
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
  historialCount: {
    fontSize: 13,
    color: '#666',
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
  historialTitleAsignacion: {
    color: '#4CAF50',
  },
  historialComment: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  historialDescription: {
    fontSize: 14,
    color: '#555',
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
  evidenciaSize: {
    fontSize: 11,
    color: '#666',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#333',
    marginBottom: 8,
  },
  evidenciaDescription: {
    fontSize: 13,
    color: '#666',
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
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
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
  // Estilos del modal de previsualización
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxWidth: 900,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
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
    color: '#333',
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 13,
    color: '#666',
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
    backgroundColor: '#fff',
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
    color: '#666',
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
    color: '#666',
  },
});
