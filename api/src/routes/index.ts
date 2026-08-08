import { Router } from 'express';

import { authRouter } from './auth';
import { docsRouter } from './docs';
import { healthRouter } from './health';
import { meRouter } from './me';
import { transactionsRouter } from './transactions';

export const routes = Router();

routes.use('/docs', docsRouter);
routes.use('/health', healthRouter);
routes.use('/auth', authRouter);
routes.use('/me', meRouter);
routes.use('/transactions', transactionsRouter);
