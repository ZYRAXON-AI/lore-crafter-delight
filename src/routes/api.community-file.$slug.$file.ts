import { createFileRoute } from "@tanstack/react-router";
import { COVER_CANDIDATES, BOOK_FILE_CANDIDATES } from "@/lib/community-parse";

// Streams a submission's cover, icon, PDF or EPUB from GitHub through our own
// origin, so the browser never talks to GitHub directly. Only files whose name
// appears in the allow-lists can be served, which keeps the route from turning
// into an open proxy for arbitrary repository paths.
const OWNER = process.env["BOOKS_REPO_OWNER"] ?? "zyraxon-X";
const REPO = process.env["BOOKS_REPO_NAME"] ?? "lore-crafter-delight";
const BRANCH = process.env["BOOKS_REPO_BRANCH"] ?? "main";
const FOLDERS = ["pdf-library", "books-submission"];

const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;
const ALLOWED = new Set<string>([...COVER_CANDIDATES, ...BOOK_FILE_CANDIDATES]);

const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".epub": "application/epub+zip",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

function contentType(name: string): string {
  const dot = name.lastIndexOf(".");
  return MIME[dot === -1 ? "" : name.slice(dot).toLowerCase()] ?? "application/octet-stream";
}

export const Route = createFileRoute("/api/community-file/$slug/$file")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { slug, file } = params;
        if (!SAFE_SEGMENT.test(slug) || !SAFE_SEGMENT.test(file)) {
          return new Response("Bad request", { status: 400 });
        }
        if (!ALLOWED.has(file)) return new Response("Not found", { status: 404 });

        const isPdf = file.toLowerCase().endsWith(".pdf");
        for (const folder of FOLDERS) {
          const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${folder}/${slug}/${file}`;
          const upstream = await fetch(url, { headers: { "User-Agent": "lore-crafter-delight" } });
          if (!upstream.ok) continue;
          const headers: Record<string, string> = {
            "content-type": upstream.headers.get("content-type") ?? contentType(file),
            "cache-control": "public, max-age=600, stale-while-revalidate=86400",
          };
          if (isPdf) headers["content-disposition"] = `inline; filename="${file}"`;
          return new Response(upstream.body, { headers });
        }
        return new Response("Not found", { status: 404 });
      },
    },
  },
});
