import { createServerFn } from "@tanstack/react-start";
import {
  BOOK_FILE_CANDIDATES,
  COVER_CANDIDATES,
  REQUIRED_FIELDS,
  pickFirst,
  splitChapters,
  type CommunityBook,
} from "./community-parse";

// Reads community submissions straight from the GitHub repository at request
// time, so a merged pull request is visible without any rebuild or deploy.
// Results are cached in memory so repeat visits do not hit the GitHub API.
const OWNER = "zyraxon-X";
const REPO = "lore-crafter-delight";
const BRANCH = "main";
const FOLDER = "books-submission";
const TTL_MS = 5 * 60 * 1000;
const MAX_FOLDERS = 60;

type GithubEntry = { name: string; type: "file" | "dir" };

type CacheEntry = { at: number; books: CommunityBook[] };

let cache: CacheEntry | undefined;

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "lore-crafter-delight",
  };
  const token = process.env["GITHUB_TOKEN"];
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function listFolder(path: string): Promise<GithubEntry[]> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`;
  const response = await fetch(url, { headers: githubHeaders() });
  if (!response.ok) throw new Error(`GitHub ${response.status} for ${path}`);
  const payload = (await response.json()) as GithubEntry[];
  return Array.isArray(payload) ? payload : [];
}

async function fetchFile(path: string): Promise<string> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`;
  const response = await fetch(url, { headers: githubHeaders() });
  if (!response.ok) throw new Error(`GitHub ${response.status} for ${path}`);
  const payload = (await response.json()) as { content?: string };
  if (!payload.content) return "";
  return Buffer.from(payload.content, "base64").toString("utf8");
}

async function loadBook(slug: string, files: string[]): Promise<CommunityBook | undefined> {
  const base = `${FOLDER}/${slug}`;
  let meta: Record<string, unknown>;
  try {
    meta = JSON.parse(await fetchFile(`${base}/meta.json`)) as Record<string, unknown>;
  } catch {
    return undefined;
  }

  const text = (field: string) => String(meta[field] ?? "").trim();
  if (REQUIRED_FIELDS.some((field) => !text(field))) return undefined;

  const bookFile = pickFirst(files, BOOK_FILE_CANDIDATES);
  if (!bookFile) return undefined;

  const coverFile = pickFirst(files, COVER_CANDIDATES);
  const coverUrl =
    text("cover_url") || (coverFile ? `/api/community-cover/${slug}/${coverFile}` : "");

  const hasText = bookFile !== "book.pdf";
  const chapters = hasText ? splitChapters(await fetchFile(`${base}/${bookFile}`)) : [];

  return {
    slug,
    title: text("title"),
    author: text("author"),
    genre: text("genre"),
    description: text("description"),
    language: text("language") || "বাংলা",
    coverUrl,
    hasText,
    sourceFile: bookFile,
    chapters,
  };
}

export async function loadCommunityBooks(): Promise<CommunityBook[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.books;

  try {
    const folders = (await listFolder(FOLDER)).filter(
      (entry) => entry.type === "dir" && !entry.name.startsWith("."),
    );
    const books: CommunityBook[] = [];
    for (const folder of folders.slice(0, MAX_FOLDERS)) {
      const files = await listFolder(`${FOLDER}/${folder.name}`);
      const book = await loadBook(
        folder.name,
        files.map((file) => file.name),
      );
      if (book) books.push(book);
    }
    books.sort((a, b) => a.title.localeCompare(b.title, "bn"));
    cache = { at: Date.now(), books };
    return books;
  } catch (error) {
    console.warn("[community] লাইভ তালিকা আনা যায়নি:", error);
    // Keep serving the last good snapshot if GitHub is momentarily unavailable.
    return cache?.books ?? [];
  }
}

export const fetchCommunityBooks = createServerFn({ method: "GET" }).handler(() =>
  loadCommunityBooks(),
);
