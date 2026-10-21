import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function PublicHeader() {
  return (
    <header className="fixed top-0 w-full z-50 navbar-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[var(--primary)] to-[var(--accent)] drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
            خطیب
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10 text-base font-medium text-[var(--foreground)]/80">
          <Link href="/about" className="hover:text-[var(--primary)] transition-colors">درباره ما</Link>
          <Link href="/pricing" className="hover:text-[var(--primary)] transition-colors">تعرفه‌ها</Link>
          <Link href="/help" className="hover:text-[var(--primary)] transition-colors">پشتیبانی</Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="glass" size="sm" className="hidden sm:flex">ورود</Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm" className="px-6">شروع رایگان</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}