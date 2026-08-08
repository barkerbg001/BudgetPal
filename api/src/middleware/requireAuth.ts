import type { NextFunction, Request, Response } from 'express';

import { findUserById, toPublicUser, type PublicUser } from '../data/users';
import { HttpError } from '../lib/httpError';
import { verifyToken } from '../lib/jwt';

export type AuthedRequest = Request & {
  user: PublicUser;
};

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new HttpError(401, 'Missing or invalid Authorization header');
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new HttpError(401, 'Missing or invalid Authorization header');
    }

    const payload = verifyToken(token);
    const user = findUserById(payload.sub);
    if (!user) {
      throw new HttpError(401, 'User not found');
    }

    (req as AuthedRequest).user = toPublicUser(user);
    next();
  } catch (error) {
    next(error);
  }
}
