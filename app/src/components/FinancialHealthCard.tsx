import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Frown,
  Meh,
  Smile,
} from 'lucide-react-native';

import { getBatteryLevel } from '../native/battery';
import { useUiStore } from '../store/uiStore';
import type { ThemeColors } from '../theme/colors';
import { getCardShadow } from '../theme/shadows';
import { useAppTheme } from '../theme/useAppTheme';
import { convertAmount } from '../utils/currency';
import {
  computeFinancialHealth,
  type FinancialHealth,
  type MascotMood,
} from '../utils/financialHealth';

type Props = {
  balance: number;
  colors: ThemeColors;
  compact?: boolean;
};

function MascotFace({
  mood,
  color,
  size = 36,
}: {
  mood: MascotMood;
  color: string;
  size?: number;
}) {
  if (mood === 'thriving') {
    return <Smile color={color} size={size} strokeWidth={2.2} />;
  }
  if (mood === 'steady') {
    return <Meh color={color} size={size} strokeWidth={2.2} />;
  }
  if (mood === 'worried') {
    return <Frown color={color} size={size} strokeWidth={2.2} />;
  }
  return <BatteryWarning color={color} size={size} strokeWidth={2.2} />;
}

function BatteryGlyph({
  level,
  color,
}: {
  level: number;
  color: string;
}) {
  if (level >= 70) {
    return <BatteryFull color={color} size={14} />;
  }
  if (level >= 35) {
    return <BatteryMedium color={color} size={14} />;
  }
  return <BatteryLow color={color} size={14} />;
}

function moodAccent(mood: MascotMood, colors: ThemeColors): string {
  if (mood === 'thriving' || mood === 'steady') {
    return colors.accent;
  }
  return colors.error;
}

export function FinancialHealthCard({
  balance,
  colors,
  compact = false,
}: Props) {
  const { isDark } = useAppTheme();
  const savingsGoal = useUiStore(state => state.savingsGoal);
  const savingsGoalCurrency = useUiStore(state => state.savingsGoalCurrency);
  const displayCurrency = useUiStore(state => state.displayCurrency);
  const [health, setHealth] = useState<FinancialHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const goal = convertAmount(
      savingsGoal,
      savingsGoalCurrency,
      displayCurrency,
    );

    getBatteryLevel()
      .then(batteryLevel => {
        if (cancelled) {
          return;
        }
        setHealth(computeFinancialHealth(batteryLevel, balance, goal));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [balance, displayCurrency, savingsGoal, savingsGoalCurrency]);

  const accent = health ? moodAccent(health.mood, colors) : colors.accent;

  if (compact) {
    return (
      <View
        style={[
          styles.compactCard,
          getCardShadow(isDark),
          { backgroundColor: colors.card },
        ]}>
        {loading || !health ? (
          <View style={styles.compactLoading}>
            <ActivityIndicator color={colors.accent} size="small" />
            <Text style={[styles.loadingText, { color: colors.muted }]}>
              Checking health…
            </Text>
          </View>
        ) : (
          <View style={styles.compactRow}>
            <View
              style={[
                styles.compactMascot,
                { backgroundColor: accent + '18' },
              ]}>
              <MascotFace mood={health.mood} color={accent} size={22} />
            </View>
            <View style={styles.compactCopy}>
              <Text style={[styles.compactTitle, { color: colors.text }]}>
                {health.label}
                <Text style={{ color: colors.muted }}> · {health.score}/100</Text>
              </Text>
              <Text
                style={[styles.compactMessage, { color: colors.muted }]}
                numberOfLines={1}>
                {health.message}
              </Text>
            </View>
            <View style={styles.compactMeta}>
              <BatteryGlyph level={health.batteryLevel} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted }]}>
                {health.batteryLevel}%
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}>
      {loading || !health ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Checking financial health…
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={[styles.mascotBubble, { backgroundColor: accent + '18' }]}>
            <MascotFace mood={health.mood} color={accent} />
          </View>

          <View style={styles.copy}>
            <Text style={[styles.title, { color: colors.text }]}>
              Financial health
            </Text>
            <Text style={[styles.score, { color: accent }]}>
              {health.score}
              <Text style={[styles.scoreSuffix, { color: colors.muted }]}>
                {' '}
                / 100 · {health.label}
              </Text>
            </Text>
            <Text style={[styles.message, { color: colors.muted }]}>
              {health.message}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <BatteryGlyph level={health.batteryLevel} color={colors.muted} />
                <Text style={[styles.metaText, { color: colors.muted }]}>
                  Battery {health.batteryLevel}%
                </Text>
              </View>
              <Text style={[styles.metaText, { color: colors.muted }]}>
                Goal {Math.round(health.balanceScore)}%
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 16,
  },
  compactCard: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  compactLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactMascot: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactCopy: {
    flex: 1,
    gap: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  compactMessage: {
    fontSize: 12,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  content: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  mascotBubble: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  score: {
    fontSize: 22,
    fontWeight: '800',
  },
  scoreSuffix: {
    fontSize: 13,
    fontWeight: '600',
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
