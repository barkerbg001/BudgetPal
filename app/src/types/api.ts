import type { Currency } from '../utils/currency';

export type { Currency };

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type TransactionCategory =
  | 'income'
  | 'housing'
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'health'
  | 'utilities'
  | 'other';

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  'income',
  'housing',
  'food',
  'transport',
  'entertainment',
  'shopping',
  'health',
  'utilities',
  'other',
];

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

export type CreateTransactionInput = {
  amount: number;
  currency: Currency;
  category: TransactionCategory;
  note?: string;
  date: string;
};

export type CurrencyBalance = {
  currency: Currency;
  amount: number;
};

export type TransactionsResponse = {
  balance: number;
  currency: Currency;
  balances: CurrencyBalance[];
  transactions: Transaction[];
};

export type CreateTransactionResponse = {
  transaction: Transaction;
  balance: number;
};

export type ApiErrorBody = {
  error: {
    message: string;
  };
};
