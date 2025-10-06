import React, { useEffect } from 'react';
import { useGlobalSystem } from './GlobalSystemProvider';

/**
 * Componente que se ejecuta ANTES de que se cargue la página
 * Para evitar el flash blanco
 */
const PreloadColorForcer: React.FC = () => {
  const { colors } = useGlobalSystem();

  useEffect(() => {
    if (!colors) return;

    console.log('⚡ [PreloadColorForcer] Aplicando colores ANTES de la carga...');

    // Aplicar INMEDIATAMENTE sin esperar
    const applyPreloadColors = () => {
      // 1. Aplicar a variables CSS INMEDIATAMENTE
      const root = document.documentElement;
      root.style.setProperty('--system-primary', colors.colorPrimario);
      root.style.setProperty('--system-secondary', colors.colorSecundario);
      root.style.setProperty('--system-background', colors.colorFondo);
      root.style.setProperty('--system-text', colors.colorTexto);
      root.style.setProperty('--system-container', colors.colorContenedor || '#ffffff');
      root.style.setProperty('--system-container-secondary', colors.colorContenedorSecundario || '#f8f9fa');

      // 2. Aplicar al body INMEDIATAMENTE
      document.body.style.setProperty('background-color', colors.colorFondo, 'important');
      document.body.style.setProperty('color', colors.colorTexto, 'important');
      document.documentElement.style.setProperty('background-color', colors.colorFondo, 'important');

      // 3. Aplicar SOLO al área principal INMEDIATAMENTE
      const mainElements = document.querySelectorAll('main, .main-content, .content-area, .dashboard-container, .dashboard-content');
      mainElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.setProperty('background-color', colors.colorFondo, 'important');
          element.style.setProperty('color', colors.colorTexto, 'important');
        }
      });

      console.log('⚡ [PreloadColorForcer] Colores aplicados ANTES de la carga');
    };

    // Aplicar INMEDIATAMENTE
    applyPreloadColors();

    // Re-aplicar cada 50ms para máxima velocidad
    const intervalId = setInterval(applyPreloadColors, 50);

    return () => clearInterval(intervalId);
  }, [colors]);

  return null;
};

export default PreloadColorForcer;
