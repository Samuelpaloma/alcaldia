import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  fechaCreacion: string;
  fechaCierre?: string;
  estado: string;
  area: string;
  prioridad: string;
  tecnicoAsignado?: string;
}

interface AreaGroup {
  nombre: string;
  tickets: Ticket[];
}

export default function HistorialPorAreaScreen() {
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState('');
  const [selectedArea, setSelectedArea] = useState('Todas las áreas');
  const [showAreaFilter, setShowAreaFilter] = useState(false);
  const [ticketsData, setTicketsData] = useState<AreaGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Áreas del sistema definidas
  const systemAreas = ['Sistemas', 'Hardware', 'Software', 'Redes', 'Otros'];
  const [areas, setAreas] = useState<string[]>(['Todas las áreas', ...systemAreas]);

  // Cargar tickets desde la base de datos
  const loadTickets = async () => {
    try {
      setLoading(true);
      console.log('📊 [HISTORIAL] Iniciando carga de tickets...');
      
      const token = await AsyncStorage.getItem('authToken');
      console.log('📊 [HISTORIAL] Token encontrado:', token ? 'Sí' : 'No');
      
      if (!token) {
        Alert.alert('Error', 'No se encontró el token de autenticación');
        navigation.navigate('Login');
        return;
      }

      console.log('📊 [HISTORIAL] Haciendo petición a: http://10.3.234.61:8080/api/tecnico/tickets');
      
      const response = await fetch('http://10.3.234.61:8080/api/tecnico/tickets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 [HISTORIAL] Respuesta recibida:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 [HISTORIAL] Respuesta del servidor:', data);
        
        if (data.success && data.tickets) {
          const tickets = data.tickets;
          console.log('📊 [HISTORIAL] Tickets recibidos:', tickets.length);
          console.log('📊 [HISTORIAL] Estructura del primer ticket:', tickets[0]);
          
          // Procesar los datos para agrupar por área
          const areaGroups: AreaGroup[] = [];
          
          // Crear grupos para todas las áreas del sistema
          systemAreas.forEach(area => {
            const ticketsInArea = tickets.filter((ticket: any) => (ticket.categoria || 'Sin área') === area);
            console.log(`📊 [HISTORIAL] Área ${area}: ${ticketsInArea.length} tickets`);
            
            areaGroups.push({
              nombre: area,
              tickets: ticketsInArea.map((ticket: any) => {
                console.log(`📊 [HISTORIAL] Procesando ticket:`, {
                  id: ticket.id,
                  categoria: ticket.categoria,
                  consulta: ticket.consulta,
                  estado: ticket.estado
                });
                
                return {
                  id: ticket.id,
                  titulo: ticket.consulta || ticket.titulo || 'Sin título',
                  descripcion: ticket.descripcion || '',
                  fechaCreacion: ticket.fechaCreacion || '',
                  fechaCierre: ticket.fechaCierre || '',
                  estado: ticket.estado || 'PENDIENTE',
                  area: ticket.categoria || 'Sin área',
                  prioridad: ticket.prioridad || 'MEDIA',
                  tecnicoAsignado: ticket.tecnicoAsignado || ''
                };
              })
            });
          });

          setTicketsData(areaGroups);
          console.log('📊 [HISTORIAL] Áreas del sistema:', systemAreas);
        } else {
          console.log('📊 [HISTORIAL] No hay tickets o error en la respuesta');
          setTicketsData([]);
          setAreas(['Todas las áreas']);
        }
      } else {
        const errorData = await response.json();
        console.error('📊 [HISTORIAL] Error del servidor:', errorData);
        Alert.alert('Error', errorData.message || 'No se pudieron cargar los tickets');
      }
    } catch (error) {
      console.error('Error al cargar tickets:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  const filteredData = ticketsData.filter(area => {
    if (selectedArea === 'Todas las áreas') return true;
    return area.nombre === selectedArea;
  });

  const filteredTickets = filteredData.map(area => ({
    ...area,
    tickets: area.tickets.filter(ticket => 
      ticket.id.toString().toLowerCase().includes(searchText.toLowerCase()) ||
      ticket.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
      ticket.descripcion.toLowerCase().includes(searchText.toLowerCase())
    )
  }));

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    setShowAreaFilter(false);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial por área</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Título y descripción */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Historial por área</Text>
            <Text style={styles.subtitle}>
              Consulta los tickets atendidos agrupados por área
            </Text>
          </View>

          {/* Barra de búsqueda */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por ID o título"
                placeholderTextColor="#888"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          </View>

          {/* Filtro de área */}
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={styles.areaFilter}
              onPress={() => setShowAreaFilter(!showAreaFilter)}
            >
              <Text style={styles.filterIcon}>📋</Text>
              <Text style={styles.filterText}>{selectedArea}</Text>
              <Text style={styles.chevronIcon}>{showAreaFilter ? '▲' : '▼'}</Text>
            </TouchableOpacity>
          </View>

          {/* Dropdown de áreas */}
          {showAreaFilter && (
            <View style={styles.areaDropdown}>
              {areas.map((area, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.areaOption,
                    selectedArea === area && styles.selectedAreaOption
                  ]}
                  onPress={() => handleAreaSelect(area)}
                >
                  <Text style={[
                    styles.areaOptionText,
                    selectedArea === area && styles.selectedAreaOptionText
                  ]}>
                    {area}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Lista de tickets agrupados por área */}
          <View style={styles.ticketsContainer}>
            {loading ? (
              <View style={styles.loadingState}>
                <Text style={styles.loadingText}>Cargando tickets...</Text>
              </View>
            ) : (
              filteredTickets.map((areaGroup, index) => (
                <View key={index} style={styles.areaSection}>
                  <View style={styles.areaHeader}>
                    <Text style={styles.areaTitle}>{areaGroup.nombre}</Text>
                    <View style={styles.ticketCount}>
                      <Text style={styles.ticketCountText}>{areaGroup.tickets.length} tickets</Text>
                    </View>
                  </View>

                  {areaGroup.tickets.length > 0 ? (
                    areaGroup.tickets.map((ticket, ticketIndex) => (
                      <View key={ticketIndex} style={styles.ticketCard}>
                        <View style={styles.ticketHeader}>
                          <Text style={styles.ticketId}>TK-{ticket.id.toString().padStart(3, '0')}</Text>
                          <View style={[
                            styles.statusBadge,
                            ticket.estado === 'FINALIZADO' ? styles.statusCompleted :
                            ticket.estado === 'EN_PROCESO' ? styles.statusInProcess :
                            styles.statusPending
                          ]}>
                            <Text style={styles.statusText}>{ticket.estado}</Text>
                          </View>
                        </View>
                        <Text style={styles.ticketTitle}>{ticket.titulo}</Text>
                        <Text style={styles.ticketDescription} numberOfLines={2}>
                          {ticket.descripcion}
                        </Text>
                        <View style={styles.ticketFooter}>
                          <Text style={styles.ticketDate}>
                            {ticket.fechaCierre ? `Cerrado: ${ticket.fechaCierre}` : `Creado: ${ticket.fechaCreacion}`}
                          </Text>
                          <Text style={[
                            styles.priorityText,
                            ticket.prioridad === 'ALTA' ? styles.priorityHigh :
                            ticket.prioridad === 'MEDIA' ? styles.priorityMedium :
                            styles.priorityLow
                          ]}>
                            {ticket.prioridad}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyAreaState}>
                      <Text style={styles.emptyAreaIcon}>📋</Text>
                      <Text style={styles.emptyAreaText}>No hay tickets en esta área</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000000',
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'white',
  },
  areaFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#666',
  },
  filterText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  chevronIcon: {
    fontSize: 12,
    color: '#666',
  },
  areaDropdown: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  areaOption: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedAreaOption: {
    backgroundColor: '#30692E',
  },
  areaOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedAreaOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  ticketsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  areaSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  areaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  areaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  ticketCount: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  ticketCountText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  ticketCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  ticketTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  ticketDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityHigh: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  priorityMedium: {
    backgroundColor: '#fff3e0',
    color: '#ef6c00',
  },
  priorityLow: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  },
  statusCompleted: {
    backgroundColor: '#d4edda',
  },
  statusInProcess: {
    backgroundColor: '#fff3cd',
  },
  statusPending: {
    backgroundColor: '#f8d7da',
  },
  emptyAreaState: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 10,
  },
  emptyAreaIcon: {
    fontSize: 32,
    marginBottom: 8,
    opacity: 0.5,
  },
  emptyAreaText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
