import {
  CURRENCY_META,
  DEFAULT_CURRENCY,
  type Currency,
} from './currency';

const formatters = new Map<Currency, Intl.NumberFormat>();

function formatterFor(currency: Currency): Intl.NumberFormat {
  const existing = formatters.get(currency);
  if (existing) {
    return existing;
  }
  const formatter = new Intl.NumberFormat(CURRENCY_META[currency].locale, {
    style: 'currency',
    currency,
  });
  formatters.set(currency, formatter);
  return formatter;
}

/** Signed amount for transaction rows, e.g. +R54.20 / -$12.50 */
export function formatMoney(
  amount: number,
  currency: Currency = DEFAULT_CURRENCY,
): string {
  const formatted = formatterFor(currency).format(Math.abs(amount));
  if (amount < 0) {
    return `-${formatted}`;
  }
  if (amount > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

/** Absolute balance display (no leading +). */
export function formatBalance(
  amount: number,
  currency: Currency = DEFAULT_CURRENCY,
): string {
  const formatted = formatterFor(currency).format(Math.abs(amount));
  if (amount < 0) {
    return `-${formatted}`;
  }
  return formatterFor(currency).format(amount);
}
