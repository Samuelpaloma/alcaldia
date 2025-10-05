import { useState, useEffect, useCallback } from 'react';
import { api } from '../../shared/api';

export interface SystemColors {
  colorPrimario: string;
  colorSecundario: string;
  colorFondo: string;
}

const DEFAULT_COLORS: SystemColors = {
  colorPrimario: '#007bff',
  colorSecundario: '#6c757d',
  colorFondo: '#ffffff'
};

// Variable global para almacenar los colores
let globalColors: SystemColors = DEFAULT_COLORS;
let listeners: Array<(colors: SystemColors) => void> = [];

export const useGlobalColors = () => {
  const [colors, setColors] = useState<SystemColors>(globalColors);

  // Función para notificar a todos los listeners
  const notifyListeners = useCallback((newColors: SystemColors) => {
    listeners.forEach(listener => listener(newColors));
  }, []);

  // Función para aplicar colores al CSS
  const applyColors = useCallback((newColors: SystemColors) => {
    const root = document.documentElement;
    
    // Aplicar colores como variables CSS personalizadas
    root.style.setProperty('--system-primary', newColors.colorPrimario);
    root.style.setProperty('--system-secondary', newColors.colorSecundario);
    root.style.setProperty('--system-background', newColors.colorFondo);
    
    // También aplicar a las variables de Tailwind
    root.style.setProperty('--primary', newColors.colorPrimario);
    root.style.setProperty('--secondary', newColors.colorSecundario);
    root.style.setProperty('--background', newColors.colorFondo);
    
    console.log('🎨 Colores globales aplicados:', newColors);
  }, []);

  // Cargar colores desde la API
  const loadColors = useCallback(async () => {
    try {
      console.log('🔄 Cargando colores globales del sistema...');
      const configuraciones = await api.getConfiguraciones();
      
      if (configuraciones.colores) {
        const systemColors: SystemColors = {
          colorPrimario: configuraciones.colores.color_primario || DEFAULT_COLORS.colorPrimario,
          colorSecundario: configuraciones.colores.color_secundario || DEFAULT_COLORS.colorSecundario,
          colorFondo: configuraciones.colores.color_fondo || DEFAULT_COLORS.colorFondo
        };
        
        console.log('✅ Colores globales cargados desde API:', systemColors);
        globalColors = systemColors;
        setColors(systemColors);
        applyColors(systemColors);
        notifyListeners(systemColors);
      } else {
        console.log('⚠️ No se encontraron colores en la configuración, usando valores por defecto');
        globalColors = DEFAULT_COLORS;
        setColors(DEFAULT_COLORS);
        applyColors(DEFAULT_COLORS);
        notifyListeners(DEFAULT_COLORS);
      }
    } catch (err) {
      console.error('❌ Error cargando colores globales del sistema:', err);
      globalColors = DEFAULT_COLORS;
      setColors(DEFAULT_COLORS);
      applyColors(DEFAULT_COLORS);
      notifyListeners(DEFAULT_COLORS);
    }
  }, [applyColors, notifyListeners]);

  // Actualizar colores globalmente
  const updateGlobalColors = useCallback(async (newColors: SystemColors) => {
    try {
      console.log('🔄 Actualizando colores globales del sistema:', newColors);
      await api.actualizarColores(newColors);
      
      globalColors = newColors;
      setColors(newColors);
      applyColors(newColors);
      notifyListeners(newColors);
      
      console.log('✅ Colores globales actualizados exitosamente');
    } catch (err) {
      console.error('❌ Error actualizando colores globales:', err);
      throw err;
    }
  }, [applyColors, notifyListeners]);

  // Suscribirse a cambios de colores
  useEffect(() => {
    const listener = (newColors: SystemColors) => {
      setColors(newColors);
    };
    
    listeners.push(listener);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  // Cargar colores al montar el hook
  useEffect(() => {
    loadColors();
  }, [loadColors]);

  return {
    colors,
    updateGlobalColors,
    reloadColors: loadColors
  };
};

// Función para obtener colores actuales sin hook
export const getCurrentColors = () => globalColors;

// Función para aplicar colores manualmente
export const applySystemColors = (newColors: SystemColors) => {
  globalColors = newColors;
  const root = document.documentElement;
  root.style.setProperty('--system-primary', newColors.colorPrimario);
  root.style.setProperty('--system-secondary', newColors.colorSecundario);
  root.style.setProperty('--system-background', newColors.colorFondo);
  root.style.setProperty('--primary', newColors.colorPrimario);
  root.style.setProperty('--secondary', newColors.colorSecundario);
  root.style.setProperty('--background', newColors.colorFondo);
  listeners.forEach(listener => listener(newColors));
};
