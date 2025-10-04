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
    const timestamp = Date.now() + Math.random();
    const response = await fetch(`/i18n/locales/${locale}.json?t=${timestamp}&v=${Date.now()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load ${locale} translations: ${response.status} ${response.statusText}`);
    }
    
    const translations = await response.json();
    console.log(`✅ Loaded ${Object.keys(translations).length} translations for ${locale}`);
    console.log(`🔍 Client keys loaded:`, {
      'client.create_ticket': translations['client.create_ticket'],
      'client.fill_form': translations['client.fill_form'],
      'client.chat.title': translations['client.chat.title'],
      'client.form.name': translations['client.form.name'],
      'client.form.location': translations['client.form.location'],
      'client.tracking.complete_history_title': translations['client.tracking.complete_history_title'],
      'client.tracking.current_status': translations['client.tracking.current_status'],
      'client.tracking.showing_events': translations['client.tracking.showing_events']
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
    if (translation === key && (key.startsWith('client.') || key.startsWith('pagination.') || key.startsWith('settings.') || key.startsWith('common.') || key.startsWith('ticket_detail.'))) {
      console.warn(`⚠️ Missing translation for key: ${key}`);
      console.log(`🔍 Available client keys:`, Object.keys(dict).filter(k => k.startsWith('client.')));
      console.log(`🔍 Current locale: ${locale}`);
      console.log(`🔍 Dict size: ${Object.keys(dict).length}`);
    }
    return translation;
  }, [dict, locale]);

  const value = useMemo(() => ({ locale, t, setLocale }), [locale, t, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
