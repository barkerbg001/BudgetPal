import { StyleSheet, Text, View } from 'react-native';

import { useUiStore } from '../store/uiStore';
import { useAppTheme } from '../theme/useAppTheme';
import { getCardShadow } from '../theme/shadows';
import type { Transaction } from '../types/api';
import { CATEGORY_ICONS } from '../utils/categoryIcons';
import { convertAmount } from '../utils/currency';
import { formatBalance, formatMoney } from '../utils/money';

type Props = {
  item: Transaction;
};

export function TransactionRow({ item }: Props) {
  const { colors, isDark } = useAppTheme();
  const displayCurrency = useUiStore(state => state.displayCurrency);
  const multiCurrency = useUiStore(state => state.multiCurrency);
  const positive = item.amount >= 0;
  const CategoryIcon = CATEGORY_ICONS[item.category];

  return (
    <View
      style={[
        styles.row,
        getCardShadow(isDark),
        { backgroundColor: colors.card },
      ]}>
      <View
        style={[
          styles.categoryIcon,
          { backgroundColor: colors.accent + '18' },
        ]}>
        <CategoryIcon color={colors.accent} size={18} strokeWidth={2} />
      </View>
      <View style={styles.rowMain}>
        <Text style={[styles.category, { color: colors.text }]}>
          {item.category}
        </Text>
        <Text style={[styles.note, { color: colors.muted }]} numberOfLines={1}>
          {item.note || item.date}
        </Text>
      </View>
      <View style={styles.rowSide}>
        <Text
          style={[
            styles.amount,
            { color: positive ? colors.success : colors.error },
          ]}>
          {formatMoney(
            multiCurrency
              ? item.amount
              : convertAmount(item.amount, item.currency, displayCurrency),
            multiCurrency ? item.currency : displayCurrency,
          )}
        </Text>
        {multiCurrency && item.currency !== displayCurrency ? (
          <Text style={[styles.converted, { color: colors.muted }]}>
            ≈{' '}
            {formatBalance(
              convertAmount(item.amount, item.currency, displayCurrency),
              displayCurrency,
            )}
          </Text>
        ) : null}
        <Text style={[styles.date, { color: colors.muted }]}>{item.date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMain: {
    flex: 1,
    gap: 4,
  },
  rowSide: {
    alignItems: 'flex-end',
    gap: 4,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  note: {
    fontSize: 13,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
  },
  converted: {
    fontSize: 11,
    fontWeight: '600',
  },
});
