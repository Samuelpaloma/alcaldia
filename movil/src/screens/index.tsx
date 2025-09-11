import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  Image,
  Linking,
  TextInput
} from 'react-native';
import * as DocumentPicker from "expo-document-picker";
import Header from "../screens/Header";

interface Adjunto {
  id: number;
  nombre: string;
  tipo: string;
  url: string;
  fechaSubida: string;
}

interface Solicitud {
  id: number;
  tipo: string;
  dependencia: string;
  fecha: string;
  prioridad?: string;
  fechaFinalizacion?: string;
  adjuntos?: Adjunto[]; // Nuevo campo para adjuntos
}

export default function SolicitudesScreen(): React.JSX.Element {
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [showAdjuntoModal, setShowAdjuntoModal] = useState(false);
  const [mensajeAdjunto, setMensajeAdjunto] = useState('');
  const [archivoAdjunto, setArchivoAdjunto] = useState<string | null>(null);

  const seleccionarArchivo = () => {
    // Aquí luego integras react-native-document-picker o expo-image-picker
    setArchivoAdjunto("ArchivoEjemplo.pdf");
  };

  const solicitudesPendientes: Solicitud[] = [
    {
      id: 1,
      tipo: "Reparación de vía",
      dependencia: "Gobernacion del Huila",
      fecha: "2025-08-25",
      prioridad: "Alta"
    },
    {
      id: 2,
      tipo: "Alumbrado público",
      dependencia: "Sena Industria",
      fecha: "2025-08-24",
      prioridad: "Media"
    }
  ];

  const solicitudesEnProceso: Solicitud[] = [
    {
      id: 3,
      tipo: "Mantenimiento de parque",
      dependencia: "Alcaldia de Neiva",
      fecha: "2025-08-22",
      prioridad: "Media",
    },
    {
      id: 4,
      tipo: "Limpieza de alcantarilla",
      dependencia: "Ministerio de Transporte",
      fecha: "2025-08-20",
      prioridad: "Alta",
    }
  ];

  const solicitudesFinalizadas: Solicitud[] = [
    {
      id: 5,
      tipo: "Poda de árboles",
      dependencia: "Terminal de Transportes de Neiva",
      fecha: "2025-08-15",
      fechaFinalizacion: "2025-08-18",
      // Ejemplo de adjuntos quemados - fácil de reemplazar con datos del backend
      adjuntos: [
        {
          id: 1,
          nombre: "evidencia_poda_antes.jpg",
          tipo: "image/jpeg",
          url: "https://ejemplo.com/archivos/evidencia_poda_antes.jpg",
          fechaSubida: "2025-08-18"
        },
        {
          id: 2,
          nombre: "evidencia_poda_despues.jpg",
          tipo: "image/jpeg", 
          url: "https://ejemplo.com/archivos/evidencia_poda_despues.jpg",
          fechaSubida: "2025-08-18"
        },
        {
          id: 3,
          nombre: "reporte_trabajo_finalizado.pdf",
          tipo: "application/pdf",
          url: "https://ejemplo.com/archivos/reporte_trabajo_finalizado.pdf",
          fechaSubida: "2025-08-18"
        }
      ]
    }
  ];

  const showSolicitudDetail = (solicitud: Solicitud): void => {
    setSelectedSolicitud(solicitud);
    setShowInfoModal(true);
  };

  const handleOpenAdjunto = async (adjunto: Adjunto) => {
    try {
      const supported = await Linking.canOpenURL(adjunto.url);
      if (supported) {
        await Linking.openURL(adjunto.url);
      } else {
        Alert.alert("Error", "No se puede abrir este archivo");
      }
    } catch (error) {
      console.error("Error al abrir adjunto:", error);
      Alert.alert("Error", "No se pudo abrir el archivo");
    }
  };

  const getFileIcon = (tipo: string): string => {
    if (tipo.includes('image')) return '🖼️';
    if (tipo.includes('pdf')) return '📄';
    if (tipo.includes('document') || tipo.includes('word')) return '📝';
    if (tipo.includes('spreadsheet') || tipo.includes('excel')) return '📊';
    return '📎';
  };

  const renderSolicitudCard = (solicitud: Solicitud): React.JSX.Element => {
    return (
      <TouchableOpacity 
        key={solicitud.id}
        style={styles.solicitudCard}
        onPress={() => showSolicitudDetail(solicitud)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.tipoText}>{solicitud.tipo}</Text>
        </View>
        
        <Text style={styles.direccionText}> {solicitud.dependencia}</Text>
        <Text style={styles.fechaText}> Fecha: {solicitud.fecha}</Text>
        
        {solicitud.prioridad && (
          <Text style={[styles.prioridadText, 
            solicitud.prioridad === 'Alta' && styles.prioridadAlta,
            solicitud.prioridad === 'Media' && styles.prioridadMedia
          ]}>
              Prioridad: {solicitud.prioridad}
          </Text>
        )}
        
        {solicitud.fechaFinalizacion && (
          <Text style={styles.fechaFinalizacionText}> Finalizada: {solicitud.fechaFinalizacion}</Text>
        )}

        {/* Indicador de adjuntos para solicitudes finalizadas */}
        {solicitud.adjuntos && solicitud.adjuntos.length > 0 && (
          <Text style={styles.adjuntosIndicator}>
            📎 {solicitud.adjuntos.length} archivo{solicitud.adjuntos.length !== 1 ? 's' : ''} adjunto{solicitud.adjuntos.length !== 1 ? 's' : ''}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderSection = (title: string, solicitudes: Solicitud[], emptyMessage: string): React.JSX.Element => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionContent}>
          {solicitudes.length > 0 ? (
            solicitudes.map(renderSolicitudCard)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header principal con logo SENA y usuario */}
        <Header />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Sección de Solicitudes Pendientes */}
          {renderSection("Solicitudes pendientes", solicitudesPendientes, "No hay solicitudes pendientes")}
          
          {/* Sección de Solicitudes en Proceso */}
          {renderSection("Solicitudes en proceso", solicitudesEnProceso, "No hay solicitudes en proceso")}
          
          {/* Sección de Solicitudes Finalizadas */}
          {renderSection("Solicitudes finalizadas", solicitudesFinalizadas, "No hay solicitudes finalizadas")}
        </ScrollView>

        {/* Modal de información de solicitud */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showInfoModal}
          onRequestClose={() => setShowInfoModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedSolicitud ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalTitle}>Detalle de Solicitud</Text>
                  <Text style={styles.modalDetailText}>Caso: {selectedSolicitud.tipo}</Text>
                  <Text style={styles.modalDetailText}>Dependencia: {selectedSolicitud.dependencia}</Text>
                  <Text style={styles.modalDetailText}>Fecha: {selectedSolicitud.fecha}</Text>
                  {selectedSolicitud.prioridad && (
                    <Text style={styles.modalDetailText}>Prioridad: {selectedSolicitud.prioridad}</Text>
                  )}
                  {selectedSolicitud.fechaFinalizacion && (
                    <Text style={styles.modalDetailText}>Fecha finalización: {selectedSolicitud.fechaFinalizacion}</Text>
                  )}
                  
                  {/* Sección de adjuntos para solicitudes finalizadas */}
                  {selectedSolicitud.adjuntos && selectedSolicitud.adjuntos.length > 0 && (
                    <View style={styles.adjuntosSection}>
                      <Text style={styles.adjuntosTitle}>Archivos adjuntos:</Text>
                      {selectedSolicitud.adjuntos.map((adjunto) => (
                        <TouchableOpacity
                          key={adjunto.id}
                          style={styles.adjuntoItem}
                          onPress={() => handleOpenAdjunto(adjunto)}
                        >
                          <Text style={styles.adjuntoIcon}>{getFileIcon(adjunto.tipo)}</Text>
                          <View style={styles.adjuntoInfo}>
                            <Text style={styles.adjuntoNombre} numberOfLines={1}>
                              {adjunto.nombre}
                            </Text>
                            <Text style={styles.adjuntoFecha}>
                              Subido: {adjunto.fechaSubida}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </ScrollView>
              ) : (
                <View>
                  <Text style={styles.modalTitle}>Información</Text>
                  <Text style={styles.modalText}>
                    Aquí puedes ver todas tus solicitudes organizadas por estado
                  </Text>
                </View>
              )}
              
              {/* Botón de Cerrar (común a todos) */}
              <TouchableOpacity
                style={styles.modalButtonClose}
                onPress={() => {
                  setShowInfoModal(false);
                  setSelectedSolicitud(null);
                }}
              >
                <Text style={styles.modalButtonTextClose}>Cerrar</Text>
              </TouchableOpacity>

              {/* Si está en pendientes → mostrar botón Aceptar */}
              {selectedSolicitud && solicitudesPendientes.some(s => s.id === selectedSolicitud.id) && (
                <TouchableOpacity
                  style={styles.modalButtonConfirm}
                  onPress={() => {
                    Alert.alert("Aceptar", `Solicitud ${selectedSolicitud.id} aceptada ✅`);
                  }}
                >
                  <Text style={styles.modalButtonTextConfirm}>Aceptar</Text>
                </TouchableOpacity>
              )}

              {/* Si está en proceso → mostrar botón Adjuntar */}
              {selectedSolicitud && solicitudesEnProceso.some(s => s.id === selectedSolicitud.id) && (
                <TouchableOpacity
                  style={styles.modalButtonConfirm}
                  onPress={() => setShowAdjuntoModal(true)} 
                >
                  <Text style={styles.modalButtonTextConfirm}>Adjuntar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
                {/* Modal de adjunto */}
        <Modal
          visible={showAdjuntoModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAdjuntoModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.adjuntoModal}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAdjuntoModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.adjuntoTitle}>ADJUNTO</Text>

              <Text style={styles.label}>Mensaje</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Escribe lo que sucedió..."
                multiline
                numberOfLines={4}
                value={mensajeAdjunto}
                onChangeText={setMensajeAdjunto}
              />

              <Text style={styles.label}>Archivo</Text>
              <TouchableOpacity
                style={styles.fileButton}
                onPress={seleccionarArchivo}
              >
                <Text>
                  {archivoAdjunto ? archivoAdjunto : "Seleccionar archivo"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  console.log("Mensaje:", mensajeAdjunto);
                  console.log("Archivo:", archivoAdjunto);
                  setShowAdjuntoModal(false);
                }}
              >
                <Text style={styles.saveButtonText}>GUARDAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#30692E',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(48, 105, 46, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    flex: 1,
  },
  logoPlaceholder: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#30692E',
  },
  userButton: {
    padding: 5,
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userIconText: {
    fontSize: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#30692E',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  infoButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIcon: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoImage: {
    width: 60,
    height: 60,
  },

  userIconImage: {
    width: 50,
    height: 50,
    borderRadius: 15,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    paddingLeft: 15,
  },
  sectionContent: {
    backgroundColor: 'rgba(48, 105, 46, 0.4)',
    borderRadius: 15,
    padding: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 0,
  },
  solicitudCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 20,
    paddingHorizontal: 40,
    marginHorizontal: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'rgb(248, 249, 250)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tipoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  direccionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textAlign: 'left'
  },
  fechaText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textAlign: 'left'
  },
  prioridadText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 4
  },
  prioridadAlta: {
    color: '#dc2626',
  },
  prioridadMedia: {
    color: '#d97706',
  },
  fechaFinalizacionText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  adjuntosIndicator: {
    fontSize: 12,
    color: '#30692E',
    fontWeight: '500',
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    height: 'auto',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 280,
    maxWidth: '90%',
    maxHeight: '43%',
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalDetailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  estadoContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  // Nuevos estilos para la sección de adjuntos
  adjuntosSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  adjuntosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  adjuntoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  adjuntoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  adjuntoInfo: {
    flex: 1,
  },
  adjuntoNombre: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  adjuntoFecha: {
    fontSize: 12,
    color: '#666',
  },
    adjuntoModal: {
    width: '85%',
    backgroundColor: '#30692E',
    borderRadius: 10,
    padding: 20,
  },
  adjuntoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  label: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fileButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalButtonClose: {
    backgroundColor: '#AF0000',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  modalButtonConfirm: {
    backgroundColor: '#3FB101',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonTextClose: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonTextConfirm: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
    closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  // Estilos del modal de usuario
  userModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 0,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 200,
    maxWidth: 220,
    position: 'absolute',
    top: 115,
    right: 20,
  },
  userProfileHeader: {
    backgroundColor: '#30692E66',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  userAvatarText: {
    fontSize: 24,
    color: '#30692E',
  },
  userNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  userEmailText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  userModalActions: {
    padding: 0,
    alignItems: 'center',
  },
  userModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  logoutOption: {
    backgroundColor: 'white',
  },
  userModalOptionIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 16,
  },
  userModalOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  userModalOptionTextClose: {
    fontSize: 14,
    color: '#AF0000',
    fontWeight: '600',
  },
  userModalCloseButton: {
    display: 'none',
  },
  userModalCloseText: {
    display: 'none',
  },
});