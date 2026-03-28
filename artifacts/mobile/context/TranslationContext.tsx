import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type BibleTranslation = {
  id: string;
  name: string;
  abbreviation: string;
  abbreviationLocal: string;
  language: {
    id: string;
    name: string;
    nameLocal: string;
    scriptDirection?: string;
  };
  description?: string;
};

const POPULAR_TRANSLATIONS: BibleTranslation[] = [
  {
    id: "de4e12af7f28f599-02",
    name: "King James Version",
    abbreviation: "KJV",
    abbreviationLocal: "KJV",
    language: { id: "eng", name: "English", nameLocal: "English" },
  },
  {
    id: "06125adad2d5898a-01",
    name: "American Standard Version",
    abbreviation: "ASV",
    abbreviationLocal: "ASV",
    language: { id: "eng", name: "English", nameLocal: "English" },
  },
  {
    id: "9879dbb7cfe39e4d-04",
    name: "World English Bible",
    abbreviation: "WEB",
    abbreviationLocal: "WEB",
    language: { id: "eng", name: "English", nameLocal: "English" },
  },
  {
    id: "55212e3cf5d04d49-01",
    name: "Berean Standard Bible",
    abbreviation: "BSB",
    abbreviationLocal: "BSB",
    language: { id: "eng", name: "English", nameLocal: "English" },
  },
];

const DEFAULT_TRANSLATION = POPULAR_TRANSLATIONS[0];
const STORAGE_KEY = "bible_translation_v1";

type TranslationContextType = {
  translation: BibleTranslation;
  setTranslation: (t: BibleTranslation) => void;
  popularTranslations: BibleTranslation[];
};

const TranslationContext = createContext<TranslationContextType>({
  translation: DEFAULT_TRANSLATION,
  setTranslation: () => {},
  popularTranslations: POPULAR_TRANSLATIONS,
});

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [translation, setTranslationState] = useState<BibleTranslation>(DEFAULT_TRANSLATION);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) {
        try {
          setTranslationState(JSON.parse(val));
        } catch {}
      }
    });
  }, []);

  const setTranslation = useCallback((t: BibleTranslation) => {
    setTranslationState(t);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  }, []);

  return (
    <TranslationContext.Provider
      value={{ translation, setTranslation, popularTranslations: POPULAR_TRANSLATIONS }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}
