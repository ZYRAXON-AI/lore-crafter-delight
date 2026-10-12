export type Chapter = { title: string; paragraphs: string[] };

export type Book = {
  id: number;
  title: string;
  genre: string;
  subtitle: string;
  outline: string[];
  chapters: Chapter[];
  author?: string;
  description?: string;
  coverUrl?: string;
  language?: string;
};

// One row of src/lib/book-index.json: everything the collection grid needs,
// without pulling any book's full text into the bundle.
export type BookSummary = Omit<Book, "chapters" | "outline"> & {
  chapterCount: number;
};
