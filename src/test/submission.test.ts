import { describe, expect, it } from "vitest";
import { SubmissionError, slugify, validateSubmission } from "@/lib/book-submission";

const longText = Array.from({ length: 250 }, (_, i) => `শব্দ${i}`).join(" ");

describe("slugify", () => {
  it("turns a Bangla title into an ascii slug", () => {
    expect(slugify("আমার ভয়")).toMatch(/^[a-z0-9-]+$/);
    expect(slugify("আমার ভয়")).not.toContain(" ");
  });

  it("falls back to a usable slug for punctuation-only titles", () => {
    expect(slugify("!!!")).toBe("book");
  });
});

describe("validateSubmission", () => {
  it("accepts a plain-text book and counts words", () => {
    const result = validateSubmission({
      title: "পরীক্ষা",
      author: "লেখক",
      genre: "ভূত",
      description: "পরিচিতি",
      book: `অধ্যায় ১: শুরু\n\n${longText}`,
    });
    expect(result.chapterCount).toBe(1);
    expect(result.wordCount).toBeGreaterThanOrEqual(250);
    expect(result.slug).toBeTruthy();
  });

  it("accepts a chapter list", () => {
    const result = validateSubmission({
      title: "পরীক্ষা",
      author: "লেখক",
      genre: "প্রেম",
      description: "পরিচিতি",
      chapters: [
        { title: "শুরু", paragraphs: [longText] },
        { title: "শেষ", paragraphs: [longText] },
      ],
    });
    expect(result.chapterCount).toBe(2);
  });

  it("rejects a submission with missing fields", () => {
    expect(() => validateSubmission({ title: "x" })).toThrow(SubmissionError);
  });

  it("rejects an unknown genre", () => {
    expect(() =>
      validateSubmission({
        title: "পরীক্ষা",
        author: "লেখক",
        genre: "tomato",
        description: "পরিচিতি",
        book: longText,
      }),
    ).toThrow(/ঘরানা/);
  });

  it("rejects a book that is too short", () => {
    expect(() =>
      validateSubmission({
        title: "পরীক্ষা",
        author: "লেখক",
        genre: "ভূত",
        description: "পরিচিতি",
        book: "খুব ছোট",
      }),
    ).toThrow(/ছোট/);
  });
});
