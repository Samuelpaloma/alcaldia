import React, { useEffect, useState } from 'react';
import { useGlobalSystem } from './GlobalSystemProvider';
import { api } from '../../shared/api';

/**
 * Componente simple que aplica colores de manera controlada
 * Solo aplica el fondo principal y deja que los contenedores mantengan sus colores
 */
const SimpleColorApplier: React.FC = () => {
  const { colors } = useGlobalSystem();
  const [temaActual, setTemaActual] = useState<string>('claro');

  // Verificar si estamos en rutas de administración usando window.location
  const currentPath = window.location.pathname;
  const isAdminRoute = currentPath.startsWith('/admin') || 
                      currentPath.startsWith('/tickets') || 
                      currentPath.startsWith('/users-roles') || 
                      currentPath.startsWith('/categories') || 
                      currentPath.startsWith('/automation-rules') || 
                      currentPath.startsWith('/sla-configuration') || 
                      currentPath.startsWith('/analytics') ||
                      currentPath.startsWith('/superadmin');

  useEffect(() => {
    // Cargar tema actual
    const loadTemaActual = async () => {
      try {
        const tema = await api.getTemaActual();
        if (tema.success && tema.data) {
          setTemaActual(tema.data.tema);
          console.log('🎨 [SimpleColorApplier] Tema actual detectado:', tema.data.tema);
        }
      } catch (error) {
        console.error('❌ [SimpleColorApplier] Error cargando tema:', error);
      }
    };

    loadTemaActual();
  }, []);

  useEffect(() => {
    console.log('🎨 [SimpleColorApplier] Aplicando colores de manera controlada...');

    const applyColors = () => {
      // Verificar ruta actual en cada ejecución
      const currentPath = window.location.pathname;
      const isCurrentlyAdminRoute = currentPath.startsWith('/admin') || 
                                   currentPath.startsWith('/tickets') || 
                                   currentPath.startsWith('/users-roles') || 
                                   currentPath.startsWith('/categories') || 
                                   currentPath.startsWith('/automation-rules') || 
                                   currentPath.startsWith('/sla-configuration') || 
                                   currentPath.startsWith('/analytics') ||
                                   currentPath.startsWith('/superadmin');

      // Solo aplicar tema oscuro en rutas de administración
      if (!isCurrentlyAdminRoute) {
        console.log('🎨 [SimpleColorApplier] No es ruta de admin, aplicando tema claro por defecto');
        // Aplicar tema claro por defecto para rutas no-admin
        const root = document.documentElement;
        root.style.setProperty('--system-primary', '#000000');
        root.style.setProperty('--system-secondary', '#6c757d');
        root.style.setProperty('--system-background', '#ffffff');
        root.style.setProperty('--system-text', '#000000');
        root.style.setProperty('--system-container', '#ffffff');
        root.style.setProperty('--system-container-secondary', '#f8f9fa');

        document.body.style.setProperty('background-color', '#ffffff', 'important');
        document.body.style.setProperty('color', '#000000', 'important');
        document.documentElement.style.setProperty('background-color', '#ffffff', 'important');
        return;
      }

      // Definir colores según el tema actual (solo para admin)
      let coloresAplicar;
      
      if (temaActual === 'oscuro') {
        coloresAplicar = {
          colorFondo: '#0f0f0f',        // Negro más oscuro
          colorTexto: '#ffffff',        // Blanco
          colorContenedor: '#1a1a1a',   // Gris muy oscuro
          colorContenedorSecundario: '#2d2d2d', // Gris oscuro
          colorPrimario: '#ffffff'      // Blanco
        };
      } else {
        coloresAplicar = {
          colorFondo: '#ffffff',
          colorTexto: '#000000',
          colorContenedor: '#ffffff',
          colorContenedorSecundario: '#ffffff',
          colorPrimario: '#000000'
        };
      }

      console.log('🎨 [SimpleColorApplier] Aplicando colores para tema:', temaActual, 'en ruta admin:', isCurrentlyAdminRoute, coloresAplicar);
      // 1. Aplicar a variables CSS globales
      const root = document.documentElement;
      root.style.setProperty('--system-primary', coloresAplicar.colorPrimario);
      root.style.setProperty('--system-secondary', coloresAplicar.colorSecundario || '#6c757d');
      root.style.setProperty('--system-background', coloresAplicar.colorFondo);
      root.style.setProperty('--system-text', coloresAplicar.colorTexto);
      root.style.setProperty('--system-container', coloresAplicar.colorContenedor);
      root.style.setProperty('--system-container-secondary', coloresAplicar.colorContenedorSecundario);

      // 2. Aplicar al body, html y elementos principales
      document.body.style.setProperty('background-color', coloresAplicar.colorFondo, 'important');
      document.body.style.setProperty('color', coloresAplicar.colorTexto, 'important');
      document.documentElement.style.setProperty('background-color', coloresAplicar.colorFondo, 'important');
      
      // Aplicar también al contenedor principal de la app
      const appContainer = document.querySelector('#root, .app, [data-reactroot]');
      if (appContainer instanceof HTMLElement) {
        appContainer.style.setProperty('background-color', coloresAplicar.colorFondo, 'important');
        appContainer.style.setProperty('color', coloresAplicar.colorTexto, 'important');
      }

      // 3. Aplicar a elementos principales SIN tocar contenedores
      const mainSelectors = [
        'main:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])',
        '.main-content:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])',
        '.content-area:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])',
        '.dashboard-container:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])',
        '.dashboard-content:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])',
        // Agregar selectores más agresivos para tema oscuro
        ...(temaActual === 'oscuro' ? [
          'div:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"]):not(.modal):not([data-radix-dialog-content])',
          'section:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])',
          'article:not(.card):not([class*="bg-white"]):not([class*="bg-gray"]):not([class*="bg-slate"])'
        ] : [])
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
              element.style.setProperty('background-color', coloresAplicar.colorFondo, 'important');
              element.style.setProperty('color', coloresAplicar.colorTexto, 'important');
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
            element.style.setProperty('background-color', coloresAplicar.colorContenedor, 'important');
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
            element.style.setProperty('background-color', coloresAplicar.colorContenedorSecundario, 'important');
            // NO aplicar color de texto a contenedores secundarios
          }
        });
      });

      // 6. Aplicar a sidebar y navegación - USAR COLORES DEL TEMA
      const sidebarSelectors = [
        'aside',
        'nav',
        '.sidebar',
        '[class*="sidebar"]',
        '[class*="nav"]',
        // Selectores más específicos para tema oscuro
        ...(temaActual === 'oscuro' ? [
          'aside *',
          'nav *',
          '.sidebar *',
          '[class*="sidebar"] *',
          '[class*="nav"] *',
          'aside div',
          'nav div',
          'aside a',
          'nav a',
          'aside span',
          'nav span',
          'aside p',
          'nav p'
        ] : [])
      ];

      sidebarSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            // Usar colores del tema actual
            element.style.setProperty('background-color', coloresAplicar.colorContenedor, 'important');
            element.style.setProperty('color', coloresAplicar.colorTexto, 'important');
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
              element.style.setProperty('color', coloresAplicar.colorTexto, 'important');
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
  }, [temaActual]);

  return null; // Este componente no renderiza nada
};

export default SimpleColorApplier;
