import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/i18n';
import { useUserProfile } from './use-user-profile';

export interface UserSettings {
  // Perfil
  name: string;
  email: string;
  department: string;
  position: string;
  
  // Notificaciones
  emailNotifications: boolean;
  pushNotifications: boolean;
  ticketUpdates: boolean;
  systemAlerts: boolean;
  weeklyReports: boolean;
  
  // Apariencia
  language: 'es' | 'en';
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  
  // Seguridad
  twoFactorAuth: boolean;
  sessionTimeout: string;
  passwordExpiry: string;
  loginAlerts: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  // Perfil
  name: "Usuario Demo",
  email: "usuario@alcaldia.gov.co",
  department: "Tecnología",
  position: "Desarrollador",
  
  // Notificaciones
  emailNotifications: true,
  pushNotifications: true,
  ticketUpdates: true,
  systemAlerts: true,
  weeklyReports: false,
  
  // Apariencia
  language: 'es',
  theme: 'auto',
  fontSize: 'medium',
  compactMode: false,
  
  // Seguridad
  twoFactorAuth: false,
  sessionTimeout: '30',
  passwordExpiry: '90',
  loginAlerts: true,
};

export const useSettings = () => {
  const { locale, setLocale } = useI18n();
  const { profile, updateProfile } = useUserProfile();
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('userSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return DEFAULT_SETTINGS;
  });

  // Aplicar configuraciones de apariencia
  const applyAppearanceSettings = useCallback((newSettings: UserSettings) => {
    const root = document.documentElement;
    
    // Aplicar tema
    if (newSettings.theme === 'dark') {
      root.classList.add('dark');
    } else if (newSettings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto - seguir preferencia del sistema
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Aplicar tamaño de fuente
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.fontSize = fontSizeMap[newSettings.fontSize];

    // Aplicar modo compacto
    if (newSettings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  }, []);

  // Sincronizar datos del perfil con la base de datos
  const syncProfileWithDatabase = useCallback(async (profileData: {
    name: string;
    email: string;
    department: string;
    position: string;
  }) => {
    try {
      if (profile) {
        console.log('🔄 Sincronizando perfil con base de datos:', {
          departamento: profileData.department,
          cargo: profileData.position,
          ubicacion: profile.ubicacion
        });
        
        await updateProfile({
          nombre: profileData.name.split(' ')[0] || profile.nombre,
          apellido: profileData.name.split(' ').slice(1).join(' ') || profile.apellido,
          ubicacion: profile.ubicacion, // Mantener ubicación actual
          departamento: profileData.department,
          cargo: profileData.position,
        });
        
        console.log('✅ Perfil sincronizado exitosamente');
      }
    } catch (error) {
      console.error('❌ Error sincronizando perfil con base de datos:', error);
    }
  }, [profile, updateProfile]);

  // Actualizar configuración individual
  const updateSetting = useCallback((key: keyof UserSettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // Aplicar cambios de apariencia inmediatamente
      if (['theme', 'fontSize', 'compactMode'].includes(key)) {
        applyAppearanceSettings(newSettings);
      }
      
      // Sincronizar cambios de perfil con la base de datos
      if (['name', 'email', 'department', 'position'].includes(key)) {
        syncProfileWithDatabase({
          name: key === 'name' ? value : newSettings.name,
          email: key === 'email' ? value : newSettings.email,
          department: key === 'department' ? value : newSettings.department,
          position: key === 'position' ? value : newSettings.position,
        });
      }
      
      return newSettings;
    });
  }, [applyAppearanceSettings, syncProfileWithDatabase]);

  // Actualizar múltiples configuraciones
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      
      // Aplicar cambios de apariencia inmediatamente
      applyAppearanceSettings(newSettings);
      
      return newSettings;
    });
  }, [applyAppearanceSettings]);

  // Guardar configuraciones
  const saveSettings = useCallback(() => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      console.log('Configuraciones guardadas:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings]);

  // Resetear configuraciones
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('userSettings');
    applyAppearanceSettings(DEFAULT_SETTINGS);
  }, [applyAppearanceSettings]);

  // Cargar configuraciones al montar
  useEffect(() => {
    applyAppearanceSettings(settings);
  }, [settings, applyAppearanceSettings]);

  // Sincronizar datos del perfil cuando se carguen
  useEffect(() => {
    if (profile) {
      setSettings(prev => ({
        ...prev,
        name: `${profile.nombre} ${profile.apellido}`.trim(),
        email: profile.email,
        department: profile.departamento || prev.department,
        position: profile.cargo || prev.position,
      }));
    }
  }, [profile]);

  // Sincronizar idioma cuando cambie la configuración
  useEffect(() => {
    if (settings.language && settings.language !== locale) {
      console.log("Cambiando idioma de", locale, "a", settings.language);
      setLocale(settings.language);
    }
  }, [settings.language]); // Solo depende de settings.language

  return {
    settings,
    updateSetting,
    updateSettings,
    saveSettings,
    resetSettings,
    applyAppearanceSettings
  };
};

