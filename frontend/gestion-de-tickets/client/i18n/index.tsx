import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "es";

type Dict = Record<string, string>;

type I18nContextType = {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (l: Locale) => void;
};

const I18nContext = createContext<I18nContextType | null>(null);

// Función para cargar las traducciones desde archivos JSON
const loadTranslations = async (locale: Locale): Promise<Dict> => {
  try {
    // Agregar timestamp para evitar caché
    const timestamp = Date.now();
    const response = await fetch(`/i18n/locales/${locale}.json?t=${timestamp}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load ${locale} translations: ${response.status} ${response.statusText}`);
    }
    
    const translations = await response.json();
    console.log(`✅ Loaded ${Object.keys(translations).length} translations for ${locale}`);
    console.log(`🔍 Pagination keys loaded:`, {
      'pagination.showing': translations['pagination.showing'],
      'pagination.to': translations['pagination.to'],
      'pagination.of': translations['pagination.of'],
      'pagination.tickets': translations['pagination.tickets'],
      'pagination.previous': translations['pagination.previous'],
      'pagination.next': translations['pagination.next']
    });
    return translations;
  } catch (error) {
    console.error(`Error loading ${locale} translations:`, error);
    // Fallback a traducciones básicas si falla la carga
    return {
      "brand.name": locale === "es" ? "NEITickets" : "NEITickets",
      "lang": locale === "es" ? "ES" : "EN",
    };
  }
};

const DICTS: Record<Locale, Dict> = {
  en: {},
  es: {}
};

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem("locale") as Locale | null;
    // Forzar español si no hay idioma guardado o si es inválido
    if (!stored || (stored !== "es" && stored !== "en")) {
      localStorage.setItem("locale", "es");
      return "es";
    }
    return stored;
  });

  const [translations, setTranslations] = useState<Dict>({});

  // Cargar traducciones cuando cambie el locale
  useEffect(() => {
    const loadTranslationsForLocale = async () => {
      try {
        const loadedTranslations = await loadTranslations(locale);
        setTranslations(loadedTranslations);
        DICTS[locale] = loadedTranslations;
      } catch (error) {
        console.error(`Error loading translations for ${locale}:`, error);
        // Usar traducciones básicas como fallback
        const fallbackTranslations = {
          "brand.name": "NEITickets",
          "lang": locale === "es" ? "ES" : "EN",
        };
        setTranslations(fallbackTranslations);
        DICTS[locale] = fallbackTranslations;
      }
    };

    loadTranslationsForLocale();
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem("locale", l);
    setLocaleState(l);
  }, []);

  const dict = useMemo(() => translations, [translations]);
  const t = useCallback((key: string) => {
    const translation = dict[key] ?? key;
    if (translation === key && (key.startsWith('pagination.') || key.startsWith('settings.') || key.startsWith('common.') || key.startsWith('ticket_detail.'))) {
      console.warn(`⚠️ Missing translation for key: ${key}`);
      console.log(`🔍 Available keys:`, Object.keys(dict).filter(k => k.includes(key.split('.')[0])));
    }
    return translation;
  }, [dict]);

  const value = useMemo(() => ({ locale, t, setLocale }), [locale, t, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
