import { useEffect, useMemo, useState } from 'react';
import { useSearch } from 'wouter';
import { Link } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { Sparkles, Check, Crown, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import {
  billing,
  guessLocalCurrency,
  getInrRates,
  formatMoney,
  type Plan,
  type BillingStatus,
} from '@/lib/billing';

const PLAN_ORDER = ['monthly', 'yearly_basic', 'yearly_unlimited'];
export default function PricingPage() {
  const search = useSearch();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const localCurrency = useMemo(() => guessLocalCurrency(), []);

  useEffect(() => {
    billing.plans().then((r) => setPlans(r.data)).catch(() => {});
    billing.status().then(setStatus).catch(() => {});
    getInrRates().then(setRates);
  }, []);

  // Handle checkout returns
  useEffect(() => {
    const params = new URLSearchParams(search);
    const s = params.get('status');
    if (s === 'success') {
      toast({ title: t('pricing.successTitle'), description: t('pricing.successDesc') });
      billing.status().then(setStatus).catch(() => {});
    } else if (s === 'extra_success') {
      const sessionId = params.get('session_id');
      if (sessionId) {
        billing.confirm(sessionId)
          .then((st) => {
            setStatus(st);
            toast({ title: t('pricing.extraSuccessTitle'), description: t('pricing.extraSuccessDesc', { count: st.extraCredits }) });
          })
          .catch(() => {});
      }
    } else if (s === 'cancelled') {
      toast({ title: t('pricing.cancelledTitle'), description: t('pricing.cancelledDesc') });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const subPlans = PLAN_ORDER
    .map((key) => plans.find((p) => p.metadata?.planKey === key))
    .filter(Boolean) as Plan[];
  const extraPlan = plans.find((p) => p.metadata?.planKey === 'extra_reading');

  function localApprox(amountInrMinor: number): string | null {
    if (!rates || localCurrency === 'INR') return null;
    const rate = rates[localCurrency];
    if (!rate) return null;
    return `≈ ${formatMoney((amountInrMinor / 100) * rate, localCurrency)}`;
  }

  async function go(fn: () => Promise<{ url: string }>, key: string) {
    setBusy(key);
    try {
      const { url } = await fn();
      window.location.href = url;
    } catch (err: any) {
      setBusy(null);
      toast({
        title: t('pricing.errorTitle'),
        description: err?.message || t('pricing.errorDesc'),
        variant: 'destructive',
      });
    }
  }

  const planFeatures = (key: string): string[] => {
    const features = t(`pricing.features.${key}`, { returnObjects: true, defaultValue: [] });
    return Array.isArray(features) ? (features as string[]) : [];
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-10 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
          {t('pricing.title')} <span className="text-primary">{t('pricing.titleHighlight')}</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {t('pricing.subtitle')}
        </p>
        {new URLSearchParams(search).get('limit') === 'reached' && (
          <p className="mt-4 text-sm text-amber-400">
            {t('pricing.limitReached')}
          </p>
        )}
      </div>

      {user && status && (
        <div className="mb-8 rounded-xl border border-border/60 bg-card/50 p-4 text-sm text-center">
          {status.freeUntil && new Date(status.freeUntil) > new Date() ? (
            <>
              <span className="text-primary font-medium">
                Free month active until {new Date(status.freeUntil).toLocaleDateString()}
              </span>
              {' · '}
              {t('pricing.unlimitedReadings')}
            </>
          ) : status.planName ? (
            <>
              {t('pricing.currentPlan')} <span className="text-primary font-medium">{status.planName}</span>
              {' · '}
              {status.dailyLimit === null
                ? t('pricing.unlimitedReadings')
                : t('pricing.usedToday', { used: status.usedToday, limit: status.dailyLimit })}
              {status.extraCredits > 0 && <> · {t('pricing.extraBanked', { count: status.extraCredits })}</>}
              <div className="mt-2">
                <Button variant="outline" size="sm" disabled={busy === 'portal'} onClick={() => go(billing.portal, 'portal')}>
                  {busy === 'portal' && <Loader2 className="w-4 h-4 me-1 animate-spin" />}
                  {t('pricing.manageSubscription')}
                </Button>
              </div>
            </>
          ) : (
            <>
              {t('pricing.noActivePlan')}{status.extraCredits > 0 && <> · {t('pricing.extraBanked', { count: status.extraCredits })}</>}
            </>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-5">
        {subPlans.map((plan) => {
          const key = plan.metadata.planKey!;
          const highlight = key === 'yearly_unlimited';
          return (
            <div
              key={plan.price_id}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                highlight ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border/60 bg-card/50'
              }`}
            >
              {highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-1">
                  <Crown className="w-3 h-3" /> {t('pricing.bestValue')}
                </span>
              )}
              <h3 className="font-display font-semibold text-lg mb-1">{plan.name}</h3>
              <div className="mb-1">
                <span className="text-3xl font-bold">{formatMoney(plan.unit_amount / 100, 'INR')}</span>
                <span className="text-muted-foreground text-sm">{plan.interval === 'year' ? t('pricing.perYear') : t('pricing.perMonth')}</span>
              </div>
              {localApprox(plan.unit_amount) && (
                <p className="text-xs text-muted-foreground mb-3">{localApprox(plan.unit_amount)}</p>
              )}
              <ul className="space-y-2 text-sm mb-6 mt-2 flex-1">
                {planFeatures(key).map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              {user ? (
                <Button
                  className="w-full"
                  variant={highlight ? 'default' : 'outline'}
                  disabled={busy === plan.price_id || status?.planKey === key}
                  onClick={() => go(() => billing.checkout(plan.price_id), plan.price_id)}
                >
                  {busy === plan.price_id && <Loader2 className="w-4 h-4 me-1 animate-spin" />}
                  {status?.planKey === key ? t('pricing.yourCurrentPlan') : t('pricing.subscribe')}
                </Button>
              ) : (
                <Link href="/sign-up">
                  <Button className="w-full" variant={highlight ? 'default' : 'outline'}>
                    {t('pricing.signUpToSubscribe')}
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {extraPlan && (
        <div className="mt-8 rounded-2xl border border-border/60 bg-card/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="font-semibold">{t('pricing.extraTitle')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('pricing.extraDesc', {
                  price: formatMoney(extraPlan.unit_amount / 100, 'INR'),
                  approx: localApprox(extraPlan.unit_amount) ? ` (${localApprox(extraPlan.unit_amount)})` : '',
                })}
              </p>
            </div>
          </div>
          {user ? (
            <Button
              variant="outline"
              disabled={busy === 'extra'}
              onClick={() => go(() => billing.extraCheckout(1), 'extra')}
            >
              {busy === 'extra' && <Loader2 className="w-4 h-4 me-1 animate-spin" />}
              {t('pricing.buyExtra')}
            </Button>
          ) : (
            <Link href="/sign-up">
              <Button variant="outline">{t('pricing.signUpFirst')}</Button>
            </Link>
          )}
        </div>
      )}

      {subPlans.length === 0 && (
        <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-2">
          <Sparkles className="w-6 h-6" />
          {t('pricing.plansLoading')}
        </div>
      )}
    </div>
  );
}
