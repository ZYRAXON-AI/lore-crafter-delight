import { describe, expect, it } from "vitest";
import { formatNumber } from "@/lib/i18n";
import { genreClass } from "@/lib/books";

describe("Language helpers", () => {
  it("formats numbers in Bangla digits for bn", () => {
    expect(formatNumber(45, "bn")).toBe("৪৫");
  });

  it("formats numbers in Latin digits for en", () => {
    expect(formatNumber(45, "en")).toBe("45");
  });
});

describe("Genre class mapping", () => {
  it("maps known genres to their palette index", () => {
    expect(genreClass("ভূত")).toBe("genre-0");
    expect(genreClass("হরর-রোম্যান্স")).toBe("genre-6");
  });

  it("falls back to a valid class for unknown genres", () => {
    expect(genreClass("অজানা ঘরানা")).toBe("genre-6");
  });
});
