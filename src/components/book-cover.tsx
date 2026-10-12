import { coverFor, genreClass } from "@/lib/books";
import type { Book, BookSummary } from "@/lib/book-types";
import { cn } from "@/lib/utils";

export function BookCover({
  book,
  className,
  priority = false,
}: {
  book: Book | BookSummary;
  className?: string;
  priority?: boolean;
}) {
  const src = book.coverUrl || coverFor(book.id);
  return (
    <div className={cn("book-cover", genreClass(book.genre), className)}>
      {src ? (
        <img
          src={src}
          alt={`${book.title} — প্রচ্ছদ`}
          width={320}
          height={512}
          loading={priority ? "eager" : "lazy"}
        />
      ) : (
        <div className="cover-fallback" aria-hidden="true" />
      )}
      <div className="cover-shade" />
      <div className="cover-top">
        বইকথা <span> / </span> উপন্যাস
      </div>
      <div className="cover-lettering">
        <span className="cover-genre">{book.genre}</span>
        <h3>{book.title}</h3>
        <div className="cover-rule" />
        <p>{book.author ? book.author : "একটি বইকথা প্রকাশনা"}</p>
      </div>
      <div className="book-spine" />
    </div>
  );
}
