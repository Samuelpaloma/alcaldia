import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  CheckCircle,
  AlertCircle,
  Send,
  BarChart3,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';

interface SurveyResponse {
  id: number;
  ticketId: number;
  calificacion: number;
  comentarios: string;
  fechaRespuesta: string;
  categoria: string;
}

interface SurveyStats {
  totalRespuestas: number;
  promedioCalificacion: number;
  distribucionCalificaciones: { calificacion: number; cantidad: number }[];
  comentariosRecientes: string[];
}

const SatisfactionSurvey: React.FC = () => {
  const [encuestas, setEncuestas] = useState<SurveyResponse[]>([]);
  const [estadisticas, setEstadisticas] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState<number | null>(null);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    calificacion: '',
    fecha: ''
  });

  // Formulario de encuesta
  const [formulario, setFormulario] = useState({
    calificacion: '',
    comentarios: '',
    categoria: 'general'
  });

  const loadEncuestas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular datos de encuestas
      const encuestasData: SurveyResponse[] = [
        {
          id: 1,
          ticketId: 1001,
          calificacion: 5,
          comentarios: 'Excelente atención, problema resuelto rápidamente',
          fechaRespuesta: new Date(Date.now() - 3600000).toISOString(),
          categoria: 'Redes'
        },
        {
          id: 2,
          ticketId: 1002,
          calificacion: 4,
          comentarios: 'Buen servicio, pero tardó un poco más de lo esperado',
          fechaRespuesta: new Date(Date.now() - 7200000).toISOString(),
          categoria: 'Sistemas'
        },
        {
          id: 3,
          ticketId: 1003,
          calificacion: 5,
          comentarios: 'Muy satisfecho con la resolución',
          fechaRespuesta: new Date(Date.now() - 10800000).toISOString(),
          categoria: 'Hardware'
        },
        {
          id: 4,
          ticketId: 1004,
          calificacion: 3,
          comentarios: 'El técnico fue amable pero el problema no se resolvió completamente',
          fechaRespuesta: new Date(Date.now() - 14400000).toISOString(),
          categoria: 'Software'
        },
        {
          id: 5,
          ticketId: 1005,
          calificacion: 5,
          comentarios: 'Servicio excepcional, muy recomendado',
          fechaRespuesta: new Date(Date.now() - 18000000).toISOString(),
          categoria: 'Redes'
        }
      ];

      const statsData: SurveyStats = {
        totalRespuestas: encuestasData.length,
        promedioCalificacion: 4.4,
        distribucionCalificaciones: [
          { calificacion: 1, cantidad: 0 },
          { calificacion: 2, cantidad: 0 },
          { calificacion: 3, cantidad: 1 },
          { calificacion: 4, cantidad: 1 },
          { calificacion: 5, cantidad: 3 }
        ],
        comentariosRecientes: [
          'Excelente atención, problema resuelto rápidamente',
          'Buen servicio, pero tardó un poco más de lo esperado',
          'Muy satisfecho con la resolución'
        ]
      };

      setEncuestas(encuestasData);
      setEstadisticas(statsData);
    } catch (err) {
      setError('Error al cargar encuestas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEncuestas();
  }, []);

  const encuestasFiltradas = encuestas.filter(encuesta => {
    const cumpleBusqueda = !filtros.busqueda || 
      encuesta.comentarios.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const cumpleCalificacion = !filtros.calificacion || filtros.calificacion === 'all' ||
      encuesta.calificacion.toString() === filtros.calificacion;
    
    return cumpleBusqueda && cumpleCalificacion;
  });

  const abrirFormulario = (ticketId: number) => {
    setTicketSeleccionado(ticketId);
    setFormulario({
      calificacion: '',
      comentarios: '',
      categoria: 'general'
    });
    setMostrarFormulario(true);
  };

  const enviarEncuesta = async () => {
    if (!formulario.calificacion) {
      alert('Por favor selecciona una calificación');
      return;
    }

    try {
      const nuevaEncuesta: SurveyResponse = {
        id: Date.now(),
        ticketId: ticketSeleccionado || 0,
        calificacion: parseInt(formulario.calificacion),
        comentarios: formulario.comentarios,
        fechaRespuesta: new Date().toISOString(),
        categoria: formulario.categoria
      };

      setEncuestas(prev => [nuevaEncuesta, ...prev]);
      setMostrarFormulario(false);
      alert('Encuesta enviada exitosamente');
    } catch (err) {
      setError('Error al enviar encuesta');
    }
  };

  const getCalificacionColor = (calificacion: number) => {
    if (calificacion >= 4) return 'bg-green-100 text-green-800';
    if (calificacion >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getCalificacionIcon = (calificacion: number) => {
    if (calificacion >= 4) return <ThumbsUp className="w-4 h-4" />;
    if (calificacion >= 3) return <MessageSquare className="w-4 h-4" />;
    return <ThumbsDown className="w-4 h-4" />;
  };

  const renderStars = (calificacion: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= calificacion ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="satisfaction-survey">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando encuestas de satisfacción...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="satisfaction-survey">
      <div className="survey-header">
        <div className="header-content">
          <h1 className="survey-title">Encuestas de Satisfacción</h1>
          <p className="survey-subtitle">Gestiona y analiza la satisfacción de los clientes</p>
        </div>
        <Button onClick={() => abrirFormulario(0)} className="btn-create">
          <Send className="w-4 h-4 mr-2" />
          Nueva Encuesta
        </Button>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {/* Estadísticas */}
      {estadisticas && (
        <div className="stats-grid">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Respuestas</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.totalRespuestas}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.promedioCalificacion}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Satisfacción</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {((estadisticas.promedioCalificacion / 5) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Distribución de calificaciones */}
      {estadisticas && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Distribución de Calificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {estadisticas.distribucionCalificaciones.map((dist, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= dist.calificacion ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{dist.calificacion} estrella{dist.calificacion !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{dist.cantidad}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(dist.cantidad / Math.max(...estadisticas.distribucionCalificaciones.map(d => d.cantidad))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="filters-card">
        <CardContent className="p-6">
          <div className="filters-grid">
            <div className="filter-group">
              <Label htmlFor="busqueda">Buscar</Label>
              <Input
                id="busqueda"
                placeholder="Buscar en comentarios..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              />
            </div>
            
            <div className="filter-group">
              <Label htmlFor="calificacion">Calificación</Label>
              <Select
                value={filtros.calificacion}
                onValueChange={(value) => setFiltros({ ...filtros, calificacion: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las calificaciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las calificaciones</SelectItem>
                  <SelectItem value="5">5 estrellas</SelectItem>
                  <SelectItem value="4">4 estrellas</SelectItem>
                  <SelectItem value="3">3 estrellas</SelectItem>
                  <SelectItem value="2">2 estrellas</SelectItem>
                  <SelectItem value="1">1 estrella</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de encuestas */}
      <div className="surveys-grid">
        {encuestasFiltradas.map(encuesta => (
          <Card key={encuesta.id} className="survey-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">Ticket #{encuesta.ticketId}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{encuesta.categoria}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getCalificacionColor(encuesta.calificacion)}>
                    {getCalificacionIcon(encuesta.calificacion)}
                    <span className="ml-1">{encuesta.calificacion}/5</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Calificación:</Label>
                  <div className="mt-1">
                    {renderStars(encuesta.calificacion)}
                  </div>
                </div>
                
                {encuesta.comentarios && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Comentarios:</Label>
                    <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded">
                      {encuesta.comentarios}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(encuesta.fechaRespuesta).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Formulario */}
      {mostrarFormulario && (
        <div className="modal-overlay" onClick={() => setMostrarFormulario(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nueva Encuesta de Satisfacción</h2>
              <button onClick={() => setMostrarFormulario(false)} className="modal-close">×</button>
            </div>
            
            <div className="modal-body">
              <div className="space-y-4">
                <div className="form-group">
                  <Label htmlFor="calificacion">Calificación</Label>
                  <RadioGroup
                    value={formulario.calificacion}
                    onValueChange={(value) => setFormulario({ ...formulario, calificacion: value })}
                    className="flex space-x-4"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value.toString()} id={`rating-${value}`} />
                        <Label htmlFor={`rating-${value}`} className="flex items-center space-x-1">
                          <span>{value}</span>
                          <Star className="w-4 h-4 text-yellow-400" />
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="form-group">
                  <Label htmlFor="comentarios">Comentarios (opcional)</Label>
                  <Textarea
                    id="comentarios"
                    value={formulario.comentarios}
                    onChange={(e) => setFormulario({ ...formulario, comentarios: e.target.value })}
                    placeholder="Comparte tu experiencia..."
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={formulario.categoria}
                    onValueChange={(value) => setFormulario({ ...formulario, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="redes">Redes</SelectItem>
                      <SelectItem value="sistemas">Sistemas</SelectItem>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <Button variant="outline" onClick={() => setMostrarFormulario(false)}>
                Cancelar
              </Button>
              <Button onClick={enviarEncuesta}>
                <Send className="w-4 h-4 mr-2" />
                Enviar Encuesta
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SatisfactionSurvey;