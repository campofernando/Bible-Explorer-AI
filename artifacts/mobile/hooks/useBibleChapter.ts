import { useState, useEffect } from "react";
import { getBibleText, BibleVerse } from "@/constants/bible";

type ApiVerse = {
  verse: number;
  text: string;
};

type State = {
  verses: BibleVerse[];
  loading: boolean;
  error: string | null;
  source: "api" | "sample";
};

export function useBibleChapter(
  bookId: string,
  chapter: number,
  bibleId: string,
  apiBase: string
): State {
  const [state, setState] = useState<State>({
    verses: getBibleText(bookId, chapter),
    loading: false,
    error: null,
    source: "sample",
  });

  useEffect(() => {
    if (!bookId || !chapter || !bibleId || !apiBase) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const bookIdUpper = bookId.toUpperCase();
    const chapterIdForApi = `${bookIdUpper}.${chapter}`;

    fetch(`${apiBase}/api/bible/bibles/${bibleId}/chapters/${chapterIdForApi}/verses`)
      .then((r) => r.json())
      .then((data: ApiVerse[] | { error: string }) => {
        if (Array.isArray(data) && data.length > 0) {
          setState({ verses: data, loading: false, error: null, source: "api" });
        } else if (!Array.isArray(data) && data.error) {
          throw new Error(data.error);
        } else {
          setState({
            verses: getBibleText(bookId, chapter),
            loading: false,
            error: null,
            source: "sample",
          });
        }
      })
      .catch((err) => {
        setState({
          verses: getBibleText(bookId, chapter),
          loading: false,
          error: err.message,
          source: "sample",
        });
      });
  }, [bookId, chapter, bibleId, apiBase]);

  return state;
}
