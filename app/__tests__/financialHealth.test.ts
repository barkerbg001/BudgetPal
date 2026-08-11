import { NativeModules } from 'react-native';

/**
 * Unit helpers for financial-health scoring (no native bridge required).
 */
describe('computeFinancialHealth', () => {
  const {
    computeFinancialHealth,
  } = require('../src/utils/financialHealth') as typeof import('../src/utils/financialHealth');

  it('scores thriving when battery and balance are strong', () => {
    const health = computeFinancialHealth(90, 5000, 5000);
    expect(health.mood).toBe('thriving');
    expect(health.score).toBeGreaterThanOrEqual(80);
  });

  it('scores stressed when battery and balance are weak', () => {
    const health = computeFinancialHealth(10, 100, 5000);
    expect(health.mood).toBe('stressed');
    expect(health.score).toBeLessThan(30);
  });
});

describe('getBatteryLevel fallback', () => {
  beforeEach(() => {
    NativeModules.BatteryModule = undefined;
  });

  it('returns a safe fallback when the native module is missing', async () => {
    const { getBatteryLevel } = require('../src/native/battery') as typeof import('../src/native/battery');
    await expect(getBatteryLevel()).resolves.toBe(75);
  });
});
