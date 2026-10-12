import { describe, expect, it } from "vitest";
import {
  BOOK_FILE_CANDIDATES,
  COVER_CANDIDATES,
  pickFirst,
  splitChapters,
} from "@/lib/community-parse";
import { toBookSummary, toLibraryBook } from "@/lib/community-to-book";
import type { CommunityBook } from "@/lib/community-parse";

const entry: CommunityBook = {
  slug: "nodir-naam",
  title: "নদীর নাম মনে নেই",
  author: "নমুনা লেখক",
  genre: "প্রেম",
  description: "নদী, ঘাট আর না-বলা কথার গল্প।",
  language: "বাংলা",
  coverUrl: "/api/community-cover/nodir-naam/cover.jpg",
  hasText: true,
  sourceFile: "book.txt",
  chapters: [{ title: "ঘাটে ফেরা", paragraphs: ["প্রথম অনুচ্ছেদ।"] }],
};

describe("Community submission parsing", () => {
  it("splits chapters on Bangla and English headings", () => {
    const text = [
      "অধ্যায় ১: শুরু",
      "প্রথম প্যারা।",
      "",
      "Chapter 2: পরে",
      "দ্বিতীয় প্যারা।",
    ].join("\n");
    const chapters = splitChapters(text);
    expect(chapters).toHaveLength(2);
    expect(chapters[0]?.title).toBe("শুরু");
    expect(chapters[1]?.title).toBe("পরে");
  });

  it("keeps prose that appears before the first heading", () => {
    const chapters = splitChapters("ভূমিকা হিসেবে লেখা কিছু।\n\nঅধ্যায় ১: শুরু\nমূল অংশ।");
    expect(chapters).toHaveLength(2);
    expect(chapters[0]?.title).toBe("অংশ ১");
    expect(chapters[0]?.paragraphs[0]).toBe("ভূমিকা হিসেবে লেখা কিছু।");
  });

  it("prefers a readable text file over a pdf", () => {
    expect(pickFirst(["book.pdf", "book.txt"], BOOK_FILE_CANDIDATES)).toBe("book.txt");
    expect(pickFirst(["cover.png"], COVER_CANDIDATES)).toBe("cover.png");
    expect(pickFirst(["nope.txt"], BOOK_FILE_CANDIDATES)).toBeUndefined();
  });

  it("maps a submission onto a library book with a negative id", () => {
    const book = toLibraryBook(entry, 0);
    expect(book.id).toBe(-1);
    expect(book.title).toBe("নদীর নাম মনে নেই");
    expect(book.author).toBe("নমুনা লেখক");
    expect(book.coverUrl).toBe("/api/community-cover/nodir-naam/cover.jpg");
    expect(book.chapters).toHaveLength(1);
  });

  it("builds a summary row without the full chapters", () => {
    const summary = toBookSummary(entry, 0);
    expect(summary.chapterCount).toBe(1);
    expect(summary).not.toHaveProperty("chapters");
  });
});
