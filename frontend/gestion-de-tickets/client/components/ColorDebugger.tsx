import React, { useEffect } from 'react';
import { useGlobalSystem } from './GlobalSystemProvider';

/**
 * Componente de debug para verificar que los colores se están aplicando correctamente
 */
const ColorDebugger: React.FC = () => {
  const { colors } = useGlobalSystem();

  useEffect(() => {
    if (!colors) {
      console.log('🔍 [ColorDebugger] No hay colores disponibles');
      return;
    }

    console.log('🔍 [ColorDebugger] ===== DIAGNÓSTICO DE COLORES =====');
    console.log('🔍 [ColorDebugger] Colores recibidos:', colors);
    
    // Verificar variables CSS
    const root = document.documentElement;
    const systemBackground = getComputedStyle(root).getPropertyValue('--system-background');
    const systemPrimary = getComputedStyle(root).getPropertyValue('--system-primary');
    const systemContainer = getComputedStyle(root).getPropertyValue('--system-container');
    
    console.log('🔍 [ColorDebugger] Variables CSS:');
    console.log('  --system-background:', systemBackground);
    console.log('  --system-primary:', systemPrimary);
    console.log('  --system-container:', systemContainer);
    
    // Verificar estilos aplicados
    const bodyStyle = getComputedStyle(document.body);
    console.log('🔍 [ColorDebugger] Body styles:');
    console.log('  background-color:', bodyStyle.backgroundColor);
    console.log('  color:', bodyStyle.color);
    
    // Verificar elementos principales
    const mainElements = document.querySelectorAll('main, .main-content, .content-area');
    console.log('🔍 [ColorDebugger] Elementos principales encontrados:', mainElements.length);
    
    mainElements.forEach((element, index) => {
      if (element instanceof HTMLElement) {
        const computedStyle = getComputedStyle(element);
        console.log(`🔍 [ColorDebugger] Elemento ${index + 1}:`, {
          tagName: element.tagName,
          className: element.className,
          backgroundColor: computedStyle.backgroundColor,
          color: computedStyle.color
        });
      }
    });
    
    // Verificar contenedores
    const containers = document.querySelectorAll('.card, .bg-white, .bg-gray-50, .bg-slate-50');
    console.log('🔍 [ColorDebugger] Contenedores encontrados:', containers.length);
    
    containers.forEach((container, index) => {
      if (container instanceof HTMLElement) {
        const computedStyle = getComputedStyle(container);
        console.log(`🔍 [ColorDebugger] Contenedor ${index + 1}:`, {
          tagName: container.tagName,
          className: container.className,
          backgroundColor: computedStyle.backgroundColor,
          color: computedStyle.color
        });
      }
    });
    
    console.log('🔍 [ColorDebugger] ===== FIN DIAGNÓSTICO =====');
  }, [colors]);

  return null; // Este componente no renderiza nada
};

export default ColorDebugger;
