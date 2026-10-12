import { createFileRoute } from "@tanstack/react-router";
import { SubmissionError, validateSubmission, type BookPayload } from "@/lib/book-submission";

// Agents and humans POST a book here to submit it to the library. With a GitHub
// token that can write to the repo, the endpoint commits the book straight to
// the books-submission folder on a branch and opens a pull request; without a
// token it still validates the payload and returns the exact files to commit,
// so the caller can finish the submission by hand.
const OWNER = process.env["BOOKS_REPO_OWNER"] ?? "zyraxon-X";
const REPO = process.env["BOOKS_REPO_NAME"] ?? "lore-crafter-delight";
const BASE = process.env["BOOKS_REPO_BRANCH"] ?? "main";
const FOLDER = "pdf-library";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "cache-control": "no-store" } });

function githubHeaders(token: string): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "lore-crafter-delight",
    "content-type": "application/json",
  };
}

async function github(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: { ...githubHeaders(token), ...(init?.headers ?? {}) },
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

export const Route = createFileRoute("/api/books")({
  server: {
    handlers: {
      GET: () => json({ ok: true, message: "POST a book payload here to submit it." }),

      POST: async ({ request }) => {
        let payload: BookPayload;
        try {
          payload = (await request.json()) as BookPayload;
        } catch {
          return json({ ok: false, error: "JSON পড়া গেল না।" }, 400);
        }

        let submission;
        try {
          submission = validateSubmission(payload);
        } catch (error) {
          if (error instanceof SubmissionError) {
            return json({ ok: false, error: error.message }, error.status);
          }
          throw error;
        }

        const files = [
          {
            path: `${FOLDER}/${submission.slug}/meta.json`,
            content: `${JSON.stringify(submission.meta, null, 2)}\n`,
          },
          { path: `${FOLDER}/${submission.slug}/book.txt`, content: `${submission.bookText}\n` },
          ...(submission.coverFile
            ? [
                {
                  path: `${FOLDER}/${submission.slug}/${submission.coverFile.name}`,
                  content: submission.coverFile.content,
                },
              ]
            : []),
        ];

        const token = process.env["GITHUB_TOKEN"];
        const fallback = (reason: string) =>
          json({
            ok: true,
            committed: false,
            message: reason,
            slug: submission.slug,
            chapterCount: submission.chapterCount,
            wordCount: submission.wordCount,
            files,
          });

        if (!token) {
          return fallback("যাচাই সফল। GitHub টোকেন নেই, তাই ফাইলগুলো নিজে কমিট করুন।");
        }

        const branch = `book/${submission.slug}`;
        const baseRef = await github(token, `/repos/${OWNER}/${REPO}/git/ref/heads/${BASE}`);
        if (!baseRef.ok) return fallback("বেস ব্রাঞ্চ পড়া গেল না; ফাইলগুলো নিজে কমিট করুন।");
        const baseSha = (baseRef.data as { object?: { sha?: string } }).object?.sha;
        if (!baseSha) return fallback("বেস কমিট পাওয়া গেল না; ফাইলগুলো নিজে কমিট করুন।");

        // Reuse the branch if a previous attempt already created it. A write
        // failure here usually means the token is read-only, so the validated
        // files are returned instead of a hard error.
        const existing = await github(token, `/repos/${OWNER}/${REPO}/git/ref/heads/${branch}`);
        if (!existing.ok) {
          const created = await github(token, `/repos/${OWNER}/${REPO}/git/refs`, {
            method: "POST",
            body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
          });
          if (!created.ok) {
            return fallback("টোকেনে লেখার অনুমতি নেই; নিচের ফাইলগুলো নিজে কমিট করুন।");
          }
        }

        for (const file of files) {
          const current = await github(
            token,
            `/repos/${OWNER}/${REPO}/contents/${file.path}?ref=${branch}`,
          );
          const sha = current.ok ? (current.data as { sha?: string }).sha : undefined;
          const write = await github(token, `/repos/${OWNER}/${REPO}/contents/${file.path}`, {
            method: "PUT",
            body: JSON.stringify({
              message: `বই যোগ: ${submission.meta.title}`,
              content: Buffer.from(file.content, "utf8").toString("base64"),
              branch,
              ...(sha ? { sha } : {}),
            }),
          });
          if (!write.ok) {
            return fallback(`টোকেনে "${file.path}" লেখার অনুমতি নেই; ফাইলগুলো নিজে কমিট করুন।`);
          }
        }

        const pr = await github(token, `/repos/${OWNER}/${REPO}/pulls`, {
          method: "POST",
          body: JSON.stringify({
            title: `বই যোগ: ${submission.meta.title}`,
            head: branch,
            base: BASE,
            body: [
              `**${submission.meta.title}** — ${submission.meta.author}`,
              "",
              submission.meta.description,
              "",
              `ঘরানা: ${submission.meta.genre} · ভাষা: ${submission.meta.language}`,
              `অধ্যায়: ${submission.chapterCount} · শব্দ: ${submission.wordCount}`,
              "",
              "_এটি OpenHands এজেন্ট API-এর মাধ্যমে জমা দেওয়া হয়েছে।_",
            ].join("\n"),
          }),
        });

        if (!pr.ok) {
          return json({
            ok: true,
            committed: true,
            pullRequest: undefined,
            slug: submission.slug,
            branch,
            message: "ব্রাঞ্চে লেখা হয়েছে, কিন্তু PR খোলা গেল না।",
          });
        }
        const prUrl = (pr.data as { html_url?: string }).html_url;

        return json({
          ok: true,
          committed: true,
          slug: submission.slug,
          chapterCount: submission.chapterCount,
          wordCount: submission.wordCount,
          branch,
          pullRequest: prUrl,
          message: "বই জমা হয়েছে—পুল রিকোয়েস্ট খোলা হয়েছে।",
        });
      },
    },
  },
});
