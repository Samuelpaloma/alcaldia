import React, { useEffect } from 'react';
import { useGlobalColors } from '../hooks/use-global-colors';
import { applySystemColorsToElements, applyColorsToTicketsInterface } from '../utils/apply-system-colors';

interface SystemColorsProviderProps {
  children: React.ReactNode;
}

export const SystemColorsProvider: React.FC<SystemColorsProviderProps> = ({ children }) => {
  const { colors } = useGlobalColors();

  // Aplicar colores globalmente cuando cambien
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar colores del sistema a variables CSS
    root.style.setProperty('--system-primary', colors.colorPrimario);
    root.style.setProperty('--system-secondary', colors.colorSecundario);
    root.style.setProperty('--system-background', colors.colorFondo);
    
    // También aplicar a variables de Tailwind para compatibilidad
    root.style.setProperty('--primary', colors.colorPrimario);
    root.style.setProperty('--secondary', colors.colorSecundario);
    root.style.setProperty('--background', colors.colorFondo);
    
    // Aplicar colores a elementos específicos
    applySystemColorsToElements(colors);
    applyColorsToTicketsInterface(colors);
    
    console.log('🎨 Colores del sistema aplicados globalmente:', colors);
  }, [colors]);

  return <>{children}</>;
};

