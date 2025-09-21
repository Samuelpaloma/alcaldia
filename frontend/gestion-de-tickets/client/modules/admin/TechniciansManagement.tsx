import React, { useState, useEffect } from 'react';
import { api, UsuarioDTO, CreateTecnicoRequest } from '../../../shared/api';
import './TechniciansManagement.css';

const TechniciansManagement: React.FC = () => {
  const [tecnicos, setTecnicos] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<UsuarioDTO | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: ''
  });

  // Formulario para crear/editar técnico
  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cargo: '',
    departamento: '',
    ubicacion: '',
    password: '',
    confirmPassword: '',
    require2fa: false
  });

  // Cargar técnicos
  const loadTecnicos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getTechnicians(0, 100);
      setTecnicos(response.content || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar técnicos');
      console.error('Error cargando técnicos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTecnicos();
  }, []);

  // Filtrar técnicos
  const tecnicosFiltrados = tecnicos.filter(tecnico => {
    const cumpleBusqueda = !filtros.busqueda || 
      tecnico.nombreCompleto.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      tecnico.email.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const cumpleEstado = !filtros.estado || 
      (filtros.estado === 'activo' && tecnico.activo) ||
      (filtros.estado === 'inactivo' && !tecnico.activo);
    
    return cumpleBusqueda && cumpleEstado;
  });

  // Limpiar formulario
  const limpiarFormulario = () => {
    setFormulario({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      cargo: '',
      departamento: '',
      ubicacion: '',
      password: '',
      confirmPassword: '',
      require2fa: false
    });
    setTecnicoSeleccionado(null);
    setModoEdicion(false);
  };

  // Abrir modal para crear técnico
  const abrirModalCrear = () => {
    limpiarFormulario();
    setMostrarModal(true);
  };

  // Abrir modal para editar técnico
  const abrirModalEditar = (tecnico: UsuarioDTO) => {
    setTecnicoSeleccionado(tecnico);
    setFormulario({
      nombre: tecnico.nombre || '',
      apellido: tecnico.apellido || '',
      email: tecnico.email || '',
      telefono: tecnico.telefono || '',
      cargo: tecnico.cargo || '',
      departamento: tecnico.departamento || '',
      ubicacion: tecnico.ubicacion || '',
      password: '',
      confirmPassword: '',
      require2fa: tecnico.require2fa || false
    });
    setModoEdicion(true);
    setMostrarModal(true);
  };

  // Guardar técnico
  const guardarTecnico = async () => {
    try {
      if (modoEdicion && tecnicoSeleccionado) {
        // Editar técnico existente
        await api.updateUser(tecnicoSeleccionado.id, {
          nombre: formulario.nombre,
          apellido: formulario.apellido,
          email: formulario.email,
          telefono: formulario.telefono,
          cargo: formulario.cargo,
          departamento: formulario.departamento,
          ubicacion: formulario.ubicacion,
          require2fa: formulario.require2fa
        });
      } else {
        // Crear nuevo técnico
        if (formulario.password !== formulario.confirmPassword) {
          setError('Las contraseñas no coinciden');
          return;
        }

        const request: CreateTecnicoRequest = {
          nombre: formulario.nombre,
          apellido: formulario.apellido,
          email: formulario.email,
          telefono: formulario.telefono,
          cargo: formulario.cargo,
          departamento: formulario.departamento,
          ubicacion: formulario.ubicacion,
          password: formulario.password,
          require2fa: formulario.require2fa
        };

        await api.createTechnician(request);
      }

      setMostrarModal(false);
      limpiarFormulario();
      loadTecnicos(); // Recargar lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar técnico');
      console.error('Error guardando técnico:', err);
    }
  };

  // Activar/desactivar técnico
  const toggleEstadoTecnico = async (tecnico: UsuarioDTO) => {
    try {
      await api.toggleUserStatus(tecnico.id);
      loadTecnicos(); // Recargar lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
      console.error('Error cambiando estado:', err);
    }
  };

  if (loading) {
    return (
      <div className="technicians-management">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">Cargando técnicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="technicians-management">
      <div className="technicians-header">
        <h1 className="technicians-title">Gestión de Técnicos</h1>
        <p className="technicians-subtitle">Administra los técnicos del sistema</p>
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
      <div className="technicians-controls">
        <div className="filters-container">
          <div className="filter-group">
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              placeholder="Buscar técnicos..."
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={abrirModalCrear}
          className="btn-create"
        >
          <i className="fas fa-plus mr-2"></i>
          Crear Técnico
        </button>
      </div>

      {/* Lista de técnicos */}
      <div className="technicians-list">
        {tecnicosFiltrados.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay técnicos</h3>
            <p className="text-gray-600">
              {filtros.busqueda || filtros.estado 
                ? 'No se encontraron técnicos con los filtros aplicados'
                : 'Crea el primer técnico del sistema'
              }
            </p>
          </div>
        ) : (
          <div className="technicians-grid">
            {tecnicosFiltrados.map(tecnico => (
              <div key={tecnico.id} className="technician-card">
                <div className="technician-header">
                  <div className="technician-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="technician-info">
                    <h3 className="technician-name">{tecnico.nombreCompleto}</h3>
                    <p className="technician-email">{tecnico.email}</p>
                    <span className={`technician-status ${tecnico.activo ? 'active' : 'inactive'}`}>
                      {tecnico.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                
                <div className="technician-details">
                  <div className="detail-item">
                    <i className="fas fa-phone"></i>
                    <span>{tecnico.telefono || 'No especificado'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-briefcase"></i>
                    <span>{tecnico.cargo || 'No especificado'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-building"></i>
                    <span>{tecnico.departamento || 'No especificado'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{tecnico.ubicacion || 'No especificado'}</span>
                  </div>
                </div>

                <div className="technician-actions">
                  <button
                    onClick={() => abrirModalEditar(tecnico)}
                    className="btn-edit"
                  >
                    <i className="fas fa-edit"></i>
                    Editar
                  </button>
                  <button
                    onClick={() => toggleEstadoTecnico(tecnico)}
                    className={`btn-toggle ${tecnico.activo ? 'deactivate' : 'activate'}`}
                  >
                    <i className={`fas ${tecnico.activo ? 'fa-user-times' : 'fa-user-check'}`}></i>
                    {tecnico.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de crear/editar técnico */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {modoEdicion ? 'Editar Técnico' : 'Crear Técnico'}
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
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Apellido *</label>
                  <input
                    type="text"
                    value={formulario.apellido}
                    onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    value={formulario.email}
                    onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    value={formulario.telefono}
                    onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Cargo</label>
                  <input
                    type="text"
                    value={formulario.cargo}
                    onChange={(e) => setFormulario({ ...formulario, cargo: e.target.value })}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Departamento</label>
                  <input
                    type="text"
                    value={formulario.departamento}
                    onChange={(e) => setFormulario({ ...formulario, departamento: e.target.value })}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ubicación</label>
                  <input
                    type="text"
                    value={formulario.ubicacion}
                    onChange={(e) => setFormulario({ ...formulario, ubicacion: e.target.value })}
                    className="form-input"
                  />
                </div>
                
                {!modoEdicion && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Contraseña *</label>
                      <input
                        type="password"
                        value={formulario.password}
                        onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Confirmar Contraseña *</label>
                      <input
                        type="password"
                        value={formulario.confirmPassword}
                        onChange={(e) => setFormulario({ ...formulario, confirmPassword: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                  </>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formulario.require2fa}
                    onChange={(e) => setFormulario({ ...formulario, require2fa: e.target.checked })}
                  />
                  <span className="checkmark"></span>
                  Requerir autenticación de dos factores
                </label>
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
                onClick={guardarTecnico}
                className="btn-save"
                disabled={!formulario.nombre || !formulario.apellido || !formulario.email || (!modoEdicion && !formulario.password)}
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

export default TechniciansManagement;
