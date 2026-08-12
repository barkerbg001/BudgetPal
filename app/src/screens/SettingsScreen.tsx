import { useState } from 'react';
import {
  ActivityIndicator,
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
  Check,
  ChevronLeft,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Sun,
  Target,
  User,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import type { ThemeMode } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
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
  const logout = useAuthStore(state => state.logout);
  const savingsGoal = useUiStore(state => state.savingsGoal);
  const setSavingsGoal = useUiStore(state => state.setSavingsGoal);
  const [goalText, setGoalText] = useState(String(savingsGoal));
  const [loggingOut, setLoggingOut] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  function saveGoal() {
    const parsed = Number(goalText);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setGoalError('Enter a positive amount in rands');
      return;
    }
    setGoalError(null);
    setSavingsGoal(parsed);
  }

  async function onLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.bg }]}
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
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={styles.iconHit}
          hitSlop={8}>
          <ChevronLeft color={colors.muted} size={24} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={styles.iconHit} />
      </View>

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
            Current goal: {formatBalance(savingsGoal)}
          </Text>
        </View>
        <TextInput
          value={goalText}
          onChangeText={setGoalText}
          keyboardType="decimal-pad"
          placeholder="e.g. 5000"
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

      <Pressable
        accessibilityRole="button"
        disabled={loggingOut}
        onPress={() => {
          onLogout().catch(() => undefined);
        }}
        style={({ pressed }) => [
          styles.logoutButton,
          {
            borderColor: colors.error,
            opacity: loggingOut || pressed ? 0.7 : 1,
          },
        ]}>
        {loggingOut ? (
          <ActivityIndicator color={colors.error} />
        ) : (
          <View style={styles.logoutContent}>
            <LogOut color={colors.error} size={18} />
            <Text style={[styles.logoutText, { color: colors.error }]}>
              Log out
            </Text>
          </View>
        )}
      </Pressable>
    </ScrollView>
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
    marginBottom: 16,
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
  logoutButton: {
    marginTop: 28,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
