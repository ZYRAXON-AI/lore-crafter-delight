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
  it("contains sixty distinct books", () => {
    expect(books).toHaveLength(60);
    expect(new Set(books.map((book) => book.id)).size).toBe(60);
    expect(new Set(books.map((book) => book.title)).size).toBe(60);
  });

  it("keeps the original genre counts, plus the new shelves", () => {
    expect(books.filter((book) => book.genre === "ভূত")).toHaveLength(6);
    expect(books.filter((book) => book.genre === "প্রেম")).toHaveLength(10);
    expect(books.filter((book) => book.genre === "রহস্য")).toHaveLength(6);
    expect(books.filter((book) => book.genre === "সামাজিক")).toHaveLength(6);
    expect(books.filter((book) => book.genre === "হাস্যরস")).toHaveLength(2);
  });

  it("adds fifteen horror-romance novels", () => {
    expect(books.filter((book) => book.genre === "হরর-রোম্যান্স")).toHaveLength(15);
  });

  it("lists eight or twelve chapters per book, matching the outline", () => {
    for (const book of books) {
      expect([8, 12]).toContain(book.chapterCount);
      expect(book.outline).toHaveLength(book.chapterCount);
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

  it("keeps the newest twelve-chapter book at novel length too", async () => {
    const book = await loadBook(60);
    expect(book?.chapters).toHaveLength(12);
    const total = (book?.chapters ?? []).reduce(
      (sum, chapter) => sum + words(chapter.paragraphs),
      0,
    );
    expect(total).toBeGreaterThanOrEqual(40000);
  });

  it("returns undefined for an unknown id", async () => {
    expect(await loadBook(999)).toBeUndefined();
  });
});
