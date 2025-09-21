import React, { useState, useEffect } from 'react';
import { api } from '../../../shared/api';
import './ConfigurationsManagement.css';

interface Configuracion {
  clave: string;
  valor: string;
  categoria: string;
  descripcion: string;
  tipo: 'texto' | 'numero' | 'booleano' | 'color' | 'url';
}

const ConfigurationsManagement: React.FC = () => {
  const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [configuracionSeleccionada, setConfiguracionSeleccionada] = useState<Configuracion | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: ''
  });

  // Formulario para crear/editar configuración
  const [formulario, setFormulario] = useState({
    clave: '',
    valor: '',
    categoria: '',
    descripcion: '',
    tipo: 'texto' as 'texto' | 'numero' | 'booleano' | 'color' | 'url'
  });

  // Cargar configuraciones
  const loadConfiguraciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getConfiguraciones();
      setConfiguraciones(response.general || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuraciones');
      console.error('Error cargando configuraciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfiguraciones();
  }, []);

  // Filtrar configuraciones
  const configuracionesFiltradas = configuraciones.filter(config => {
    const cumpleBusqueda = !filtros.busqueda || 
      config.clave.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      config.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const cumpleCategoria = !filtros.categoria || config.categoria === filtros.categoria;
    
    return cumpleBusqueda && cumpleCategoria;
  });

  // Limpiar formulario
  const limpiarFormulario = () => {
    setFormulario({
      clave: '',
      valor: '',
      categoria: '',
      descripcion: '',
      tipo: 'texto'
    });
    setConfiguracionSeleccionada(null);
    setModoEdicion(false);
  };

  // Abrir modal para crear configuración
  const abrirModalCrear = () => {
    limpiarFormulario();
    setMostrarModal(true);
  };

  // Abrir modal para editar configuración
  const abrirModalEditar = (config: Configuracion) => {
    setConfiguracionSeleccionada(config);
    setFormulario({
      clave: config.clave,
      valor: config.valor,
      categoria: config.categoria,
      descripcion: config.descripcion,
      tipo: config.tipo
    });
    setModoEdicion(true);
    setMostrarModal(true);
  };

  // Guardar configuración
  const guardarConfiguracion = async () => {
    try {
      if (modoEdicion && configuracionSeleccionada) {
        // Editar configuración existente
        await api.updateConfiguracion(configuracionSeleccionada.clave, {
          valor: formulario.valor,
          categoria: formulario.categoria,
          descripcion: formulario.descripcion,
          tipo: formulario.tipo
        });
      } else {
        // Crear nueva configuración
        await api.createConfiguracion({
          clave: formulario.clave,
          valor: formulario.valor,
          categoria: formulario.categoria,
          descripcion: formulario.descripcion,
          tipo: formulario.tipo
        });
      }

      setMostrarModal(false);
      limpiarFormulario();
      loadConfiguraciones(); // Recargar lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar configuración');
      console.error('Error guardando configuración:', err);
    }
  };

  // Eliminar configuración
  const eliminarConfiguracion = async (clave: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta configuración?')) {
      try {
        await api.deleteConfiguracion(clave);
        loadConfiguraciones(); // Recargar lista
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar configuración');
        console.error('Error eliminando configuración:', err);
      }
    }
  };

  // Obtener icono según categoría
  const getCategoriaIcono = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'general':
        return 'fas fa-cog';
      case 'colores':
        return 'fas fa-palette';
      case 'logo':
        return 'fas fa-image';
      case 'email':
        return 'fas fa-envelope';
      case 'seguridad':
        return 'fas fa-shield-alt';
      default:
        return 'fas fa-cog';
    }
  };

  // Obtener color según categoría
  const getCategoriaColor = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'general':
        return '#3b82f6';
      case 'colores':
        return '#8b5cf6';
      case 'logo':
        return '#f59e0b';
      case 'email':
        return '#10b981';
      case 'seguridad':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="configurations-management">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">Cargando configuraciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="configurations-management">
      <div className="configurations-header">
        <h1 className="configurations-title">Configuraciones del Sistema</h1>
        <p className="configurations-subtitle">Gestiona las configuraciones y parámetros del sistema</p>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
          <button 
            onClick={() => setError(null)}
            className="error-close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Filtros y acciones */}
      <div className="configurations-controls">
        <div className="filters-container">
          <div className="filter-group">
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              placeholder="Buscar configuraciones..."
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
              className="filter-select"
            >
              <option value="">Todas las categorías</option>
              <option value="general">General</option>
              <option value="colores">Colores</option>
              <option value="logo">Logo</option>
              <option value="email">Email</option>
              <option value="seguridad">Seguridad</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={abrirModalCrear}
          className="btn-create"
        >
          <i className="fas fa-plus mr-2"></i>
          Crear Configuración
        </button>
      </div>

      {/* Lista de configuraciones */}
      <div className="configurations-list">
        {configuracionesFiltradas.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-cog text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay configuraciones</h3>
            <p className="text-gray-600">
              {filtros.busqueda || filtros.categoria
                ? 'No se encontraron configuraciones con los filtros aplicados'
                : 'Crea la primera configuración del sistema'
              }
            </p>
          </div>
        ) : (
          <div className="configurations-grid">
            {configuracionesFiltradas.map(config => (
              <div key={config.clave} className="configuration-card">
                <div className="configuration-header">
                  <div 
                    className="configuration-icon"
                    style={{ backgroundColor: getCategoriaColor(config.categoria) }}
                  >
                    <i className={getCategoriaIcono(config.categoria)}></i>
                  </div>
                  <div className="configuration-info">
                    <h3 className="configuration-key">{config.clave}</h3>
                    <p className="configuration-description">{config.descripcion}</p>
                    <span 
                      className="configuration-category"
                      style={{ backgroundColor: getCategoriaColor(config.categoria) }}
                    >
                      {config.categoria}
                    </span>
                  </div>
                </div>
                
                <div className="configuration-body">
                  <div className="configuration-value">
                    <label className="value-label">Valor:</label>
                    <div className="value-content">
                      {config.tipo === 'booleano' ? (
                        <span className={`boolean-value ${config.valor === 'true' ? 'true' : 'false'}`}>
                          {config.valor === 'true' ? 'Habilitado' : 'Deshabilitado'}
                        </span>
                      ) : config.tipo === 'color' ? (
                        <div className="color-preview">
                          <div 
                            className="color-swatch"
                            style={{ backgroundColor: config.valor }}
                          ></div>
                          <span className="color-value">{config.valor}</span>
                        </div>
                      ) : (
                        <span className="text-value">{config.valor}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="configuration-type">
                    <label className="type-label">Tipo:</label>
                    <span className="type-value">{config.tipo}</span>
                  </div>
                </div>

                <div className="configuration-actions">
                  <button
                    onClick={() => abrirModalEditar(config)}
                    className="btn-edit"
                  >
                    <i className="fas fa-edit"></i>
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarConfiguracion(config.clave)}
                    className="btn-delete"
                  >
                    <i className="fas fa-trash"></i>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de crear/editar configuración */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {modoEdicion ? 'Editar Configuración' : 'Crear Configuración'}
              </h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="modal-close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Clave *</label>
                  <input
                    type="text"
                    value={formulario.clave}
                    onChange={(e) => setFormulario({ ...formulario, clave: e.target.value })}
                    className="form-input"
                    required
                    disabled={modoEdicion}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Categoría *</label>
                  <select
                    value={formulario.categoria}
                    onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value })}
                    className="form-input"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="general">General</option>
                    <option value="colores">Colores</option>
                    <option value="logo">Logo</option>
                    <option value="email">Email</option>
                    <option value="seguridad">Seguridad</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Tipo *</label>
                  <select
                    value={formulario.tipo}
                    onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value as any })}
                    className="form-input"
                    required
                  >
                    <option value="texto">Texto</option>
                    <option value="numero">Número</option>
                    <option value="booleano">Booleano</option>
                    <option value="color">Color</option>
                    <option value="url">URL</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Valor *</label>
                  {formulario.tipo === 'booleano' ? (
                    <select
                      value={formulario.valor}
                      onChange={(e) => setFormulario({ ...formulario, valor: e.target.value })}
                      className="form-input"
                      required
                    >
                      <option value="true">Habilitado</option>
                      <option value="false">Deshabilitado</option>
                    </select>
                  ) : formulario.tipo === 'color' ? (
                    <div className="color-input-group">
                      <input
                        type="color"
                        value={formulario.valor}
                        onChange={(e) => setFormulario({ ...formulario, valor: e.target.value })}
                        className="color-input"
                      />
                      <input
                        type="text"
                        value={formulario.valor}
                        onChange={(e) => setFormulario({ ...formulario, valor: e.target.value })}
                        className="form-input"
                        placeholder="#000000"
                      />
                    </div>
                  ) : (
                    <input
                      type={formulario.tipo === 'numero' ? 'number' : formulario.tipo === 'url' ? 'url' : 'text'}
                      value={formulario.valor}
                      onChange={(e) => setFormulario({ ...formulario, valor: e.target.value })}
                      className="form-input"
                      required
                    />
                  )}
                </div>
                
                <div className="form-group full-width">
                  <label className="form-label">Descripción *</label>
                  <textarea
                    value={formulario.descripcion}
                    onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                    className="form-textarea"
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setMostrarModal(false)}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={guardarConfiguracion}
                className="btn-save"
                disabled={!formulario.clave || !formulario.valor || !formulario.categoria || !formulario.descripcion}
              >
                <i className="fas fa-save mr-2"></i>
                {modoEdicion ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationsManagement;
