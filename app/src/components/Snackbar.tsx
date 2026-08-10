import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Undo2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUiStore } from '../store/uiStore';
import type { ThemeColors } from '../theme/colors';

type Props = {
  colors: ThemeColors;
};

export function Snackbar({ colors }: Props) {
  const insets = useSafeAreaInsets();
  const snackbar = useUiStore(state => state.snackbar);
  const hideSnackbar = useUiStore(state => state.hideSnackbar);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!snackbar) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(opacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();

    timerRef.current = setTimeout(() => {
      const dismiss = snackbar.onDismiss;
      hideSnackbar();
      dismiss?.();
    }, snackbar.durationMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [snackbar, hideSnackbar, opacity]);

  if (!snackbar) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          opacity,
          bottom: Math.max(insets.bottom, 12) + 8,
        },
      ]}>
      <View
        style={[
          styles.bar,
          { backgroundColor: colors.text, borderColor: colors.border },
        ]}>
        <Text style={[styles.message, { color: colors.bg }]} numberOfLines={2}>
          {snackbar.message}
        </Text>
        {snackbar.actionLabel && snackbar.onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
              }
              snackbar.onAction?.();
            }}
            hitSlop={8}
            style={styles.actionRow}>
            <Undo2 color={colors.accent} size={14} />
            <Text style={[styles.action, { color: colors.accent }]}>
              {snackbar.actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
  },
  bar: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  action: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
