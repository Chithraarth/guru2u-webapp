import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Facebook, Gift, Loader2, MessageCircle, Share2, Twitter, Instagram } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { billing, type BillingStatus, type ShareStatus } from '@/lib/billing';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

const SHARE_TEXT = 'I just got my personality read by an AI guru on Guru 2 u — face, palm, voice and stars. Try it:';

interface PlatformDef {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: 'open' | 'copy';
  url: (appUrl: string) => string;
}

const PLATFORMS: PlatformDef[] = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    action: 'open',
    url: (u) => `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${u}`)}`,
  },
  {
    key: 'twitter',
    label: 'X (Twitter)',
    icon: Twitter,
    action: 'open',
    url: (u) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(u)}`,
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    action: 'open',
    url: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  },
  {
    key: 'instagram',
    label: 'Instagram (copy link)',
    icon: Instagram,
    action: 'copy',
    url: (u) => u,
  },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [share, setShare] = useState<ShareStatus | null>(null);
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const appUrl = useMemo(() => `${window.location.origin}${basePath || '/'}`, []);

  useEffect(() => {
    billing.shareStatus().then(setShare).catch(() => {});
    billing.status().then(setStatus).catch(() => {});
  }, []);

  const shared = new Set(share?.platforms ?? []);
  const required = share?.required ?? 3;
  const done = Math.min(shared.size, required);
  const eligible = !share?.claimed && shared.size >= required;
  const freeActive = status?.freeUntil && new Date(status.freeUntil) > new Date();

  async function handleShare(p: PlatformDef) {
    if (shared.has(p.key) || share?.claimed) return;
    setBusy(p.key);
    try {
      if (p.action === 'copy') {
        await navigator.clipboard.writeText(appUrl);
        toast({ title: 'Link copied', description: 'Paste it into your Instagram bio or story.' });
      } else {
        window.open(p.url(appUrl), '_blank', 'noopener,noreferrer');
      }
      const st = await billing.recordShare(p.key);
      setShare(st);
    } catch (err: any) {
      toast({ title: 'Could not record share', description: err?.message ?? 'Please try again.', variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  }

  async function claim() {
    setBusy('claim');
    try {
      const st = await billing.claimFreeMonth();
      setStatus(st);
      setShare((s) => (s ? { ...s, claimed: true } : s));
      toast({
        title: 'Free month unlocked!',
        description: st.freeUntil
          ? `Unlimited readings until ${new Date(st.freeUntil).toLocaleDateString()}.`
          : 'Unlimited readings for 30 days.',
      });
    } catch (err: any) {
      toast({ title: 'Could not claim', description: err?.message ?? 'Please try again.', variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-10 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Your profile</h1>
        {user && (
          <p className="text-muted-foreground text-sm">
            {user.email ?? user.phoneNumber ?? user.displayName ?? ''}
          </p>
        )}
      </div>

      {status && (
        <div className="mb-8 rounded-xl border border-border/60 bg-card/50 p-4 text-sm text-center">
          {freeActive ? (
            <span className="text-primary font-medium">
              Free month active until {new Date(status.freeUntil!).toLocaleDateString()} — unlimited readings.
            </span>
          ) : status.planName ? (
            <>Current plan: <span className="text-primary font-medium">{status.planName}</span></>
          ) : (
            <>
              No active plan — <Link href="/pricing" className="text-primary underline">see plans</Link>
            </>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="w-6 h-6 text-primary" />
          <h2 className="font-display font-semibold text-lg">Earn a free month</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Share Guru 2 u on {required} social platforms and unlock 30 days of unlimited readings. One reward per seeker.
        </p>

        <div className="mb-5">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{done}/{required} platforms shared</span>
            {share?.claimed && <span className="text-primary">Reward claimed</span>}
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(done / required) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          {PLATFORMS.map((p) => {
            const isDone = shared.has(p.key);
            const Icon = isDone ? Check : p.icon;
            return (
              <Button
                key={p.key}
                variant={isDone ? 'secondary' : 'outline'}
                className="justify-start"
                disabled={isDone || busy === p.key || Boolean(share?.claimed)}
                onClick={() => handleShare(p)}
              >
                {busy === p.key ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Icon className={`w-4 h-4 mr-2 ${isDone ? 'text-primary' : ''}`} />
                )}
                {isDone ? `${p.label} — shared` : p.action === 'copy' ? p.label : `Share on ${p.label}`}
                {p.action === 'copy' && !isDone && <Copy className="w-3 h-3 ml-auto opacity-60" />}
              </Button>
            );
          })}
        </div>

        {share?.claimed ? (
          <p className="text-sm text-center text-muted-foreground">
            <Check className="w-4 h-4 inline mr-1 text-primary" />
            You've claimed your free month{freeActive ? ` — active until ${new Date(status!.freeUntil!).toLocaleDateString()}` : ''}.
          </p>
        ) : (
          <Button className="w-full" disabled={!eligible || busy === 'claim'} onClick={claim}>
            {busy === 'claim' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Share2 className="w-4 h-4 mr-2" />
            {eligible ? 'Claim your free month' : `Share on ${required - done} more platform${required - done === 1 ? '' : 's'} to unlock`}
          </Button>
        )}
      </div>
    </div>
  );
}
