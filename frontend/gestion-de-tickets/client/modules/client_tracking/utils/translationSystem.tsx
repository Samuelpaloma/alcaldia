import { useState, useEffect, useCallback } from 'react';

// 🔥 CONFIGURACIÓN DE TRADUCCIÓN SOLO ES/EN
export const TRANSLATION_CONFIG = {
  APIS: {
    LIBRE_TRANSLATE: 'https://libretranslate.com/translate',
    GOOGLE_TRANSLATE: 'https://translate.googleapis.com/translate_a/single'
  },
  LANGUAGES: {
    'es': { name: 'Español', flag: '🇪🇸', code: 'es' },
    'en': { name: 'English', flag: '🇺🇸', code: 'en' }
  }
};

const translationCache = new Map();
const processedMessages = new Set();

// 🔍 DETECCIÓN DE IDIOMA SOLO ES/EN
export const detectLanguage = (text: string) => {
  if (!text || typeof text !== 'string' || text.trim().length < 2) return 'unknown';
  const cleanText = text.toLowerCase().trim();
  const esWords = ['hola', 'gracias', 'casa', 'agua', 'tiempo', 'vida', 'madre', 'padre', 'hijo', 'hija', 'paz', 'amor', 'como', 'cuando', 'donde', 'que', 'para', 'con', 'sin', 'muy', 'pero', 'bien', 'mal', 'bueno', 'malo', 'grande', 'pequeño', 'nuevo', 'viejo', 'sí', 'no', 'todo', 'nada', 'algo', 'siempre', 'nunca', 'ahora', 'después', 'antes', 'aquí', 'allí'];
  const enWords = ['hello', 'thanks', 'house', 'water', 'time', 'life', 'mother', 'father', 'son', 'daughter', 'peace', 'love', 'how', 'when', 'where', 'that', 'for', 'with', 'without', 'very', 'but', 'good', 'bad', 'big', 'small', 'new', 'old', 'yes', 'no', 'all', 'nothing', 'something', 'always', 'never', 'now', 'after', 'before', 'here', 'there'];
  const esCount = esWords.filter(w => cleanText.includes(w)).length;
  const enCount = enWords.filter(w => cleanText.includes(w)).length;
  if (esCount > enCount) return 'es';
  if (enCount > esCount) return 'en';
  return 'unknown';
};

// 🔄 FUNCIÓN DE TRADUCCIÓN CON LIBRE TRANSLATE
const tryLibreTranslate = async (text: string, targetLang: string) => {
  try {
    const response = await fetch(TRANSLATION_CONFIG.APIS.LIBRE_TRANSLATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'auto',
        target: targetLang,
        format: 'text'
      })
    });
    if (!response.ok) throw new Error(`LibreTranslate error: ${response.status}`);
    const data = await response.json();
    if (data.translatedText && data.translatedText !== text) return data.translatedText;
    return null;
  } catch {
    return null;
  }
};

// 🔄 FUNCIÓN DE TRADUCCIÓN CON GOOGLE
const tryGoogleTranslate = async (text: string, targetLang: string) => {
  try {
    const url = `${TRANSLATION_CONFIG.APIS.GOOGLE_TRANSLATE}?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) throw new Error(`Google error: ${response.status}`);
    const data = await response.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      let translation = '';
      if (Array.isArray(data[0])) {
        translation = data[0].filter(segment => segment && segment[0]).map(segment => segment[0]).join('').trim();
      } else {
        translation = data[0][0][0].trim();
      }
      if (translation && translation.toLowerCase() !== text.toLowerCase()) return translation;
    }
    return null;
  } catch {
    return null;
  }
};

// 🌍 FUNCIÓN PRINCIPAL DE TRADUCCIÓN SOLO ES/EN
export const translateText = async (text: string, targetLang: 'es' | 'en' = 'es') => {
  if (!text || text.trim().length === 0) return null;
  const cleanText = text.trim();
  const cacheKey = `${cleanText}_auto_${targetLang}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);
  const detectedLang = detectLanguage(cleanText);
  if (detectedLang === targetLang) return null;
  try {
    let translation = await tryLibreTranslate(cleanText, targetLang);
    if (!translation) translation = await tryGoogleTranslate(cleanText, targetLang);
    if (translation) {
      const result = {
        original: cleanText,
        translated: translation,
        detectedLang,
        targetLang,
        timestamp: Date.now()
      };
      translationCache.set(cacheKey, result);
      return result;
    }
    return null;
  } catch {
    return null;
  }
};

// 🔧 HOOK DE TRADUCCIÓN SOLO ES/EN
export const useTranslation = () => {
  const [settings, setSettings] = useState({
    enabled: true,
    targetLanguage: 'es',
    showOriginal: true,
    autoDetect: true,
    translateOutgoing: false,
    showOnlyTranslation: false
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('translationSettings', JSON.stringify(settings));
      }
    } catch {}
  }, [settings]);

  const generateMessageId = (message: any) => {
    if (message.id) return message.id;
    return `${message.text}_${message.timestamp || Date.now()}_${message.type || 'unknown'}`;
  };

  const translateMessage = useCallback(async (message: any) => {
    if (!settings.enabled || !message || !message.text) return null;
    const messageId = generateMessageId(message);
    if (processedMessages.has(messageId)) return null;
    const shouldTranslate =
      (message.type === 'remote' || message.type === 'incoming') ||
      (message.type === 'local' || message.type === 'outgoing') && settings.translateOutgoing;
    if (!shouldTranslate) return null;
    try {
      processedMessages.add(messageId);
      const result = await translateText(message.text, settings.targetLanguage as 'es' | 'en');
      if (result) return { messageId, ...result };
      return null;
    } catch {
      processedMessages.delete(messageId);
      return null;
    }
  }, [settings]);

  const clearProcessedMessages = useCallback(() => {
    processedMessages.clear();
    translationCache.clear();
  }, []);

  return {
    settings,
    setSettings,
    translateMessage,
    clearProcessedMessages,
    languages: TRANSLATION_CONFIG.LANGUAGES
  };
};

// 🎨 COMPONENTE DE MENSAJE TRADUCIDO SOLO ES/EN
export const TranslatedMessage = ({ message, settings }: any) => {
  const [translationData, setTranslationData] = useState<any>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const safeSettings = settings || {
    enabled: false,
    targetLanguage: 'es',
    showOriginal: true,
    translateOutgoing: false,
    showOnlyTranslation: false
  };

  useEffect(() => {
    const handleTranslation = async () => {
      if (!safeSettings.enabled || !message?.text) {
        setTranslationData(null);
        return;
      }
      const shouldTranslate =
        (message.type === 'remote' || message.type === 'incoming') ||
        (message.type === 'local' || message.type === 'outgoing') && safeSettings.translateOutgoing;
      if (!shouldTranslate) {
        setTranslationData(null);
        return;
      }
      setIsTranslating(true);
      try {
        const result = await translateText(message.text, safeSettings.targetLanguage as 'es' | 'en');
        setTranslationData(result);
      } catch {
        setTranslationData(null);
      } finally {
        setIsTranslating(false);
      }
    };
    handleTranslation();
  }, [message?.text, safeSettings.enabled, safeSettings.targetLanguage, safeSettings.translateOutgoing, message?.type]);

  if (!safeSettings.enabled || !translationData) {
    return <span>{message?.text || ''}</span>;
  }

  if (isTranslating) {
    return (
      <div className="flex items-center gap-2">
        <span>{message.text}</span>
        <div className="animate-spin rounded-full h-3 w-3 border-b border-current opacity-50"></div>
        <span className="text-xs opacity-50">traduciendo...</span>
      </div>
    );
  }

  if (safeSettings.showOnlyTranslation) {
    return (
      <div>
        <div>{translationData.translated}</div>
        <div className="text-xs opacity-50 flex items-center gap-1 mt-1">
          {TRANSLATION_CONFIG.LANGUAGES[translationData.detectedLang]?.flag} traducido
        </div>
      </div>
    );
  }

  if (safeSettings.showOriginal) {
    return (
      <div className="space-y-1">
        <div className="opacity-75 text-sm">
          {translationData.original}
        </div>
        <div className="border-l-2 border-current border-opacity-40 pl-2 font-medium">
          {translationData.translated}
        </div>
        <div className="text-xs opacity-50 flex items-center gap-1">
          {TRANSLATION_CONFIG.LANGUAGES[translationData.detectedLang]?.flag} → {TRANSLATION_CONFIG.LANGUAGES[translationData.targetLang]?.flag}
        </div>
      </div>
    );
  }

  return <span>{message?.text || ''}</span>;
};

// 🧹 FUNCIONES DE UTILIDAD
export const clearTranslationCache = () => {
  translationCache.clear();
  processedMessages.clear();
};

export const getTranslationCacheSize = () => {
  return {
    cache: translationCache.size,
    processed: processedMessages.size
  };
};

export const translateSingleMessage = async (text: string, targetLang: 'es' | 'en' = 'es') => {
  if (!text) return null;
  const result = await translateText(text, targetLang);
  return result;
};

// 🔧 CONFIGURACIÓN POR DEFECTO SOLO ES/EN
export const DEFAULT_TRANSLATION_SETTINGS = {
  enabled: true,
  targetLanguage: 'es',
  showOriginal: true,
  autoDetect: true,
  translateOutgoing: false,
  showOnlyTranslation: false
};