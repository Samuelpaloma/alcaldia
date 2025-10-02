import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Plus, 
  Settings, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Save,
  X,
  Edit,
  Trash2
} from "lucide-react";
import { useI18n } from "../../i18n";
import '../admin/UsersModule.css';

interface SLAConfig {
  id: number;
  nombre: string;
  descripcion: string;
  categoriaId: number;
  categoriaNombre: string;
  prioridad: string;
  tiempoRespuestaHoras: number;
  tiempoResolucionHoras: number;
  tiempoAlertaHoras: number;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export default function SLAConfigurationFinal() {
  const { t } = useI18n();
  const [slaConfigs, setSlaConfigs] = useState<SLAConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [configSeleccionada, setConfigSeleccionada] = useState<SLAConfig | null>(null);
  const [formularioSLA, setFormularioSLA] = useState({
    nombre: '',
    descripcion: '',
    categoriaId: 1,
    categoriaNombre: '',
    prioridad: 'MEDIA',
    tiempoRespuestaHoras: 2,
    tiempoResolucionHoras: 8,
    tiempoAlertaHoras: 1,
    activo: true
  });

  // Cargar configuraciones SLA
  const cargarConfiguracionesSLA = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Cargando configuraciones SLA...');
      
      const response = await fetch('http://localhost:8080/api/sla');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Configuraciones SLA cargadas:', data);
        setSlaConfigs(data);
      } else {
        console.log('⚠️ Backend no disponible, usando datos de prueba');
        // Datos de prueba si no hay respuesta del servidor
        setSlaConfigs([
          {
            id: 1,
            nombre: 'SLA Redes - Alta Prioridad',
            descripcion: 'Configuración SLA para tickets de redes con prioridad alta',
            categoriaId: 1,
            categoriaNombre: 'Redes',
            prioridad: 'ALTA',
            tiempoRespuestaHoras: 1,
            tiempoResolucionHoras: 4,
            tiempoAlertaHoras: 1,
            activo: true,
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString()
          },
          {
            id: 2,
            nombre: 'SLA Software - Media Prioridad',
            descripcion: 'Configuración SLA para tickets de software con prioridad media',
            categoriaId: 2,
            categoriaNombre: 'Software',
            prioridad: 'MEDIA',
            tiempoRespuestaHoras: 2,
            tiempoResolucionHoras: 8,
            tiempoAlertaHoras: 1,
            activo: true,
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString()
          },
          {
            id: 3,
            nombre: 'SLA Hardware - Baja Prioridad',
            descripcion: 'Configuración SLA para tickets de hardware con prioridad baja',
            categoriaId: 3,
            categoriaNombre: 'Hardware',
            prioridad: 'BAJA',
            tiempoRespuestaHoras: 4,
            tiempoResolucionHoras: 24,
            tiempoAlertaHoras: 2,
            activo: false,
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('❌ Error al cargar configuraciones SLA:', error);
      // Datos de prueba en caso de error
      setSlaConfigs([
        {
          id: 1,
          nombre: 'SLA Redes - Alta Prioridad',
          descripcion: 'Configuración SLA para tickets de redes con prioridad alta',
          categoriaId: 1,
          categoriaNombre: 'Redes',
          prioridad: 'ALTA',
          tiempoRespuestaHoras: 1,
          tiempoResolucionHoras: 4,
          tiempoAlertaHoras: 1,
          activo: true,
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Crear nueva configuración SLA
  const crearConfiguracionSLA = async () => {
    try {
      console.log('💾 Creando configuración SLA:', formularioSLA);
      
      const response = await fetch('http://localhost:8080/api/sla', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formularioSLA),
      });
      
      if (response.ok) {
        const nuevaConfig = await response.json();
        console.log('✅ Configuración SLA creada en backend:', nuevaConfig);
        await cargarConfiguracionesSLA();
        setMostrarModalCrear(false);
        limpiarFormulario();
        alert('✅ Configuración SLA creada exitosamente!');
      } else {
        throw new Error('Error al crear configuración SLA');
      }
    } catch (error) {
      console.log('⚠️ Backend no disponible, creando en modo demo');
      
      // Modo demo: crear localmente
      const nuevaConfig = {
        id: Math.max(...slaConfigs.map(c => c.id), 0) + 1,
        nombre: formularioSLA.nombre,
        descripcion: formularioSLA.descripcion,
        categoriaId: formularioSLA.categoriaId,
        categoriaNombre: formularioSLA.categoriaNombre,
        prioridad: formularioSLA.prioridad,
        tiempoRespuestaHoras: formularioSLA.tiempoRespuestaHoras,
        tiempoResolucionHoras: formularioSLA.tiempoResolucionHoras,
        tiempoAlertaHoras: formularioSLA.tiempoAlertaHoras,
        activo: formularioSLA.activo,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };
      
      setSlaConfigs([...slaConfigs, nuevaConfig]);
      setMostrarModalCrear(false);
      limpiarFormulario();
      alert('✅ Configuración SLA creada en modo demo! (Backend no disponible)');
    }
  };

  // Actualizar configuración SLA
  const actualizarConfiguracionSLA = async () => {
    if (!configSeleccionada) return;
    
    try {
      console.log('💾 Actualizando configuración SLA:', formularioSLA);
      
      // Intentar conectar con el backend
      const response = await fetch(`http://localhost:8080/api/sla/${configSeleccionada.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formularioSLA),
      });
      
      if (response.ok) {
        const configActualizada = await response.json();
        console.log('✅ Configuración SLA actualizada en backend:', configActualizada);
        await cargarConfiguracionesSLA();
        setMostrarModalEditar(false);
        setConfigSeleccionada(null);
        limpiarFormulario();
        alert('✅ Configuración SLA actualizada exitosamente!');
      } else {
        throw new Error('Error al actualizar configuración SLA');
      }
    } catch (error) {
      console.log('⚠️ Backend no disponible, actualizando en modo demo');
      
      // Modo demo: actualizar localmente
      const configuracionesActualizadas = slaConfigs.map(config => {
        if (config.id === configSeleccionada.id) {
          return {
            ...config,
            nombre: formularioSLA.nombre,
            descripcion: formularioSLA.descripcion,
            categoriaNombre: formularioSLA.categoriaNombre,
            prioridad: formularioSLA.prioridad,
            tiempoRespuestaHoras: formularioSLA.tiempoRespuestaHoras,
            tiempoResolucionHoras: formularioSLA.tiempoResolucionHoras,
            tiempoAlertaHoras: formularioSLA.tiempoAlertaHoras,
            activo: formularioSLA.activo,
            fechaActualizacion: new Date().toISOString()
          };
        }
        return config;
      });
      
      setSlaConfigs(configuracionesActualizadas);
      setMostrarModalEditar(false);
      setConfigSeleccionada(null);
      limpiarFormulario();
      alert('✅ Configuración SLA actualizada en modo demo! (Backend no disponible)');
    }
  };

  // Eliminar configuración SLA
  const eliminarConfiguracionSLA = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta configuración SLA?')) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/sla/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await cargarConfiguracionesSLA();
        alert('✅ Configuración SLA eliminada exitosamente!');
      } else {
        throw new Error('Error al eliminar configuración SLA');
      }
    } catch (error) {
      console.log('⚠️ Backend no disponible, eliminando en modo demo');
      
      // Modo demo: eliminar localmente
      const configuracionesActualizadas = slaConfigs.filter(config => config.id !== id);
      setSlaConfigs(configuracionesActualizadas);
      alert('✅ Configuración SLA eliminada en modo demo! (Backend no disponible)');
    }
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    setFormularioSLA({
      nombre: '',
      descripcion: '',
      categoriaId: 1,
      categoriaNombre: '',
      prioridad: 'MEDIA',
      tiempoRespuestaHoras: 2,
      tiempoResolucionHoras: 8,
      tiempoAlertaHoras: 1,
      activo: true
    });
  };

  // Abrir modal de edición
  const abrirModalEdicion = (config: SLAConfig) => {
    setConfigSeleccionada(config);
    setFormularioSLA({
      nombre: config.nombre,
      descripcion: config.descripcion,
      categoriaId: config.categoriaId,
      categoriaNombre: config.categoriaNombre,
      prioridad: config.prioridad,
      tiempoRespuestaHoras: config.tiempoRespuestaHoras,
      tiempoResolucionHoras: config.tiempoResolucionHoras,
      tiempoAlertaHoras: config.tiempoAlertaHoras,
      activo: config.activo
    });
    setMostrarModalEditar(true);
  };

  // Filtrar configuraciones
  const configuracionesFiltradas = slaConfigs.filter(config => {
    const matchesSearch = config.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         config.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || (statusFilter === 'activo' ? config.activo : !config.activo);
    const matchesPriority = !priorityFilter || config.prioridad === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Obtener badge de prioridad
  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'CRITICA': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle, label: 'CRÍTICA' },
      'ALTA': { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Clock, label: 'ALTA' },
      'MEDIA': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'MEDIA' },
      'BAJA': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'BAJA' }
    };
    
    const config = priorityConfig[priority] || priorityConfig['MEDIA'];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border font-semibold`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  useEffect(() => {
    console.log('🚀 Componente SLAConfigurationFinal montado');
    cargarConfiguracionesSLA();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando configuraciones SLA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-module">
      {/* Header Section */}
      <div className="module-header">
        <div className="header-content">
          <h1 className="page-title">{t("sla_configuration.title")}</h1>
          <p className="page-subtitle">{t("sla_configuration.subtitle")}</p>
        </div>
        <div className="header-actions">
          <Button 
            className="create-btn"
            onClick={() => setMostrarModalCrear(true)}
          >
            <Plus className="w-4 h-4" />
            {t("sla_configuration.new_configuration")}
          </Button>
          <button 
            className="refresh-btn"
            onClick={cargarConfiguracionesSLA}
          >
            <RefreshCw className="w-4 h-4" />
            {t("sla_configuration.update")}
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="filters-card">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Filter className="w-5 h-5 mr-2" />
            {t("sla_configuration.filters_title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="filters-grid">
            {/* Búsqueda */}
            <div className="search-container">
              <Search className="search-icon" />
              <Input
                placeholder={t("sla_configuration.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Estado */}
            <div className="filter-group">
              <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="filter-select">
                  <SelectValue placeholder={t("sla_configuration.all_statuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("sla_configuration.all_statuses")}</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prioridad */}
            <div className="filter-group">
              <Select value={priorityFilter || "all"} onValueChange={(value) => setPriorityFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="filter-select">
                  <SelectValue placeholder={t("sla_configuration.all_priorities")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("sla_configuration.all_priorities")}</SelectItem>
                  <SelectItem value="CRITICA">Crítica</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="MEDIA">Media</SelectItem>
                  <SelectItem value="BAJA">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: '1.5rem' }}>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("sla_configuration.total_configurations")}</p>
                <p className="text-2xl font-bold text-gray-900">{slaConfigs.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("sla_configuration.active_configurations")}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {slaConfigs.filter(c => c.activo).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("sla_configuration.inactive_configurations")}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {slaConfigs.filter(c => !c.activo).length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <XCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuraciones SLA Grid */}
      <div className="users-grid" style={{ marginTop: '2rem' }}>
        {configuracionesFiltradas.map((config) => (
          <Card key={config.id} className="user-card">
            <CardContent>
              {/* Header */}
              <div className="user-header">
                <div className="user-avatar">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="user-info">
                  <h3 className="user-name">
                    {config.nombre}
                  </h3>
                  <p className="text-sm text-muted-foreground">ID: #{config.id}</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {getPriorityBadge(config.prioridad)}
                <Badge className={`${config.activo ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} border font-medium`}>
                  {config.activo ? 'ACTIVO' : 'INACTIVO'}
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 border font-medium">
                  {config.categoriaNombre}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {config.descripcion}
              </p>

              {/* SLA Times */}
              <div className="user-details">
                <div className="detail-item">
                  <Clock className="w-4 h-4" />
                  <span>{t("sla_configuration.response")}: {config.tiempoRespuestaHoras}h</span>
                </div>
                <div className="detail-item">
                  <CheckCircle className="w-4 h-4" />
                  <span>{t("sla_configuration.resolution")}: {config.tiempoResolucionHoras}h</span>
                </div>
                <div className="detail-item">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t("sla_configuration.alert")}: {config.tiempoAlertaHoras}h</span>
                </div>
              </div>

              {/* Actions */}
              <div className="user-actions">
                <button 
                  className="action-btn edit"
                  onClick={() => abrirModalEdicion(config)}
                >
                  <Edit className="w-4 h-4" />
                  {t("sla_configuration.edit_btn")}
                </button>
                <button 
                  className="action-btn deactivate"
                  onClick={() => eliminarConfiguracionSLA(config.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  {t("sla_configuration.delete_btn")}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {configuracionesFiltradas.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron configuraciones SLA</h3>
            <p className="text-gray-600">Intenta ajustar los filtros de búsqueda o crea una nueva configuración</p>
          </CardContent>
        </Card>
      )}

      {/* Modal para crear configuración SLA */}
      {mostrarModalCrear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t("sla_configuration.create_new")}</h2>
              <button 
                onClick={() => setMostrarModalCrear(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Configuración
                </label>
                <Input
                  type="text"
                  value={formularioSLA.nombre}
                  onChange={(e) => setFormularioSLA({ ...formularioSLA, nombre: e.target.value })}
                  placeholder="Ej: SLA Redes - Alta Prioridad"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formularioSLA.descripcion}
                  onChange={(e) => setFormularioSLA({ ...formularioSLA, descripcion: e.target.value })}
                  placeholder="Describe el propósito de esta configuración SLA..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <Input
                    type="text"
                    value={formularioSLA.categoriaNombre}
                    onChange={(e) => setFormularioSLA({ ...formularioSLA, categoriaNombre: e.target.value })}
                    placeholder="Ej: Redes, Software"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={formularioSLA.prioridad}
                    onChange={(e) => setFormularioSLA({ ...formularioSLA, prioridad: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CRITICA">Crítica</option>
                    <option value="ALTA">Alta</option>
                    <option value="MEDIA">Media</option>
                    <option value="BAJA">Baja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo de Respuesta (horas)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formularioSLA.tiempoRespuestaHoras}
                    onChange={(e) => setFormularioSLA({ ...formularioSLA, tiempoRespuestaHoras: parseInt(e.target.value) || 1 })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo de Resolución (horas)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formularioSLA.tiempoResolucionHoras}
                    onChange={(e) => setFormularioSLA({ ...formularioSLA, tiempoResolucionHoras: parseInt(e.target.value) || 1 })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo de Alerta (horas)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formularioSLA.tiempoAlertaHoras}
                    onChange={(e) => setFormularioSLA({ ...formularioSLA, tiempoAlertaHoras: parseInt(e.target.value) || 1 })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formularioSLA.activo}
                  onChange={(e) => setFormularioSLA({ ...formularioSLA, activo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                  Configuración activa
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                variant="outline"
                onClick={() => setMostrarModalCrear(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                onClick={crearConfiguracionSLA}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Crear Configuración
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar configuración SLA */}
      {mostrarModalEditar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t("sla_configuration.edit")}</h2>
              <button 
                onClick={() => setMostrarModalEditar(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Configuración
                </label>
                <Input
                  type="text"
                  value={formularioSLA.nombre}
                  onChange={(e) => setFormularioSLA({ ...formularioSLA, nombre: e.target.value })}
                  placeholder="Ej: SLA Redes - Alta Prioridad"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formularioSLA.descripcion}
                  onChange={(e) => setFormularioSLA({ ...formularioSLA, descripcion: e.target.value })}
                  placeholder="Describe el propósito de esta configuración SLA..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <Input
                    type="text"
                    value={formularioSLA.categoriaNombre}
                    onChange={(e) => setFormularioSLA({ ...formularioSLA, categoriaNombre: e.target.value })}
                    placeholder="Ej: Redes, Software"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={formularioSLA.prioridad}
                    onChange={(e) => setFormularioSLA({ ...formularioSLA, prioridad: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CRITICA">Crítica</option>
                    <option value="ALTA">Alta</option>
                    <option value="MEDIA">Media</option>
                    <option value="BAJA">Baja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo de Respuesta (horas)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formularioSLA.tiempoRespuestaHoras}
                    onChange={(e) => setFormularioSLA({ ...formularioSLA, tiempoRespuestaHoras: parseInt(e.target.value) || 1 })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo de Resolución (horas)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formularioSLA.tiempoResolucionHoras}
                    onChange={(e) => setFormularioSLA({ ...formularioSLA, tiempoResolucionHoras: parseInt(e.target.value) || 1 })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo de Alerta (horas)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formularioSLA.tiempoAlertaHoras}
                    onChange={(e) => setFormularioSLA({ ...formularioSLA, tiempoAlertaHoras: parseInt(e.target.value) || 1 })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activo-edit"
                  checked={formularioSLA.activo}
                  onChange={(e) => setFormularioSLA({ ...formularioSLA, activo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="activo-edit" className="text-sm font-medium text-gray-700">
                  Configuración activa
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                variant="outline"
                onClick={() => setMostrarModalEditar(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                onClick={actualizarConfiguracionSLA}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Actualizar Configuración
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
