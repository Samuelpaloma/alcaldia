import React, { useState, useEffect } from 'react';
import { api, EvidenciaResponseDTO } from '../../../shared/api';
import './EvidencesManagement.css';

interface EvidencesManagementProps {
  userRole: string;
  ticketId?: number;
}

const EvidencesManagement: React.FC<EvidencesManagementProps> = ({ userRole, ticketId }) => {
  const [evidencias, setEvidencias] = useState<EvidenciaResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Cargar evidencias
  const loadEvidencias = async () => {
    if (!ticketId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getEvidenciasPorTicket(ticketId);
      setEvidencias(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar evidencias');
      console.error('Error cargando evidencias:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar evidencias al montar el componente
  useEffect(() => {
    loadEvidencias();
  }, [ticketId]);

  // Manejar selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño del archivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 10MB.');
        return;
      }
      
      // Validar tipo de archivo
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Tipo de archivo no permitido. Solo se permiten imágenes, PDFs y documentos de Office.');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  // Subir evidencia
  const handleUpload = async () => {
    if (!selectedFile || !ticketId) return;

    try {
      setUploading(true);
      setError(null);

      // Convertir archivo a base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Content = reader.result as string;
          const base64Data = base64Content.split(',')[1]; // Remover el prefijo data:type;base64,
          
          await api.subirEvidencia({
            ticketId,
            nombreArchivo: selectedFile.name,
            tipoArchivo: selectedFile.type,
            contenidoArchivo: base64Data
          });

          setShowUploadModal(false);
          setSelectedFile(null);
          loadEvidencias();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al subir evidencia');
          console.error('Error subiendo evidencia:', err);
        } finally {
          setUploading(false);
        }
      };
      
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar archivo');
      console.error('Error procesando archivo:', err);
      setUploading(false);
    }
  };

  // Descargar evidencia
  const handleDownload = async (evidencia: EvidenciaResponseDTO) => {
    try {
      const response = await api.descargarEvidencia(evidencia.ticketId, evidencia.nombreArchivo);
      
      // Crear enlace de descarga
      const blob = new Blob([response], { type: evidencia.tipoArchivo });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = evidencia.nombreCompletoArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar evidencia');
      console.error('Error descargando evidencia:', err);
    }
  };

  // Obtener icono según tipo de archivo
  const getFileIcon = (tipoArchivo: string) => {
    if (tipoArchivo.startsWith('image/')) {
      return 'fas fa-image';
    } else if (tipoArchivo === 'application/pdf') {
      return 'fas fa-file-pdf';
    } else if (tipoArchivo.includes('word') || tipoArchivo.includes('document')) {
      return 'fas fa-file-word';
    } else if (tipoArchivo.includes('excel') || tipoArchivo.includes('spreadsheet')) {
      return 'fas fa-file-excel';
    } else if (tipoArchivo === 'text/plain') {
      return 'fas fa-file-alt';
    } else {
      return 'fas fa-file';
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Verificar permisos
  const canManage = userRole === 'TECNICO' || userRole === 'ADMINISTRADOR' || userRole === 'SUPERADMIN';

  if (!ticketId) {
    return (
      <div className="evidences-management">
        <div className="no-ticket">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>No hay ticket seleccionado</h3>
          <p>Selecciona un ticket para ver sus evidencias.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="evidences-management">
      <div className="evidences-header">
        <h3>Evidencias del Ticket #{ticketId}</h3>
        {canManage && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowUploadModal(true)}
          >
            <i className="fas fa-upload"></i> Subir Evidencia
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Lista de evidencias */}
      <div className="evidences-list">
        {loading ? (
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i>
            Cargando evidencias...
          </div>
        ) : evidencias.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-folder-open"></i>
            <h4>No hay evidencias</h4>
            <p>Este ticket no tiene evidencias adjuntas.</p>
            {canManage && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowUploadModal(true)}
              >
                <i className="fas fa-upload"></i> Subir Primera Evidencia
              </button>
            )}
          </div>
        ) : (
          <div className="evidences-grid">
            {evidencias.map((evidencia) => (
              <div key={evidencia.idEvidencia} className="evidence-card">
                <div className="evidence-icon">
                  <i className={getFileIcon(evidencia.tipoArchivo)}></i>
                </div>
                
                <div className="evidence-info">
                  <h4 className="evidence-name">{evidencia.nombreArchivo}</h4>
                  <p className="evidence-details">
                    <span className="evidence-type">{evidencia.tipoArchivo}</span>
                    <span className="evidence-size">{formatFileSize(evidencia.tamañoArchivo)}</span>
                  </p>
                  <p className="evidence-date">
                    Subido el {new Date(evidencia.fechaSubida).toLocaleDateString()} por {evidencia.subidoPor.nombre}
                  </p>
                </div>
                
                <div className="evidence-actions">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleDownload(evidencia)}
                    title="Descargar"
                  >
                    <i className="fas fa-download"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de subir evidencia */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Subir Evidencia</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowUploadModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="file-upload-area">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" className="file-upload-label">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <span>Seleccionar archivo</span>
                  <small>Máximo 10MB. Formatos: imágenes, PDF, Word, Excel, texto</small>
                </label>
                
                {selectedFile && (
                  <div className="selected-file">
                    <i className={getFileIcon(selectedFile.type)}></i>
                    <div className="file-info">
                      <span className="file-name">{selectedFile.name}</span>
                      <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                    </div>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setSelectedFile(null)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowUploadModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Subiendo...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload"></i> Subir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidencesManagement;
