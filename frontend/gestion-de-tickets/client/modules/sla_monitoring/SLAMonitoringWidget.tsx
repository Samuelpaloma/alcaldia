import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';
import { api } from '@shared/api';
import { useI18n } from '../../i18n';

interface SLAStats {
  totalTicketsActivos: number;
  ticketsVencidos: number;
  ticketsProximosVencer: number;
  ticketsEnTiempo: number;
  ticketsSinSLA: number;
  porcentajeCumplimiento: number;
  ultimaVerificacion: string;
}

interface SLAMonitoringWidgetProps {
  className?: string;
}

const SLAMonitoringWidget: React.FC<SLAMonitoringWidgetProps> = ({ className = '' }) => {
  const { t } = useI18n();
  const [stats, setStats] = useState<SLAStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadSLAStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getSLAMonitoringStats();
      console.log('🔍 [SLA Widget] Respuesta del backend:', response);
      
      if (response && response.data) {
        console.log('✅ [SLA Widget] Datos SLA cargados:', response.data);
        setStats(response.data);
      } else if (response) {
        // Si la respuesta viene directamente sin .data
        console.log('✅ [SLA Widget] Datos SLA cargados (directo):', response);
        setStats(response);
      } else {
        console.log('❌ [SLA Widget] No hay datos en la respuesta');
        setError('No se pudieron cargar las estadísticas de SLA');
      }
    } catch (err) {
      console.error('Error cargando estadísticas de SLA:', err);
      setError('Error al cargar las estadísticas de SLA');
    } finally {
      setLoading(false);
    }
  };

  const executeManualCheck = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await api.executeSLAMonitoringCheck();
      if (response && response.data) {
        setStats(response.data.estadisticas);
        // Mostrar mensaje de éxito
        console.log('Verificación manual ejecutada correctamente');
      } else {
        setError('Error al ejecutar la verificación manual');
      }
    } catch (err) {
      console.error('Error ejecutando verificación manual:', err);
      setError('Error al ejecutar la verificación manual');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSLAStats();
    
    // Auto-refresh cada 5 minutos
    const interval = setInterval(loadSLAStats, 300000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
  };

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            {t('dashboard.sla.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-slate-600">Cargando estadísticas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            {t('dashboard.sla.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={loadSLAStats} 
            variant="outline" 
            size="sm" 
            className="mt-3"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            {t('dashboard.sla.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">No hay datos de SLA disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            {t('dashboard.sla.title')}
          </CardTitle>
          <Button 
            onClick={executeManualCheck} 
            variant="outline" 
            size="sm"
            disabled={refreshing}
          >
            {refreshing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span className="ml-2">{t('dashboard.sla.verify')}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.ticketsVencidos}</div>
            <div className="text-sm text-red-700">{t('dashboard.sla.overdue')}</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.ticketsProximosVencer}</div>
            <div className="text-sm text-orange-700">{t('dashboard.sla.due_soon')}</div>
          </div>
        </div>

        {/* Estadísticas secundarias */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-semibold text-green-600">{stats.ticketsEnTiempo}</div>
            <div className="text-xs text-slate-600">{t('dashboard.sla.on_time')}</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">{stats.totalTicketsActivos}</div>
            <div className="text-xs text-slate-600">{t('dashboard.sla.total_active')}</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-600">{stats.ticketsSinSLA}</div>
            <div className="text-xs text-slate-600">{t('dashboard.sla.without_sla')}</div>
          </div>
        </div>

        {/* Porcentaje de cumplimiento */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">{t('dashboard.sla.compliance')}</span>
            <span className="text-sm font-semibold text-slate-900">
              {stats.porcentajeCumplimiento.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                stats.porcentajeCumplimiento >= 90 
                  ? 'bg-green-500' 
                  : stats.porcentajeCumplimiento >= 70 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(stats.porcentajeCumplimiento, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Estado del sistema */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              stats.ticketsVencidos === 0 
                ? 'bg-green-500' 
                : stats.ticketsVencidos <= 2 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-slate-600">
              {stats.ticketsVencidos === 0 
                ? t('dashboard.sla.system_stable')
                : stats.ticketsVencidos <= 2 
                  ? t('dashboard.sla.attention_required')
                  : t('dashboard.sla.critical')}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {formatTimeAgo(stats.ultimaVerificacion)}
          </span>
        </div>

        {/* Alertas críticas */}
        {stats.ticketsVencidos > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{stats.ticketsVencidos}</strong> {t('dashboard.sla.tickets_with_overdue_sla')}
              {stats.ticketsVencidos > 1 ? 's' : ''}. {t('dashboard.sla.immediate_action_required')}.
            </AlertDescription>
          </Alert>
        )}

        {stats.ticketsProximosVencer > 0 && stats.ticketsVencidos === 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <Clock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>{stats.ticketsProximosVencer}</strong> {t('dashboard.sla.tickets_approaching_deadline')}.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SLAMonitoringWidget;
