import { useState, useEffect } from "react";
import { Settings, X, User, Globe, Mail, MapPin, Building, Calendar, Save, Edit3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/i18n";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { api, UsuarioDTO, ChangePasswordRequest, PreferenciasNotificacionDTO } from "../../../shared/api";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useI18n();
  const { settings, updateSetting } = useSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Estados para el perfil
  const [profile, setProfile] = useState<UsuarioDTO | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<UsuarioDTO>>({});
  
  // Estados para notificaciones
  const [notificationPrefs, setNotificationPrefs] = useState<PreferenciasNotificacionDTO>({
    emailActivo: true,
    pushActivo: true
  });
  
  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  

  // Cargar perfil cuando se abre el modal
  useEffect(() => {
    if (isOpen && activeTab === "profile") {
      loadProfile();
    }
  }, [isOpen, activeTab]);

  const loadProfile = async () => {
    try {
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
    }
  };

  const loadNotificationPreferences = async () => {
    try {
      const prefs = await api.getNotificationPreferences();
      setNotificationPrefs(prefs);
    } catch (error) {
      console.error('Error cargando preferencias de notificaciones:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las preferencias de notificaciones",
        variant: "destructive",
      });
    }
  };

  const saveNotificationPreferences = async () => {
    try {
      setSaving(true);
      const updated = await api.updateNotificationPreferences(notificationPrefs);
      setNotificationPrefs(updated);
      toast({
        title: "Preferencias guardadas",
        description: "Las preferencias de notificaciones se actualizaron correctamente",
      });
    } catch (error) {
      console.error('Error guardando preferencias:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las preferencias",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
      // Solo enviar campos editables: ubicación y departamento
      const dataToUpdate = {
        ubicacion: editData.ubicacion,
        departamento: editData.departamento
      };
      const updatedProfile = await api.updateMyProfile(dataToUpdate);
      setProfile(updatedProfile as UsuarioDTO);
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
    // Validación: contraseñas coinciden
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    // Validación: longitud mínima
    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    // Validación: requisitos de seguridad
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
    const hasNumber = /\d/.test(passwordData.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos una mayúscula, una minúscula y un número",
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
      
      toast({
        title: "Contraseña actualizada",
        description: "La contraseña se cambió correctamente",
      });
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      const errorMessage = error instanceof Error ? error.message : "No se pudo cambiar la contraseña";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-3xl h-[85vh] flex flex-col border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{t("settings.title")}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 hover:bg-muted text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 m-3 mb-0 bg-muted border border-border">
              <TabsTrigger value="profile" className="flex items-center gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:text-foreground hover:bg-muted">
                <User className="w-3 h-3" />
                {t("settings.profile")}
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:text-foreground hover:bg-muted">
                <Globe className="w-3 h-3" />
                {t("settings.language")}
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:text-foreground hover:bg-muted">
                <Shield className="w-3 h-3" />
                {t("settings.security")}
              </TabsTrigger>
            </TabsList>

            <div className="p-3">
              {/* Perfil */}
              <TabsContent value="profile" className="space-y-3">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground text-sm">{t("settings.personal_info")}</CardTitle>
                      {!editing && (
                        <Button onClick={handleEdit} size="sm" variant="outline" className="h-7">
                          <Edit3 className="h-3 w-3 mr-1" />
{t("settings.edit")}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="nombre" className="text-muted-foreground text-xs">{t("settings.full_name")}</Label>
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-xs">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>{profile.nombre}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{t("settings.cannot_change")}</p>
                        </div>
                        <div>
                          <Label htmlFor="apellido" className="text-muted-foreground text-xs">{t("settings.last_name")}</Label>
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-xs">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>{profile.apellido}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{t("settings.cannot_change")}</p>
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-muted-foreground text-xs">{t("settings.email")}</Label>
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-xs">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{profile.email}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{t("settings.cannot_change")}</p>
                        </div>
                        <div>
                          <Label htmlFor="ubicacion" className="text-muted-foreground text-xs">{t("settings.location")}</Label>
                          {editing ? (
                            <Input
                              id="ubicacion"
                              value={editData.ubicacion || ''}
                              onChange={(e) => setEditData({ ...editData, ubicacion: e.target.value })}
                              className="bg-background border-input text-foreground text-xs h-8"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-xs">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span>{profile.ubicacion || t("settings.not_specified")}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="departamento" className="text-muted-foreground text-xs">{t("settings.department")}</Label>
                          {editing ? (
                            <Input
                              id="departamento"
                              value={editData.departamento || ''}
                              onChange={(e) => setEditData({ ...editData, departamento: e.target.value })}
                              className="bg-background border-input text-foreground text-xs h-8"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-xs">
                              <Building className="h-3 w-3 text-muted-foreground" />
                              <span>{profile.departamento || t("settings.not_specified")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-xs text-muted-foreground">Cargando perfil...</p>
                      </div>
                    )}
                    
                    {editing && (
                      <div className="flex gap-2 pt-2">
                        <Button onClick={handleSave} disabled={saving} size="sm" className="h-7">
                          <Save className="h-3 w-3 mr-1" />
                          {saving ? 'Guardando...' : 'Guardar'}
                        </Button>
                        <Button onClick={handleCancel} variant="outline" size="sm" className="h-7">
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notificaciones */}
              <TabsContent value="notifications" className="space-y-3">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-foreground text-sm">{t("settings.notification_preferences")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label className="text-foreground text-sm font-medium">{t("settings.email_notifications")}</Label>
                        <p className="text-xs text-muted-foreground mt-1">{t("settings.email_notifications_desc")}</p>
                      </div>
                      <Switch
                        checked={notificationPrefs.emailActivo}
                        onCheckedChange={(checked) => setNotificationPrefs({...notificationPrefs, emailActivo: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label className="text-foreground text-sm font-medium">{t("settings.push_notifications")}</Label>
                        <p className="text-xs text-muted-foreground mt-1">{t("settings.push_notifications_desc")}</p>
                      </div>
                      <Switch
                        checked={notificationPrefs.pushActivo}
                        onCheckedChange={(checked) => setNotificationPrefs({...notificationPrefs, pushActivo: checked})}
                      />
                    </div>
                    <div className="pt-2 border-t border-border">
                      <Button 
                        onClick={saveNotificationPreferences} 
                        disabled={saving}
                        size="sm" 
                        className="h-7"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        {saving ? t("settings.saving") : t("settings.save_preferences")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Idioma */}
              <TabsContent value="appearance" className="space-y-3">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-foreground text-sm">{t("settings.personalization")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">{t("settings.language")}</Label>
                      <Select value={settings.language} onValueChange={(value) => updateSetting("language", value)}>
                        <SelectTrigger className="bg-background border-input text-foreground text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="es" className="text-foreground hover:bg-muted">{t("settings.language.spanish")}</SelectItem>
                          <SelectItem value="en" className="text-foreground hover:bg-muted">{t("settings.language.english")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Seguridad */}
              <TabsContent value="security" className="space-y-3">
                {/* Cambio de Contraseña */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-foreground text-sm">{t("settings.password_change")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="currentPassword" className="text-muted-foreground text-xs">{t("settings.current_password")} *</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="bg-background border-input text-foreground text-xs h-8"
                        placeholder={t("settings.current_password_placeholder")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword" className="text-muted-foreground text-xs">{t("settings.new_password")} *</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="bg-background border-input text-foreground text-xs h-8"
                        placeholder={t("settings.new_password_placeholder")}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("settings.password_requirements")}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-muted-foreground text-xs">{t("settings.confirm_password")} *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="bg-background border-input text-foreground text-xs h-8"
                        placeholder={t("settings.confirm_password_placeholder")}
                      />
                    </div>
                    <Button 
                      onClick={handleChangePassword} 
                      disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      size="sm" 
                      className="h-7"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {saving ? t("settings.changing_password") : t("settings.change_password")}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer simplificado */}
        <div className="p-3 border-t border-border bg-card flex justify-end">
          <Button variant="outline" onClick={onClose} className="text-xs h-8 bg-background border-input text-foreground hover:bg-muted">
            {t("common.close")}
          </Button>
        </div>
      </div>
    </div>
  );
}