import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MenuButton } from './MenuButton';
import { useAppTheme } from '../theme/useAppTheme';

type Props = {
  title: string;
};

export function AppNavbar({ title }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: insets.top + 8,
          backgroundColor: colors.bg,
        },
      ]}>
      <MenuButton />
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
  spacer: {
    width: 40,
  },
});
