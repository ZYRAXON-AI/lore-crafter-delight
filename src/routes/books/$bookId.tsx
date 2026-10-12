import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Download, Minus, Plus, List, X, Check, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookCover } from '@/components/book-cover';
import { LibraryHeader } from '@/components/library-header';
import { bn, genreClass, type Book } from '@/lib/books';
import manuscripts from '@/lib/manuscripts.json';

export const Route = createFileRoute('/books/$bookId')({
  loader: ({ params }) => { const book = (manuscripts as Book[]).find(item => String(item.id) === params.bookId); if (!book) throw notFound(); return book; },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.title ?? 'উপন্যাস'} — বইকথা` },
    { name: 'description', content: loaderData?.subtitle ?? 'বইকথার বাংলা উপন্যাস' },
    { property: 'og:title', content: `${loaderData?.title ?? 'উপন্যাস'} — বইকথা` },
    { property: 'og:description', content: loaderData?.subtitle ?? 'বাংলা উপন্যাসের অধ্যায় পড়ুন।' },
    { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: Reader,
});

function Reader() {
  const book = Route.useLoaderData();
  const [chapterIndex, setChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState(1);
  const [showContents, setShowContents] = useState(false);
  const [finished, setFinished] = useState(false);
  const chapter = book.chapters[chapterIndex];
  const download = () => {
    const text = `${book.title}\n${book.subtitle}\n\nপাণ্ডুলিপির সূচনা — পূর্ণাঙ্গ উপন্যাস নয়\n\n${book.chapters.map(item => `${item.title}\n\n${item.paragraphs.join('\n\n')}`).join('\n\n')}\n\nপরিকল্পিত অধ্যায়\n${book.outline.map((item, i) => `${bn(i + 1)}. ${item}`).join('\n')}`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = `${book.title}-প্রথম-অধ্যায়.txt`; link.click(); URL.revokeObjectURL(url);
  };
  if (!chapter) return null;
  return <div className={`reader-page ${genreClass(book.genre)}`}><LibraryHeader/><div className="page-width reader-toolbar"><Button asChild variant="ghost"><Link to="/"><ArrowLeft/> সংগ্রহে ফিরুন</Link></Button><div className="reader-actions"><Button variant="ghost" size="icon" aria-label="অক্ষর ছোট করুন" disabled={fontSize === 0} onClick={() => setFontSize(size => Math.max(0, size - 1))}><Minus/></Button><span>অ আ</span><Button variant="ghost" size="icon" aria-label="অক্ষর বড় করুন" disabled={fontSize === 2} onClick={() => setFontSize(size => Math.min(2, size + 1))}><Plus/></Button><Button variant="ghost" size="icon" title="পাণ্ডুলিপির সূচনা নামান" aria-label="পাণ্ডুলিপির সূচনা নামান" onClick={download}><Download/></Button><Button variant="outline" onClick={() => setShowContents(value => !value)}>{showContents ? <X/> : <List/>} সূচিপত্র</Button></div></div>
    <div className="reader-layout page-width"><aside className={`reader-sidebar ${showContents ? 'contents-open' : ''}`}><div className="reader-mini-cover"><BookCover book={book}/></div><h2>{book.title}</h2><p className="reader-status">প্রথম অধ্যায় · অসম্পূর্ণ পাণ্ডুলিপি</p><h3 className="contents-heading">অধ্যায় পরিকল্পনা</h3><nav aria-label="সূচিপত্র">{book.outline.map((title, i) => <Button key={title} variant="ghost" disabled={i >= book.chapters.length} className={i === chapterIndex ? 'chapter-link selected' : 'chapter-link'} onClick={() => { setChapterIndex(i); setFinished(false); setShowContents(false); }}><span>{bn(i + 1).padStart(2, '০')}</span><span>{title}</span>{i >= book.chapters.length && <LockKeyhole size={12}/>}</Button>)}</nav></aside>
      <article className={`reading-sheet reading-size-${fontSize}`}><div className="reader-kicker">বইকথা <span> / </span> {book.genre}</div><h1>{book.title}</h1><p className="reader-subtitle">{book.subtitle}</p><div className="chapter-ornament"><span/>✦<span/></div><div className="chapter-number">অধ্যায় {bn(chapterIndex + 1)}</div><h2>{chapter.title}</h2><div className="chapter-prose" key={chapterIndex}>{chapter.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div><div className="chapter-ornament end-ornament"><span/>✦<span/></div><div className="reading-end"><span>এই অধ্যায়ের সমাপ্তি</span><Button variant={finished ? 'secondary' : 'outline'} onClick={() => setFinished(value => !value)}>{finished ? <Check/> : <ArrowRight/>}{finished ? 'অধ্যায় পড়া হয়েছে' : 'পড়া শেষ'}</Button></div><p className="manuscript-note">পরবর্তী অধ্যায় এখনো লেখা হয়নি। এটি দীর্ঘ উপন্যাসের সূচনা, পূর্ণাঙ্গ বই নয়।</p></article>
    </div></div>;
}