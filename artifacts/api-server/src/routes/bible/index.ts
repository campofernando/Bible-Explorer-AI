import { Router, type IRouter } from "express";

const router: IRouter = Router();

const BIBLE_API_BASE = "https://rest.api.bible/v1";

function getBibleApiKey(): string {
  return process.env.BIBLE_API_KEY ?? "";
}

async function bibleApiFetch(path: string) {
  const key = getBibleApiKey();
  const res = await fetch(`${BIBLE_API_BASE}${path}`, {
    headers: { "api-key": key },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bible API error ${res.status}: ${text}`);
  }
  return res.json();
}

function parseVerseContent(content: string): { verse: number; text: string }[] {
  const verses: { verse: number; text: string }[] = [];
  const regex = /\[(\d+)\]\s*([\s\S]*?)(?=\[\d+\]|$)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const verseNum = parseInt(match[1], 10);
    const text = match[2].replace(/\s+/g, " ").trim();
    if (text) {
      verses.push({ verse: verseNum, text });
    }
  }
  return verses;
}

router.get("/bibles", async (req, res) => {
  try {
    const language = req.query.language as string | undefined;
    const path = language ? `/bibles?language=${language}` : "/bibles";
    const data = await bibleApiFetch(path);
    const bibles = (data.data ?? []).map((b: any) => ({
      id: b.id,
      name: b.name,
      nameLocal: b.nameLocal,
      abbreviation: b.abbreviation,
      abbreviationLocal: b.abbreviationLocal,
      language: {
        id: b.language?.id,
        name: b.language?.name,
        nameLocal: b.language?.nameLocal,
        script: b.language?.script,
        scriptDirection: b.language?.scriptDirection,
      },
      description: b.description,
    }));
    res.json(bibles);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to fetch Bibles" });
  }
});

router.get("/bibles/:bibleId/chapters/:chapterId/verses", async (req, res) => {
  try {
    const { bibleId, chapterId } = req.params;
    const data = await bibleApiFetch(
      `/bibles/${bibleId}/chapters/${chapterId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`
    );
    const content: string = data.data?.content ?? "";
    const verses = parseVerseContent(content);
    res.json(verses);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to fetch verses" });
  }
});

export default router;
