import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  confirmPhoneOtp,
  sendPhoneOtp,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from '@/lib/firebase';
import type { ConfirmationResult } from 'firebase/auth';

const RECAPTCHA_CONTAINER_ID = 'recaptcha-container';

function friendlyError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  const match = /\(auth\/([a-z-]+)\)/.exec(message);
  const code = match?.[1];
  const known: Record<string, string> = {
    'invalid-credential': 'Incorrect email or password.',
    'email-already-in-use': 'An account with this email already exists.',
    'weak-password': 'Password should be at least 6 characters.',
    'invalid-email': 'Please enter a valid email address.',
    'invalid-phone-number': 'Please enter a valid phone number, including country code.',
    'invalid-verification-code': 'That code is incorrect. Please try again.',
    'too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  };
  return (code && known[code]) || message.replace(/^Firebase:\s*/, '').replace(/\s*\(auth\/[a-z-]+\)\.?$/, '');
}

export function AuthPageShell({
  mode,
  title,
  subtitle,
  switchHref,
  switchText,
  switchLinkText,
}: {
  mode: 'sign-in' | 'sign-up';
  title: string;
  subtitle: string;
  switchHref: string;
  switchText: string;
  switchLinkText: string;
}) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [usePhone, setUsePhone] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      setLocation('/');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleEmailSubmit() {
    setError(null);
    setBusy(true);
    try {
      if (mode === 'sign-in') {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password);
      }
      setLocation('/');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSendOtp() {
    setError(null);
    setBusy(true);
    try {
      const result = await sendPhoneOtp(phone.trim(), RECAPTCHA_CONTAINER_ID);
      setConfirmation(result);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp() {
    if (!confirmation) return;
    setError(null);
    setBusy(true);
    try {
      await confirmPhoneOtp(confirmation, code.trim());
      setLocation('/');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-4 py-10">
      <div className="w-[440px] max-w-full rounded-2xl border border-border/60 bg-card/50 p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-bold mb-1">{title}</h1>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>

        <Button className="w-full mb-4" variant="outline" disabled={busy} onClick={handleGoogle}>
          {t('mobile.auth.continueWithGoogle')}
        </Button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">{t('mobile.auth.or')}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {!usePhone ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('mobile.auth.emailLabel')}</label>
              <Input
                type="email"
                autoCapitalize="none"
                value={email}
                placeholder={t('mobile.auth.emailPlaceholder')}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('mobile.auth.passwordLabel')}</label>
              <Input
                type="password"
                value={password}
                placeholder={t('mobile.auth.passwordPlaceholder')}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              className="w-full"
              disabled={busy || !email || !password}
              onClick={handleEmailSubmit}
            >
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'sign-in' ? t('mobile.auth.continue') : t('mobile.auth.signUp')}
            </Button>
            <button
              type="button"
              className="text-sm text-primary underline-offset-4 hover:underline w-full text-center"
              onClick={() => {
                setError(null);
                setUsePhone(true);
              }}
            >
              Use phone number instead
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {!confirmation ? (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone number</label>
                  <Input
                    type="tel"
                    value={phone}
                    placeholder="+1 555 555 5555"
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button className="w-full" disabled={busy || !phone} onClick={handleSendOtp}>
                  {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Send code
                </Button>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {t('mobile.auth.verificationCode')}
                  </label>
                  <Input
                    inputMode="numeric"
                    value={code}
                    placeholder={t('mobile.auth.verificationCodePlaceholder')}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button className="w-full" disabled={busy || !code} onClick={handleVerifyOtp}>
                  {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('mobile.auth.verify')}
                </Button>
              </>
            )}
            <button
              type="button"
              className="text-sm text-primary underline-offset-4 hover:underline w-full text-center"
              onClick={() => {
                setError(null);
                setUsePhone(false);
                setConfirmation(null);
              }}
            >
              Use email instead
            </button>
          </div>
        )}

        <div id={RECAPTCHA_CONTAINER_ID} />

        <p className="text-sm text-muted-foreground text-center mt-6">
          {switchText}{' '}
          <a href={switchHref} className="text-primary underline-offset-4 hover:underline">
            {switchLinkText}
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  const { t } = useTranslation();
  return (
    <AuthPageShell
      mode="sign-in"
      title={t('auth.signInTitle')}
      subtitle={t('auth.signInSubtitle')}
      switchHref="/sign-up"
      switchText={t('mobile.auth.noAccount')}
      switchLinkText={t('mobile.auth.signUp')}
    />
  );
}
