import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, UsuarioDTO, CreateTecnicoRequest, CreateFuncionarioRequest } from '../../../shared/api';
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  UserCheck, 
  UserX,
  Mail,
  Calendar,
  Shield,
  Wrench,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import './UsersModule.css';

interface UsersModuleProps {
  userRole: string;
}

const UsersModule: React.FC<UsersModuleProps> = ({ userRole }) => {
  // Estado para ver/editar usuario
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [viewEditMode, setViewEditMode] = useState<'view' | 'edit'>('view');
  const [selectedUser, setSelectedUser] = useState<UsuarioDTO | null>(null);

  const [tecnicos, setTecnicos] = useState<UsuarioDTO[]>([]);
  const [funcionarios, setFuncionarios] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUserType, setCreateUserType] = useState<'TECNICO' | 'FUNCIONARIO'>('TECNICO');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    cargo: '',
    departamento: '',
    ubicacion: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Cargando datos...', { userRole });
      
      const [tecnicosData, funcionariosData] = await Promise.all([
        api.getTechnicians(0, 50),
        // Admin y SuperAdmin pueden ver funcionarios
        api.getFuncionarios(0, 50)
      ]);
      
      console.log('📊 Datos cargados:', {
        tecnicos: tecnicosData.content?.length || 0,
        funcionarios: funcionariosData.content?.length || 0,
        userRole
      });
      
      setTecnicos(tecnicosData.content || []);
      setFuncionarios(funcionariosData.content || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userRole]);

  const allUsers = [...tecnicos, ...funcionarios];
  
  // Debug: Mostrar total de usuarios y sus tipos
  console.log('👥 Total usuarios:', {
    tecnicos: tecnicos.length,
    funcionarios: funcionarios.length,
    total: allUsers.length,
    userTypeFilter,
    statusFilter,
    tiposUnicos: [...new Set(allUsers.map(u => u.tipoUsuario))]
  });

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = 
      (user.nombreCompleto || `${user.nombre} ${user.apellido}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Normalizar el tipo de usuario para comparación (convertir a mayúsculas y sin acentos)
    const normalizedUserType = (user.tipoUsuario || '')
      .toUpperCase()
      .normalize('NFD') // Descomponer caracteres con acento
      .replace(/[\u0300-\u036f]/g, ''); // Eliminar diacríticos (acentos)
    
    const matchesType = userTypeFilter === 'TODOS' || 
      (userTypeFilter === 'TECNICO' && normalizedUserType === 'TECNICO') ||
      (userTypeFilter === 'FUNCIONARIO' && normalizedUserType === 'FUNCIONARIO');
    
    const matchesStatus = statusFilter === 'TODOS' || 
      (statusFilter === 'ACTIVO' && user.activo === true) ||
      (statusFilter === 'INACTIVO' && user.activo === false);
    
    console.log('🔍 Filtrando usuario:', {
      nombre: user.nombreCompleto || `${user.nombre} ${user.apellido}`,
      tipoOriginal: user.tipoUsuario,
      tipoNormalizado: normalizedUserType,
      filtroActual: userTypeFilter,
      matchesType,
      matchesStatus,
      matchesSearch
    });
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const validatePassword = (password: string): boolean => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return minLength && hasUpperCase && hasLowerCase && hasNumber;
  };

  const handleCreateUser = async () => {
    try {
      // Validar contraseña
      if (!validatePassword(formData.password)) {
        setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
        return;
      }

      if (createUserType === 'TECNICO') {
        const request: CreateTecnicoRequest = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          password: formData.password,
          require2fa: false,
          area: formData.departamento || 'Sistemas',
          nivel: 'Junior',
          observaciones: `Creado desde ${formData.ubicacion || 'Bogotá, Colombia'}`
        };
        await api.createTechnician(request);
      } else {
        const request: CreateFuncionarioRequest = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          password: formData.password,
          cargo: formData.cargo || 'Funcionario',
          departamento: formData.departamento || 'General',
          ubicacion: formData.ubicacion || 'Oficina Principal',
          require2fa: false
        };
        await api.createFuncionario(request);
      }
      
      await loadData();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Error creando usuario:', err);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await api.toggleUserStatus(userId);
      await loadData();
    } catch (err) {
      console.error('Error cambiando estado:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      cargo: '',
      departamento: '',
      ubicacion: ''
    });
  };

  const getUserIcon = (tipoUsuario: string) => {
    switch (tipoUsuario) {
      case 'TECNICO':
      case 'Técnico':
        return <Wrench className="w-5 h-5" />;
      case 'ADMINISTRADOR':
      case 'Administrador':
        return <Shield className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const getUserTypeColor = (tipoUsuario: string) => {
    switch (tipoUsuario) {
      case 'TECNICO':
      case 'Técnico':
        return 'user-type-technician';
      case 'ADMINISTRADOR':
      case 'Administrador':
        return 'user-type-admin';
      case 'FUNCIONARIO':
      case 'Funcionario':
        return 'user-type-default';
      default:
        return 'user-type-default';
    }
  };

  if (loading) {
    return (
      <div className="users-module">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="users-module" style={{ paddingTop: '0.5rem' }}>
      <div className="module-header">
        <div className="header-content">
          <h1 className="page-title">Gestión de Usuarios</h1>
          <p className="page-subtitle">Administra técnicos y usuarios del sistema</p>
        </div>
        <div className="header-actions">
          <Button
            onClick={() => {
              setCreateUserType('TECNICO');
              setShowCreateModal(true);
            }}
            className="create-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Técnico
          </Button>
          <Button
            onClick={() => {
              setCreateUserType('FUNCIONARIO');
              setShowCreateModal(true);
            }}
            variant="outline"
            className="create-btn"
          >
            <Users className="w-4 h-4 mr-2" />
            Nuevo Funcionario
          </Button>
        </div>
      </div>

      {error && (
        <Card className="error-card">
          <CardContent className="p-4">
            <div className="flex items-center text-red-600">
              <UserX className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros y búsqueda */}
      <Card className="filters-card">
        <CardContent className="p-6">
          <div className="filters-grid">
            <div className="search-container">
              <Search className="search-icon" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <Filter className="w-4 h-4 mr-2" />
              <select
                value={userTypeFilter}
                onChange={(e) => {
                  console.log('🔍 Filtro cambiado a:', e.target.value);
                  setUserTypeFilter(e.target.value);
                }}
                className="filter-select"
              >
                <option value="TODOS">Todos los tipos ({allUsers.length})</option>
                <option value="TECNICO">Técnicos ({tecnicos.length})</option>
                <option value="FUNCIONARIO">Funcionarios ({funcionarios.length})</option>
              </select>
            </div>
            
            <div className="filter-group">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="ACTIVO">Activos</option>
                <option value="INACTIVO">Inactivos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuarios ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="users-grid">
              {filteredUsers.map(user => (
                <div key={user.id} className="user-card">
                  <div className="user-header">
                    <div className="user-avatar">
                      {getUserIcon(user.tipoUsuario)}
                    </div>
                    <div className="user-info">
                      <h3 className="user-name">{user.nombreCompleto || `${user.nombre} ${user.apellido}`}</h3>
                      <div className={`user-type ${getUserTypeColor(user.tipoUsuario)}`}>
                        {user.tipoUsuario}
                      </div>
                    </div>
                    <div className={`status-indicator ${user.activo ? 'active' : 'inactive'}`}>
                      {user.activo ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                    </div>
                  </div>
                  
                  <div className="user-details">
                    <div className="detail-item">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar className="w-4 h-4" />
                      <span>Creado: {new Date(user.fechaCreacion).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="user-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(user.id)}
                      className={`action-btn ${user.activo ? 'deactivate' : 'activate'}`}
                    >
                      {user.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      {user.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="action-btn"
                      onClick={() => {
                        console.log('Seleccionando usuario para editar:', user);
                        console.log('ID del usuario:', user.idUsuario);
                        setSelectedUser(user);
                        setViewEditMode('edit');
                        setShowViewEditModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de ver/editar usuario */}
      {showViewEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {viewEditMode === 'view' ? 'Ver Usuario' : 'Editar Usuario'}
              </h3>
              <button
                onClick={() => setShowViewEditModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {viewEditMode === 'view' ? (
                <div>
                  <p><strong>Nombre:</strong> {selectedUser.nombreCompleto || `${selectedUser.nombre} ${selectedUser.apellido}`}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Tipo:</strong> {selectedUser.tipoUsuario}</p>
                  <p><strong>Estado:</strong> {selectedUser.activo ? 'Activo' : 'Inactivo'}</p>
                  <p><strong>Creado:</strong> {selectedUser.fechaCreacion ? new Date(selectedUser.fechaCreacion).toLocaleDateString() : 'N/A'}</p>
                  {/* Puedes agregar más campos si lo necesitas */}
                </div>
              ) : (
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nombre *</label>
                    <Input
                      value={selectedUser.nombre}
                      onChange={e => setSelectedUser({...selectedUser, nombre: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Apellido *</label>
                    <Input
                      value={selectedUser.apellido}
                      onChange={e => setSelectedUser({...selectedUser, apellido: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <Input
                      value={selectedUser.email}
                      disabled
                      style={{ backgroundColor: '#f5f5f5', color: '#666' }}
                      title="El email no se puede modificar por seguridad"
                    />
                    <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      El email no se puede modificar por seguridad
                    </small>
                  </div>
                  {/* Puedes agregar más campos editables si lo necesitas */}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <Button
                variant="outline"
                onClick={() => setShowViewEditModal(false)}
              >
                Cerrar
              </Button>
              {viewEditMode === 'edit' && (
                <Button
                  onClick={async () => {
                    // Aquí puedes llamar a la API para actualizar el usuario
                    try {
                      console.log('Actualizando usuario:', selectedUser);
                      console.log('ID del usuario:', selectedUser.idUsuario);
                      
                      if (!selectedUser.id) {
                        setError('Error: ID del usuario no válido');
                        return;
                      }
                      
                      await api.updateUser(selectedUser.id, {
                        nombre: selectedUser.nombre,
                        apellido: selectedUser.apellido,
                        ubicacion: selectedUser.ubicacion,
                        departamento: selectedUser.departamento,
                        cargo: selectedUser.cargo
                      });
                      setShowViewEditModal(false);
                      await loadData();
                    } catch (err) {
                      console.error('Error actualizando usuario:', err);
                      setError('Error actualizando usuario: ' + (err instanceof Error ? err.message : 'Error desconocido'));
                    }
                  }}
                  className="btn-primary"
                >
                  Guardar Cambios
                </Button>
              )}
              {viewEditMode === 'view' && (
                <Button
                  onClick={() => setViewEditMode('edit')}
                  className="btn-primary"
                >
                  Editar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal de creación */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                Crear {createUserType === 'TECNICO' ? 'Técnico' : 'Funcionario'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Nombre del usuario"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Apellido *</label>
                  <Input
                    value={formData.apellido}
                    onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                    placeholder="Apellido del usuario"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@ejemplo.com"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Contraseña *</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número
                  </p>
                </div>
                
                
                <div className="form-group">
                  <label className="form-label">Cargo</label>
                  <Input
                    value={formData.cargo}
                    onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                    placeholder={createUserType === 'TECNICO' ? 'Técnico' : 'Administrador'}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Departamento</label>
                  <Input
                    value={formData.departamento}
                    onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                    placeholder="Sistemas"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ubicación</label>
                  <Input
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                    placeholder="Bogotá, Colombia"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={!formData.nombre || !formData.apellido || !formData.email || !formData.password}
                className="btn-primary"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Crear Usuario
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersModule;
