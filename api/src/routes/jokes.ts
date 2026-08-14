import { Router } from 'express';

import { getFinanceJoke } from '../data/jokes';
import { requireAuth } from '../middleware/requireAuth';

export const jokesRouter = Router();

jokesRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const random =
      typeof req.query.random === 'string' &&
      ['1', 'true', 'yes'].includes(req.query.random.toLowerCase());

    const joke = await getFinanceJoke({ random });
    res.json({ joke });
  } catch (error) {
    next(error);
  }
});
