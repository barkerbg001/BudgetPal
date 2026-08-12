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
import {
  computeFinancialHealth,
  type FinancialHealth,
  type MascotMood,
} from '../utils/financialHealth';

type Props = {
  balance: number;
  colors: ThemeColors;
};

function MascotFace({
  mood,
  color,
}: {
  mood: MascotMood;
  color: string;
}) {
  const size = 36;
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
    return <BatteryFull color={color} size={16} />;
  }
  if (level >= 35) {
    return <BatteryMedium color={color} size={16} />;
  }
  return <BatteryLow color={color} size={16} />;
}

function moodAccent(mood: MascotMood, colors: ThemeColors): string {
  if (mood === 'thriving' || mood === 'steady') {
    return colors.accent;
  }
  return colors.error;
}

export function FinancialHealthCard({ balance, colors }: Props) {
  const savingsGoal = useUiStore(state => state.savingsGoal);
  const [health, setHealth] = useState<FinancialHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getBatteryLevel()
      .then(batteryLevel => {
        if (cancelled) {
          return;
        }
        setHealth(
          computeFinancialHealth(batteryLevel, balance, savingsGoal),
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [balance, savingsGoal]);

  const accent = health ? moodAccent(health.mood, colors) : colors.accent;

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
