import { Platform, type ViewStyle } from 'react-native';

/**
 * Surface lift for cards.
 * iOS gets real soft shadows; Android elevation is unreliable (esp. dark mode),
 * so Android uses a clearer outline (+ light elevation in light mode).
 */
export function getCardShadow(isDark: boolean): ViewStyle {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: isDark ? 8 : 6 },
      shadowOpacity: isDark ? 0.5 : 0.14,
      shadowRadius: isDark ? 18 : 14,
    };
  }

  // Android: outline carries depth; light elevation helps a bit in light mode.
  return {
    elevation: isDark ? 0 : 3,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(11, 31, 68, 0.12)',
  };
}
