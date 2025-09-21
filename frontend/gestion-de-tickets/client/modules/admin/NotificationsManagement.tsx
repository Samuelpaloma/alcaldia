import React, { useState, useEffect } from 'react';
import './NotificationsManagement.css';

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  categoria: 'ticket' | 'usuario' | 'sistema';
  leida: boolean;
  fecha: string;
  icono: string;
}

const NotificationsManagement: React.FC = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo: '',
    categoria: '',
    estado: ''
  });
  const [configuracion, setConfiguracion] = useState({
    emailNotifications: true,
    pushNotifications: true,
    ticketUpdates: true,
    systemAlerts: true,
    weeklyReports: false,
    language: 'es',
    theme: 'auto',
    fontSize: 'medium',
    compactMode: false,
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAlerts: true
  });

  // Datos de ejemplo para notificaciones
  const notificacionesEjemplo: Notificacion[] = [
    {
      id: 1,
      titulo: 'Nuevo ticket creado',
      mensaje: 'Se ha creado un nuevo ticket #1234 con prioridad alta',
      tipo: 'info',
      categoria: 'ticket',
      leida: false,
      fecha: '2024-01-20 10:30:00',
      icono: 'fas fa-ticket-alt'
    },
    {
      id: 2,
      titulo: 'Ticket resuelto',
      mensaje: 'El ticket #1230 ha sido resuelto por el técnico Juan Pérez',
      tipo: 'success',
      categoria: 'ticket',
      leida: true,
      fecha: '2024-01-20 09:15:00',
      icono: 'fas fa-check-circle'
    },
    {
      id: 3,
      titulo: 'Usuario inactivo',
      mensaje: 'El usuario María García no ha iniciado sesión en 30 días',
      tipo: 'warning',
      categoria: 'usuario',
      leida: false,
      fecha: '2024-01-19 16:45:00',
      icono: 'fas fa-user-clock'
    },
    {
      id: 4,
      titulo: 'Error del sistema',
      mensaje: 'Se detectó un error en el servicio de email. Revisar configuración.',
      tipo: 'error',
      categoria: 'sistema',
      leida: true,
      fecha: '2024-01-19 14:20:00',
      icono: 'fas fa-exclamation-triangle'
    },
    {
      id: 5,
      titulo: 'Nuevo técnico registrado',
      mensaje: 'Carlos López se ha registrado como técnico en el sistema',
      tipo: 'info',
      categoria: 'usuario',
      leida: false,
      fecha: '2024-01-19 11:30:00',
      icono: 'fas fa-user-plus'
    },
    {
      id: 6,
      titulo: 'Respaldo completado',
      mensaje: 'El respaldo automático de la base de datos se completó exitosamente',
      tipo: 'success',
      categoria: 'sistema',
      leida: true,
      fecha: '2024-01-19 03:00:00',
      icono: 'fas fa-database'
    }
  ];

  // Cargar notificaciones
  const loadNotificaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carga de datos
      setTimeout(() => {
        setNotificaciones(notificacionesEjemplo);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones');
      setLoading(false);
    }
  };

  // Cargar configuración
  const loadConfiguracion = () => {
    const savedConfig = localStorage.getItem('userSettings');
    if (savedConfig) {
      try {
        setConfiguracion(JSON.parse(savedConfig));
      } catch (err) {
        console.error('Error cargando configuración:', err);
      }
    }
  };

  useEffect(() => {
    loadNotificaciones();
    loadConfiguracion();
  }, []);

  // Filtrar notificaciones
  const notificacionesFiltradas = notificaciones.filter(notif => {
    const cumpleBusqueda = !filtros.busqueda || 
      notif.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      notif.mensaje.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const cumpleTipo = !filtros.tipo || notif.tipo === filtros.tipo;
    const cumpleCategoria = !filtros.categoria || notif.categoria === filtros.categoria;
    const cumpleEstado = !filtros.estado || 
      (filtros.estado === 'leida' && notif.leida) ||
      (filtros.estado === 'no-leida' && !notif.leida);
    
    return cumpleBusqueda && cumpleTipo && cumpleCategoria && cumpleEstado;
  });

  // Marcar como leída
  const marcarComoLeida = (id: number) => {
    setNotificaciones(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, leida: true } : notif
      )
    );
  };

  // Marcar todas como leídas
  const marcarTodasComoLeidas = () => {
    setNotificaciones(prev => 
      prev.map(notif => ({ ...notif, leida: true }))
    );
  };

  // Eliminar notificación
  const eliminarNotificacion = (id: number) => {
    setNotificaciones(prev => prev.filter(notif => notif.id !== id));
  };

  // Guardar configuración
  const guardarConfiguracion = () => {
    localStorage.setItem('userSettings', JSON.stringify(configuracion));
    setError(null);
    // Aquí podrías enviar la configuración al backend
  };

  // Obtener icono según tipo
  const getTipoIcono = (tipo: string) => {
    switch (tipo) {
      case 'info': return 'fas fa-info-circle';
      case 'success': return 'fas fa-check-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'error': return 'fas fa-times-circle';
      default: return 'fas fa-bell';
    }
  };

  // Obtener color según tipo
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'info': return '#3b82f6';
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="notifications-management">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-management">
      <div className="notifications-header">
        <h1 className="notifications-title">Sistema de Notificaciones</h1>
        <p className="notifications-subtitle">Gestiona las notificaciones y configuraciones del sistema</p>
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

      {/* Estadísticas */}
      <div className="notifications-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-bell"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{notificaciones.length}</h3>
            <p className="stat-label">Total Notificaciones</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-bell-slash"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{notificaciones.filter(n => !n.leida).length}</h3>
            <p className="stat-label">No Leídas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-ticket-alt"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{notificaciones.filter(n => n.categoria === 'ticket').length}</h3>
            <p className="stat-label">Tickets</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{notificaciones.filter(n => n.categoria === 'usuario').length}</h3>
            <p className="stat-label">Usuarios</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="notifications-controls">
        <div className="filters-container">
          <div className="filter-group">
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              placeholder="Buscar notificaciones..."
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="filter-select"
            >
              <option value="">Todos los tipos</option>
              <option value="info">Información</option>
              <option value="success">Éxito</option>
              <option value="warning">Advertencia</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="filter-group">
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
              className="filter-select"
            >
              <option value="">Todas las categorías</option>
              <option value="ticket">Tickets</option>
              <option value="usuario">Usuarios</option>
              <option value="sistema">Sistema</option>
            </select>
          </div>
          <div className="filter-group">
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="leida">Leídas</option>
              <option value="no-leida">No leídas</option>
            </select>
          </div>
        </div>
        
        <div className="actions-container">
          <button 
            onClick={marcarTodasComoLeidas}
            className="btn-mark-all"
            disabled={notificaciones.filter(n => !n.leida).length === 0}
          >
            <i className="fas fa-check-double mr-2"></i>
            Marcar todas como leídas
          </button>
          <button 
            onClick={loadNotificaciones}
            className="btn-refresh"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Actualizar
          </button>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="notifications-list">
        {notificacionesFiltradas.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-bell-slash text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay notificaciones</h3>
            <p className="text-gray-600">
              {filtros.busqueda || filtros.tipo || filtros.categoria || filtros.estado
                ? 'No se encontraron notificaciones con los filtros aplicados'
                : 'No hay notificaciones en el sistema'
              }
            </p>
          </div>
        ) : (
          <div className="notifications-grid">
            {notificacionesFiltradas.map(notif => (
              <div key={notif.id} className={`notification-card ${notif.leida ? 'read' : 'unread'}`}>
                <div className="notification-header">
                  <div 
                    className="notification-icon"
                    style={{ color: getTipoColor(notif.tipo) }}
                  >
                    <i className={getTipoIcono(notif.tipo)}></i>
                  </div>
                  <div className="notification-info">
                    <h3 className="notification-title">{notif.titulo}</h3>
                    <p className="notification-date">{notif.fecha}</p>
                    <span className={`notification-category ${notif.categoria}`}>
                      {notif.categoria}
                    </span>
                  </div>
                  <div className="notification-actions">
                    {!notif.leida && (
                      <button
                        onClick={() => marcarComoLeida(notif.id)}
                        className="btn-mark-read"
                        title="Marcar como leída"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                    )}
                    <button
                      onClick={() => eliminarNotificacion(notif.id)}
                      className="btn-delete"
                      title="Eliminar"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                
                <div className="notification-body">
                  <p className="notification-message">{notif.mensaje}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configuración de notificaciones */}
      <div className="notifications-config">
        <h2 className="config-title">Configuración de Notificaciones</h2>
        <div className="config-grid">
          <div className="config-section">
            <h3 className="config-section-title">Preferencias de Notificación</h3>
            <div className="config-options">
              <label className="config-option">
                <input
                  type="checkbox"
                  checked={configuracion.emailNotifications}
                  onChange={(e) => setConfiguracion({ ...configuracion, emailNotifications: e.target.checked })}
                />
                <span className="checkmark"></span>
                Notificaciones por email
              </label>
              <label className="config-option">
                <input
                  type="checkbox"
                  checked={configuracion.pushNotifications}
                  onChange={(e) => setConfiguracion({ ...configuracion, pushNotifications: e.target.checked })}
                />
                <span className="checkmark"></span>
                Notificaciones push
              </label>
              <label className="config-option">
                <input
                  type="checkbox"
                  checked={configuracion.ticketUpdates}
                  onChange={(e) => setConfiguracion({ ...configuracion, ticketUpdates: e.target.checked })}
                />
                <span className="checkmark"></span>
                Actualizaciones de tickets
              </label>
              <label className="config-option">
                <input
                  type="checkbox"
                  checked={configuracion.systemAlerts}
                  onChange={(e) => setConfiguracion({ ...configuracion, systemAlerts: e.target.checked })}
                />
                <span className="checkmark"></span>
                Alertas del sistema
              </label>
              <label className="config-option">
                <input
                  type="checkbox"
                  checked={configuracion.weeklyReports}
                  onChange={(e) => setConfiguracion({ ...configuracion, weeklyReports: e.target.checked })}
                />
                <span className="checkmark"></span>
                Reportes semanales
              </label>
            </div>
          </div>

          <div className="config-section">
            <h3 className="config-section-title">Configuración General</h3>
            <div className="config-options">
              <div className="config-option-group">
                <label className="config-label">Idioma</label>
                <select
                  value={configuracion.language}
                  onChange={(e) => setConfiguracion({ ...configuracion, language: e.target.value })}
                  className="config-select"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="config-option-group">
                <label className="config-label">Tema</label>
                <select
                  value={configuracion.theme}
                  onChange={(e) => setConfiguracion({ ...configuracion, theme: e.target.value })}
                  className="config-select"
                >
                  <option value="auto">Automático</option>
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                </select>
              </div>
              <div className="config-option-group">
                <label className="config-label">Tamaño de fuente</label>
                <select
                  value={configuracion.fontSize}
                  onChange={(e) => setConfiguracion({ ...configuracion, fontSize: e.target.value })}
                  className="config-select"
                >
                  <option value="small">Pequeño</option>
                  <option value="medium">Mediano</option>
                  <option value="large">Grande</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="config-actions">
          <button
            onClick={guardarConfiguracion}
            className="btn-save-config"
          >
            <i className="fas fa-save mr-2"></i>
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsManagement;
