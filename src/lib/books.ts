export type { Book, Chapter, BookSummary } from "./book-types";
import type { Book } from "./book-types";

export const genres = [
  "ভূত",
  "প্রেম",
  "রহস্য",
  "ফ্যান্টাসি",
  "অভিযান",
  "বিজ্ঞান কল্পকাহিনি",
  "হরর-রোম্যান্স",
] as const;

export const bn = (value: number) => value.toLocaleString("bn-BD");

const covers = import.meta.glob("../assets/books/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const coverFor = (id: number) =>
  covers[`../assets/books/${String(id).padStart(2, "0")}.jpg`];

// Unknown genres fall back to the horror-romance palette rather than an
// invalid CSS class, so community submissions can use any genre label.
export const genreClass = (genre: string) => {
  const index = genres.indexOf(genre as (typeof genres)[number]);
  return `genre-${index === -1 ? genres.length - 1 : index}`;
};
