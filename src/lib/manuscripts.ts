import type { Book, BookSummary } from "./book-types";

// The light index is safe to import anywhere; the per-book files below are
// loaded on demand, so the library grid never pulls in megabytes of prose.
import index from "./book-index.json";

const modules = import.meta.glob<{ default: Book }>("../content/books/*.json");

export const bookSummaries = index as BookSummary[];

export const bookCount = bookSummaries.length;

export async function loadBook(id: number): Promise<Book | undefined> {
  const key = `../content/books/${String(id).padStart(2, "0")}.json`;
  const load = modules[key];
  if (!load) return undefined;
  return (await load()).default;
}

export function summaryFor(id: number): BookSummary | undefined {
  return bookSummaries.find((book) => book.id === id);
}
