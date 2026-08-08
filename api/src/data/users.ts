import { randomUUID } from 'node:crypto';

import bcrypt from 'bcryptjs';

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
};

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

const usersByEmail = new Map<string, User>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

export function findUserByEmail(email: string): User | undefined {
  return usersByEmail.get(normalizeEmail(email));
}

export function findUserById(id: string): User | undefined {
  for (const user of usersByEmail.values()) {
    if (user.id === id) {
      return user;
    }
  }
  return undefined;
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
}): Promise<User> {
  const email = normalizeEmail(input.email);
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user: User = {
    id: randomUUID(),
    email,
    passwordHash,
    name: input.name.trim(),
    createdAt: new Date().toISOString(),
  };
  usersByEmail.set(email, user);
  return user;
}

export async function verifyPassword(
  user: User,
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

/** Demo account for local development — password: password123 */
export async function seedDemoUser(): Promise<User> {
  const existing = findUserByEmail('demo@budgetpal.app');
  if (existing) {
    return existing;
  }
  return createUser({
    email: 'demo@budgetpal.app',
    password: 'password123',
    name: 'Demo User',
  });
}
