import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usuarioAPI } from '../config/api';

export interface Theme {
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
}

const lightTheme: Theme = {
  colors: {
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#212529',
    textSecondary: '#6c757d',
    primary: '#007bff',
    border: '#dee2e6',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};

const darkTheme: Theme = {
  colors: {
    background: '#0a0a0a',
    surface: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#cccccc',
    primary: '#007bff',
    border: '#333333',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};

const ThemeContext = createContext<{
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useThemeState = () => {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      // Primero intentar cargar desde AsyncStorage (para compatibilidad)
      const localTheme = await AsyncStorage.getItem('theme');
      if (localTheme) {
        setIsDark(localTheme === 'dark');
        setIsLoading(false);
        return;
      }

      // Si no hay tema local, cargar desde la BD
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setIsDark(false);
        setIsLoading(false);
        return;
      }

      const data = await usuarioAPI.getThemePreferences();
      const themePreference = data.tema || 'light';
      setIsDark(themePreference === 'dark');
      
      // Guardar en AsyncStorage para futuras cargas rápidas
      await AsyncStorage.setItem('theme', themePreference);
    } catch (error) {
      console.error('Error cargando tema:', error);
      setIsDark(false);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      
      // Guardar en AsyncStorage inmediatamente
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
      
      // Guardar en BD
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        await usuarioAPI.updateThemePreferences({
          tema: newTheme ? 'dark' : 'light'
        });
      }
    } catch (error) {
      console.error('Error guardando tema:', error);
      // Revertir cambio si falla
      setIsDark(!isDark);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return {
    theme,
    isDark,
    toggleTheme,
    isLoading,
  };
};

export { ThemeContext, lightTheme, darkTheme };
