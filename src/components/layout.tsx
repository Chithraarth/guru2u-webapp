import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Sparkles, Library, Home, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { signOutUser } from "@/lib/firebase";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden bg-background">
      <div className="noise-overlay" />
      
      {/* Background gradients for mystical vibe */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/60 border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <Sparkles className="w-5 h-5" />
            <span className="font-display font-bold text-lg tracking-tight">Guru 2 u</span>
          </Link>
          
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link 
              href="/" 
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors",
                location === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{t("nav.oracle")}</span>
            </Link>
            <Link 
              href="/readings" 
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors",
                location.startsWith("/readings") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Library className="w-4 h-4" />
              <span className="hidden sm:inline">{t("nav.history")}</span>
            </Link>
            <LanguageSwitcher />
            {!user && (
              <Link
                href="/sign-in"
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-4 h-4" />
                <span>{t("nav.signIn")}</span>
              </Link>
            )}
            {user && (
              <button
                type="button"
                onClick={() => {
                  signOutUser();
                  setLocation(basePath || "/");
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t("nav.signOut")}</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col z-10">
        {children}
      </main>
      
      <footer className="py-6 text-center text-xs text-muted-foreground/60 relative z-10 border-t border-border/50">
        <p>{t("footer.tagline")}</p>
      </footer>
    </div>
  );
}
