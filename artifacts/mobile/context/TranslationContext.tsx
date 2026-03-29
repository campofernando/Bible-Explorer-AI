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
    id: "de4e12af7f28f599-01",
    name: "King James (Authorised) Version",
    abbreviation: "KJV",
    abbreviationLocal: "KJV",
    language: { id: "eng", name: "English", nameLocal: "English" },
  },
  {
    id: "3e2eb613d45e131e-01",
    name: "New International Version (Anglicized) 2011",
    abbreviation: "NIV",
    abbreviationLocal: "NIV",
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
    id: "9879dbb7cfe39e4d-01",
    name: "World English Bible",
    abbreviation: "WEB",
    abbreviationLocal: "WEB",
    language: { id: "eng", name: "English", nameLocal: "English" },
  },
  {
    id: "179568874c45066f-01",
    name: "Douay-Rheims American 1899",
    abbreviation: "DRA",
    abbreviationLocal: "DRA",
    language: { id: "eng", name: "English", nameLocal: "English" },
  },
  {
    id: "d63894c8d9a7a503-01",
    name: "Biblia Livre Para Todos",
    abbreviation: "BLT",
    abbreviationLocal: "BLT",
    language: { id: "por", name: "Portuguese", nameLocal: "Português" },
  },
  {
    id: "41a6caa722a21d88-01",
    name: "Bíblia Sagrada, Nova Versão Transformadora",
    abbreviation: "NVT",
    abbreviationLocal: "NVT",
    language: { id: "por", name: "Portuguese", nameLocal: "Português" },
  },
  {
    id: "592420522e16049f-01",
    name: "Reina Valera 1909",
    abbreviation: "RVR09",
    abbreviationLocal: "RVR09",
    language: { id: "spa", name: "Spanish", nameLocal: "Español" },
  },
  {
    id: "826f63861180e056-01",
    name: "Nueva Traducción Viviente",
    abbreviation: "NTV",
    abbreviationLocal: "NTV",
    language: { id: "spa", name: "Spanish", nameLocal: "Español" },
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
