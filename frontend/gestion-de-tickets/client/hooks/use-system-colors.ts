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

export const useSystemColors = () => {
  const [colors, setColors] = useState<SystemColors>(DEFAULT_COLORS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Aplicar colores al CSS
  const applyColors = useCallback((newColors: SystemColors) => {
    const root = document.documentElement;
    
    // Aplicar colores como variables CSS personalizadas
    root.style.setProperty('--system-primary', newColors.colorPrimario);
    root.style.setProperty('--system-secondary', newColors.colorSecundario);
    root.style.setProperty('--system-background', newColors.colorFondo);
    
    // También aplicar a las variables de Tailwind si es necesario
    root.style.setProperty('--primary', newColors.colorPrimario);
    root.style.setProperty('--secondary', newColors.colorSecundario);
    root.style.setProperty('--background', newColors.colorFondo);
    
    console.log('🎨 Colores del sistema aplicados:', newColors);
  }, []);

  // Cargar colores desde la API
  const loadColors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando colores del sistema...');
      const configuraciones = await api.getConfiguraciones();
      
      if (configuraciones.colores) {
        const systemColors: SystemColors = {
          colorPrimario: configuraciones.colores.color_primario || DEFAULT_COLORS.colorPrimario,
          colorSecundario: configuraciones.colores.color_secundario || DEFAULT_COLORS.colorSecundario,
          colorFondo: configuraciones.colores.color_fondo || DEFAULT_COLORS.colorFondo
        };
        
        console.log('✅ Colores cargados desde API:', systemColors);
        setColors(systemColors);
        applyColors(systemColors);
      } else {
        console.log('⚠️ No se encontraron colores en la configuración, usando valores por defecto');
        setColors(DEFAULT_COLORS);
        applyColors(DEFAULT_COLORS);
      }
    } catch (err) {
      console.error('❌ Error cargando colores del sistema:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar colores');
      setColors(DEFAULT_COLORS);
      applyColors(DEFAULT_COLORS);
    } finally {
      setLoading(false);
    }
  }, [applyColors]);

  // Actualizar colores
  const updateColors = useCallback(async (newColors: SystemColors) => {
    try {
      console.log('🔄 Actualizando colores del sistema:', newColors);
      await api.actualizarColores(newColors);
      
      setColors(newColors);
      applyColors(newColors);
      
      console.log('✅ Colores actualizados exitosamente');
    } catch (err) {
      console.error('❌ Error actualizando colores:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar colores');
      throw err;
    }
  }, [applyColors]);

  // Cargar colores al montar el hook
  useEffect(() => {
    loadColors();
  }, [loadColors]);

  return {
    colors,
    loading,
    error,
    updateColors,
    reloadColors: loadColors
  };
};
