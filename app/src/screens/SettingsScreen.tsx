import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AlertCircle,
  Banknote,
  Check,
  Mail,
  Monitor,
  Moon,
  Sun,
  Target,
  Trash2,
  TriangleAlert,
  User,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppDrawer } from '../components/AppDrawer';
import { AppNavbar } from '../components/AppNavbar';
import type { AppStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { useTransactionsStore } from '../store/transactionsStore';
import { useUiStore } from '../store/uiStore';
import type { ThemeMode } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
import {
  CURRENCY_META,
  SUPPORTED_CURRENCIES,
} from '../utils/currency';
import { formatBalance } from '../utils/money';

type Props = NativeStackScreenProps<AppStackParamList, 'Settings'>;

const THEME_OPTIONS: {
  value: ThemeMode;
  label: string;
  Icon: typeof Sun;
}[] = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
];

export function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, themeMode, setThemeMode } = useAppTheme();
  const user = useAuthStore(state => state.user);
  const savingsGoal = useUiStore(state => state.savingsGoal);
  const savingsGoalCurrency = useUiStore(state => state.savingsGoalCurrency);
  const displayCurrency = useUiStore(state => state.displayCurrency);
  const setDisplayCurrency = useUiStore(state => state.setDisplayCurrency);
  const multiCurrency = useUiStore(state => state.multiCurrency);
  const setMultiCurrency = useUiStore(state => state.setMultiCurrency);
  const setSavingsGoal = useUiStore(state => state.setSavingsGoal);
  const showSnackbar = useUiStore(state => state.showSnackbar);
  const transactions = useTransactionsStore(state => state.transactions);
  const clearTransactions = useTransactionsStore(
    state => state.clearTransactions,
  );
  const [goalText, setGoalText] = useState(String(savingsGoal));
  const [clearing, setClearing] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  function saveGoal() {
    const parsed = Number(goalText);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setGoalError('Enter a positive amount');
      return;
    }
    setGoalError(null);
    setSavingsGoal(parsed, displayCurrency);
  }

  async function onClearTransactions() {
    setClearing(true);
    try {
      await clearTransactions();
      showSnackbar({
        message: 'Transactions cleared',
        durationMs: 2500,
      });
    } catch {
      showSnackbar({
        message: 'Could not clear transactions',
        durationMs: 3000,
      });
    } finally {
      setClearing(false);
    }
  }

  function confirmClearTransactions() {
    if (transactions.length === 0 || clearing) {
      return;
    }
    Alert.alert(
      'Clear all transactions?',
      'This permanently deletes every transaction. Your savings goal is kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            onClearTransactions().catch(() => undefined);
          },
        },
      ],
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <AppNavbar title="Settings" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled">
      <Text style={[styles.sectionLabel, { color: colors.muted }]}>
        Account
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}>
        <View style={styles.profileRow}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.accent + '22' },
            ]}>
            <User color={colors.accent} size={22} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {user?.name ?? 'User'}
            </Text>
            <View style={styles.emailRow}>
              <Mail color={colors.muted} size={14} />
              <Text style={[styles.profileEmail, { color: colors.muted }]}>
                {user?.email}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.muted }]}>
        Appearance
      </Text>
      <View
        style={[
          styles.card,
          styles.themeRow,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}>
        {THEME_OPTIONS.map(option => {
          const selected = themeMode === option.value;
          const iconColor = selected ? '#fff' : colors.text;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setThemeMode(option.value)}
              style={[
                styles.themeOption,
                {
                  backgroundColor: selected ? colors.accent : 'transparent',
                  borderColor: colors.border,
                },
              ]}>
              <option.Icon color={iconColor} size={16} />
              <Text style={[styles.themeOptionText, { color: iconColor }]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.muted }]}>
        Currency
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}>
        <View
          style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
          <View style={styles.toggleCopy}>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>
              Multi-currency
            </Text>
            <Text style={[styles.hint, { color: colors.muted }]}>
              Record and convert amounts in more than one currency
            </Text>
          </View>
          <Switch
            accessibilityLabel="Multi-currency"
            value={multiCurrency}
            onValueChange={setMultiCurrency}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#fff"
            ios_backgroundColor={colors.border}
          />
        </View>
        <View style={styles.hintRow}>
          <Banknote color={colors.muted} size={16} />
          <Text style={[styles.hint, { color: colors.muted }]}>
            {CURRENCY_META[displayCurrency].name}
            {multiCurrency
              ? '. Totals convert at approximate rates.'
              : '. Used for all new transactions.'}
          </Text>
        </View>
        <View style={styles.currencyChips}>
          {SUPPORTED_CURRENCIES.map(code => {
            const selected = displayCurrency === code;
            return (
              <Pressable
                key={code}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setDisplayCurrency(code)}
                style={[
                  styles.currencyChip,
                  {
                    backgroundColor: selected ? colors.accent : 'transparent',
                    borderColor: colors.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.currencyChipText,
                    { color: selected ? '#fff' : colors.text },
                  ]}>
                  {code}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.muted }]}>
        Savings goal
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}>
        <View style={styles.hintRow}>
          <Target color={colors.muted} size={16} />
          <Text style={[styles.hint, { color: colors.muted }]}>
            Current goal:{' '}
            {formatBalance(savingsGoal, savingsGoalCurrency)}
          </Text>
        </View>
        <TextInput
          value={goalText}
          onChangeText={setGoalText}
          keyboardType="decimal-pad"
          placeholder={`e.g. 5000 ${displayCurrency}`}
          placeholderTextColor={colors.muted}
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.inputBg,
            },
          ]}
        />
        {goalError ? (
          <View style={styles.errorRow}>
            <AlertCircle color={colors.error} size={14} />
            <Text style={[styles.error, { color: colors.error }]}>
              {goalError}
            </Text>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={saveGoal}
          style={[styles.saveGoal, { backgroundColor: colors.accent }]}>
          <Check color="#fff" size={16} strokeWidth={2.5} />
          <Text style={styles.saveGoalText}>Save goal</Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.error }]}>
        Danger zone
      </Text>
      <View
        style={[
          styles.dangerCard,
          { backgroundColor: colors.card, borderColor: colors.error },
        ]}>
        <View style={styles.dangerHeader}>
          <View
            style={[
              styles.dangerIcon,
              { backgroundColor: colors.error + '18' },
            ]}>
            <TriangleAlert color={colors.error} size={18} />
          </View>
          <View style={styles.toggleCopy}>
            <Text style={[styles.toggleTitle, { color: colors.error }]}>
              Clear transactions
            </Text>
            <Text style={[styles.hint, { color: colors.muted }]}>
              Permanently delete every transaction. This cannot be undone.
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear all transactions"
          disabled={clearing || transactions.length === 0}
          onPress={confirmClearTransactions}
          style={({ pressed }) => [
            styles.dangerButton,
            {
              backgroundColor: colors.error,
              opacity:
                clearing || transactions.length === 0 || pressed ? 0.55 : 1,
            },
          ]}>
          {clearing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.buttonContent}>
              <Trash2 color="#fff" size={18} />
              <Text style={styles.dangerButtonText}>
                {transactions.length === 0
                  ? 'No transactions to clear'
                  : `Clear ${transactions.length} transaction${
                      transactions.length === 1 ? '' : 's'
                    }`}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </ScrollView>
      <AppDrawer navigation={navigation} current="Settings" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 12,
    marginBottom: 6,
  },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCopy: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileEmail: {
    fontSize: 14,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  themeOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 8,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleCopy: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  currencyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currencyChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  currencyChipText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hint: {
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  error: {
    fontSize: 13,
    flex: 1,
  },
  saveGoal: {
    marginTop: 4,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  saveGoalText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  dangerCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dangerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
