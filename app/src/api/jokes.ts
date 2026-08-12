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

type JokeApiResponse = {
  error?: boolean;
  type?: string;
  joke?: string;
  setup?: string;
  delivery?: string;
};

async function fetchFromJokeApi(): Promise<FinanceJoke | null> {
  // Avoid `contains=` — JokeAPI often returns code 106 (no matches).
  const response = await fetch(
    'https://v2.jokeapi.dev/joke/Programming,Pun?type=twopart&blacklistFlags=nsfw,religious,political,racist,sexist,explicit&safe-mode',
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as JokeApiResponse;
  if (
    data.error ||
    typeof data.setup !== 'string' ||
    typeof data.delivery !== 'string'
  ) {
    return null;
  }

  return {
    setup: data.setup.trim(),
    punchline: data.delivery.trim(),
    source: 'api',
  };
}

/**
 * Finance-themed local joke by default (of-the-day).
 * Refresh randomly tries JokeAPI, then falls back to another local gag.
 */
export async function fetchFinanceJoke(
  options: { random?: boolean } = {},
): Promise<FinanceJoke> {
  if (!options.random) {
    return pickLocalJoke(false);
  }

  try {
    const remote = await fetchFromJokeApi();
    if (remote) {
      return remote;
    }
  } catch {
    // Network / parse failures → local
  }

  return pickLocalJoke(true);
}
