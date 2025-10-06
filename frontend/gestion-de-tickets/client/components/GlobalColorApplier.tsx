import React, { useEffect } from 'react';
import { useGlobalSystem } from './GlobalSystemProvider';

const GlobalColorApplier: React.FC = () => {
  const { colors } = useGlobalSystem();

  useEffect(() => {
    console.log('🎨 GlobalColorApplier: Colores recibidos:', colors);
    // Aplicar colores cada vez que cambien
    if (colors) {
      console.log('🎨 GlobalColorApplier: Aplicando colores...');
      applyColorsToAllElements(colors);
    } else {
      console.log('⚠️ GlobalColorApplier: No hay colores para aplicar');
    }
  }, [colors]);

  const applyColorsToAllElements = (newColors: typeof colors) => {
    // Aplicar a variables CSS globales
    const root = document.documentElement;
    root.style.setProperty('--system-primary', newColors.colorPrimario);
    root.style.setProperty('--system-secondary', newColors.colorSecundario);
    root.style.setProperty('--system-background', newColors.colorFondo);
    root.style.setProperty('--system-text', newColors.colorTexto);

    // Aplicar color de fondo global
    document.body.style.backgroundColor = newColors.colorFondo;
    document.body.style.color = newColors.colorTexto;

    // Aplicar a todos los botones primarios
    const primaryButtons = document.querySelectorAll(
      'button, .btn, [class*="bg-blue-"], [class*="bg-primary"], [data-color="primary"]'
    );
    primaryButtons.forEach(button => {
      if (button instanceof HTMLElement) {
        const classList = button.className;
        if (classList.includes('bg-blue-') || classList.includes('bg-primary') || 
            classList.includes('btn-primary') || button.getAttribute('data-color') === 'primary') {
          button.style.backgroundColor = newColors.colorPrimario;
          button.style.borderColor = newColors.colorPrimario;
          button.style.color = '#ffffff';
        }
      }
    });

    // Aplicar a todos los botones secundarios
    const secondaryButtons = document.querySelectorAll(
      'button, .btn, [class*="bg-gray-"], [class*="bg-secondary"], [data-color="secondary"]'
    );
    secondaryButtons.forEach(button => {
      if (button instanceof HTMLElement) {
        const classList = button.className;
        if (classList.includes('bg-gray-') || classList.includes('bg-secondary') || 
            classList.includes('btn-secondary') || button.getAttribute('data-color') === 'secondary') {
          button.style.backgroundColor = newColors.colorSecundario;
          button.style.borderColor = newColors.colorSecundario;
          button.style.color = '#ffffff';
        }
      }
    });

    // Aplicar a sidebar y navegación
    const sidebarElements = document.querySelectorAll(
      'aside, nav, .sidebar, [class*="sidebar"], [data-role="sidebar"]'
    );
    sidebarElements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.backgroundColor = newColors.colorPrimario;
      }
    });

    // Aplicar color de texto a elementos de contenido
    const textElements = document.querySelectorAll(
      'p, span, div, h1, h2, h3, h4, h5, h6, .text-content, .content'
    );
    textElements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.color = newColors.colorTexto;
      }
    });

    console.log('🎨 Colores aplicados globalmente:', newColors);
  };

  return null; // Este componente no renderiza nada, solo aplica colores
};

export default GlobalColorApplier;
