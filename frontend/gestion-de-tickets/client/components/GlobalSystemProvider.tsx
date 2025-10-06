import React, { createContext, useContext, ReactNode } from 'react';
import { useGlobalSystemColors } from '../hooks/useGlobalSystemColors';

interface SystemColors {
  colorPrimario: string;
  colorSecundario: string;
  colorFondo: string;
  colorTexto: string;
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
  const systemColors = useGlobalSystemColors();

  return (
    <GlobalSystemContext.Provider value={systemColors}>
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
  const { colors, logo } = useGlobalSystem();

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
