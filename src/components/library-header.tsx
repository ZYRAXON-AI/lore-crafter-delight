import { Link } from '@tanstack/react-router';
import { BookOpen, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LibraryHeader() {
  return <header className="library-header"><div className="page-width header-inner">
    <Link to="/" className="wordmark" aria-label="বইকথা — প্রথম পাতা"><span className="brand-symbol"><BookOpen size={22} /></span>বইকথা<span className="brand-dot">.</span></Link>
    <div className="header-note">গল্পের ভেতর, নিজের মতো।</div>
    <Button asChild variant="ghost" className="header-link"><Link to="/">বইয়ের সংগ্রহ <ArrowUpRight size={16}/></Link></Button>
  </div></header>;
}