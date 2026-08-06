const base = import.meta.env.BASE_URL; // includes trailing slash

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${base}api/billing/${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${base}api/billing/${path}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json() as Promise<T>;
}

export interface Plan {
  product_id: string;
  name: string;
  description: string | null;
  metadata: { planKey?: string; dailyLimit?: string };
  price_id: string;
  unit_amount: number;
  currency: string;
  interval: string | null;
}

export interface BillingStatus {
  planKey: string | null;
  planName: string | null;
  dailyLimit: number | null;
  usedToday: number;
  extraCredits: number;
  freeUntil: string | null;
  canRead: boolean;
  reason: string;
}

export interface ShareStatus {
  platforms: string[];
  required: number;
  claimed: boolean;
}

export const billing = {
  shareStatus: () => get<ShareStatus>('share'),
  recordShare: (platform: string) => post<ShareStatus>('share', { platform }),
  claimFreeMonth: () => post<BillingStatus>('claim-free-month'),
  plans: () => get<{ data: Plan[] }>('plans'),
  status: () => get<BillingStatus>('status'),
  checkout: (priceId: string) => post<{ url: string }>('checkout', { priceId }),
  extraCheckout: (quantity = 1) => post<{ url: string }>('extra-checkout', { quantity }),
  confirm: (sessionId: string) => post<BillingStatus>('confirm', { sessionId }),
  portal: () => post<{ url: string }>('portal'),
};

/** Local currency from the chosen country (language gate), falling back to the browser locale. */
export function guessLocalCurrency(): string {
  try {
    let region: string | undefined;
    try {
      region = localStorage.getItem('app-country') ?? undefined;
    } catch {
      // storage unavailable
    }
    if (!region) {
      region = new Intl.Locale(navigator.language).maximize().region;
    }
    const map: Record<string, string> = {
      US: 'USD', GB: 'GBP', IN: 'INR', CA: 'CAD', AU: 'AUD', NZ: 'NZD',
      JP: 'JPY', CN: 'CNY', SG: 'SGD', AE: 'AED', SA: 'SAR', BR: 'BRL',
      MX: 'MXN', ZA: 'ZAR', NG: 'NGN', KE: 'KES', RU: 'RUB', KR: 'KRW',
      ID: 'IDR', MY: 'MYR', TH: 'THB', PH: 'PHP', PK: 'PKR', BD: 'BDT',
      LK: 'LKR', NP: 'NPR', TR: 'TRY', EG: 'EGP', CH: 'CHF', SE: 'SEK',
      NO: 'NOK', DK: 'DKK', PL: 'PLN', CZ: 'CZK', HU: 'HUF', IL: 'ILS',
      HK: 'HKD', TW: 'TWD', VN: 'VND', AR: 'ARS', CL: 'CLP', CO: 'COP',
    };
    if (region && map[region]) return map[region];
    const euro = ['DE','FR','ES','IT','NL','BE','AT','PT','IE','FI','GR','SK','SI','LV','LT','EE','LU','CY','MT','HR'];
    if (region && euro.includes(region)) return 'EUR';
  } catch {
    // ignore
  }
  return 'USD';
}

let ratesCache: Record<string, number> | null = null;

/** INR-based exchange rates (cached). Returns null when unavailable. */
export async function getInrRates(): Promise<Record<string, number> | null> {
  if (ratesCache) return ratesCache;
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/INR');
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.result === 'success' && data.rates) {
      ratesCache = data.rates as Record<string, number>;
      return ratesCache;
    }
  } catch {
    // offline or blocked — INR only
  }
  return null;
}

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
  }).format(amount);
}
