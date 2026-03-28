export type BibleBook = {
  id: string;
  name: string;
  abbr: string;
  testament: "Old Testament" | "New Testament";
  chapters: number;
};

export type BibleVerse = {
  verse: number;
  text: string;
};

export const BIBLE_BOOKS: BibleBook[] = [
  { id: "gen", name: "Genesis", abbr: "GEN", testament: "Old Testament", chapters: 50 },
  { id: "exo", name: "Exodus", abbr: "EXO", testament: "Old Testament", chapters: 40 },
  { id: "lev", name: "Leviticus", abbr: "LEV", testament: "Old Testament", chapters: 27 },
  { id: "num", name: "Numbers", abbr: "NUM", testament: "Old Testament", chapters: 36 },
  { id: "deu", name: "Deuteronomy", abbr: "DEU", testament: "Old Testament", chapters: 34 },
  { id: "jos", name: "Joshua", abbr: "JOS", testament: "Old Testament", chapters: 24 },
  { id: "jdg", name: "Judges", abbr: "JDG", testament: "Old Testament", chapters: 21 },
  { id: "rut", name: "Ruth", abbr: "RUT", testament: "Old Testament", chapters: 4 },
  { id: "1sa", name: "1 Samuel", abbr: "1SA", testament: "Old Testament", chapters: 31 },
  { id: "2sa", name: "2 Samuel", abbr: "2SA", testament: "Old Testament", chapters: 24 },
  { id: "1ki", name: "1 Kings", abbr: "1KI", testament: "Old Testament", chapters: 22 },
  { id: "2ki", name: "2 Kings", abbr: "2KI", testament: "Old Testament", chapters: 25 },
  { id: "1ch", name: "1 Chronicles", abbr: "1CH", testament: "Old Testament", chapters: 29 },
  { id: "2ch", name: "2 Chronicles", abbr: "2CH", testament: "Old Testament", chapters: 36 },
  { id: "ezr", name: "Ezra", abbr: "EZR", testament: "Old Testament", chapters: 10 },
  { id: "neh", name: "Nehemiah", abbr: "NEH", testament: "Old Testament", chapters: 13 },
  { id: "est", name: "Esther", abbr: "EST", testament: "Old Testament", chapters: 10 },
  { id: "job", name: "Job", abbr: "JOB", testament: "Old Testament", chapters: 42 },
  { id: "psa", name: "Psalms", abbr: "PSA", testament: "Old Testament", chapters: 150 },
  { id: "pro", name: "Proverbs", abbr: "PRO", testament: "Old Testament", chapters: 31 },
  { id: "ecc", name: "Ecclesiastes", abbr: "ECC", testament: "Old Testament", chapters: 12 },
  { id: "sng", name: "Song of Solomon", abbr: "SNG", testament: "Old Testament", chapters: 8 },
  { id: "isa", name: "Isaiah", abbr: "ISA", testament: "Old Testament", chapters: 66 },
  { id: "jer", name: "Jeremiah", abbr: "JER", testament: "Old Testament", chapters: 52 },
  { id: "lam", name: "Lamentations", abbr: "LAM", testament: "Old Testament", chapters: 5 },
  { id: "eze", name: "Ezekiel", abbr: "EZE", testament: "Old Testament", chapters: 48 },
  { id: "dan", name: "Daniel", abbr: "DAN", testament: "Old Testament", chapters: 12 },
  { id: "hos", name: "Hosea", abbr: "HOS", testament: "Old Testament", chapters: 14 },
  { id: "joe", name: "Joel", abbr: "JOE", testament: "Old Testament", chapters: 3 },
  { id: "amo", name: "Amos", abbr: "AMO", testament: "Old Testament", chapters: 9 },
  { id: "oba", name: "Obadiah", abbr: "OBA", testament: "Old Testament", chapters: 1 },
  { id: "jon", name: "Jonah", abbr: "JON", testament: "Old Testament", chapters: 4 },
  { id: "mic", name: "Micah", abbr: "MIC", testament: "Old Testament", chapters: 7 },
  { id: "nah", name: "Nahum", abbr: "NAH", testament: "Old Testament", chapters: 3 },
  { id: "hab", name: "Habakkuk", abbr: "HAB", testament: "Old Testament", chapters: 3 },
  { id: "zep", name: "Zephaniah", abbr: "ZEP", testament: "Old Testament", chapters: 3 },
  { id: "hag", name: "Haggai", abbr: "HAG", testament: "Old Testament", chapters: 2 },
  { id: "zec", name: "Zechariah", abbr: "ZEC", testament: "Old Testament", chapters: 14 },
  { id: "mal", name: "Malachi", abbr: "MAL", testament: "Old Testament", chapters: 4 },
  { id: "mat", name: "Matthew", abbr: "MAT", testament: "New Testament", chapters: 28 },
  { id: "mar", name: "Mark", abbr: "MAR", testament: "New Testament", chapters: 16 },
  { id: "luk", name: "Luke", abbr: "LUK", testament: "New Testament", chapters: 24 },
  { id: "joh", name: "John", abbr: "JOH", testament: "New Testament", chapters: 21 },
  { id: "act", name: "Acts", abbr: "ACT", testament: "New Testament", chapters: 28 },
  { id: "rom", name: "Romans", abbr: "ROM", testament: "New Testament", chapters: 16 },
  { id: "1co", name: "1 Corinthians", abbr: "1CO", testament: "New Testament", chapters: 16 },
  { id: "2co", name: "2 Corinthians", abbr: "2CO", testament: "New Testament", chapters: 13 },
  { id: "gal", name: "Galatians", abbr: "GAL", testament: "New Testament", chapters: 6 },
  { id: "eph", name: "Ephesians", abbr: "EPH", testament: "New Testament", chapters: 6 },
  { id: "phi", name: "Philippians", abbr: "PHI", testament: "New Testament", chapters: 4 },
  { id: "col", name: "Colossians", abbr: "COL", testament: "New Testament", chapters: 4 },
  { id: "1th", name: "1 Thessalonians", abbr: "1TH", testament: "New Testament", chapters: 5 },
  { id: "2th", name: "2 Thessalonians", abbr: "2TH", testament: "New Testament", chapters: 3 },
  { id: "1ti", name: "1 Timothy", abbr: "1TI", testament: "New Testament", chapters: 6 },
  { id: "2ti", name: "2 Timothy", abbr: "2TI", testament: "New Testament", chapters: 4 },
  { id: "tit", name: "Titus", abbr: "TIT", testament: "New Testament", chapters: 3 },
  { id: "phm", name: "Philemon", abbr: "PHM", testament: "New Testament", chapters: 1 },
  { id: "heb", name: "Hebrews", abbr: "HEB", testament: "New Testament", chapters: 13 },
  { id: "jas", name: "James", abbr: "JAS", testament: "New Testament", chapters: 5 },
  { id: "1pe", name: "1 Peter", abbr: "1PE", testament: "New Testament", chapters: 5 },
  { id: "2pe", name: "2 Peter", abbr: "2PE", testament: "New Testament", chapters: 3 },
  { id: "1jo", name: "1 John", abbr: "1JO", testament: "New Testament", chapters: 5 },
  { id: "2jo", name: "2 John", abbr: "2JO", testament: "New Testament", chapters: 1 },
  { id: "3jo", name: "3 John", abbr: "3JO", testament: "New Testament", chapters: 1 },
  { id: "jud", name: "Jude", abbr: "JUD", testament: "New Testament", chapters: 1 },
  { id: "rev", name: "Revelation", abbr: "REV", testament: "New Testament", chapters: 22 },
];

const SAMPLE_TEXTS: Record<string, Record<number, BibleVerse[]>> = {
  gen: {
    1: [
      { verse: 1, text: "In the beginning God created the heaven and the earth." },
      { verse: 2, text: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters." },
      { verse: 3, text: "And God said, Let there be light: and there was light." },
      { verse: 4, text: "And God saw the light, that it was good: and God divided the light from the darkness." },
      { verse: 5, text: "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day." },
      { verse: 6, text: "And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters." },
      { verse: 7, text: "And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so." },
      { verse: 8, text: "And God called the firmament Heaven. And the evening and the morning were the second day." },
      { verse: 9, text: "And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so." },
      { verse: 10, text: "And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good." },
      { verse: 11, text: "And God said, Let the earth bring forth grass, the herb yielding seed, and the fruit tree yielding fruit after his kind, whose seed is in itself, upon the earth: and it was so." },
      { verse: 12, text: "And the earth brought forth grass, and herb yielding seed after his kind, and the tree yielding fruit, whose seed was in itself, after his kind: and God saw that it was good." },
      { verse: 13, text: "And the evening and the morning were the third day." },
      { verse: 14, text: "And God said, Let there be lights in the firmament of the heaven to divide the day from the night; and let them be for signs, and for seasons, and for days, and years:" },
      { verse: 15, text: "And let them be for lights in the firmament of the heaven to give light upon the earth: and it was so." },
      { verse: 16, text: "And God made two great lights; the greater light to rule the day, and the lesser light to rule the night: he made the stars also." },
      { verse: 17, text: "And God set them in the firmament of the heaven to give light upon the earth," },
      { verse: 18, text: "And to rule over the day and over the night, and to divide the light from the darkness: and God saw that it was good." },
      { verse: 19, text: "And the evening and the morning were the fourth day." },
      { verse: 20, text: "And God said, Let the waters bring forth abundantly the moving creature that hath life, and fowl that may fly above the earth in the open firmament of heaven." },
      { verse: 21, text: "And God created great whales, and every living creature that moveth, which the waters brought forth abundantly, after their kind, and every winged fowl after his kind: and God saw that it was good." },
      { verse: 22, text: "And God blessed them, saying, Be fruitful, and multiply, and fill the waters in the seas, and let fowl multiply in the earth." },
      { verse: 23, text: "And the evening and the morning were the fifth day." },
      { verse: 24, text: "And God said, Let the earth bring forth the living creature after his kind, cattle, and creeping thing, and beast of the earth after his kind: and it was so." },
      { verse: 25, text: "And God made the beast of the earth after his kind, and cattle after their kind, and every thing that creepeth upon the earth after his kind: and God saw that it was good." },
      { verse: 26, text: "And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth." },
      { verse: 27, text: "So God created man in his own image, in the image of God created he him; male and female created he them." },
      { verse: 28, text: "And God blessed them, and God said unto them, Be fruitful, and multiply, and replenish the earth, and subdue it: and have dominion over the fish of the sea, and over the fowl of the air, and over every living thing that moveth upon the earth." },
      { verse: 29, text: "And God said, Behold, I have given you every herb bearing seed, which is upon the face of all the earth, and every tree, in the which is the fruit of a tree yielding seed; to you it shall be for meat." },
      { verse: 30, text: "And to every beast of the earth, and to every fowl of the air, and to every thing that creepeth upon the earth, wherein there is life, I have given every green herb for meat: and it was so." },
      { verse: 31, text: "And God saw every thing that he had made, and, behold, it was very good. And the evening and the morning were the sixth day." },
    ],
  },
  joh: {
    1: [
      { verse: 1, text: "In the beginning was the Word, and the Word was with God, and the Word was God." },
      { verse: 2, text: "The same was in the beginning with God." },
      { verse: 3, text: "All things were made by him; and without him was not any thing made that was made." },
      { verse: 4, text: "In him was life; and the life was the light of men." },
      { verse: 5, text: "And the light shineth in darkness; and the darkness comprehended it not." },
      { verse: 6, text: "There was a man sent from God, whose name was John." },
      { verse: 7, text: "The same came for a witness, to bear witness of the Light, that all men through him might believe." },
      { verse: 8, text: "He was not that Light, but was sent to bear witness of that Light." },
      { verse: 9, text: "That was the true Light, which lighteth every man that cometh into the world." },
      { verse: 10, text: "He was in the world, and the world was made by him, and the world knew him not." },
      { verse: 11, text: "He came unto his own, and his own received him not." },
      { verse: 12, text: "But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name:" },
      { verse: 13, text: "Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God." },
      { verse: 14, text: "And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth." },
    ],
    3: [
      { verse: 1, text: "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:" },
      { verse: 2, text: "The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him." },
      { verse: 3, text: "Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God." },
      { verse: 4, text: "Nicodemus saith unto him, How can a man be born when he is old? can he enter the second time into his mother's womb, and be born?" },
      { verse: 5, text: "Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God." },
      { verse: 6, text: "That which is born of the flesh is flesh; and that which is born of the Spirit is spirit." },
      { verse: 7, text: "Marvel not that I said unto thee, Ye must be born again." },
      { verse: 8, text: "The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh, and whither it goeth: so is every one that is born of the Spirit." },
      { verse: 9, text: "Nicodemus answered and said unto him, How can these things be?" },
      { verse: 10, text: "Jesus answered and said unto him, Art thou a master of Israel, and knowest not these things?" },
      { verse: 11, text: "Verily, verily, I say unto thee, We speak that we do know, and testify that we have seen; and ye receive not our witness." },
      { verse: 12, text: "If I have told you earthly things, and ye believe not, how shall ye believe, if I tell you of heavenly things?" },
      { verse: 13, text: "And no man hath ascended up to heaven, but he that came down from heaven, even the Son of man which is in heaven." },
      { verse: 14, text: "And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:" },
      { verse: 15, text: "That whosoever believeth in him should not perish, but have eternal life." },
      { verse: 16, text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
      { verse: 17, text: "For God sent not his Son into the world to condemn the world; but that the world through him might be saved." },
    ],
  },
  psa: {
    23: [
      { verse: 1, text: "The LORD is my shepherd; I shall not want." },
      { verse: 2, text: "He maketh me to lie down in green pastures: he leadeth me beside the still waters." },
      { verse: 3, text: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake." },
      { verse: 4, text: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me." },
      { verse: 5, text: "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over." },
      { verse: 6, text: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever." },
    ],
    119: Array.from({ length: 176 }, (_, i) => ({
      verse: i + 1,
      text: `[Psalm 119:${i + 1}] Blessed are those who walk in the way of the Lord, keeping his word and seeking him with all their heart.`,
    })),
  },
};

function generateDefaultVerses(bookId: string, chapter: number, book: BibleBook): BibleVerse[] {
  const verseCount = Math.min(25, Math.max(10, Math.floor(Math.random() * 15 + 10)));
  return Array.from({ length: verseCount }, (_, i) => ({
    verse: i + 1,
    text: `[${book.name} ${chapter}:${i + 1}] This passage from ${book.name} chapter ${chapter} verse ${i + 1} contains the sacred text. Open this passage in your favorite Bible app to read the full content, and use the AI assistant to explore its historical context, original language insights, and theological significance.`,
  }));
}

export function getBibleText(bookId: string, chapter: number): BibleVerse[] {
  const bookTexts = SAMPLE_TEXTS[bookId];
  if (bookTexts?.[chapter]) {
    return bookTexts[chapter];
  }
  const book = BIBLE_BOOKS.find((b) => b.id === bookId);
  if (book) {
    return generateDefaultVerses(bookId, chapter, book);
  }
  return [];
}
