import React, { useEffect } from 'react';
import { useGlobalSystem } from './GlobalSystemProvider';

/**
 * Componente simple que aplica colores de manera controlada
 * Solo aplica el fondo principal y deja que los contenedores mantengan sus colores
 */
const SimpleColorApplier: React.FC = () => {
  const { colors } = useGlobalSystem();

  useEffect(() => {
    if (!colors) return;

    console.log('🎨 [SimpleColorApplier] Aplicando colores de manera controlada...');

    const applyColors = () => {
      // 1. Aplicar a variables CSS globales
      const root = document.documentElement;
      root.style.setProperty('--system-primary', colors.colorPrimario);
      root.style.setProperty('--system-secondary', colors.colorSecundario);
      root.style.setProperty('--system-background', colors.colorFondo);
      root.style.setProperty('--system-text', colors.colorTexto);
      root.style.setProperty('--system-container', colors.colorContenedor || '#ffffff');
      root.style.setProperty('--system-container-secondary', colors.colorContenedorSecundario || '#f8f9fa');

      // 2. Aplicar SOLO al body y html (fondo principal)
      document.body.style.setProperty('background-color', colors.colorFondo, 'important');
      document.body.style.setProperty('color', colors.colorTexto, 'important');
      document.documentElement.style.setProperty('background-color', colors.colorFondo, 'important');

      // 3. Aplicar a elementos principales SIN tocar contenedores
      const mainSelectors = [
        'main:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])',
        '.main-content:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])',
        '.content-area:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])',
        '.dashboard-container:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])',
        '.dashboard-content:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])'
      ];

      mainSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            // Verificar que NO sea un contenedor específico
            const isContainer = element.classList.contains('card') ||
                              element.classList.contains('bg-white') ||
                              element.classList.contains('bg-gray-50') ||
                              element.classList.contains('bg-slate-50') ||
                              element.classList.contains('bg-gray-100') ||
                              element.classList.contains('bg-slate-100') ||
                              element.querySelector('.card, .bg-white, .bg-gray-50, .bg-slate-50, .bg-gray-100, .bg-slate-100');
            
            if (!isContainer) {
              element.style.setProperty('background-color', colors.colorFondo, 'important');
              element.style.setProperty('color', colors.colorTexto, 'important');
            }
          }
        });
      });

      // 4. Aplicar a contenedores específicos (cards, etc.)
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

      // 6. Aplicar a sidebar y navegación
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

      // 7. Aplicar color de texto SOLO a elementos de texto reales
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

      console.log('✅ [SimpleColorApplier] Colores aplicados de manera controlada');
    };

    // Aplicar inmediatamente
    applyColors();

    // Re-aplicar cada 3 segundos (menos frecuente)
    const intervalId = setInterval(applyColors, 3000);

    return () => clearInterval(intervalId);
  }, [colors]);

  return null; // Este componente no renderiza nada
};

export default SimpleColorApplier;
