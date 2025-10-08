import { useTranslation } from '../hooks/useTranslation';

/**
 * Procesa el texto de los tickets para traducir claves de traducción que puedan estar embebidas
 * @param text - El texto a procesar
 * @param t - Función de traducción
 * @returns El texto procesado con las claves traducidas
 */
export const processTicketText = (text: string, t: (key: string) => string): string => {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  console.log('🔍 [TEXT_PROCESSOR] Procesando texto original:', text);
  console.log('🔍 [TEXT_PROCESSOR] Función de traducción disponible:', typeof t);
  
  // Probar si las traducciones están disponibles
  const testTranslation = t('client.chat.selected_category');
  console.log('🔍 [TEXT_PROCESSOR] Traducción de prueba:', testTranslation);
  
  let processedText = text;

  // Reemplazos directos y específicos para los casos que vemos en la imagen
  console.log('🔄 [TEXT_PROCESSOR] Aplicando reemplazos específicos...');
  processedText = processedText.replace(/client\.chat\.selected_category\s+hardware/g, `${t('client.chat.selected_category')}: hardware`);
  processedText = processedText.replace(/client\.chat\.message\s+hardware/g, `${t('client.chat.message')}: hardware`);
  
  // Reemplazos generales para cualquier categoría
  processedText = processedText.replace(/client\.chat\.selected_category\s+(\w+)/g, `${t('client.chat.selected_category')}: $1`);
  processedText = processedText.replace(/client\.chat\.message\s+(\w+)/g, `${t('client.chat.message')}: $1`);
  
  // Reemplazos que manejan saltos de línea entre claves
  processedText = processedText.replace(/client\.chat\.selected_category\s*\n\s*client\.chat\.message/g, `${t('client.chat.selected_category')}\n${t('client.chat.message')}`);
  
  // Reemplazos para claves solas (al final)
  processedText = processedText.replace(/client\.chat\.selected_category/g, t('client.chat.selected_category'));
  processedText = processedText.replace(/client\.chat\.message/g, t('client.chat.message'));
  
  console.log('🔄 [TEXT_PROCESSOR] Después de reemplazos básicos:', processedText);
  
  // Reemplazos para otras claves comunes
  processedText = processedText.replace(/client\.chat\.category/g, t('client.chat.category'));
  processedText = processedText.replace(/client\.chat\.title/g, t('client.chat.title'));
  processedText = processedText.replace(/client\.chat\.welcome/g, t('client.chat.welcome'));
  processedText = processedText.replace(/client\.chat\.not_found/g, t('client.chat.not_found'));
  processedText = processedText.replace(/client\.chat\.custom_message/g, t('client.chat.custom_message'));
  processedText = processedText.replace(/client\.chat\.specific_query/g, t('client.chat.specific_query'));
  processedText = processedText.replace(/client\.chat\.placeholder/g, t('client.chat.placeholder'));
  processedText = processedText.replace(/client\.chat\.summary/g, t('client.chat.summary'));
  processedText = processedText.replace(/client\.chat\.problem_description/g, t('client.chat.problem_description'));
  processedText = processedText.replace(/client\.chat\.describe_query/g, t('client.chat.describe_query'));
  processedText = processedText.replace(/client\.chat\.select_area/g, t('client.chat.select_area'));
  processedText = processedText.replace(/client\.chat\.reset/g, t('client.chat.reset'));
  processedText = processedText.replace(/client\.chat\.sending/g, t('client.chat.sending'));
  processedText = processedText.replace(/client\.chat\.success_title/g, t('client.chat.success_title'));
  processedText = processedText.replace(/client\.chat\.success_message/g, t('client.chat.success_message'));
  processedText = processedText.replace(/client\.chat\.accept/g, t('client.chat.accept'));

  // Limpiar líneas vacías múltiples
  processedText = processedText.replace(/\n\s*\n\s*\n/g, '\n\n');

  console.log('✅ [TEXT_PROCESSOR] Texto procesado:', processedText);
  return processedText.trim();
};

/**
 * Hook personalizado para procesar texto de tickets
 */
export const useTicketTextProcessor = () => {
  const { t } = useTranslation();

  const processText = (text: string): string => {
    return processTicketText(text, t);
  };

  return { processText };
};
