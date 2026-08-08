import { Router } from 'express';

import {
  TRANSACTION_CATEGORIES,
  createTransaction,
  getBalanceForUser,
  listTransactionsForUser,
} from '../data/transactions';
import { HttpError } from '../lib/httpError';
import {
  requireDateString,
  requireNumber,
  requireOneOf,
} from '../lib/validate';
import {
  requireAuth,
  type AuthedRequest,
} from '../middleware/requireAuth';

export const transactionsRouter = Router();

transactionsRouter.use(requireAuth);

transactionsRouter.get('/', (req, res) => {
  const { user } = req as AuthedRequest;
  const transactions = listTransactionsForUser(user.id);
  const balance = getBalanceForUser(user.id);

  res.json({
    balance,
    transactions,
  });
});

transactionsRouter.post('/', (req, res, next) => {
  try {
    const { user } = req as AuthedRequest;
    const amount = requireNumber(req.body?.amount, 'amount');
    if (amount === 0) {
      throw new HttpError(400, 'amount must not be zero');
    }

    const category = requireOneOf(
      req.body?.category,
      'category',
      TRANSACTION_CATEGORIES,
    );

    if (req.body?.note !== undefined && typeof req.body.note !== 'string') {
      throw new HttpError(400, 'note must be a string');
    }
    const note =
      typeof req.body?.note === 'string' ? req.body.note.trim() : '';

    const date = requireDateString(req.body?.date, 'date');

    const transaction = createTransaction({
      userId: user.id,
      amount,
      category,
      note,
      date,
    });

    res.status(201).json({
      transaction,
      balance: getBalanceForUser(user.id),
    });
  } catch (error) {
    next(error);
  }
});
