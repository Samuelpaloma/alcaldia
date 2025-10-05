// Utilidad para aplicar colores del sistema a elementos existentes
export const applySystemColorsToElements = (colors: { colorPrimario: string; colorSecundario: string; colorFondo: string }) => {
  console.log('🎨 Aplicando colores del sistema a elementos existentes:', colors);

  // Aplicar colores a botones primarios
  const primaryButtons = document.querySelectorAll('.bg-blue-600, .bg-blue-500, [class*="bg-blue-"], .btn-primary');
  primaryButtons.forEach(button => {
    if (button instanceof HTMLElement) {
      button.style.backgroundColor = colors.colorPrimario;
      button.style.borderColor = colors.colorPrimario;
    }
  });

  // Aplicar colores a botones secundarios
  const secondaryButtons = document.querySelectorAll('.bg-gray-600, .bg-gray-500, [class*="bg-gray-"], .btn-secondary');
  secondaryButtons.forEach(button => {
    if (button instanceof HTMLElement) {
      button.style.backgroundColor = colors.colorSecundario;
      button.style.borderColor = colors.colorSecundario;
    }
  });

  // Aplicar colores a elementos de texto primario
  const primaryTexts = document.querySelectorAll('.text-blue-600, .text-blue-500, [class*="text-blue-"], .text-primary');
  primaryTexts.forEach(text => {
    if (text instanceof HTMLElement) {
      text.style.color = colors.colorPrimario;
    }
  });

  // Aplicar colores a elementos de texto secundario
  const secondaryTexts = document.querySelectorAll('.text-gray-600, .text-gray-500, [class*="text-gray-"], .text-secondary');
  secondaryTexts.forEach(text => {
    if (text instanceof HTMLElement) {
      text.style.color = colors.colorSecundario;
    }
  });

  // Aplicar colores a fondos
  const backgrounds = document.querySelectorAll('.bg-blue-50, .bg-blue-100, [class*="bg-blue-"]');
  backgrounds.forEach(bg => {
    if (bg instanceof HTMLElement) {
      bg.style.backgroundColor = colors.colorFondo;
    }
  });

  // Aplicar colores a la sidebar
  const sidebar = document.querySelector('.sidebar, [class*="sidebar"], .bg-blue-900, .bg-gray-900');
  if (sidebar instanceof HTMLElement) {
    sidebar.style.backgroundColor = colors.colorPrimario;
  }

  // Aplicar colores a elementos activos
  const activeElements = document.querySelectorAll('.active, [class*="active"], .bg-blue-700');
  activeElements.forEach(element => {
    if (element instanceof HTMLElement) {
      element.style.backgroundColor = colors.colorPrimario;
    }
  });

  // Aplicar colores a bordes
  const borders = document.querySelectorAll('.border-blue-600, .border-blue-500, [class*="border-blue-"]');
  borders.forEach(border => {
    if (border instanceof HTMLElement) {
      border.style.borderColor = colors.colorPrimario;
    }
  });

  console.log('✅ Colores del sistema aplicados a elementos existentes');
};

// Función para aplicar colores a elementos específicos de la interfaz de tickets
export const applyColorsToTicketsInterface = (colors: { colorPrimario: string; colorSecundario: string; colorFondo: string }) => {
  console.log('🎨 Aplicando colores a la interfaz de tickets:', colors);

  // Aplicar colores a las tarjetas de resumen
  const summaryCards = document.querySelectorAll('.bg-blue-600, .bg-yellow-500, .bg-green-500, .bg-gray-500');
  summaryCards.forEach((card, index) => {
    if (card instanceof HTMLElement) {
      switch (index) {
        case 0: // Total Tickets
          card.style.backgroundColor = colors.colorPrimario;
          break;
        case 1: // Pendientes
          card.style.backgroundColor = colors.colorSecundario;
          break;
        case 2: // Asignados
          card.style.backgroundColor = colors.colorPrimario;
          break;
        case 3: // Resueltos
          card.style.backgroundColor = colors.colorSecundario;
          break;
      }
    }
  });

  // Aplicar colores a los botones de acción
  const actionButtons = document.querySelectorAll('button[class*="bg-blue-"], button[class*="bg-red-"]');
  actionButtons.forEach(button => {
    if (button instanceof HTMLElement) {
      if (button.textContent?.includes('Asignar') || button.textContent?.includes('Ver')) {
        button.style.backgroundColor = colors.colorPrimario;
      } else if (button.textContent?.includes('Escalar')) {
        button.style.backgroundColor = colors.colorSecundario;
      }
    }
  });

  // Aplicar colores a los tags de categoría
  const categoryTags = document.querySelectorAll('[class*="bg-gray-"], [class*="bg-blue-"]');
  categoryTags.forEach(tag => {
    if (tag instanceof HTMLElement) {
      if (tag.textContent?.includes('hardware')) {
        tag.style.backgroundColor = colors.colorSecundario;
      } else if (tag.textContent?.includes('software')) {
        tag.style.backgroundColor = colors.colorPrimario;
      }
    }
  });

  console.log('✅ Colores aplicados a la interfaz de tickets');
};
