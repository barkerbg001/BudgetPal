import { formatBalance, formatMoney } from '../src/utils/money';

describe('money formatting (ZAR)', () => {
  it('formats signed transaction amounts', () => {
    expect(formatMoney(54.2)).toMatch(/\+.*54[,.]20/);
    expect(formatMoney(-12.5)).toMatch(/-.*12[,.]50/);
    expect(formatMoney(0)).toMatch(/0[,.]00/);
  });

  it('formats balance without a leading plus', () => {
    expect(formatBalance(1927.3)).toMatch(/1.?927[,.]30|1927[,.]30/);
    expect(formatBalance(-50)).toMatch(/-.*50[,.]00/);
  });
});
