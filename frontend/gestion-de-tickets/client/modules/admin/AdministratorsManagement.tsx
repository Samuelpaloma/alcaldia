import React, { useState, useEffect } from 'react';
import { api, UsuarioDTO, CreateAdminRequest } from '../../../shared/api';
import './AdministratorsManagement.css';

const AdministratorsManagement: React.FC = () => {
  const [administradores, setAdministradores] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [administradorSeleccionado, setAdministradorSeleccionado] = useState<UsuarioDTO | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: ''
  });

  // Formulario para crear/editar administrador
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

  // Cargar administradores
  const loadAdministradores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getAdmins(0, 100);
      setAdministradores(response.content || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar administradores');
      console.error('Error cargando administradores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdministradores();
  }, []);

  // Filtrar administradores
  const administradoresFiltrados = administradores.filter(admin => {
    const cumpleBusqueda = !filtros.busqueda || 
      admin.nombreCompleto.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      admin.email.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const cumpleEstado = !filtros.estado || 
      (filtros.estado === 'activo' && admin.activo) ||
      (filtros.estado === 'inactivo' && !admin.activo);
    
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
    setAdministradorSeleccionado(null);
    setModoEdicion(false);
  };

  // Abrir modal para crear administrador
  const abrirModalCrear = () => {
    limpiarFormulario();
    setMostrarModal(true);
  };

  // Abrir modal para editar administrador
  const abrirModalEditar = (admin: UsuarioDTO) => {
    setAdministradorSeleccionado(admin);
    setFormulario({
      nombre: admin.nombre || '',
      apellido: admin.apellido || '',
      email: admin.email || '',
      telefono: admin.telefono || '',
      cargo: admin.cargo || '',
      departamento: admin.departamento || '',
      ubicacion: admin.ubicacion || '',
      password: '',
      confirmPassword: '',
      require2fa: admin.require2fa || false
    });
    setModoEdicion(true);
    setMostrarModal(true);
  };

  // Guardar administrador
  const guardarAdministrador = async () => {
    try {
      if (modoEdicion && administradorSeleccionado) {
        // Editar administrador existente
        await api.updateUser(administradorSeleccionado.id, {
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
        // Crear nuevo administrador
        if (formulario.password !== formulario.confirmPassword) {
          setError('Las contraseñas no coinciden');
          return;
        }

        const request: CreateAdminRequest = {
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

        await api.createAdmin(request);
      }

      setMostrarModal(false);
      limpiarFormulario();
      loadAdministradores(); // Recargar lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar administrador');
      console.error('Error guardando administrador:', err);
    }
  };

  // Activar/desactivar administrador
  const toggleEstadoAdministrador = async (admin: UsuarioDTO) => {
    try {
      await api.toggleUserStatus(admin.id);
      loadAdministradores(); // Recargar lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
      console.error('Error cambiando estado:', err);
    }
  };

  if (loading) {
    return (
      <div className="administrators-management">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">Cargando administradores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="administrators-management">
      <div className="administrators-header">
        <h1 className="administrators-title">Gestión de Administradores</h1>
        <p className="administrators-subtitle">Administra los administradores del sistema</p>
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
      <div className="administrators-controls">
        <div className="filters-container">
          <div className="filter-group">
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              placeholder="Buscar administradores..."
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
          Crear Administrador
        </button>
      </div>

      {/* Lista de administradores */}
      <div className="administrators-list">
        {administradoresFiltrados.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-user-shield text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay administradores</h3>
            <p className="text-gray-600">
              {filtros.busqueda || filtros.estado 
                ? 'No se encontraron administradores con los filtros aplicados'
                : 'Crea el primer administrador del sistema'
              }
            </p>
          </div>
        ) : (
          <div className="administrators-grid">
            {administradoresFiltrados.map(admin => (
              <div key={admin.id} className="administrator-card">
                <div className="administrator-header">
                  <div className="administrator-avatar">
                    <i className="fas fa-user-shield"></i>
                  </div>
                  <div className="administrator-info">
                    <h3 className="administrator-name">{admin.nombreCompleto}</h3>
                    <p className="administrator-email">{admin.email}</p>
                    <span className={`administrator-status ${admin.activo ? 'active' : 'inactive'}`}>
                      {admin.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                
                <div className="administrator-details">
                  <div className="detail-item">
                    <i className="fas fa-phone"></i>
                    <span>{admin.telefono || 'No especificado'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-briefcase"></i>
                    <span>{admin.cargo || 'No especificado'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-building"></i>
                    <span>{admin.departamento || 'No especificado'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{admin.ubicacion || 'No especificado'}</span>
                  </div>
                </div>

                <div className="administrator-actions">
                  <button
                    onClick={() => abrirModalEditar(admin)}
                    className="btn-edit"
                  >
                    <i className="fas fa-edit"></i>
                    Editar
                  </button>
                  <button
                    onClick={() => toggleEstadoAdministrador(admin)}
                    className={`btn-toggle ${admin.activo ? 'deactivate' : 'activate'}`}
                  >
                    <i className={`fas ${admin.activo ? 'fa-user-times' : 'fa-user-check'}`}></i>
                    {admin.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de crear/editar administrador */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {modoEdicion ? 'Editar Administrador' : 'Crear Administrador'}
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
                onClick={guardarAdministrador}
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

export default AdministratorsManagement;
