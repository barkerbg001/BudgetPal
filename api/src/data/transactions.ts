import { randomUUID } from 'node:crypto';

import {
  DEFAULT_CURRENCY,
  convertAmount,
  type Currency,
} from '../lib/currency';

export const TRANSACTION_CATEGORIES = [
  'income',
  'housing',
  'food',
  'transport',
  'entertainment',
  'shopping',
  'health',
  'utilities',
  'other',
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export type Transaction = {
  id: string;
  userId: string;
  amount: number;
  currency: Currency;
  category: TransactionCategory;
  note: string;
  date: string;
  createdAt: string;
};

export type CurrencyBalance = {
  currency: Currency;
  amount: number;
};

const transactions: Transaction[] = [];

export function listTransactionsForUser(userId: string): Transaction[] {
  return transactions
    .filter((tx) => tx.userId === userId)
    .sort((a, b) => {
      const byDate = b.date.localeCompare(a.date);
      if (byDate !== 0) {
        return byDate;
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export function getBalancesForUser(userId: string): CurrencyBalance[] {
  const totals = new Map<Currency, number>();
  for (const tx of listTransactionsForUser(userId)) {
    totals.set(tx.currency, (totals.get(tx.currency) ?? 0) + tx.amount);
  }
  return [...totals.entries()].map(([currency, amount]) => ({
    currency,
    amount,
  }));
}

export function getBalanceForUser(
  userId: string,
  currency: Currency = DEFAULT_CURRENCY,
): number {
  return listTransactionsForUser(userId).reduce(
    (sum, tx) => sum + convertAmount(tx.amount, tx.currency, currency),
    0,
  );
}

export function createTransaction(input: {
  userId: string;
  amount: number;
  currency?: Currency;
  category: TransactionCategory;
  note: string;
  date: string;
}): Transaction {
  const transaction: Transaction = {
    id: randomUUID(),
    userId: input.userId,
    amount: input.amount,
    currency: input.currency ?? DEFAULT_CURRENCY,
    category: input.category,
    note: input.note,
    date: input.date,
    createdAt: new Date().toISOString(),
  };
  transactions.push(transaction);
  return transaction;
}

export function clearTransactionsForUser(userId: string): number {
  const remaining: Transaction[] = [];
  let deleted = 0;
  for (const tx of transactions) {
    if (tx.userId === userId) {
      deleted += 1;
    } else {
      remaining.push(tx);
    }
  }
  transactions.length = 0;
  transactions.push(...remaining);
  return deleted;
}

export function seedTransactionsForUser(userId: string): void {
  const alreadySeeded = transactions.some((tx) => tx.userId === userId);
  if (alreadySeeded) {
    return;
  }

  const today = new Date();
  const isoDay = (daysAgo: number) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  };

  createTransaction({
    userId,
    amount: 3200,
    category: 'income',
    note: 'Monthly salary',
    date: isoDay(3),
  });
  createTransaction({
    userId,
    amount: -1200,
    category: 'housing',
    note: 'Rent',
    date: isoDay(2),
  });
  createTransaction({
    userId,
    amount: -54.2,
    category: 'food',
    note: 'Groceries',
    date: isoDay(1),
  });
  createTransaction({
    userId,
    amount: -18.5,
    category: 'transport',
    note: 'Transit pass top-up',
    date: isoDay(0),
  });
  createTransaction({
    userId,
    amount: 250,
    currency: 'USD',
    category: 'income',
    note: 'Freelance invoice',
    date: isoDay(4),
  });
  createTransaction({
    userId,
    amount: -12.5,
    currency: 'EUR',
    category: 'food',
    note: 'Airport coffee',
    date: isoDay(1),
  });
}
