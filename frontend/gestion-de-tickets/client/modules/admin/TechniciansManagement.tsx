import React, { useState, useEffect } from 'react';
import { api, UsuarioDTO, CreateTecnicoRequest } from '../../../shared/api';
import './TechniciansManagement.css';

const TechniciansManagement: React.FC = () => {
  useEffect(() => {
    console.log('TechniciansManagement montado');
  }, []);
  const [tecnicos, setTecnicos] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<UsuarioDTO | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modoVisualizacion, setModoVisualizacion] = useState(false);
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
      (tecnico.nombreCompleto || `${tecnico.nombre} ${tecnico.apellido}`).toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      tecnico.email.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const cumpleEstado = !filtros.estado || 
      (filtros.estado === 'activo' && tecnico.activo) ||
      (filtros.estado === 'inactivo' && !tecnico.activo);
    
    // Debug log para el filtro
    console.log('🔍 Filtro técnico aplicado:', {
      filtros,
      tecnicoTipo: tecnico.tipoUsuario,
      cumpleBusqueda,
      cumpleEstado,
      tecnicoName: tecnico.nombreCompleto || `${tecnico.nombre} ${tecnico.apellido}`
    });
    
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
    setModoVisualizacion(false);
  };

  // Abrir modal para crear técnico
  const abrirModalCrear = () => {
    limpiarFormulario();
    setModoEdicion(false);
    setModoVisualizacion(false);
    setMostrarModal(true);
  };

  // Abrir modal para ver técnico
  const abrirModalVer = (tecnico: UsuarioDTO) => {
    console.log('=== ABRIENDO MODAL VER ===');
    console.log('Técnico seleccionado:', tecnico);
    console.log('Estado antes:', { mostrarModal, modoVisualizacion, modoEdicion });
    
    setTecnicoSeleccionado(tecnico);
    setModoVisualizacion(true);
    setModoEdicion(false);
    setMostrarModal(true);
    
    console.log('Estados actualizados - mostrarModal debería ser true');
  };

  // Abrir modal para editar técnico
  const abrirModalEditar = (tecnico: UsuarioDTO) => {
    console.log('Abriendo modal para editar técnico:', tecnico);
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
    setModoVisualizacion(false);
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
          telefono: formulario.telefono,
          cargo: formulario.cargo,
          departamento: formulario.departamento,
          ubicacion: formulario.ubicacion
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
        
        {/* Botón de prueba */}
        <button 
          onClick={() => {
            console.log('=== BOTÓN PRUEBA CLICKEADO ===');
            setMostrarModal(true);
            setModoVisualizacion(true);
            setTecnicoSeleccionado({
              id: 999,
              email: 'test@test.com',
              nombre: 'Test',
              apellido: 'Usuario',
              telefono: '123456789',
              tipoUsuario: 'TECNICO',
              activo: true,
              emailVerificado: true,
              require2fa: false,
              fechaCreacion: new Date().toISOString(),
              fechaActualizacion: new Date().toISOString()
            });
          }}
          style={{ 
            background: 'purple', 
            color: 'white', 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '6px', 
            marginLeft: '10px' 
          }}
        >
          🧪 PRUEBA MODAL
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
                    <h3 className="technician-name">{tecnico.nombreCompleto || `${tecnico.nombre} ${tecnico.apellido}`}</h3>
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
                    onClick={() => {
                      console.log('CLICK VER', tecnico);
                      abrirModalVer(tecnico);
                    }}
                    className="btn-view"
                  >
                    <i className="fas fa-eye"></i>
                    Ver
                  </button>
                  <button
                    onClick={() => {
                      console.log('CLICK EDITAR', tecnico);
                      abrirModalEditar(tecnico);
                    }}
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

      {/* MODAL SIMPLE Y FUNCIONAL */}
      {mostrarModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          {/* LOG VISUAL DEL MODAL */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: '#222',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            zIndex: 10000
          }}>
            Modal abierto: {modoVisualizacion ? 'Ver' : modoEdicion ? 'Editar' : 'Crear'}<br/>
            Técnico seleccionado: {tecnicoSeleccionado ? tecnicoSeleccionado.nombre + ' ' + tecnicoSeleccionado.apellido : 'Ninguno'}
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #eee',
              paddingBottom: '15px'
            }}>
              <h2 style={{ margin: 0, color: '#333' }}>
                {modoVisualizacion ? 'Ver Técnico' : modoEdicion ? 'Editar Técnico' : 'Crear Técnico'}
              </h2>
              <button
                onClick={() => setMostrarModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            {modoVisualizacion && tecnicoSeleccionado ? (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#333', marginBottom: '10px' }}>
                    {tecnicoSeleccionado.nombre} {tecnicoSeleccionado.apellido}
                  </h3>
                  <p style={{ color: '#666', margin: '5px 0' }}>
                    <strong>Email:</strong> {tecnicoSeleccionado.email}
                  </p>
                  <p style={{ color: '#666', margin: '5px 0' }}>
                    <strong>Teléfono:</strong> {tecnicoSeleccionado.telefono || 'No especificado'}
                  </p>
                  <p style={{ color: '#666', margin: '5px 0' }}>
                    <strong>Cargo:</strong> {tecnicoSeleccionado.cargo || 'No especificado'}
                  </p>
                  <p style={{ color: '#666', margin: '5px 0' }}>
                    <strong>Departamento:</strong> {tecnicoSeleccionado.departamento || 'No especificado'}
                  </p>
                  <p style={{ color: '#666', margin: '5px 0' }}>
                    <strong>Ubicación:</strong> {tecnicoSeleccionado.ubicacion || 'No especificado'}
                  </p>
                  <p style={{ color: '#666', margin: '5px 0' }}>
                    <strong>Estado:</strong> 
                    <span style={{ 
                      color: tecnicoSeleccionado.activo ? 'green' : 'red',
                      fontWeight: 'bold',
                      marginLeft: '5px'
                    }}>
                      {tecnicoSeleccionado.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                  <p style={{ color: '#666', margin: '5px 0' }}>
                    <strong>2FA:</strong> {tecnicoSeleccionado.require2fa ? 'Sí' : 'No'}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={formulario.apellido}
                    onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formulario.email}
                    disabled={modoEdicion}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: modoEdicion ? '#f5f5f5' : 'white',
                      color: modoEdicion ? '#666' : 'black'
                    }}
                    title={modoEdicion ? "El email no se puede modificar por seguridad" : ""}
                    required={!modoEdicion}
                  />
                  {modoEdicion && (
                    <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      El email no se puede modificar por seguridad
                    </small>
                  )}
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formulario.telefono}
                    onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                {!modoEdicion && (
                  <>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        value={formulario.password}
                        onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Confirmar Contraseña *
                      </label>
                      <input
                        type="password"
                        value={formulario.confirmPassword}
                        onChange={(e) => setFormulario({ ...formulario, confirmPassword: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '20px',
              paddingTop: '15px',
              borderTop: '1px solid #eee'
            }}>
              {modoVisualizacion ? (
                <>
                  <button
                    onClick={() => setMostrarModal(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setModoVisualizacion(false);
                      setModoEdicion(true);
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Editar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setMostrarModal(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarTecnico}
                    disabled={!formulario.nombre || !formulario.apellido || !formulario.email || (!modoEdicion && !formulario.password)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      opacity: (!formulario.nombre || !formulario.apellido || !formulario.email || (!modoEdicion && !formulario.password)) ? 0.5 : 1
                    }}
                  >
                    {modoEdicion ? 'Actualizar' : 'Crear'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechniciansManagement;
