import { create } from 'zustand';

import {
  ApiError,
  createTransactionRequest,
  fetchTransactions,
} from '../api/client';
import type { CreateTransactionInput, Transaction } from '../types/api';
import { useAuthStore } from './authStore';
import { useUiStore } from './uiStore';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

type TransactionsState = {
  balance: number;
  transactions: Transaction[];
  status: LoadStatus;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (input: CreateTransactionInput) => void;
};

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  balance: 0,
  transactions: [],
  status: 'idle',
  error: null,

  fetchTransactions: async () => {
    set({ status: 'loading', error: null });
    try {
      const data = await fetchTransactions();
      set({
        balance: data.balance,
        transactions: data.transactions,
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

    const tempId = `temp-${Date.now()}`;
    const optimistic: Transaction = {
      id: tempId,
      userId: user.id,
      amount: input.amount,
      category: input.category,
      note: input.note?.trim() ?? '',
      date: input.date,
      createdAt: new Date().toISOString(),
    };

    const previous = {
      balance: get().balance,
      transactions: get().transactions,
    };

    set({
      balance: previous.balance + input.amount,
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

      createTransactionRequest(input)
        .then(result => {
          if (undone) {
            return;
          }
          set(state => ({
            balance: result.balance,
            transactions: [
              result.transaction,
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
        });
    };

    useUiStore.getState().showSnackbar({
      message: 'Transaction added',
      actionLabel: 'Undo',
      onAction: rollback,
      onDismiss: commit,
      durationMs: 4000,
    });
  },
}));
