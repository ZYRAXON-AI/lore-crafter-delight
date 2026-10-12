export type CommunityChapter = { title: string; paragraphs: string[] };

export type CommunityBook = {
  slug: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  language: string;
  coverUrl: string;
  pdfUrl: string;
  hasText: boolean;
  sourceFile: string;
  chapters: CommunityChapter[];
};

export const COMMUNITY_GENRES = [
  "ভূত",
  "প্রেম",
  "রহস্য",
  "ফ্যান্টাসি",
  "অভিযান",
  "বিজ্ঞান কল্পকাহিনি",
  "হরর-রোম্যান্স",
  "হাস্যরস",
  "সামাজিক",
  "অন্যান্য",
] as const;

// A submission folder may name its files as it likes; these are the names the
// system looks for first, and meta.json can also point at a custom name.
export const META_FILE_CANDIDATES = ["meta.json", "metadata.json", "book.json"] as const;
export const BOOK_FILE_CANDIDATES = [
  "book.txt",
  "book.md",
  "manuscript.txt",
  "book.epub",
  "book.pdf",
] as const;
export const COVER_CANDIDATES = [
  "cover.svg",
  "cover.png",
  "cover.jpg",
  "cover.jpeg",
  "cover.webp",
  "cover.gif",
  "icon.svg",
  "icon.png",
  "icon.jpg",
] as const;

const TEXT_EXTENSIONS = [".txt", ".md"];

export function normalizeParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter((block) => block.length > 0);
}

const HEADING =
  /^\s*(?:#{1,3}\s*)?(?:chapter|অধ্যায়|অধ্যায়\s*নং)\s*([0-9০-৯ivxlc]+)?\s*[:.-]?\s*(.*)$/i;

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const bnNumber = (value: number) => String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);

// Splits a manuscript into chapters on "Chapter N" / "অধ্যায় N" headings.
// Any prose before the first heading becomes an intro chapter so text is never lost.
export function splitChapters(text: string): CommunityChapter[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const chapters: { title: string; lines: string[] }[] = [];
  let current: { title: string; lines: string[] } = { title: "", lines: [] };

  for (const line of lines) {
    const match = line.match(HEADING);
    if (match) {
      if (current.lines.join("\n").trim()) chapters.push(current);
      const label = (match[2] ?? "").trim();
      current = { title: label || line.trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.join("\n").trim()) chapters.push(current);

  return chapters
    .map((chapter, index) => ({
      title: chapter.title || `অংশ ${bnNumber(index + 1)}`,
      paragraphs: normalizeParagraphs(chapter.lines.join("\n")),
    }))
    .filter((chapter) => chapter.paragraphs.length > 0);
}

export function pickFirst(
  names: readonly string[],
  candidates: readonly string[],
): string | undefined {
  return candidates.find((candidate) => names.includes(candidate));
}

export function isTextFile(name: string): boolean {
  const lower = name.toLowerCase();
  return TEXT_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

// Folder names are ASCII slugs; the fallback title simply reads them back as
// words so a folder with no meta.json still gets a sensible heading.
export function titleFromSlug(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .trim();
}

// A short list of topic words per genre; the manuscript is only scanned once,
// and an unknown topic falls back to "অন্যান্য" rather than guessing wildly.
const GENRE_HINTS: [string, string[]][] = [
  ["ভূত", ["ভূত", "অশরীরী", "প্রেত", "আত্মা", "ছায়া", "ভয়", "কবর"]],
  ["প্রেম", ["ভালোবাসা", "প্রেম", "হৃদয়", "চুম্বন", "বিরহ", "প্রণয়"]],
  ["রহস্য", ["রহস্য", "গোয়েন্দা", "তদন্ত", "খুন", "সূত্র", "অপরাধ"]],
  ["ফ্যান্টাসি", ["জাদু", "মন্ত্র", "জাদুকর", "ড্রাগন", "রাজ্য", "রাজা"]],
  ["অভিযান", ["অভিযান", "যাত্রা", "জাহাজ", "পাহাড়", "সাগর", "দ্বীপ"]],
  ["বিজ্ঞান কল্পকাহিনি", ["রোবট", "মহাকাশ", "যন্ত্র", "ভবিষ্যৎ", "বিজ্ঞান", "গ্রহ"]],
  ["হরর-রোম্যান্স", ["রক্ত", "অমর", "ভ্যাম্পায়ার", "অভিশাপ"]],
  ["হাস্যরস", ["হাসি", "মজার", "হাস্যরস", "রসিক", "ঠাট্টা", "মজা"]],
  ["সামাজিক", ["গরিব", "দারিদ্র্য", "গ্রাম", "সমাজ", "শ্রমিক", "কৃষক"]],
];

export function inferGenre(text: string): string {
  const scored = GENRE_HINTS.map(([genre, hints]) => {
    const score = hints.reduce((total, hint) => total + (text.split(hint).length - 1), 0);
    return { genre, score };
  }).sort((a, b) => b.score - a.score);
  return scored[0] && scored[0].score > 0 ? scored[0].genre : "অন্যান্য";
}

// Fills in whatever meta.json left out, so a submission may ship only a
// manuscript and still appear with a title, author, genre and blurb.
export function deriveMeta(
  slug: string,
  raw: Record<string, unknown>,
  text: string,
): { title: string; author: string; genre: string; description: string; language: string } {
  const field = (key: string) => String(raw[key] ?? "").trim();
  const stripped = text.replace(HEADING, "").trim();
  const firstLine = stripped.split("\n").find((line) => line.trim().length > 0) ?? "";

  const title = field("title") || firstLine.slice(0, 90).trim() || titleFromSlug(slug);
  const author = field("author") || field("writer") || "নাম না জানা লেখক";
  const genre = field("genre") || inferGenre(text);
  const description =
    field("description") || field("blurb") || `${normalizeParagraphs(text)[0] ?? ""}`.slice(0, 260);
  const language = field("language") || field("lang") || "বাংলা";

  return {
    title,
    author,
    genre,
    description: description || `${author} লিখিত একটি বই।`,
    language,
  };
}
