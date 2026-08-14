const LOCAL_JOKES = [
  {
    setup: 'Why did the rand go to therapy?',
    punchline: 'It had too many exchange issues.',
  },
  {
    setup: "What's a budget's favourite workout?",
    punchline: 'Cutting back.',
  },
  {
    setup: "Why don't piggy banks ever gossip?",
    punchline: "They're good at keeping cents.",
  },
  {
    setup: 'How do you make a bank teller laugh?',
    punchline: 'Show them your savings goal… then raise it.',
  },
  {
    setup: 'Why was the accountant so good at parties?',
    punchline: 'They knew how to balance everything.',
  },
  {
    setup: 'Why did the credit card go to school?',
    punchline: 'To improve its interest.',
  },
  {
    setup: 'What do you call a broke budget app?',
    punchline: 'In the red… and a little blue.',
  },
  {
    setup: 'Why did the investor bring a ladder?',
    punchline: 'To reach higher returns.',
  },
] as const;

export type FinanceJoke = {
  setup: string;
  punchline: string;
  source: 'api' | 'local';
};

const ICANHAZ_SEARCH_URL =
  'https://icanhazdadjoke.com/search?term=money&limit=30';

let cachedApiJokes: FinanceJoke[] | null = null;

function dayIndex(length: number): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return dayOfYear % length;
}

function pickLocalJoke(random = false): FinanceJoke {
  const index = random
    ? Math.floor(Math.random() * LOCAL_JOKES.length)
    : dayIndex(LOCAL_JOKES.length);
  const joke = LOCAL_JOKES[index] ?? LOCAL_JOKES[0];
  return { ...joke, source: 'local' };
}

function pickFromList(jokes: FinanceJoke[], random: boolean): FinanceJoke {
  const index = random
    ? Math.floor(Math.random() * jokes.length)
    : dayIndex(jokes.length);
  return jokes[index] ?? jokes[0]!;
}

/** Split one-liner dad jokes into setup / punchline when possible. */
function splitDadJoke(joke: string): { setup: string; punchline: string } {
  const trimmed = joke.trim();
  const qIndex = trimmed.indexOf('?');
  if (qIndex > 0 && qIndex < trimmed.length - 1) {
    return {
      setup: trimmed.slice(0, qIndex + 1).trim(),
      punchline: trimmed.slice(qIndex + 1).trim(),
    };
  }
  return { setup: trimmed, punchline: '' };
}

type IcanhazSearchResponse = {
  status?: number;
  results?: Array<{ id?: string; joke?: string }>;
};

async function fetchMoneyDadJokes(): Promise<FinanceJoke[]> {
  if (cachedApiJokes && cachedApiJokes.length > 0) {
    return cachedApiJokes;
  }

  const response = await fetch(ICANHAZ_SEARCH_URL, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'BudgetPal (finance joke of the day)',
    },
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as IcanhazSearchResponse;
  if (!Array.isArray(data.results)) {
    return [];
  }

  const jokes = data.results
    .map(item => item.joke?.trim())
    .filter((joke): joke is string => Boolean(joke))
    .map(joke => {
      const parts = splitDadJoke(joke);
      return { ...parts, source: 'api' as const };
    });

  cachedApiJokes = jokes;
  return jokes;
}

/**
 * Money-themed dad joke from icanhazdadjoke (term=money).
 * Falls back to local BudgetPal classics if the API is unavailable.
 */
export async function fetchFinanceJoke(
  options: { random?: boolean } = {},
): Promise<FinanceJoke> {
  const random = options.random ?? false;

  try {
    const remote = await fetchMoneyDadJokes();
    if (remote.length > 0) {
      return pickFromList(remote, random);
    }
  } catch {
    // Network / parse failures → local
  }

  return pickLocalJoke(random);
}
