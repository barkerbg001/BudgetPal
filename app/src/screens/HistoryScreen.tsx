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
import { AlertCircle, Inbox, Plus, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppDrawer } from '../components/AppDrawer';
import { AppNavbar } from '../components/AppNavbar';
import { TransactionRow } from '../components/TransactionRow';
import type { AppStackParamList } from '../navigation/types';
import { useTransactionsStore } from '../store/transactionsStore';
import { useAppTheme } from '../theme/useAppTheme';
import type { Transaction } from '../types/api';

type Props = NativeStackScreenProps<AppStackParamList, 'History'>;

export function HistoryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
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
    return <TransactionRow item={item} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <AppNavbar title="History" />

      <View style={styles.body}>
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

        {status !== 'error' ? (
          <FlatList
            data={transactions}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={
              transactions.length === 0
                ? styles.emptyList
                : [styles.list, { paddingBottom: insets.bottom + 88 }]
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

      <AppDrawer navigation={navigation} current="History" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  list: {
    paddingTop: 4,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
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
});
