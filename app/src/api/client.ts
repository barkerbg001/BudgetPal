import { API_BASE_URL } from '../config/api';
import type {
  ApiErrorBody,
  AuthResponse,
  CreateTransactionInput,
  CreateTransactionResponse,
  Transaction,
  TransactionsResponse,
  User,
} from '../types/api';
import { getToken } from '../auth/secureStorage';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  auth?: boolean;
};

async function parseError(response: Response): Promise<ApiError> {
  try {
    const data = (await response.json()) as ApiErrorBody;
    return new ApiError(
      response.status,
      data.error?.message ?? response.statusText,
    );
  } catch {
    return new ApiError(
      response.status,
      response.statusText || 'Request failed',
    );
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const token =
    options.token !== undefined
      ? options.token
      : options.auth === false
        ? null
        : await getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function loginRequest(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });
}

export function fetchProfile(token?: string): Promise<{ user: User }> {
  return apiRequest<{ user: User }>('/me', {
    token: token ?? undefined,
  });
}

export function fetchTransactions(): Promise<TransactionsResponse> {
  return apiRequest<TransactionsResponse>('/transactions');
}

export function createTransactionRequest(
  input: CreateTransactionInput,
): Promise<CreateTransactionResponse> {
  return apiRequest<CreateTransactionResponse>('/transactions', {
    method: 'POST',
    body: input,
  });
}

export function clearTransactionsRequest(): Promise<{
  deleted: number;
  balance: number;
  transactions: Transaction[];
}> {
  return apiRequest('/transactions', {
    method: 'DELETE',
  });
}
