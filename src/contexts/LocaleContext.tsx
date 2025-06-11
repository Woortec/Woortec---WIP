'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '@/messages/en.json';
import es from '@/messages/es.json';

type Locale = 'en' | 'es';
const allMessages = { en, es };

interface Props {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<Props>({
  locale: 'en',
  setLocale: () => {},
  t: (k) => k
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('locale');
    if (saved === 'en' || saved === 'es') setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
  };

  const t = (key: string) => {
    const parts = key.split('.');
    let msg: any = allMessages[locale];
    for (const p of parts) {
      msg = msg?.[p];
      if (msg == null) return key;
    }
    return msg;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
