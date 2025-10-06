import React, { useEffect } from 'react';
import { useGlobalSystem } from './GlobalSystemProvider';

/**
 * Componente ULTRA AGRESIVO para forzar colores sin flash blanco
 * Se ejecuta inmediatamente y de manera continua
 */
const AggressiveColorForcer: React.FC = () => {
  const { colors } = useGlobalSystem();

  useEffect(() => {
    if (!colors) return;

    console.log('🔥 [AggressiveColorForcer] FORZANDO colores de manera ULTRA AGRESIVA...');

    const forceColorsAggressively = () => {
      // 1. Aplicar INMEDIATAMENTE a variables CSS
      const root = document.documentElement;
      root.style.setProperty('--system-primary', colors.colorPrimario);
      root.style.setProperty('--system-secondary', colors.colorSecundario);
      root.style.setProperty('--system-background', colors.colorFondo);
      root.style.setProperty('--system-text', colors.colorTexto);
      root.style.setProperty('--system-container', colors.colorContenedor || '#ffffff');
      root.style.setProperty('--system-container-secondary', colors.colorContenedorSecundario || '#f8f9fa');

      // 2. Aplicar INMEDIATAMENTE al body y html para evitar flash blanco
      document.body.style.setProperty('background-color', colors.colorFondo, 'important');
      document.body.style.setProperty('color', colors.colorTexto, 'important');
      document.documentElement.style.setProperty('background-color', colors.colorFondo, 'important');

      // 3. Aplicar INMEDIATAMENTE SOLO a contenedores específicos
      const containerSelectors = [
        // Contenedores principales
        '.card',
        '[class*="card"]',
        '.bg-card',
        '.bg-white',
        '.bg-gray-50',
        '.bg-slate-50',
        '.container',
        '.container-fluid',
        '[class*="bg-white"]',
        '[class*="bg-gray-50"]',
        '[class*="bg-slate-50"]',
        // Elementos específicos del dashboard
        '.metric-card',
        '.ticket-item',
        '.tickets-list .ticket-item',
        '.empty-state',
        '.ticket-info',
        '.ticket-header',
        '.ticket-subject',
        '.ticket-technician',
        // Elementos de métricas
        '.metric-label',
        '.metric-value',
        '.metric-details',
        '.detail-item',
        // Elementos de tickets
        '.ticket-meta',
        '.status-badge',
        '.ticket-priority',
        '.ticket-date'
      ];

      containerSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            // Determinar si es contenedor secundario
            const isSecondary = element.classList.contains('metric-details') ||
                              element.classList.contains('ticket-meta') ||
                              element.classList.contains('ticket-technician') ||
                              element.classList.contains('detail-item') ||
                              element.classList.contains('bg-gray-100') ||
                              element.classList.contains('bg-slate-100') ||
                              element.classList.contains('secondary-container') ||
                              element.classList.contains('sub-container');
            
            const backgroundColor = isSecondary ? 
              (colors.colorContenedorSecundario || '#f8f9fa') : 
              (colors.colorContenedor || '#ffffff');
            
            // FORZAR aplicación con máxima prioridad
            element.style.setProperty('background-color', backgroundColor, 'important');
            element.style.setProperty('color', colors.colorTexto, 'important');
            element.style.setProperty('border-color', 'rgba(0, 0, 0, 0.1)', 'important');
          }
        });
      });

      // 4. Aplicar INMEDIATAMENTE a sidebar
      const sidebarSelectors = [
        'aside',
        '.sidebar',
        '.nav-container',
        '.left-sidebar',
        '[class*="sidebar"]'
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

      // 5. Aplicar INMEDIATAMENTE a header
      const headerSelectors = [
        'header',
        '.header',
        '.top-navbar',
        '.navbar',
        '[class*="header"]'
      ];

      headerSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.setProperty('background-color', colors.colorSecundario, 'important');
            element.style.setProperty('color', colors.colorTexto, 'important');
          }
        });
      });

      // 6. Aplicar INMEDIATAMENTE a botones
      const buttonSelectors = [
        'button',
        '.btn',
        '[class*="btn"]',
        '[class*="button"]',
        '.new-ticket-button'
      ];

      buttonSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            const isPrimary = element.classList.contains('btn-primary') ||
                            element.classList.contains('bg-primary') ||
                            element.classList.contains('new-ticket-button') ||
                            element.textContent?.includes('New Ticket');
            
            const buttonColor = isPrimary ? colors.colorPrimario : colors.colorSecundario;
            element.style.setProperty('background-color', buttonColor, 'important');
            element.style.setProperty('color', '#ffffff', 'important');
            element.style.setProperty('border-color', buttonColor, 'important');
          }
        });
      });

      console.log('🔥 [AggressiveColorForcer] Colores aplicados ULTRA AGRESIVAMENTE');
    };

    // Aplicar INMEDIATAMENTE sin delay
    forceColorsAggressively();

    // Re-aplicar cada 100ms para máxima agresividad
    const intervalId = setInterval(forceColorsAggressively, 100);

    // Re-aplicar cuando se detecten cambios
    const observer = new MutationObserver(() => {
      setTimeout(forceColorsAggressively, 10);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      clearInterval(intervalId);
      observer.disconnect();
    };
  }, [colors]);

  return null;
};

export default AggressiveColorForcer;
