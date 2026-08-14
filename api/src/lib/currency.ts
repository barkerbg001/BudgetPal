export const SUPPORTED_CURRENCIES = [
  'ZAR',
  'USD',
  'EUR',
  'GBP',
  'AUD',
  'CAD',
  'JPY',
  'INR',
  'BWP',
  'NGN',
] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = 'ZAR';

/** Approximate USD value of 1 unit. Used to convert between currencies. */
const USD_PER_UNIT: Record<Currency, number> = {
  USD: 1,
  EUR: 1.09,
  GBP: 1.27,
  AUD: 0.65,
  CAD: 0.73,
  JPY: 0.0067,
  INR: 0.0114,
  ZAR: 0.055,
  BWP: 0.074,
  NGN: 0.00065,
};

export function isCurrency(value: string): value is Currency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

export function convertAmount(
  amount: number,
  from: Currency,
  to: Currency,
): number {
  if (from === to) {
    return amount;
  }
  return (amount * USD_PER_UNIT[from]) / USD_PER_UNIT[to];
}
