import React, { useState, useEffect } from 'react';
import './Reports.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  PieChart,
  TrendingUp,
  Users,
  Clock,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { api, EstadisticasReportes, ReporteMensual } from '../../../shared/api';

interface ReportData {
  id: number;
  nombre: string;
  tipo: string;
  fechaGeneracion: string;
  tamaño: string;
  descripcion: string;
}

const Reports: React.FC = () => {
  const [reportes, setReportes] = useState<ReportData[]>([]);
  const [reportesMensuales, setReportesMensuales] = useState<ReporteMensual[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasReportes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo: '',
    fecha: ''
  });

  const loadReportes = async () => {
    try {
      console.log('🔍 [REPORTS-FRONTEND] Iniciando carga de reportes');
      setLoading(true);
      setError(null);
      
      // Cargar estadísticas básicas desde la API (más eficiente)
      console.log('🔍 [REPORTS-FRONTEND] Solicitando estadísticas básicas al backend...');
      const estadisticasResponse = await api.getReportesEstadisticasBasicas();
      console.log('🔍 [REPORTS-FRONTEND] Respuesta de estadísticas básicas:', estadisticasResponse);
      
      if (estadisticasResponse.success) {
        console.log('🔍 [REPORTS-FRONTEND] Estadísticas básicas cargadas:', estadisticasResponse.data);
        
        // Convertir a formato EstadisticasReportes
        const estadisticasData: EstadisticasReportes = {
          totalTickets: estadisticasResponse.data.totalTickets,
          ticketsResueltos: estadisticasResponse.data.ticketsResueltos,
          ticketsPendientes: estadisticasResponse.data.ticketsPendientes,
          ticketsEnProceso: estadisticasResponse.data.ticketsEnProceso,
          tiempoPromedioResolucion: estadisticasResponse.data.tiempoPromedioResolucion,
          satisfaccionPromedio: estadisticasResponse.data.satisfaccionPromedio,
          ticketsPorCategoria: {}, // Se puede cargar por separado si es necesario
          ticketsPorTecnico: {}, // Se puede cargar por separado si es necesario
          tendenciaMensual: {} // Se puede cargar por separado si es necesario
        };
        
        setEstadisticas(estadisticasData);
      } else {
        throw new Error(estadisticasResponse.message);
      }

      // Cargar reportes mensuales desde la API
      console.log('🔍 [REPORTS-FRONTEND] Solicitando reportes mensuales al backend...');
      const reportesMensualesResponse = await api.getReportesMensuales(0, 10);
      console.log('🔍 [REPORTS-FRONTEND] Respuesta de reportes mensuales:', reportesMensualesResponse);
      
      if (reportesMensualesResponse.success) {
        console.log('🔍 [REPORTS-FRONTEND] Reportes mensuales cargados:', reportesMensualesResponse.data);
        setReportesMensuales(reportesMensualesResponse.data);
      } else {
        throw new Error(reportesMensualesResponse.message);
      }

      // Cargar reportes generales (mantener para compatibilidad)
      const reportesData: ReportData[] = [];
      setReportes(reportesData);
      console.log('🔍 [REPORTS-FRONTEND] Carga de reportes completada exitosamente');
    } catch (err) {
      console.error('🔍 [REPORTS-FRONTEND] Error cargando reportes:', err);
      setError('Error al cargar reportes: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
      console.log('🔍 [REPORTS-FRONTEND] Estado de carga finalizado');
    }
  };

  useEffect(() => {
    loadReportes();
  }, []);

  const reportesFiltrados = reportes.filter(reporte => {
    const cumpleBusqueda = !filtros.busqueda || 
      reporte.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      reporte.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const cumpleTipo = !filtros.tipo || filtros.tipo === 'all' || reporte.tipo === filtros.tipo;
    
    return cumpleBusqueda && cumpleTipo;
  });

  const reportesMensualesFiltrados = reportesMensuales.filter(reporte => {
    const cumpleBusqueda = !filtros.busqueda || 
      `${reporte.mes} ${reporte.año}`.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const cumpleTipo = !filtros.tipo || filtros.tipo === 'all' || filtros.tipo === 'Mensual';
    
    return cumpleBusqueda && cumpleTipo;
  });

  const descargarReporte = (reporte: ReportData) => {
    // Simular descarga
    console.log(`Descargando reporte: ${reporte.nombre}`);
    alert(`Descargando ${reporte.nombre}...`);
  };

  const descargarReporteMensual = async (reporte: ReporteMensual) => {
    try {
      console.log('🔍 [REPORTS-FRONTEND] Iniciando descarga de reporte mensual:', reporte);
      
      // Usar el cliente API que ya maneja el token correctamente
      console.log('🔍 [REPORTS-FRONTEND] Usando cliente API para descarga...');
      
      // Descargar usando el cliente API
      const response = await api.descargarReporteMensual(reporte.id);
      
      if (response.success) {
        console.log('🔍 [REPORTS-FRONTEND] Archivo descargado, tamaño:', response.data.size, 'bytes');
        
        // Crear URL temporal para descarga
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = reporte.nombreArchivo || `reporte-${reporte.mes}-${reporte.año}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpiar URL temporal
        window.URL.revokeObjectURL(url);
        console.log('🔍 [REPORTS-FRONTEND] Descarga completada exitosamente');
      } else {
        throw new Error(response.message || 'Error al descargar reporte');
      }
      
    } catch (err) {
      console.error('🔍 [REPORTS-FRONTEND] Error descargando reporte:', err);
      setError('Error al descargar reporte: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Mensual': return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'Satisfacción': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'Rendimiento': return <Users className="w-5 h-5 text-purple-500" />;
      case 'Categorías': return <PieChart className="w-5 h-5 text-orange-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Mensual': return 'bg-blue-100 text-blue-800';
      case 'Satisfacción': return 'bg-green-100 text-green-800';
      case 'Rendimiento': return 'bg-purple-100 text-purple-800';
      case 'Categorías': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="reports">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports">
      <div className="reports-header">
        <div className="header-content">
          <h1 className="reports-title">Reportes y Análisis</h1>
          <p className="reports-subtitle">Gestiona reportes detallados del sistema</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {/* Estadísticas Principales */}
      {estadisticas && (
      <div className="stats-grid">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{(estadisticas.totalTickets || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {estadisticas.ticketsResueltos || 0} resueltos • {estadisticas.ticketsPendientes || 0} pendientes
                  </p>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.tiempoPromedioResolucion || 0} días</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Resolución de tickets
                  </p>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Satisfacción</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.satisfaccionPromedio || 0}/5</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Promedio de calificación
                  </p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Filtros */}
      <Card className="filters-card">
        <CardContent className="p-6">
          <div className="filters-grid">
            <div className="filter-group">
              <Label htmlFor="busqueda">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="busqueda"
                  placeholder="Buscar reportes..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={filtros.tipo}
                onValueChange={(value) => setFiltros({ ...filtros, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="Mensual">Mensual</SelectItem>
                  <SelectItem value="Satisfacción">Satisfacción</SelectItem>
                  <SelectItem value="Rendimiento">Rendimiento</SelectItem>
                  <SelectItem value="Categorías">Categorías</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reportes Mensuales */}
      <div className="reports-section">
        <h2 className="section-title">Reportes Mensuales</h2>
        <div className="reports-grid">
          {reportesMensualesFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reportes disponibles</h3>
              <p className="text-gray-500 mb-4">
                Los reportes se generan automáticamente cada 30 días. 
                <br />
                El primer reporte estará disponible después de un mes de actividad.
              </p>
              <div className="text-sm text-gray-400">
                <p>• Reporte Mensual: Día 1 de cada mes a las 09:00</p>
                <p>• Reporte de Satisfacción: Día 5 de cada mes a las 10:00</p>
                <p>• Reporte de Rendimiento: Día 10 de cada mes a las 11:00</p>
                <p>• Reporte por Categoría: Día 15 de cada mes a las 12:00</p>
              </div>
            </div>
          ) : (
            reportesMensualesFiltrados.map(reporte => (
            <Card key={reporte.id} className="report-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <CardTitle className="text-lg">Reporte {reporte.mes} {reporte.año}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Análisis completo del mes de {reporte.mes}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    Mensual
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Métricas del reporte */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">Resueltos:</span>
                      <span className="font-semibold">{reporte.ticketsResueltos || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-gray-600">Pendientes:</span>
                      <span className="font-semibold">{reporte.ticketsPendientes || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">Tiempo Prom:</span>
                      <span className="font-semibold">{reporte.tiempoPromedioResolucion || 0}d</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-600">Satisfacción:</span>
                      <span className="font-semibold">{reporte.satisfaccionPromedio || 0}/5</span>
                    </div>
                  </div>

                  {/* Top categorías */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Top Categorías:</p>
                    <div className="space-y-1">
                      {(reporte.topCategorias || []).slice(0, 3).map((cat, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-gray-600">{cat.categoria}</span>
                          <span className="font-medium">{cat.cantidad}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(reporte.fechaGeneracion).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>PDF</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => descargarReporteMensual(reporte)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      </div>

      {/* Otros Reportes */}
      {reportesFiltrados.length > 0 && (
        <div className="reports-section">
          <h2 className="section-title">Otros Reportes</h2>
      <div className="reports-grid">
        {reportesFiltrados.map(reporte => (
          <Card key={reporte.id} className="report-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getTipoIcon(reporte.tipo)}
                  <div>
                    <CardTitle className="text-lg">{reporte.nombre}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{reporte.descripcion}</p>
                  </div>
                </div>
                <Badge className={getTipoColor(reporte.tipo)}>
                  {reporte.tipo}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(reporte.fechaGeneracion).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>{reporte.tamaño}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => descargarReporte(reporte)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Descargar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Reports;
