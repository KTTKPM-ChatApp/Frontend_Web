"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  
  const [currentLanguage, setCurrentLanguage] = useState("vi");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('language');
    if (saved && saved !== "vi") {
      i18n.changeLanguage(saved);
      setCurrentLanguage(saved);
    }
  }, [i18n]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }
  };

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'vi' : 'en';
    changeLanguage(newLang);
  };

  // Sync i18n with localStorage on mount - using useCallback to avoid hydration issues
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
      setCurrentLanguage(savedLanguage);
    }
  }, [i18n]);

  // Listen for language changes from other components
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLanguage(event.detail.language);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
