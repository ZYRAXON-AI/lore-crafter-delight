import type { Book } from "./book-types";

const FONT_STACK = "'Noto Sans Bengali', 'SolaimanLipi', 'Hind Siliguri', sans-serif";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function download(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadTxt(book: Book) {
  const body = book.chapters
    .map((chapter) => `${chapter.title}\n\n${chapter.paragraphs.join("\n\n")}`)
    .join("\n\n\n");
  const text = `${book.title}\n${book.subtitle}\n\n${body}\n`;
  // The BOM keeps Bangla conjuncts intact in editors that guess encoding.
  download(`${book.title}.txt`, `\uFEFF${text}`, "text/plain;charset=utf-8");
}

// Self-contained HTML with the Bangla webfonts linked and a print stylesheet,
// so the exported file renders conjuncts correctly offline and prints cleanly
// to PDF from any browser (Ctrl/Cmd + P → Save as PDF).
export function downloadHtml(book: Book) {
  const chapters = book.chapters
    .map(
      (chapter, index) => `
      <section class="chapter">
        <p class="chapter-no">অধ্যায় ${index + 1}</p>
        <h2>${escapeHtml(chapter.title)}</h2>
        ${chapter.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n")}
      </section>`,
    )
    .join("\n");

  const html = `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(book.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root { color-scheme: light; }
  body { font-family: ${FONT_STACK}; max-width: 46rem; margin: 0 auto; padding: 3rem 1.5rem; line-height: 2; color: #221c17; background: #fbf7f1; }
  h1 { font-size: 2.2rem; text-align: center; margin-bottom: .4rem; }
  .subtitle { text-align: center; color: #6b5b4d; margin-top: 0; }
  .chapter { page-break-before: always; }
  .chapter:first-of-type { page-break-before: avoid; }
  .chapter-no { text-align: center; letter-spacing: .08em; color: #8a6f57; margin-bottom: .2rem; }
  h2 { text-align: center; font-weight: 600; margin-top: .2rem; }
  p { text-align: justify; }
  @media print { body { background: #fff; padding: 0; } .chapter { page-break-before: always; } }
</style>
</head>
<body>
<h1>${escapeHtml(book.title)}</h1>
<p class="subtitle">${escapeHtml(book.subtitle)}</p>
${chapters}
</body>
</html>`;

  download(`${book.title}.html`, html, "text/html;charset=utf-8");
}

// Opens the browser print dialog for the HTML export, which is the most
// reliable cross-browser path to a PDF with correct Bangla shaping.
export function printBook(book: Book) {
  const frame = document.createElement("iframe");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  document.body.appendChild(frame);
  const doc = frame.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(
    `<!doctype html><html lang="bn"><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600&family=Noto+Serif+Bengali:wght@400;600&display=swap" rel="stylesheet"><style>body{font-family:${FONT_STACK};line-height:2;}h1,h2{text-align:center;}</style></head><body><h1>${escapeHtml(book.title)}</h1>${book.chapters
      .map(
        (chapter, index) =>
          `<h2>${index + 1}. ${escapeHtml(chapter.title)}</h2>${chapter.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}`,
      )
      .join("")}</body></html>`,
  );
  doc.close();
  frame.contentWindow?.focus();
  frame.contentWindow?.print();
  window.setTimeout(() => frame.remove(), 60_000);
}
