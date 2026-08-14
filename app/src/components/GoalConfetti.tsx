import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

import { useUiStore } from '../store/uiStore';
import { convertAmount } from '../utils/currency';

type Props = {
  balance: number;
};

/**
 * Fires confetti once when balance crosses from below → at/above the savings goal.
 */
export function GoalConfetti({ balance }: Props) {
  const savingsGoal = useUiStore(state => state.savingsGoal);
  const savingsGoalCurrency = useUiStore(state => state.savingsGoalCurrency);
  const displayCurrency = useUiStore(state => state.displayCurrency);
  const showSnackbar = useUiStore(state => state.showSnackbar);
  const wasBelowGoal = useRef<boolean | null>(null);
  const cannonRef = useRef<ConfettiCannon | null>(null);

  useEffect(() => {
    const goal = convertAmount(
      savingsGoal,
      savingsGoalCurrency,
      displayCurrency,
    );
    const isBelow = balance < goal;

    if (wasBelowGoal.current === true && !isBelow) {
      cannonRef.current?.start();
      showSnackbar({
        message: 'Savings goal reached — nice work!',
        durationMs: 3500,
      });
    }

    wasBelowGoal.current = isBelow;
  }, [
    balance,
    displayCurrency,
    savingsGoal,
    savingsGoalCurrency,
    showSnackbar,
  ]);

  return (
    <View pointerEvents="none" style={styles.layer}>
      <ConfettiCannon
        ref={cannonRef}
        count={120}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut
        fallSpeed={2800}
        explosionSpeed={400}
        colors={['#1d4ed8', '#3b82f6', '#c1121f', '#ef4444', '#ffffff']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    elevation: 100,
  },
});
