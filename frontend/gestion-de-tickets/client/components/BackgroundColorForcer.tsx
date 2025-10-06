import React, { useEffect } from 'react';
import { useGlobalSystem } from './GlobalSystemProvider';

/**
 * Componente específico para forzar el color de fondo principal
 * Se ejecuta continuamente para asegurar que el fondo se mantenga aplicado
 */
const BackgroundColorForcer: React.FC = () => {
  const { colors } = useGlobalSystem();

  useEffect(() => {
    if (!colors) return;

    console.log('🎨 BackgroundColorForcer: Forzando color de fondo principal...');

    const forceBackgroundColor = () => {
      // Aplicar al body con máxima prioridad
      document.body.style.setProperty('background-color', colors.colorFondo, 'important');
      document.body.style.setProperty('color', colors.colorTexto, 'important');
      
      // Aplicar al html
      document.documentElement.style.setProperty('background-color', colors.colorFondo, 'important');
      
      // Aplicar SOLO al área principal de contenido, NO a contenedores específicos
      const mainAreaSelectors = [
        'main',
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
              element.style.setProperty('color', colors.colorTexto, 'important');
            }
          }
        });
      });

      console.log('✅ BackgroundColorForcer: Color de fondo aplicado:', colors.colorFondo);
    };

    // Aplicar inmediatamente
    forceBackgroundColor();

    // Re-aplicar cada 1 segundo para mantener el fondo
    const intervalId = setInterval(forceBackgroundColor, 1000);

    // Re-aplicar cuando se detecten cambios en el DOM
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              const hasBackgroundClasses = node.classList.contains('bg-white') ||
                                        node.classList.contains('bg-gray-50') ||
                                        node.classList.contains('bg-slate-50') ||
                                        node.classList.contains('bg-background') ||
                                        node.querySelector('.bg-white, .bg-gray-50, .bg-slate-50, .bg-background');
              
              if (hasBackgroundClasses) {
                shouldReapply = true;
              }
            }
          });
        }
      });

      if (shouldReapply) {
        console.log('🔄 BackgroundColorForcer: Detectados cambios, re-aplicando fondo...');
        setTimeout(forceBackgroundColor, 100);
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

export default BackgroundColorForcer;
