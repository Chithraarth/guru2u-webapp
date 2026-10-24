import { ReactNode } from 'react';
import { Download } from 'lucide-react';
import { Link } from 'wouter';

function StarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <path d="M50 6C52 40 60 48 94 50 60 52 52 60 50 94 48 60 40 52 6 50 40 48 48 40 50 6Z" fill="#4A1D6B" stroke="#F0567A" strokeWidth="3" />
      <circle cx="50" cy="50" r="6" fill="#FFE3EA" />
    </svg>
  );
}

/** Simple header and footer around the legal pages, matching the landing page. */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/85 border-b border-border">
        <div className="mx-auto max-w-5xl px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-foreground no-underline">
            <StarMark className="w-7 h-7" />
            <span className="font-display font-extrabold text-xl tracking-tight">Guru 2 u</span>
          </Link>
          <a
            href="/#download"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-primary text-primary-foreground text-sm font-bold no-underline hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Get the app
          </a>
        </div>
      </header>

      <main className="flex-1 w-full py-6">{children}</main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-5 py-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span>© 2026 Guru 2 u</span>
          <Link href="/privacy" className="hover:text-foreground">Privacy policy</Link>
          <Link href="/delete-account" className="hover:text-foreground">Delete account</Link>
          <a href="mailto:support@thechiguru.com" className="hover:text-foreground">support@thechiguru.com</a>
        </div>
      </footer>
    </div>
  );
}
