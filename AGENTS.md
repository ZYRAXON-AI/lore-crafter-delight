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
- Regenerate manuscripts with `node tools/generate-manuscripts.mjs`; the script only reads books with id ≤ 30 and appends the generated horror-romance line, so reruns stay idempotent.
- Route all interface copy through `src/lib/i18n.tsx` (`useLanguage().t`); book prose itself is never translated.

