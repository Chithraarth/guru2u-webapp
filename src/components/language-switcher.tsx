import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LANGUAGES } from '@/i18n';
import { cn } from '@/lib/utils';

/** Compact language picker for the header. */
export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage?.split('-')[0] ?? 'en';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('common.changeLanguage')}
          data-testid="button-language-switcher"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline uppercase">{current}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => i18n.changeLanguage(l.code)}
            data-testid={`menuitem-language-${l.code}`}
            className={cn(current === l.code && 'bg-primary/10 text-primary font-medium')}
          >
            {l.nativeName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
