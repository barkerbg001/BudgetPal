import { create } from 'zustand';

import {
  ApiError,
  clearTransactionsRequest,
  createTransactionRequest,
  fetchTransactions,
} from '../api/client';
import type { CreateTransactionInput, Transaction } from '../types/api';
import { DEFAULT_CURRENCY, convertAmount, isCurrency } from '../utils/currency';
import { useAuthStore } from './authStore';
import { useUiStore } from './uiStore';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

function withCurrency(tx: Transaction): Transaction {
  return {
    ...tx,
    currency: isCurrency(tx.currency) ? tx.currency : DEFAULT_CURRENCY,
  };
}

function isPendingTemp(tx: Transaction): boolean {
  return tx.id.startsWith('temp-');
}

/** In-flight create requests — awaited before refetch so History stays in sync. */
let pendingCreates: Promise<unknown>[] = [];

async function flushPendingCreates(): Promise<void> {
  const snackbar = useUiStore.getState().snackbar;
  if (snackbar?.onDismiss) {
    snackbar.onDismiss();
    useUiStore.getState().hideSnackbar();
  }

  if (pendingCreates.length === 0) {
    return;
  }

  await Promise.allSettled([...pendingCreates]);
}

type TransactionsState = {
  balance: number;
  transactions: Transaction[];
  status: LoadStatus;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (input: CreateTransactionInput) => void;
  clearTransactions: () => Promise<void>;
};

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  balance: 0,
  transactions: [],
  status: 'idle',
  error: null,

  fetchTransactions: async () => {
    set({ status: 'loading', error: null });
    try {
      await flushPendingCreates();

      const data = await fetchTransactions();
      const serverTransactions = data.transactions.map(withCurrency);

      // Keep any optimistic rows that still have not been replaced.
      const pending = get().transactions.filter(isPendingTemp);
      const pendingBalance = pending.reduce(
        (sum, tx) =>
          sum + convertAmount(tx.amount, tx.currency, DEFAULT_CURRENCY),
        0,
      );

      set({
        balance: data.balance + pendingBalance,
        transactions: [...pending, ...serverTransactions],
        status: 'ready',
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to load transactions';
      set({ status: 'error', error: message });
    }
  },

  addTransaction: input => {
    const user = useAuthStore.getState().user;
    if (!user) {
      return;
    }

    const currency = isCurrency(input.currency)
      ? input.currency
      : DEFAULT_CURRENCY;
    const tempId = `temp-${Date.now()}`;
    const optimistic: Transaction = {
      id: tempId,
      userId: user.id,
      amount: input.amount,
      currency,
      category: input.category,
      note: input.note?.trim() ?? '',
      date: input.date,
      createdAt: new Date().toISOString(),
    };

    const previous = {
      balance: get().balance,
      transactions: get().transactions,
    };
    const converted = convertAmount(
      input.amount,
      currency,
      DEFAULT_CURRENCY,
    );

    set({
      balance: previous.balance + converted,
      transactions: [optimistic, ...previous.transactions],
      status: 'ready',
      error: null,
    });

    let committed = false;
    let undone = false;

    const rollback = () => {
      if (committed || undone) {
        return;
      }
      undone = true;
      set({
        balance: previous.balance,
        transactions: previous.transactions,
      });
      useUiStore.getState().hideSnackbar();
    };

    const commit = () => {
      if (committed || undone) {
        return;
      }
      committed = true;

      const task = createTransactionRequest(input)
        .then(result => {
          if (undone) {
            return;
          }
          set(state => ({
            balance: result.balance,
            transactions: [
              withCurrency(result.transaction),
              ...state.transactions.filter(tx => tx.id !== tempId),
            ],
          }));
        })
        .catch((error: unknown) => {
          if (undone) {
            return;
          }
          set({
            balance: previous.balance,
            transactions: previous.transactions,
          });
          const message =
            error instanceof ApiError
              ? error.message
              : 'Failed to save transaction';
          useUiStore.getState().showSnackbar({
            message,
            durationMs: 3000,
          });
        })
        .finally(() => {
          pendingCreates = pendingCreates.filter(item => item !== task);
        });

      pendingCreates.push(task);
    };

    useUiStore.getState().showSnackbar({
      message: 'Transaction added',
      actionLabel: 'Undo',
      onAction: rollback,
      onDismiss: commit,
      durationMs: 4000,
    });
  },

  clearTransactions: async () => {
    await clearTransactionsRequest();
    set({
      balance: 0,
      transactions: [],
      status: 'ready',
      error: null,
    });
  },
}));
