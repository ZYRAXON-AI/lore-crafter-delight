import type { Book, BookSummary } from "./book-types";
import type { CommunityBook } from "./community-parse";

// Community books get negative ids so they never collide with the bundled
// collection, and a "সম্প্রদায়" subtitle line marks their origin.
export function toLibraryBook(entry: CommunityBook, index: number): Book {
  const book: Book = {
    id: -(index + 1),
    title: entry.title,
    genre: entry.genre,
    subtitle: entry.description || `${entry.author} লিখিত কমিউনিটি বই`,
    outline: entry.chapters.map((chapter) => chapter.title),
    chapters: entry.chapters,
    author: entry.author,
    description: entry.description,
    language: entry.language,
  };
  // exactOptionalPropertyTypes forbids assigning an explicit undefined, so the
  // cover is only attached when the submission actually provided one.
  if (entry.coverUrl) book.coverUrl = entry.coverUrl;
  return book;
}

// The collection grid only needs a summary row, so community submissions are
// mapped to the same light shape as the bundled books.
export function toBookSummary(entry: CommunityBook, index: number): BookSummary {
  const book = toLibraryBook(entry, index);
  const { chapters, ...rest } = book;
  void chapters;
  return { ...rest, chapterCount: entry.chapters.length };
}
