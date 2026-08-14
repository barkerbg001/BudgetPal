import { TRANSACTION_CATEGORIES } from '../data/transactions';
import { SUPPORTED_CURRENCIES } from '../lib/currency';

const errorSchema = {
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      required: ['message'],
      properties: {
        message: { type: 'string' },
      },
    },
  },
} as const;

const userSchema = {
  type: 'object',
  required: ['id', 'email', 'name', 'createdAt'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    name: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
  },
} as const;

const transactionSchema = {
  type: 'object',
  required: [
    'id',
    'userId',
    'amount',
    'currency',
    'category',
    'note',
    'date',
    'createdAt',
  ],
  properties: {
    id: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    amount: {
      type: 'number',
      description: 'Signed amount: positive = income, negative = expense',
      example: -54.2,
    },
    currency: {
      type: 'string',
      enum: [...SUPPORTED_CURRENCIES],
      example: 'ZAR',
    },
    category: {
      type: 'string',
      enum: [...TRANSACTION_CATEGORIES],
    },
    note: { type: 'string' },
    date: {
      type: 'string',
      description: 'YYYY-MM-DD or ISO-8601 datetime',
      example: '2026-08-08',
    },
    createdAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'BudgetPal API',
    version: '0.0.1',
    description:
      'Personal finance tracker API. Use **Authorize** with a JWT from `/api/auth/login` or `/api/auth/register`.\n\nDemo account: `demo@budgetpal.app` / `password123`',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development',
    },
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Profile' },
    { name: 'Transactions' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: errorSchema,
      User: userSchema,
      Transaction: transactionSchema,
      AuthResponse: {
        type: 'object',
        required: ['token', 'user'],
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email', example: 'alice@example.com' },
          password: {
            type: 'string',
            format: 'password',
            minLength: 8,
            example: 'password123',
          },
          name: { type: 'string', example: 'Alice' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'demo@budgetpal.app',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'password123',
          },
        },
      },
      CreateTransactionRequest: {
        type: 'object',
        required: ['amount', 'category', 'date'],
        properties: {
          amount: {
            type: 'number',
            description: 'Non-zero signed amount',
            example: -12.5,
          },
          currency: {
            type: 'string',
            enum: [...SUPPORTED_CURRENCIES],
            description: 'ISO 4217 currency code. Defaults to ZAR.',
            example: 'ZAR',
          },
          category: {
            type: 'string',
            enum: [...TRANSACTION_CATEGORIES],
            example: 'food',
          },
          note: { type: 'string', example: 'Coffee' },
          date: {
            type: 'string',
            example: '2026-08-08',
          },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    service: { type: 'string', example: 'budgetpal-api' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '409': {
            description: 'Email already registered',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Authenticated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/me': {
      get: {
        tags: ['Profile'],
        summary: 'Current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Authenticated user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['user'],
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'List transactions',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'currency',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: [...SUPPORTED_CURRENCIES],
            },
            description:
              'Convert the headline `balance` into this currency. Defaults to ZAR.',
          },
        ],
        responses: {
          '200': {
            description: 'Balance and transactions for the current user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['balance', 'currency', 'balances', 'transactions'],
                  properties: {
                    balance: {
                      type: 'number',
                      description:
                        'All transactions converted into `currency` using static FX rates',
                      example: 1927.3,
                    },
                    currency: {
                      type: 'string',
                      enum: [...SUPPORTED_CURRENCIES],
                      example: 'ZAR',
                    },
                    balances: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['currency', 'amount'],
                        properties: {
                          currency: {
                            type: 'string',
                            enum: [...SUPPORTED_CURRENCIES],
                          },
                          amount: { type: 'number' },
                        },
                      },
                    },
                    transactions: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Transaction' },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Transactions'],
        summary: 'Create a transaction',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTransactionRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Transaction created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['transaction', 'balance'],
                  properties: {
                    transaction: { $ref: '#/components/schemas/Transaction' },
                    balance: {
                      type: 'number',
                      description: 'All transactions converted to ZAR',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Transactions'],
        summary: 'Clear all transactions',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'All transactions for the current user were deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['deleted', 'balance', 'transactions'],
                  properties: {
                    deleted: { type: 'number', example: 6 },
                    balance: { type: 'number', example: 0 },
                    transactions: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Transaction' },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
} as const;
