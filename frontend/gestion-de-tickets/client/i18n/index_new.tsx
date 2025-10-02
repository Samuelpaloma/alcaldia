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
    const response = await fetch(`/i18n/locales/${locale}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${locale} translations`);
    }
    return await response.json();
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
  const t = useCallback((key: string) => dict[key] ?? key, [dict]);

  const value = useMemo(() => ({ locale, t, setLocale }), [locale, t, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
