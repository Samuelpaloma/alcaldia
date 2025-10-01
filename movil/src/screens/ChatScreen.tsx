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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from './navigationTypes';
import ChatService, { ChatMessage } from '../services/ChatService';
import EvidenceModal from './components/EvidenceModal';
import { useTheme } from '../hooks/useTheme';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface TicketInfo {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: string;
  prioridad: string;
  tecnicoNombre?: string;
  tecnicoEmail?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadorEmail?: string;
  creadorNombre?: string;
  ubicacion?: string;
  comentarios?: ChatMessage[];
  evidencias?: any[];
  historialEstados?: Array<{
    estadoAnterior: string;
    estadoNuevo: string;
    fechaCambio: string;
    comentario?: string;
  }>;
}

export default function ChatScreen() {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { ticketId } = route.params;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [hasEvidence, setHasEvidence] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadInitialData();
  }, [ticketId]);

  useEffect(() => {
    // Auto-scroll al final cuando hay nuevos mensajes
    scrollToBottom();
  }, [messages]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar información del ticket (incluye comentarios)
      const ticketData = await ChatService.getTicketInfo(ticketId);

      setTicketInfo(ticketData);
      // Los comentarios ya vienen incluidos en la respuesta del ticket
      if (ticketData.comentarios) {
        setMessages(ticketData.comentarios);
      }
      
      // Verificar si hay evidencias
      if (ticketData.evidencias && ticketData.evidencias.length > 0) {
        setHasEvidence(true);
      }

      // Obtener email del usuario actual
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        const userData = JSON.parse(userInfo);
        setUserEmail(userData.email || '');
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del chat');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const newChatMessage = await ChatService.enviarComentario(ticketId, messageText);
      setMessages(prev => [...prev, newChatMessage]);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
      setNewMessage(messageText); // Restaurar el mensaje si falla
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getAuthorName = (message: ChatMessage) => {
    if (message.autorEmail === userEmail) {
      return 'Tú';
    }
    
    switch (message.tipoAutor) {
      case 'TECNICO':
        return 'Técnico';
      case 'CLIENTE':
        return 'Cliente';
      case 'ADMINISTRADOR':
        return 'Administrador';
      default:
        return message.autor;
    }
  };

  const isCurrentUser = (message: ChatMessage) => {
    return message.autorEmail === userEmail;
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return '#ff9800';
      case 'EN_PROCESO':
      case 'ASIGNADO':
        return '#2196f3';
      case 'TERMINADO':
      case 'FINALIZADA':
        return '#4caf50';
      case 'CERRADO':
        return '#9e9e9e';
      default:
        return '#666';
    }
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad?.toUpperCase()) {
      case 'ALTA':
        return '#f44336';
      case 'MEDIA':
        return '#ff9800';
      case 'BAJA':
        return '#4caf50';
      default:
        return '#666';
    }
  };

  const styles = createStyles(theme);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Ticket #{ticketId}</Text>
            {ticketInfo && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {ticketInfo.titulo || ticketInfo.descripcion}
              </Text>
            )}
          </View>
        </View>

        {/* Información compacta del ticket */}
        {ticketInfo && (
          <View style={styles.ticketSummaryCard}>
            <View style={styles.ticketSummaryHeader}>
              <View style={styles.ticketBasicInfo}>
                <Text style={styles.ticketId}>#{ticketInfo.id}</Text>
                <Text style={styles.ticketTitle} numberOfLines={1}>{ticketInfo.titulo}</Text>
              </View>
              <View style={styles.ticketBadges}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticketInfo.estado) }]}>
                  <Text style={styles.statusText}>{ticketInfo.estado}</Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(ticketInfo.prioridad) }]}>
                  <Text style={styles.priorityText}>{ticketInfo.prioridad}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.ticketSummaryActions}>
              <TouchableOpacity 
                style={styles.toggleDetailsButton}
                onPress={() => setShowTicketDetails(!showTicketDetails)}
              >
                <Text style={styles.toggleDetailsText}>
                  {showTicketDetails ? 'Ocultar detalles' : 'Ver detalles'}
                </Text>
                <Text style={styles.toggleDetailsIcon}>
                  {showTicketDetails ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.evidenceButton, hasEvidence && styles.evidenceButtonDisabled]}
                onPress={() => !hasEvidence && setShowEvidenceModal(true)}
                disabled={hasEvidence}
              >
                <Text style={[styles.evidenceButtonText, hasEvidence && styles.evidenceButtonTextDisabled]}>
                  {hasEvidence ? '📎 Evidencia Subida' : '📎 Evidencia'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Detalles expandibles */}
            {showTicketDetails && (
              <View style={styles.expandedDetails}>
                <View style={styles.ticketDetails}>
                  <View style={styles.ticketInfoRow}>
                    <Text style={styles.ticketInfoLabel}>Asunto:</Text>
                    <Text style={styles.ticketInfoValue}>{ticketInfo.titulo}</Text>
                  </View>
                  {ticketInfo.tecnicoNombre && (
                    <View style={styles.ticketInfoRow}>
                      <Text style={styles.ticketInfoLabel}>Técnico:</Text>
                      <Text style={styles.ticketInfoValue}>{ticketInfo.tecnicoNombre}</Text>
                    </View>
                  )}
                  {ticketInfo.ubicacion && (
                    <View style={styles.ticketInfoRow}>
                      <Text style={styles.ticketInfoLabel}>Ubicación:</Text>
                      <Text style={styles.ticketInfoValue}>{ticketInfo.ubicacion}</Text>
                    </View>
                  )}
                </View>

                {/* Historial del ticket */}
                {ticketInfo.historialEstados && ticketInfo.historialEstados.length > 0 && (
                  <View style={styles.historySection}>
                    <Text style={styles.historyTitle}>🕒 Historial del Ticket</Text>
                    <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
                      {ticketInfo.historialEstados.map((historial, index) => (
                        <View key={index} style={styles.historyItem}>
                          <View style={styles.historyDot} />
                          <View style={styles.historyContent}>
                            <Text style={styles.historyText}>{historial.estadoAnterior} → {historial.estadoNuevo}</Text>
                            <Text style={styles.historyDate}>
                              {new Date(historial.fechaCambio).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Text>
                            {historial.comentario && (
                              <Text style={styles.historyComment}>{historial.comentario}</Text>
                            )}
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Área de mensajes */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💬</Text>
              <Text style={styles.emptyStateText}>No hay mensajes aún</Text>
              <Text style={styles.emptyStateSubtext}>Sé el primero en escribir</Text>
            </View>
          ) : (
            messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  isCurrentUser(message) ? styles.messageContainerRight : styles.messageContainerLeft
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isCurrentUser(message) ? styles.messageBubbleRight : styles.messageBubbleLeft
                  ]}
                >
                  <Text style={[
                    styles.messageAuthor,
                    isCurrentUser(message) ? styles.textLight : styles.textDark
                  ]}>
                    {getAuthorName(message)}
                  </Text>
                  <Text style={[
                    styles.messageText,
                    isCurrentUser(message) ? styles.textLight : styles.textDark
                  ]}>{message.mensaje}</Text>
                  <Text style={[
                    styles.messageTime,
                    isCurrentUser(message) ? styles.textLight : styles.textDark
                  ]}>
                    {formatTimestamp(message.fechaCreacion)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Área de entrada */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              editable={!isSending}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newMessage.trim() || isSending) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>→</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.characterCount}>
            {newMessage.length}/500
          </Text>
        </View>

        {/* Modal de evidencias */}
        <EvidenceModal
          visible={showEvidenceModal}
          onClose={() => setShowEvidenceModal(false)}
          ticketId={ticketId}
          onEvidenceUploaded={() => {
            // Marcar que ya hay evidencias
            setHasEvidence(true);
            // Recargar datos del ticket para mostrar nuevas evidencias
            loadInitialData();
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  // Estilos para el resumen compacto del ticket
  ticketSummaryCard: {
    backgroundColor: '#1a1a1a',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketBasicInfo: {
    flex: 1,
    marginRight: 12,
  },
  ticketId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 4,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  ticketBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  ticketSummaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#333',
    borderRadius: 6,
  },
  toggleDetailsText: {
    color: '#ccc',
    fontSize: 14,
    marginRight: 4,
  },
  toggleDetailsIcon: {
    color: '#ccc',
    fontSize: 12,
  },
  evidenceButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  evidenceButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  evidenceButtonDisabled: {
    backgroundColor: '#555',
    opacity: 0.6,
  },
  evidenceButtonTextDisabled: {
    color: '#ccc',
  },
  expandedDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  ticketDetails: {
    gap: 8,
    marginBottom: 16,
  },
  historySection: {
    marginTop: 8,
  },
  ticketInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketInfoLabel: {
    fontSize: 14,
    color: '#ccc',
    width: 80,
    fontWeight: '500',
  },
  ticketInfoValue: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
  },
  // Estilos para el historial
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  historyList: {
    maxHeight: 150,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007bff',
    marginTop: 6,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 4,
  },
  historyComment: {
    fontSize: 12,
    color: '#aaa',
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
  messageContainer: {
    marginBottom: 12,
  },
  messageContainerLeft: {
    alignItems: 'flex-start',
  },
  messageContainerRight: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleLeft: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  messageAuthor: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.6,
  },
  textLight: {
    color: '#ffffff',
  },
  textDark: {
    color: '#000000',
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
});