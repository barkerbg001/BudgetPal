import 'dotenv/config';

import { createApp } from './app';
import { seedTransactionsForUser } from './data/transactions';
import { seedDemoUser } from './data/users';

const port = Number(process.env.PORT) || 3000;

async function main() {
  const demoUser = await seedDemoUser();
  seedTransactionsForUser(demoUser.id);

  const app = createApp();

  app.listen(port, () => {
    console.log(`BudgetPal API listening on http://localhost:${port}`);
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
