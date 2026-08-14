import { Router } from 'express';

import {
  TRANSACTION_CATEGORIES,
  clearTransactionsForUser,
  createTransaction,
  getBalanceForUser,
  getBalancesForUser,
  listTransactionsForUser,
} from '../data/transactions';
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  isCurrency,
  type Currency,
} from '../lib/currency';
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

function parseCurrency(value: unknown, fallback: Currency): Currency {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  if (typeof value !== 'string' || !isCurrency(value)) {
    throw new HttpError(
      400,
      `currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`,
    );
  }
  return value;
}

transactionsRouter.get('/', (req, res) => {
  const { user } = req as AuthedRequest;
  const currency = parseCurrency(req.query.currency, DEFAULT_CURRENCY);
  const transactions = listTransactionsForUser(user.id);
  const balance = getBalanceForUser(user.id, currency);

  res.json({
    balance,
    currency,
    balances: getBalancesForUser(user.id),
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
    const currency = parseCurrency(req.body?.currency, DEFAULT_CURRENCY);

    const transaction = createTransaction({
      userId: user.id,
      amount,
      currency,
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

transactionsRouter.delete('/', (req, res) => {
  const { user } = req as AuthedRequest;
  const deleted = clearTransactionsForUser(user.id);
  res.json({
    deleted,
    balance: 0,
    transactions: [],
  });
});
