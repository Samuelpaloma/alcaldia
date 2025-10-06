import React, { useEffect } from 'react';
import { useGlobalSystem } from './GlobalSystemProvider';

/**
 * Componente que fuerza la aplicación de colores de manera más agresiva
 * Se ejecuta continuamente para asegurar que los colores se mantengan aplicados
 */
const ColorForceApplier: React.FC = () => {
  const { colors } = useGlobalSystem();

  useEffect(() => {
    if (!colors) return;

    console.log('🔥 [ColorForceApplier] Forzando aplicación de colores de manera agresiva...');

    const forceColors = () => {
      // 1. Aplicar a variables CSS globales
      const root = document.documentElement;
      root.style.setProperty('--system-primary', colors.colorPrimario);
      root.style.setProperty('--system-secondary', colors.colorSecundario);
      root.style.setProperty('--system-background', colors.colorFondo);
      root.style.setProperty('--system-text', colors.colorTexto);
      root.style.setProperty('--system-container', colors.colorContenedor || '#ffffff');
      root.style.setProperty('--system-container-secondary', colors.colorContenedorSecundario || '#f8f9fa');

      // 2. Aplicar al body y html con máxima prioridad
      document.body.style.setProperty('background-color', colors.colorFondo, 'important');
      document.body.style.setProperty('color', colors.colorTexto, 'important');
      document.documentElement.style.setProperty('background-color', colors.colorFondo, 'important');

      // 3. Aplicar SOLO al área principal, NO a contenedores específicos
      const mainAreaSelectors = [
        'main:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])',
        '.main-content:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])',
        '.content-area:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])',
        '.app-container > div:first-child:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])'
      ];

      mainAreaSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
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
              // NO aplicar color de texto a contenedores principales
            }
          }
        });
      });

      // 4. Aplicar a contenedores específicos
      const containerSelectors = [
        '.card',
        '.bg-white',
        '.bg-gray-50',
        '.bg-slate-50',
        '[class*="bg-white"]',
        '[class*="bg-gray-50"]',
        '[class*="bg-slate-50"]'
      ];

      containerSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.setProperty('background-color', colors.colorContenedor || '#ffffff', 'important');
            // NO aplicar color de texto a contenedores
          }
        });
      });

      // 5. Aplicar a contenedores secundarios
      const secondaryContainerSelectors = [
        '.bg-gray-100',
        '.bg-slate-100',
        '[class*="bg-gray-100"]',
        '[class*="bg-slate-100"]'
      ];

      secondaryContainerSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.setProperty('background-color', colors.colorContenedorSecundario || '#f8f9fa', 'important');
            // NO aplicar color de texto a contenedores secundarios
          }
        });
      });

      // 6. Aplicar a botones primarios
      const primaryButtonSelectors = [
        'button[class*="primary"]',
        '.btn-primary',
        'button[class*="bg-blue"]',
        '[class*="bg-blue-600"]',
        '[class*="bg-blue-500"]'
      ];

      primaryButtonSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.setProperty('background-color', colors.colorPrimario, 'important');
            element.style.setProperty('border-color', colors.colorPrimario, 'important');
            element.style.setProperty('color', '#ffffff', 'important');
          }
        });
      });

      // NO APLICAR color secundario a botones secundarios - mantener color original
      // El color secundario no debe afectar ningún elemento

      // 8. Aplicar color de texto SOLO a elementos de texto reales
      const textSelectors = [
        'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'label', 'a', 'strong', 'em', 'small', 'b', 'i',
        '.text-content', '.text', '[data-text="content"]'
      ];
      
      textSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            // Solo aplicar si es realmente texto, no un contenedor
            const isTextElement = element.tagName === 'P' || 
                                 element.tagName === 'SPAN' || 
                                 element.tagName === 'H1' || 
                                 element.tagName === 'H2' || 
                                 element.tagName === 'H3' || 
                                 element.tagName === 'H4' || 
                                 element.tagName === 'H5' || 
                                 element.tagName === 'H6' ||
                                 element.tagName === 'LABEL' ||
                                 element.tagName === 'A' ||
                                 element.tagName === 'STRONG' ||
                                 element.tagName === 'EM' ||
                                 element.tagName === 'SMALL' ||
                                 element.tagName === 'B' ||
                                 element.tagName === 'I';
            
            if (isTextElement) {
              element.style.setProperty('color', colors.colorTexto, 'important');
            }
          }
        });
      });

      // 9. Aplicar a sidebar y navegación
      const sidebarSelectors = [
        'aside',
        'nav',
        '.sidebar',
        '[class*="sidebar"]',
        '[class*="nav"]'
      ];

      sidebarSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.setProperty('background-color', colors.colorPrimario, 'important');
            element.style.setProperty('color', '#ffffff', 'important');
          }
        });
      });

      console.log('✅ [ColorForceApplier] Colores aplicados de manera agresiva');
    };

    // Aplicar inmediatamente
    forceColors();

    // Re-aplicar cada 2 segundos para mantener los colores (menos agresivo)
    const intervalId = setInterval(forceColors, 2000);

    // Re-aplicar cuando se detecten cambios en el DOM
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              const hasRelevantClasses = node.classList.contains('card') ||
                                       node.classList.contains('bg-white') ||
                                       node.classList.contains('bg-gray-50') ||
                                       node.classList.contains('bg-slate-50') ||
                                       node.classList.contains('main-content') ||
                                       node.classList.contains('content-area') ||
                                       node.querySelector('.card, .bg-white, .bg-gray-50, .bg-slate-50, .main-content, .content-area');
              
              if (hasRelevantClasses) {
                shouldReapply = true;
              }
            }
          });
        }
      });

      if (shouldReapply) {
        console.log('🔄 [ColorForceApplier] Detectados cambios, re-aplicando colores...');
        setTimeout(forceColors, 100);
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

export default ColorForceApplier;
