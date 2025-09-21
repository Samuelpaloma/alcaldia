import React, { useState, useEffect } from 'react';
import { api, UsuarioDTO } from '../../../shared/api';
import './UsersManagement.css';

const UsersManagement: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioDTO | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    tipoUsuario: ''
  });

  // Formulario para editar usuario
  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cargo: '',
    departamento: '',
    ubicacion: '',
    require2fa: false
  });

  // Cargar usuarios
  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener todos los usuarios (clientes/funcionarios)
      const response = await api.getUsers(0, 100);
      setUsuarios(response.content || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    const cumpleBusqueda = !filtros.busqueda || 
      usuario.nombreCompleto.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const cumpleEstado = !filtros.estado || 
      (filtros.estado === 'activo' && usuario.activo) ||
      (filtros.estado === 'inactivo' && !usuario.activo);
    const cumpleTipo = !filtros.tipoUsuario || 
      usuario.tipoUsuario.toLowerCase() === filtros.tipoUsuario.toLowerCase();
    
    return cumpleBusqueda && cumpleEstado && cumpleTipo;
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
      require2fa: false
    });
    setUsuarioSeleccionado(null);
    setModoEdicion(false);
  };

  // Abrir modal para editar usuario
  const abrirModalEditar = (usuario: UsuarioDTO) => {
    setUsuarioSeleccionado(usuario);
    setFormulario({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      cargo: usuario.cargo || '',
      departamento: usuario.departamento || '',
      ubicacion: usuario.ubicacion || '',
      require2fa: usuario.require2fa || false
    });
    setModoEdicion(true);
    setMostrarModal(true);
  };

  // Guardar usuario
  const guardarUsuario = async () => {
    if (!usuarioSeleccionado) return;

    try {
      await api.updateUser(usuarioSeleccionado.id, {
        nombre: formulario.nombre,
        apellido: formulario.apellido,
        email: formulario.email,
        telefono: formulario.telefono,
        cargo: formulario.cargo,
        departamento: formulario.departamento,
        ubicacion: formulario.ubicacion,
        require2fa: formulario.require2fa
      });

      setMostrarModal(false);
      limpiarFormulario();
      loadUsuarios(); // Recargar lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar usuario');
      console.error('Error guardando usuario:', err);
    }
  };

  // Activar/desactivar usuario
  const toggleEstadoUsuario = async (usuario: UsuarioDTO) => {
    try {
      await api.toggleUserStatus(usuario.id);
      loadUsuarios(); // Recargar lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
      console.error('Error cambiando estado:', err);
    }
  };

  // Obtener icono según tipo de usuario
  const getTipoIcono = (tipoUsuario: string) => {
    switch (tipoUsuario.toLowerCase()) {
      case 'funcionario':
        return 'fas fa-user-tie';
      case 'cliente':
        return 'fas fa-user';
      default:
        return 'fas fa-user';
    }
  };

  // Obtener color según tipo de usuario
  const getTipoColor = (tipoUsuario: string) => {
    switch (tipoUsuario.toLowerCase()) {
      case 'funcionario':
        return '#10b981';
      case 'cliente':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="users-management">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-management">
      <div className="users-header">
        <h1 className="users-title">Gestión de Usuarios</h1>
        <p className="users-subtitle">Administra los usuarios del sistema (clientes y funcionarios)</p>
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

      {/* Filtros */}
      <div className="users-controls">
        <div className="filters-container">
          <div className="filter-group">
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              placeholder="Buscar usuarios..."
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
          <div className="filter-group">
            <select
              value={filtros.tipoUsuario}
              onChange={(e) => setFiltros({ ...filtros, tipoUsuario: e.target.value })}
              className="filter-select"
            >
              <option value="">Todos los tipos</option>
              <option value="funcionario">Funcionarios</option>
              <option value="cliente">Clientes</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={loadUsuarios}
          className="btn-refresh"
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Actualizar
        </button>
      </div>

      {/* Estadísticas */}
      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{usuarios.length}</h3>
            <p className="stat-label">Total Usuarios</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{usuarios.filter(u => u.activo).length}</h3>
            <p className="stat-label">Usuarios Activos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-user-tie"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{usuarios.filter(u => u.tipoUsuario.toLowerCase() === 'funcionario').length}</h3>
            <p className="stat-label">Funcionarios</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-user"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{usuarios.filter(u => u.tipoUsuario.toLowerCase() === 'cliente').length}</h3>
            <p className="stat-label">Clientes</p>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="users-list">
        {usuariosFiltrados.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay usuarios</h3>
            <p className="text-gray-600">
              {filtros.busqueda || filtros.estado || filtros.tipoUsuario
                ? 'No se encontraron usuarios con los filtros aplicados'
                : 'No hay usuarios registrados en el sistema'
              }
            </p>
          </div>
        ) : (
          <div className="users-grid">
            {usuariosFiltrados.map(usuario => (
              <div key={usuario.id} className="user-card">
                <div className="user-header">
                  <div 
                    className="user-avatar"
                    style={{ backgroundColor: getTipoColor(usuario.tipoUsuario) }}
                  >
                    <i className={getTipoIcono(usuario.tipoUsuario)}></i>
                  </div>
                  <div className="user-info">
                    <h3 className="user-name">{usuario.nombreCompleto}</h3>
                    <p className="user-email">{usuario.email}</p>
                    <div className="user-badges">
                      <span className={`user-status ${usuario.activo ? 'active' : 'inactive'}`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <span 
                        className="user-type"
                        style={{ backgroundColor: getTipoColor(usuario.tipoUsuario) }}
                      >
                        {usuario.tipoUsuario}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="user-details">
                  <div className="detail-item">
                    <i className="fas fa-phone"></i>
                    <span>{usuario.telefono || 'No especificado'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-briefcase"></i>
                    <span>{usuario.cargo || 'No especificado'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-building"></i>
                    <span>{usuario.departamento || 'No especificado'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{usuario.ubicacion || 'No especificado'}</span>
                  </div>
                  {usuario.require2fa && (
                    <div className="detail-item">
                      <i className="fas fa-shield-alt"></i>
                      <span>2FA Habilitado</span>
                    </div>
                  )}
                </div>

                <div className="user-actions">
                  <button
                    onClick={() => abrirModalEditar(usuario)}
                    className="btn-edit"
                  >
                    <i className="fas fa-edit"></i>
                    Editar
                  </button>
                  <button
                    onClick={() => toggleEstadoUsuario(usuario)}
                    className={`btn-toggle ${usuario.activo ? 'deactivate' : 'activate'}`}
                  >
                    <i className={`fas ${usuario.activo ? 'fa-user-times' : 'fa-user-check'}`}></i>
                    {usuario.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de editar usuario */}
      {mostrarModal && usuarioSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Editar Usuario</h3>
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
                onClick={guardarUsuario}
                className="btn-save"
                disabled={!formulario.nombre || !formulario.apellido || !formulario.email}
              >
                <i className="fas fa-save mr-2"></i>
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
