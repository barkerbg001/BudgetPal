import type { ErrorRequestHandler } from 'express';

type HttpError = Error & {
  status?: number;
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const error = err as HttpError;
  const status = typeof error.status === 'number' ? error.status : 500;
  const message = error.message || 'Internal server error';

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: {
      message: status === 500 ? 'Internal server error' : message,
    },
  });
};
