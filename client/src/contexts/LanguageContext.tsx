import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type LanguageCode = 'ko' | 'en' | 'vi' | 'th' | 'tl' | 'uz' | 'ne' | 'mn' | 'id' | 'my' | 'zh' | 'ru';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbekcha' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  getLanguageInfo: (code: LanguageCode) => LanguageInfo | undefined;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'koreausimguide_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    // Initialize from localStorage or default to Korean
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.some(lang => lang.code === stored)) {
      return stored as LanguageCode;
    }
    return 'ko';
  });

  const setLanguage = (language: LanguageCode) => {
    setCurrentLanguage(language);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  };

  const getLanguageInfo = (code: LanguageCode): LanguageInfo | undefined => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    getLanguageInfo,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
