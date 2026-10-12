export type Chapter = { title: string; paragraphs: string[] };
export type Book = { id: number; title: string; genre: string; subtitle: string; outline: string[]; chapters: Chapter[] };
export const genres = ['ভূত', 'প্রেম', 'রহস্য', 'ফ্যান্টাসি', 'অভিযান', 'বিজ্ঞান কল্পকাহিনি'] as const;
export const bn = (value: number) => value.toLocaleString('bn-BD');
const covers = import.meta.glob('../assets/books/*.jpg', { eager: true, import: 'default' }) as Record<string, string>;
export const coverFor = (id: number) => covers[`../assets/books/${String(id).padStart(2, '0')}.jpg`];
export const genreClass = (genre: string) => `genre-${genres.indexOf(genre as typeof genres[number])}`;