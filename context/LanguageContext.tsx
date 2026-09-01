'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any; // Επιτρέπει και function call t('key') και direct access t.key
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as Language;
    if (saved && ['en', 'el', 'de', 'fr', 'it'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
  };

  // Φτιάχνουμε ένα helper function που λειτουργεί και σαν function t('key') ΚΑΙ σαν object t.key
  const currentTranslations = translations[language] || translations['en'];
  
  const tFunction = (key: string, fallback?: string) => {
    return (currentTranslations as any)[key] || fallback || key;
  };

  // Προσθέτουμε τα keys πάνω στη συνάρτηση
  Object.assign(tFunction, currentTranslations);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: tFunction }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};