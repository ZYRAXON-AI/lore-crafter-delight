# Lore Crafter Delight

একটি অ্যানিমেটেড বাংলা ডিজিটাল লাইব্রেরি — **৬০টি পূর্ণদৈর্ঘ্য উপন্যাস**, দশটি ঘরানায়,
সবই বাংলায়। পড়া যায় ব্রাউজারে, ডাউনলোড করা যায় TXT/HTML/PDF-এ।

**Live app**: https://lore-crafter-delight.lovable.app

## এই সংস্করণে কী আছে

- **৬০টি বই, ১০টি ঘরানা** — ভূত, প্রেম, রহস্য, ফ্যান্টাসি, অভিযান, বিজ্ঞান কল্পকাহিনি,
  হরর-রোম্যান্স, হাস্যরস, সামাজিক, অন্যান্য।
- **প্রতি অধ্যায় ১৫–২০ পৃষ্ঠা** — প্রতি অধ্যায় ≈ ৫,০০০ শব্দ; প্রতিটি বই ৮–১২ অধ্যায়ের।
- **লেজি-লোড আর্কিটেকচার** — প্রতি বই আলাদা `src/content/books/<id>.json` ফাইলে; শুধু হালকা
  `src/lib/book-index.json` তালিকা প্রথমে লোড হয়, তাই লাইব্রেরি দ্রুত খোলে।
- **কমিউনিটি জমা** — যে কেউ `pdf-library/` ফোল্ডারে নিজের নামে সাবফোল্ডারে
  `meta.json` ও বই রেখে PR দিলে, অটো-মার্জ ওয়ার্কফ্লো নিজেই মার্জ করে দেয়;
  অথবা এজেন্ট থেকে `POST /api/books` দিয়ে পাঠানো যায়।
- **দ্বিভাষিক** — বাংলা ও ইংরেজি ইন্টারফেস (BN↔EN)।
- **এক্সপোর্ট** — TXT, HTML ও প্রিন্ট/PDF।

## ডেভেলপমেন্ট

Node.js ও npm দরকার। তারপর:

```sh
npm i
npm run generate   # ৬০টি বই নতুন করে লিখে src/content/books/ বানায়
npm run dev        # http://localhost:8080
```

অন্য কমান্ড:

```sh
npm test           # vitest
npm run lint       # eslint
npm run build      # generate + production build
```

`npm run build` প্রথমে `tools/generate-manuscripts.mjs` চালায়, যেটি ইঞ্জিন থেকে
৬০টি বই তৈরি করে `src/content/books/*.json` ও `src/lib/book-index.json` লেখে।

গল্পের উৎস তিন স্তরে থাকে:

| ফাইল                              | কী দেয়                                                       |
| --------------------------------- | ------------------------------------------------------------ |
| `tools/seed-books.json`           | মূল ত্রিশটি বইয়ের শিরোনাম ও রূপরেখা                          |
| `tools/generate-manuscripts.mjs`  | পরের পনেরোটি হরর-রোম্যান্স বই                                |
| `tools/extra-books.mjs`           | নতুন পনেরোটি পূর্ণদৈর্ঘ্য বই — প্রেম, সামাজিক ও হাস্যরস       |
| `tools/manuscript-engine.mjs`     | জেনারেটর ইঞ্জিন: আবহ, সংলাপ ও আখ্যানের ছন্দ                  |
| `tools/manuscript-sections.mjs`   | অধ্যায়কে ১৫–২০ পৃষ্ঠায় টেনে নেওয়ার দুই স্তরের গদ্য          |
| `tools/manuscript-deep.mjs`       | অধ্যায়ের শেষ স্তর, যা প্রতিটি বইকে উপন্যাসের ওজন দেয়        |

## বই জমা দেওয়ার ব্যবস্থা

বিস্তারিত নিয়ম: [`pdf-library/README.md`](pdf-library/README.md)।

নিয়ম দুটো বড় কথা: **`pdf-library/<আপনার-বই>/` ফোল্ডারে `meta.json` বাধ্যতামূলক,
আর একটি কভার ছবি (`cover.*`/`icon.*`) বা `cover_url`-ও বাধ্যতামূলক।**
বইয়ের টেক্সট বা PDF থাকাও জরুরি — এই তিনটি ছাড়া জমা গ্রহণ করা হয় না।

```sh
curl -X POST https://<your-site>/api/books \
  -H 'content-type: application/json' \
  -d '{
    "title": "আমার ভয়", "author": "আপনার নাম",
    "genre": "ভূত", "description": "ছোট পরিচিতি।",
    "book": "অধ্যায় ১: শুরু\n\n..."
  }'
```

সার্ভারে `GITHUB_TOKEN` থাকলে API নিজেই `pdf-library/<slug>/` ব্রাঞ্চ, কমিট ও পুল
রিকোয়েস্ট বানায়; টোকেন না থাকলে যাচাই করা `meta.json` ও `book.txt` ফেরত দেয়।

## প্রযুক্তি

TanStack Start + React 19 + TypeScript + Tailwind CSS। ডেটা জেনারেশন ওয়েব অ্যাপের
বাইরে সাধারণ Node স্ক্রিপ্টে (`tools/`) হয়, তাই কনটেন্ট আর কোড আলাদা থাকে।

---

This project was originally scaffolded with [Lovable](https://lovable.dev) and now
runs as a standalone TanStack Start app.
