import { useColorScheme } from 'react-native';

import { useUiStore } from '../store/uiStore';
import { isDarkTheme, resolveThemeColors } from '../theme/colors';

export function useAppTheme() {
  const systemDark = useColorScheme() === 'dark';
  const themeMode = useUiStore(state => state.themeMode);
  const setThemeMode = useUiStore(state => state.setThemeMode);
  const colors = resolveThemeColors(themeMode, systemDark);
  const isDark = isDarkTheme(themeMode, systemDark);

  return { colors, isDark, themeMode, setThemeMode };
}
