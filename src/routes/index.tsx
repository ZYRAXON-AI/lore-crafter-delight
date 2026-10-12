import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowRight, BookOpen, Bookmark, Check, Search, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookCover } from '@/components/book-cover';
import { LibraryHeader } from '@/components/library-header';
import { bn, genres, type Book } from '@/lib/books';
import manuscripts from '@/lib/manuscripts.json';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'বইকথা — ত্রিশটি গল্পের নতুন জগৎ' },
    { name: 'description', content: 'ভূত, প্রেম, রহস্য ও কল্পনার ৩০টি স্বতন্ত্র অধ্যায়ভিত্তিক উপন্যাসের সংগ্রহ।' },
    { property: 'og:title', content: 'বইকথা — গল্পের ভেতর, নিজের মতো' },
    { property: 'og:description', content: 'স্বতন্ত্র প্রচ্ছদ ও নিজস্ব আবহে বাংলা উপন্যাসের প্রথম অধ্যায় পড়ুন।' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: Index,
});

function Index() {
  const books = manuscripts as Book[];
  const [genre, setGenre] = useState('সব বই');
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState<number[]>([]);
  const [view, setView] = useState('collection');
  const visible = books.filter(book => (genre === 'সব বই' || book.genre === genre) && (view !== 'saved' || saved.includes(book.id)) && `${book.title} ${book.subtitle} ${book.genre}`.includes(search.trim()));
  const featured = [books[5], books[0], books[15]].filter((book): book is Book => Boolean(book));
  return <><LibraryHeader/><main>
    <section className="intro-band"><div className="page-width intro-inner">
      <div className="intro-copy"><div className="eyebrow"><span className="small-line"/> কল্পনার কোনো শেষ নেই</div>
        <h1>বইকথা<span className="intro-title-sub">এক মলাটে, হাজার অনুভূতি।</span></h1>
        <p>কখনো গা ছমছমে অন্ধকার, কখনো একটুখানি ভালোবাসা।<br className="desktop-break"/> ত্রিশটি আলাদা জগৎ। আপনার পরের গল্পটি কোথায়?</p>
        <Button className="explore-button" onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}>গল্পের জগতে প্রবেশ <ArrowRight/></Button>
        <div className="intro-facts"><span><BookOpen size={15}/> ৩০টি উপন্যাস</span><span className="fact-dot">·</span><span>৬টি ভিন্ন জগৎ</span><span className="fact-dot">·</span><span>বাংলা ভাষায়</span></div>
      </div>
      <div className="featured-books" aria-label="নির্বাচিত বইয়ের প্রচ্ছদ">{featured.map((book, i) => <Link key={book.id} to="/books/$bookId" params={{ bookId: String(book.id) }} className={`featured-book featured-${i}`}><BookCover book={book} priority/></Link>)}<div className="featured-caption"><Sparkles size={14}/> পাতায় পাতায় নতুন পৃথিবী</div></div>
    </div></section>
    <section id="collection" className="page-width collection-section">
      <div className="collection-heading"><div><div className="eyebrow section-eyebrow">আপনার গল্প, আপনার পছন্দ</div><h2>গল্পের সংগ্রহ <span>{bn(books.length)}</span></h2></div>
        <div className="collection-views"><Button variant="ghost" className={view === 'collection' ? 'view-active' : ''} onClick={() => setView('collection')}><BookOpen/> সব বই</Button><Button variant="ghost" className={view === 'saved' ? 'view-active' : ''} onClick={() => setView('saved')}><Bookmark/> আমার তালিকা {saved.length > 0 && <span>{bn(saved.length)}</span>}</Button></div>
      </div>
      <div className="filter-row"><div className="genre-tabs">{['সব বই', ...genres].map(item => <Button key={item} variant="ghost" aria-pressed={genre === item} className={genre === item ? 'genre-tab active' : 'genre-tab'} onClick={() => setGenre(item)}>{item}</Button>)}</div>
        <div className="search-box"><Search size={17}/><input aria-label="বই খুঁজুন" placeholder="আপনার গল্প খুঁজুন..." value={search} onChange={event => setSearch(event.target.value)}/>{search && <Button variant="ghost" size="icon" aria-label="অনুসন্ধান মুছুন" onClick={() => setSearch('')}><X/></Button>}</div>
      </div>
      <div className="collection-summary"><span>{genre === 'সব বই' ? 'সব ধরনের গল্প' : genre} <span className="summary-dot">/</span> {bn(visible.length)}টি বই</span><span>প্রথম অধ্যায় প্রকাশিত <span className="status-dot"/></span></div>
      <div className="books-grid">{visible.map(book => <article className="book-item" key={book.id}>
        <div className="book-art"><Link to="/books/$bookId" params={{ bookId: String(book.id) }} aria-label={`${book.title} পড়ুন`}><BookCover book={book}/></Link><Button variant="secondary" size="icon" className="save-button" aria-label={`${book.title} ${saved.includes(book.id) ? 'তালিকা থেকে সরান' : 'তালিকায় রাখুন'}`} title="আমার তালিকা" onClick={() => setSaved(current => current.includes(book.id) ? current.filter(id => id !== book.id) : [...current, book.id])}>{saved.includes(book.id) ? <Check/> : <Bookmark/>}</Button></div>
        <div className="book-meta"><span className="genre-label">{book.genre}</span><span>উপন্যাস</span></div>
        <Link to="/books/$bookId" params={{ bookId: String(book.id) }} className="book-title">{book.title}</Link><p className="book-subtitle">{book.subtitle}</p>
        <div className="book-bottom"><span>{bn(book.chapters.length)} অধ্যায় উপলব্ধ</span><Link to="/books/$bookId" params={{ bookId: String(book.id) }} aria-label={`${book.title} খুলুন`}><ArrowRight size={16}/></Link></div>
      </article>)}</div>
      {!visible.length && <div className="empty-library"><BookOpen size={36}/><h3>{view === 'saved' ? 'আপনার তালিকা এখনো খালি' : 'এই নামে কোনো বই পাওয়া যায়নি'}</h3><Button variant="outline" onClick={() => { setSearch(''); setGenre('সব বই'); setView('collection'); }}>সব বই দেখুন <ArrowRight/></Button></div>}
    </section>
  </main><footer className="page-width library-footer"><span className="footer-brand">বইকথা.</span><span>ত্রিশটি উপন্যাসের সূচনা · পূর্ণাঙ্গ পাণ্ডুলিপি এখনো সম্পূর্ণ নয়</span><span>গল্পে বাঁচুক কল্পনা।</span></footer></>;
}
