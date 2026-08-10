const zar = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Signed amount for transaction rows, e.g. +R54.20 / -R12.50 */
export function formatMoney(amount: number): string {
  const formatted = zar.format(Math.abs(amount));
  if (amount < 0) {
    return `-${formatted}`;
  }
  if (amount > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

/** Absolute balance display (no leading +). */
export function formatBalance(amount: number): string {
  if (amount < 0) {
    return `-${zar.format(Math.abs(amount))}`;
  }
  return zar.format(amount);
}
