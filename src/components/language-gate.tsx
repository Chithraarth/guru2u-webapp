import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  LANGUAGES,
  COUNTRY_STORAGE_KEY,
  LOCALE_CHOSEN_KEY,
  detectBrowserLanguage,
  detectBrowserCountry,
} from '@/i18n';

/** ISO 3166-1 alpha-2 codes shown in the country picker. */
const COUNTRY_CODES = [
  'US','GB','IN','CA','AU','NZ','IE','ZA','NG','KE','GH','DE','AT','CH','FR','BE','ES','MX','AR','CL','CO','PE','PT','BR','IT','NL','SE','NO','DK','FI','PL','CZ','HU','RO','GR','TR','RU','UA','SA','AE','EG','MA','IL','PK','BD','LK','NP','CN','TW','HK','JP','KR','SG','MY','ID','TH','VN','PH',
];

function countryOptions(displayLocale: string) {
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames([displayLocale], { type: 'region' });
  } catch {
    // fall back to codes
  }
  return COUNTRY_CODES
    .map((code) => ({ code, name: names?.of(code) ?? code }))
    .sort((a, b) => a.name.localeCompare(b.name, displayLocale));
}

export function hasChosenLocale(): boolean {
  try {
    return localStorage.getItem(LOCALE_CHOSEN_KEY) === '1';
  } catch {
    return true;
  }
}

interface LanguageGateProps {
  onDone: () => void;
}

/** First-visit language + country picker, shown before anything else. */
export function LanguageGate({ onDone }: LanguageGateProps) {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(() => detectBrowserLanguage());
  const [country, setCountry] = useState(() => detectBrowserCountry());

  const countries = useMemo(() => countryOptions(language), [language]);

  const selectLanguage = (code: string) => {
    setLanguage(code);
    i18n.changeLanguage(code);
  };

  const confirm = () => {
    i18n.changeLanguage(language);
    try {
      localStorage.setItem(COUNTRY_STORAGE_KEY, country);
      localStorage.setItem(LOCALE_CHOSEN_KEY, '1');
    } catch {
      // storage unavailable — proceed anyway
    }
    onDone();
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="noise-overlay" />
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md p-8 space-y-6 animate-in fade-in duration-500">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-display font-bold" data-testid="text-gate-title">{t('languageGate.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('languageGate.subtitle')}</p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> {t('languageGate.language')}
          </Label>
          <div className="grid grid-cols-2 gap-2" data-testid="gate-language-grid">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => selectLanguage(l.code)}
                data-testid={`button-language-${l.code}`}
                className={`rounded-lg border px-3 py-2 text-sm text-start transition-colors ${
                  language === l.code
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border/60 hover:border-primary/40 text-foreground'
                }`}
              >
                {l.nativeName}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gate-country">{t('languageGate.country')}</Label>
          <select
            id="gate-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            data-testid="select-gate-country"
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        <Button variant="mystical" size="lg" className="w-full rounded-full" onClick={confirm} data-testid="button-gate-continue">
          <Sparkles className="me-2 w-5 h-5" /> {t('languageGate.continue')}
        </Button>
      </div>
    </div>
  );
}
