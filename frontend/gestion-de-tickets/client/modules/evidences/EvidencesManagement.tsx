import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { api, TicketResponseDTO } from '../../../shared/api';
import './EvidencesManagement.css';
import { 
  Download, 
  Eye, 
  FileText, 
  Image, 
  File, 
  Calendar,
  User,
  Search,
  Filter,
  Upload,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface EvidencesManagementProps {
  userRole: string;
}

interface Evidencia {
  id: number;
  nombreArchivo: string;
  descripcion: string;
  fechaSubida: string;
  subidoPor: string;
  tipoArchivo: string;
  tamaño: number;
  ticketId: number;
}

export const EvidencesManagement: React.FC<EvidencesManagementProps> = ({ userRole }) => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketResponseDTO | null>(null);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'documents' | 'other'>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadData, setUploadData] = useState({
    archivo: null as File | null,
    descripcion: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const ticketsData = await api.getTodosLosTickets();
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error cargando tickets:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEvidencias = async (ticketId: number) => {
    try {
      const evidenciasData = await api.getEvidenciasPorTicket(ticketId);
      setEvidencias(evidenciasData);
    } catch (error) {
      console.error('Error cargando evidencias:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las evidencias",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (ticketId: number, nombreArchivo: string) => {
    try {
      const blob = await api.descargarEvidencia(ticketId, nombreArchivo);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo;
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

  const handleUpload = async () => {
    if (!selectedTicket || !uploadData.archivo) return;

    try {
      setSaving(true);
      await api.subirEvidencia(
        selectedTicket.id,
        uploadData.archivo,
        uploadData.descripcion
      );
      await loadEvidencias(selectedTicket.id);
      setShowUploadDialog(false);
      setUploadData({ archivo: null, descripcion: '' });
      toast({
        title: "Evidencia subida",
        description: "La evidencia se subió correctamente",
      });
    } catch (error) {
      console.error('Error subiendo evidencia:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la evidencia",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getFileIcon = (tipoArchivo: string) => {
    if (tipoArchivo.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (tipoArchivo.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (tipoArchivo.includes('word') || tipoArchivo.includes('document')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileTypeColor = (tipoArchivo: string) => {
    if (tipoArchivo.startsWith('image/')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (tipoArchivo.includes('pdf')) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (tipoArchivo.includes('word') || tipoArchivo.includes('document')) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredEvidencias = evidencias.filter(evidencia => {
    const matchesSearch = evidencia.nombreArchivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evidencia.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' ||
                         (filterType === 'images' && evidencia.tipoArchivo.startsWith('image/')) ||
                         (filterType === 'documents' && (evidencia.tipoArchivo.includes('pdf') || evidencia.tipoArchivo.includes('document'))) ||
                         (filterType === 'other' && !evidencia.tipoArchivo.startsWith('image/') && !evidencia.tipoArchivo.includes('pdf') && !evidencia.tipoArchivo.includes('document'));
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="evidences-module">
      <div className="module-header">
        <div className="header-content">
          <h1 className="page-title">Gestión de Evidencias</h1>
          <p className="page-subtitle">Administra las evidencias de los tickets</p>
        </div>
        <div className="header-actions">
          {selectedTicket && (
            <Button onClick={() => setShowUploadDialog(true)} className="upload-btn">
              <Upload className="h-4 w-4" />
              Subir Evidencia
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Tickets */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Tickets</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                    <p>No hay tickets disponibles</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {tickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => {
                          setSelectedTicket(ticket);
                          loadEvidencias(ticket.id);
                        }}
                        className={`w-full text-left p-3 hover:bg-muted transition-colors ${
                          selectedTicket?.id === ticket.id ? 'bg-muted border-r-2 border-primary' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">#{ticket.id}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {ticket.asunto}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(ticket.fechaCreacion).toLocaleDateString()}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evidencias del Ticket Seleccionado */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Evidencias - Ticket #{selectedTicket.id}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{selectedTicket.asunto}</p>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar evidencias..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterType === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilterType('all')}
                      size="sm"
                    >
                      Todas
                    </Button>
                    <Button
                      variant={filterType === 'images' ? 'default' : 'outline'}
                      onClick={() => setFilterType('images')}
                      size="sm"
                    >
                      Imágenes
                    </Button>
                    <Button
                      variant={filterType === 'documents' ? 'default' : 'outline'}
                      onClick={() => setFilterType('documents')}
                      size="sm"
                    >
                      Documentos
                    </Button>
                    <Button
                      variant={filterType === 'other' ? 'default' : 'outline'}
                      onClick={() => setFilterType('other')}
                      size="sm"
                    >
                      Otros
                    </Button>
                  </div>
                </div>

                {/* Lista de Evidencias */}
                <div className="space-y-3">
                  {filteredEvidencias.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No hay evidencias para este ticket</p>
                    </div>
                  ) : (
                    filteredEvidencias.map((evidencia) => (
                      <div key={evidencia.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-shrink-0">
                          {getFileIcon(evidencia.tipoArchivo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">{evidencia.nombreArchivo}</p>
                            <Badge className={getFileTypeColor(evidencia.tipoArchivo)}>
                              {evidencia.tipoArchivo.split('/')[1]?.toUpperCase() || 'FILE'}
                            </Badge>
                          </div>
                          {evidencia.descripcion && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {evidencia.descripcion}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {evidencia.subidoPor}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(evidencia.fechaSubida).toLocaleDateString()}
                            </span>
                            <span>{formatFileSize(evidencia.tamaño)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(evidencia.ticketId, evidencia.nombreArchivo)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Aquí podrías implementar una vista previa
                              toast({
                                title: "Vista previa",
                                description: "Función de vista previa en desarrollo",
                              });
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Selecciona un ticket para ver sus evidencias</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog Subir Evidencia */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir Evidencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="archivo">Archivo</Label>
              <Input
                id="archivo"
                type="file"
                onChange={(e) => setUploadData({
                  ...uploadData,
                  archivo: e.target.files?.[0] || null
                })}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
              />
              <p className="text-xs text-muted-foreground">
                Formatos permitidos: PDF, DOC, DOCX, JPG, PNG, GIF, TXT (máx. 10MB)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={uploadData.descripcion}
                onChange={(e) => setUploadData({
                  ...uploadData,
                  descripcion: e.target.value
                })}
                placeholder="Describe el contenido de la evidencia"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowUploadDialog(false)} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={saving || !uploadData.archivo}
              >
                {saving ? 'Subiendo...' : 'Subir Evidencia'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};