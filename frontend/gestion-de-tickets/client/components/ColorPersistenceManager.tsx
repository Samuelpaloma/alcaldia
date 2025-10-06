import React, { useEffect } from 'react';
import { useGlobalSystem } from './GlobalSystemProvider';

/**
 * Componente que se ejecuta periódicamente para asegurar que los colores
 * del sistema se mantengan aplicados, especialmente después de navegación
 * o renderizado dinámico de componentes
 */
const ColorPersistenceManager: React.FC = () => {
  const { colors } = useGlobalSystem();

  useEffect(() => {
    if (!colors) return;

    console.log('🔄 ColorPersistenceManager: Iniciando gestión de persistencia de colores...');

    const applyColors = () => {
      // Aplicar a variables CSS globales
      const root = document.documentElement;
      root.style.setProperty('--system-primary', colors.colorPrimario);
      root.style.setProperty('--system-secondary', colors.colorSecundario);
      root.style.setProperty('--system-background', colors.colorFondo);
      root.style.setProperty('--system-text', colors.colorTexto);
      root.style.setProperty('--system-container', colors.colorContenedor || '#ffffff');
      root.style.setProperty('--system-container-secondary', colors.colorContenedorSecundario || '#f8f9fa');

      // Aplicar color de fondo global con !important
      document.body.style.setProperty('background-color', colors.colorFondo, 'important');
      document.body.style.setProperty('color', colors.colorTexto, 'important');
      
      // Aplicar también al html
      document.documentElement.style.setProperty('background-color', colors.colorFondo, 'important');
      
      // Aplicar SOLO al área principal, NO a contenedores específicos
      const mainElements = document.querySelectorAll('main:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"]), .main-content:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"]), .content-area:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])');
      mainElements.forEach(element => {
        if (element instanceof HTMLElement) {
          // Verificar que NO sea un contenedor específico
          const isSpecificContainer = element.classList.contains('card') ||
                                    element.classList.contains('bg-white') ||
                                    element.classList.contains('bg-gray-50') ||
                                    element.classList.contains('bg-slate-50') ||
                                    element.classList.contains('bg-gray-100') ||
                                    element.classList.contains('bg-slate-100') ||
                                    element.querySelector('.card, .bg-white, .bg-gray-50, .bg-slate-50, .bg-gray-100, .bg-slate-100');
          
          if (!isSpecificContainer) {
            element.style.setProperty('background-color', colors.colorFondo, 'important');
            element.style.setProperty('color', colors.colorTexto, 'important');
          }
        }
      });

      // Aplicar a elementos específicos con !important
      const selectors = [
        '.bg-white',
        '.bg-gray-50',
        '.bg-gray-100',
        '.bg-slate-50',
        '.bg-slate-100',
        '.card',
        '.container',
        '.main-content',
        '.content-wrapper',
        '.page-wrapper',
        '[class*="bg-white"]',
        '[class*="bg-gray"]',
        '[class*="bg-slate"]'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            // Determinar si es contenedor secundario
            const isSecondary = element.classList.contains('bg-gray-100') || 
                               element.classList.contains('bg-slate-100') ||
                               element.classList.contains('sidebar') ||
                               element.classList.contains('nav-container');
            
            const backgroundColor = isSecondary ? 
              (colors.colorContenedorSecundario || '#f8f9fa') : 
              (colors.colorContenedor || '#ffffff');
            
            element.style.setProperty('background-color', backgroundColor, 'important');
            element.style.setProperty('color', colors.colorTexto, 'important');
          }
        });
      });

      console.log('✅ ColorPersistenceManager: Colores re-aplicados');
    };

    // Aplicar inmediatamente
    applyColors();

    // Re-aplicar cada 2 segundos para mantener los colores
    const intervalId = setInterval(applyColors, 2000);

    // Re-aplicar cuando se detecten cambios en el DOM
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Verificar si se agregaron elementos con clases de color
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              const hasColorClasses = node.classList.contains('bg-white') ||
                                    node.classList.contains('bg-gray-50') ||
                                    node.classList.contains('bg-gray-100') ||
                                    node.classList.contains('bg-slate-50') ||
                                    node.classList.contains('bg-slate-100') ||
                                    node.querySelector('.bg-white, .bg-gray-50, .bg-gray-100, .bg-slate-50, .bg-slate-100');
              
              if (hasColorClasses) {
                shouldReapply = true;
              }
            }
          });
        }
      });

      if (shouldReapply) {
        console.log('🔄 ColorPersistenceManager: Detectados nuevos elementos, re-aplicando colores...');
        setTimeout(applyColors, 100);
      }
    });

    // Observar cambios en el DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      clearInterval(intervalId);
      observer.disconnect();
    };
  }, [colors]);

  return null; // Este componente no renderiza nada
};

export default ColorPersistenceManager;
