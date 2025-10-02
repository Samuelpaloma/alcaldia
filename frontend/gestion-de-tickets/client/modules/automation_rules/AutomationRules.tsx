import React, { useState, useEffect } from 'react';
import './AutomationRules.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { api, ReglaAutomatizacionRequestDTO, ReglaAutomatizacionResponseDTO } from '../../../shared/api';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Search,
  Play,
  Pause
} from 'lucide-react';

const AutomationRules: React.FC = () => {
  const { toast } = useToast();
  const [reglas, setReglas] = useState<ReglaAutomatizacionResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [reglaEditando, setReglaEditando] = useState<ReglaAutomatizacionResponseDTO | null>(null);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    prioridad: ''
  });

  const [formulario, setFormulario] = useState<ReglaAutomatizacionRequestDTO>({
    nombre: '',
    descripcion: '',
    condicion: '',
    accion: '',
    prioridad: 2,
    activa: true
  });

  const loadReglas = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando reglas de automatización...');
      
      const response = await api.getReglasAutomatizacion(0, 100);
      console.log('✅ Reglas cargadas desde backend:', response);
      
      // El servidor devuelve {data: {content: [...]}} según los logs
      let reglasArray = [];
      if (response && response.data && response.data.content) {
        reglasArray = response.data.content;
      } else if (Array.isArray(response)) {
        reglasArray = response;
      }
      
      console.log('📋 Reglas extraídas:', reglasArray);
      setReglas(reglasArray);
      setError(null);
    } catch (error) {
      console.error('❌ Error al cargar reglas:', error);
      setError('Error al cargar reglas');
      setReglas([]); // Establecer array vacío en caso de error
      toast({
        title: "Error",
        description: "No se pudieron cargar las reglas de automatización",
        variant: "destructive",
      });
    } finally {
      console.log('🔄 Estableciendo loading = false');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReglas();
  }, []);

  const reglasFiltradas = (Array.isArray(reglas) ? reglas : []).filter(regla => {
    const cumpleBusqueda = !filtros.busqueda || 
      regla.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const cumpleEstado = !filtros.estado || filtros.estado === 'all' ||
      (filtros.estado === 'activa' && regla.activa) ||
      (filtros.estado === 'inactiva' && !regla.activa);
    const cumplePrioridad = !filtros.prioridad || filtros.prioridad === 'all' || 
      regla.prioridad.toString() === filtros.prioridad;
    
    return cumpleBusqueda && cumpleEstado && cumplePrioridad;
  });

  // Debug: Log para verificar el estado
  console.log('🔍 Debug - Estado actual:', {
    loading: loading,
    reglas: reglas,
    reglasLength: reglas.length,
    reglasFiltradas: reglasFiltradas,
    reglasFiltradasLength: reglasFiltradas.length,
    filtros: filtros
  });

  const abrirModalCrear = () => {
    setFormulario({
      nombre: '',
      descripcion: '',
      condicion: '',
      accion: '',
      prioridad: 2,
      activa: true
    });
    setModoEdicion(false);
    setReglaEditando(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (regla: ReglaAutomatizacionResponseDTO) => {
    setFormulario({
      nombre: regla.nombre,
      descripcion: regla.descripcion || '',
      condicion: regla.condicion,
      accion: regla.accion,
      prioridad: typeof regla.prioridad === 'string' ? parseInt(regla.prioridad) : regla.prioridad,
      activa: regla.activa
    });
    setModoEdicion(true);
    setReglaEditando(regla);
    setMostrarModal(true);
  };

  const guardarRegla = async () => {
    try {
      console.log('💾 Guardando regla de automatización:', formulario);
      
      // Asegurar que prioridad sea un número
      const datosFormulario = {
        ...formulario,
        prioridad: typeof formulario.prioridad === 'string' ? parseInt(formulario.prioridad) : formulario.prioridad
      };
      
      let reglaGuardada: ReglaAutomatizacionResponseDTO;
      
      if (modoEdicion && reglaEditando) {
        reglaGuardada = await api.updateReglaAutomatizacion(reglaEditando.id, datosFormulario);
        console.log('✅ Regla actualizada en backend:', reglaGuardada);
      } else {
        reglaGuardada = await api.createReglaAutomatizacion(datosFormulario);
        console.log('✅ Regla creada en backend:', reglaGuardada);
      }
      
      await loadReglas(); // Recargar las reglas desde el backend
      setMostrarModal(false);
      setReglaEditando(null);
      
      toast({
        title: "Éxito",
        description: `Regla de automatización ${modoEdicion ? 'actualizada' : 'creada'} exitosamente`,
      });
    } catch (error) {
      console.error('❌ Error al guardar regla:', error);
      toast({
        title: "Error",
        description: `Error al ${modoEdicion ? 'actualizar' : 'crear'} regla de automatización`,
        variant: "destructive",
      });
    }
  };

  const eliminarRegla = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta regla?')) return;
    
    try {
      console.log('🗑️ Eliminando regla con ID:', id);
      
      await api.deleteReglaAutomatizacion(id);
      console.log('✅ Regla eliminada exitosamente');
      
      await loadReglas(); // Recargar las reglas desde el backend
      
      toast({
        title: "Éxito",
        description: "Regla de automatización eliminada exitosamente",
      });
    } catch (error) {
      console.error('❌ Error al eliminar regla:', error);
      toast({
        title: "Error",
        description: "Error al eliminar regla de automatización",
        variant: "destructive",
      });
    }
  };

  const toggleRegla = async (regla: ReglaAutomatizacionResponseDTO) => {
    try {
      console.log('🔄 Cambiando estado de regla con ID:', regla.id);
      
      await api.toggleReglaAutomatizacion(regla.id);
      console.log('✅ Estado de regla actualizado');
      
      await loadReglas(); // Recargar las reglas desde el backend
      
      toast({
        title: "Éxito",
        description: `Regla ${regla.activa ? 'desactivada' : 'activada'} exitosamente`,
      });
    } catch (error) {
      console.error('❌ Error al cambiar estado de regla:', error);
      toast({
        title: "Error",
        description: "Error al cambiar estado de la regla",
        variant: "destructive",
      });
    }
  };

  const ejecutarRegla = async (id: number) => {
    try {
      console.log('🚀 Ejecutando regla con ID:', id);
      
      await api.ejecutarRegla(id);
      console.log('✅ Regla ejecutada exitosamente');
      
      await loadReglas(); // Recargar las reglas para ver el contador actualizado
      
      toast({
        title: "Éxito",
        description: "Regla ejecutada exitosamente",
      });
    } catch (error) {
      console.error('❌ Error al ejecutar regla:', error);
      toast({
        title: "Error",
        description: "Error al ejecutar la regla",
        variant: "destructive",
      });
    }
  };

  const ejecutarTodasLasReglas = async () => {
    try {
      console.log('🚀 Ejecutando todas las reglas de automatización');
      
      await api.ejecutarReglas();
      console.log('✅ Todas las reglas ejecutadas exitosamente');
      
      await loadReglas(); // Recargar las reglas para ver los contadores actualizados
      
      toast({
        title: "Éxito",
        description: "Todas las reglas ejecutadas exitosamente",
      });
    } catch (error) {
      console.error('❌ Error al ejecutar todas las reglas:', error);
      toast({
        title: "Error",
        description: "Error al ejecutar todas las reglas",
        variant: "destructive",
      });
    }
  };

  const getPrioridadColor = (prioridad: number) => {
    switch (prioridad) {
      case 4: return 'bg-red-100 text-red-800';
      case 3: return 'bg-orange-100 text-orange-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 1: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadTexto = (prioridad: number) => {
    switch (prioridad) {
      case 4: return 'Crítica';
      case 3: return 'Alta';
      case 2: return 'Media';
      case 1: return 'Baja';
      default: return 'Desconocida';
    }
  };

  const getEstadoIcon = (activa: boolean) => {
    return activa ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="automation-rules">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando reglas de automatización...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="automation-rules">
      <div className="rules-header">
        <div className="header-content">
          <h1 className="rules-title">Reglas de Automatización</h1>
          <p className="rules-subtitle">Configura reglas automáticas para optimizar el flujo de tickets</p>
          {/* Debug temporal */}
          <div style={{marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px'}}>
            <p><strong>Debug Info:</strong></p>
            <p>Loading: {loading ? 'true' : 'false'}</p>
            <p>Reglas: {reglas.length}</p>
            <p>Reglas Filtradas: {reglasFiltradas.length}</p>
            <button onClick={() => loadReglas()} style={{marginTop: '5px', padding: '5px 10px'}}>
              Recargar Reglas
            </button>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => ejecutarTodasLasReglas()} 
            variant="outline"
            className="btn-create"
          >
            <Zap className="w-4 h-4 mr-2" />
            Ejecutar Todas
          </Button>
          <Button onClick={abrirModalCrear} className="btn-create">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Regla
          </Button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      <Card className="filters-card">
        <CardContent className="p-6">
          <div className="filters-grid">
            <div className="filter-group">
              <Label htmlFor="busqueda">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="busqueda"
                  placeholder="Buscar por nombre..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={filtros.estado}
                onValueChange={(value) => setFiltros({ ...filtros, estado: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="activa">Activa</SelectItem>
                  <SelectItem value="inactiva">Inactiva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <Label htmlFor="prioridad">Prioridad</Label>
              <Select
                value={filtros.prioridad}
                onValueChange={(value) => setFiltros({ ...filtros, prioridad: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="4">Crítica</SelectItem>
                  <SelectItem value="3">Alta</SelectItem>
                  <SelectItem value="2">Media</SelectItem>
                  <SelectItem value="1">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="stats-grid">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Reglas</p>
                <p className="text-2xl font-bold text-gray-900">{reglas.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Reglas Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reglas.filter(r => r.activa).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ejecuciones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reglas.reduce((sum, r) => sum + r.ejecuciones, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rules-grid">
        {reglasFiltradas.map(regla => (
          <Card key={regla.id} className="rule-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getEstadoIcon(regla.activa)}
                  <div>
                    <CardTitle className="text-lg">{regla.nombre}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{regla.descripcion}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPrioridadColor(regla.prioridad)}>
                    {getPrioridadTexto(regla.prioridad)}
                  </Badge>
                  <Switch
                    checked={regla.activa}
                    onCheckedChange={() => toggleRegla(regla)}
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Condición:</Label>
                  <p className="text-sm text-gray-600 mt-1 font-mono bg-gray-50 p-2 rounded">
                    {regla.condicion}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Acción:</Label>
                  <p className="text-sm text-gray-600 mt-1">{regla.accion}</p>
                </div>


                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Creada: {new Date(regla.fechaCreacion).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4" />
                      <span>Ejecuciones: {regla.ejecuciones}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => ejecutarRegla(regla.id)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Ejecutar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => abrirModalEditar(regla)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => eliminarRegla(regla.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modoEdicion ? 'Editar Regla' : 'Nueva Regla'}</h2>
              <button onClick={() => setMostrarModal(false)} className="modal-close">×</button>
            </div>
            
            <div className="modal-body">
              <div className="space-y-4">
                <div className="form-group">
                  <Label htmlFor="nombre">Nombre de la Regla</Label>
                  <Input
                    id="nombre"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                    placeholder="Ej: Asignación automática por categoría"
                  />
                </div>
                
                <div className="form-group">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formulario.descripcion}
                    onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                    placeholder="Describe qué hace esta regla..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="condicion">Condición</Label>
                  <Textarea
                    id="condicion"
                    value={formulario.condicion}
                    onChange={(e) => setFormulario({ ...formulario, condicion: e.target.value })}
                    placeholder="Ej: categoria == 'Redes' AND prioridad == 'high'"
                    rows={2}
                    className="font-mono"
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="accion">Acción</Label>
                  <Textarea
                    id="accion"
                    value={formulario.accion}
                    onChange={(e) => setFormulario({ ...formulario, accion: e.target.value })}
                    placeholder="Ej: Asignar a técnico especializado en redes"
                    rows={2}
                  />
                </div>


                <div className="form-group">
                  <Label htmlFor="prioridad">Prioridad</Label>
                  <Select
                    value={formulario.prioridad?.toString() || '2'}
                    onValueChange={(value) => setFormulario({ ...formulario, prioridad: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Baja</SelectItem>
                      <SelectItem value="2">Media</SelectItem>
                      <SelectItem value="3">Alta</SelectItem>
                      <SelectItem value="4">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-group">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="activa"
                      checked={formulario.activa}
                      onCheckedChange={(checked) => setFormulario({ ...formulario, activa: checked })}
                    />
                    <Label htmlFor="activa">Regla activa</Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <Button variant="outline" onClick={() => setMostrarModal(false)}>
                Cancelar
              </Button>
              <Button onClick={guardarRegla}>
                {modoEdicion ? 'Actualizar Regla' : 'Crear Regla'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationRules;