import { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AlertCircle,
  ChevronRight,
  Inbox,
  Plus,
  RefreshCw,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppDrawer } from '../components/AppDrawer';
import { AppNavbar } from '../components/AppNavbar';
import { FinanceJokeCard } from '../components/FinanceJokeCard';
import { FinancialHealthCard } from '../components/FinancialHealthCard';
import { GoalConfetti } from '../components/GoalConfetti';
import { TransactionRow } from '../components/TransactionRow';
import type { AppStackParamList } from '../navigation/types';
import { useTransactionsStore } from '../store/transactionsStore';
import { useUiStore } from '../store/uiStore';
import { useAppTheme } from '../theme/useAppTheme';
import { getCardShadow } from '../theme/shadows';
import { convertAmount, totalInCurrency } from '../utils/currency';
import { formatBalance } from '../utils/money';

type Props = NativeStackScreenProps<AppStackParamList, 'Dashboard'>;

const RECENT_PREVIEW_COUNT = 4;

export function DashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const transactions = useTransactionsStore(state => state.transactions);
  const status = useTransactionsStore(state => state.status);
  const error = useTransactionsStore(state => state.error);
  const fetchTransactions = useTransactionsStore(
    state => state.fetchTransactions,
  );
  const displayCurrency = useUiStore(state => state.displayCurrency);
  const savingsGoal = useUiStore(state => state.savingsGoal);
  const savingsGoalCurrency = useUiStore(state => state.savingsGoalCurrency);

  const balance = useMemo(
    () => totalInCurrency(transactions, displayCurrency),
    [transactions, displayCurrency],
  );
  const goalInDisplay = useMemo(
    () => convertAmount(savingsGoal, savingsGoalCurrency, displayCurrency),
    [savingsGoal, savingsGoalCurrency, displayCurrency],
  );
  const goalProgress = useMemo(() => {
    if (goalInDisplay <= 0) {
      return 0;
    }
    return Math.min(1, Math.max(0, balance / goalInDisplay));
  }, [balance, goalInDisplay]);
  const recent = transactions.slice(0, RECENT_PREVIEW_COUNT);

  useEffect(() => {
    fetchTransactions().catch(() => undefined);
  }, [fetchTransactions]);

  const onRefresh = useCallback(() => {
    fetchTransactions().catch(() => undefined);
  }, [fetchTransactions]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <AppNavbar title="BudgetPal" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 96 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={status === 'loading' && transactions.length > 0}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.hero,
            getCardShadow(isDark),
            { backgroundColor: colors.card },
          ]}>
          <Text style={[styles.balanceLabel, { color: colors.muted }]}>
            Balance
          </Text>
          <Text style={[styles.balance, { color: colors.text }]}>
            {formatBalance(balance, displayCurrency)}
          </Text>

          <View style={styles.goalBlock}>
            <View
              style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor:
                      goalProgress >= 1 ? colors.success : colors.accent,
                    width: `${Math.round(goalProgress * 100)}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.goalMeta}>
              <Text style={[styles.goalText, { color: colors.muted }]}>
                Goal {formatBalance(goalInDisplay, displayCurrency)}
              </Text>
              <Text style={[styles.goalText, { color: colors.text }]}>
                {Math.round(goalProgress * 100)}%
                {goalProgress >= 1 ? ' · reached' : ''}
              </Text>
            </View>
          </View>
        </View>

        <FinancialHealthCard balance={balance} colors={colors} compact />
        <FinanceJokeCard colors={colors} compact />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('History')}
              style={styles.seeAll}
              hitSlop={8}>
              <Text style={[styles.seeAllText, { color: colors.accent }]}>
                See all
              </Text>
              <ChevronRight color={colors.accent} size={16} />
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
                <Text style={[styles.retryText, { color: colors.text }]}>
                  Retry
                </Text>
              </Pressable>
            </View>
          ) : null}

          {status !== 'error' && status !== 'loading' && recent.length === 0 ? (
            <View style={styles.emptyState}>
              <Inbox color={colors.muted} size={28} />
              <Text style={[styles.empty, { color: colors.muted }]}>
                No transactions yet. Tap + to add one.
              </Text>
            </View>
          ) : null}

          {status !== 'error'
            ? recent.map(item => <TransactionRow key={item.id} item={item} />)
            : null}
        </View>
      </ScrollView>

      <GoalConfetti balance={balance} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add transaction"
        onPress={() => navigation.navigate('AddTransaction')}
        style={[
          styles.fab,
          {
            backgroundColor: colors.accent,
            right: 20,
            bottom: insets.bottom + 20,
          },
        ]}>
        <Plus color="#fff" size={26} strokeWidth={2.5} />
      </Pressable>

      <AppDrawer navigation={navigation} current="Dashboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  hero: {
    marginBottom: 16,
    borderRadius: 14,
    padding: 16,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  balance: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 42,
  },
  goalBlock: {
    marginTop: 14,
    gap: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 28,
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
    gap: 10,
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  empty: {
    textAlign: 'center',
    fontSize: 14,
  },
});
