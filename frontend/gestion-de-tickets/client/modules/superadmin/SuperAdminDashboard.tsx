import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api, UsuarioDTO, ConfiguracionRequestDTO } from '../../../shared/api';
// import { useGlobalColors } from '../../../hooks/use-global-colors';
import './SuperAdminDashboard.css';

interface SuperAdminDashboardProps {
  userRole: string;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ userRole }) => {
  const location = useLocation();
  
  // Estados para colores del sistema
  const [colors, setColors] = useState({
    colorPrimario: '#007bff',
    colorSecundario: '#6c757d',
    colorFondo: '#ffffff'
  });
  
  const [administradores, setAdministradores] = useState<UsuarioDTO[]>([]);
  const [configuraciones, setConfiguraciones] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfiguracionRequestDTO | null>(null);

  // Determinar qué sección mostrar basado en la ruta
  const getCurrentSection = () => {
    if (location.pathname.includes('/administradores')) return 'administradores';
    if (location.pathname.includes('/configuraciones')) return 'configuraciones';
    return 'dashboard';
  };

  const currentSection = getCurrentSection();

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [administradoresData, configuracionesData] = await Promise.all([
        api.getTodosLosAdministradores(),
        api.getConfiguraciones()
      ]);
      
      setAdministradores(administradoresData);
      setConfiguraciones(configuracionesData);
      
      // Cargar colores del sistema
      if (configuracionesData.colores) {
        const systemColors = {
          colorPrimario: configuracionesData.colores.color_primario || '#007bff',
          colorSecundario: configuracionesData.colores.color_secundario || '#6c757d',
          colorFondo: configuracionesData.colores.color_fondo || '#ffffff'
        };
        setColors(systemColors);
        
        // Aplicar colores globalmente
        const root = document.documentElement;
        root.style.setProperty('--system-primary', systemColors.colorPrimario);
        root.style.setProperty('--system-secondary', systemColors.colorSecundario);
        root.style.setProperty('--system-background', systemColors.colorFondo);
        root.style.setProperty('--primary', systemColors.colorPrimario);
        root.style.setProperty('--secondary', systemColors.colorSecundario);
        root.style.setProperty('--background', systemColors.colorFondo);
        
        // Aplicar colores a elementos existentes
        applyColorsToExistingElements(systemColors);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Abrir modal de crear administrador
  const openConfigModal = () => {
    setEditingConfig({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      clave: '',
      valor: '',
      categoria: 'apariencia',
      descripcion: ''
    });
    setShowConfigModal(true);
  };

  // Crear administrador
  const saveConfig = async () => {
    if (!editingConfig) return;
    
    try {
      // Crear el administrador usando el endpoint correcto
      await api.crearAdministrador({
        nombre: editingConfig.nombre || '',
        apellido: editingConfig.apellido || '',
        email: editingConfig.email || '',
        password: editingConfig.password || '',
        telefono: '+57 300 000 0000',
        cargo: 'Administrador',
        departamento: 'Sistemas',
        ubicacion: 'Bogotá, Colombia'
      });
      
      setShowConfigModal(false);
      setEditingConfig(null);
      loadData(); // Recargar datos
    } catch (err) {
      console.error('Error creando administrador:', err);
    }
  };

  // Actualizar colores del sistema
  const handleUpdateColors = async () => {
    try {
      const newColors = {
        colorPrimario: configuraciones.apariencia?.colorPrimario || colors.colorPrimario,
        colorSecundario: configuraciones.apariencia?.colorSecundario || colors.colorSecundario,
        colorFondo: configuraciones.apariencia?.colorFondo || colors.colorFondo
      };
      
      // Actualizar colores en la API
      await api.actualizarColores(newColors);
      
      // Actualizar estado local
      setColors(newColors);
      
      // Aplicar colores globalmente
      const root = document.documentElement;
      root.style.setProperty('--system-primary', newColors.colorPrimario);
      root.style.setProperty('--system-secondary', newColors.colorSecundario);
      root.style.setProperty('--system-background', newColors.colorFondo);
      root.style.setProperty('--primary', newColors.colorPrimario);
      root.style.setProperty('--secondary', newColors.colorSecundario);
      root.style.setProperty('--background', newColors.colorFondo);
      
      // Aplicar colores a elementos existentes
      applyColorsToExistingElements(newColors);
      
      await loadData(); // Recargar datos
    } catch (err) {
      console.error('Error actualizando colores:', err);
    }
  };

  // Función para aplicar colores a elementos existentes
  const applyColorsToExistingElements = (newColors: typeof colors) => {
    // Aplicar colores a botones primarios
    const primaryButtons = document.querySelectorAll('.bg-blue-600, .bg-blue-500, [class*="bg-blue-"], .btn-primary');
    primaryButtons.forEach(button => {
      if (button instanceof HTMLElement) {
        button.style.backgroundColor = newColors.colorPrimario;
        button.style.borderColor = newColors.colorPrimario;
      }
    });

    // Aplicar colores a botones secundarios
    const secondaryButtons = document.querySelectorAll('.bg-gray-600, .bg-gray-500, [class*="bg-gray-"], .btn-secondary');
    secondaryButtons.forEach(button => {
      if (button instanceof HTMLElement) {
        button.style.backgroundColor = newColors.colorSecundario;
        button.style.borderColor = newColors.colorSecundario;
      }
    });

    // Aplicar colores a la sidebar
    const sidebar = document.querySelector('.sidebar, [class*="sidebar"], .bg-blue-900, .bg-gray-900');
    if (sidebar instanceof HTMLElement) {
      sidebar.style.backgroundColor = newColors.colorPrimario;
    }

    console.log('🎨 Colores aplicados a elementos existentes:', newColors);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-2xl text-blue-500 mb-4"></i>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {/* Dashboard principal */}
      {currentSection === 'dashboard' && (
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de SuperAdmin</h1>
            <p className="text-gray-600">Gestiona administradores y configura el sistema</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <i className="fas fa-users-cog text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Administradores</h3>
                  <p className="text-gray-600">{administradores.length} administradores</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <i className="fas fa-palette text-green-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Configuraciones</h3>
                  <p className="text-gray-600">Personalizar sistema</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <i className="fas fa-cog text-purple-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sistema</h3>
                  <p className="text-gray-600">Configuración avanzada</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => window.location.href = '/superadmin/administradores'}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <i className="fas fa-plus text-blue-500 text-xl mb-2"></i>
                <h3 className="font-semibold text-gray-900">Gestionar Administradores</h3>
                <p className="text-gray-600 text-sm">Crear y administrar usuarios administradores</p>
              </button>
              
              <button 
                onClick={() => window.location.href = '/superadmin/configuraciones'}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
              >
                <i className="fas fa-palette text-green-500 text-xl mb-2"></i>
                <h3 className="font-semibold text-gray-900">Configurar Colores</h3>
                <p className="text-gray-600 text-sm">Personalizar la apariencia del sistema</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sección de Administradores */}
      {currentSection === 'administradores' && (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Administradores</h1>
            <p className="text-gray-600">Crea y administra usuarios administradores del sistema</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Lista de Administradores</h2>
              <button 
                onClick={() => openConfigModal()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-plus"></i>
                Crear Administrador
              </button>
            </div>

            {administradores.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay administradores</h3>
                <p className="text-gray-600">Crea el primer administrador del sistema</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {administradores.map((admin, index) => (
                  <div key={admin.idUsuario || admin.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-user-shield text-blue-600"></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{admin.nombre} {admin.apellido}</h4>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                          <i className="fas fa-toggle-on"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sección de Configuraciones */}
      {currentSection === 'configuraciones' && (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuración de Colores del Sistema</h1>
            <p className="text-gray-600">Personaliza la apariencia del sistema</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuraciones de colores */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Colores Principales</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Primario</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={configuraciones.apariencia?.colorPrimario || colors.colorPrimario}
                      onChange={(e) => {
                        const newConfigs = { ...configuraciones };
                        if (!newConfigs.apariencia) newConfigs.apariencia = {};
                        newConfigs.apariencia.colorPrimario = e.target.value;
                        setConfiguraciones(newConfigs);
                      }}
                      className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="font-mono text-sm text-gray-600">
                      {configuraciones.apariencia?.colorPrimario || colors.colorPrimario}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Secundario</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={configuraciones.apariencia?.colorSecundario || colors.colorSecundario}
                      onChange={(e) => {
                        const newConfigs = { ...configuraciones };
                        if (!newConfigs.apariencia) newConfigs.apariencia = {};
                        newConfigs.apariencia.colorSecundario = e.target.value;
                        setConfiguraciones(newConfigs);
                      }}
                      className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="font-mono text-sm text-gray-600">
                      {configuraciones.apariencia?.colorSecundario || colors.colorSecundario}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color de Fondo</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={configuraciones.apariencia?.colorFondo || colors.colorFondo}
                      onChange={(e) => {
                        const newConfigs = { ...configuraciones };
                        if (!newConfigs.apariencia) newConfigs.apariencia = {};
                        newConfigs.apariencia.colorFondo = e.target.value;
                        setConfiguraciones(newConfigs);
                      }}
                      className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="font-mono text-sm text-gray-600">
                      {configuraciones.apariencia?.colorFondo || colors.colorFondo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button 
                  onClick={handleUpdateColors}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-save"></i>
                  Guardar Colores
                </button>
              </div>
            </div>

            {/* Vista previa */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.colorFondo }}>
                  <h4 className="font-semibold" style={{ color: colors.colorPrimario }}>
                    Texto Primario
                  </h4>
                  <p className="text-sm" style={{ color: colors.colorSecundario }}>
                    Texto Secundario
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    className="px-4 py-2 rounded text-white font-medium"
                    style={{ backgroundColor: colors.colorPrimario }}
                  >
                    Botón Primario
                  </button>
                  <button 
                    className="px-4 py-2 rounded text-white font-medium"
                    style={{ backgroundColor: colors.colorSecundario }}
                  >
                    Botón Secundario
                  </button>
                </div>
                
                <div className="text-xs text-gray-500">
                  <p>Primario: {colors.colorPrimario}</p>
                  <p>Secundario: {colors.colorSecundario}</p>
                  <p>Fondo: {colors.colorFondo}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de configuración */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Crear Administrador</h3>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={editingConfig?.nombre || ''}
                    onChange={(e) => setEditingConfig({...editingConfig!, nombre: e.target.value})}
                    placeholder="Nombre del administrador"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                  <input
                    type="text"
                    value={editingConfig?.apellido || ''}
                    onChange={(e) => setEditingConfig({...editingConfig!, apellido: e.target.value})}
                    placeholder="Apellido del administrador"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingConfig?.email || ''}
                    onChange={(e) => setEditingConfig({...editingConfig!, email: e.target.value})}
                    placeholder="email@ejemplo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={editingConfig?.password || ''}
                    onChange={(e) => setEditingConfig({...editingConfig!, password: e.target.value})}
                    placeholder="Contraseña segura"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button 
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={saveConfig}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-save"></i>
                Crear Administrador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;