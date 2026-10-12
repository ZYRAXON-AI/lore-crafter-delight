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

  it("derives missing metadata instead of rejecting it", () => {
    const result = validateSubmission({ book: `অধ্যায় ১: শুরু\n\n${longText}` });
    expect(result.meta.title).toBeTruthy();
    expect(result.meta.author).toBe("নাম না জানা লেখক");
    expect(result.meta.genre).toBeTruthy();
    expect(result.meta.description).toBeTruthy();
  });

  it("keeps a genre that is already known", () => {
    const result = validateSubmission({
      title: "পরীক্ষা",
      author: "লেখক",
      genre: "প্রেম",
      description: "পরিচিতি",
      book: `অধ্যায় ১: শুরু\n\n${longText}`,
    });
    expect(result.meta.genre).toBe("প্রেম");
  });

  it("rejects an empty submission", () => {
    expect(() => validateSubmission({})).toThrow(SubmissionError);
  });

  it("generates a cover image when none is supplied", () => {
    const result = validateSubmission({
      title: "পরীক্ষা",
      author: "লেখক",
      genre: "ভূত",
      book: `অধ্যায় ১: শুরু\n\n${longText}`,
    });
    expect(result.coverFile?.name).toBe("cover.svg");
    expect(result.coverFile?.content).toContain("<svg");
    expect(result.meta.cover_url).toBe("");
  });

  it("keeps a supplied cover_url and commits no cover file", () => {
    const result = validateSubmission({
      title: "পরীক্ষা",
      author: "লেখক",
      genre: "প্রেম",
      coverUrl: "https://example.com/cover.jpg",
      book: `অধ্যায় ১: শুরু\n\n${longText}`,
    });
    expect(result.coverFile).toBeNull();
    expect(result.meta.cover_url).toBe("https://example.com/cover.jpg");
  });

  it("decodes a data-url cover into a committed file", () => {
    const svg = "<svg xmlns='http://www.w3.org/2000/svg'></svg>";
    const result = validateSubmission({
      title: "পরীক্ষা",
      book: `অধ্যায় ১: শুরু\n\n${longText}`,
      coverUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    });
    expect(result.coverFile?.name).toBe("cover.svg");
    expect(result.coverFile?.content).toBe(svg);
    expect(result.meta.cover_url).toBe("");
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
    ).toThrow(/ছোট|অক্ষর/);
  });
});
