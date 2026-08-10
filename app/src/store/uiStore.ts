import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ThemeMode } from '../theme/colors';

export type SnackbarState = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  durationMs: number;
} | null;

type UiState = {
  themeMode: ThemeMode;
  savingsGoal: number;
  globalLoading: boolean;
  snackbar: SnackbarState;
  setThemeMode: (mode: ThemeMode) => void;
  setSavingsGoal: (goal: number) => void;
  setGlobalLoading: (loading: boolean) => void;
  showSnackbar: (input: {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    onDismiss?: () => void;
    durationMs?: number;
  }) => void;
  hideSnackbar: () => void;
};

export const useUiStore = create<UiState>()(
  persist(
    set => ({
      themeMode: 'system',
      savingsGoal: 5000,
      globalLoading: false,
      snackbar: null,

      setThemeMode: mode => set({ themeMode: mode }),
      setSavingsGoal: goal => set({ savingsGoal: goal }),
      setGlobalLoading: loading => set({ globalLoading: loading }),

      showSnackbar: input =>
        set({
          snackbar: {
            message: input.message,
            actionLabel: input.actionLabel,
            onAction: input.onAction,
            onDismiss: input.onDismiss,
            durationMs: input.durationMs ?? 4000,
          },
        }),

      hideSnackbar: () => set({ snackbar: null }),
    }),
    {
      name: 'budgetpal-ui',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        themeMode: state.themeMode,
        savingsGoal: state.savingsGoal,
      }),
    },
  ),
);
