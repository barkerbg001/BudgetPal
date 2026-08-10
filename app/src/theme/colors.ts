export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeColors = {
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  error: string;
  inputBg: string;
  success: string;
};

/** Red / blue / white palette (income = blue, expense = red). */
const light: ThemeColors = {
  bg: '#f5f7fb',
  card: '#ffffff',
  text: '#0b1f44',
  muted: '#5a6b8a',
  border: '#d4dce8',
  accent: '#1d4ed8',
  error: '#c1121f',
  inputBg: '#ffffff',
  success: '#1d4ed8',
};

const dark: ThemeColors = {
  bg: '#0a1628',
  card: '#13233d',
  text: '#ffffff',
  muted: '#9bb0d0',
  border: '#243552',
  accent: '#3b82f6',
  error: '#ef4444',
  inputBg: '#0f1c30',
  success: '#3b82f6',
};

export function resolveThemeColors(
  mode: ThemeMode,
  systemDark: boolean,
): ThemeColors {
  const darkMode = mode === 'dark' || (mode === 'system' && systemDark);
  return darkMode ? dark : light;
}

export function isDarkTheme(mode: ThemeMode, systemDark: boolean): boolean {
  return mode === 'dark' || (mode === 'system' && systemDark);
}
