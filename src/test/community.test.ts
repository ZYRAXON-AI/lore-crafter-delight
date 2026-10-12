import { describe, expect, it } from "vitest";
import {
  BOOK_FILE_CANDIDATES,
  COVER_CANDIDATES,
  pickFirst,
  splitChapters,
  inferGenre,
  titleFromSlug,
  deriveMeta,
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
  coverUrl: "/api/community-file/nodir-naam/cover.jpg",
  pdfUrl: "",
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
    expect(book.coverUrl).toBe("/api/community-file/nodir-naam/cover.jpg");
    expect(book.chapters).toHaveLength(1);
  });

  it("builds a summary row without the full chapters", () => {
    const summary = toBookSummary(entry, 0);
    expect(summary.chapterCount).toBe(1);
    expect(summary).not.toHaveProperty("chapters");
  });

  it("carries a direct pdf link through to the reader", () => {
    const pdfEntry: CommunityBook = {
      ...entry,
      coverUrl: "",
      pdfUrl: "/api/community-file/kobita/kobita.pdf",
      sourceFile: "kobita.pdf",
      hasText: false,
      chapters: [],
    };
    const book = toLibraryBook(pdfEntry, 4);
    expect(book.pdfUrl).toBe("/api/community-file/kobita/kobita.pdf");
    expect(book.sourceFile).toBe("kobita.pdf");
  });
});

describe("Automatic metadata for bare submissions", () => {
  it("reads a title back from a slug when none is given", () => {
    expect(titleFromSlug("nodir-naam-mone-nei")).toBe("Nodir Naam Mone Nei");
  });

  it("guesses a genre from the manuscript text", () => {
    expect(inferGenre("ভূতের গল্প, অশরীরী ডাক আর প্রেতের ছায়া।")).toBe("ভূত");
    expect(inferGenre("কোনো চেনা শব্দ নেই এখানে।")).toBe("অন্যান্য");
  });

  it("derives title, author, genre and blurb with an empty meta.json", () => {
    const meta = deriveMeta("nodir-naam", {}, "নদীর নাম মনে নেই\n\nপ্রথম অনুচ্ছেদ এখানে।");
    expect(meta.title).toBe("নদীর নাম মনে নেই");
    expect(meta.author).toBe("নাম না জানা লেখক");
    expect(meta.description.length).toBeGreaterThan(0);
    expect(meta.language).toBe("বাংলা");
  });

  it("never overrides fields the submission did provide", () => {
    const meta = deriveMeta(
      "nodir-naam",
      { title: "আসল নাম", author: "আসল লেখক", genre: "রহস্য" },
      "ভূতের গল্প।",
    );
    expect(meta.title).toBe("আসল নাম");
    expect(meta.author).toBe("আসল লেখক");
    expect(meta.genre).toBe("রহস্য");
  });
});
