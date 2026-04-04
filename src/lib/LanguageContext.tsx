"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { translate, type TranslationKey, type Lang } from "./translations";

const LANG_KEY = "babybloom_lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  showPopup: boolean;
  dismissPopup: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  showPopup: false,
  dismissPopup: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [showPopup, setShowPopup] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LANG_KEY) as Lang | null;
    if (stored === "en" || stored === "es") {
      setLangState(stored);
      setLoaded(true);
    } else {
      setLoaded(true);
      // Show popup after 10 seconds if no language chosen
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  }, []);

  const dismissPopup = useCallback((chosenLang: Lang) => {
    setLang(chosenLang);
    setShowPopup(false);
  }, [setLang]);

  const t = useCallback((key: TranslationKey) => {
    return translate(key, lang);
  }, [lang]);

  if (!loaded) return null;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, showPopup, dismissPopup }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
