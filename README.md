# Lore Crafter Delight

> An animated digital library — 60 full-length novels you can read and listen to.

**Live app**: https://lore-crafter-delight.lovable.app · **Repository**: https://github.com/zyraxon-X/lore-crafter-delight

## 🌍 Read this in your language

Forty languages are available. Pick yours — every file teaches how to upload your
book, and **you may submit a book in any language and any script**, not just
Bangla or English.

- **English** &nbsp;·&nbsp; `README.en.md`
- [বাংলা](README.bn.md) &nbsp;·&nbsp; `README.bn.md`
- [हिन्दी](README.hi.md) &nbsp;·&nbsp; `README.hi.md`
- [اردو](README.ur.md) &nbsp;·&nbsp; `README.ur.md`
- [العربية](README.ar.md) &nbsp;·&nbsp; `README.ar.md`
- [فارسی](README.fa.md) &nbsp;·&nbsp; `README.fa.md`
- [Türkçe](README.tr.md) &nbsp;·&nbsp; `README.tr.md`
- [Bahasa Indonesia](README.id.md) &nbsp;·&nbsp; `README.id.md`
- [Bahasa Melayu](README.ms.md) &nbsp;·&nbsp; `README.ms.md`
- [ไทย](README.th.md) &nbsp;·&nbsp; `README.th.md`
- [Tiếng Việt](README.vi.md) &nbsp;·&nbsp; `README.vi.md`
- [简体中文](README.zh.md) &nbsp;·&nbsp; `README.zh.md`
- [日本語](README.ja.md) &nbsp;·&nbsp; `README.ja.md`
- [한국어](README.ko.md) &nbsp;·&nbsp; `README.ko.md`
- [Русский](README.ru.md) &nbsp;·&nbsp; `README.ru.md`
- [Українська](README.uk.md) &nbsp;·&nbsp; `README.uk.md`
- [Deutsch](README.de.md) &nbsp;·&nbsp; `README.de.md`
- [Français](README.fr.md) &nbsp;·&nbsp; `README.fr.md`
- [Español](README.es.md) &nbsp;·&nbsp; `README.es.md`
- [Português](README.pt.md) &nbsp;·&nbsp; `README.pt.md`
- [Italiano](README.it.md) &nbsp;·&nbsp; `README.it.md`
- [Nederlands](README.nl.md) &nbsp;·&nbsp; `README.nl.md`
- [Polski](README.pl.md) &nbsp;·&nbsp; `README.pl.md`
- [Svenska](README.sv.md) &nbsp;·&nbsp; `README.sv.md`
- [Dansk](README.da.md) &nbsp;·&nbsp; `README.da.md`
- [Norsk](README.nb.md) &nbsp;·&nbsp; `README.nb.md`
- [Suomi](README.fi.md) &nbsp;·&nbsp; `README.fi.md`
- [Čeština](README.cs.md) &nbsp;·&nbsp; `README.cs.md`
- [Ελληνικά](README.el.md) &nbsp;·&nbsp; `README.el.md`
- [עברית](README.he.md) &nbsp;·&nbsp; `README.he.md`
- [Română](README.ro.md) &nbsp;·&nbsp; `README.ro.md`
- [Magyar](README.hu.md) &nbsp;·&nbsp; `README.hu.md`
- [Kiswahili](README.sw.md) &nbsp;·&nbsp; `README.sw.md`
- [አማርኛ](README.am.md) &nbsp;·&nbsp; `README.am.md`
- [Hausa](README.ha.md) &nbsp;·&nbsp; `README.ha.md`
- [Yorùbá](README.yo.md) &nbsp;·&nbsp; `README.yo.md`
- [தமிழ்](README.ta.md) &nbsp;·&nbsp; `README.ta.md`
- [తెలుగు](README.te.md) &nbsp;·&nbsp; `README.te.md`
- [मराठी](README.mr.md) &nbsp;·&nbsp; `README.mr.md`
- [नेपाली](README.ne.md) &nbsp;·&nbsp; `README.ne.md`

## How to add your PDF or book

1. Fork this repository (or clone it).
2. Create a folder: `pdf-library/<your-name>/`.
3. Inside it put your book (`book.txt`, `book.md` or `book.pdf`), a `meta.json` that has a `title`, and a cover image (`cover.png` / `cover.svg`).
4. Commit and open a Pull Request.
5. The auto-merge bot checks it and your book appears on the site within minutes — no redeploy.

## Write in any language

You are not limited to Bangla or English. Submit a book in any language and any script — Bangla, Hindi, Arabic, Chinese, Swahili, anything. The site shows your text exactly as you wrote it.

## Full rules

Read the detailed, step-by-step rules in [`pdf-library/README.md`](pdf-library/README.md).
There is also a quick translated guide for each of the forty languages below.

## What is inside

- **60 books, 10 genres** — ghost, romance, mystery, fantasy, adventure, science
  fiction, horror-romance, comedy, social, other.
- **15–20 pages per chapter** — about 5,000 words each; every book has 8–12 chapters.
- **Lazy-load architecture** — each book is its own `src/content/books/<id>.json`;
  only the light `src/lib/book-index.json` loads first, so the library opens fast.
- **Community submissions** — anyone can add a book under `pdf-library/<name>/`
  and open a PR; an auto-merge workflow publishes it. Or POST to `/api/books`.
- **Read aloud** — the reader can speak a chapter with your browser's voice.
- **Export** — TXT, HTML and print/PDF.

## Development

Needs Node.js and npm. Then:

```sh
npm i
npm run generate   # rebuild all 60 books under src/content/books/
npm run dev        # http://localhost:8080
```

Other commands: `npm test`, `npm run lint`, `npm run build`.

## Contributing a book

See [`pdf-library/README.md`](pdf-library/README.md). A `meta.json` with a title
and a cover image are both compulsory.

```sh
curl -X POST https://<your-site>/api/books \
  -H 'content-type: application/json' \
  -d '{ "title": "আমার ভয়", "author": "আপনার নাম", "genre": "ভূত", "book": "..." }'
```

## Tech

TanStack Start + React 19 + TypeScript + Tailwind CSS. Content generation runs
outside the web app, in plain Node scripts under `tools/`.

---

## 🌐 Language index (40 files)

- **English** &nbsp;·&nbsp; `README.en.md`
- [বাংলা](README.bn.md) &nbsp;·&nbsp; `README.bn.md`
- [हिन्दी](README.hi.md) &nbsp;·&nbsp; `README.hi.md`
- [اردو](README.ur.md) &nbsp;·&nbsp; `README.ur.md`
- [العربية](README.ar.md) &nbsp;·&nbsp; `README.ar.md`
- [فارسی](README.fa.md) &nbsp;·&nbsp; `README.fa.md`
- [Türkçe](README.tr.md) &nbsp;·&nbsp; `README.tr.md`
- [Bahasa Indonesia](README.id.md) &nbsp;·&nbsp; `README.id.md`
- [Bahasa Melayu](README.ms.md) &nbsp;·&nbsp; `README.ms.md`
- [ไทย](README.th.md) &nbsp;·&nbsp; `README.th.md`
- [Tiếng Việt](README.vi.md) &nbsp;·&nbsp; `README.vi.md`
- [简体中文](README.zh.md) &nbsp;·&nbsp; `README.zh.md`
- [日本語](README.ja.md) &nbsp;·&nbsp; `README.ja.md`
- [한국어](README.ko.md) &nbsp;·&nbsp; `README.ko.md`
- [Русский](README.ru.md) &nbsp;·&nbsp; `README.ru.md`
- [Українська](README.uk.md) &nbsp;·&nbsp; `README.uk.md`
- [Deutsch](README.de.md) &nbsp;·&nbsp; `README.de.md`
- [Français](README.fr.md) &nbsp;·&nbsp; `README.fr.md`
- [Español](README.es.md) &nbsp;·&nbsp; `README.es.md`
- [Português](README.pt.md) &nbsp;·&nbsp; `README.pt.md`
- [Italiano](README.it.md) &nbsp;·&nbsp; `README.it.md`
- [Nederlands](README.nl.md) &nbsp;·&nbsp; `README.nl.md`
- [Polski](README.pl.md) &nbsp;·&nbsp; `README.pl.md`
- [Svenska](README.sv.md) &nbsp;·&nbsp; `README.sv.md`
- [Dansk](README.da.md) &nbsp;·&nbsp; `README.da.md`
- [Norsk](README.nb.md) &nbsp;·&nbsp; `README.nb.md`
- [Suomi](README.fi.md) &nbsp;·&nbsp; `README.fi.md`
- [Čeština](README.cs.md) &nbsp;·&nbsp; `README.cs.md`
- [Ελληνικά](README.el.md) &nbsp;·&nbsp; `README.el.md`
- [עברית](README.he.md) &nbsp;·&nbsp; `README.he.md`
- [Română](README.ro.md) &nbsp;·&nbsp; `README.ro.md`
- [Magyar](README.hu.md) &nbsp;·&nbsp; `README.hu.md`
- [Kiswahili](README.sw.md) &nbsp;·&nbsp; `README.sw.md`
- [አማርኛ](README.am.md) &nbsp;·&nbsp; `README.am.md`
- [Hausa](README.ha.md) &nbsp;·&nbsp; `README.ha.md`
- [Yorùbá](README.yo.md) &nbsp;·&nbsp; `README.yo.md`
- [தமிழ்](README.ta.md) &nbsp;·&nbsp; `README.ta.md`
- [తెలుగు](README.te.md) &nbsp;·&nbsp; `README.te.md`
- [मराठी](README.mr.md) &nbsp;·&nbsp; `README.mr.md`
- [नेपाली](README.ne.md) &nbsp;·&nbsp; `README.ne.md`
