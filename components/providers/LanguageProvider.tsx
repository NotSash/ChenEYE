"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import en, { type Dictionary } from "@/lib/i18n/en";
import ta from "@/lib/i18n/ta";
import hi from "@/lib/i18n/hi";

type Language = "en" | "ta" | "hi";

const dictionaries: Record<Language, Dictionary> = { en, ta, hi };

const languageLabels: Record<Language, string> = { en: "English", ta: "தமிழ்", hi: "हिन्दी" };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Dictionary;
  labels: typeof languageLabels;
  languages: Language[];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("cheneye-language") as Language) || "en";
    }
    return "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("cheneye-language", lang);
    document.documentElement.setAttribute("lang", lang);
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: dictionaries[language],
        labels: languageLabels,
        languages: ["en", "ta", "hi"],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
