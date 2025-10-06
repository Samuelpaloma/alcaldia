import { useEffect, useState } from 'react';
import { api } from '../../shared/api';

interface SystemColors {
  colorPrimario: string;
  colorSecundario: string;
  colorFondo: string;
  colorTexto: string;
}

export const useSystemColors = () => {
  const [colors, setColors] = useState<SystemColors>({
    colorPrimario: '#007bff',
    colorSecundario: '#6c757d',
    colorFondo: '#ffffff',
    colorTexto: '#000000'
  });

  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    try {
      console.log('🔄 Cargando colores del sistema...');
      
      // Intentar cargar colores desde la API (endpoint público)
      const response = await api.getColoresSistema();
      console.log('📡 Respuesta de colores:', response);
      
      if (response.success && response.data) {
        const newColors = {
          colorPrimario: response.data.colorPrimario || '#007bff',
          colorSecundario: response.data.colorSecundario || '#6c757d',
          colorFondo: response.data.colorFondo || '#ffffff',
          colorTexto: response.data.colorTexto || '#000000'
        };
        
        console.log('🎨 Colores cargados:', newColors);
        setColors(newColors);
        applyColors(newColors);
      } else {
        console.log('⚠️ No se pudieron cargar colores, usando por defecto');
        applyColors(colors);
      }
    } catch (error) {
      console.error('❌ Error cargando colores:', error);
      applyColors(colors);
    }
  };

  const applyColors = (newColors: SystemColors) => {
    console.log('🎨 Aplicando colores:', newColors);
    
    // Aplicar variables CSS
    const root = document.documentElement;
    root.style.setProperty('--system-primary', newColors.colorPrimario);
    root.style.setProperty('--system-secondary', newColors.colorSecundario);
    root.style.setProperty('--system-background', newColors.colorFondo);
    root.style.setProperty('--system-text', newColors.colorTexto);

    // Aplicar color de fondo
    document.body.style.backgroundColor = newColors.colorFondo;
    document.body.style.color = newColors.colorTexto;

    // Aplicar a botones primarios
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

    // Aplicar a botones secundarios
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

    // Aplicar a sidebar
    const sidebarElements = document.querySelectorAll(
      'aside, nav, .sidebar, [class*="sidebar"], [data-role="sidebar"]'
    );
    sidebarElements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.backgroundColor = newColors.colorPrimario;
      }
    });

    // Aplicar color de texto
    const textElements = document.querySelectorAll(
      'p, span, div, h1, h2, h3, h4, h5, h6, .text-content, .content'
    );
    textElements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.color = newColors.colorTexto;
      }
    });

    console.log('✅ Colores aplicados exitosamente');
  };

  return { colors, applyColors, loadColors };
};
