import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api, UsuarioDTO, ConfiguracionRequestDTO } from '../../../shared/api';
import { useGlobalSystem } from '../../components/GlobalSystemProvider';
import './SuperAdminDashboard.css';

interface SuperAdminDashboardProps {
  userRole: string;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ userRole }) => {
  const location = useLocation();
  const { colors, updateSystemColors, loadSystemConfiguration } = useGlobalSystem();
  
  const [administradores, setAdministradores] = useState<UsuarioDTO[]>([]);
  const [configuraciones, setConfiguraciones] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfiguracionRequestDTO | null>(null);
  const [temaActual, setTemaActual] = useState<string>('claro');

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
      
      // Los colores del sistema se cargan automáticamente por el GlobalSystemProvider
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
    loadTemaActual();
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
        colorFondo: configuraciones.apariencia?.colorFondo || colors.colorFondo,
        colorTexto: configuraciones.apariencia?.colorTexto || colors.colorTexto || '#000000',
        colorContenedor: configuraciones.apariencia?.colorContenedor || colors.colorContenedor || '#ffffff',
        colorContenedorSecundario: configuraciones.apariencia?.colorContenedorSecundario || colors.colorContenedorSecundario || '#f8f9fa'
      };
      
      // Usar el sistema global para actualizar colores
      const result = await updateSystemColors(newColors);
      
      if (result.success) {
        console.log('✅ Colores actualizados exitosamente');
        // Recargar datos para reflejar cambios
        await loadData();
      } else {
        console.error('❌ Error actualizando colores:', result.error);
      }
    } catch (err) {
      console.error('❌ Error actualizando colores:', err);
    }
  };

  // Cargar tema actual del sistema
  const loadTemaActual = async () => {
    try {
      const response = await api.getTemaActual();
      if (response.success && response.data) {
        setTemaActual(response.data.tema || 'claro');
      }
    } catch (err) {
      console.error('Error cargando tema actual:', err);
      setTemaActual('claro'); // Tema por defecto
    }
  };

  // Actualizar tema del sistema
  const handleUpdateTema = async (tema: string) => {
    try {
      console.log('🎨 Actualizando tema a:', tema);
      
      const result = await api.actualizarTema(tema);
      
      if (result.success) {
        console.log('✅ Tema actualizado exitosamente');
        setTemaActual(tema);
        
        // Recargar colores del sistema para aplicar el nuevo tema
        await loadSystemConfiguration();
        
        // Mostrar mensaje de éxito
        alert(`Tema ${tema === 'claro' ? 'Claro' : 'Oscuro'} aplicado exitosamente`);
      } else {
        console.error('❌ Error actualizando tema:', result.error);
        alert('Error al actualizar el tema');
      }
    } catch (err) {
      console.error('❌ Error actualizando tema:', err);
      alert('Error al actualizar el tema');
    }
  };

  // Los colores se aplican automáticamente por el sistema global

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuración de Tema del Sistema</h1>
            <p className="text-gray-600">Selecciona el tema de apariencia para todo el sistema</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Selección de tema */}
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Seleccionar Tema</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tema Claro */}
                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors cursor-pointer"
                     onClick={() => handleUpdateTema('claro')}>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white border-2 border-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <i className="fas fa-sun text-2xl text-yellow-500"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tema Claro</h3>
                    <p className="text-sm text-gray-600 mb-4">Interfaz limpia y moderna con fondo blanco</p>
                    
                    {/* Vista previa del tema claro */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-left">
                      <div className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium mb-2 inline-block">
                        Botón
                      </div>
                      <div className="bg-gray-100 rounded p-2 mb-2">
                        <div className="h-2 bg-gray-300 rounded mb-1"></div>
                        <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                      </div>
                      <div className="text-xs text-gray-600">
                        Contenido de ejemplo
                      </div>
                    </div>
                    
                    <button className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Aplicar Tema Claro
                    </button>
                  </div>
                </div>

                {/* Tema Oscuro */}
                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors cursor-pointer"
                     onClick={() => handleUpdateTema('oscuro')}>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-800 border-2 border-gray-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <i className="fas fa-moon text-2xl text-blue-400"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tema Oscuro</h3>
                    <p className="text-sm text-gray-600 mb-4">Interfaz elegante con fondo oscuro para reducir fatiga visual</p>
                    
                    {/* Vista previa del tema oscuro */}
                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-left">
                      <div className="bg-blue-400 text-gray-900 px-3 py-1 rounded text-xs font-medium mb-2 inline-block">
                        Botón
                      </div>
                      <div className="bg-gray-700 rounded p-2 mb-2">
                        <div className="h-2 bg-gray-500 rounded mb-1"></div>
                        <div className="h-2 bg-gray-500 rounded w-3/4"></div>
                      </div>
                      <div className="text-xs text-gray-300">
                        Contenido de ejemplo
                      </div>
                    </div>
                    
                    <button className="mt-4 w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
                      Aplicar Tema Oscuro
                    </button>
                  </div>
                </div>
              </div>

              {/* Estado actual */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Estado Actual</h4>
                <p className="text-sm text-gray-600">
                  Tema actual: <span className="font-medium">{temaActual || 'claro'}</span>
                </p>
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