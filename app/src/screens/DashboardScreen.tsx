import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AlertCircle,
  Inbox,
  Plus,
  RefreshCw,
  Settings,
  Wallet,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppStackParamList } from '../navigation/types';
import { FinancialHealthCard } from '../components/FinancialHealthCard';
import { useAuthStore } from '../store/authStore';
import { useTransactionsStore } from '../store/transactionsStore';
import { useAppTheme } from '../theme/useAppTheme';
import type { Transaction } from '../types/api';
import { CATEGORY_ICONS } from '../utils/categoryIcons';
import { formatBalance, formatMoney } from '../utils/money';

type Props = NativeStackScreenProps<AppStackParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const user = useAuthStore(state => state.user);
  const balance = useTransactionsStore(state => state.balance);
  const transactions = useTransactionsStore(state => state.transactions);
  const status = useTransactionsStore(state => state.status);
  const error = useTransactionsStore(state => state.error);
  const fetchTransactions = useTransactionsStore(
    state => state.fetchTransactions,
  );

  useEffect(() => {
    fetchTransactions().catch(() => undefined);
  }, [fetchTransactions]);

  const onRefresh = useCallback(() => {
    fetchTransactions().catch(() => undefined);
  }, [fetchTransactions]);

  function renderItem({ item }: { item: Transaction }) {
    const positive = item.amount >= 0;
    const CategoryIcon = CATEGORY_ICONS[item.category];
    return (
      <View
        style={[
          styles.row,
          { backgroundColor: colors.card, borderColor: colors.border },
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
            {formatMoney(item.amount)}
          </Text>
          <Text style={[styles.date, { color: colors.muted }]}>{item.date}</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.bg,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 12,
        },
      ]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.hello, { color: colors.muted }]}>
            Hi, {user?.name?.split(' ')[0] ?? 'there'}
          </Text>
          <View style={styles.balanceLabelRow}>
            <Wallet color={colors.muted} size={14} />
            <Text style={[styles.balanceLabel, { color: colors.muted }]}>
              Current balance
            </Text>
          </View>
          <Text style={[styles.balance, { color: colors.text }]}>
            {formatBalance(balance)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={() => navigation.navigate('Settings')}
          style={[styles.settingsButton, { borderColor: colors.border }]}>
          <Settings color={colors.text} size={20} strokeWidth={2} />
        </Pressable>
      </View>

      <FinancialHealthCard balance={balance} colors={colors} />

      <View style={styles.listHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('AddTransaction')}
          style={[styles.addButton, { backgroundColor: colors.accent }]}>
          <Plus color="#fff" size={18} strokeWidth={2.5} />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {status === 'loading' && transactions.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : null}

      {status === 'error' ? (
        <View style={styles.centered}>
          <AlertCircle color={colors.error} size={28} />
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error ?? 'Something went wrong'}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onRefresh}
            style={[styles.retry, { borderColor: colors.border }]}>
            <RefreshCw color={colors.text} size={16} />
            <Text style={[styles.retryText, { color: colors.text }]}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {status !== 'error' ? (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            transactions.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={
            status === 'ready' ? (
              <View style={styles.emptyState}>
                <Inbox color={colors.muted} size={32} />
                <Text style={[styles.empty, { color: colors.muted }]}>
                  No transactions yet. Add your first one.
                </Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={status === 'loading' && transactions.length > 0}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  headerCopy: {
    flex: 1,
  },
  hello: {
    fontSize: 14,
    marginBottom: 8,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceLabel: {
    fontSize: 13,
  },
  balance: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  settingsButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  list: {
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  row: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retry: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryText: {
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  empty: {
    textAlign: 'center',
    fontSize: 15,
  },
});
