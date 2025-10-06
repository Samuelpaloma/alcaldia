import React, { useEffect } from 'react';
import { useGlobalSystem } from './GlobalSystemProvider';

/**
 * Componente específico para forzar los colores de contenedores (cards, etc.)
 * Se asegura de que los contenedores tengan los colores correctos
 */
const ContainerColorForcer: React.FC = () => {
  const { colors } = useGlobalSystem();

  useEffect(() => {
    if (!colors) return;

    console.log('🎨 [ContainerColorForcer] Forzando colores de contenedores...');

    const forceContainerColors = () => {
      // 1. Aplicar a todos los Cards (componentes principales)
      const cardSelectors = [
        '.card',
        '[class*="card"]',
        '.metric-card',
        '.ticket-item',
        '.tickets-list .ticket-item',
        '.bg-card',
        '.bg-white',
        '.bg-gray-50',
        '.bg-slate-50',
        '[class*="bg-white"]',
        '[class*="bg-gray-50"]',
        '[class*="bg-slate-50"]'
      ];

      cardSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            // Aplicar color de contenedor principal
            element.style.setProperty('background-color', colors.colorContenedor || '#ffffff', 'important');
            element.style.setProperty('color', colors.colorTexto, 'important');
            element.style.setProperty('border-color', 'rgba(0, 0, 0, 0.1)', 'important');
          }
        });
      });

      // 2. Aplicar a contenedores secundarios
      const secondaryContainerSelectors = [
        '.bg-gray-100',
        '.bg-slate-100',
        '.secondary-container',
        '.sub-container',
        '.panel',
        '.widget',
        '[class*="bg-gray-100"]',
        '[class*="bg-slate-100"]',
        '.metric-details',
        '.ticket-meta'
      ];

      secondaryContainerSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.setProperty('background-color', colors.colorContenedorSecundario || '#f8f9fa', 'important');
            element.style.setProperty('color', colors.colorTexto, 'important');
          }
        });
      });

      // 3. Aplicar a elementos específicos del dashboard
      const dashboardContainers = [
        '.metrics-grid .card',
        '.tickets-list .ticket-item',
        '.empty-state',
        '.ticket-info',
        '.ticket-header',
        '.ticket-subject',
        '.ticket-technician',
        // Rectángulos de tickets
        '.bg-card',
        '[class*="bg-card"]',
        '.border',
        '.rounded-lg',
        '.hover\\:shadow-lg',
        '.hover\\:shadow-xl',
        '.group',
        '.ticket-item',
        '.ticket-priority',
        '.ticket-date',
        '.status-badge',
        '.priority-badge',
        '.category-badge'
      ];

      dashboardContainers.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            // Determinar si es contenedor principal o secundario
            const isSecondary = element.classList.contains('ticket-meta') ||
                              element.classList.contains('metric-details') ||
                              element.classList.contains('ticket-technician') ||
                              element.classList.contains('bg-card') ||
                              element.classList.contains('border') ||
                              element.classList.contains('rounded-lg') ||
                              element.classList.contains('group') ||
                              element.classList.contains('ticket-item') ||
                              element.classList.contains('ticket-priority') ||
                              element.classList.contains('ticket-date') ||
                              element.classList.contains('status-badge') ||
                              element.classList.contains('priority-badge') ||
                              element.classList.contains('category-badge');
            
            const backgroundColor = isSecondary ? 
              (colors.colorContenedorSecundario || '#f8f9fa') : 
              (colors.colorContenedor || '#ffffff');
            
            element.style.setProperty('background-color', backgroundColor, 'important');
            element.style.setProperty('color', colors.colorTexto, 'important');
          }
        });
      });

      // 4. Aplicar a elementos de métricas específicos
      const metricElements = document.querySelectorAll('.metric-card, .metric-label, .metric-value, .metric-details');
      metricElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.setProperty('background-color', colors.colorContenedor || '#ffffff', 'important');
          element.style.setProperty('color', colors.colorTexto, 'important');
        }
      });

      // 5. Aplicar a elementos de tickets específicos
      const ticketElements = document.querySelectorAll('.ticket-item, .ticket-info, .ticket-header, .ticket-subject');
      ticketElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.setProperty('background-color', colors.colorContenedor || '#ffffff', 'important');
          element.style.setProperty('color', colors.colorTexto, 'important');
        }
      });

      console.log('✅ [ContainerColorForcer] Colores de contenedores aplicados:', {
        colorContenedor: colors.colorContenedor,
        colorContenedorSecundario: colors.colorContenedorSecundario
      });
    };

    // Aplicar inmediatamente
    forceContainerColors();

    // Re-aplicar cada 2 segundos para mantener los colores
    const intervalId = setInterval(forceContainerColors, 2000);

    // Re-aplicar cuando se detecten cambios en el DOM
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              const hasRelevantClasses = node.classList.contains('card') ||
                                       node.classList.contains('metric-card') ||
                                       node.classList.contains('ticket-item') ||
                                       node.querySelector('.card, .metric-card, .ticket-item');
              
              if (hasRelevantClasses) {
                shouldReapply = true;
              }
            }
          });
        }
      });

      if (shouldReapply) {
        console.log('🔄 [ContainerColorForcer] Detectados cambios, re-aplicando colores de contenedores...');
        setTimeout(forceContainerColors, 100);
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

export default ContainerColorForcer;
