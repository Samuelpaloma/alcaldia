import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart, 
  PieChart,
  Activity,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Zap
} from 'lucide-react';

interface TrendData {
  periodo: string;
  tickets: number;
  resueltos: number;
  tiempoPromedio: number;
  satisfaccion: number;
}

interface CategoryTrend {
  categoria: string;
  tendencia: 'up' | 'down' | 'stable';
  cambio: number;
  tickets: number;
}

interface TechnicianPerformance {
  tecnico: string;
  ticketsResueltos: number;
  tiempoPromedio: number;
  satisfaccion: number;
  tendencia: 'up' | 'down' | 'stable';
}

const TrendsAnalysis: React.FC = () => {
  const [datosTendencia, setDatosTendencia] = useState<TrendData[]>([]);
  const [tendenciasCategoria, setTendenciasCategoria] = useState<CategoryTrend[]>([]);
  const [rendimientoTecnicos, setRendimientoTecnicos] = useState<TechnicianPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState('6m');
  const [vista, setVista] = useState('general');

  const loadAnalisis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular datos de tendencias
      const tendenciasData: TrendData[] = [
        { periodo: 'Ene', tickets: 98, resueltos: 85, tiempoPromedio: 4.2, satisfaccion: 4.3 },
        { periodo: 'Feb', tickets: 112, resueltos: 98, tiempoPromedio: 3.8, satisfaccion: 4.5 },
        { periodo: 'Mar', tickets: 134, resueltos: 118, tiempoPromedio: 3.5, satisfaccion: 4.6 },
        { periodo: 'Abr', tickets: 156, resueltos: 142, tiempoPromedio: 3.2, satisfaccion: 4.7 },
        { periodo: 'May', tickets: 189, resueltos: 175, tiempoPromedio: 2.9, satisfaccion: 4.8 },
        { periodo: 'Jun', tickets: 203, resueltos: 192, tiempoPromedio: 2.6, satisfaccion: 4.9 }
      ];

      const categoriasData: CategoryTrend[] = [
        { categoria: 'Redes', tendencia: 'up', cambio: 15, tickets: 234 },
        { categoria: 'Sistemas', tendencia: 'down', cambio: -8, tickets: 189 },
        { categoria: 'Hardware', tendencia: 'stable', cambio: 2, tickets: 156 },
        { categoria: 'Software', tendencia: 'up', cambio: 12, tickets: 123 },
        { categoria: 'Otros', tendencia: 'down', cambio: -5, tickets: 89 }
      ];

      const tecnicosData: TechnicianPerformance[] = [
        { tecnico: 'Juan Pérez', ticketsResueltos: 45, tiempoPromedio: 2.1, satisfaccion: 4.8, tendencia: 'up' },
        { tecnico: 'María García', ticketsResueltos: 38, tiempoPromedio: 2.3, satisfaccion: 4.7, tendencia: 'up' },
        { tecnico: 'Carlos López', ticketsResueltos: 32, tiempoPromedio: 2.8, satisfaccion: 4.5, tendencia: 'stable' },
        { tecnico: 'Ana Martínez', ticketsResueltos: 28, tiempoPromedio: 3.1, satisfaccion: 4.6, tendencia: 'down' }
      ];

      setDatosTendencia(tendenciasData);
      setTendenciasCategoria(categoriasData);
      setRendimientoTecnicos(tecnicosData);
    } catch (err) {
      setError('Error al cargar análisis de tendencias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalisis();
  }, [periodo]);

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTendenciaBadge = (tendencia: string) => {
    switch (tendencia) {
      case 'up': return 'bg-green-100 text-green-800';
      case 'down': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="trends-analysis">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analizando tendencias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trends-analysis">
        <div className="error-message">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="trends-analysis">
      <div className="analysis-header">
        <div className="header-content">
          <h1 className="analysis-title">Análisis de Tendencias</h1>
          <p className="analysis-subtitle">Insights y patrones del sistema de tickets</p>
        </div>
        <div className="header-actions">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Último mes</SelectItem>
              <SelectItem value="3m">Últimos 3 meses</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Select value={vista} onValueChange={setVista}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Vista General</SelectItem>
              <SelectItem value="categorias">Por Categorías</SelectItem>
              <SelectItem value="tecnicos">Por Técnicos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="metrics-grid">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tickets Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {datosTendencia.reduce((sum, d) => sum + d.tickets, 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-green-600">+12%</span>
                  <TrendingUp className="w-4 h-4 text-green-600 ml-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasa de Resolución</p>
                <p className="text-2xl font-bold text-gray-900">
                  {((datosTendencia.reduce((sum, d) => sum + d.resueltos, 0) / 
                     datosTendencia.reduce((sum, d) => sum + d.tickets, 0)) * 100).toFixed(1)}%
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-green-600">+5%</span>
                  <TrendingUp className="w-4 h-4 text-green-600 ml-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(datosTendencia.reduce((sum, d) => sum + d.tiempoPromedio, 0) / datosTendencia.length).toFixed(1)}h
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-green-600">-15%</span>
                  <TrendingDown className="w-4 h-4 text-green-600 ml-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Satisfacción</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(datosTendencia.reduce((sum, d) => sum + d.satisfaccion, 0) / datosTendencia.length).toFixed(1)}/5
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-green-600">+8%</span>
                  <TrendingUp className="w-4 h-4 text-green-600 ml-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de tendencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChart className="w-5 h-5 mr-2" />
            Evolución Mensual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {datosTendencia.map((dato, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-600 w-12">{dato.periodo}</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Tickets: {dato.tickets}</span>
                    <span className="text-sm text-gray-600">Resueltos: {dato.resueltos}</span>
                    <span className="text-sm text-gray-600">Tiempo: {dato.tiempoPromedio}h</span>
                    <span className="text-sm text-gray-600">Satisfacción: {dato.satisfaccion}/5</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(dato.tickets / 203) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tendencias por categoría */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Tendencias por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tendenciasCategoria.map((categoria, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getTendenciaIcon(categoria.tendencia)}
                  <div>
                    <p className="font-medium">{categoria.categoria}</p>
                    <p className="text-sm text-gray-600">{categoria.tickets} tickets</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getTendenciaBadge(categoria.tendencia)}>
                    {categoria.tendencia === 'up' ? '+' : categoria.tendencia === 'down' ? '-' : '='}
                    {Math.abs(categoria.cambio)}%
                  </Badge>
                  <span className={`text-sm ${getTendenciaColor(categoria.tendencia)}`}>
                    {categoria.cambio > 0 ? '+' : ''}{categoria.cambio}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rendimiento de técnicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Rendimiento de Técnicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rendimientoTecnicos.map((tecnico, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {tecnico.tecnico.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{tecnico.tecnico}</p>
                    <p className="text-sm text-gray-600">
                      {tecnico.ticketsResueltos} tickets • {tecnico.tiempoPromedio}h promedio
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">{tecnico.satisfaccion}/5</p>
                    <p className="text-xs text-gray-600">Satisfacción</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTendenciaIcon(tecnico.tendencia)}
                    <Badge className={getTendenciaBadge(tecnico.tendencia)}>
                      {tecnico.tendencia === 'up' ? 'Mejorando' : 
                       tecnico.tendencia === 'down' ? 'Bajando' : 'Estable'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights y recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Insights y Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Tendencia Positiva</h4>
                  <p className="text-sm text-green-700 mt-1">
                    El tiempo promedio de resolución ha mejorado un 15% en los últimos 6 meses.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Atención Requerida</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Los tickets de la categoría "Sistemas" han aumentado un 8%. Considera revisar los procesos.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Oportunidad de Mejora</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Ana Martínez muestra una tendencia a la baja. Considera capacitación adicional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendsAnalysis;
