import { describe, expect, it } from "vitest";
import index from "@/lib/book-index.json";
import { loadBook } from "@/lib/manuscripts";

const books = index as {
  id: number;
  title: string;
  genre: string;
  outline: string[];
  chapterCount: number;
}[];

describe("Book index", () => {
  it("contains forty-five distinct books", () => {
    expect(books).toHaveLength(45);
    expect(new Set(books.map((book) => book.id)).size).toBe(45);
    expect(new Set(books.map((book) => book.title)).size).toBe(45);
  });

  it("keeps the original genre counts", () => {
    expect(books.filter((book) => book.genre === "ভূত")).toHaveLength(5);
    expect(books.filter((book) => book.genre === "প্রেম")).toHaveLength(5);
    expect(books.filter((book) => book.genre === "রহস্য")).toHaveLength(5);
  });

  it("adds fifteen horror-romance novels", () => {
    expect(books.filter((book) => book.genre === "হরর-রোম্যান্স")).toHaveLength(15);
  });

  it("gives every book eight chapters in the index", () => {
    for (const book of books) {
      expect(book.chapterCount).toBe(8);
      expect(book.outline).toHaveLength(8);
    }
  });
});

const words = (paragraphs: string[]) =>
  paragraphs.reduce((total, paragraph) => total + paragraph.split(/\s+/).length, 0);

describe("Full manuscripts", () => {
  it("loads a full book on demand", async () => {
    const book = await loadBook(1);
    expect(book?.chapters).toHaveLength(8);
    expect(book?.chapters.map((chapter) => chapter.title)).toEqual(book?.outline);
  });

  it("writes chapters long enough to read as fifteen to twenty pages", async () => {
    const book = await loadBook(1);
    for (const chapter of book?.chapters ?? []) {
      expect(chapter.paragraphs.length).toBeGreaterThanOrEqual(20);
      expect(words(chapter.paragraphs)).toBeGreaterThanOrEqual(3000);
    }
  });

  it("keeps every book at a novel length", async () => {
    const book = await loadBook(45);
    const total = (book?.chapters ?? []).reduce(
      (sum, chapter) => sum + words(chapter.paragraphs),
      0,
    );
    expect(total).toBeGreaterThanOrEqual(20000);
  });

  it("returns undefined for an unknown id", async () => {
    expect(await loadBook(999)).toBeUndefined();
  });
});
