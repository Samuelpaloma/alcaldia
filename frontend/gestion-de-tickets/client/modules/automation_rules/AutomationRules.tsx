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
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Search
} from 'lucide-react';

interface AutomationRule {
  id: number;
  nombre: string;
  descripcion: string;
  activa: boolean;
  condicion: string;
  accion: string;
  prioridad: string;
  fechaCreacion: string;
  ejecuciones: number;
}

const AutomationRules: React.FC = () => {
  const [reglas, setReglas] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [reglaEditando, setReglaEditando] = useState<AutomationRule | null>(null);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    prioridad: ''
  });

  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    condicion: '',
    accion: '',
    prioridad: 'medium',
    activa: true
  });

  const loadReglas = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando reglas de automatización...');
      
      const response = await fetch('http://localhost:8080/api/automation-rules');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Reglas cargadas desde backend:', data);
        setReglas(data);
      } else {
        console.log('⚠️ Backend no disponible, usando datos de prueba');
        // Datos de prueba si no hay respuesta del servidor
        const reglasData = [
          {
            id: 1,
            nombre: 'Asignación automática por categoría',
            descripcion: 'Asigna automáticamente tickets de redes a técnicos especializados',
            activa: true,
            condicion: "categoria == 'Redes' AND prioridad == 'high'",
            accion: 'Asignar a técnico especializado en redes',
            prioridad: 'high',
            fechaCreacion: new Date().toISOString(),
            ejecuciones: 15
          },
          {
            id: 2,
            nombre: 'Escalación por tiempo',
            descripcion: 'Escala tickets que llevan más de 24 horas sin resolver',
            activa: true,
            condicion: "tiempo_sin_resolver > 24 AND estado == 'EN_PROGRESO'",
            accion: 'Escalar a supervisor técnico',
            prioridad: 'medium',
            fechaCreacion: new Date(Date.now() - 86400000).toISOString(),
            ejecuciones: 8
          }
        ];
        setReglas(reglasData);
      }
    } catch (error) {
      console.error('❌ Error al cargar reglas:', error);
      setError('Error al cargar reglas');
      // Datos de prueba en caso de error
      const reglasData = [
        {
          id: 1,
          nombre: 'Asignación automática por categoría',
          descripcion: 'Asigna automáticamente tickets de redes a técnicos especializados',
          activa: true,
          condicion: "categoria == 'Redes' AND prioridad == 'high'",
          accion: 'Asignar a técnico especializado en redes',
          prioridad: 'high',
          fechaCreacion: new Date().toISOString(),
          ejecuciones: 15
        }
      ];
      setReglas(reglasData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReglas();
  }, []);

  const reglasFiltradas = reglas.filter(regla => {
    const cumpleBusqueda = !filtros.busqueda || 
      regla.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const cumpleEstado = !filtros.estado || filtros.estado === 'all' ||
      (filtros.estado === 'activa' && regla.activa) ||
      (filtros.estado === 'inactiva' && !regla.activa);
    const cumplePrioridad = !filtros.prioridad || filtros.prioridad === 'all' || regla.prioridad === filtros.prioridad;
    
    return cumpleBusqueda && cumpleEstado && cumplePrioridad;
  });

  const abrirModalCrear = () => {
    setFormulario({
      nombre: '',
      descripcion: '',
      condicion: '',
      accion: '',
      prioridad: 'medium',
      activa: true
    });
    setModoEdicion(false);
    setReglaEditando(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (regla: AutomationRule) => {
    setFormulario({
      nombre: regla.nombre,
      descripcion: regla.descripcion,
      condicion: regla.condicion,
      accion: regla.accion,
      prioridad: regla.prioridad,
      activa: regla.activa
    });
    setModoEdicion(true);
    setReglaEditando(regla);
    setMostrarModal(true);
  };

  const guardarRegla = async () => {
    try {
      console.log('💾 Guardando regla de automatización:', formulario);
      
      const url = modoEdicion && reglaEditando 
        ? `http://localhost:8080/api/automation-rules/${reglaEditando.id}`
        : 'http://localhost:8080/api/automation-rules';
      
      const method = modoEdicion ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formulario),
      });
      
      if (response.ok) {
        const apiResponse = await response.json();
        console.log('✅ Respuesta del backend:', apiResponse);
        
        // El backend devuelve un ApiResponse con la regla en el campo 'data'
        const reglaGuardada = apiResponse.data;
        console.log(`✅ Regla ${modoEdicion ? 'actualizada' : 'creada'} en backend:`, reglaGuardada);
        
        await loadReglas(); // Recargar las reglas desde el backend
        setMostrarModal(false);
        setReglaEditando(null);
        alert(`✅ Regla de automatización ${modoEdicion ? 'actualizada' : 'creada'} exitosamente!`);
      } else {
        const errorResponse = await response.json();
        console.error('❌ Error del backend:', errorResponse);
        throw new Error(errorResponse.message || `Error al ${modoEdicion ? 'actualizar' : 'crear'} regla de automatización`);
      }
    } catch (error) {
      console.log('⚠️ Backend no disponible, guardando en modo demo');
      
      // Modo demo: guardar localmente
      if (modoEdicion && reglaEditando) {
        setReglas(prev => prev.map(r => 
          r.id === reglaEditando.id ? { ...r, ...formulario } : r
        ));
        alert('✅ Regla de automatización actualizada en modo demo! (Backend no disponible)');
      } else {
        const nuevaRegla: AutomationRule = {
          id: Date.now(),
          ...formulario,
          fechaCreacion: new Date().toISOString(),
          ejecuciones: 0
        };
        setReglas(prev => [nuevaRegla, ...prev]);
        alert('✅ Regla de automatización creada en modo demo! (Backend no disponible)');
      }
      setMostrarModal(false);
      setReglaEditando(null);
    }
  };

  const eliminarRegla = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta regla?')) return;
    
    try {
      console.log('🗑️ Eliminando regla con ID:', id);
      
      const response = await fetch(`http://localhost:8080/api/automation-rules/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const apiResponse = await response.json();
        console.log('✅ Regla eliminada:', apiResponse);
        await loadReglas(); // Recargar las reglas desde el backend
        alert('✅ Regla de automatización eliminada exitosamente!');
      } else {
        const errorResponse = await response.json();
        console.error('❌ Error del backend:', errorResponse);
        throw new Error(errorResponse.message || 'Error al eliminar regla de automatización');
      }
    } catch (error) {
      console.log('⚠️ Backend no disponible, eliminando en modo demo');
      
      // Modo demo: eliminar localmente
      setReglas(prev => prev.filter(regla => regla.id !== id));
      alert('✅ Regla de automatización eliminada en modo demo! (Backend no disponible)');
    }
  };

  const toggleRegla = async (regla: AutomationRule) => {
    try {
      console.log('🔄 Cambiando estado de regla con ID:', regla.id);
      
      const response = await fetch(`http://localhost:8080/api/automation-rules/${regla.id}/toggle`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        const apiResponse = await response.json();
        console.log('✅ Estado de regla actualizado:', apiResponse);
        await loadReglas(); // Recargar las reglas desde el backend
      } else {
        const errorResponse = await response.json();
        console.error('❌ Error del backend:', errorResponse);
        throw new Error(errorResponse.message || 'Error al cambiar estado de regla');
      }
    } catch (error) {
      console.log('⚠️ Backend no disponible, cambiando estado en modo demo');
      
      // Modo demo: cambiar estado localmente
      setReglas(prev => prev.map(r => 
        r.id === regla.id ? { ...r, activa: !r.activa } : r
      ));
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
        </div>
        <Button onClick={abrirModalCrear} className="btn-create">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Regla
        </Button>
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
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
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
                    {regla.prioridad}
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
                    value={formulario.prioridad}
                    onValueChange={(value) => setFormulario({ ...formulario, prioridad: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
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