import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  PanResponder,
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
import { useUiStore } from '../store/uiStore';
import { useAppTheme } from '../theme/useAppTheme';
import {
  TRANSACTION_CATEGORIES,
  type TransactionCategory,
} from '../types/api';
import { CATEGORY_ICONS } from '../utils/categoryIcons';
import { SUPPORTED_CURRENCIES, type Currency } from '../utils/currency';

type Props = NativeStackScreenProps<AppStackParamList, 'AddTransaction'>;

const SCREEN_HEIGHT = Dimensions.get('window').height;

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function FadeUp({
  delay = 0,
  children,
}: {
  delay?: number;
  children: ReactNode;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 340,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 340,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export function AddTransactionScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const addTransaction = useTransactionsStore(state => state.addTransaction);
  const displayCurrency = useUiStore(state => state.displayCurrency);
  const multiCurrency = useUiStore(state => state.multiCurrency);

  const [amountText, setAmountText] = useState('');
  const [currency, setCurrency] = useState<Currency>(displayCurrency);
  const [isExpense, setIsExpense] = useState(true);
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayIsoDate());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!multiCurrency) {
      setCurrency(displayCurrency);
    }
  }, [displayCurrency, multiCurrency]);

  const backdrop = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const closing = useRef(false);
  const translateY = useMemo(
    () => Animated.add(sheetY, dragY),
    [sheetY, dragY],
  );

  const close = useCallback(() => {
    if (closing.current) {
      return;
    }
    closing.current = true;
    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheetY, {
        toValue: SCREEN_HEIGHT,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        navigation.goBack();
      }
    });
  }, [backdrop, navigation, sheetY]);

  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(sheetY, {
        toValue: 0,
        damping: 22,
        stiffness: 210,
        mass: 0.86,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdrop, sheetY]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closeRef.current();
      return true;
    });
    return () => sub.remove();
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          if (gesture.dy > 0) {
            dragY.setValue(gesture.dy);
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 110 || gesture.vy > 1.15) {
            closeRef.current();
            return;
          }
          Animated.spring(dragY, {
            toValue: 0,
            damping: 20,
            stiffness: 240,
            useNativeDriver: true,
          }).start();
        },
      }),
    [dragY],
  );

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
      currency: multiCurrency ? currency : displayCurrency,
      category: isExpense ? category : 'income',
      note,
      date,
    });
    close();
  }

  return (
    <View style={styles.overlay}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss add transaction"
        onPress={close}
        style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdrop.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.45],
              }),
            },
          ]}
        />
      </Pressable>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
        style={styles.sheetWrap}>
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.bg,
              borderColor: colors.border,
              maxHeight: SCREEN_HEIGHT * 0.92,
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [{ translateY }],
            },
          ]}>
          <View {...panResponder.panHandlers}>
            <View style={styles.handleHit}>
              <View
                style={[styles.handle, { backgroundColor: colors.muted }]}
              />
            </View>
            <View style={styles.topRow}>
              <View style={styles.iconHit} />
              <Text style={[styles.title, { color: colors.text }]}>
                Add transaction
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                onPress={close}
                style={styles.iconHit}
                hitSlop={8}>
                <X color={colors.muted} size={22} />
              </Pressable>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <FadeUp delay={70}>
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
                      backgroundColor: !isExpense
                        ? colors.accent
                        : colors.card,
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
            </FadeUp>

            <FadeUp delay={130}>
              <Text style={[styles.label, { color: colors.muted }]}>
                Amount
              </Text>
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

              {multiCurrency ? (
                <>
                  <Text style={[styles.label, { color: colors.muted }]}>
                    Currency
                  </Text>
                  <View style={styles.chips}>
                    {SUPPORTED_CURRENCIES.map(code => {
                      const selected = currency === code;
                      return (
                        <Pressable
                          key={code}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          onPress={() => setCurrency(code)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: selected
                                ? colors.accent
                                : colors.card,
                              borderColor: colors.border,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              styles.currencyChipText,
                              { color: selected ? '#fff' : colors.text },
                            ]}>
                            {code}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              ) : null}
            </FadeUp>

            <FadeUp delay={190}>
              <Text style={[styles.label, { color: colors.muted }]}>
                Category
              </Text>
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
                          backgroundColor: selected
                            ? colors.accent
                            : colors.card,
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
            </FadeUp>

            <FadeUp delay={250}>
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
            </FadeUp>

            {error ? (
              <View style={styles.errorRow}>
                <AlertCircle color={colors.error} size={16} />
                <Text style={[styles.error, { color: colors.error }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            <FadeUp delay={310}>
              <Pressable
                accessibilityRole="button"
                onPress={onSave}
                style={[styles.save, { backgroundColor: colors.accent }]}>
                <Check color="#fff" size={18} strokeWidth={2.5} />
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </FadeUp>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  sheetWrap: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    elevation: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  handleHit: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.45,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 4,
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
  currencyChipText: {
    textTransform: 'none',
    letterSpacing: 0.3,
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
