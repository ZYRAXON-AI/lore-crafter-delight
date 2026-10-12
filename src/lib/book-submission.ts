import { COMMUNITY_GENRES } from "./community-parse";

// Shape of a book payload sent by any agent or person to POST /api/books.
// `book` may be either plain text (split into chapters) or an already split
// chapter list; everything else becomes the submission's meta.json.
export type BookPayload = {
  slug?: string;
  title?: string;
  author?: string;
  genre?: string;
  description?: string;
  language?: string;
  coverUrl?: string;
  book?: string;
  chapters?: { title?: string; paragraphs?: string[] }[];
};

export type ValidatedSubmission = {
  slug: string;
  meta: {
    title: string;
    author: string;
    genre: string;
    description: string;
    cover_url: string;
    language: string;
  };
  bookText: string;
  chapterCount: number;
  wordCount: number;
};

const MAX_TEXT = 400_000;
const MAX_FIELD = 400;

export class SubmissionError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "SubmissionError";
    this.status = status;
  }
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Bangla titles become ASCII slugs for the submission folder name.
const TRANSLIT: [string, string][] = [
  ["অ", "o"],
  ["আ", "a"],
  ["ই", "i"],
  ["ঈ", "i"],
  ["উ", "u"],
  ["ঊ", "u"],
  ["এ", "e"],
  ["ঐ", "oi"],
  ["ও", "o"],
  ["ঔ", "ou"],
  ["ক", "k"],
  ["খ", "kh"],
  ["গ", "g"],
  ["ঘ", "gh"],
  ["ঙ", "ng"],
  ["চ", "ch"],
  ["ছ", "chh"],
  ["জ", "j"],
  ["ঝ", "jh"],
  ["ঞ", "n"],
  ["ট", "t"],
  ["ঠ", "th"],
  ["ড", "d"],
  ["ঢ", "dh"],
  ["ণ", "n"],
  ["ত", "t"],
  ["থ", "th"],
  ["দ", "d"],
  ["ধ", "dh"],
  ["ন", "n"],
  ["প", "p"],
  ["ফ", "ph"],
  ["ব", "b"],
  ["ভ", "bh"],
  ["ম", "m"],
  ["য", "j"],
  ["র", "r"],
  ["ল", "l"],
  ["শ", "sh"],
  ["ষ", "sh"],
  ["স", "s"],
  ["হ", "h"],
  ["ড়", "r"],
  ["ঢ়", "r"],
  ["য়", "y"],
  ["ং", "ng"],
  ["ঃ", "h"],
  ["ঁ", "n"],
  ["া", "a"],
  ["ি", "i"],
  ["ী", "i"],
  ["ু", "u"],
  ["ূ", "u"],
  ["ৃ", "ri"],
  ["ে", "e"],
  ["ৈ", "oi"],
  ["ো", "o"],
  ["ৌ", "ou"],
  ["্", ""],
];
const TRANSLIT_MAP = new Map(TRANSLIT);

export function slugify(title: string): string {
  const ascii = [...title]
    .map((char) => TRANSLIT_MAP.get(char) ?? char)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii || "book";
}

function clean(value: unknown, max = MAX_FIELD): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

// Accepts both a manuscript string and a chapter array, and always produces the
// plain-text form the submission folder stores, so downstream code sees one shape.
function normalizeBook(payload: BookPayload): { text: string; chapters: number } {
  if (typeof payload.book === "string" && payload.book.trim()) {
    const text = payload.book.replace(/\r\n/g, "\n").trim();
    if (text.length > MAX_TEXT) {
      throw new SubmissionError("বইয়ের লেখা অনেক বড় (সর্বোচ্চ ৪,০০,০০০ অক্ষর)।", 413);
    }
    const chapters = (text.match(/(?:^|\n)\s*(?:অধ্যায়|chapter)/gi) ?? []).length;
    return { text, chapters: Math.max(chapters, 1) };
  }

  if (Array.isArray(payload.chapters) && payload.chapters.length > 0) {
    const lines: string[] = [];
    payload.chapters.forEach((chapter, index) => {
      lines.push(`অধ্যায় ${index + 1}: ${clean(chapter.title) || `অংশ ${index + 1}`}`);
      lines.push("");
      for (const paragraph of chapter.paragraphs ?? []) {
        const text = clean(paragraph, 20_000);
        if (text) lines.push(text, "");
      }
    });
    const text = lines.join("\n").trim();
    if (text.length > MAX_TEXT) {
      throw new SubmissionError("বইয়ের লেখা অনেক বড় (সর্বোচ্চ ৪,০০,০০০ অক্ষর)।", 413);
    }
    return { text, chapters: payload.chapters.length };
  }

  throw new SubmissionError("payload-এ `book` (টেক্সট) বা `chapters` (তালিকা) দিতে হবে।");
}

export function validateSubmission(payload: BookPayload): ValidatedSubmission {
  const title = clean(payload.title);
  const author = clean(payload.author);
  const genre = clean(payload.genre);
  const description = clean(payload.description, 1200);
  const language = clean(payload.language) || "বাংলা";

  const missing = [
    ["title", title],
    ["author", author],
    ["genre", genre],
    ["description", description],
  ]
    .filter(([, value]) => !value)
    .map(([field]) => field);
  if (missing.length) {
    throw new SubmissionError(`এই ঘরগুলো দরকার: ${missing.join(", ")}।`);
  }

  if (!(COMMUNITY_GENRES as readonly string[]).includes(genre)) {
    throw new SubmissionError(`ঘরানা হতে হবে: ${COMMUNITY_GENRES.join(", ")}।`);
  }

  const { text, chapters } = normalizeBook(payload);
  const words = countWords(text);
  if (words < 200) {
    throw new SubmissionError("বইটি খুব ছোট—কমপক্ষে ২০০ শব্দ দিন।");
  }

  const slug = payload.slug && SLUG.test(payload.slug) ? payload.slug : slugify(title);

  return {
    slug,
    meta: {
      title,
      author,
      genre,
      description,
      cover_url: clean(payload.coverUrl, 500),
      language,
    },
    bookText: text,
    chapterCount: chapters,
    wordCount: words,
  };
}
