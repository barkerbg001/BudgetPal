import { HttpError } from './httpError';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, `${field} is required`);
  }
  return value.trim();
}

export function validateEmail(email: string): string {
  const normalized = email.toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) {
    throw new HttpError(400, 'email must be a valid email address');
  }
  return normalized;
}

export function validatePassword(password: string): string {
  if (password.length < 8) {
    throw new HttpError(400, 'password must be at least 8 characters');
  }
  return password;
}

export function requireNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new HttpError(400, `${field} must be a finite number`);
  }
  return value;
}

/** Accepts YYYY-MM-DD or full ISO-8601 datetime. */
export function requireDateString(value: unknown, field: string): string {
  const raw = requireString(value, field);
  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) {
    throw new HttpError(400, `${field} must be a valid date`);
  }
  return raw.includes('T') ? new Date(parsed).toISOString() : raw;
}

export function requireOneOf<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[],
): T {
  const raw = requireString(value, field);
  if (!allowed.includes(raw as T)) {
    throw new HttpError(
      400,
      `${field} must be one of: ${allowed.join(', ')}`,
    );
  }
  return raw as T;
}
