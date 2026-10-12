# Lore Crafter Delight

একটি অ্যানিমেটেড বাংলা ডিজিটাল লাইব্রেরি — ৪৫টি পূর্ণদৈর্ঘ্য উপন্যাস, সাতটি ঘরানায়,
সবই বাংলায়। পড়া যায় ব্রাউজারে, ডাউনলোড করা যায় TXT/HTML/PDF-এ।

**Live app**: https://lore-crafter-delight.lovable.app

## এই সংস্করণে কী আছে

- **৪৫টি বই, ৭টি ঘরানা** — ভূত, প্রেম, রহস্য, ফ্যান্টাসি, অভিযান, বিজ্ঞান কল্পকাহিনি, হরর-রোম্যান্স।
- **প্রতি অধ্যায় ১৫–২০ পৃষ্ঠা** — মোট ~১৩.৬ লক্ষ শব্দ, প্রতিটি বই আট অধ্যায়ের।
- **লেজি-লোড আর্কিটেকচার** — প্রতি বই আলাদা `src/content/books/<id>.json` ফাইলে; শুধু হালকা
  `src/lib/book-index.json` তালিকা প্রথমে লোড হয়, তাই লাইব্রেরি দ্রুত খোলে।
- **কমিউনিটি জমা** — যে কেউ `books-submission/` ফোল্ডারে বই দিতে পারেন, বা `POST /api/books`
  দিয়ে এজেন্ট থেকে পাঠাতে পারেন; অটো-মার্জ ওয়ার্কফ্লো PR মার্জ করে দেয়।
- **দ্বিভাষিক** — বাংলা ও ইংরেজি ইন্টারফেস (BN↔EN)।
- **এক্সপোর্ট** — TXT, HTML ও প্রিন্ট/PDF।

## ডেভেলপমেন্ট

Node.js ও npm দরকার। তারপর:

```sh
npm i
npm run generate   # ৪৫টি বই নতুন করে লিখে src/content/books/ বানায়
npm run dev        # http://localhost:8080
```

অন্য কমান্ড:

```sh
npm test           # vitest
npm run lint       # eslint
npm run build      # generate + production build
```

`npm run build` প্রথমে `tools/generate-manuscripts.mjs` চালায়, যেটি ইঞ্জিন থেকে
৪৫টি বই তৈরি করে `src/content/books/*.json` ও `src/lib/book-index.json` লেখে।
`tools/seed-books.json`-এ মূল ত্রিশটি বইয়ের শিরোনাম ও রূপরেখা থাকে; বাকি পনেরোটি
হরর-রোম্যান্স বই জেনারেটরে যোগ করা।

## বই জমা দেওয়ার ব্যবস্থা

বিস্তারিত নিয়ম: [`books-submission/README.md`](books-submission/README.md)।

```sh
curl -X POST https://<your-site>/api/books \
  -H 'content-type: application/json' \
  -d '{
    "title": "আমার ভয়", "author": "আপনার নাম",
    "genre": "ভূত", "description": "ছোট পরিচিতি।",
    "book": "অধ্যায় ১: শুরু\n\n..."
  }'
```

সার্ভারে `GITHUB_TOKEN` থাকলে API নিজেই ব্রাঞ্চ, কমিট ও পুল রিকোয়েস্ট বানায়;
টোকেন না থাকলে যাচাই করা `meta.json` ও `book.txt` ফেরত দেয়।

## প্রযুক্তি

TanStack Start + React 19 + TypeScript + Tailwind CSS। ডেটা জেনারেশন ওয়েব অ্যাপের
বাইরে সাধারণ Node স্ক্রিপ্টে (`tools/`) হয়, তাই কনটেন্ট আর কোড আলাদা থাকে।

---

This project was originally scaffolded with [Lovable](https://lovable.dev) and now
runs as a standalone TanStack Start app.
