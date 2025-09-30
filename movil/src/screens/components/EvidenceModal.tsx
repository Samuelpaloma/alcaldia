import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import EvidenceService, { EvidenceRequest } from '../../services/EvidenceService';
import { useTheme } from '../../hooks/useTheme';

interface EvidenceModalProps {
  visible: boolean;
  onClose: () => void;
  ticketId: number;
  onEvidenceUploaded: () => void;
}

export default function EvidenceModal({ visible, onClose, ticketId, onEvidenceUploaded }: EvidenceModalProps) {
  const { theme } = useTheme();
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const seleccionarArchivo = async () => {
    try {
      console.log('📁 Iniciando selección de archivo...');
      
      // Crear input file para web - solo imágenes y videos
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/*';
      input.style.display = 'none';
      
      // Agregar al DOM temporalmente
      document.body.appendChild(input);
      
      // Crear promesa para manejar la selección
      const filePromise = new Promise((resolve, reject) => {
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            resolve(file);
          } else {
            reject(new Error('No se seleccionó ningún archivo'));
          }
          // Limpiar el input
          document.body.removeChild(input);
        };
        
        input.oncancel = () => {
          reject(new Error('Selección cancelada'));
          document.body.removeChild(input);
        };
      });
      
      // Abrir el selector de archivos
      input.click();
      
      // Esperar a que el usuario seleccione un archivo
      const file = await filePromise as File;
      
      console.log('📁 Archivo seleccionado:', file);
      
      // Convertir a formato compatible
      const archivoSeleccionado = {
        uri: URL.createObjectURL(file),
        type: file.type || 'application/octet-stream',
        name: file.name || `evidencia_${Date.now()}`,
        size: file.size,
      };
      
      console.log('📁 Archivo procesado:', archivoSeleccionado);
      setArchivo(archivoSeleccionado);
      
    } catch (error) {
      console.error('❌ Error seleccionando archivo:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo: ' + error.message);
    }
  };

  const subirEvidencia = async () => {
    // Validar que ambos campos sean obligatorios
    if (!archivo) {
      Alert.alert('Error', 'Por favor selecciona un archivo');
      return;
    }

    if (!descripcion.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción de la evidencia');
      return;
    }

    if (descripcion.trim().length < 10) {
      Alert.alert('Error', 'La descripción debe tener al menos 10 caracteres');
      return;
    }

    try {
      setIsLoading(true);

      const evidenceData: EvidenceRequest = {
        ticketId,
        descripcion: descripcion.trim(),
        tipoEvidencia: 'IMAGEN', // Tipo por defecto
        archivo,
      };

      // Subir evidencia real
      console.log('📎 Subiendo evidencia...');
      await EvidenceService.subirEvidencia(evidenceData);
      
      Alert.alert('Éxito', 'Evidencia subida correctamente');
      onEvidenceUploaded();
      limpiarFormulario();
      onClose();
    } catch (error) {
      console.error('Error subiendo evidencia:', error);
      Alert.alert('Error', 'No se pudo subir la evidencia');
    } finally {
      setIsLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setDescripcion('');
    setArchivo(null);
  };

  const handleClose = () => {
    limpiarFormulario();
    onClose();
  };

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Subir Evidencia</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción *</Text>
            <Text style={styles.requiredText}>Mínimo 10 caracteres</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Describe la evidencia..."
              placeholderTextColor="#666"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={[
              styles.characterCount,
              { color: descripcion.length >= 10 ? '#4caf50' : '#ff6b6b' }
            ]}>
              {descripcion.length}/10 caracteres mínimos
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Archivo</Text>
            <TouchableOpacity 
              style={styles.fileButton} 
              onPress={() => {
                console.log('📁 Botón de archivo presionado');
                seleccionarArchivo();
              }}
            >
              <Text style={styles.fileButtonText}>
                {archivo ? '📎 ' + archivo.name : '📁 Seleccionar archivo'}
              </Text>
            </TouchableOpacity>
            {archivo && (
              <Text style={styles.fileInfo}>
                Archivo seleccionado: {archivo.name}
              </Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton, 
              (isLoading || !archivo || !descripcion.trim() || descripcion.trim().length < 10) && styles.submitButtonDisabled
            ]}
            onPress={subirEvidencia}
            disabled={isLoading || !archivo || !descripcion.trim() || descripcion.trim().length < 10}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Subir Evidencia</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  requiredText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 80,
  },
  fileButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#007bff',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  fileButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
  },
  fileInfo: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  submitButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#555',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
