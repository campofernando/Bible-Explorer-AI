import { useState, useEffect } from "react";
import { getBibleText, BibleVerse } from "@/constants/bible";

type ApiBibleVerse = {
  id: string;
  orgId: string;
  bookId: string;
  chapterId: string;
  bibleId: string;
  reference: string;
  text?: string;
  content?: string;
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
      .then((data: ApiBibleVerse[] | { error: string }) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: BibleVerse[] = data.map((v, idx) => {
            const parts = v.id?.split(".") ?? [];
            const verseNum = parseInt(parts[parts.length - 1] ?? String(idx + 1), 10);
            return {
              verse: isNaN(verseNum) ? idx + 1 : verseNum,
              text: (v.text ?? v.content ?? "").trim(),
            };
          });
          setState({ verses: mapped, loading: false, error: null, source: "api" });
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
