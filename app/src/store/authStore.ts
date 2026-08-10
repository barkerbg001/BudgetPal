import { create } from 'zustand';

import { ApiError, fetchProfile, loginRequest } from '../api/client';
import { clearToken, getToken, saveToken } from '../auth/secureStorage';
import type { User } from '../types/api';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  user: User | null;
  restoreSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>(set => ({
  status: 'loading',
  user: null,

  restoreSession: async () => {
    try {
      const token = await getToken();
      if (!token) {
        set({ user: null, status: 'unauthenticated' });
        return;
      }

      const { user } = await fetchProfile(token);
      set({ user, status: 'authenticated' });
    } catch (error) {
      await clearToken();
      set({ user: null, status: 'unauthenticated' });
      if (!(error instanceof ApiError && error.status === 401)) {
        console.warn('Session restore failed', error);
      }
    }
  },

  login: async (email, password) => {
    const { token, user } = await loginRequest(email, password);
    await saveToken(token);
    set({ user, status: 'authenticated' });
  },

  logout: async () => {
    await clearToken();
    set({ user: null, status: 'unauthenticated' });
    const { useTransactionsStore } = await import('./transactionsStore');
    useTransactionsStore.setState({
      balance: 0,
      transactions: [],
      status: 'idle',
      error: null,
    });
  },
}));
