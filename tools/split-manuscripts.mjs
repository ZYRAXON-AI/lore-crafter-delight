// Writes one JSON file per book plus a light index.
//
// Reading pages import only the requested book's file and the index, so the
// library stays fast even though the full collection is several megabytes.
// Run automatically by tools/generate-manuscripts.mjs after each rewrite.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const booksDir = path.join(root, "src", "content", "books");
const indexJsonPath = path.join(root, "src", "lib", "book-index.json");

const pad = (id) => String(id).padStart(2, "0");

export function splitManuscripts(books) {
  fs.mkdirSync(booksDir, { recursive: true });

  const index = books.map((book) => {
    const { chapters, ...rest } = book;
    fs.writeFileSync(
      path.join(booksDir, `${pad(book.id)}.json`),
      `${JSON.stringify({ ...rest, chapters }, null, 2)}\n`,
    );
    return { ...rest, chapterCount: chapters.length };
  });

  fs.writeFileSync(indexJsonPath, `${JSON.stringify(index, null, 2)}\n`);
  return { books: index.length, booksDir, indexJsonPath };
}
