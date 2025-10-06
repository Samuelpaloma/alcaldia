import React, { useEffect } from 'react';
import { useGlobalSystem } from './GlobalSystemProvider';

/**
 * Componente de emergencia para resetear colores incorrectos
 */
const ColorReset: React.FC = () => {
  const { colors } = useGlobalSystem();

  useEffect(() => {
    if (!colors) return;

    console.log('🔄 [ColorReset] Reseteando colores incorrectos...');

    const resetColors = () => {
      // 1. Resetear variables CSS
      const root = document.documentElement;
      root.style.setProperty('--system-primary', colors.colorPrimario);
      root.style.setProperty('--system-secondary', colors.colorSecundario);
      root.style.setProperty('--system-background', colors.colorFondo);
      root.style.setProperty('--system-text', colors.colorTexto);
      root.style.setProperty('--system-container', colors.colorContenedor || '#ffffff');
      root.style.setProperty('--system-container-secondary', colors.colorContenedorSecundario || '#f8f9fa');

      // 2. Resetear body y html
      document.body.style.setProperty('background-color', colors.colorFondo, 'important');
      document.body.style.setProperty('color', colors.colorTexto, 'important');
      document.documentElement.style.setProperty('background-color', colors.colorFondo, 'important');

      // 3. Resetear SOLO al área principal
      const mainElements = document.querySelectorAll('main, .main-content, .content-area, .dashboard-container, .dashboard-content');
      mainElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.setProperty('background-color', colors.colorFondo, 'important');
          element.style.setProperty('color', colors.colorTexto, 'important');
        }
      });

      // 4. Resetear contenedores a sus colores correctos
      const containerSelectors = [
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
        '.metric-card',
        '.ticket-item',
        '.tickets-list .ticket-item',
        '.empty-state',
        '.ticket-info',
        '.ticket-header',
        '.ticket-subject'
      ];

      containerSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.setProperty('background-color', colors.colorContenedor || '#ffffff', 'important');
            element.style.setProperty('color', colors.colorTexto, 'important');
            element.style.setProperty('border-color', 'rgba(0, 0, 0, 0.1)', 'important');
          }
        });
      });

      // 5. Resetear contenedores secundarios
      const secondarySelectors = [
        '.bg-gray-100',
        '.bg-slate-100',
        '.secondary-container',
        '.sub-container',
        '.panel',
        '.widget',
        '[class*="bg-gray-100"]',
        '[class*="bg-slate-100"]',
        '.metric-details',
        '.ticket-meta',
        '.ticket-technician'
      ];

      secondarySelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.setProperty('background-color', colors.colorContenedorSecundario || '#f8f9fa', 'important');
            element.style.setProperty('color', colors.colorTexto, 'important');
          }
        });
      });

      // 6. Resetear sidebar
      const sidebarElements = document.querySelectorAll('aside, .sidebar, .nav-container, .left-sidebar');
      sidebarElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.setProperty('background-color', colors.colorPrimario, 'important');
          element.style.setProperty('color', '#ffffff', 'important');
        }
      });

      // 7. Resetear header
      const headerElements = document.querySelectorAll('header, .header, .top-navbar, .navbar');
      headerElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.setProperty('background-color', colors.colorSecundario, 'important');
          element.style.setProperty('color', colors.colorTexto, 'important');
        }
      });

      console.log('✅ [ColorReset] Colores reseteados correctamente');
    };

    // Aplicar inmediatamente
    resetColors();

    // Re-aplicar cada 1 segundo
    const intervalId = setInterval(resetColors, 1000);

    return () => clearInterval(intervalId);
  }, [colors]);

  return null;
};

export default ColorReset;
