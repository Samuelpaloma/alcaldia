import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { api, UsuarioDTO, ChangePasswordRequest } from '../../../shared/api';
import { User, Mail, Phone, MapPin, Building, Shield, Calendar, Edit3, Save, X, Lock } from 'lucide-react';

interface UserProfileProps {
  userRole: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userRole }) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UsuarioDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // Estados para edición
  const [editData, setEditData] = useState<Partial<UsuarioDTO>>({});
  
  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await api.getMyProfile();
      setProfile(profileData);
      setEditData(profileData);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil del usuario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditData(profile || {});
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData(profile || {});
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedProfile = await api.updateMyProfile(editData);
      setProfile(updatedProfile);
      setEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Los cambios se guardaron correctamente",
      });
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const request: ChangePasswordRequest = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      };
      
      await api.changePassword(request);
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      
      toast({
        title: "Contraseña actualizada",
        description: "La contraseña se cambió correctamente",
      });
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar la contraseña",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'ADMINISTRADOR': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TECNICO': return 'bg-green-100 text-green-800 border-green-200';
      case 'CLIENTE': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return <Shield className="h-4 w-4" />;
      case 'ADMINISTRADOR': return <Building className="h-4 w-4" />;
      case 'TECNICO': return <User className="h-4 w-4" />;
      case 'CLIENTE': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No se pudo cargar el perfil del usuario</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal y configuración</p>
        </div>
        {!editing && (
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Editar Perfil
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nombre y Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  {editing ? (
                    <Input
                      id="nombre"
                      value={editData.nombre || ''}
                      onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                      placeholder="Nombre"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.nombre}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  {editing ? (
                    <Input
                      id="apellido"
                      value={editData.apellido || ''}
                      onChange={(e) => setEditData({ ...editData, apellido: e.target.value })}
                      placeholder="Apellido"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.apellido}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                {editing ? (
                  <Input
                    id="telefono"
                    value={editData.telefono || ''}
                    onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                    placeholder="Teléfono"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.telefono || 'No especificado'}</span>
                  </div>
                )}
              </div>

              {/* Ubicación */}
              <div className="space-y-2">
                <Label htmlFor="ubicacion">Ubicación</Label>
                {editing ? (
                  <Input
                    id="ubicacion"
                    value={editData.ubicacion || ''}
                    onChange={(e) => setEditData({ ...editData, ubicacion: e.target.value })}
                    placeholder="Ubicación"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.ubicacion || 'No especificada'}</span>
                  </div>
                )}
              </div>

              {/* Departamento y Cargo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  {editing ? (
                    <Input
                      id="departamento"
                      value={editData.departamento || ''}
                      onChange={(e) => setEditData({ ...editData, departamento: e.target.value })}
                      placeholder="Departamento"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.departamento || 'No especificado'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  {editing ? (
                    <Input
                      id="cargo"
                      value={editData.cargo || ''}
                      onChange={(e) => setEditData({ ...editData, cargo: e.target.value })}
                      placeholder="Cargo"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.cargo || 'No especificado'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              {editing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Información de Cuenta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Información de Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rol */}
              <div>
                <Label className="text-sm font-medium">Rol</Label>
                <div className="mt-1">
                  <Badge className={`${getRoleColor(profile.tipoUsuario)} flex items-center gap-1 w-fit`}>
                    {getRoleIcon(profile.tipoUsuario)}
                    {profile.tipoUsuario}
                  </Badge>
                </div>
              </div>

              {/* Estado */}
              <div>
                <Label className="text-sm font-medium">Estado</Label>
                <div className="mt-1">
                  <Badge variant={profile.activo ? "default" : "secondary"}>
                    {profile.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>

              {/* Fecha de Creación */}
              <div>
                <Label className="text-sm font-medium">Miembro desde</Label>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(profile.fechaCreacion).toLocaleDateString()}
                </div>
              </div>

              {/* 2FA */}
              <div>
                <Label className="text-sm font-medium">Autenticación de Dos Factores</Label>
                <div className="mt-1">
                  <Badge variant={profile.require2fa ? "default" : "secondary"}>
                    {profile.require2fa ? 'Habilitado' : 'Deshabilitado'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cambio de Contraseña */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showPasswordForm ? (
                <Button 
                  onClick={() => setShowPasswordForm(true)} 
                  variant="outline" 
                  className="w-full"
                >
                  Cambiar Contraseña
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña Actual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Contraseña actual"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Nueva contraseña"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirmar contraseña"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleChangePassword} 
                      disabled={saving}
                      size="sm"
                      className="flex-1"
                    >
                      {saving ? 'Cambiando...' : 'Cambiar'}
                    </Button>
                    <Button 
                      onClick={() => setShowPasswordForm(false)} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
