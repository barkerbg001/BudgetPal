import { Router } from 'express';

import { findUserById, toPublicUser } from '../data/users';
import { HttpError } from '../lib/httpError';
import {
  requireAuth,
  type AuthedRequest,
} from '../middleware/requireAuth';

export const meRouter = Router();

meRouter.get('/', requireAuth, (req, res, next) => {
  try {
    const { user } = req as AuthedRequest;
    const fresh = findUserById(user.id);
    if (!fresh) {
      throw new HttpError(401, 'User not found');
    }
    res.json({ user: toPublicUser(fresh) });
  } catch (error) {
    next(error);
  }
});
