import { fetchJokeRequest } from './client';
import type { FinanceJoke } from '../types/api';

export type { FinanceJoke };

/**
 * Money-themed dad joke from BudgetPal API (icanhazdadjoke via backend).
 */
export async function fetchFinanceJoke(
  options: { random?: boolean } = {},
): Promise<FinanceJoke> {
  const data = await fetchJokeRequest(options.random ?? false);
  return data.joke;
}
