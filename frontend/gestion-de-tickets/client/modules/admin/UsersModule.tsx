import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, UsuarioDTO, CreateTecnicoRequest, CreateAdminRequest } from '../../../shared/api';
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  Calendar,
  Shield,
  Wrench,
  Eye,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import './UsersModule.css';

interface UsersModuleProps {
  userRole: string;
}

const UsersModule: React.FC<UsersModuleProps> = ({ userRole }) => {
  const [tecnicos, setTecnicos] = useState<UsuarioDTO[]>([]);
  const [administradores, setAdministradores] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUserType, setCreateUserType] = useState<'TECNICO' | 'ADMINISTRADOR'>('TECNICO');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    cargo: '',
    departamento: '',
    ubicacion: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tecnicosData, administradoresData] = await Promise.all([
        api.getTechnicians(0, 50),
        userRole === 'superadmin' ? api.getAdmins(0, 50) : Promise.resolve({ content: [] })
      ]);
      
      setTecnicos(tecnicosData.content || []);
      setAdministradores(administradoresData.content || []);
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

  const allUsers = [...tecnicos, ...administradores];

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = 
      user.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telefono?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = userTypeFilter === 'TODOS' || 
      (userTypeFilter === 'TECNICO' && user.tipoUsuario === 'TECNICO') ||
      (userTypeFilter === 'ADMINISTRADOR' && user.tipoUsuario === 'ADMINISTRADOR');
    
    const matchesStatus = statusFilter === 'TODOS' || 
      (statusFilter === 'ACTIVO' && user.activo) ||
      (statusFilter === 'INACTIVO' && !user.activo);
    
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
          telefono: formData.telefono,
          require2fa: false,
          area: formData.departamento || 'Sistemas',
          nivel: 'Junior',
          observaciones: `Creado desde ${formData.ubicacion || 'Bogotá, Colombia'}`
        };
        await api.createTechnician(request);
      } else {
        const request: CreateAdminRequest = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          password: formData.password,
          telefono: formData.telefono,
          cargo: formData.cargo || 'Administrador',
          departamento: formData.departamento || 'Sistemas',
          ubicacion: formData.ubicacion || 'Bogotá, Colombia'
        };
        await api.crearAdministrador(request);
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
      telefono: '',
      cargo: '',
      departamento: '',
      ubicacion: ''
    });
  };

  const getUserIcon = (tipoUsuario: string) => {
    switch (tipoUsuario) {
      case 'TECNICO':
        return <Wrench className="w-5 h-5" />;
      case 'ADMINISTRADOR':
        return <Shield className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const getUserTypeColor = (tipoUsuario: string) => {
    switch (tipoUsuario) {
      case 'TECNICO':
        return 'user-type-technician';
      case 'ADMINISTRADOR':
        return 'user-type-admin';
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
    <div className="users-module">
      <div className="module-header">
        <div className="header-content">
          <h1 className="page-title">Gestión de Usuarios</h1>
          <p className="page-subtitle">Administra técnicos y administradores del sistema</p>
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
          {userRole === 'superadmin' && (
            <Button
              onClick={() => {
                setCreateUserType('ADMINISTRADOR');
                setShowCreateModal(true);
              }}
              variant="outline"
              className="create-btn"
            >
              <Shield className="w-4 h-4 mr-2" />
              Nuevo Admin
            </Button>
          )}
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
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="TODOS">Todos los tipos</option>
                <option value="TECNICO">Técnicos</option>
                <option value="ADMINISTRADOR">Administradores</option>
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
                      <h3 className="user-name">{user.nombreCompleto}</h3>
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
                    {user.telefono && (
                      <div className="detail-item">
                        <Phone className="w-4 h-4" />
                        <span>{user.telefono}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <Calendar className="w-4 h-4" />
                      <span>Creado: {new Date(user.fechaCreacion).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="user-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(user.id!)}
                      className={`action-btn ${user.activo ? 'deactivate' : 'activate'}`}
                    >
                      {user.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      {user.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="action-btn"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="action-btn"
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

      {/* Modal de creación */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                Crear {createUserType === 'TECNICO' ? 'Técnico' : 'Administrador'}
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
                  <label className="form-label">Teléfono</label>
                  <Input
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    placeholder="+57 300 000 0000"
                  />
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
