import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ThemeMode } from '../theme/colors';
import {
  DEFAULT_CURRENCY,
  type Currency,
} from '../utils/currency';

export type SnackbarState = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  durationMs: number;
} | null;

type UiState = {
  themeMode: ThemeMode;
  displayCurrency: Currency;
  multiCurrency: boolean;
  savingsGoal: number;
  savingsGoalCurrency: Currency;
  globalLoading: boolean;
  drawerOpen: boolean;
  snackbar: SnackbarState;
  setThemeMode: (mode: ThemeMode) => void;
  setDisplayCurrency: (currency: Currency) => void;
  setMultiCurrency: (enabled: boolean) => void;
  setSavingsGoal: (goal: number, currency?: Currency) => void;
  setGlobalLoading: (loading: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
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
    (set, get) => ({
      themeMode: 'system',
      displayCurrency: DEFAULT_CURRENCY,
      multiCurrency: false,
      savingsGoal: 5000,
      savingsGoalCurrency: DEFAULT_CURRENCY,
      globalLoading: false,
      drawerOpen: false,
      snackbar: null,

      setThemeMode: mode => set({ themeMode: mode }),
      setDisplayCurrency: currency => set({ displayCurrency: currency }),
      setMultiCurrency: enabled => set({ multiCurrency: enabled }),
      setSavingsGoal: (goal, currency) =>
        set(state => ({
          savingsGoal: goal,
          savingsGoalCurrency: currency ?? state.displayCurrency,
        })),
      setGlobalLoading: loading => set({ globalLoading: loading }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),

      showSnackbar: input => {
        // Flush the previous snackbar's dismiss handler (e.g. commit a
        // pending transaction) before replacing it.
        const previous = get().snackbar;
        previous?.onDismiss?.();

        set({
          snackbar: {
            message: input.message,
            actionLabel: input.actionLabel,
            onAction: input.onAction,
            onDismiss: input.onDismiss,
            durationMs: input.durationMs ?? 4000,
          },
        });
      },

      hideSnackbar: () => set({ snackbar: null }),
    }),
    {
      name: 'budgetpal-ui',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        themeMode: state.themeMode,
        displayCurrency: state.displayCurrency,
        multiCurrency: state.multiCurrency,
        savingsGoal: state.savingsGoal,
        savingsGoalCurrency: state.savingsGoalCurrency,
      }),
      merge: (persisted, current) => {
        const stored =
          persisted && typeof persisted === 'object'
            ? (persisted as Partial<UiState>)
            : {};
        return {
          ...current,
          ...stored,
          displayCurrency: stored.displayCurrency ?? DEFAULT_CURRENCY,
          multiCurrency: stored.multiCurrency ?? false,
          savingsGoalCurrency: stored.savingsGoalCurrency ?? DEFAULT_CURRENCY,
        };
      },
    },
  ),
);
