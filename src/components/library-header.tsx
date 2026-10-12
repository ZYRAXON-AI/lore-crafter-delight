import { Link } from "@tanstack/react-router";
import { BookOpen, ArrowUpRight, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

export function LibraryHeader() {
  const { lang, setLang, t } = useLanguage();
  const next = lang === "bn" ? "en" : "bn";

  return (
    <header className="library-header">
      <div className="page-width header-inner">
        <Link to="/" className="wordmark" aria-label="বইকথা — প্রথম পাতা">
          <span className="brand-symbol">
            <BookOpen size={22} />
          </span>
          বইকথা<span className="brand-dot">.</span>
        </Link>
        <div className="header-note">{t("brand.tagline")}</div>
        <div className="header-tools">
          <Button
            variant="ghost"
            className="language-toggle"
            onClick={() => setLang(next)}
            aria-label={`${t("header.language")}: ${next.toUpperCase()}`}
            title={`${t("header.language")}: ${next.toUpperCase()}`}
          >
            <Languages size={16} />
            <span className="language-current">{lang.toUpperCase()}</span>
            <span className="language-next">{next.toUpperCase()}</span>
          </Button>
          <Button asChild variant="ghost" className="header-link">
            <Link to="/">
              {t("header.collection")} <ArrowUpRight size={16} />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
