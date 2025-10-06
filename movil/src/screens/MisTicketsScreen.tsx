import React, { useState, useEffect } from 'react';
import { 
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from '../hooks/useTranslation';
import { tecnicoAPI, Ticket } from '../config/api';

export default function MisTicketsScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  // Estados para tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);

  // Cargar tickets al montar el componente
  useEffect(() => {
    loadTickets();
  }, []);

  // Efecto para filtrar tickets cuando cambia la búsqueda
  useEffect(() => {
    filterTickets();
  }, [searchText, tickets]);

  const loadTickets = async () => {
    console.log('🎫 [MIS TICKETS] ===== INICIANDO loadTickets =====');
    setTicketsLoading(true);
    try {
      console.log('🎫 [MIS TICKETS] Obteniendo tickets...');
      
      // Agregar timeout para evitar congelamiento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: La solicitud tardó demasiado')), 10000)
      );
      
      const response = await Promise.race([
        tecnicoAPI.getTicketsHistorial(),
        timeoutPromise
      ]) as any;
      
      console.log('🎫 [MIS TICKETS] Respuesta completa recibida:', response);
      
      // Extraer el array de tickets de la respuesta (el endpoint de historial devuelve directamente el array)
      const ticketsData = Array.isArray(response) ? response : (response.data || []);
      console.log('🎫 [MIS TICKETS] Tickets extraídos:', ticketsData);
      console.log('🎫 [MIS TICKETS] Cantidad de tickets:', ticketsData.length);
      
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error cargando tickets:', error);
      Alert.alert(
        'Error de conexión',
        'No se pudieron cargar los tickets. Verifica tu conexión a internet.',
        [{ text: 'Reintentar', onPress: () => loadTickets() }]
      );
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  // Función para filtrar tickets
  const filterTickets = () => {
    console.log('🔍 [FILTER] ===== INICIANDO FILTRADO =====');
    console.log('🔍 [FILTER] Tickets totales:', tickets.length);
    console.log('🔍 [FILTER] Texto de búsqueda:', searchText);
    
    let filtered = tickets;

    // Filtrar por texto de búsqueda
    if (searchText.trim()) {
      filtered = filtered.filter(ticket => 
        (ticket.consulta || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (ticket.descripcion || '').toLowerCase().includes(searchText.toLowerCase()) ||
        ticket.id.toString().includes(searchText.toLowerCase())
      );
    }

    console.log('🔍 [FILTER] Tickets filtrados:', filtered.length);
    setFilteredTickets(filtered);
  };

  // Función para traducir estados
  const getStatusText = (estado: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDIENTE': t('common.pending'),
      'ASIGNADO': t('tickets.assigned'),
      'EN_PROCESO': t('common.in_progress'),
      'RESUELTO': t('common.completed'),
      'CERRADO': t('tickets.closed'),
      'ESCALADO': t('tickets.escalated')
    };
    return statusMap[estado] || estado;
  };

  // Función para traducir prioridades
  const getPriorityText = (prioridad: string) => {
    const priorityMap: { [key: string]: string } = {
      'ALTA': t('common.high'),
      'MEDIA': t('common.medium'),
      'BAJA': t('common.low'),
      'CRITICA': t('common.critical')
    };
    return priorityMap[prioridad] || prioridad.toLowerCase();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('tickets.title')}</Text>
          <View style={styles.placeholder} />
        </View>

        <Text style={styles.subtitle}>{t('tickets.subtitle')}</Text>

        {/* Barra de búsqueda */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput 
              style={styles.searchInput}
              placeholder={t('tickets.search_tickets')}
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Lista de tickets */}
        <ScrollView style={styles.content}>
          {ticketsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Cargando tickets...</Text>
              <Text style={styles.loadingSubtext}>Por favor espera...</Text>
            </View>
          ) : filteredTickets.length > 0 ? (
            filteredTickets.map((ticket, index) => (
              <TouchableOpacity 
                key={ticket.id || index} 
                style={styles.ticketCard}
                onPress={() => {
                  navigation.navigate('TicketTracking', { ticketId: ticket.id });
                }}
              >
                {/* Header del ticket */}
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketTitle}>{ticket.id}: {ticket.consulta || ticket.descripcion}</Text>
                </View>

                {/* Descripción */}
                <Text style={styles.ticketDescription}>{ticket.descripcion}</Text>

                {/* Información del técnico */}
                {(ticket as any).tecnicoNombre && (
                  <View style={styles.technicianInfo}>
                    <Text style={styles.technicianLabel}>
                      {ticket.estado === 'ESCALADO' ? 'Técnico Escalado:' : 'Técnico Asignado:'}
                    </Text>
                    <Text style={styles.technicianName}>{(ticket as any).tecnicoNombre}</Text>
                  </View>
                )}

                {/* Tags de estado y prioridad */}
                <View style={styles.tagsContainer}>
                  <View style={[
                    styles.statusTag, 
                    ticket.estado === 'PENDIENTE' ? { backgroundColor: '#dc2626' } :
                    ticket.estado === 'ASIGNADO' ? { backgroundColor: '#2563eb' } :
                    ticket.estado === 'EN_PROCESO' ? { backgroundColor: '#f59e0b' } :
                    ticket.estado === 'RESUELTO' ? { backgroundColor: '#10b981' } :
                    ticket.estado === 'CERRADO' ? { backgroundColor: '#6b7280' } :
                    ticket.estado === 'ESCALADO' ? { backgroundColor: '#8b5cf6' } :
                    { backgroundColor: '#6b7280' }
                  ]}>
                    <Text style={styles.tagText}>{getStatusText(ticket.estado)}</Text>
                  </View>
                  
                  <View style={[
                    styles.priorityTag,
                    ticket.prioridad === 'ALTA' ? styles.priorityHigh :
                    ticket.prioridad === 'MEDIA' ? styles.priorityMedium :
                    styles.priorityLow
                  ]}>
                    <Text style={styles.tagText}>{getPriorityText(ticket.prioridad || '')}</Text>
                  </View>

                  <View style={styles.areaTag}>
                    <Text style={styles.tagText}>{t('tickets.area')}: {ticket.categoria || t('tickets.default_area')}</Text>
                  </View>
                </View>

                {/* Estado actual */}
                <View style={styles.currentStatusContainer}>
                  <Text style={styles.currentStatusLabel}>{t('tickets.current_status')}:</Text>
                  <View style={[
                    styles.currentStatusBadge,
                    ticket.estado === 'PENDIENTE' ? { backgroundColor: '#dc2626' } :
                    ticket.estado === 'ASIGNADO' ? { backgroundColor: '#2563eb' } :
                    ticket.estado === 'EN_PROCESO' ? { backgroundColor: '#f59e0b' } :
                    ticket.estado === 'RESUELTO' ? { backgroundColor: '#10b981' } :
                    ticket.estado === 'CERRADO' ? { backgroundColor: '#6b7280' } :
                    ticket.estado === 'ESCALADO' ? { backgroundColor: '#8b5cf6' } :
                    { backgroundColor: '#6b7280' }
                  ]}>
                    <Text style={styles.currentStatusText}>{getStatusText(ticket.estado)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    padding: 20,
    paddingTop: 10,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#374151',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 10,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 10,
  },
  ticketCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  ticketHeader: {
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#d1d5db',
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
    backgroundColor: '#6b7280',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  currentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentStatusLabel: {
    fontSize: 14,
    color: '#9ca3af',
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
    color: '#ffffff',
  },
  priorityHigh: {
    backgroundColor: '#dc2626',
  },
  priorityMedium: {
    backgroundColor: '#f59e0b',
  },
  priorityLow: {
    backgroundColor: '#10b981',
  },
  technicianInfo: {
    marginVertical: 8,
    paddingHorizontal: 4,
  },
  technicianLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    marginBottom: 2,
  },
  technicianName: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});


