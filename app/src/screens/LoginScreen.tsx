import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AlertCircle, Lock, LogIn, Mail, Wallet } from 'lucide-react-native';

import { ApiError } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useAppTheme } from '../theme/useAppTheme';

export function LoginScreen() {
  const login = useAuthStore(state => state.login);
  const { colors } = useAppTheme();
  const [email, setEmail] = useState('demo@budgetpal.app');
  const [password, setPassword] = useState('password123');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Unable to sign in. Check the API is running.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}>
        <View style={styles.brandRow}>
          <View
            style={[
              styles.brandIcon,
              { backgroundColor: colors.accent + '22' },
            ]}>
            <Wallet color={colors.accent} size={22} strokeWidth={2} />
          </View>
          <Text style={[styles.brand, { color: colors.text }]}>BudgetPal</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Sign in to track your money
        </Text>

        <Text style={[styles.label, { color: colors.muted }]}>Email</Text>
        <View
          style={[
            styles.inputRow,
            {
              borderColor: colors.border,
              backgroundColor: colors.inputBg,
            },
          ]}>
          <Mail color={colors.muted} size={18} />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            value={email}
            onChangeText={setEmail}
            editable={!submitting}
            style={[styles.input, { color: colors.text }]}
          />
        </View>

        <Text style={[styles.label, { color: colors.muted }]}>Password</Text>
        <View
          style={[
            styles.inputRow,
            {
              borderColor: colors.border,
              backgroundColor: colors.inputBg,
            },
          ]}>
          <Lock color={colors.muted} size={18} />
          <TextInput
            secureTextEntry
            textContentType="password"
            value={password}
            onChangeText={setPassword}
            editable={!submitting}
            style={[styles.input, { color: colors.text }]}
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
          disabled={submitting}
          onPress={() => {
            onSubmit().catch(() => undefined);
          }}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.accent,
              opacity: submitting || pressed ? 0.75 : 1,
            },
          ]}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.buttonContent}>
              <LogIn color="#fff" size={18} />
              <Text style={styles.buttonText}>Sign in</Text>
            </View>
          )}
        </Pressable>

        <Text style={[styles.hint, { color: colors.muted }]}>
          Demo: demo@budgetpal.app / password123
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    gap: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
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
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === 'ios' ? 0 : 8,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  error: {
    flex: 1,
    fontSize: 14,
  },
  button: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
});
