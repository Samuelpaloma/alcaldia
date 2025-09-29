import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  X
} from "lucide-react";

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

export default function SLAConfigurationWorking() {
  const [slaConfigs, setSlaConfigs] = useState<SLAConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
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
      const response = await fetch('http://localhost:8080/api/sla');
      if (response.ok) {
        const data = await response.json();
        setSlaConfigs(data);
      } else {
        console.error('Error al cargar configuraciones SLA');
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
          }
        ]);
      }
    } catch (error) {
      console.error('Error al cargar configuraciones SLA:', error);
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
      const response = await fetch('http://localhost:8080/api/sla', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formularioSLA),
      });
      
      if (response.ok) {
        await cargarConfiguracionesSLA();
        setMostrarModalCrear(false);
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
        alert('✅ Configuración SLA creada exitosamente!');
      } else {
        throw new Error('Error al crear configuración SLA');
      }
    } catch (error) {
      console.error('Error al crear configuración SLA:', error);
      alert('❌ Error al crear configuración SLA: ' + (error as Error).message);
    }
  };

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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Configuración SLA</h1>
            <p className="text-blue-100 text-lg">Define los tiempos de respuesta y resolución para diferentes categorías y prioridades</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => setMostrarModalCrear(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Configuración
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={cargarConfiguracionesSLA}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl">
            <Filter className="w-5 h-5 mr-2 text-blue-600" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Configuraciones</p>
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
                <p className="text-sm font-medium text-gray-600">Configuraciones Activas</p>
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
                <p className="text-sm font-medium text-gray-600">Configuraciones Inactivas</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slaConfigs
          .filter(config => 
            config.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            config.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((config) => (
          <Card key={config.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2">
                      {config.nombre}
                    </h3>
                    <p className="text-sm text-gray-500">ID: #{config.id}</p>
                  </div>
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
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {config.descripcion}
              </p>

              {/* SLA Times */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Respuesta:</span>
                  <span className="font-semibold text-blue-600">{config.tiempoRespuestaHoras}h</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Resolución:</span>
                  <span className="font-semibold text-green-600">{config.tiempoResolucionHoras}h</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Alerta:</span>
                  <span className="font-semibold text-orange-600">{config.tiempoAlertaHoras}h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {slaConfigs.filter(config => 
        config.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
      ).length === 0 && (
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
              <h2 className="text-xl font-bold">Crear Nueva Configuración SLA</h2>
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
    </div>
  );
}
