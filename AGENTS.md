<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Keep fiction manuscripts as typed static content separate from library and reader routes, so writing can be extended without changing presentation.
- Use individual bundled cover illustrations in a shared BookCover component, so the collection and reading pages share each book's visual identity.
- Represent manuscript availability from actual chapter data rather than planned length, so unfinished books cannot appear complete.
- Read community submissions live from the `books-submission/` folder in this repository at runtime (see `src/lib/community-books.server.ts`), instead of a build-time ingest, so published books appear without a redeploy.
- Regenerate manuscripts with `node tools/generate-manuscripts.mjs`; it rebuilds all 45 books from `tools/seed-books.json` and writes one file per book under `src/content/books/` plus `src/lib/book-index.json`, so reruns are idempotent and never depend on previous output.
- Read a single book on demand with `loadBook(id)` from `src/lib/manuscripts.ts`; never import a whole-collection JSON into a route, or the client bundle balloons.
- Keep `Book` and `BookSummary` types in `src/lib/book-types.ts` (re-exported from `books.ts`) so server loaders and components can share them without circular imports.
- Accept community submissions either as a `books-submission/<slug>/` folder or via `POST /api/books` (`src/lib/book-submission.ts` validates both); the `auto-merge-submission.yml` workflow merges folder-only PRs automatically.
- Route all interface copy through `src/lib/i18n.tsx` (`useLanguage().t`); book prose itself is never translated.
