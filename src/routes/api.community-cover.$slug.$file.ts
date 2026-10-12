import { createFileRoute } from "@tanstack/react-router";
import { COVER_CANDIDATES } from "@/lib/community-parse";

// Streams a submission cover image from GitHub through our own origin, so the
// browser never talks to GitHub and readers only ever see a normal image URL.
const OWNER = "zyraxon-X";
const REPO = "lore-crafter-delight";
const BRANCH = "main";
const FOLDER = "books-submission";

const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;

export const Route = createFileRoute("/api/community-cover/$slug/$file")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { slug, file } = params;
        if (!SAFE_SEGMENT.test(slug) || !SAFE_SEGMENT.test(file)) {
          return new Response("Bad request", { status: 400 });
        }
        if (!(COVER_CANDIDATES as readonly string[]).includes(file)) {
          return new Response("Not found", { status: 404 });
        }

        const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FOLDER}/${slug}/${file}`;
        const upstream = await fetch(url, { headers: { "User-Agent": "lore-crafter-delight" } });
        if (!upstream.ok) return new Response("Not found", { status: 404 });

        return new Response(upstream.body, {
          headers: {
            "content-type": upstream.headers.get("content-type") ?? "image/jpeg",
            "cache-control": "public, max-age=300, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
