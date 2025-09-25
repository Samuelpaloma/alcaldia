import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, Evidencia, TicketResponseDTO } from '../../../shared/api';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText, 
  Image,
  File,
  Calendar,
  User,
  Trash2,
  Upload,
  AlertCircle
} from 'lucide-react';
import './EvidencesModule.css';

interface EvidencesModuleProps {
  userRole: string;
}

const EvidencesModule: React.FC<EvidencesModuleProps> = ({ userRole }) => {
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ticketFilter, setTicketFilter] = useState('TODOS');
  const [typeFilter, setTypeFilter] = useState('TODOS');
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    ticketId: '',
    tipoEvidencia: 'IMAGEN',
    descripcion: '',
    archivo: null as File | null
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ticketsData = await api.getHistorialTickets(0, 50);
      setTickets(ticketsData.content || []);
      
      // Cargar evidencias de todos los tickets
      if (ticketsData.content && ticketsData.content.length > 0) {
        const evidenciasPromises = ticketsData.content.map(ticket => 
          api.getTicketEvidences(ticket.id).catch(() => [])
        );
        const evidenciasResults = await Promise.all(evidenciasPromises);
        const allEvidencias = evidenciasResults.flat();
        setEvidencias(allEvidencias);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEvidencias = evidencias.filter(evidencia => {
    const matchesSearch = 
      evidencia.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evidencia.nombreArchivo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTicket = ticketFilter === 'TODOS' || 
      evidencia.ticketId === parseInt(ticketFilter);
    
    const matchesType = typeFilter === 'TODOS' || 
      evidencia.tipoEvidencia === typeFilter;
    
    return matchesSearch && matchesTicket && matchesType;
  });

  const handleDownload = async (evidencia: Evidencia) => {
    try {
      const blob = await api.downloadEvidence(evidencia.ticketId, evidencia.nombreArchivo);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = evidencia.nombreArchivo;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error descargando evidencia:', err);
    }
  };

  const getFileIcon = (tipoEvidencia: string, extension?: string) => {
    if (tipoEvidencia === 'IMAGEN' || extension?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <Image className="w-5 h-5" />;
    } else if (extension?.match(/\.(pdf)$/i)) {
      return <FileText className="w-5 h-5" />;
    } else {
      return <File className="w-5 h-5" />;
    }
  };

  const getTypeColor = (tipoEvidencia: string) => {
    switch (tipoEvidencia) {
      case 'IMAGEN':
        return 'type-image';
      case 'DOCUMENTO':
        return 'type-document';
      case 'VIDEO':
        return 'type-video';
      default:
        return 'type-default';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="evidences-module">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando evidencias...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="evidences-module">
      <div className="module-header">
        <div className="header-content">
          <h1 className="page-title">Gestión de Evidencias</h1>
          <p className="page-subtitle">Administra archivos y evidencias de tickets</p>
        </div>
        <Button onClick={loadData} variant="outline" className="refresh-btn">
          <Upload className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {error && (
        <Card className="error-card">
          <CardContent className="p-4">
            <div className="flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros y búsqueda */}
      <Card className="filters-card">
        <CardContent className="p-6">
          <div className="filters-grid">
            <div className="search-container">
              <Search className="search-icon" />
              <Input
                placeholder="Buscar evidencias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <Filter className="w-4 h-4 mr-2" />
              <select
                value={ticketFilter}
                onChange={(e) => setTicketFilter(e.target.value)}
                className="filter-select"
              >
                <option value="TODOS">Todos los tickets</option>
                {tickets.map(ticket => (
                  <option key={ticket.id} value={ticket.id}>
                    #{ticket.id} - {ticket.asunto}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="TODOS">Todos los tipos</option>
                <option value="IMAGEN">Imágenes</option>
                <option value="DOCUMENTO">Documentos</option>
                <option value="VIDEO">Videos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de evidencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Evidencias ({filteredEvidencias.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvidencias.length === 0 ? (
            <div className="empty-state">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron evidencias</p>
            </div>
          ) : (
            <div className="evidences-grid">
              {filteredEvidencias.map(evidencia => (
                <div key={evidencia.idEvidencia} className="evidence-card">
                  <div className="evidence-header">
                    <div className="evidence-icon">
                      {getFileIcon(evidencia.tipoEvidencia, evidencia.extensionArchivo)}
                    </div>
                    <div className="evidence-info">
                      <h3 className="evidence-name">{evidencia.nombreArchivo}</h3>
                      <div className={`evidence-type ${getTypeColor(evidencia.tipoEvidencia)}`}>
                        {evidencia.tipoEvidencia}
                      </div>
                    </div>
                    <div className="evidence-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(evidencia)}
                        className="action-btn"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="action-btn"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="evidence-content">
                    {evidencia.descripcion && (
                      <p className="evidence-description">{evidencia.descripcion}</p>
                    )}
                    
                    <div className="evidence-meta">
                      <div className="meta-item">
                        <span className="meta-label">Ticket:</span>
                        <span className="meta-value">#{evidencia.ticketId}</span>
                      </div>
                      
                      <div className="meta-item">
                        <span className="meta-label">Tamaño:</span>
                        <span className="meta-value">
                          {evidencia.tamanioArchivo ? formatFileSize(evidencia.tamanioArchivo) : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="meta-item">
                        <span className="meta-label">Subido:</span>
                        <span className="meta-value">
                          {new Date(evidencia.fechaSubida).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {evidencia.subidoPor && (
                        <div className="meta-item">
                          <span className="meta-label">Por:</span>
                          <span className="meta-value">{evidencia.subidoPor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="evidence-footer">
                    <div className="evidence-status">
                      {evidencia.activa ? (
                        <span className="status-active">Activa</span>
                      ) : (
                        <span className="status-inactive">Inactiva</span>
                      )}
                    </div>
                    
                    <div className="evidence-actions-footer">
                      <Button
                        variant="outline"
                        size="sm"
                        className="action-btn-small"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="action-btn-small"
                      >
                        <Download className="w-4 h-4" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EvidencesModule;
