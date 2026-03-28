import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Bookmark = {
  book: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  savedAt: string;
};

type BookmarksContextType = {
  bookmarks: Bookmark[];
  addBookmark: (b: Omit<Bookmark, "savedAt">) => void;
  removeBookmark: (book: string, chapter: number, verse: number) => void;
  isBookmarked: (book: string, chapter: number, verse: number) => boolean;
};

const BookmarksContext = createContext<BookmarksContextType>({
  bookmarks: [],
  addBookmark: () => {},
  removeBookmark: () => {},
  isBookmarked: () => false,
});

const STORAGE_KEY = "bible_bookmarks_v1";

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) {
        try {
          setBookmarks(JSON.parse(val));
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((bms: Bookmark[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bms));
  }, []);

  const addBookmark = useCallback((b: Omit<Bookmark, "savedAt">) => {
    setBookmarks((prev) => {
      const exists = prev.some(
        (bm) => bm.book === b.book && bm.chapter === b.chapter && bm.verse === b.verse
      );
      if (exists) return prev;
      const next = [{ ...b, savedAt: new Date().toISOString() }, ...prev];
      persist(next);
      return next;
    });
  }, [persist]);

  const removeBookmark = useCallback((book: string, chapter: number, verse: number) => {
    setBookmarks((prev) => {
      const next = prev.filter(
        (bm) => !(bm.book === book && bm.chapter === chapter && bm.verse === verse)
      );
      persist(next);
      return next;
    });
  }, [persist]);

  const isBookmarked = useCallback((book: string, chapter: number, verse: number) => {
    return bookmarks.some(
      (bm) => bm.book === book && bm.chapter === chapter && bm.verse === verse
    );
  }, [bookmarks]);

  return (
    <BookmarksContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarksContext);
}
