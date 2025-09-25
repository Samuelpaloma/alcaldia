import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Ticket, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Calendar
} from 'lucide-react';

interface DashboardMetrics {
  totalTickets: number;
  ticketsResueltos: number;
  ticketsPendientes: number;
  tiempoPromedioResolucion: number;
  satisfaccionPromedio: number;
  ticketsPorCategoria: { categoria: string; cantidad: number }[];
  ticketsPorEstado: { estado: string; cantidad: number }[];
  ticketsPorMes: { mes: string; cantidad: number }[];
  tecnicosMasActivos: { tecnico: string; tickets: number }[];
}

const AdvancedDashboard: React.FC = () => {
  const [metricas, setMetricas] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState('30');

  const loadMetricas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const metricasData: DashboardMetrics = {
        totalTickets: 1247,
        ticketsResueltos: 892,
        ticketsPendientes: 355,
        tiempoPromedioResolucion: 4.2,
        satisfaccionPromedio: 4.6,
        ticketsPorCategoria: [
          { categoria: 'Redes', cantidad: 234 },
          { categoria: 'Sistemas', cantidad: 189 },
          { categoria: 'Hardware', cantidad: 156 },
          { categoria: 'Software', cantidad: 123 },
          { categoria: 'Otros', cantidad: 89 }
        ],
        ticketsPorEstado: [
          { estado: 'Abierto', cantidad: 89 },
          { estado: 'En Progreso', cantidad: 156 },
          { estado: 'Resuelto', cantidad: 892 },
          { estado: 'Cerrado', cantidad: 110 }
        ],
        ticketsPorMes: [
          { mes: 'Ene', cantidad: 98 },
          { mes: 'Feb', cantidad: 112 },
          { mes: 'Mar', cantidad: 134 },
          { mes: 'Abr', cantidad: 156 },
          { mes: 'May', cantidad: 189 },
          { mes: 'Jun', cantidad: 203 }
        ],
        tecnicosMasActivos: [
          { tecnico: 'Juan Pérez', tickets: 45 },
          { tecnico: 'María García', tickets: 38 },
          { tecnico: 'Carlos López', tickets: 32 },
          { tecnico: 'Ana Martínez', tickets: 28 }
        ]
      };
      
      setMetricas(metricasData);
    } catch (err) {
      setError('Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetricas();
  }, [periodo]);

  const exportarReporte = async () => {
    alert('Reporte exportado exitosamente');
  };

  const getTendenciaColor = (valor: number, esPositivo: boolean) => {
    if (esPositivo) {
      return valor > 0 ? 'text-green-600' : 'text-red-600';
    } else {
      return valor > 0 ? 'text-red-600' : 'text-green-600';
    }
  };

  const getTendenciaIcon = (valor: number, esPositivo: boolean) => {
    if (esPositivo) {
      return valor > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
    } else {
      return valor > 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="advanced-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando métricas avanzadas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="advanced-dashboard">
        <div className="error-message">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="advanced-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Dashboard Avanzado</h1>
          <p className="dashboard-subtitle">Métricas y análisis detallados del sistema</p>
        </div>
        <div className="header-actions">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
              <SelectItem value="365">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadMetricas} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={exportarReporte}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="metrics-grid">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{metricas?.totalTickets}</p>
                <div className="flex items-center mt-1">
                  <span className={`text-sm ${getTendenciaColor(12, true)}`}>
                    +12%
                  </span>
                  {getTendenciaIcon(12, true)}
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
                <p className="text-sm font-medium text-gray-600">Tickets Resueltos</p>
                <p className="text-2xl font-bold text-gray-900">{metricas?.ticketsResueltos}</p>
                <div className="flex items-center mt-1">
                  <span className={`text-sm ${getTendenciaColor(8, true)}`}>
                    +8%
                  </span>
                  {getTendenciaIcon(8, true)}
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
                <p className="text-sm font-medium text-gray-600">Tickets Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{metricas?.ticketsPendientes}</p>
                <div className="flex items-center mt-1">
                  <span className={`text-sm ${getTendenciaColor(5, false)}`}>
                    -5%
                  </span>
                  {getTendenciaIcon(5, false)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{metricas?.tiempoPromedioResolucion}h</p>
                <div className="flex items-center mt-1">
                  <span className={`text-sm ${getTendenciaColor(15, false)}`}>
                    -15%
                  </span>
                  {getTendenciaIcon(15, false)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="charts-grid">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Tickets por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metricas?.ticketsPorCategoria.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">{item.categoria}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{item.cantidad}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(item.cantidad / 234) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Tickets por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metricas?.ticketsPorEstado.map((item, index) => {
                const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-gray-500'];
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${colors[index]} rounded-full`}></div>
                      <span className="text-sm font-medium">{item.estado}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{item.cantidad}</span>
                      <Badge variant="outline">{item.cantidad}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Técnicos Más Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metricas?.tecnicosMasActivos.map((tecnico, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {tecnico.tecnico.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{tecnico.tecnico}</p>
                    <p className="text-sm text-gray-600">{tecnico.tickets} tickets resueltos</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{tecnico.tickets}</Badge>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(tecnico.tickets / 45) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="satisfaction-grid">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Satisfacción del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {metricas?.satisfaccionPromedio}/5.0
              </div>
              <p className="text-sm text-gray-600 mb-4">Promedio de satisfacción</p>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={`w-6 h-6 ${
                      star <= (metricas?.satisfaccionPromedio || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Tendencia Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metricas?.ticketsPorMes.map((mes, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{mes.mes}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{mes.cantidad}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(mes.cantidad / 203) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedDashboard;