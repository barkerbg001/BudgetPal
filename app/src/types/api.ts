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
  category: TransactionCategory;
  note: string;
  date: string;
  createdAt: string;
};

export type CreateTransactionInput = {
  amount: number;
  category: TransactionCategory;
  note?: string;
  date: string;
};

export type TransactionsResponse = {
  balance: number;
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
