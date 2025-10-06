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
import { tecnicoAPI, evidenciasAPI, Ticket } from '../config/api';

export default function MisEvidenciasScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  // Estados para evidencias
  const [todasLasEvidencias, setTodasLasEvidencias] = useState<any[]>([]);
  const [evidenciasGlobalesLoading, setEvidenciasGlobalesLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Cargar evidencias al montar el componente
  useEffect(() => {
    cargarTodasLasEvidencias();
  }, []);

  // Función para cargar todas las evidencias del técnico
  const cargarTodasLasEvidencias = async () => {
    try {
      setEvidenciasGlobalesLoading(true);
      
      console.log('📱 [EVIDENCIA] Cargando todas las evidencias del técnico...');
      
      // Obtener todos los tickets del técnico (usar historial completo)
      const tickets = await tecnicoAPI.getTicketsHistorial();
      
      console.log('📱 [EVIDENCIA] Tickets encontrados:', tickets.length);
      
      // Obtener evidencias de cada ticket
      const todasEvidencias: any[] = [];
      
      for (const ticket of tickets) {
        try {
          const evidencias = await evidenciasAPI.getEvidences(ticket.id);
          
          // Agregar información del ticket a cada evidencia
          const evidenciasConTicket = evidencias.map((evidencia: any) => ({
            ...evidencia,
            ticketNumero: ticket.id,
            ticketConsulta: ticket.titulo || ticket.consulta,
            ticketEstado: ticket.estado
          }));
          todasEvidencias.push(...evidenciasConTicket);
        } catch (error) {
          console.error(`Error obteniendo evidencias del ticket ${ticket.id}:`, error);
        }
      }
      
      console.log('📱 [EVIDENCIA] Total evidencias encontradas:', todasEvidencias.length);
      setTodasLasEvidencias(todasEvidencias);
    } catch (error) {
      console.error('❌ [EVIDENCIA] Error cargando evidencias:', error);
      Alert.alert('Error', 'No se pudieron cargar las evidencias. Inténtalo de nuevo.');
    } finally {
      setEvidenciasGlobalesLoading(false);
    }
  };

  // Función para descargar evidencia
  const descargarEvidencia = async (ticketId: number, nombreArchivo: string) => {
    try {
      console.log('📱 [EVIDENCIA] Descargando evidencia:', nombreArchivo, 'del ticket:', ticketId);
      
      // En React Native, usar Linking para abrir la URL de descarga
      const downloadUrl = `${API_CONFIG.BASE_URL}/api/evidencias/descargar/${ticketId}/${encodeURIComponent(nombreArchivo)}`;
      
      const { Linking } = require('react-native');
      await Linking.openURL(downloadUrl);
      
      console.log('✅ [EVIDENCIA] Descarga iniciada');
      Alert.alert('Éxito', `Descarga de ${nombreArchivo} iniciada`);
    } catch (error) {
      console.error('❌ [EVIDENCIA] Error descargando archivo:', error);
      const errorMessage = (error as Error).message || 'Error de conexión al descargar';
      Alert.alert('Error', errorMessage);
    }
  };

  // Filtrar evidencias por texto de búsqueda
  const evidenciasFiltradas = todasLasEvidencias.filter(evidencia => 
    !searchText || 
    evidencia.nombreArchivo?.toLowerCase().includes(searchText.toLowerCase()) ||
    evidencia.descripcion?.toLowerCase().includes(searchText.toLowerCase()) ||
    evidencia.ticketConsulta?.toLowerCase().includes(searchText.toLowerCase())
  );

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
          <Text style={styles.headerTitle}>Mis Evidencias</Text>
          <View style={styles.placeholder} />
        </View>

        <Text style={styles.subtitle}>Registra y consulta las evidencias de tus tickets.</Text>

        {/* Barra de búsqueda */}
        <View style={styles.searchSection}>
          <TextInput 
            style={styles.searchInput}
            placeholder="Buscar evidencias..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Filtros y contador */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Total: {todasLasEvidencias.length} evidencias</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={cargarTodasLasEvidencias}
          >
            <Text style={styles.filterButtonText}>🔄 Actualizar</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de evidencias */}
        <ScrollView style={styles.content}>
          {evidenciasGlobalesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Cargando evidencias...</Text>
            </View>
          ) : evidenciasFiltradas.length > 0 ? (
            evidenciasFiltradas.map((evidencia, index) => {
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
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#374151',
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
    color: '#e5e7eb',
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
    marginBottom: 20,
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
  evidenceItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#333333',
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
    color: '#ffffff',
    marginBottom: 4,
  },
  evidenceSubtitle: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 4,
  },
  evidenceDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  evidenceSize: {
    fontSize: 12,
    color: '#60a5fa',
    marginBottom: 2,
  },
  evidenceType: {
    fontSize: 12,
    color: '#60a5fa',
    fontWeight: '500',
    marginTop: 2,
  },
  evidenceTicket: {
    fontSize: 11,
    color: '#60a5fa',
    fontWeight: '500',
    marginTop: 2,
  },
  evidenceUploader: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 2,
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


