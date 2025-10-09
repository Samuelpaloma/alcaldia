import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { api } from '../../shared/api';

interface SystemColors {
  colorPrimario: string;
  colorSecundario: string;
  colorFondo: string;
  colorTexto: string;
  colorContenedor?: string;
  colorContenedorSecundario?: string;
}

interface SystemLogo {
  logoUrl: string;
  logoAlt: string;
}

interface GlobalSystemContextType {
  colors: SystemColors;
  logo: SystemLogo;
  loading: boolean;
  updateSystemColors: (colors: SystemColors) => Promise<{ success: boolean; error?: any }>;
  updateSystemLogo: (logo: SystemLogo) => Promise<{ success: boolean; error?: any }>;
  loadSystemConfiguration: () => Promise<void>;
}

const GlobalSystemContext = createContext<GlobalSystemContextType | undefined>(undefined);

interface GlobalSystemProviderProps {
  children: ReactNode;
}

export const GlobalSystemProvider: React.FC<GlobalSystemProviderProps> = ({ children }) => {
  const [colors, setColors] = useState<SystemColors>({
    colorPrimario: '#000000',
    colorSecundario: '#ffffff',
    colorFondo: '#ffffff',
    colorTexto: '#000000'
  });
  
  const [logo, setLogo] = useState<SystemLogo>({
    logoUrl: '',
    logoAlt: 'Logo'
  });
  
  const [loading, setLoading] = useState(false);

  // Cargar configuración al montar el componente
  useEffect(() => {
    loadSystemConfiguration();
  }, []);

  const updateSystemColors = async (newColors: SystemColors) => {
    try {
      setColors(newColors);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateSystemLogo = async (newLogo: SystemLogo) => {
    try {
      setLogo(newLogo);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const loadSystemConfiguration = async () => {
    setLoading(true);
    try {
      // Cargar tema actual del backend
      const temaActual = await api.getTemaActual();
      console.log('🎨 [GlobalSystemProvider] Tema actual:', temaActual);
      
      // Obtener colores usando el endpoint que ya funciona
      const response = await fetch('/api/superadmin/configuraciones', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🎨 [GlobalSystemProvider] Configuraciones obtenidas:', data);
        
        if (data.colores) {
          const colores: SystemColors = {
            colorPrimario: data.colores.color_primario || '#000000',
            colorSecundario: data.colores.color_secundario || '#6c757d',
            colorFondo: data.colores.color_fondo || '#ffffff',
            colorTexto: data.colores.color_texto || '#000000',
            colorContenedor: data.colores.color_contenedor || '#ffffff',
            colorContenedorSecundario: data.colores.color_contenedor_secundario || '#f8f9fa'
          };
          console.log('🎨 [GlobalSystemProvider] Colores procesados:', colores);
          setColors(colores);
        }
      }
    } catch (error) {
      console.error('❌ [GlobalSystemProvider] Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: GlobalSystemContextType = {
    colors,
    logo,
    loading,
    updateSystemColors,
    updateSystemLogo,
    loadSystemConfiguration
  };

  return (
    <GlobalSystemContext.Provider value={value}>
      {children}
    </GlobalSystemContext.Provider>
  );
};

export const useGlobalSystem = (): GlobalSystemContextType => {
  const context = useContext(GlobalSystemContext);
  if (context === undefined) {
    throw new Error('useGlobalSystem must be used within a GlobalSystemProvider');
  }
  return context;
};

// Componente para aplicar estilos globales
export const GlobalSystemStyles: React.FC = () => {
  const { colors } = useGlobalSystem();

  React.useEffect(() => {
    // Aplicar estilos globales cuando cambien los colores
    const root = document.documentElement;
    root.style.setProperty('--system-primary', colors.colorPrimario);
    root.style.setProperty('--system-secondary', colors.colorSecundario);
    root.style.setProperty('--system-background', colors.colorFondo);
    root.style.setProperty('--system-text', colors.colorTexto);
  }, [colors]);

  return null;
};
