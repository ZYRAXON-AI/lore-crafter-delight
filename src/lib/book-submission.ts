import { deriveMeta } from "./community-parse";

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
  coverFile: { name: string; content: string } | null;
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

// Every published book must carry a cover, so API submissions that do not send
// a cover_url get a generated SVG title card instead of arriving bare.
const COVER_PALETTE = [
  ["#3b2f63", "#c9a24b"],
  ["#243b55", "#7fb3d5"],
  ["#5a3d2b", "#e0b27a"],
  ["#2f4858", "#86b8a1"],
  ["#4a2545", "#d98ca0"],
  ["#2b2b2b", "#b0b0b0"],
];

function hashString(value: string): number {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function makeCoverSvg(title: string, author: string, genre: string): string {
  const [c1, c2] = COVER_PALETTE[hashString(title) % COVER_PALETTE.length] as [string, string];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="320" height="512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="320" height="512" fill="url(#g)"/>
  <circle cx="250" cy="90" r="70" fill="#ffffff" opacity="0.08"/>
  <circle cx="60" cy="430" r="90" fill="#000000" opacity="0.12"/>
  <text x="32" y="150" fill="#ffffff" opacity="0.8" font-family="sans-serif" font-size="15">${escapeXml(genre)}</text>
  <text x="32" y="300" fill="#ffffff" font-family="serif" font-size="30" font-weight="700">${escapeXml(title)}</text>
  <rect x="32" y="322" width="70" height="3" fill="#ffffff" opacity="0.7"/>
  <text x="32" y="356" fill="#ffffff" opacity="0.75" font-family="sans-serif" font-size="14">${escapeXml(author)}</text>
</svg>
`;
}

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
  const language = clean(payload.language) || "";

  const { text, chapters } = normalizeBook(payload);
  const words = countWords(text);
  if (words < 200) {
    throw new SubmissionError("বইটি খুব ছোট—কমপক্ষে ২০০ শব্দ দিন।");
  }

  const slug = payload.slug && SLUG.test(payload.slug) ? payload.slug : slugify(title || text);

  // Anything the payload left out is derived from the manuscript, so a caller
  // may POST only text and still get a complete, publishable meta.json.
  const meta = deriveMeta(slug, { title, author, genre, description, language }, text);

  // A cover is compulsory. When the caller sends a cover_url we keep it; when
  // they post a data-URL image we commit it as the folder's cover; otherwise we
  // generate a title-card SVG so no published book is ever bare.
  const coverUrl = clean(payload.coverUrl, 500);
  const dataMatch = /^data:image\/(svg\+xml|png|jpeg|webp);base64,([\s\S]+)$/.exec(coverUrl);
  const coverFile = dataMatch
    ? {
        name: `cover.${dataMatch[1] === "svg+xml" ? "svg" : dataMatch[1] === "jpeg" ? "jpg" : dataMatch[1]}`,
        content: Buffer.from(dataMatch[2] ?? "", "base64").toString("utf8"),
      }
    : coverUrl
      ? null
      : {
          name: "cover.svg",
          content: makeCoverSvg(meta.title, meta.author, meta.genre),
        };

  return {
    slug,
    meta: {
      title: meta.title,
      author: meta.author,
      genre: meta.genre,
      description: meta.description,
      cover_url: coverFile ? "" : coverUrl,
      language: meta.language,
    },
    coverFile,
    bookText: text,
    chapterCount: chapters,
    wordCount: words,
  };
}
