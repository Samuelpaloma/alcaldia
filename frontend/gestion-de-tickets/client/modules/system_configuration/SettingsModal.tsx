import { useState, useEffect } from "react";
import { Settings, X, User, Bell, Palette, Shield, Globe, AlertTriangle, Trash2, Mail, Phone, MapPin, Building, Calendar, Save, Edit3 } from "lucide-react";
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
import { api, UsuarioDTO, ChangePasswordRequest } from "../../../shared/api";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useI18n();
  const { settings, updateSetting } = useSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  
  // Estados para el perfil
  const [profile, setProfile] = useState<UsuarioDTO | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<UsuarioDTO>>({});
  
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

  const handleDeactivateAccount = () => {
    // Lógica para desactivar cuenta
    console.log("Desactivando cuenta...");
    alert("Tu cuenta ha sido desactivada. Puedes reactivarla iniciando sesión nuevamente.");
    onClose();
  };

  const handleDeleteAccount = () => {
    if (!deleteReason.trim()) {
      alert("Por favor, proporciona una razón para eliminar tu cuenta.");
      return;
    }
    
    // Lógica para eliminar cuenta
    console.log("Eliminando cuenta. Razón:", deleteReason);
    alert("Tu cuenta será eliminada permanentemente en 30 días. Recibirás un correo de confirmación.");
    setShowDeleteConfirm(false);
    setDeleteReason("");
    onClose();
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
            <TabsList className="grid w-full grid-cols-5 m-3 mb-0 bg-muted border border-border">
              <TabsTrigger value="profile" className="flex items-center gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:text-foreground hover:bg-muted">
                <User className="w-3 h-3" />
                {t("settings.profile")}
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:text-foreground hover:bg-muted">
                <Bell className="w-3 h-3" />
                {t("settings.notifications")}
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:text-foreground hover:bg-muted">
                <Palette className="w-3 h-3" />
                {t("settings.appearance")}
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:text-foreground hover:bg-muted">
                <Shield className="w-3 h-3" />
                {t("settings.security")}
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:text-foreground hover:bg-muted">
                <Trash2 className="w-3 h-3" />
                {t("settings.account")}
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
                          Editar
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="nombre" className="text-muted-foreground text-xs">Nombre</Label>
                          {editing ? (
                            <Input
                              id="nombre"
                              value={editData.nombre || ''}
                              onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                              className="bg-background border-input text-foreground text-xs h-8"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-xs">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span>{profile.nombre}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="apellido" className="text-muted-foreground text-xs">Apellido</Label>
                          {editing ? (
                            <Input
                              id="apellido"
                              value={editData.apellido || ''}
                              onChange={(e) => setEditData({ ...editData, apellido: e.target.value })}
                              className="bg-background border-input text-foreground text-xs h-8"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-xs">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span>{profile.apellido}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-muted-foreground text-xs">Email</Label>
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-xs">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{profile.email}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">No se puede cambiar</p>
                        </div>
                        <div>
                          <Label htmlFor="telefono" className="text-muted-foreground text-xs">Teléfono</Label>
                          {editing ? (
                            <Input
                              id="telefono"
                              value={editData.telefono || ''}
                              onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                              className="bg-background border-input text-foreground text-xs h-8"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-xs">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{profile.telefono || 'No especificado'}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="ubicacion" className="text-muted-foreground text-xs">Ubicación</Label>
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
                              <span>{profile.ubicacion || 'No especificada'}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="departamento" className="text-muted-foreground text-xs">Departamento</Label>
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
                              <span>{profile.departamento || 'No especificado'}</span>
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
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <Label className="text-muted-foreground text-xs">{t("settings.email_notifications")}</Label>
                        <p className="text-xs text-muted-foreground">{t("settings.email_notifications.desc")}</p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <Label className="text-muted-foreground text-xs">{t("settings.push_notifications")}</Label>
                        <p className="text-xs text-muted-foreground">{t("settings.push_notifications.desc")}</p>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <Label className="text-muted-foreground text-xs">{t("settings.ticket_updates")}</Label>
                        <p className="text-xs text-muted-foreground">{t("settings.ticket_updates.desc")}</p>
                      </div>
                      <Switch
                        checked={settings.ticketUpdates}
                        onCheckedChange={(checked) => updateSetting("ticketUpdates", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <Label className="text-muted-foreground text-xs">{t("settings.system_alerts")}</Label>
                        <p className="text-xs text-muted-foreground">{t("settings.system_alerts.desc")}</p>
                      </div>
                      <Switch
                        checked={settings.systemAlerts}
                        onCheckedChange={(checked) => updateSetting("systemAlerts", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <Label className="text-muted-foreground text-xs">{t("settings.weekly_reports")}</Label>
                        <p className="text-xs text-muted-foreground">{t("settings.weekly_reports.desc")}</p>
                      </div>
                      <Switch
                        checked={settings.weeklyReports}
                        onCheckedChange={(checked) => updateSetting("weeklyReports", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Apariencia */}
              <TabsContent value="appearance" className="space-y-3">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-foreground text-sm">{t("settings.customization")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">{t("settings.language")}</Label>
                      <Select value={settings.language} onValueChange={(value) => updateSetting("language", value)}>
                        <SelectTrigger className="bg-background border-input text-foreground text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="es" className="text-foreground hover:bg-muted">Español</SelectItem>
                          <SelectItem value="en" className="text-foreground hover:bg-muted">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">{t("settings.theme")}</Label>
                      <Select value={settings.theme} onValueChange={(value) => updateSetting("theme", value)}>
                        <SelectTrigger className="bg-background border-input text-foreground text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="light" className="text-foreground hover:bg-muted">{t("settings.light")}</SelectItem>
                          <SelectItem value="dark" className="text-foreground hover:bg-muted">{t("settings.dark")}</SelectItem>
                          <SelectItem value="auto" className="text-foreground hover:bg-muted">{t("settings.auto")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">{t("settings.font_size")}</Label>
                      <Select value={settings.fontSize} onValueChange={(value) => updateSetting("fontSize", value)}>
                        <SelectTrigger className="bg-background border-input text-foreground text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="small" className="text-foreground hover:bg-muted">{t("settings.small")}</SelectItem>
                          <SelectItem value="medium" className="text-foreground hover:bg-muted">{t("settings.medium")}</SelectItem>
                          <SelectItem value="large" className="text-foreground hover:bg-muted">{t("settings.large")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <Label className="text-muted-foreground text-xs">{t("settings.compact_mode")}</Label>
                        <p className="text-xs text-muted-foreground">{t("settings.compact_mode.desc")}</p>
                      </div>
                      <Switch
                        checked={settings.compactMode}
                        onCheckedChange={(checked) => updateSetting("compactMode", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Seguridad */}
              <TabsContent value="security" className="space-y-3">
                {/* Cambio de Contraseña */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-foreground text-sm">Cambio de Contraseña</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="currentPassword" className="text-muted-foreground text-xs">Contraseña Actual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="bg-background border-input text-foreground text-xs h-8"
                        placeholder="Ingresa tu contraseña actual"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword" className="text-muted-foreground text-xs">Nueva Contraseña</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="bg-background border-input text-foreground text-xs h-8"
                        placeholder="Ingresa tu nueva contraseña"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-muted-foreground text-xs">Confirmar Nueva Contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="bg-background border-input text-foreground text-xs h-8"
                        placeholder="Confirma tu nueva contraseña"
                      />
                    </div>
                    <Button 
                      onClick={handleChangePassword} 
                      disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      size="sm" 
                      className="h-7"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Configuración de Seguridad */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-foreground text-sm">{t("settings.security_config")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <Label className="text-muted-foreground text-xs">{t("settings.two_factor_auth")}</Label>
                        <p className="text-xs text-muted-foreground">{t("settings.two_factor_auth.desc")}</p>
                      </div>
                      <Switch
                        checked={settings.twoFactorAuth}
                        onCheckedChange={(checked) => updateSetting("twoFactorAuth", checked)}
                      />
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs">{t("settings.session_timeout")}</Label>
                      <Select value={settings.sessionTimeout} onValueChange={(value) => updateSetting("sessionTimeout", value)}>
                        <SelectTrigger className="bg-background border-input text-foreground text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="15" className="text-foreground hover:bg-muted">15 minutos</SelectItem>
                          <SelectItem value="30" className="text-foreground hover:bg-muted">30 minutos</SelectItem>
                          <SelectItem value="60" className="text-foreground hover:bg-muted">1 hora</SelectItem>
                          <SelectItem value="120" className="text-foreground hover:bg-muted">2 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs">{t("settings.password_expiry")}</Label>
                      <Select value={settings.passwordExpiry} onValueChange={(value) => updateSetting("passwordExpiry", value)}>
                        <SelectTrigger className="bg-background border-input text-foreground text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="30" className="text-foreground hover:bg-muted">30 días</SelectItem>
                          <SelectItem value="60" className="text-foreground hover:bg-muted">60 días</SelectItem>
                          <SelectItem value="90" className="text-foreground hover:bg-muted">90 días</SelectItem>
                          <SelectItem value="180" className="text-foreground hover:bg-muted">180 días</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <Label className="text-muted-foreground text-xs">{t("settings.login_alerts")}</Label>
                        <p className="text-xs text-muted-foreground">{t("settings.login_alerts.desc")}</p>
                      </div>
                      <Switch
                        checked={settings.loginAlerts}
                        onCheckedChange={(checked) => updateSetting("loginAlerts", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cuenta */}
              <TabsContent value="account" className="space-y-3">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-destructive text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          {t("settings.account_management")}
                        </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-yellow-100/20 border border-yellow-200/30 rounded-lg p-3">
                      <h4 className="font-medium text-yellow-600 mb-1 text-xs">{t("settings.deactivate_account")}</h4>
                      <p className="text-xs text-yellow-700 mb-2">
                        {t("settings.deactivate_desc")}
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={handleDeactivateAccount}
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-100/30 text-xs h-7"
                      >
                        {t("settings.deactivate_button")}
                      </Button>
                    </div>

                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                      <h4 className="font-medium text-destructive mb-1 text-xs">{t("settings.delete_account")}</h4>
                      <p className="text-xs text-destructive-foreground/80 mb-2">
                        {t("settings.delete_desc")}
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-destructive hover:bg-destructive/90 text-xs h-7"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        {t("settings.delete_button")}
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <p>• {t("settings.delete_warning")}</p>
                      <p>• {t("settings.delete_warning2")}</p>
                      <p>• {t("settings.delete_warning3")}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer simplificado */}
        <div className="p-3 border-t border-border bg-card flex justify-end">
              <Button variant="outline" onClick={onClose} className="text-xs h-8 bg-background border-input text-foreground hover:bg-muted">
                {t("settings.close")}
              </Button>
        </div>
      </div>

      {/* Modal de confirmación para eliminar cuenta */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-2">
          <Card className="w-full max-w-md bg-card border-border">
            <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-destructive text-sm">
                    <AlertTriangle className="w-5 h-5" />
                    {t("settings.confirm_deletion")}
                  </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-xs">
                {t("settings.confirm_delete_question")}
              </p>
              <div>
                <Label htmlFor="deleteReason" className="text-muted-foreground text-xs">{t("settings.delete_reason")}</Label>
                <textarea
                  id="deleteReason"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full p-2 border border-input rounded-lg focus:ring-2 focus:ring-destructive focus:border-destructive bg-background text-foreground text-xs"
                  rows={3}
                  placeholder={t("settings.delete_reason_placeholder")}
                />
              </div>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2">
                <p className="text-xs text-destructive-foreground/80">
                  <strong>{t("settings.delete_warning_text")}</strong>
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteReason("");
                  }}
                  className="flex-1 text-xs h-7 bg-background border-input text-foreground hover:bg-muted"
                >
                  {t("settings.cancel")}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  className="flex-1 text-xs h-7 bg-destructive hover:bg-destructive/90"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  {t("settings.delete_button")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}