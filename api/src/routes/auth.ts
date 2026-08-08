import { Router } from 'express';

import {
  createUser,
  findUserByEmail,
  toPublicUser,
  verifyPassword,
} from '../data/users';
import { HttpError } from '../lib/httpError';
import { signToken } from '../lib/jwt';
import {
  requireString,
  validateEmail,
  validatePassword,
} from '../lib/validate';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const email = validateEmail(requireString(req.body?.email, 'email'));
    const password = validatePassword(
      requireString(req.body?.password, 'password'),
    );
    const name = requireString(req.body?.name, 'name');

    if (findUserByEmail(email)) {
      throw new HttpError(409, 'Email already registered');
    }

    const user = await createUser({ email, password, name });
    const token = signToken({ sub: user.id, email: user.email });

    res.status(201).json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const email = validateEmail(requireString(req.body?.email, 'email'));
    const password = requireString(req.body?.password, 'password');

    const user = findUserByEmail(email);
    if (!user || !(await verifyPassword(user, password))) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const token = signToken({ sub: user.id, email: user.email });

    res.json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
});
