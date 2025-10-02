import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useCallback } from 'react';

export const useTranslation = () => {
  const { t: translate, i18n } = useI18nTranslation();

  const t = useCallback((key: string, options?: any): string => {
    const result = translate(key, options);
    return typeof result === 'string' ? result : key;
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
