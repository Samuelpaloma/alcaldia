import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  text: string;
  sender: 'tecnico' | 'admin';
  timestamp: string;
  isRead: boolean;
}

interface ChatScreenProps {
  visible?: boolean;
  onClose?: () => void;
}

export default function ChatScreen({ visible = true, onClose }: ChatScreenProps) {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      loadUserData();
      initializeWebSocket();
    } else {
      closeWebSocket();
    }

    return () => {
      closeWebSocket();
    };
  }, [visible]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

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

  const initializeWebSocket = () => {
    try {
      // Conectar al WebSocket del servidor usando SockJS
      const websocket = new WebSocket('ws://localhost:8080/ws/chat');
      
      websocket.onopen = () => {
        console.log('🔌 WebSocket conectado');
        setIsConnected(true);
        
        // Enviar mensaje de conexión con información del usuario
        if (userData) {
          websocket.send(JSON.stringify({
            type: 'join',
            userId: userData.id,
            userName: userData.nombre,
            userRole: 'tecnico',
            sender: 'tecnico'
          }));
        }
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Mensaje recibido:', data);
          
          if (data.type === 'message') {
            const newMsg: Message = {
              id: data.id || Date.now().toString(),
              text: data.text,
              sender: data.sender === 'admin' ? 'admin' : 'tecnico',
              timestamp: data.timestamp || new Date().toISOString(),
              isRead: data.sender === 'tecnico' // Los mensajes propios se marcan como leídos
            };
            
            setMessages(prev => [...prev, newMsg]);
          } else if (data.type === 'typing') {
            setIsTyping(data.isTyping && data.sender === 'admin');
          } else if (data.type === 'user_joined') {
            // Mostrar notificación de usuario conectado
            console.log('👤 Usuario conectado:', data.userName);
          }
        } catch (error) {
          console.error('Error parseando mensaje:', error);
        }
      };

      websocket.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        setIsConnected(false);
        setIsTyping(false);
      };

      websocket.onerror = (error) => {
        console.error('❌ Error WebSocket:', error);
        setIsConnected(false);
        Alert.alert('Error de conexión', 'No se pudo conectar al chat. Verifica tu conexión a internet.');
      };

      setWs(websocket);
    } catch (error) {
      console.error('Error inicializando WebSocket:', error);
      Alert.alert('Error', 'No se pudo inicializar el chat');
    }
  };

  const closeWebSocket = () => {
    if (ws) {
      ws.close();
      setWs(null);
      setIsConnected(false);
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !ws || !isConnected) {
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const message = {
        type: 'message',
        text: messageText,
        sender: 'tecnico',
        timestamp: new Date().toISOString(),
        userId: userData?.id,
        userName: userData?.nombre,
        userRole: 'tecnico'
      };

      ws.send(JSON.stringify(message));

      // Agregar mensaje localmente inmediatamente
      const localMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'tecnico',
        timestamp: new Date().toISOString(),
        isRead: true
      };

      setMessages(prev => [...prev, localMessage]);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    }
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);
    
    if (ws && isConnected) {
      // Enviar estado de escritura
      ws.send(JSON.stringify({
        type: 'typing',
        isTyping: text.length > 0,
        sender: 'tecnico',
        userRole: 'tecnico',
        userName: userData?.nombre
      }));
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isOwnMessage = message.sender === 'tecnico';
    const showDate = index === 0 || 
      formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);

    return (
      <View key={message.id}>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{formatDate(message.timestamp)}</Text>
          </View>
        )}
        
        <View style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage
        ]}>
          <View style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble
          ]}>
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}>
              {message.text}
            </Text>
            <Text style={[
              styles.messageTime,
              isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
            ]}>
              {formatTime(message.timestamp)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Si no hay función onClose, significa que es una pantalla independiente
  const isModal = !!onClose;
  if (isModal && !visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>Inicia una conversación</Text>
              <Text style={styles.emptyText}>
                Escribe un mensaje para comunicarte con el administrador
              </Text>
            </View>
          ) : (
            messages.map((message, index) => renderMessage(message, index))
          )}
          
          {isTyping && (
            <View style={styles.typingContainer}>
              <View style={styles.typingBubble}>
                <Text style={styles.typingText}>Administrador está escribiendo...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="#999"
              value={newMessage}
              onChangeText={handleTyping}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                (!newMessage.trim() || !isConnected) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!newMessage.trim() || !isConnected}
            >
              <Text style={[
                styles.sendButtonText,
                (!newMessage.trim() || !isConnected) && styles.sendButtonTextDisabled
              ]}>
                →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusConnected: {
    backgroundColor: '#4CAF50',
  },
  statusDisconnected: {
    backgroundColor: '#f44336',
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 15,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    marginBottom: 10,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.7,
  },
  ownMessageTime: {
    color: 'white',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#666',
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  typingBubble: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sendButtonTextDisabled: {
    color: '#999',
  },
});
