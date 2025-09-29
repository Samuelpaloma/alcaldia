import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  File,
  FileText,
  Image,
  Download,
  Upload,
  Paperclip,
  X,
  Check,
  AlertCircle,
  Eye,
  Play
} from "lucide-react";
import { api, ArchivoTicketInfo } from "@shared/api";

interface ArchivosConversacionProps {
  ticketId: number;
  onArchivoSubido?: () => void;
}

export default function ArchivosConversacion({ ticketId, onArchivoSubido }: ArchivosConversacionProps) {
  const { toast } = useToast();
  const [archivos, setArchivos] = useState<ArchivoTicketInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comentario, setComentario] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [archivoPreview, setArchivoPreview] = useState<ArchivoTicketInfo | null>(null);

  // Cargar archivos al montar el componente
  useEffect(() => {
    loadArchivos();
  }, [ticketId]);

  const loadArchivos = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 [DEBUG] Cargando archivos para ticket:', ticketId);
      const archivos = await api.getArchivosTicket(ticketId);
      console.log('🔍 [DEBUG] Archivos recibidos:', archivos);
      
      if (archivos && archivos.length > 0) {
        // Guardar todos los archivos
        setArchivos(archivos);
        console.log('✅ [DEBUG] Archivos cargados:', archivos.length, 'archivos');
      } else {
        setArchivos([]);
        console.log('🔍 [DEBUG] No hay archivos para este ticket');
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error cargando archivos:', error);
      setArchivos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo no puede ser mayor a 10MB",
          variant: "destructive",
        });
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/rtf',
        'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
        'video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv',
        'audio/mpeg', 'audio/wav', 'audio/ogg'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Tipo de archivo no permitido",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      await api.subirArchivoTicketNuevo(selectedFile, ticketId, comentario);
      
      toast({
        title: "Archivo subido",
        description: "El archivo se subió correctamente",
      });

      // Limpiar formulario
      setSelectedFile(null);
      setComentario('');
      setShowUploadDialog(false);

      // Recargar archivos
      await loadArchivos();
      onArchivoSubido?.();
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el archivo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (archivoId: number) => {
    try {
      const blob = await api.descargarArchivoTicketEspecifico(ticketId, archivoId);
      const archivo = archivos.find(a => a.id === archivoId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = archivo?.nombreCompleto || 'archivo';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error descargando archivo:', error);
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo",
        variant: "destructive",
      });
    }
  };

  const handlePreview = async (archivoId: number) => {
    const archivo = archivos.find(a => a.id === archivoId);
    if (!archivo) {
      console.error('❌ [DEBUG] Archivo no encontrado para previsualización:', archivoId);
      return;
    }

    console.log('🔍 [DEBUG] Iniciando previsualización:', {
      archivoId,
      ticketId,
      nombreArchivo: archivo.nombreCompleto,
      esImagen: archivo.esImagen,
      esPDF: archivo.esPDF
    });

    try {
      console.log('🔍 [DEBUG] Llamando a previsualizarArchivoTicketEspecifico...');
      const blob = await api.previsualizarArchivoTicketEspecifico(ticketId, archivoId);
      console.log('✅ [DEBUG] Blob recibido:', blob);
      
      const url = window.URL.createObjectURL(blob);
      console.log('✅ [DEBUG] URL creada:', url);
      
      setArchivoPreview(archivo);
      setPreviewUrl(url);
      setShowPreview(true);
      
      console.log('✅ [DEBUG] Modal de previsualización abierto');
    } catch (error) {
      console.error('❌ [DEBUG] Error previsualizando archivo:', error);
      toast({
        title: "Error",
        description: "No se pudo previsualizar el archivo: " + error.message,
        variant: "destructive",
      });
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setArchivoPreview(null);
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const getFileIcon = (tipoMime: string) => {
    if (tipoMime.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (tipoMime === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (tipoMime.includes('word') || tipoMime.includes('document')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (tipoMime.includes('excel') || tipoMime.includes('spreadsheet')) {
      return <FileText className="h-5 w-5 text-green-500" />;
    } else if (tipoMime.includes('powerpoint') || tipoMime.includes('presentation')) {
      return <FileText className="h-5 w-5 text-orange-500" />;
    } else if (tipoMime.includes('zip') || tipoMime.includes('rar') || tipoMime.includes('7z')) {
      return <File className="h-5 w-5 text-purple-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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

  return (
    <div className="space-y-4">
      {/* Header con botón de subir */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          Archivos del Ticket
        </h3>
        <Button 
          onClick={() => setShowUploadDialog(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Subir Archivo
        </Button>
      </div>

      {/* Archivo actual */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : archivos.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <File className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-2">No hay archivos adjuntos</p>
          <p className="text-sm text-gray-400 mb-4">
            Sube archivos para compartir información adicional sobre este ticket
          </p>
          <Button 
            onClick={() => setShowUploadDialog(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Subir Primer Archivo
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <File className="h-4 w-4" />
            <span>Archivos adjuntos ({archivos.length})</span>
          </div>
          
          <div className="space-y-2">
            {archivos.map((archivo) => (
              <div key={archivo.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(archivo.tipoMime)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {archivo.nombreCompleto}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(archivo.tamañoArchivo)} • {archivo.extension.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(archivo.esImagen || archivo.esPDF) && (
                      <Button
                        onClick={() => handlePreview(archivo.id)}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        title="Previsualizar archivo"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDownload(archivo.id)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      title="Descargar archivo"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Subido por {archivo.subidoPor} • {formatDate(archivo.fechaSubida)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialog para subir archivo */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Subir Archivo
                <Button
                  onClick={() => setShowUploadDialog(false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Seleccionar Archivo
                </label>
                <Input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.zip,.rar,.7z,.mp4,.avi,.mov,.wmv,.mp3,.wav,.ogg"
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Check className="h-4 w-4" />
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Comentario (opcional)
                </label>
                <Input
                  type="text"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Describe el archivo..."
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <AlertCircle className="h-4 w-4" />
                <span>Máximo 10MB. Tipos permitidos: imágenes, documentos, videos, audio, comprimidos</span>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setShowUploadDialog(false)}
                  variant="outline"
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? 'Subiendo...' : 'Subir'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de previsualización */}
      {showPreview && previewUrl && archivoPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {getFileIcon(archivoPreview.tipoMime)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {archivoPreview.nombreCompleto}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(archivoPreview.tamañoArchivo)} • {archivoPreview.extension.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleDownload}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
                <Button
                  onClick={closePreview}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Contenido de previsualización */}
            <div className="flex-1 p-4 overflow-auto">
              {archivoPreview?.esImagen ? (
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt={archivoPreview.nombreCompleto}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              ) : archivoPreview?.esPDF ? (
                <div className="w-full h-full">
                  <iframe
                    src={previewUrl}
                    className="w-full h-full min-h-[500px] border-0 rounded-lg"
                    title={archivoPreview.nombreCompleto}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <File className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Previsualización no disponible para este tipo de archivo</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
