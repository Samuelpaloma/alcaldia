import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useCallback } from 'react';

export const useTranslation = () => {
  const { t: translate, i18n } = useI18nTranslation();

  const t = useCallback((key: string, options?: any): string => {
    try {
      const result = translate(key, options);
      // Si la traducción no existe, devolver la clave con un prefijo para debug
      if (typeof result !== 'string' || result === key) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      return result;
    } catch (error) {
      console.error(`Error translating key ${key}:`, error);
      return key;
    }
  }, [translate]);

  const changeLanguage = useCallback(async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      return true;
    } catch (error) {
      console.error('Error changing language:', error);
      return false;
    }
  }, [i18n]);

  const getCurrentLanguage = useCallback(() => {
    return i18n.language;
  }, [i18n.language]);

  const getAvailableLanguages = useCallback(() => {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' }
    ];
  }, []);

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    isReady: i18n.isInitialized
  };
};
