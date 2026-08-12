import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Check,
  StickyNote,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppStackParamList } from '../navigation/types';
import { useTransactionsStore } from '../store/transactionsStore';
import { useAppTheme } from '../theme/useAppTheme';
import {
  TRANSACTION_CATEGORIES,
  type TransactionCategory,
} from '../types/api';
import { CATEGORY_ICONS } from '../utils/categoryIcons';

type Props = NativeStackScreenProps<AppStackParamList, 'AddTransaction'>;

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AddTransactionScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const addTransaction = useTransactionsStore(state => state.addTransaction);

  const [amountText, setAmountText] = useState('');
  const [isExpense, setIsExpense] = useState(true);
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayIsoDate());
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(
    () =>
      isExpense
        ? TRANSACTION_CATEGORIES.filter(item => item !== 'income')
        : (['income'] as TransactionCategory[]),
    [isExpense],
  );

  function onSave() {
    setError(null);
    const parsed = Number(amountText);
    if (!Number.isFinite(parsed) || parsed === 0) {
      setError('Enter a non-zero amount');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Date must be YYYY-MM-DD');
      return;
    }

    const amount = isExpense ? -Math.abs(parsed) : Math.abs(parsed);
    addTransaction({
      amount,
      category: isExpense ? category : 'income',
      note,
      date,
    });
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            onPress={() => navigation.goBack()}
            style={styles.iconHit}
            hitSlop={8}>
            <X color={colors.muted} size={22} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>
            Add transaction
          </Text>
          <View style={styles.iconHit} />
        </View>

        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => {
              setIsExpense(true);
              if (category === 'income') {
                setCategory('food');
              }
            }}
            style={[
              styles.toggle,
              {
                backgroundColor: isExpense ? colors.accent : colors.card,
                borderColor: colors.border,
              },
            ]}>
            <ArrowDownLeft
              color={isExpense ? '#fff' : colors.text}
              size={16}
            />
            <Text
              style={[
                styles.toggleText,
                { color: isExpense ? '#fff' : colors.text },
              ]}>
              Expense
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setIsExpense(false);
              setCategory('income');
            }}
            style={[
              styles.toggle,
              {
                backgroundColor: !isExpense ? colors.accent : colors.card,
                borderColor: colors.border,
              },
            ]}>
            <ArrowUpRight
              color={!isExpense ? '#fff' : colors.text}
              size={16}
            />
            <Text
              style={[
                styles.toggleText,
                { color: !isExpense ? '#fff' : colors.text },
              ]}>
              Income
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.label, { color: colors.muted }]}>Amount</Text>
        <TextInput
          value={amountText}
          onChangeText={setAmountText}
          keyboardType="decimal-pad"
          placeholder="0.00"
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

        <Text style={[styles.label, { color: colors.muted }]}>Category</Text>
        <View style={styles.chips}>
          {categories.map(item => {
            const selected = category === item;
            const CategoryIcon = CATEGORY_ICONS[item];
            const iconColor = selected ? '#fff' : colors.text;
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.accent : colors.card,
                    borderColor: colors.border,
                  },
                ]}>
                <CategoryIcon color={iconColor} size={14} />
                <Text style={[styles.chipText, { color: iconColor }]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.muted }]}>Note</Text>
        <View
          style={[
            styles.inputRow,
            {
              borderColor: colors.border,
              backgroundColor: colors.inputBg,
            },
          ]}>
          <StickyNote color={colors.muted} size={18} />
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Optional"
            placeholderTextColor={colors.muted}
            style={[styles.inputFlex, { color: colors.text }]}
          />
        </View>

        <Text style={[styles.label, { color: colors.muted }]}>Date</Text>
        <View
          style={[
            styles.inputRow,
            {
              borderColor: colors.border,
              backgroundColor: colors.inputBg,
            },
          ]}>
          <Calendar color={colors.muted} size={18} />
          <TextInput
            value={date}
            onChangeText={setDate}
            autoCapitalize="none"
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            style={[styles.inputFlex, { color: colors.text }]}
          />
        </View>

        {error ? (
          <View style={styles.errorRow}>
            <AlertCircle color={colors.error} size={16} />
            <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={onSave}
          style={[styles.save, { backgroundColor: colors.accent }]}>
          <Check color="#fff" size={18} strokeWidth={2.5} />
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconHit: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  toggle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  toggleText: {
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
  },
  inputRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputFlex: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === 'ios' ? 0 : 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  error: {
    flex: 1,
  },
  save: {
    marginTop: 16,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
