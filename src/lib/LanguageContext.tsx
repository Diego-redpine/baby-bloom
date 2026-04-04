"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { translate, type TranslationKey, type Lang } from "./translations";

const LANG_KEY = "babybloom_lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  hasChosen: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  hasChosen: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [hasChosen, setHasChosen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LANG_KEY) as Lang | null;
    if (stored === "en" || stored === "es") {
      setLangState(stored);
      setHasChosen(true);
    }
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem(LANG_KEY, newLang);
    setHasChosen(true);
  }, []);

  const t = useCallback((key: TranslationKey) => {
    return translate(key, lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, hasChosen }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
