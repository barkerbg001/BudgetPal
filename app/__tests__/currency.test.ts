import {
  convertAmount,
  totalInCurrency,
} from '../src/utils/currency';

describe('currency conversion', () => {
  it('returns the same amount when currencies match', () => {
    expect(convertAmount(100, 'ZAR', 'ZAR')).toBe(100);
  });

  it('converts through the USD pivot', () => {
    const usd = convertAmount(200, 'ZAR', 'USD');
    expect(usd).toBeCloseTo(11, 5);
    expect(convertAmount(usd, 'USD', 'ZAR')).toBeCloseTo(200, 5);
  });

  it('sums mixed-currency transactions into one total', () => {
    const total = totalInCurrency(
      [
        { amount: 100, currency: 'USD' },
        { amount: 200, currency: 'ZAR' },
      ],
      'USD',
    );
    expect(total).toBeCloseTo(111, 5);
  });
});
