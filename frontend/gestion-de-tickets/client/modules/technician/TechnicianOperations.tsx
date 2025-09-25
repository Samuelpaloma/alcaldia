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
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Upload, 
  Download, 
  Eye, 
  MessageSquare,
  FileText,
  Calendar,
  User,
  AlertCircle,
  BarChart3
} from 'lucide-react';

interface TechnicianOperationsProps {
  userRole: string;
}

interface EvidenciaFormData {
  archivo: File | null;
  descripcion: string;
}

export const TechnicianOperations: React.FC<TechnicianOperationsProps> = ({ userRole }) => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketResponseDTO | null>(null);
  const [showEvidenciaDialog, setShowEvidenciaDialog] = useState(false);
  const [showEstadoDialog, setShowEstadoDialog] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [evidenciaData, setEvidenciaData] = useState<EvidenciaFormData>({
    archivo: null,
    descripcion: ''
  });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadTickets();
    loadStats();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const ticketsData = await api.getTicketsAsignadosTecnico();
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error cargando tickets:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tickets asignados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await api.getEstadisticasTecnico();
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleCambiarEstado = async () => {
    if (!selectedTicket || !nuevoEstado) return;

    try {
      setSaving(true);
      await api.cambiarEstadoTicket(selectedTicket.id, nuevoEstado);
      await loadTickets();
      setShowEstadoDialog(false);
      setSelectedTicket(null);
      setNuevoEstado('');
      toast({
        title: "Estado actualizado",
        description: "El estado del ticket se actualizó correctamente",
      });
    } catch (error) {
      console.error('Error cambiando estado:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del ticket",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubirEvidencia = async () => {
    if (!selectedTicket || !evidenciaData.archivo) return;

    try {
      setSaving(true);
      await api.subirEvidencia(
        selectedTicket.id, 
        evidenciaData.archivo, 
        evidenciaData.descripcion
      );
      setShowEvidenciaDialog(false);
      setEvidenciaData({ archivo: null, descripcion: '' });
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ABIERTO':
      case 'PENDIENTE':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'EN_PROGRESO':
      case 'EN_EJECUCION':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'RESUELTO':
      case 'TERMINADO':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'CERRADO':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABIERTO':
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EN_PROGRESO':
      case 'EN_EJECUCION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESUELTO':
      case 'TERMINADO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CERRADO':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'ALTA':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
      case 'MEDIA':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      case 'BAJA':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Tickets Asignados</h1>
          <p className="text-muted-foreground">Gestiona los tickets asignados a ti</p>
        </div>
        <Button onClick={loadTickets} variant="outline">
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total Tickets</p>
                  <p className="text-2xl font-bold">{stats.totalTickets || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">En Progreso</p>
                  <p className="text-2xl font-bold">{stats.ticketsEnProgreso || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Resueltos</p>
                  <p className="text-2xl font-bold">{stats.ticketsResueltos || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Promedio Resolución</p>
                  <p className="text-2xl font-bold">{stats.promedioResolucion || '0'}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : tickets.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tienes tickets asignados</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(ticket.estado)}
                    <div>
                      <h3 className="font-semibold text-foreground">{ticket.asunto}</h3>
                      <p className="text-sm text-muted-foreground">ID: {ticket.id}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(ticket.estado)}>
                    {ticket.estado}
                  </Badge>
                </div>

                {ticket.descripcion && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {ticket.descripcion}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Prioridad:</span>
                    <Badge className={getPriorityColor(ticket.prioridad)}>
                      {ticket.prioridad}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Creador:</span>
                    <span className="text-foreground">{ticket.creadorNombre || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Fecha:</span>
                    <span className="text-foreground">
                      {new Date(ticket.fechaCreacion).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowEstadoDialog(true);
                    }}
                    className="flex-1"
                  >
                    Cambiar Estado
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowEvidenciaDialog(true);
                    }}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog Cambiar Estado */}
      <Dialog open={showEstadoDialog} onOpenChange={setShowEstadoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado del Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nuevo Estado</Label>
              <select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Seleccionar estado</option>
                <option value="EN_PROGRESO">En Progreso</option>
                <option value="TERMINADO">Terminado</option>
                <option value="CERRADO">Cerrado</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowEstadoDialog(false)} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleCambiarEstado} 
                disabled={saving || !nuevoEstado}
              >
                {saving ? 'Cambiando...' : 'Cambiar Estado'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Subir Evidencia */}
      <Dialog open={showEvidenciaDialog} onOpenChange={setShowEvidenciaDialog}>
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
                onChange={(e) => setEvidenciaData({
                  ...evidenciaData,
                  archivo: e.target.files?.[0] || null
                })}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={evidenciaData.descripcion}
                onChange={(e) => setEvidenciaData({
                  ...evidenciaData,
                  descripcion: e.target.value
                })}
                placeholder="Descripción de la evidencia"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowEvidenciaDialog(false)} variant="outline">
                Cancelar
              </Button>
              <Button 
                onClick={handleSubirEvidencia} 
                disabled={saving || !evidenciaData.archivo}
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
