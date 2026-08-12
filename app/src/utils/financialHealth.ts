export type MascotMood = 'thriving' | 'steady' | 'worried' | 'stressed';

export type FinancialHealth = {
  score: number;
  batteryLevel: number;
  balanceScore: number;
  mood: MascotMood;
  label: string;
  message: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Health blends battery stamina (40%) with progress toward the savings goal (60%).
 */
export function computeFinancialHealth(
  batteryLevel: number,
  balance: number,
  savingsGoal: number,
): FinancialHealth {
  const safeGoal = savingsGoal > 0 ? savingsGoal : 1;
  const balanceScore = clamp((balance / safeGoal) * 100, 0, 100);
  const score = Math.round(batteryLevel * 0.4 + balanceScore * 0.6);

  if (score >= 80) {
    return {
      score,
      batteryLevel,
      balanceScore: Math.round(balanceScore),
      mood: 'thriving',
      label: 'Thriving',
      message: 'Battery strong and savings on track.',
    };
  }

  if (score >= 55) {
    return {
      score,
      batteryLevel,
      balanceScore: Math.round(balanceScore),
      mood: 'steady',
      label: 'Steady',
      message: 'Holding up — keep stacking those rands.',
    };
  }

  if (score >= 30) {
    return {
      score,
      batteryLevel,
      balanceScore: Math.round(balanceScore),
      mood: 'worried',
      label: 'Worried',
      message: 'Charge up or nudge the balance toward your goal.',
    };
  }

  return {
    score,
    batteryLevel,
    balanceScore: Math.round(balanceScore),
    mood: 'stressed',
    label: 'Stressed',
    message: 'Low juice and a thin wallet — time for a reset.',
  };
}
