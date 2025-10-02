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
  Search
} from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarGenerador, setMostrarGenerador] = useState(false);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo: '',
    fecha: ''
  });

  const [formularioReporte, setFormularioReporte] = useState({
    nombre: '',
    tipo: '',
    fechaInicio: '',
    fechaFin: '',
    incluirGraficos: true,
    formato: 'pdf'
  });

  const loadReportes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const reportesData: ReportData[] = [
        {
          id: 1,
          nombre: 'Reporte Mensual - Enero 2024',
          tipo: 'Mensual',
          fechaGeneracion: new Date(Date.now() - 86400000).toISOString(),
          tamaño: '2.3 MB',
          descripcion: 'Análisis completo de tickets del mes de enero'
        },
        {
          id: 2,
          nombre: 'Reporte de Satisfacción Q1',
          tipo: 'Satisfacción',
          fechaGeneracion: new Date(Date.now() - 172800000).toISOString(),
          tamaño: '1.8 MB',
          descripcion: 'Encuestas de satisfacción del primer trimestre'
        },
        {
          id: 3,
          nombre: 'Rendimiento Técnicos',
          tipo: 'Rendimiento',
          fechaGeneracion: new Date(Date.now() - 259200000).toISOString(),
          tamaño: '3.1 MB',
          descripcion: 'Análisis de productividad del equipo técnico'
        },
        {
          id: 4,
          nombre: 'Tickets por Categoría',
          tipo: 'Categorías',
          fechaGeneracion: new Date(Date.now() - 345600000).toISOString(),
          tamaño: '1.5 MB',
          descripcion: 'Distribución de tickets por categoría técnica'
        }
      ];

      setReportes(reportesData);
    } catch (err) {
      setError('Error al cargar reportes');
    } finally {
      setLoading(false);
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

  const generarReporte = async () => {
    if (!formularioReporte.nombre || !formularioReporte.tipo) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const nuevoReporte: ReportData = {
        id: Date.now(),
        nombre: formularioReporte.nombre,
        tipo: formularioReporte.tipo,
        fechaGeneracion: new Date().toISOString(),
        tamaño: '1.2 MB',
        descripcion: `Reporte generado el ${new Date().toLocaleDateString()}`
      };

      setReportes(prev => [nuevoReporte, ...prev]);
      setMostrarGenerador(false);
      alert('Reporte generado exitosamente');
    } catch (err) {
      setError('Error al generar reporte');
    }
  };

  const descargarReporte = (reporte: ReportData) => {
    // Simular descarga
    console.log(`Descargando reporte: ${reporte.nombre}`);
    alert(`Descargando ${reporte.nombre}...`);
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
          <p className="reports-subtitle">Genera y gestiona reportes detallados del sistema</p>
        </div>
        <Button onClick={() => setMostrarGenerador(true)} className="btn-create">
          <FileText className="w-4 h-4 mr-2" />
          Generar Reporte
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
      <div className="stats-grid">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reportes</p>
                <p className="text-2xl font-bold text-gray-900">{reportes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Descargas</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tipos</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

      {/* Lista de reportes */}
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

      {/* Modal Generador */}
      {mostrarGenerador && (
        <div className="modal-overlay" onClick={() => setMostrarGenerador(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Generar Nuevo Reporte</h2>
              <button onClick={() => setMostrarGenerador(false)} className="modal-close">×</button>
            </div>
            
            <div className="modal-body">
              <div className="space-y-4">
                <div className="form-group">
                  <Label htmlFor="nombre">Nombre del Reporte</Label>
                  <Input
                    id="nombre"
                    value={formularioReporte.nombre}
                    onChange={(e) => setFormularioReporte({ ...formularioReporte, nombre: e.target.value })}
                    placeholder="Ej: Reporte Mensual - Diciembre 2024"
                  />
                </div>
                
                <div className="form-group">
                  <Label htmlFor="tipo">Tipo de Reporte</Label>
                  <Select
                    value={formularioReporte.tipo}
                    onValueChange={(value) => setFormularioReporte({ ...formularioReporte, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mensual">Reporte Mensual</SelectItem>
                      <SelectItem value="Satisfacción">Satisfacción</SelectItem>
                      <SelectItem value="Rendimiento">Rendimiento</SelectItem>
                      <SelectItem value="Categorías">Categorías</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-group">
                  <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formularioReporte.fechaInicio}
                    onChange={(e) => setFormularioReporte({ ...formularioReporte, fechaInicio: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="fechaFin">Fecha de Fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={formularioReporte.fechaFin}
                    onChange={(e) => setFormularioReporte({ ...formularioReporte, fechaFin: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="formato">Formato</Label>
                  <Select
                    value={formularioReporte.formato}
                    onValueChange={(value) => setFormularioReporte({ ...formularioReporte, formato: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <Button variant="outline" onClick={() => setMostrarGenerador(false)}>
                Cancelar
              </Button>
              <Button onClick={generarReporte}>
                <FileText className="w-4 h-4 mr-2" />
                Generar Reporte
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
