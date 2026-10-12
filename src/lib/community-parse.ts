export type CommunityChapter = { title: string; paragraphs: string[] };

export type CommunityBook = {
  slug: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  language: string;
  coverUrl: string;
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
] as const;

export const BOOK_FILE_CANDIDATES = ["book.txt", "book.md", "book.pdf"] as const;
export const COVER_CANDIDATES = ["cover.jpg", "cover.jpeg", "cover.png", "cover.webp"] as const;
export const REQUIRED_FIELDS = ["title", "author", "genre", "description"] as const;

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
