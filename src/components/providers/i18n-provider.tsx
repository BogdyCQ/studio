"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';

type I18nContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
};

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState('nl');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load ${language}.json`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Fallback to English if the default language fails
        if (language !== 'en') {
          setLanguage('en');
        }
      }
    };
    fetchTranslations();
  }, [language]);

  const t = (key: string) => {
    return translations[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};
