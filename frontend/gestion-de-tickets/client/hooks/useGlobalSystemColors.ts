import { useState, useEffect } from 'react';
import { api } from '../../shared/api';

interface SystemColors {
  colorPrimario: string;
  colorSecundario: string;
  colorFondo: string;
  colorTexto: string;
}

interface SystemLogo {
  logoUrl: string;
  logoAlt: string;
}

export const useGlobalSystemColors = () => {
  const [colors, setColors] = useState<SystemColors>({
    colorPrimario: '#007bff',
    colorSecundario: '#6c757d',
    colorFondo: '#ffffff',
    colorTexto: '#000000'
  });

  const [logo, setLogo] = useState<SystemLogo>({
    logoUrl: '/logo-alcaldia.png',
    logoAlt: 'Logo Alcaldía'
  });

  const [loading, setLoading] = useState(true);

  // Cargar configuración del sistema al inicializar
  useEffect(() => {
    loadSystemConfiguration();
  }, []);

  const loadSystemConfiguration = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando configuración del sistema...');
      
      // Cargar colores del sistema
      const colorsResponse = await api.getColoresSistema();
      console.log('📡 Respuesta de colores:', colorsResponse);
      console.log('📡 Datos de colores:', colorsResponse.data);
      
      if (colorsResponse.success && colorsResponse.data) {
        const systemColors = {
          colorPrimario: colorsResponse.data.colorPrimario || '#007bff',
          colorSecundario: colorsResponse.data.colorSecundario || '#6c757d',
          colorFondo: colorsResponse.data.colorFondo || '#ffffff',
          colorTexto: colorsResponse.data.colorTexto || '#000000',
          colorContenedor: colorsResponse.data.colorContenedor || '#ffffff',
          colorContenedorSecundario: colorsResponse.data.colorContenedorSecundario || '#f8f9fa'
        };
        console.log('🎨 Colores del sistema cargados:', systemColors);
        console.log('🎨 Aplicando colores globalmente...');
        setColors(systemColors);
        applyGlobalColors(systemColors);
        console.log('✅ Colores aplicados exitosamente');
      } else {
        console.log('⚠️ No se encontraron colores en la respuesta, usando colores por defecto');
        const defaultColors = {
          colorPrimario: '#007bff',
          colorSecundario: '#6c757d',
          colorFondo: '#ffffff',
          colorTexto: '#000000',
          colorContenedor: '#ffffff',
          colorContenedorSecundario: '#f8f9fa'
        };
        setColors(defaultColors);
        applyGlobalColors(defaultColors);
      }

      // Cargar logo del sistema
      if (colorsResponse?.logo) {
        setLogo({
          logoUrl: colorsResponse.logo.logo_url || '/logo-alcaldia.png',
          logoAlt: colorsResponse.logo.logo_alt || 'Logo Alcaldía'
        });
        applyGlobalLogo({
          logoUrl: colorsResponse.logo.logo_url || '/logo-alcaldia.png',
          logoAlt: colorsResponse.logo.logo_alt || 'Logo Alcaldía'
        });
      }
    } catch (error) {
      console.error('Error cargando configuración del sistema:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyGlobalColors = (newColors: SystemColors) => {
    const root = document.documentElement;
    
    // Aplicar variables CSS globales
    root.style.setProperty('--system-primary', newColors.colorPrimario);
    root.style.setProperty('--system-secondary', newColors.colorSecundario);
    root.style.setProperty('--system-background', newColors.colorFondo);
    root.style.setProperty('--system-text', newColors.colorTexto);
    
    // Aplicar a elementos específicos
    applyColorsToElements(newColors);
  };

  const applyColorsToElements = (newColors: SystemColors) => {
    // Aplicar color de fondo global
    document.body.style.backgroundColor = newColors.colorFondo;
    document.body.style.color = newColors.colorTexto;
    
    // Aplicar a todos los botones primarios (más selectores)
    const primarySelectors = [
      '.btn-primary', '.bg-blue-600', '.bg-blue-500', 
      '[class*="bg-blue-"]:not([class*="bg-blue-50"]):not([class*="bg-blue-100"])',
      'button[class*="primary"]', 'button[class*="blue"]',
      '.bg-primary', '[data-color="primary"]'
    ];
    
    primarySelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.backgroundColor = newColors.colorPrimario;
          element.style.borderColor = newColors.colorPrimario;
          element.style.color = '#ffffff';
        }
      });
    });

    // NO APLICAR color secundario a nada - se mantiene el color original
    // El color secundario no debe afectar ningún elemento

    // Aplicar a sidebar y navegación (más selectores)
    const sidebarSelectors = [
      '.sidebar', '[class*="sidebar"]', '.bg-blue-900', '.bg-gray-900',
      'nav[class*="bg-"]', 'aside[class*="bg-"]', '.navigation',
      '[data-role="sidebar"]', '[data-role="navigation"]'
    ];
    
    sidebarSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.backgroundColor = newColors.colorPrimario;
        }
      });
    });

    // Aplicar color de texto SOLO a elementos de texto, NO a contenedores
    const textSelectors = [
      'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'label', 'a', 'strong', 'em', 'small', 'b', 'i',
      '.text-content', '.text', '[data-text="content"]',
      // Excluir contenedores específicos
      'div:not([class*="container"]):not([class*="card"]):not([class*="panel"]):not([class*="box"])'
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
            element.style.color = newColors.colorTexto;
          }
        }
      });
    });

    console.log('🎨 Colores globales aplicados:', newColors);
  };

  const applyGlobalLogo = (newLogo: SystemLogo) => {
    // Aplicar logo a todos los elementos con clase .system-logo
    const logoElements = document.querySelectorAll('.system-logo, [data-logo="system"]');
    logoElements.forEach(element => {
      if (element instanceof HTMLImageElement) {
        element.src = newLogo.logoUrl;
        element.alt = newLogo.logoAlt;
      }
    });

    console.log('🖼️ Logo global aplicado:', newLogo);
  };

  const updateSystemColors = async (newColors: SystemColors) => {
    try {
      await api.actualizarColores(newColors);
      setColors(newColors);
      applyGlobalColors(newColors);
      return { success: true };
    } catch (error) {
      console.error('Error actualizando colores:', error);
      return { success: false, error };
    }
  };

  const updateSystemLogo = async (newLogo: SystemLogo) => {
    try {
      // Aquí implementarías la API para actualizar el logo
      // await api.actualizarLogo(newLogo);
      setLogo(newLogo);
      applyGlobalLogo(newLogo);
      return { success: true };
    } catch (error) {
      console.error('Error actualizando logo:', error);
      return { success: false, error };
    }
  };

  return {
    colors,
    logo,
    loading,
    updateSystemColors,
    updateSystemLogo,
    loadSystemConfiguration
  };
};
