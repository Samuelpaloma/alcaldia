import React, { useEffect } from 'react';
import { useGlobalSystem } from './GlobalSystemProvider';

/**
 * Componente de debug específico para verificar la aplicación de colores
 * en diferentes interfaces (admin, usuario, funcionario)
 */
const ColorApplicationDebugger: React.FC = () => {
  const { colors } = useGlobalSystem();

  useEffect(() => {
    if (!colors) {
      console.log('🔍 [ColorApplicationDebugger] No hay colores disponibles');
      return;
    }

    console.log('🔍 [ColorApplicationDebugger] ===== DIAGNÓSTICO COMPLETO =====');
    console.log('🔍 [ColorApplicationDebugger] Ruta actual:', window.location.pathname);
    console.log('🔍 [ColorApplicationDebugger] Colores recibidos:', colors);
    
    // Verificar variables CSS
    const root = document.documentElement;
    const systemBackground = getComputedStyle(root).getPropertyValue('--system-background');
    const systemPrimary = getComputedStyle(root).getPropertyValue('--system-primary');
    const systemContainer = getComputedStyle(root).getPropertyValue('--system-container');
    
    console.log('🔍 [ColorApplicationDebugger] Variables CSS:');
    console.log('  --system-background:', systemBackground);
    console.log('  --system-primary:', systemPrimary);
    console.log('  --system-container:', systemContainer);
    
    // Verificar estilos aplicados al body
    const bodyStyle = getComputedStyle(document.body);
    console.log('🔍 [ColorApplicationDebugger] Body styles:');
    console.log('  background-color:', bodyStyle.backgroundColor);
    console.log('  color:', bodyStyle.color);
    
    // Verificar elementos principales
    const mainElements = document.querySelectorAll('main, .main-content, .content-area');
    console.log('🔍 [ColorApplicationDebugger] Elementos principales encontrados:', mainElements.length);
    
    mainElements.forEach((element, index) => {
      if (element instanceof HTMLElement) {
        const computedStyle = getComputedStyle(element);
        console.log(`🔍 [ColorApplicationDebugger] Elemento principal ${index + 1}:`, {
          tagName: element.tagName,
          className: element.className,
          backgroundColor: computedStyle.backgroundColor,
          color: computedStyle.color
        });
      }
    });
    
    // Verificar sidebar
    const sidebarElements = document.querySelectorAll('aside, .sidebar, .nav-container');
    console.log('🔍 [ColorApplicationDebugger] Sidebar encontrado:', sidebarElements.length);
    
    sidebarElements.forEach((sidebar, index) => {
      if (sidebar instanceof HTMLElement) {
        const computedStyle = getComputedStyle(sidebar);
        console.log(`🔍 [ColorApplicationDebugger] Sidebar ${index + 1}:`, {
          tagName: sidebar.tagName,
          className: sidebar.className,
          backgroundColor: computedStyle.backgroundColor,
          color: computedStyle.color
        });
      }
    });
    
    // Verificar contenedores
    const containers = document.querySelectorAll('.card, .bg-white, .bg-gray-50, .bg-slate-50');
    console.log('🔍 [ColorApplicationDebugger] Contenedores encontrados:', containers.length);
    
    containers.forEach((container, index) => {
      if (container instanceof HTMLElement) {
        const computedStyle = getComputedStyle(container);
        console.log(`🔍 [ColorApplicationDebugger] Contenedor ${index + 1}:`, {
          tagName: container.tagName,
          className: container.className,
          backgroundColor: computedStyle.backgroundColor,
          color: computedStyle.color
        });
      }
    });
    
    // Verificar botones
    const buttons = document.querySelectorAll('button, .btn');
    console.log('🔍 [ColorApplicationDebugger] Botones encontrados:', buttons.length);
    
    buttons.forEach((button, index) => {
      if (button instanceof HTMLElement) {
        const computedStyle = getComputedStyle(button);
        console.log(`🔍 [ColorApplicationDebugger] Botón ${index + 1}:`, {
          tagName: button.tagName,
          className: button.className,
          backgroundColor: computedStyle.backgroundColor,
          color: computedStyle.color
        });
      }
    });
    
    console.log('🔍 [ColorApplicationDebugger] ===== FIN DIAGNÓSTICO =====');
  }, [colors]);

  return null; // Este componente no renderiza nada
};

export default ColorApplicationDebugger;
