import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Laugh, RefreshCw } from 'lucide-react-native';

import { fetchFinanceJoke, type FinanceJoke } from '../api/jokes';
import type { ThemeColors } from '../theme/colors';

type Props = {
  colors: ThemeColors;
};

export function FinanceJokeCard({ colors }: Props) {
  const [joke, setJoke] = useState<FinanceJoke | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJoke = useCallback(async (random = false) => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchFinanceJoke({ random });
      setJoke(next);
    } catch {
      setError('Could not load a joke right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJoke(false).catch(() => undefined);
  }, [loadJoke]);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Laugh color={colors.accent} size={16} />
          <Text style={[styles.title, { color: colors.text }]}>
            Finance joke of the day
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Load another joke"
          onPress={() => {
            loadJoke(true).catch(() => undefined);
          }}
          hitSlop={8}
          disabled={loading}
          style={styles.refresh}>
          <RefreshCw
            color={colors.muted}
            size={16}
            style={loading ? styles.spinning : undefined}
          />
        </Pressable>
      </View>

      {loading && !joke ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : null}

      {error && !joke ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}

      {joke ? (
        <View style={styles.body}>
          <Text style={[styles.setup, { color: colors.text }]}>{joke.setup}</Text>
          <Text style={[styles.punchline, { color: colors.accent }]}>
            {joke.punchline}
          </Text>
          <Text style={[styles.source, { color: colors.muted }]}>
            {joke.source === 'api' ? 'via JokeAPI' : 'BudgetPal classic'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  refresh: {
    padding: 4,
  },
  spinning: {
    opacity: 0.5,
  },
  loading: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  error: {
    fontSize: 13,
  },
  body: {
    gap: 6,
  },
  setup: {
    fontSize: 15,
    lineHeight: 21,
  },
  punchline: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  source: {
    fontSize: 11,
    marginTop: 4,
  },
});
